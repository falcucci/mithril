//! Tools to compute mithril digest from a Cardano node database.

#[cfg(feature = "no_wasm")]
pub mod cache;
#[cfg(feature = "no_wasm")]
mod cardano_immutable_digester;
mod dumb_immutable_observer;
mod dummy_immutable_db_builder;
mod immutable_digester;
mod immutable_file;
mod immutable_file_observer;

#[cfg(feature = "no_wasm")]
pub use cardano_immutable_digester::CardanoImmutableDigester;
pub use immutable_digester::{ImmutableDigester, ImmutableDigesterError};
pub use immutable_file::{ImmutableFile, ImmutableFileCreationError, ImmutableFileListingError};
pub use immutable_file_observer::{
    DumbImmutableFileObserver, ImmutableFileObserver, ImmutableFileObserverError,
    ImmutableFileSystemObserver,
};

pub use dumb_immutable_observer::DumbImmutableDigester;
pub use dummy_immutable_db_builder::{DummyImmutableDb, DummyImmutablesDbBuilder};
