use sqlite::ConnectionWithFullMutex;
use std::sync::Arc;
use tokio::sync::RwLock;

use mithril_common::{
    api_version::APIVersionProvider,
    certificate_chain::CertificateVerifier,
    chain_observer::ChainObserver,
    crypto_helper::ProtocolGenesisVerifier,
    digesters::{ImmutableDigester, ImmutableFileObserver},
    entities::{Epoch, ProtocolParameters, SignerWithStake, StakeDistribution},
    era::{EraChecker, EraReader},
    signable_builder::SignableBuilderService,
    store::StakeStorer,
    test_utils::MithrilFixture,
    BeaconProvider,
};

use crate::services::{EpochService, HttpMessageService};
use crate::{
    configuration::*,
    database::provider::{CertificateRepository, SignedEntityStorer, SignerGetter, StakePoolStore},
    event_store::{EventMessage, TransmitterService},
    multi_signer::MultiSigner,
    services::{CertifierService, SignedEntityService, StakeDistributionService, TickerService},
    signer_registerer::SignerRecorder,
    snapshot_uploaders::SnapshotUploader,
    CertificatePendingStore, ProtocolParametersStorer, SignerRegisterer,
    SignerRegistrationRoundOpener, Snapshotter, VerificationKeyStorer,
};

/// MultiSignerWrapper wraps a [MultiSigner]
pub type MultiSignerWrapper = Arc<RwLock<dyn MultiSigner>>;

/// EpochServiceWrapper wraps a [EpochService]
pub type EpochServiceWrapper = Arc<RwLock<dyn EpochService>>;

/// DependencyManager handles the dependencies
pub struct DependencyContainer {
    /// Configuration structure.
    pub config: Configuration,

    /// SQLite database connection
    /// This is not a real service but is is needed to instantiate all store
    /// services. Shall be private dependency.
    pub sqlite_connection: Arc<ConnectionWithFullMutex>,

    /// Stake Store used by the StakeDistributionService
    /// It shall be a private dependency.
    pub stake_store: Arc<StakePoolStore>,

    /// Snapshot uploader service.
    pub snapshot_uploader: Arc<dyn SnapshotUploader>,

    /// Multisigner service.
    pub multi_signer: MultiSignerWrapper,

    /// Certificate pending store.
    pub certificate_pending_store: Arc<CertificatePendingStore>,

    /// Certificate store.
    pub certificate_repository: Arc<CertificateRepository>,

    /// Verification key store.
    pub verification_key_store: Arc<dyn VerificationKeyStorer>,

    /// Protocol parameter store.
    pub protocol_parameters_store: Arc<dyn ProtocolParametersStorer>,

    /// Chain observer service.
    pub chain_observer: Arc<dyn ChainObserver>,

    /// Beacon provider service.
    pub beacon_provider: Arc<dyn BeaconProvider>,

    /// Immutable file observer service.
    pub immutable_file_observer: Arc<dyn ImmutableFileObserver>,

    /// Digester service.
    pub digester: Arc<dyn ImmutableDigester>,

    /// Snapshotter service.
    pub snapshotter: Arc<dyn Snapshotter>,

    /// Certificate verifier service.
    pub certificate_verifier: Arc<dyn CertificateVerifier>,

    /// Genesis signature verifier service.
    pub genesis_verifier: Arc<ProtocolGenesisVerifier>,

    /// Signer registerer service
    pub signer_registerer: Arc<dyn SignerRegisterer>,

    /// Signer registration round opener service
    pub signer_registration_round_opener: Arc<dyn SignerRegistrationRoundOpener>,

    /// Era checker service
    pub era_checker: Arc<EraChecker>,

    /// Era reader service
    pub era_reader: Arc<EraReader>,

    /// Event Transmitter Service
    pub event_transmitter: Arc<TransmitterService<EventMessage>>,

    /// API Version provider
    pub api_version_provider: Arc<APIVersionProvider>,

    /// Stake Distribution Service
    pub stake_distribution_service: Arc<dyn StakeDistributionService>,

    /// Signer Recorder
    pub signer_recorder: Arc<dyn SignerRecorder>,

    /// Signable Builder Service
    pub signable_builder_service: Arc<dyn SignableBuilderService>,

    /// Signed Entity Service
    pub signed_entity_service: Arc<dyn SignedEntityService>,

    /// Certifier Service
    pub certifier_service: Arc<dyn CertifierService>,

    /// Epoch service
    pub epoch_service: EpochServiceWrapper,

    /// Ticker Service
    pub ticker_service: Arc<dyn TickerService>,

    /// Signed Entity storer
    pub signed_entity_storer: Arc<dyn SignedEntityStorer>,

