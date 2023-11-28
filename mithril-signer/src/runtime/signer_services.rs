use anyhow::{anyhow, Context};
use async_trait::async_trait;
use sqlite::{Connection, ConnectionWithFullMutex};
use std::{fs, sync::Arc};

use mithril_common::{
    api_version::APIVersionProvider,
    chain_observer::{
        CardanoCliChainObserver, CardanoCliRunner, ChainObserver, PallasChainObserver,
    },
    crypto_helper::{OpCert, ProtocolPartyId, SerDeShelleyFileFormat},
    database::{ApplicationNodeType, DatabaseVersionChecker},
    digesters::{
        cache::{ImmutableFileDigestCacheProvider, JsonImmutableFileDigestCacheProviderBuilder},
        ImmutableFileObserver,
    },
    digesters::{CardanoImmutableDigester, ImmutableDigester, ImmutableFileSystemObserver},
    era::{EraChecker, EraReader},
    signable_builder::{
        CardanoImmutableFilesFullSignableBuilder, MithrilSignableBuilderService,
        MithrilStakeDistributionSignableBuilder, SignableBuilderService,
    },
    store::{adapter::SQLiteAdapter, StakeStore},
    BeaconProvider, BeaconProviderImpl, StdResult,
};

use crate::{
    aggregator_client::AggregatorClient, single_signer::SingleSigner, AggregatorHTTPClient,
    Configuration, MithrilSingleSigner, ProtocolInitializerStore, ProtocolInitializerStorer,
};

type StakeStoreService = Arc<StakeStore>;
type CertificateHandlerService = Arc<dyn AggregatorClient>;
type ChainObserverService = Arc<dyn ChainObserver>;
type DigesterService = Arc<dyn ImmutableDigester>;
type SingleSignerService = Arc<dyn SingleSigner>;
type BeaconProviderService = Arc<dyn BeaconProvider>;
type ProtocolInitializerStoreService = Arc<dyn ProtocolInitializerStorer>;

/// The ServiceBuilder is intended to manage Services instance creation.
/// The goal of this is to put all this code out of the way of business code.
#[async_trait]
pub trait ServiceBuilder {
    /// Create a SignerService instance.
    async fn build(&self) -> StdResult<SignerServices>;
}

/// Create a SignerService instance for Production environment.
pub struct ProductionServiceBuilder<'a> {
    config: &'a Configuration,
    chain_observer_builder: fn(&Configuration) -> StdResult<ChainObserverService>,
    immutable_file_observer_builder:
        fn(&Configuration) -> StdResult<Arc<dyn ImmutableFileObserver>>,
}

impl<'a> ProductionServiceBuilder<'a> {
    /// Create a new production service builder.
    pub fn new(config: &'a Configuration) -> Self {
        let chain_observer_builder: fn(&Configuration) -> StdResult<ChainObserverService> =
            |config: &Configuration| {
                let fallback = CardanoCliChainObserver::new(Box::new(CardanoCliRunner::new(
                    config.cardano_cli_path.clone(),
                    config.cardano_node_socket_path.clone(),
                    config.get_network()?,
                )));

                let observer = PallasChainObserver::new(
                    &config.cardano_node_socket_path,
                    config.get_network()?,
                    fallback,
                );

                Ok(Arc::new(observer))
            };

        let immutable_file_observer_builder: fn(
            &Configuration,
        )
            -> StdResult<Arc<dyn ImmutableFileObserver>> = |config: &Configuration| {
            Ok(Arc::new(ImmutableFileSystemObserver::new(
                &config.db_directory,
            )))
        };

        Self {
            config,
            chain_observer_builder,
            immutable_file_observer_builder,
        }
    }

    /// Override immutable file observer builder.
    pub fn override_immutable_file_observer_builder(
        &mut self,
        builder: fn(&Configuration) -> StdResult<Arc<dyn ImmutableFileObserver>>,
    ) -> &mut Self {
        self.immutable_file_observer_builder = builder;

        self
    }

    /// Override default chain observer builder.
    pub fn override_chain_observer_builder(
        &mut self,
        builder: fn(&Configuration) -> StdResult<ChainObserverService>,
    ) -> &mut Self {
        self.chain_observer_builder = builder;

        self
    }

