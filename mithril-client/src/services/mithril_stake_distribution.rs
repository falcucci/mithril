//! ## Mithril Stake Distribution Service
//!
//! This module contains the service to interact with a given Mithril Aggregator
//! in order to list / download mithril stake distributions.
//!
//! ```no_run
//! use std::sync::Arc;
//! use mithril_client::common::StdResult;
//! use mithril_client::dependencies::{ConfigParameters, DependenciesBuilder};
//! use mithril_client::services::MithrilStakeDistributionService;
//!
//! #[tokio::main]
//! async fn main() -> StdResult<()> {
//!     let mut config = ConfigParameters::default();
//!     config
//!         .add_parameter("genesis_verification_key", "YOUR_GENESIS_VERIFICATION_KEY")
//!         .add_parameter("aggregator_endpoint", "YOUR_AGGREGATOR_ENDPOINT");
//!     let stake_distribution_service = DependenciesBuilder::new(Arc::new(config))
//!         .get_mithril_stake_distribution_service()
//!         .await?;
//!
//!     for message in stake_distribution_service.list().await? {
//!         println!("Stake distribution hash = {}", message.hash);
//!     }
//!
//!     Ok(())
//! }
//! ```
use anyhow::Context;
use async_trait::async_trait;
use std::{
    path::{Path, PathBuf},
    sync::Arc,
};
use thiserror::Error;

use mithril_common::{
    certificate_chain::CertificateVerifier,
    crypto_helper::{
        ProtocolAggregateVerificationKey, ProtocolGenesisVerificationKey, ProtocolGenesisVerifier,
    },
    entities::{MithrilStakeDistribution, ProtocolMessagePartKey},
    messages::MithrilStakeDistributionListItemMessage,
    protocol::SignerBuilder,
    StdError, StdResult,
};

use crate::aggregator_client::{CertificateClient, MithrilStakeDistributionClient};

/// Errors related to the StakeDistributionService
#[derive(Debug, Error)]
pub enum MithrilStakeDistributionServiceError {
    /// When certificate cannot be verified
    #[error("Could not verify the Mithril stake distribution multisignature, hash='{hash}', certificate hash='{certificate_hash}. {context}")]
    CouldNotVerifyStakeDistribution {
        /// StakeDistribution identifier
        hash: String,

        /// Associated certificate
        certificate_hash: String,

        /// Context
        context: String,
    },
    /// Associated certificate not found
    #[error("Could not get associated certificate '{0}'.")]
    CertificateNotFound(String),

    /// The configuration has invalid or missing parameters
    #[error("Missing or invalid parameters")]
    InvalidParameters(#[source] StdError),

    /// Could not find the given stake distribution
    #[error("Could not find stake distribution associated to hash '{0}'.")]
    CouldNotFindStakeDistribution(String),
}

/// Definition of the service responsible of Mithril Stake Distribution.
#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
pub trait MithrilStakeDistributionService {
    /// Return a list of the certified Mithril stake distributions
    async fn list(&self) -> StdResult<Vec<MithrilStakeDistributionListItemMessage>>;

    /// Download and verify the specified stake distribution
    async fn download(
        &self,
        hash: &str,
        dirpath: &Path,
        genesis_verification_key: &str,
    ) -> StdResult<PathBuf>;
}

/// Service responsible of the MithrilStakeDistribution operations.
pub struct AppMithrilStakeDistributionService {
    /// Aggreggator client for MithrilStakeDistribution
    stake_distribution_client: Arc<MithrilStakeDistributionClient>,
    certificate_client: Arc<CertificateClient>,
    certificate_verifier: Arc<dyn CertificateVerifier>,
}

impl AppMithrilStakeDistributionService {
    /// Constructor
    pub fn new(
        stake_distribution_client: Arc<MithrilStakeDistributionClient>,
        certificate_client: Arc<CertificateClient>,
        certificate_verifier: Arc<dyn CertificateVerifier>,
    ) -> Self {
        Self {
            stake_distribution_client,
            certificate_client,
            certificate_verifier,
        }
    }

    async fn compute_avk_from_mithril_stake_distribution(
        &self,
        stake_distribution: &MithrilStakeDistribution,
    ) -> StdResult<ProtocolAggregateVerificationKey> {
        let signer_builder = SignerBuilder::new(
            &stake_distribution.signers_with_stake,
            &stake_distribution.protocol_parameters,
        )?;

        Ok(signer_builder.compute_aggregate_verification_key())
    }

