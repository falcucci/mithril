use anyhow::Context;
use async_trait::async_trait;
use slog_scope::{debug, info, trace, warn};
use thiserror::Error;

#[cfg(test)]
use mockall::automock;

use mithril_common::crypto_helper::{KESPeriod, OpCert, ProtocolOpCert, SerDeShelleyFileFormat};
use mithril_common::entities::{PartyId, ProtocolParameters, SignedEntityType};
use mithril_common::{
    entities::{
        Beacon, CertificatePending, Epoch, EpochSettings, ProtocolMessage, ProtocolMessagePartKey,
        Signer, SignerWithStake, SingleSignatures,
    },
    store::StakeStorer,
    StdResult,
};

use crate::{Configuration, MithrilProtocolInitializerBuilder};

use super::signer_services::SignerServices;

/// This trait is mainly intended for mocking.
#[async_trait]
pub trait Runner: Send + Sync {
    /// Fetch the current epoch settings if any.
    async fn get_epoch_settings(&self) -> StdResult<Option<EpochSettings>>;

    /// Fetch the current pending certificate if any.
    async fn get_pending_certificate(&self) -> StdResult<Option<CertificatePending>>;

    /// Fetch the current beacon from the Cardano node.
    async fn get_current_beacon(&self) -> StdResult<Beacon>;

    /// Register the signer verification key to the aggregator.
    async fn register_signer_to_aggregator(
        &self,
        epoch: Epoch,
        protocol_parameters: &ProtocolParameters,
    ) -> StdResult<()>;

    /// Read the stake distribution and store it.
    async fn update_stake_distribution(&self, epoch: Epoch) -> StdResult<()>;

    /// Check if all prerequisites for signing are met.
    async fn can_i_sign(&self, pending_certificate: &CertificatePending) -> StdResult<bool>;

    /// From a list of signers, associate them with the stake read on the
    /// Cardano node.
    async fn associate_signers_with_stake(
        &self,
        epoch: Epoch,
        signers: &[Signer],
    ) -> StdResult<Vec<SignerWithStake>>;

    /// Create the message to be signed with the single signature.
    async fn compute_message(
        &self,
        signed_entity_type: &SignedEntityType,
        next_signers: &[SignerWithStake],
    ) -> StdResult<ProtocolMessage>;

    /// Create the single signature.
    async fn compute_single_signature(
        &self,
        epoch: Epoch,
        message: &ProtocolMessage,
        signers: &[SignerWithStake],
    ) -> StdResult<Option<SingleSignatures>>;

    /// Send the single signature to the aggregator in order to be aggregated.
    async fn send_single_signature(
        &self,
        signed_entity_type: &SignedEntityType,
        maybe_signature: Option<SingleSignatures>,
    ) -> StdResult<()>;

    /// Read the current era and update the EraChecker.
    async fn update_era_checker(&self, epoch: Epoch) -> StdResult<()>;
}

/// This type represents the errors thrown from the Runner.
#[derive(Debug, Clone, PartialEq, Eq, Error)]
pub enum RunnerError {
    /// Value was expected from a subsystem but None was returned.
    #[error("No value returned by the subsystem for `{0}`.")]
    NoValueError(String),
    /// Could not associate my node with a stake.
    #[error("No stake associated with myself.")]
    NoStakeForSelf(),
    /// Could not find the stake for one of the signers.
    #[error("No stake associated with this signer, party_id: {0}.")]
    NoStakeForSigner(PartyId),
    /// Parse file error
    #[error("File parse failed: {0}.")]
    FileParse(String),
}

/// Controller methods for the Signer's state machine.
pub struct SignerRunner {
    config: Configuration,
    services: SignerServices,
}

impl SignerRunner {
    /// Create a new Runner instance.
    pub fn new(config: Configuration, services: SignerServices) -> Self {
        Self { services, config }
    }
}

#[cfg_attr(test, automock)]
#[async_trait]
impl Runner for SignerRunner {
    async fn get_epoch_settings(&self) -> StdResult<Option<EpochSettings>> {
        debug!("RUNNER: get_epoch_settings");

        self.services
            .certificate_handler
            .retrieve_epoch_settings()
            .await
            .map_err(|e| e.into())
    }

