use crate::http_server::routes::middlewares;
use crate::DependencyContainer;
use std::sync::Arc;
use warp::Filter;

pub fn routes(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    certificate_pending(dependency_manager.clone())
        .or(certificate_certificates(dependency_manager.clone()))
        .or(certificate_certificate_hash(dependency_manager))
}

/// GET /certificate-pending
fn certificate_pending(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    warp::path!("certificate-pending")
        .and(warp::get())
        .and(middlewares::with_certificate_pending_store(
            dependency_manager,
        ))
        .and_then(handlers::certificate_pending)
}

/// GET /certificates
fn certificate_certificates(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    warp::path!("certificates")
        .and(warp::get())
        .and(middlewares::with_http_message_service(dependency_manager))
        .and_then(handlers::certificate_certificates)
}

/// GET /certificate/{certificate_hash}
fn certificate_certificate_hash(
    dependency_manager: Arc<DependencyContainer>,
) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
    warp::path!("certificate" / String)
        .and(warp::get())
        .and(middlewares::with_http_message_service(dependency_manager))
        .and_then(handlers::certificate_certificate_hash)
}

mod handlers {
    use crate::{
        http_server::routes::reply, services::HttpMessageService, CertificatePendingStore,
        ToCertificatePendingMessageAdapter,
    };

    use mithril_common::messages::ToMessageAdapter;
    use slog_scope::{debug, warn};
    use std::convert::Infallible;
    use std::sync::Arc;
    use warp::http::StatusCode;

    pub const LIST_MAX_ITEMS: usize = 20;

    /// Certificate Pending
    pub async fn certificate_pending(
        certificate_pending_store: Arc<CertificatePendingStore>,
    ) -> Result<impl warp::Reply, Infallible> {
        debug!("⇄ HTTP SERVER: certificate_pending");

        match certificate_pending_store.get().await {
            Ok(Some(certificate_pending)) => Ok(reply::json(
                &ToCertificatePendingMessageAdapter::adapt(certificate_pending),
                StatusCode::OK,
            )),
            Ok(None) => Ok(reply::empty(StatusCode::NO_CONTENT)),
            Err(err) => {
                warn!("certificate_pending::error"; "error" => ?err);
                Ok(reply::internal_server_error(err))
            }
        }
    }

    /// List all Certificates
    pub async fn certificate_certificates(
        http_message_service: Arc<dyn HttpMessageService>,
    ) -> Result<impl warp::Reply, Infallible> {
        debug!("⇄ HTTP SERVER: certificate_certificates",);

        match http_message_service
            .get_last_certificates(LIST_MAX_ITEMS)
            .await
        {
            Ok(certificates) => Ok(reply::json(&certificates, StatusCode::OK)),
            Err(err) => {
                warn!("certificate_certificates::error"; "error" => ?err);
                Ok(reply::internal_server_error(err))
            }
        }
    }

    /// Certificate by certificate hash
    pub async fn certificate_certificate_hash(
        certificate_hash: String,
        http_message_service: Arc<dyn HttpMessageService>,
    ) -> Result<impl warp::Reply, Infallible> {
        debug!(
            "⇄ HTTP SERVER: certificate_certificate_hash/{}",
            certificate_hash
        );

        match http_message_service
            .get_certificate(&certificate_hash)
            .await
        {
            Ok(Some(certificate)) => Ok(reply::json(&certificate, StatusCode::OK)),
            Ok(None) => Ok(reply::empty(StatusCode::NOT_FOUND)),
            Err(err) => {
                warn!("certificate_certificate_hash::error"; "error" => ?err);
                Ok(reply::internal_server_error(err))
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use anyhow::anyhow;
    use mithril_common::test_utils::{apispec::APISpec, fake_data};
    use serde_json::Value::Null;
    use warp::{http::Method, test::request};

    use crate::{
        http_server::SERVER_BASE_PATH, initialize_dependencies, services::MockCertifierService,
    };

    use super::*;

    fn setup_router(
        dependency_manager: Arc<DependencyContainer>,
    ) -> impl Filter<Extract = (impl warp::Reply,), Error = warp::Rejection> + Clone {
        let cors = warp::cors()
            .allow_any_origin()
            .allow_headers(vec!["content-type"])
            .allow_methods(vec![Method::GET, Method::POST, Method::OPTIONS]);

        warp::any()
            .and(warp::path(SERVER_BASE_PATH))
            .and(routes(dependency_manager).with(cors))
    }

    #[tokio::test]
    async fn test_certificate_pending_get_ok() {
        let method = Method::GET.as_str();
        let path = "/certificate-pending";
        let dependency_manager = initialize_dependencies().await;

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }

    #[tokio::test]
    async fn test_certificate_pending_get_ok_204() {
        let dependency_manager = initialize_dependencies().await;

        let method = Method::GET.as_str();
        let path = "/certificate-pending";

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }

    #[tokio::test]
    async fn test_certificate_pending_get_ko_500() {
        let method = Method::GET.as_str();
        let path = "/certificate-pending";
        let dependency_manager = initialize_dependencies().await;

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }

    #[tokio::test]
    async fn test_certificate_certificates_get_ok() {
        let dependency_manager = initialize_dependencies().await;
        dependency_manager
            .certificate_repository
            .create_certificate(fake_data::genesis_certificate("{certificate_hash}"))
            .await
            .expect("certificate store save should have succeeded");

        let method = Method::GET.as_str();
        let path = "/certificates";

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }

    #[tokio::test]
    async fn test_certificate_certificates_get_ko() {
        let mut dependency_manager = initialize_dependencies().await;
        let mut certifier_service = MockCertifierService::new();
        certifier_service
            .expect_get_latest_certificates()
            .returning(|_| Err(anyhow!("an error")));
        dependency_manager.certifier_service = Arc::new(certifier_service);

        let method = Method::GET.as_str();
        let path = "/certificates";

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }

    #[tokio::test]
    async fn test_certificate_certificate_hash_get_ok() {
        let dependency_manager = initialize_dependencies().await;
        dependency_manager
            .certificate_repository
            .create_certificate(fake_data::genesis_certificate("{certificate_hash}"))
            .await
            .expect("certificate store save should have succeeded");

        let method = Method::GET.as_str();
        let path = "/certificate/{certificate_hash}";

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }

    #[tokio::test]
    async fn test_certificate_certificate_hash_get_ok_404() {
        let dependency_manager = initialize_dependencies().await;

        let method = Method::GET.as_str();
        let path = "/certificate/{certificate_hash}";

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }

    #[tokio::test]
    async fn test_certificate_certificate_hash_get_ko() {
        let mut dependency_manager = initialize_dependencies().await;
        let mut certifier_service = MockCertifierService::new();
        certifier_service
            .expect_get_certificate_by_hash()
            .returning(|_| Err(anyhow!("an error")));
        dependency_manager.certifier_service = Arc::new(certifier_service);

        let method = Method::GET.as_str();
        let path = "/certificate/{certificate_hash}";

        let response = request()
            .method(method)
            .path(&format!("/{SERVER_BASE_PATH}{path}"))
            .reply(&setup_router(Arc::new(dependency_manager)))
            .await;

        APISpec::verify_conformity(
            APISpec::get_all_spec_files(),
            method,
            path,
            "application/json",
            &Null,
            &response,
        );
    }
}