    async fn expand_eventual_artifact_hash_alias(&self, hash: &str) -> StdResult<String> {
        if hash.to_lowercase() == "latest" {
            let last_mithril_stake_distribution = self.list().await.with_context(|| {
                "Can not get the list of artifacts while retrieving the latest stake distribution hash"
            })?;
            let last_mithril_stake_distribution =
                last_mithril_stake_distribution.first().ok_or_else(|| {
                    MithrilStakeDistributionServiceError::CouldNotFindStakeDistribution(
                        hash.to_string(),
                    )
                })?;
            Ok(last_mithril_stake_distribution.hash.to_owned())
        } else {
            Ok(hash.to_owned())
        }
    }
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl MithrilStakeDistributionService for AppMithrilStakeDistributionService {
    async fn list(&self) -> StdResult<Vec<MithrilStakeDistributionListItemMessage>> {
        self.stake_distribution_client.list().await
    }

    async fn download(
        &self,
        hash: &str,
        dirpath: &Path,
        genesis_verification_key: &str,
    ) -> StdResult<PathBuf> {
        let stake_distribution_entity = self
            .stake_distribution_client
            .get(&self.expand_eventual_artifact_hash_alias(hash).await?)
            .await?
            .ok_or_else(|| {
                MithrilStakeDistributionServiceError::CouldNotFindStakeDistribution(hash.to_owned())
            })?;

        let certificate = self
            .certificate_client
            .get(&stake_distribution_entity.certificate_id)
            .await
            .with_context(|| {
                format!(
                    "Mithril Stake Distribution Service can not get the certificate for id: '{}'",
                    stake_distribution_entity.certificate_id
                )
            })?
            .ok_or_else(|| {
                MithrilStakeDistributionServiceError::CertificateNotFound(
                    stake_distribution_entity.certificate_id.clone(),
                )
            })?;

        let genesis_verification_key =
            ProtocolGenesisVerificationKey::from_json_hex(genesis_verification_key)
                .with_context(|| {
                    format!("Invalid genesis verification key '{genesis_verification_key}'")
                })
                .map_err(MithrilStakeDistributionServiceError::InvalidParameters)?;
        self.certificate_verifier
            .verify_certificate_chain(
                certificate.clone(),
                self.certificate_client.clone(),
                &ProtocolGenesisVerifier::from_verification_key(genesis_verification_key),
            )
            .await?;

        let avk = self
            .compute_avk_from_mithril_stake_distribution(&stake_distribution_entity.artifact)
            .await
            .with_context(|| {
                format!(
                    "Mithril Stake Distribution Service can not compute avk for artifact hash '{:?}'",
                    stake_distribution_entity.artifact.hash
                )
            })?
            .to_json_hex()
            .with_context(|| "Encoding avk error")?;

        let mut protocol_message = certificate.protocol_message.clone();
        protocol_message
            .set_message_part(ProtocolMessagePartKey::NextAggregateVerificationKey, avk);

        if !self
            .certificate_verifier
            .verify_protocol_message(&protocol_message, &certificate)
        {
            return Err(
                MithrilStakeDistributionServiceError::CouldNotVerifyStakeDistribution {
                    hash: hash.to_owned(),
                    certificate_hash: certificate.hash,
                    context: "Verification failed: messages do not match.".to_string(),
                }
                .into(),
            );
        }

        if !dirpath.is_dir() {
            std::fs::create_dir_all(dirpath)?;
        }
        let filepath = PathBuf::new().join(dirpath).join(format!(
            "mithril_stake_distribution-{}.json",
            stake_distribution_entity.artifact.hash
        ));
        std::fs::write(
            &filepath,
            serde_json::to_string(&stake_distribution_entity.artifact).with_context(|| {
                format!(
                    "Can not serialize stake distribution artifact '{:?}'",
                    stake_distribution_entity.artifact
                )
            })?,
        )?;

        Ok(filepath)
    }
}

#[cfg(test)]
mod tests {
    use chrono::{DateTime, Utc};
    use mithril_common::{
        certificate_chain::MithrilCertificateVerifier,
        crypto_helper::ProtocolGenesisSigner,
        entities::{Epoch, SignerWithStake},
        messages::{
            CertificateMessage, MithrilStakeDistributionListMessage,
            MithrilStakeDistributionMessage, SignerWithStakeMessagePart,
        },
        test_utils::{fake_data, MithrilFixtureBuilder},
    };

    use crate::{
        aggregator_client::MockAggregatorHTTPClient, services::MockCertificateVerifierImpl,
    };

    use super::*;