    /// Compute protocol party id
    fn compute_protocol_party_id(&self) -> StdResult<ProtocolPartyId> {
        match &self.config.operational_certificate_path {
            Some(operational_certificate_path) => {
                let opcert: OpCert = OpCert::from_file(operational_certificate_path)
                    .with_context(|| "Could not decode operational certificate")?;
                Ok(opcert
                    .compute_protocol_party_id()
                    .with_context(|| "Could not compute party_id from operational certificate")?)
            }
            _ => Ok(self
                .config
                .party_id
                .to_owned()
                .ok_or(anyhow!("A party_id should at least be provided"))?),
        }
    }

    async fn build_digester_cache_provider(
        &self,
    ) -> StdResult<Option<Arc<dyn ImmutableFileDigestCacheProvider>>> {
        if self.config.disable_digests_cache {
            return Ok(None);
        }

        let cache_provider = JsonImmutableFileDigestCacheProviderBuilder::new(
            &self.config.data_stores_directory,
            &format!("immutables_digests_{}.json", self.config.network),
        )
        .should_reset_digests_cache(self.config.reset_digests_cache)
        .with_logger(slog_scope::logger())
        .build()
        .await?;

        Ok(Some(Arc::new(cache_provider)))
    }

    async fn build_sqlite_connection(&self) -> StdResult<Arc<ConnectionWithFullMutex>> {
        let sqlite_db_path = self.config.get_sqlite_file()?;
        let sqlite_connection = Arc::new(Connection::open_with_full_mutex(sqlite_db_path)?);
        let mut db_checker = DatabaseVersionChecker::new(
            slog_scope::logger(),
            ApplicationNodeType::Signer,
            sqlite_connection.clone(),
        );

        for migration in crate::database::migration::get_migrations() {
            db_checker.add_migration(migration);
        }

        db_checker
            .apply()
            .await
            .with_context(|| "Database migration error")?;

        Ok(sqlite_connection)
    }
}

#[async_trait]
impl<'a> ServiceBuilder for ProductionServiceBuilder<'a> {
    /// Build a Services for the Production environment.
    async fn build(&self) -> StdResult<SignerServices> {
        if !self.config.data_stores_directory.exists() {
            fs::create_dir_all(self.config.data_stores_directory.clone()).with_context(|| {
                format!(
                    "Could not create data stores directory: `{}`",
                    self.config.data_stores_directory.display()
                )
            })?;
        }

        let sqlite_connection = self.build_sqlite_connection().await?;

        let protocol_initializer_store = Arc::new(ProtocolInitializerStore::new(
            Box::new(SQLiteAdapter::new(
                "protocol_initializer",
                sqlite_connection.clone(),
            )?),
            self.config.store_retention_limit,
        ));
        let single_signer = Arc::new(MithrilSingleSigner::new(self.compute_protocol_party_id()?));
        let digester = Arc::new(CardanoImmutableDigester::new(
            self.build_digester_cache_provider().await?,
            slog_scope::logger(),
        ));
        let stake_store = Arc::new(StakeStore::new(
            Box::new(SQLiteAdapter::new("stake", sqlite_connection)?),
            self.config.store_retention_limit,
        ));
        let chain_observer = {
            let builder = self.chain_observer_builder;
            builder(self.config)?
        };
        let beacon_provider = {
            let builder = self.immutable_file_observer_builder;
            Arc::new(BeaconProviderImpl::new(
                chain_observer.clone(),
                builder(self.config)?,
                self.config.get_network()?.to_owned(),
            ))
        };

        let era_reader = Arc::new(EraReader::new(
            self.config
                .build_era_reader_adapter(chain_observer.clone())?,
        ));
        let era_epoch_token = era_reader
            .read_era_epoch_token(beacon_provider.get_current_beacon().await?.epoch)
            .await?;
        let era_checker = Arc::new(EraChecker::new(
            era_epoch_token.get_current_supported_era()?,
            era_epoch_token.get_current_epoch(),
        ));

        let api_version_provider = Arc::new(APIVersionProvider::new(era_checker.clone()));
        let certificate_handler = Arc::new(AggregatorHTTPClient::new(
            self.config.aggregator_endpoint.clone(),
            self.config.relay_endpoint.clone(),
            api_version_provider.clone(),
        ));

        let cardano_immutable_snapshot_builder =
            Arc::new(CardanoImmutableFilesFullSignableBuilder::new(
                digester.clone(),
                &self.config.db_directory,
                slog_scope::logger(),
            ));
        let mithril_stake_distribution_signable_builder =
            Arc::new(MithrilStakeDistributionSignableBuilder::default());
        let signable_builder_service = Arc::new(MithrilSignableBuilderService::new(
            mithril_stake_distribution_signable_builder,
            cardano_immutable_snapshot_builder,
        ));

        let services = SignerServices {
            beacon_provider,
            certificate_handler,
            chain_observer,
            digester,
            single_signer,
            stake_store,
            protocol_initializer_store,
            era_checker,
            era_reader,
            api_version_provider,
            signable_builder_service,
        };

        Ok(services)
    }
}

