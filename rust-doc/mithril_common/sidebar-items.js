window.SIDEBAR_ITEMS = {"constant":[["MITHRIL_API_VERSION","Mithril API protocol version this is the same as the one in openapi.yml file. If you want to update this version to reflect changes in the protocol, please also update the entry in the openapi.yml"],["MITHRIL_API_VERSION_HEADER","Mithril API protocol version header name"],["MITHRIL_SIGNER_VERSION_HEADER","Mithril Signer node version header name"]],"enum":[["BeaconProviderError","[BeaconProvider] related errors."],["CardanoNetwork","The Cardano Network that is being targeted"]],"mod":[["certificate_chain","Tools to retrieve, validate the Certificate Chain created by an aggregator"],["chain_observer","Tools to request metadata, like the current epoch or the stake distribution, from the Cardano"],["crypto_helper","Tools and types to abstract the use of the Mithril STM library"],["database","database module. This module contains providers and entities shared between all application types."],["digesters","Tools to compute mithril digest from a Cardano node database."],["entities","The entities used by, and exchanged between, the aggregator, signers and client."],["era","The module used for handling eras"],["messages","Messages module This module aims at providing shared structures for API communications."],["sqlite","SQLite module. This module provides a minimal yet useful Entity framework on top of SQLite with ability to perform any SQL query possible and hydrate results in Rust structs."],["store","Define a generic way to store data with the [Store Adapters][adapter], and the [StakeStorer] to store stakes."],["test_utils","Test utilities"]],"struct":[["BeaconProviderImpl","A [BeaconProvider] using a [ChainObserver] and a [ImmutableFileObserver]."],["MITHRIL_API_VERSION_REQUIREMENT","The [SemVer version requirement][semver::VersionReq] associated with the [MITHRIL_API_VERSION]."]],"trait":[["BeaconProvider","Provide the current [Beacon] of a cardano node."]],"type":[["MagicId","Cardano Network magic identifier"],["StdError","Generic error type"]]};