    fn get_stake_distribution_list_message() -> MithrilStakeDistributionListMessage {
        vec![
            MithrilStakeDistributionListItemMessage::dummy(),
            MithrilStakeDistributionListItemMessage {
                hash: "hash-456".to_string(),
                ..MithrilStakeDistributionListItemMessage::dummy()
            },
        ]
    }

    fn get_stake_distribution_message(
        signers_with_stake: &[SignerWithStake],
    ) -> MithrilStakeDistributionMessage {
        MithrilStakeDistributionMessage {
            epoch: Epoch(1),
            signers_with_stake: SignerWithStakeMessagePart::from_signers(
                signers_with_stake.to_owned(),
            ),
            hash: "hash-123".to_string(),
            certificate_hash: "certificate-hash-123".to_string(),
            created_at: DateTime::<Utc>::default(),
            protocol_parameters: fake_data::protocol_parameters(),
        }
    }

    /// Instantiate a Genesis Signer and its associated Verifier
    pub fn setup_genesis() -> (ProtocolGenesisSigner, ProtocolGenesisVerifier) {
        let genesis_signer = ProtocolGenesisSigner::create_deterministic_genesis_signer();
        let genesis_verifier = genesis_signer.create_genesis_verifier();
        (genesis_signer, genesis_verifier)
    }

    #[tokio::test]
    async fn list_ok() {
        let mut http_client = MockAggregatorHTTPClient::new();
        http_client.expect_get_content().returning(|_| {
            Ok(serde_json::to_string(&get_stake_distribution_list_message()).unwrap())
        });
        let http_client = Arc::new(http_client);
        let service = AppMithrilStakeDistributionService::new(
            Arc::new(MithrilStakeDistributionClient::new(http_client.clone())),
            Arc::new(CertificateClient::new(http_client.clone())),
            Arc::new(MithrilCertificateVerifier::new(slog_scope::logger())),
        );
        let list = service.list().await.unwrap();

        assert_eq!(2, list.len());
    }

    #[tokio::test]
    async fn download_ok() {
        let signers_with_stake = MithrilFixtureBuilder::default()
            .with_signers(2)
            .build()
            .signers_with_stake();
        let stake_distribution_message = get_stake_distribution_message(&signers_with_stake);
        let mut http_client = MockAggregatorHTTPClient::new();
        http_client
            .expect_get_content()
            .returning(move |_| Ok(serde_json::to_string(&stake_distribution_message).unwrap()))
            .times(1);
        http_client
            .expect_get_content()
            .returning(|_| {
                let mut message = CertificateMessage::dummy();
                message.signed_message = message.protocol_message.compute_hash();
                let message = serde_json::to_string(&message).unwrap();

                Ok(message)
            })
            .times(1);
        let http_client = Arc::new(http_client);
        let mut certificate_verifier = MockCertificateVerifierImpl::new();
        certificate_verifier
            .expect_verify_certificate_chain()
            .returning(|_, _, _| Ok(()))
            .times(1);
        certificate_verifier
            .expect_verify_protocol_message()
            .returning(|_, _| true)
            .times(1);
        let service = AppMithrilStakeDistributionService::new(
            Arc::new(MithrilStakeDistributionClient::new(http_client.clone())),
            Arc::new(CertificateClient::new(http_client.clone())),
            Arc::new(certificate_verifier),
        );

        let dirpath = std::env::temp_dir().join("test_download_ok");
        let (_, genesis_verifier) = setup_genesis();
        let genesis_verification_key = genesis_verifier.to_verification_key();
        let filepath = service
            .download(
                "hash-123",
                &dirpath,
                &genesis_verification_key.to_json_hex().unwrap(),
            )
            .await
            .unwrap();

        assert!(filepath.exists());
    }

