use crate::database::provider::{CertificateRepository, SignedEntityStorer};
use anyhow::{anyhow, Context};
use mithril_common::{entities::Certificate, StdResult};
use slog_scope::{debug, info, trace};
use std::{collections::HashMap, sync::Arc};

/// Tools to recompute all the certificates hashes in a aggregator database.
pub struct CertificatesHashMigrator {
    certificate_repository: CertificateRepository,
    signed_entity_storer: Arc<dyn SignedEntityStorer>,
}

impl CertificatesHashMigrator {
    /// [CertificatesHashMigrator] factory
    pub fn new(
        certificate_repository: CertificateRepository,
        signed_entity_storer: Arc<dyn SignedEntityStorer>,
    ) -> Self {
        Self {
            certificate_repository,
            signed_entity_storer,
        }
    }

    /// Recompute all the certificates hashes the database.
    pub async fn migrate(&self) -> StdResult<()> {
        info!("🔧 Certificate Hash Migrator: starting");
        let (old_certificates, old_and_new_hashes) =
            self.create_certificates_with_updated_hash().await?;

        self.update_signed_entities_certificate_hash(old_and_new_hashes)
            .await?;

        self.cleanup(old_certificates).await?;

        info!("🔧 Certificate Hash Migrator: all certificates have been migrated successfully");
        Ok(())
    }

    /// Load all certificates from the database, compute their new hash, returns a list with
    /// all old certificates joined with their new hash string.
    async fn create_certificates_with_updated_hash(
        &self,
    ) -> StdResult<(Vec<Certificate>, HashMap<String, String>)> {
        info!("🔧 Certificate Hash Migrator: recomputing all certificates hash");
        let old_certificates = self
            .certificate_repository
            // arbitrary high value to get all existing certificates
            .get_latest_certificates(usize::MAX)
            .await?;
        let mut certificates_to_remove = vec![];

        let mut migrated_certificates = vec![];
        let mut old_and_new_hashes: HashMap<String, String> = HashMap::new();

        // 1 - Recompute all certificates hashes
        // Note: get_latest_certificates retrieve certificates from the earliest to the older,
        // in order to have a strong guarantee that when inserting a certificate in the db its
        // previous_hash exist we have to work in the reverse order.
        debug!("🔧 Certificate Hash Migrator: computing new hash for all certificates");
        for mut certificate in old_certificates.into_iter().rev() {
            let old_previous_hash = if certificate.is_genesis() {
                certificate.previous_hash.clone()
            } else {
                let old_previous_hash = certificate.previous_hash.clone();
                certificate.previous_hash = old_and_new_hashes
                    .get(&certificate.previous_hash)
                    .ok_or(anyhow!(
                        "Could not migrate certificate previous_hash: The hash '{}' doesn't exist in the certificate table",
                        &certificate.previous_hash
                    ))?.to_owned();

                old_previous_hash
            };

            if let Some(new_hash) = {
                let computed_hash = certificate.compute_hash();
                // return none if the hash did not change
                (computed_hash != certificate.hash).then_some(computed_hash)
            } {
                old_and_new_hashes.insert(certificate.hash.clone(), new_hash.clone());

                if certificate.is_genesis() {
                    trace!(
                        "🔧 Certificate Hash Migrator: new hash computed for genesis certificate {:?}",
                        certificate.beacon;
                        "old_hash" => &certificate.hash,
                        "new_hash" => &new_hash,
                    );
                } else {
                    trace!(
                        "🔧 Certificate Hash Migrator: new hash computed for certificate {:?}",
                        certificate.beacon;
                        "old_hash" => &certificate.hash,
                        "new_hash" => &new_hash,
                        "old_previous_hash" => &old_previous_hash,
                        "new_previous_hash" => &certificate.previous_hash
                    );
                }

                certificates_to_remove.push(certificate.clone());
                certificate.hash = new_hash;
                migrated_certificates.push(certificate);
            } else {
                old_and_new_hashes.insert(certificate.hash.clone(), certificate.hash);
            }
        }

        // 2 - Certificates migrated, we can insert them in the db
        // (we do this by chunks in order to avoid reaching the limit of 32766 variables in a single query)
        debug!("🔧 Certificate Hash Migrator: inserting migrated certificates in the database");
        let migrated_certificates_chunk_size = 250;
        for migrated_certificates_chunk in
            migrated_certificates.chunks(migrated_certificates_chunk_size)
        {
            self.certificate_repository
            .create_many_certificates(migrated_certificates_chunk.to_owned())
            .await
            .with_context(|| {
                "Certificates Hash Migrator can not insert migrated certificates in the database"
            })?;
        }

        Ok((certificates_to_remove, old_and_new_hashes))
    }

