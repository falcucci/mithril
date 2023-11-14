#![warn(missing_docs)]

//! Define all the tooling necessary to manipulate Mithril certified types from a
//! [Mithril Aggregator](https://mithril.network/rust-doc/mithril_aggregator/index.html).
//!
//! It handles the different types that can be queried to a Mithril aggregator:
//!
//! - [Snapshot][snapshot_client] list, get and download tarball.
//! - [Mithril stake distribution][mithril_stake_distribution_client] list and get.
//! - [Certificates][certificate_client] list, get, and chain validation.
//!
//! The [Client] aggregates the queries of all of those types.
//!
//! **NOTE:** Snapshot download and Certificate chain validation can take quite some time even with a fast
//! computer and network.
//! For those a feedback mechanism is available, more details on it in the [feedback] submodule.
//!
//! # Example
//!
//! Below is an example describing the usage of most of the library's functions together:
//!
//! ```no_run
//! # async fn run() -> mithril_client::MithrilResult<()> {
//! use mithril_client::{ClientBuilder, MessageBuilder};
//! use std::path::Path;
//!
//! let client = ClientBuilder::aggregator("YOUR_AGGREGATOR_ENDPOINT", "YOUR_GENESIS_VERIFICATION_KEY").build()?;
//!
//! let snapshots = client.snapshot().list().await?;
//!
//! let last_digest = snapshots.first().unwrap().digest.as_ref();
//! let snapshot = client.snapshot().get(last_digest).await?.unwrap();
//!
//! let certificate = client
//!     .certificate()
//!     .verify_chain(&snapshot.certificate_hash)
//!     .await?;
//!
//! // Note: the directory must already exist, and the user running the binary must have read/write access to it.
//! let target_directory = Path::new("/home/user/download/");
//! client
//!     .snapshot()
//!     .download_unpack(&snapshot, &target_directory)
//!     .await?;
//!
//! let message = MessageBuilder::new()
//!     .compute_snapshot_message(&certificate, &target_directory)
//!     .await?;
//!
//! assert!(certificate.match_message(&message));
//! #    Ok(())
//! # }
//! ```

pub mod aggregator_client;
pub mod certificate_client;
mod client;
pub mod feedback;
mod message;
pub mod mithril_stake_distribution_client;
pub mod snapshot_client;
pub mod snapshot_downloader;
mod type_alias;
mod utils;

pub use client::*;
pub use message::*;
pub use type_alias::*;

#[cfg(test)]
pub(crate) mod test_utils {
    use slog::Drain;
    use std::sync::Arc;

    pub fn test_logger() -> slog::Logger {
        let decorator = slog_term::PlainDecorator::new(slog_term::TestStdoutWriter);
        let drain = slog_term::CompactFormat::new(decorator).build().fuse();
        let drain = slog_async::Async::new(drain).build().fuse();
        slog::Logger::root(Arc::new(drain), slog::o!())
    }
}
