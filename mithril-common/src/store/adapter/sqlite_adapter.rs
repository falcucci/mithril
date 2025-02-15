use anyhow::anyhow;
use async_trait::async_trait;
use serde::{de::DeserializeOwned, Serialize};
use sha2::{Digest, Sha256};
use sqlite::{Connection, State, Statement};
use std::{marker::PhantomData, sync::Arc, thread::sleep, time::Duration};

use super::{AdapterError, StoreAdapter};
use crate::sqlite::SqliteConnection;

type Result<T> = std::result::Result<T, AdapterError>;

const DELAY_MS_ON_LOCK: u32 = 50;
const NB_RETRIES_ON_LOCK: u32 = 3;

/// Store adapter for SQLite3
pub struct SQLiteAdapter<K, V> {
    connection: Arc<SqliteConnection>,
    table: String,
    key: PhantomData<K>,
    value: PhantomData<V>,
}

impl<K, V> SQLiteAdapter<K, V>
where
    K: Serialize,
    V: DeserializeOwned,
{
    /// Create a new SQLiteAdapter instance.
    pub fn new(table_name: &str, connection: Arc<SqliteConnection>) -> Result<Self> {
        {
            Self::check_table_exists(&connection, table_name)?;
        }

        Ok(Self {
            connection,
            table: table_name.to_owned(),
            key: PhantomData,
            value: PhantomData,
        })
    }

    fn check_table_exists(connection: &Connection, table_name: &str) -> Result<()> {
        let sql = format!(
            "select exists(select 1 from sqlite_master where type='table' and name='{table_name}')"
        );
        let mut statement = connection
            .prepare(sql)
            .map_err(|e| AdapterError::OpeningStreamError(e.into()))?;
        statement
            .next()
            .map_err(|e| AdapterError::QueryError(e.into()))?;
        let table_exists = statement
            .read::<i64, _>(0)
            .map_err(|e| AdapterError::ParsingDataError(e.into()))?;

        if table_exists != 1 {
            Self::create_table(connection, table_name)?;
        }

        Ok(())
    }

    fn create_table(connection: &Connection, table_name: &str) -> Result<()> {
        let sql = format!(
            "create table {table_name} (key_hash text primary key, key json not null, value json not null)"
        );
        connection
            .execute(sql)
            .map_err(|e| AdapterError::QueryError(e.into()))?;

        Ok(())
    }

    fn get_hash_from_key(&self, key: &K) -> Result<String> {
        let mut hasher = Sha256::new();
        hasher.update(self.serialize_key(key)?);
        let checksum = hasher.finalize();

        Ok(hex::encode(checksum))
    }

    fn serialize_key(&self, key: &K) -> Result<String> {
        serde_json::to_string(&key).map_err(|e| {
            AdapterError::GeneralError(
                anyhow!(e).context("SQLite adapter: Serde error while serializing store key"),
            )
        })
    }

    // Connection must be locked from the calling function to be able to return
    // a Statement that references this connection.
    fn get_statement_for_key<'conn>(
        &'conn self,
        connection: &'conn Connection,
        sql: String,
        key: &K,
    ) -> Result<Statement> {
        let mut statement = connection
            .prepare(sql)
            .map_err(|e| AdapterError::InitializationError(e.into()))?;
        statement
            .bind((1, self.get_hash_from_key(key)?.as_str()))
            .map_err(|e| AdapterError::InitializationError(e.into()))?;

        Ok(statement)
    }

    fn fetch_maybe_one_value(&self, mut statement: Statement) -> Result<Option<V>> {
        let mut retries = Some(NB_RETRIES_ON_LOCK);
        let mut result = statement.next();

        while result.is_err() {
            // database is probably locked
            // wait and retry strategy
            retries = retries.filter(|v| v > &1).map(|v| v - 1);

            if retries.is_none() {
                return Err(result
                    .map_err(|e| AdapterError::ParsingDataError(e.into()))
                    .unwrap_err());
            }
            sleep(Duration::from_millis(DELAY_MS_ON_LOCK as u64));
            result = statement.next();
        }

        if State::Done == result.unwrap() {
            return Ok(None);
        }
        let maybe_value: Option<V> = statement
            .read::<String, _>(0)
            .map_err(|e| AdapterError::QueryError(e.into()))
            .and_then(|v| {
                serde_json::from_str(&v).map_err(|e| AdapterError::ParsingDataError(e.into()))
            })?;

        Ok(maybe_value)
    }
}