/// This structure groups all the services required by the state machine.
pub struct SignerServices {
    /// Beacon provider service
    pub beacon_provider: BeaconProviderService,

    /// Stake store service
    pub stake_store: StakeStoreService,

    /// Certificate handler service
    pub certificate_handler: CertificateHandlerService,

    /// Chain Observer service
    pub chain_observer: ChainObserverService,

    /// Digester service
    pub digester: DigesterService,

    /// SingleSigner service
    pub single_signer: SingleSignerService,

    /// ProtocolInitializer store
    pub protocol_initializer_store: ProtocolInitializerStoreService,

    /// Era checker service
    pub era_checker: Arc<EraChecker>,

    /// Era reader service
    pub era_reader: Arc<EraReader>,

    /// API version provider
    pub api_version_provider: Arc<APIVersionProvider>,

    /// Signable Builder Service
    pub signable_builder_service: Arc<dyn SignableBuilderService>,
}

#[cfg(test)]
mod tests {
    use mithril_common::{
        chain_observer::FakeObserver,
        digesters::DumbImmutableFileObserver,
        entities::{Beacon, Epoch},
        era::adapters::EraReaderAdapterType,
    };

    use super::*;

    use std::path::PathBuf;

    fn get_test_dir() -> PathBuf {
        let test_dir = std::env::temp_dir()
            .join("mithril_test")
            .join("signer_service");

        if test_dir.exists() {
            fs::remove_dir_all(&test_dir)
                .unwrap_or_else(|_| panic!("Could not remove dir {test_dir:?}"));
        }
        fs::create_dir_all(&test_dir)
            .unwrap_or_else(|_| panic!("Could not create dir {test_dir:?}"));

        test_dir
    }

    #[tokio::test]
    async fn test_auto_create_stores_directory() {
        let stores_dir = get_test_dir().join("stores");
        let config = Configuration {
            cardano_cli_path: PathBuf::new(),
            cardano_node_socket_path: PathBuf::new(),
            network_magic: None,
            network: "preview".to_string(),
            aggregator_endpoint: "".to_string(),
            relay_endpoint: None,
            party_id: Some("party-123456".to_string()),
            run_interval: 1000,
            db_directory: PathBuf::new(),
            data_stores_directory: stores_dir.clone(),
            store_retention_limit: None,
            kes_secret_key_path: None,
            operational_certificate_path: None,
            disable_digests_cache: false,
            reset_digests_cache: false,
            era_reader_adapter_type: EraReaderAdapterType::Bootstrap,
            era_reader_adapter_params: None,
        };

        assert!(!stores_dir.exists());
        let chain_observer_builder: fn(&Configuration) -> StdResult<ChainObserverService> =
            |_config| {
                Ok(Arc::new(FakeObserver::new(Some(Beacon {
                    epoch: Epoch(1),
                    immutable_file_number: 1,
                    network: "devnet".to_string(),
                }))))
            };
        let immutable_file_observer_builder: fn(
            &Configuration,
        )
            -> StdResult<Arc<dyn ImmutableFileObserver>> =
            |_config: &Configuration| Ok(Arc::new(DumbImmutableFileObserver::default()));

        let mut service_builder = ProductionServiceBuilder::new(&config);
        service_builder
            .override_chain_observer_builder(chain_observer_builder)
            .override_immutable_file_observer_builder(immutable_file_observer_builder)
            .build()
            .await
            .expect("service builder build should not fail");
        assert!(stores_dir.exists());
    }
}