    #[tokio::test]
    async fn download_ko() {
        let signers_with_stake = MithrilFixtureBuilder::default()
            .with_signers(2)
            .build()
            .signers_with_stake();
        let stake_distribution_message = get_stake_distribution_message(&signers_with_stake);
        let mut http_client = MockAggregatorHTTPClient::new();
        http_client
            .expect_get_content()
            .returning(move |_| Ok(serde_json::to_string(&stake_distribution_message).unwrap()))
            .times(1);
        http_client
            .expect_get_content()
            .returning(|_| {
                let mut message = CertificateMessage::dummy();
                message.signed_message = message.protocol_message.compute_hash();
                let message = serde_json::to_string(&message).unwrap();

                Ok(message)
            })
            .times(1);
        let http_client = Arc::new(http_client);
        let mut certificate_verifier = MockCertificateVerifierImpl::new();
        certificate_verifier
            .expect_verify_certificate_chain()
            .returning(|_, _, _| Ok(()))
            .times(1);
        certificate_verifier
            .expect_verify_protocol_message()
            .returning(|_, _| false)
            .times(1);
        let service = AppMithrilStakeDistributionService::new(
            Arc::new(MithrilStakeDistributionClient::new(http_client.clone())),
            Arc::new(CertificateClient::new(http_client.clone())),
            Arc::new(certificate_verifier),
        );

        let dirpath = std::env::temp_dir().join("test_download_ko");
        let (_, genesis_verifier) = setup_genesis();
        let genesis_verification_key = genesis_verifier.to_verification_key();
        let _error = service
            .download(
                "hash-123",
                &dirpath,
                &genesis_verification_key.to_json_hex().unwrap(),
            )
            .await
            .unwrap_err();
    }

    #[tokio::test]
    async fn expand_eventual_artifact_hash_alias_should_returns_hash() {
        let http_client = MockAggregatorHTTPClient::new();
        let http_client = Arc::new(http_client);
        let service = AppMithrilStakeDistributionService::new(
            Arc::new(MithrilStakeDistributionClient::new(http_client.clone())),
            Arc::new(CertificateClient::new(http_client.clone())),
            Arc::new(MithrilCertificateVerifier::new(slog_scope::logger())),
        );

        let hash = service
            .expand_eventual_artifact_hash_alias("hash-123")
            .await
            .unwrap();

        assert_eq!("hash-123", hash);
    }

    #[tokio::test]
    async fn expand_eventual_artifact_hash_alias_should_returns_latest_lowercase() {
        let mut http_client = MockAggregatorHTTPClient::new();
        http_client.expect_get_content().returning(|_| {
            Ok(serde_json::to_string(&get_stake_distribution_list_message()).unwrap())
        });
        let http_client = Arc::new(http_client);
        let service = AppMithrilStakeDistributionService::new(
            Arc::new(MithrilStakeDistributionClient::new(http_client.clone())),
            Arc::new(CertificateClient::new(http_client.clone())),
            Arc::new(MithrilCertificateVerifier::new(slog_scope::logger())),
        );

        let hash = service
            .expand_eventual_artifact_hash_alias("latest")
            .await
            .unwrap();

        assert_eq!("hash-123", hash);
    }

    #[tokio::test]
    async fn expand_eventual_artifact_hash_alias_should_returns_latest_uppercase() {
        let mut http_client = MockAggregatorHTTPClient::new();
        http_client.expect_get_content().returning(|_| {
            Ok(serde_json::to_string(&get_stake_distribution_list_message()).unwrap())
        });
        let http_client = Arc::new(http_client);
        let service = AppMithrilStakeDistributionService::new(
            Arc::new(MithrilStakeDistributionClient::new(http_client.clone())),
            Arc::new(CertificateClient::new(http_client.clone())),
            Arc::new(MithrilCertificateVerifier::new(slog_scope::logger())),
        );

        let hash = service
            .expand_eventual_artifact_hash_alias("LATEST")
            .await
            .unwrap();

        assert_eq!("hash-123", hash);
    }

    #[tokio::test]
    async fn expand_eventual_artifact_hash_alias_should_error() {
        let mut http_client = MockAggregatorHTTPClient::new();
        http_client
            .expect_get_content()
            .returning(|_| Ok("[]".to_string()));
        let http_client = Arc::new(http_client);
        let service = AppMithrilStakeDistributionService::new(
            Arc::new(MithrilStakeDistributionClient::new(http_client.clone())),
            Arc::new(CertificateClient::new(http_client.clone())),
            Arc::new(MithrilCertificateVerifier::new(slog_scope::logger())),
        );

        let err = service
            .expand_eventual_artifact_hash_alias("latest")
            .await
            .expect_err(
            "expand_eventual_artifact_hash_alias should returns an error if there is no latest.",
        );

        if let Some(e) = err.downcast_ref::<MithrilStakeDistributionServiceError>() {
            match e {
                MithrilStakeDistributionServiceError::CouldNotFindStakeDistribution(hash) => {
                    assert_eq!("latest", hash.as_str());
                }
                _ => panic!(
                    "Wrong error type when Mithril Stake Sistribution could not be found {e:?}."
                ),
            }
        } else {
            panic!(
                    "Expected a MithrilStakeDistributionServiceError when Mithril Stake Sistribution can not be found. Got {err:?}: '{err}'"
                );
        }
    }
}