#[async_trait]
impl<K, V> StoreAdapter for SQLiteAdapter<K, V>
where
    K: Send + Sync + Serialize + DeserializeOwned,
    V: Send + Sync + Serialize + DeserializeOwned,
{
    type Key = K;
    type Record = V;

    async fn store_record(&mut self, key: &Self::Key, record: &Self::Record) -> Result<()> {
        let sql = format!(
            "insert into {} (key_hash, key, value) values (?1, ?2, ?3) on conflict (key_hash) do update set value = excluded.value",
            self.table
        );
        let value = serde_json::to_string(record).map_err(|e| {
            AdapterError::GeneralError(
                anyhow!(e)
                    .context("SQLite adapter error: could not serialize value before insertion"),
            )
        })?;
        let mut statement = self
            .connection
            .prepare(sql)
            .map_err(|e| AdapterError::InitializationError(e.into()))?;
        statement
            .bind((1, self.get_hash_from_key(key)?.as_str()))
            .map_err(|e| AdapterError::InitializationError(e.into()))?;
        statement
            .bind((2, self.serialize_key(key)?.as_str()))
            .map_err(|e| AdapterError::InitializationError(e.into()))?;
        statement
            .bind((3, value.as_str()))
            .map_err(|e| AdapterError::InitializationError(e.into()))?;
        let _ = statement
            .next()
            .map_err(|e| AdapterError::ParsingDataError(e.into()))?;

        Ok(())
    }

    async fn get_record(&self, key: &Self::Key) -> Result<Option<Self::Record>> {
        let sql = format!("select value from {} where key_hash = ?1", self.table);
        let statement = self.get_statement_for_key(&self.connection, sql, key)?;

        self.fetch_maybe_one_value(statement)
    }

    async fn record_exists(&self, key: &Self::Key) -> Result<bool> {
        let sql = format!(
            "select exists(select 1 from {} where key_hash = ?1) as record_exists",
            self.table
        );
        let mut statement = self.get_statement_for_key(&self.connection, sql, key)?;
        statement
            .next()
            .map_err(|e| AdapterError::QueryError(e.into()))?;

        statement
            .read::<i64, _>(0)
            .map_err(|e| {
                AdapterError::GeneralError(
                    anyhow!(e).context("There should be a result in this case !"),
                )
            })
            .map(|res| res == 1)
    }

    async fn get_last_n_records(&self, how_many: usize) -> Result<Vec<(Self::Key, Self::Record)>> {
        let sql = format!(
            "select cast(key as text) as key, cast(value as text) as value from {} order by ROWID desc limit ?1",
            self.table
        );
        let mut statement = self
            .connection
            .prepare(sql)
            .map_err(|e| AdapterError::InitializationError(e.into()))?;
        statement
            .bind((1, how_many as i64))
            .map_err(|e| AdapterError::InitializationError(e.into()))?;
        let cursor = statement.iter();

        let results = cursor
            .map(|row| {
                let row = row.unwrap();
                let key: K = serde_json::from_str(row.read::<&str, _>(0)).unwrap();
                let value: V = serde_json::from_str(row.read::<&str, _>(1)).unwrap();

                (key, value)
            })
            .collect();

        Ok(results)
    }

    async fn remove(&mut self, key: &Self::Key) -> Result<Option<Self::Record>> {
        let sql = format!(
            "delete from {} where key_hash = ?1 returning value",
            self.table
        );
        let statement = self.get_statement_for_key(&self.connection, sql, key)?;

        self.fetch_maybe_one_value(statement)
    }

    async fn get_iter(&self) -> Result<Box<dyn Iterator<Item = Self::Record> + '_>> {
        let iterator = SQLiteResultIterator::new(&self.connection, &self.table)?;

        Ok(Box::new(iterator))
    }
}