    async fn update_signed_entities_certificate_hash(
        &self,
        old_and_new_certificate_hashes: HashMap<String, String>,
    ) -> StdResult<()> {
        info!("🔧 Certificate Hash Migrator: updating signed entities certificate ids");
        let old_hashes: Vec<&str> = old_and_new_certificate_hashes
            .keys()
            .map(|k| k.as_str())
            .collect();
        let mut records_to_migrate = self
            .signed_entity_storer
            .get_signed_entities_by_certificates_ids(&old_hashes)
            .await
            .with_context(||
                format!(
                    "Certificates Hash Migrator can not get signed entities by certificates ids with hashes: '{:?}'", old_hashes
                )
            )?;

        debug!("🔧 Certificate Hash Migrator: updating signed entities certificate_ids to new computed hash");
        for signed_entity_record in records_to_migrate.iter_mut() {
            let new_certificate_hash =
                old_and_new_certificate_hashes
                    .get(&signed_entity_record.certificate_id)
                    .ok_or( anyhow!(
                        "Migration Error: no migrated hash found for signed entity with certificate id: {}",
                        signed_entity_record.certificate_id
                    ))?
                    .to_owned();

            trace!(
                "🔧 Certificate Hash Migrator: migrating signed entity {} certificate hash computed for certificate",
                signed_entity_record.signed_entity_id;
                "old_certificate_hash" => &signed_entity_record.certificate_id,
                "new_certificate_hash" => &new_certificate_hash
            );
            signed_entity_record.certificate_id = new_certificate_hash;
        }

        debug!("🔧 Certificate Hash Migrator: updating migrated signed entities in the database");
        self.signed_entity_storer
            .update_signed_entities(records_to_migrate)
            .await
            .with_context(|| "Certificates Hash Migrator can not update signed entities")?;

        Ok(())
    }