    /// Signer getter service
    pub signer_getter: Arc<dyn SignerGetter>,

    /// HTTP message service
    pub http_message_service: Arc<dyn HttpMessageService>,
}

#[doc(hidden)]
impl DependencyContainer {
    /// `TEST METHOD ONLY`
    ///
    /// Get the first two epochs that will be used by a newly started aggregator
    pub async fn get_genesis_epochs(&self) -> (Epoch, Epoch) {
        let current_epoch = self
            .chain_observer
            .get_current_epoch()
            .await
            .expect("get_current_epoch should not fail")
            .expect("an epoch should've been set to the chain observer");
        let work_epoch = current_epoch
            .offset_to_signer_retrieval_epoch()
            .expect("epoch.offset_by SIGNER_EPOCH_RETRIEVAL_OFFSET should not fail");
        let epoch_to_sign = current_epoch.offset_to_next_signer_retrieval_epoch();

        (work_epoch, epoch_to_sign)
    }

    /// `TEST METHOD ONLY`
    ///
    /// Fill the stores of a [DependencyManager] in a way to simulate an aggregator state
    /// using the data from a precomputed fixture.
    pub async fn init_state_from_fixture(&self, fixture: &MithrilFixture, target_epochs: &[Epoch]) {
        for epoch in target_epochs {
            self.protocol_parameters_store
                .save_protocol_parameters(*epoch, fixture.protocol_parameters())
                .await
                .expect("save_protocol_parameters should not fail");
            self.fill_verification_key_store(*epoch, &fixture.signers_with_stake())
                .await;
            self.fill_stakes_store(*epoch, fixture.signers_with_stake())
                .await;
        }
    }

    /// `TEST METHOD ONLY`
    ///
    /// Fill the stores of a [DependencyManager] in a way to simulate an aggregator genesis state.
    ///
    /// For the current and the next epoch:
    /// * Fill the [VerificationKeyStorer] with the given signers keys.
    /// * Fill the [StakeStore] with the given signers stakes.
    /// * Fill the [ProtocolParametersStore] with the given parameters.
    pub async fn prepare_for_genesis(
        &self,
        genesis_signers: Vec<SignerWithStake>,
        second_epoch_signers: Vec<SignerWithStake>,
        genesis_protocol_parameters: &ProtocolParameters,
    ) {
        self.init_protocol_parameter_store(genesis_protocol_parameters)
            .await;

        let (work_epoch, epoch_to_sign) = self.get_genesis_epochs().await;
        for (epoch, signers) in [
            (work_epoch, genesis_signers),
            (epoch_to_sign, second_epoch_signers),
        ] {
            self.fill_verification_key_store(epoch, &signers).await;
            self.fill_stakes_store(epoch, signers).await;
        }
    }

    /// `TEST METHOD ONLY`
    ///
    /// Fill up to the first three epochs of the [ProtocolParametersStore] with the given value.
    pub async fn init_protocol_parameter_store(&self, protocol_parameters: &ProtocolParameters) {
        let (work_epoch, epoch_to_sign) = self.get_genesis_epochs().await;
        let mut epochs_to_save = Vec::new();
        epochs_to_save.push(work_epoch);
        epochs_to_save.push(epoch_to_sign);
        epochs_to_save.push(epoch_to_sign.next());
        for epoch in epochs_to_save {
            self.protocol_parameters_store
                .save_protocol_parameters(epoch, protocol_parameters.clone())
                .await
                .expect("save_protocol_parameters should not fail");
        }
    }

    async fn fill_verification_key_store(&self, target_epoch: Epoch, signers: &[SignerWithStake]) {
        for signer in signers {
            self.signer_recorder
                .record_signer_registration(signer.party_id.clone())
                .await
                .expect("record_signer_registration should not fail");
            self.verification_key_store
                .save_verification_key(target_epoch, signer.clone())
                .await
                .expect("save_verification_key should not fail");
        }
    }

    async fn fill_stakes_store(&self, target_epoch: Epoch, signers: Vec<SignerWithStake>) {
        let _ = self
            .stake_store
            .save_stakes(
                target_epoch,
                signers
                    .iter()
                    .map(|s| s.into())
                    .collect::<StakeDistribution>(),
            )
            .await
            .expect("save_stakes should not fail");
    }
}

#[cfg(test)]
pub mod tests {
    use crate::{dependency_injection::DependenciesBuilder, Configuration, DependencyContainer};

    pub async fn initialize_dependencies() -> DependencyContainer {
        let config = Configuration::new_sample();
        let mut builder = DependenciesBuilder::new(config);

        builder.build_dependency_container().await.unwrap()
    }
}