    async fn get_pending_certificate(&self) -> StdResult<Option<CertificatePending>> {
        debug!("RUNNER: get_pending_certificate");

        self.services
            .certificate_handler
            .retrieve_pending_certificate()
            .await
            .map_err(|e| e.into())
    }

    async fn get_current_beacon(&self) -> StdResult<Beacon> {
        debug!("RUNNER: get_current_epoch");

        self.services
            .beacon_provider
            .get_current_beacon()
            .await
            .with_context(|| "Runner can not get current beacon")
    }

    async fn register_signer_to_aggregator(
        &self,
        epoch: Epoch,
        protocol_parameters: &ProtocolParameters,
    ) -> StdResult<()> {
        debug!("RUNNER: register_signer_to_aggregator");

        let epoch_offset_to_recording_epoch = epoch.offset_to_recording_epoch();
        let stake_distribution = self
            .services
            .stake_store
            .get_stakes(epoch_offset_to_recording_epoch)
            .await?
            .ok_or_else(|| {
                RunnerError::NoValueError(format!(
                    "stakes at epoch {epoch_offset_to_recording_epoch}"
                ))
            })?;
        let stake = stake_distribution
            .get(&self.services.single_signer.get_party_id())
            .ok_or_else(RunnerError::NoStakeForSelf)?;
        let (operational_certificate, protocol_operational_certificate) = match &self
            .config
            .operational_certificate_path
        {
            Some(operational_certificate_path) => {
                let opcert: OpCert = OpCert::from_file(operational_certificate_path)
                    .map_err(|_| RunnerError::FileParse("operational_certificate_path".to_string()))
                    .with_context(|| {
                        "register_signer_to_aggregator can not decode OpCert from file"
                    })?;
                (Some(opcert.clone()), Some(ProtocolOpCert::new(opcert)))
            }
            _ => (None, None),
        };

        let kes_period = match operational_certificate {
            Some(operational_certificate) => Some(
                self.services
                    .chain_observer
                    .get_current_kes_period(&operational_certificate)
                    .await?
                    .unwrap_or_default()
                    - operational_certificate.start_kes_period as KESPeriod,
            ),
            None => None,
        };
        let protocol_initializer = MithrilProtocolInitializerBuilder::build(
            stake,
            protocol_parameters,
            self.config.kes_secret_key_path.clone(),
            kes_period,
        )?;
        let signer = Signer::new(
            self.services.single_signer.get_party_id(),
            protocol_initializer.verification_key().into(),
            protocol_initializer.verification_key_signature(),
            protocol_operational_certificate,
            kes_period,
        );
        self.services
            .certificate_handler
            .register_signer(epoch_offset_to_recording_epoch, &signer)
            .await?;
        self.services
            .protocol_initializer_store
            .save_protocol_initializer(epoch_offset_to_recording_epoch, protocol_initializer)
            .await?;

        Ok(())
    }

    async fn update_stake_distribution(&self, epoch: Epoch) -> StdResult<()> {
        debug!("RUNNER: update_stake_distribution");

        let exists_stake_distribution = !self
            .services
            .stake_store
            .get_stakes(epoch.offset_to_recording_epoch())
            .await?
            .unwrap_or_default()
            .is_empty();
        if exists_stake_distribution {
            return Ok(());
        }

        let stake_distribution = self
            .services
            .chain_observer
            .get_current_stake_distribution()
            .await?
            .ok_or_else(|| RunnerError::NoValueError("current_stake_distribution".to_string()))?;
        self.services
            .stake_store
            .save_stakes(epoch.offset_to_recording_epoch(), stake_distribution)
            .await?;

        Ok(())
    }

