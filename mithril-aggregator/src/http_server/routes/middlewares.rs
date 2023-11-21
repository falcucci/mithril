use crate::{
    database::provider::SignerGetter,
    dependency_injection::EpochServiceWrapper,
    event_store::{EventMessage, TransmitterService},
    services::{CertifierService, HttpMessageService, SignedEntityService, TickerService},
    CertificatePendingStore, Configuration, DependencyContainer, SignerRegisterer,
    VerificationKeyStorer,
};

use mithril_common::{api_version::APIVersionProvider, BeaconProvider};
use std::convert::Infallible;
use std::sync::Arc;
use warp::Filter;

/// With certificate pending store
pub(crate) fn with_certificate_pending_store(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<CertificatePendingStore>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.certificate_pending_store.clone())
}

/// With signer registerer middleware
pub fn with_signer_registerer(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn SignerRegisterer>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.signer_registerer.clone())
}

/// With signer getter middleware
pub fn with_signer_getter(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn SignerGetter>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.signer_getter.clone())
}

/// With config middleware
pub fn with_config(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Configuration,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.config.clone())
}

/// With Event transmitter middleware
pub fn with_event_transmitter(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<TransmitterService<EventMessage>>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.event_transmitter.clone())
}

/// With round_opener middleware
pub fn with_beacon_provider(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn BeaconProvider>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.beacon_provider.clone())
}

/// With certifier service middleware
pub fn with_certifier_service(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn CertifierService>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.certifier_service.clone())
}

/// With ticker service middleware
pub fn with_ticker_service(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn TickerService>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.ticker_service.clone())
}

/// With epoch service middleware
pub fn with_epoch_service(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (EpochServiceWrapper,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.epoch_service.clone())
}

/// With signed entity service
pub fn with_signed_entity_service(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn SignedEntityService>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.signed_entity_service.clone())
}

/// With verification key store
pub fn with_verification_key_store(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn VerificationKeyStorer>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.verification_key_store.clone())
}

/// With API version provider
pub fn with_api_version_provider(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<APIVersionProvider>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.api_version_provider.clone())
}

/// With Message service
pub fn with_http_message_service(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (Arc<dyn HttpMessageService>,), Error = Infallible> + Clone {
    warp::any().map(move || dependency_manager.http_message_service.clone())
}