/// Iterator over SQLite adapter results.
///
/// **important:** For now all the results are loaded in memory, it would be better to
/// consume the cursor but this is a quick solution.
pub struct SQLiteResultIterator<V> {
    results: Vec<V>,
}

impl<V> SQLiteResultIterator<V>
where
    V: DeserializeOwned,
{
    /// Create a new instance of the iterator.
    pub fn new(connection: &Connection, table_name: &str) -> Result<SQLiteResultIterator<V>> {
        let sql = format!("select value from {table_name} order by ROWID asc");

        let cursor = connection
            .prepare(sql)
            .map_err(|e| AdapterError::QueryError(e.into()))?
            .into_iter();

        let results = cursor
            .map(|row| {
                let row = row.unwrap();
                let res: V = serde_json::from_str(row.read::<&str, _>(0)).unwrap();

                res
            })
            .collect();

        Ok(Self { results })
    }
}

impl<V> Iterator for SQLiteResultIterator<V> {
    type Item = V;

    fn next(&mut self) -> Option<Self::Item> {
        self.results.pop()
    }
}

#[cfg(test)]
mod tests {

    use sqlite::Value;
    use std::{
        fs::{create_dir_all, remove_file},
        path::PathBuf,
    };

    use super::*;

    const TABLE_NAME: &str = "key_value_store";

    fn get_file_path(test_name: &str) -> PathBuf {
        let dirpath = std::env::temp_dir()
            .join("mithril_test")
            .join("sqlite_adapter");

        if !dirpath.exists() {
            create_dir_all(&dirpath).unwrap_or_else(|_| {
                panic!(
                    "Expecting to be able to create the test directory '{}'.",
                    dirpath.display()
                )
            });
        }

        dirpath.join(format!("{test_name}.sqlite3"))
    }

    fn init_db(test_name: &str, tablename: Option<&str>) -> SQLiteAdapter<u64, String> {
        let filepath = get_file_path(test_name);

        if filepath.exists() {
            remove_file(&filepath).unwrap_or_else(|_| {
                panic!(
                    "Expecting to be able to remove the database file '{}'.",
                    filepath.display()
                )
            });
        }
        let tablename = tablename.unwrap_or(TABLE_NAME);
        let connection = Connection::open_thread_safe(filepath).unwrap();

        SQLiteAdapter::new(tablename, Arc::new(connection)).unwrap()
    }

    #[tokio::test]
    async fn test_store_record() {
        let test_name = "test_store_record";
        let mut adapter = init_db(test_name, None);
        adapter.store_record(&1, &"one".to_string()).await.unwrap();
        let filepath = get_file_path(test_name);
        let connection = Connection::open(&filepath).unwrap_or_else(|_| {
            panic!(
                "Expecting to be able to open SQLite file '{}'.",
                filepath.display()
            )
        });
        let mut cursor = connection
            .prepare(format!("select key_hash, key, value from {TABLE_NAME}"))
            .unwrap()
            .into_iter();
        let row = cursor
            .try_next()
            .unwrap()
            .expect("Expecting at least one row in the result set.");
        assert_eq!(Value::Integer(1), row[1]);
        assert_eq!(Value::String("\"one\"".to_string()), row[2]);

        // We must drop the cursor else the db will be locked
        drop(cursor);

        adapter.store_record(&1, &"zwei".to_string()).await.unwrap();
        let mut statement = connection
            .prepare(format!("select key_hash, key, value from {TABLE_NAME}"))
            .unwrap();
        let mut cursor = statement.iter();
        let row = cursor
            .try_next()
            .unwrap()
            .expect("Expecting at least one row in the result set.");
        assert_eq!(Value::String("\"zwei\"".to_string()), row[2]);
    }