    async fn can_i_sign(&self, pending_certificate: &CertificatePending) -> StdResult<bool> {
        debug!("RUNNER: can_i_sign");

        if let Some(signer) =
            pending_certificate.get_signer(self.services.single_signer.get_party_id())
        {
            debug!(" > got a Signer from pending certificate");

            if let Some(protocol_initializer) = self
                .services
                .protocol_initializer_store
                .get_protocol_initializer(
                    pending_certificate
                        .beacon
                        .epoch
                        .offset_to_signer_retrieval_epoch()?,
                )
                .await?
            {
                debug!(
                    " > got protocol initializer for this epoch ({})",
                    pending_certificate.beacon.epoch
                );

                if signer.verification_key == protocol_initializer.verification_key().into() {
                    debug!("verification keys match, we can sign");

                    return Ok(true);
                }
                debug!(" > verification key do not match, can NOT sign");
            } else {
                warn!(
                    " > NO protocol initializer found for this epoch ({})",
                    pending_certificate.beacon.epoch
                );
            }
        } else {
            debug!(" > Signer not found in the certificate pending");
        }

        Ok(false)
    }

    async fn associate_signers_with_stake(
        &self,
        epoch: Epoch,
        signers: &[Signer],
    ) -> StdResult<Vec<SignerWithStake>> {
        debug!("RUNNER: associate_signers_with_stake");

        let stakes = self
            .services
            .stake_store
            .get_stakes(epoch)
            .await?
            .ok_or_else(|| RunnerError::NoValueError(format!("stakes at epoch {epoch}")))?;
        let mut signers_with_stake = vec![];

        for signer in signers {
            let stake = stakes
                .get(&*signer.party_id)
                .ok_or_else(|| RunnerError::NoStakeForSigner(signer.party_id.to_string()))?;

            signers_with_stake.push(SignerWithStake::new(
                signer.party_id.to_owned(),
                signer.verification_key.to_owned(),
                signer.verification_key_signature.to_owned(),
                signer.operational_certificate.to_owned(),
                signer.kes_period.to_owned(),
                *stake,
            ));
            trace!(
                " > associating signer_id {} with stake {}",
                signer.party_id,
                *stake
            );
        }
        Ok(signers_with_stake)
    }

    async fn compute_message(
        &self,
        signed_entity_type: &SignedEntityType,
        next_signers: &[SignerWithStake],
    ) -> StdResult<ProtocolMessage> {
        debug!("RUNNER: compute_message");

        // 1 compute the signed entity type part of the message
        let mut message = self
            .services
            .signable_builder_service
            .compute_protocol_message(signed_entity_type.to_owned())
            .await
            .with_context(|| format!("Runner can not compute protocol message for signed entity type: '{signed_entity_type}'"))?;

        // 2 set the next signers keys and stakes in the message
        let epoch = signed_entity_type.get_epoch();
        let next_signer_retrieval_epoch = epoch.offset_to_next_signer_retrieval_epoch();
        let next_protocol_initializer = self
            .services
            .protocol_initializer_store
            .get_protocol_initializer(next_signer_retrieval_epoch)
            .await?
            .ok_or_else(|| {
                RunnerError::NoValueError(format!(
                    "protocol_initializer at epoch {next_signer_retrieval_epoch}"
                ))
            })?;

        let avk = self
            .services
            .single_signer
            .compute_aggregate_verification_key(next_signers, &next_protocol_initializer)?
            .ok_or_else(|| RunnerError::NoValueError("next_signers avk".to_string()))?;
        message.set_message_part(ProtocolMessagePartKey::NextAggregateVerificationKey, avk);

        Ok(message)
    }

    async fn compute_single_signature(
        &self,
        epoch: Epoch,
        message: &ProtocolMessage,
        signers: &[SignerWithStake],
    ) -> StdResult<Option<SingleSignatures>> {
        debug!("RUNNER: compute_single_signature");

        let signer_retrieval_epoch = epoch.offset_to_signer_retrieval_epoch()?;
        let protocol_initializer = self
            .services
            .protocol_initializer_store
            .get_protocol_initializer(signer_retrieval_epoch)
            .await?
            .ok_or_else(|| {
                RunnerError::NoValueError(format!(
                    "protocol_initializer at epoch {signer_retrieval_epoch}"
                ))
            })?;
        let signature = self.services.single_signer.compute_single_signatures(
            message,
            signers,
            &protocol_initializer,
        )?;
        info!(
            " > {}",
            if signature.is_some() {
                "could compute a single signature!"
            } else {
                "NO single signature was computed."
            }
        );

        Ok(signature)
    }