    async fn cleanup(&self, old_certificates: Vec<Certificate>) -> StdResult<()> {
        info!("🔧 Certificate Hash Migrator: deleting old certificates in the database");
        self.certificate_repository
            .delete_certificates(&old_certificates.iter().collect::<Vec<_>>())
            .await
            .with_context(|| {
                "Certificates Hash Migrator can not delete old certificates in the database"
            })?;

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use crate::database::provider::{
        apply_all_migrations_to_db, disable_foreign_key_support, CertificateRecord,
        CertificateRepository, SignedEntityRecord, SignedEntityStoreAdapter, SignedEntityStorer,
    };
    use anyhow::Context;
    use mithril_common::{
        entities::{
            Beacon, Certificate, Epoch, ImmutableFileNumber,
            SignedEntityType::{
                CardanoImmutableFilesFull, CardanoStakeDistribution, MithrilStakeDistribution,
            },
            SignedEntityTypeDiscriminants,
        },
        StdResult,
    };
    use sqlite::{Connection, ConnectionWithFullMutex};
    use std::{collections::HashMap, sync::Arc};

    use super::CertificatesHashMigrator;

    fn connection_with_foreign_key_support() -> ConnectionWithFullMutex {
        let connection = Connection::open_with_full_mutex(":memory:").unwrap();
        apply_all_migrations_to_db(&connection).unwrap();

        connection
    }

    fn connection_without_foreign_key_support() -> ConnectionWithFullMutex {
        let connection = connection_with_foreign_key_support();
        disable_foreign_key_support(&connection).unwrap();

        connection
    }

    pub fn dummy_genesis(
        certificate_hash: &str,
        epoch: u64,
        immutable_file_number: ImmutableFileNumber,
    ) -> Certificate {
        let certificate = CertificateRecord::dummy_genesis(
            certificate_hash,
            Beacon::new("testnet".to_string(), epoch, immutable_file_number),
        );

        certificate.into()
    }

    pub fn dummy_certificate(
        certificate_hash: &str,
        previous_hash: &str,
        epoch: u64,
        immutable_file_number: ImmutableFileNumber,
    ) -> Certificate {
        let certificate = CertificateRecord::dummy(
            certificate_hash,
            previous_hash,
            Beacon::new("testnet".to_string(), epoch, immutable_file_number),
        );

        certificate.into()
    }

    async fn fill_certificates_and_signed_entities_in_db(
        connection: Arc<ConnectionWithFullMutex>,
        certificates_and_signed_entity: &[(Certificate, Option<SignedEntityTypeDiscriminants>)],
    ) -> StdResult<Vec<(Certificate, Option<SignedEntityRecord>)>> {
        let certificate_repository = CertificateRepository::new(connection.clone());
        let signed_entity_store = SignedEntityStoreAdapter::new(connection.clone());
        let mut result = vec![];

        for (certificate, discriminant_maybe) in certificates_and_signed_entity {
            certificate_repository
                .create_certificate(certificate.clone())
                .await
                .with_context(|| {
                    format!(
                        "Certificates Hash Migrator can not create certificate with hash: '{}'",
                        certificate.hash
                    )
                })?;

            let signed_entity_maybe = match discriminant_maybe {
                None => None,
                Some(discriminant) => {
                    let signed_entity_type = match *discriminant {
                        SignedEntityTypeDiscriminants::MithrilStakeDistribution => {
                            MithrilStakeDistribution(certificate.beacon.epoch)
                        }
                        SignedEntityTypeDiscriminants::CardanoStakeDistribution => {
                            CardanoStakeDistribution(certificate.beacon.epoch)
                        }
                        SignedEntityTypeDiscriminants::CardanoImmutableFilesFull => {
                            CardanoImmutableFilesFull(certificate.beacon.clone())
                        }
                    };
                    // Note: we don't need to have real artifacts for those tests
                    let artifact = format!("{signed_entity_type:?}");

                    let signed_entity_record = SignedEntityRecord {
                        signed_entity_id: format!("signed-entity-{}", &certificate.hash),
                        certificate_id: certificate.hash.clone(),
                        signed_entity_type,
                        artifact,
                        created_at: Default::default(),
                    };

                    signed_entity_store
                        .store_signed_entity(&signed_entity_record)
                        .await
                        .with_context(|| {
                            "Certificates Hash Migrator can not store signed entity"
                        })?;

                    Some(signed_entity_record)
                }
            };

            result.push((certificate.clone(), signed_entity_maybe));
        }

        Ok(result)
    }

    fn recompute_hashes(
        certificates_and_signed_entity: Vec<(Certificate, Option<SignedEntityRecord>)>,
    ) -> Vec<(Certificate, Option<SignedEntityRecord>)> {
        let mut old_and_new_hashes: HashMap<String, String> = HashMap::new();
        let mut result = vec![];

        for (mut certificate, signed_entity_maybe) in certificates_and_signed_entity {
            if let Some(hash) = old_and_new_hashes.get(&certificate.previous_hash) {
                certificate.previous_hash = hash.clone();
            }

            let new_hash = certificate.compute_hash();
            old_and_new_hashes.insert(certificate.hash.clone(), new_hash.clone());
            certificate.hash = new_hash;

            let signed_entity_maybe = match signed_entity_maybe {
                None => None,
                Some(mut signed_entity) => {
                    signed_entity.certificate_id = certificate.hash.clone();
                    Some(signed_entity)
                }
            };

            result.push((certificate, signed_entity_maybe));
        }

        result
    }

    #[test]
    fn recompute_hash_test_tool() {
        let cert_and_signed_entities = vec![
            (dummy_genesis("genesis", 1, 1), None),
            (
                dummy_certificate("cert1", "genesis", 1, 2),
                Some(SignedEntityRecord {
                    signed_entity_id: "signed_entity_id".to_string(),
                    signed_entity_type: MithrilStakeDistribution(Epoch(1)),
                    certificate_id: "cert1".to_string(),
                    artifact: "".to_string(),
                    created_at: Default::default(),
                }),
            ),
            (
                dummy_certificate("cert2", "cert1", 2, 3),
                Some(SignedEntityRecord {
                    signed_entity_id: "signed_entity_id".to_string(),
                    signed_entity_type: MithrilStakeDistribution(Epoch(2)),
                    certificate_id: "cert2".to_string(),
                    artifact: "".to_string(),
                    created_at: Default::default(),
                }),
            ),
        ];
        let expected = vec![
            (
                dummy_genesis(
                    "98b44c52ac3c82adcbc5aea27a0c99cbba716048dddaf401b27acded80f1abcd",
                    1,
                    1,
                ),
                None,
            ),
            (
                dummy_certificate(
                    "0b7c12daffe63ca93a9cded424e300361a5234ab8c52b3e7029ff9dfbd8a16bd",
                    "98b44c52ac3c82adcbc5aea27a0c99cbba716048dddaf401b27acded80f1abcd",
                    1,
                    2,
                ),
                Some(SignedEntityRecord {
                    signed_entity_id: "signed_entity_id".to_string(),
                    signed_entity_type: MithrilStakeDistribution(Epoch(1)),
                    certificate_id:
                        "0b7c12daffe63ca93a9cded424e300361a5234ab8c52b3e7029ff9dfbd8a16bd"
                            .to_string(),
                    artifact: "".to_string(),
                    created_at: Default::default(),
                }),
            ),
            (
                dummy_certificate(
                    "0aa74b928d3eade6548b22349435a12e9591f0c34c9ca2b0abfbeeefbb1acb37",
                    "0b7c12daffe63ca93a9cded424e300361a5234ab8c52b3e7029ff9dfbd8a16bd",
                    2,
                    3,
                ),
                Some(SignedEntityRecord {
                    signed_entity_id: "signed_entity_id".to_string(),
                    signed_entity_type: MithrilStakeDistribution(Epoch(2)),
                    certificate_id:
                        "0aa74b928d3eade6548b22349435a12e9591f0c34c9ca2b0abfbeeefbb1acb37"
                            .to_string(),
                    artifact: "".to_string(),
                    created_at: Default::default(),
                }),
            ),
        ];

        assert_eq!(expected, recompute_hashes(cert_and_signed_entities));
    }

    async fn get_certificates_and_signed_entities(
        connection: Arc<ConnectionWithFullMutex>,
    ) -> StdResult<Vec<(Certificate, Option<SignedEntityRecord>)>> {
        let mut result = vec![];
        let certificate_repository = CertificateRepository::new(connection.clone());
        let signed_entity_store = SignedEntityStoreAdapter::new(connection.clone());

        let certificates = certificate_repository
            .get_latest_certificates(usize::MAX)
            .await?;

        for certificate in certificates {
            if certificate.previous_hash.is_empty() {
                result.push((certificate, None));
            } else {
                let record = signed_entity_store
                    .get_signed_entity_by_certificate_id(&certificate.hash)
                    .await
                    .with_context(|| format!("Certificates Hash Migrator can not get signed entity type by certificate id with hash: '{}'", certificate.hash))?;
                result.push((certificate, record));
            }
        }

        Ok(result)
    }

    async fn run_migration_test(
        sqlite_connection: Arc<ConnectionWithFullMutex>,
        certificates_and_signed_entity: Vec<(Certificate, Option<SignedEntityTypeDiscriminants>)>,
    ) {
        // Arrange
        let old_certificates_and_signed_entities = fill_certificates_and_signed_entities_in_db(
            sqlite_connection.clone(),
            &certificates_and_signed_entity,
        )
        .await
        .unwrap();

        // Note: data retrieved from the database will be in the earliest to the oldest order, the
        // reverse of our insert order.
        let expected_certificates_and_signed_entities =
            recompute_hashes(old_certificates_and_signed_entities)
                .into_iter()
                .rev()
                .collect();

        // Act
        let migrator = CertificatesHashMigrator::new(
            CertificateRepository::new(sqlite_connection.clone()),
            Arc::new(SignedEntityStoreAdapter::new(sqlite_connection.clone())),
        );
        migrator
            .migrate()
            .await
            .expect("Certificates hash migration should not fail");

        // Assert
        let migrated_certificates_and_signed_entities =
            get_certificates_and_signed_entities(sqlite_connection)
                .await
                .unwrap();

        let extract_human_readable_data =
            |entries: Vec<(Certificate, Option<SignedEntityRecord>)>| {
                entries
                    .into_iter()
                    .map(|(cert, signed_entity)| {
                        (
                            cert.hash,
                            cert.previous_hash,
                            cert.beacon,
                            signed_entity.map(|s| (s.signed_entity_type, s.certificate_id)),
                        )
                    })
                    .collect::<Vec<_>>()
            };
        assert_eq!(
            extract_human_readable_data(expected_certificates_and_signed_entities),
            extract_human_readable_data(migrated_certificates_and_signed_entities)
        );
    }

    #[tokio::test]
    async fn migrate_genesis_certificate() {
        let connection = Arc::new(connection_without_foreign_key_support());
        run_migration_test(connection, vec![(dummy_genesis("old_hash", 1, 1), None)]).await;
    }

    #[tokio::test]
    async fn migrate_a_chain_of_one_genesis_and_one_mithril_stake_distribution() {
        let connection = Arc::new(connection_without_foreign_key_support());
        run_migration_test(
            connection,
            vec![
                (dummy_genesis("old_genesis", 1, 1), None),
                (
                    dummy_certificate("old_hash_1", "old_genesis", 1, 2),
                    Some(SignedEntityTypeDiscriminants::MithrilStakeDistribution),
                ),
            ],
        )
        .await;
    }

    #[tokio::test]
    async fn migrate_a_chain_with_one_genesis_spanning_multiple_epochs_and_multiple_signed_entities(
    ) {
        let connection = Arc::new(connection_with_foreign_key_support());
        run_migration_test(
            connection,
            vec![
                (dummy_genesis("old_genesis", 1, 1), None),
                (
                    dummy_certificate("old_hash_1", "old_genesis", 1, 2),
                    Some(SignedEntityTypeDiscriminants::MithrilStakeDistribution),
                ),
                (
                    dummy_certificate("old_hash_2", "old_genesis", 1, 3),
                    Some(SignedEntityTypeDiscriminants::CardanoImmutableFilesFull),
                ),
                (
                    dummy_certificate("old_hash_3", "old_hash_2", 2, 3),
                    Some(SignedEntityTypeDiscriminants::MithrilStakeDistribution),
                ),
                (
                    dummy_certificate("old_hash_4", "old_hash_3", 2, 4),
                    Some(SignedEntityTypeDiscriminants::MithrilStakeDistribution),
                ),
                (
                    dummy_certificate("old_hash_5", "old_hash_3", 3, 5),
                    Some(SignedEntityTypeDiscriminants::CardanoImmutableFilesFull),
                ),
                (
                    dummy_certificate("old_hash_6", "old_hash_5", 4, 6),
                    Some(SignedEntityTypeDiscriminants::CardanoImmutableFilesFull),
                ),
            ],
        )
        .await;
    }

    #[tokio::test]
    async fn migrate_a_chain_with_multiple_genesis_spanning_multiple_epochs() {
        let connection = Arc::new(connection_with_foreign_key_support());
        run_migration_test(
            connection,
            vec![
                (dummy_genesis("old_genesis", 1, 1), None),
                (
                    dummy_certificate("old_hash_1", "old_genesis", 1, 2),
                    Some(SignedEntityTypeDiscriminants::MithrilStakeDistribution),
                ),
                (
                    dummy_certificate("old_hash_2", "old_genesis", 1, 3),
                    Some(SignedEntityTypeDiscriminants::CardanoImmutableFilesFull),
                ),
                (dummy_genesis("old_genesis_2", 3, 5), None),
                (
                    dummy_certificate("old_hash_3", "old_genesis_2", 4, 6),
                    Some(SignedEntityTypeDiscriminants::MithrilStakeDistribution),
                ),
                (
                    dummy_certificate("old_hash_4", "old_hash_3", 5, 7),
                    Some(SignedEntityTypeDiscriminants::CardanoImmutableFilesFull),
                ),
                (dummy_genesis("old_genesis_3", 5, 7), None),
                (
                    dummy_certificate("old_hash_5", "old_genesis_3", 5, 8),
                    Some(SignedEntityTypeDiscriminants::MithrilStakeDistribution),
                ),
            ],
        )
        .await;
    }

    #[tokio::test]
    async fn should_not_fail_if_some_hash_dont_change() {
        let connection = Arc::new(connection_without_foreign_key_support());
        let certificate = {
            let mut cert = dummy_genesis("whatever", 1, 2);
            cert.hash = cert.compute_hash();
            cert
        };
        fill_certificates_and_signed_entities_in_db(connection.clone(), &[(certificate, None)])
            .await
            .unwrap();

        let migrator = CertificatesHashMigrator::new(
            CertificateRepository::new(connection.clone()),
            Arc::new(SignedEntityStoreAdapter::new(connection.clone())),
        );
        migrator
            .migrate()
            .await
            .expect("Migration should not fail if a hash doesn't change");
    }
}