    #[tokio::test]
    async fn test_get_record() {
        let test_name = "test_get_record";
        let mut adapter = init_db(test_name, None);
        adapter.store_record(&1, &"one".to_string()).await.unwrap();
        adapter.store_record(&2, &"two".to_string()).await.unwrap();
        adapter
            .store_record(&3, &"three".to_string())
            .await
            .unwrap();
        assert_eq!(
            Some("one".to_string()),
            adapter.get_record(&1).await.unwrap()
        );
        assert_eq!(
            Some("three".to_string()),
            adapter.get_record(&3).await.unwrap()
        );
        assert_eq!(
            Some("two".to_string()),
            adapter.get_record(&2).await.unwrap()
        );
        assert_eq!(None, adapter.get_record(&4).await.unwrap());
    }

    #[tokio::test]
    async fn test_get_iterator() {
        let test_name = "test_get_iterator";
        let mut adapter = init_db(test_name, None);
        adapter.store_record(&1, &"one".to_string()).await.unwrap();
        adapter.store_record(&2, &"two".to_string()).await.unwrap();
        adapter
            .store_record(&3, &"three".to_string())
            .await
            .unwrap();
        let collection: Vec<(usize, String)> =
            adapter.get_iter().await.unwrap().enumerate().collect();
        assert_eq!(
            vec![
                (0, "three".to_string()),
                (1, "two".to_string()),
                (2, "one".to_string()),
            ],
            collection
        );
    }

    #[tokio::test]
    async fn test_record_exists() {
        let test_name = "test_record_exists";
        let mut adapter = init_db(test_name, None);
        adapter.store_record(&1, &"one".to_string()).await.unwrap();
        adapter.store_record(&2, &"two".to_string()).await.unwrap();

        assert!(adapter.record_exists(&1).await.unwrap());
        assert!(adapter.record_exists(&2).await.unwrap());
        assert!(!adapter.record_exists(&3).await.unwrap());
    }

    #[tokio::test]
    async fn test_remove() {
        let test_name = "test_remove";
        let mut adapter = init_db(test_name, None);
        adapter.store_record(&1, &"one".to_string()).await.unwrap();
        adapter.store_record(&2, &"two".to_string()).await.unwrap();
        let record = adapter
            .remove(&1)
            .await
            .expect("removing an existing record should not fail")
            .expect("removing an existing record should return the deleted record");
        assert_eq!("one".to_string(), record);
        let empty = adapter
            .remove(&1)
            .await
            .expect("removing a non existing record should not fail");
        assert!(empty.is_none());
    }

    #[tokio::test]
    async fn test_get_last_n_records() {
        let test_name = "test_get_last_n_records";
        let mut adapter = init_db(test_name, None);
        adapter.store_record(&1, &"one".to_string()).await.unwrap();
        adapter.store_record(&2, &"two".to_string()).await.unwrap();
        adapter
            .store_record(&3, &"three".to_string())
            .await
            .unwrap();
        assert_eq!(
            vec![(3_u64, "three".to_string())],
            adapter
                .get_last_n_records(1)
                .await
                .expect("get last N records should not fail")
        );
        assert_eq!(
            vec![
                (3_u64, "three".to_string()),
                (2_u64, "two".to_string()),
                (1_u64, "one".to_string()),
            ],
            adapter
                .get_last_n_records(5)
                .await
                .expect("get last N records should not fail")
        );
    }

    #[tokio::test]
    async fn check_get_last_n_modified_records() {
        let test_name = "check_get_last_n_modified_records";
        let mut adapter = init_db(test_name, None);
        adapter.store_record(&1, &"one".to_string()).await.unwrap();
        adapter.store_record(&2, &"two".to_string()).await.unwrap();
        adapter
            .store_record(&3, &"three".to_string())
            .await
            .unwrap();
        adapter
            .store_record(&1, &"updated record".to_string())
            .await
            .unwrap();
        let values = adapter.get_last_n_records(2).await.unwrap();
        assert_eq!(
            vec![(3, "three".to_string()), (2, "two".to_string())],
            values
        );
    }
}