    async fn send_single_signature(
        &self,
        signed_entity_type: &SignedEntityType,
        maybe_signature: Option<SingleSignatures>,
    ) -> StdResult<()> {
        debug!("RUNNER: send_single_signature");

        if let Some(single_signatures) = maybe_signature {
            debug!(" > there is a single signature to send");
            self.services
                .certificate_handler
                .register_signatures(signed_entity_type, &single_signatures)
                .await
                .map_err(|e| e.into())
        } else {
            debug!(" > NO single signature to send, doing nothing");

            Ok(())
        }
    }

    async fn update_era_checker(&self, epoch: Epoch) -> StdResult<()> {
        debug!("RUNNER: update_era_checker");

        let era_token = self
            .services
            .era_reader
            .read_era_epoch_token(epoch)
            .await
            .map_err(Box::new)?;
        let current_era = era_token.get_current_supported_era()?;
        self.services
            .era_checker
            .change_era(current_era, era_token.get_current_epoch());
        debug!(
            "Current Era is {} (Epoch {}).",
            current_era,
            era_token.get_current_epoch()
        );

        if era_token.get_next_supported_era().is_err() {
            let era_name = &era_token.get_next_era_marker().unwrap().name;
            warn!("Upcoming Era '{era_name}' is not supported by this version of the software. Please update!");
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use mithril_common::{
        api_version::APIVersionProvider,
        chain_observer::{ChainObserver, FakeObserver},
        crypto_helper::ProtocolInitializer,
        digesters::{DumbImmutableDigester, DumbImmutableFileObserver},
        entities::{Epoch, StakeDistribution},
        era::{
            adapters::{EraReaderAdapterType, EraReaderBootstrapAdapter},
            EraChecker, EraReader,
        },
        signable_builder::{
            CardanoImmutableFilesFullSignableBuilder, MithrilSignableBuilderService,
            MithrilStakeDistributionSignableBuilder,
        },
        store::{
            adapter::{DumbStoreAdapter, MemoryAdapter},
            StakeStore, StakeStorer,
        },
        test_utils::{fake_data, MithrilFixtureBuilder},
        BeaconProvider, BeaconProviderImpl, CardanoNetwork,
    };
    use mockall::mock;
    use std::{
        path::{Path, PathBuf},
        sync::Arc,
    };

    use crate::{
        AggregatorClient, DumbAggregatorClient, MithrilSingleSigner, MockAggregatorClient,
        ProtocolInitializerStore, SingleSigner,
    };

    use super::*;

    const DIGESTER_RESULT: &str = "a digest";

    mock! {
        pub FakeBeaconProvider { }

        #[async_trait]
        impl BeaconProvider for FakeBeaconProvider {
            async fn get_current_beacon(&self) -> StdResult<Beacon>;
        }
    }

    async fn init_services() -> SignerServices {
        let adapter: MemoryAdapter<Epoch, ProtocolInitializer> = MemoryAdapter::new(None).unwrap();
        let stake_distribution_signers = fake_data::signers_with_stakes(2);
        let party_id = stake_distribution_signers[1].party_id.clone();
        let fake_observer = FakeObserver::default();
        fake_observer.set_signers(stake_distribution_signers).await;
        let chain_observer = Arc::new(fake_observer);
        let beacon_provider = Arc::new(BeaconProviderImpl::new(
            chain_observer.clone(),
            Arc::new(DumbImmutableFileObserver::default()),
            CardanoNetwork::TestNet(42),
        ));
        let era_reader = Arc::new(EraReader::new(Arc::new(EraReaderBootstrapAdapter)));
        let era_epoch_token = era_reader
            .read_era_epoch_token(beacon_provider.get_current_beacon().await.unwrap().epoch)
            .await
            .unwrap();
        let era_checker = Arc::new(EraChecker::new(
            era_epoch_token.get_current_supported_era().unwrap(),
            era_epoch_token.get_current_epoch(),
        ));

        let api_version_provider = Arc::new(APIVersionProvider::new(era_checker.clone()));
        let digester = Arc::new(DumbImmutableDigester::new(DIGESTER_RESULT, true));
        let cardano_immutable_signable_builder =
            Arc::new(CardanoImmutableFilesFullSignableBuilder::new(
                digester.clone(),
                Path::new(""),
                slog_scope::logger(),
            ));
        let mithril_stake_distribution_signable_builder =
            Arc::new(MithrilStakeDistributionSignableBuilder::default());
        let signable_builder_service = Arc::new(MithrilSignableBuilderService::new(
            mithril_stake_distribution_signable_builder,
            cardano_immutable_signable_builder,
        ));

        SignerServices {
            stake_store: Arc::new(StakeStore::new(Box::new(DumbStoreAdapter::new()), None)),
            certificate_handler: Arc::new(DumbAggregatorClient::default()),
            chain_observer,
            digester,
            single_signer: Arc::new(MithrilSingleSigner::new(party_id)),
            beacon_provider,
            protocol_initializer_store: Arc::new(ProtocolInitializerStore::new(
                Box::new(adapter),
                None,
            )),
            era_checker,
            era_reader,
            api_version_provider,
            signable_builder_service,
        }
    }

    async fn init_runner(
        maybe_services: Option<SignerServices>,
        maybe_config: Option<Configuration>,
    ) -> SignerRunner {
        let services = init_services().await;
        let config = Configuration {
            aggregator_endpoint: "http://0.0.0.0:3000".to_string(),
            relay_endpoint: None,
            cardano_cli_path: PathBuf::new(),
            cardano_node_socket_path: PathBuf::new(),
            db_directory: PathBuf::new(),
            network: "whatever".to_string(),
            network_magic: None,
            party_id: Some("1".to_string()),
            run_interval: 100,
            data_stores_directory: PathBuf::new(),
            kes_secret_key_path: None,
            operational_certificate_path: None,
            disable_digests_cache: false,
            store_retention_limit: None,
            reset_digests_cache: false,
            era_reader_adapter_type: EraReaderAdapterType::Bootstrap,
            era_reader_adapter_params: None,
        };

        SignerRunner::new(
            maybe_config.unwrap_or(config),
            maybe_services.unwrap_or(services),
        )
    }

    #[tokio::test]
    async fn test_get_current_beacon() {
        let mut services = init_services().await;
        let expected = fake_data::beacon();
        let mut beacon_provider = MockFakeBeaconProvider::new();
        beacon_provider
            .expect_get_current_beacon()
            .once()
            .returning(|| Ok(fake_data::beacon()));
        services.beacon_provider = Arc::new(beacon_provider);
        let runner = init_runner(Some(services), None).await;

        assert_eq!(
            expected,
            runner
                .get_current_beacon()
                .await
                .expect("Get current beacon should not fail.")
        );
    }

    #[tokio::test]
    async fn test_update_stake_distribution() {
        let services = init_services().await;
        let stake_store = services.stake_store.clone();
        let current_epoch = services
            .chain_observer
            .get_current_epoch()
            .await
            .expect("chain observer should not fail")
            .expect("the observer should return an epoch");
        let runner = init_runner(Some(services), None).await;
        assert!(stake_store
            .get_stakes(current_epoch)
            .await
            .expect("getting stakes from store should not fail")
            .is_none());

        runner
            .update_stake_distribution(current_epoch)
            .await
            .expect("update_stake_distribution should not fail.");

        let stake_distribution = stake_store
            .get_stakes(current_epoch.offset_to_recording_epoch())
            .await
            .expect("getting stakes from store should not fail")
            .expect("there should be stakes for this epoch");

        assert_eq!(2, stake_distribution.len());
    }

    #[tokio::test]
    async fn test_register_signer_to_aggregator() {
        let mut services = init_services().await;
        let certificate_handler = Arc::new(DumbAggregatorClient::default());
        services.certificate_handler = certificate_handler.clone();
        let protocol_initializer_store = services.protocol_initializer_store.clone();
        let chain_observer = Arc::new(FakeObserver::default());
        services.chain_observer = chain_observer.clone();
        let epoch = services
            .beacon_provider
            .get_current_beacon()
            .await
            .unwrap()
            .epoch
            .offset_to_recording_epoch();
        let stakes = chain_observer
            .get_current_stake_distribution()
            .await
            .unwrap()
            .unwrap();
        services
            .stake_store
            .save_stakes(epoch, stakes)
            .await
            .unwrap();
        let runner = init_runner(Some(services), None).await;
        let epoch = chain_observer
            .current_beacon
            .read()
            .await
            .clone()
            .expect("chain_observer should have a current_beacon")
            .epoch;

        let pending_certificate = certificate_handler
            .retrieve_pending_certificate()
            .await
            .expect("getting pending certificate should not fail")
            .expect("there should be a pending certificate, None returned");
        runner
            .register_signer_to_aggregator(epoch, &pending_certificate.protocol_parameters)
            .await
            .expect("registering a signer to the aggregator should not fail");

        assert!(certificate_handler
            .get_last_registered_signer()
            .await
            .is_some());
        let maybe_protocol_initializer = protocol_initializer_store
            .get_protocol_initializer(epoch.offset_to_recording_epoch())
            .await
            .expect("get_protocol_initializer should not fail");
        assert!(
            maybe_protocol_initializer.is_some(),
            "A protocol initializer should have been registered at the 'Recording' epoch"
        );
    }

    #[tokio::test]
    async fn test_can_i_sign() {
        let mut pending_certificate = fake_data::certificate_pending();
        let epoch = pending_certificate.beacon.epoch;
        let signer = &mut pending_certificate.signers[0];
        let mut services = init_services().await;
        let protocol_initializer_store = services.protocol_initializer_store.clone();
        services.single_signer = Arc::new(MithrilSingleSigner::new(signer.party_id.to_owned()));
        let runner = init_runner(Some(services), None).await;

        let protocol_initializer = MithrilProtocolInitializerBuilder::build(
            &100,
            &fake_data::protocol_parameters(),
            None,
            None,
        )
        .expect("build protocol initializer should not fail");
        signer.verification_key = protocol_initializer.verification_key().into();
        protocol_initializer_store
            .save_protocol_initializer(
                epoch
                    .offset_to_signer_retrieval_epoch()
                    .expect("offset_to_signer_retrieval_epoch should not fail"),
                protocol_initializer,
            )
            .await
            .expect("save_protocol_initializer should not fail");

        let can_i_sign_result = runner.can_i_sign(&pending_certificate).await.unwrap();
        assert!(can_i_sign_result);
    }

    #[tokio::test]
    async fn test_associate_signers_with_stake() {
        let services = init_services().await;
        let stake_store = services.stake_store.clone();
        let runner = init_runner(Some(services), None).await;
        let epoch = Epoch(12);
        let expected = fake_data::signers_with_stakes(5);
        let signers = expected
            .clone()
            .into_iter()
            .map(|s| s.into())
            .collect::<Vec<_>>();
        let stake_distribution = expected
            .clone()
            .iter()
            .map(|s| s.into())
            .collect::<StakeDistribution>();

        stake_store
            .save_stakes(epoch, stake_distribution)
            .await
            .expect("save_stakes should not fail");

        let result = runner
            .associate_signers_with_stake(epoch, &signers)
            .await
            .expect("associate_signers_with_stake should not fail");
        assert_eq!(expected, result);
    }

    #[tokio::test]
    async fn test_compute_message() {
        let mut services = init_services().await;
        let current_beacon = services
            .beacon_provider
            .get_current_beacon()
            .await
            .expect("get_current_beacon should not fail");
        let signed_entity_type =
            SignedEntityType::CardanoImmutableFilesFull(current_beacon.clone());
        let fixture = MithrilFixtureBuilder::default().with_signers(5).build();
        let signer_with_stake = fixture.signers_fixture()[0].signer_with_stake.clone();
        let protocol_initializer = fixture.signers_fixture()[0].protocol_initializer.clone();
        let single_signer = Arc::new(MithrilSingleSigner::new(
            signer_with_stake.party_id.to_owned(),
        ));
        services.single_signer = single_signer.clone();
        services
            .protocol_initializer_store
            .save_protocol_initializer(
                current_beacon.epoch.offset_to_next_signer_retrieval_epoch(),
                protocol_initializer.clone(),
            )
            .await
            .expect("save_protocol_initializer should not fail");

        let next_signers = fixture.signers_with_stake();
        let mut expected = ProtocolMessage::new();
        expected.set_message_part(
            ProtocolMessagePartKey::SnapshotDigest,
            DIGESTER_RESULT.to_string(),
        );
        let avk = services
            .single_signer
            .compute_aggregate_verification_key(&next_signers, &protocol_initializer)
            .expect("compute_aggregate_verification_key should not fail")
            .expect("an avk should have been computed");
        expected.set_message_part(ProtocolMessagePartKey::NextAggregateVerificationKey, avk);

        let runner = init_runner(Some(services), None).await;
        let message = runner
            .compute_message(&signed_entity_type, &next_signers)
            .await
            .expect("compute_message should not fail");

        assert_eq!(expected, message);
    }

    #[tokio::test]
    async fn test_compute_single_signature() {
        let mut services = init_services().await;
        let current_beacon = services
            .beacon_provider
            .get_current_beacon()
            .await
            .expect("get_current_beacon should not fail");
        let fixture = MithrilFixtureBuilder::default().with_signers(5).build();
        let signer_with_stake = fixture.signers_fixture()[0].signer_with_stake.clone();
        let protocol_initializer = fixture.signers_fixture()[0].protocol_initializer.clone();
        let single_signer = Arc::new(MithrilSingleSigner::new(
            signer_with_stake.party_id.to_string(),
        ));
        services.single_signer = single_signer.clone();
        services
            .protocol_initializer_store
            .save_protocol_initializer(
                current_beacon
                    .epoch
                    .offset_to_signer_retrieval_epoch()
                    .expect("offset_to_signer_retrieval_epoch should not fail"),
                protocol_initializer.clone(),
            )
            .await
            .expect("save_protocol_initializer should not fail");
        let signers = fixture.signers_with_stake();

        let mut message = ProtocolMessage::new();
        message.set_message_part(
            ProtocolMessagePartKey::SnapshotDigest,
            "a message".to_string(),
        );
        message.set_message_part(
            ProtocolMessagePartKey::NextAggregateVerificationKey,
            "an avk".to_string(),
        );

        let expected = single_signer
            .compute_single_signatures(&message, &signers, &protocol_initializer)
            .expect("compute_single_signatures should not fail");

        let runner = init_runner(Some(services), None).await;
        let single_signature = runner
            .compute_single_signature(current_beacon.epoch, &message, &signers)
            .await
            .expect("compute_message should not fail");
        assert_eq!(expected, single_signature);
    }

    #[tokio::test]
    async fn test_send_single_signature() {
        let mut services = init_services().await;
        let mut certificate_handler = MockAggregatorClient::new();
        certificate_handler
            .expect_register_signatures()
            .once()
            .returning(|_, _| Ok(()));
        services.certificate_handler = Arc::new(certificate_handler);
        let runner = init_runner(Some(services), None).await;

        runner
            .send_single_signature(
                &SignedEntityType::dummy(),
                Some(fake_data::single_signatures(vec![2, 5, 12])),
            )
            .await
            .expect("send_single_signature should not fail");
    }

    #[tokio::test]
    async fn test_update_era_checker() {
        let services = init_services().await;
        let beacon_provider = services.beacon_provider.clone();
        let era_checker = services.era_checker.clone();
        let mut beacon = beacon_provider.get_current_beacon().await.unwrap();

        assert_eq!(beacon.epoch, era_checker.current_epoch());
        let runner = init_runner(Some(services), None).await;
        beacon.epoch += 1;
        runner.update_era_checker(beacon.epoch).await.unwrap();

        assert_eq!(beacon.epoch, era_checker.current_epoch());
    }
}
