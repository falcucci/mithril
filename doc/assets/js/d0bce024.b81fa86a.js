"use strict";(self.webpackChunkmithril_doc=self.webpackChunkmithril_doc||[]).push([[901],{9041:e=>{e.exports=JSON.parse('{"pluginId":"default","version":"maintained","label":"Current","banner":null,"badge":true,"noIndex":false,"className":"docs-version-maintained","isLast":true,"docsSidebars":{"docSideBar":[{"type":"link","label":"Welcome","href":"/doc/manual/welcome","docId":"manual/welcome"},{"type":"category","label":"Getting Started","collapsible":true,"collapsed":false,"items":[{"type":"link","label":"Bootstrap a Cardano Node","href":"/doc/manual/getting-started/bootstrap-cardano-node","docId":"manual/getting-started/bootstrap-cardano-node"},{"type":"link","label":"Run a Mithril Signer node (SPO)","href":"/doc/manual/getting-started/run-signer-node","docId":"manual/getting-started/run-signer-node"},{"type":"link","label":"Run a Private Mithril network","href":"/doc/manual/getting-started/run-mithril-devnet","docId":"manual/getting-started/run-mithril-devnet"}],"href":"/doc/category/getting-started"},{"type":"category","label":"Developer Docs","collapsible":true,"collapsed":false,"items":[{"type":"category","label":"Mithril Network Nodes","collapsible":true,"collapsed":false,"items":[{"type":"link","label":"Mithril Aggregator Node","href":"/doc/manual/developer-docs/nodes/mithril-aggregator","docId":"manual/developer-docs/nodes/mithril-aggregator"},{"type":"link","label":"Mithril Signer Node","href":"/doc/manual/developer-docs/nodes/mithril-signer","docId":"manual/developer-docs/nodes/mithril-signer"},{"type":"link","label":"Mithril Client Node","href":"/doc/manual/developer-docs/nodes/mithril-client","docId":"manual/developer-docs/nodes/mithril-client"}],"href":"/doc/category/mithril-network-nodes"},{"type":"link","label":"API Reference","href":"/doc/manual/developer-docs/references","docId":"manual/developer-docs/references"}],"href":"/doc/category/developer-docs"}],"mithrilSideBar":[{"type":"link","label":"Introduction","href":"/doc/mithril/intro","docId":"mithril/intro"},{"type":"category","label":"Mithril Protocol","collapsible":true,"collapsed":false,"items":[{"type":"link","label":"Protocol in depth","href":"/doc/mithril/mithril-protocol/protocol","docId":"mithril/mithril-protocol/protocol"},{"type":"link","label":"Certificate Chain in depth","href":"/doc/mithril/mithril-protocol/certificates","docId":"mithril/mithril-protocol/certificates"},{"type":"link","label":"Simulation","href":"/doc/mithril/mithril-protocol/simulation","docId":"mithril/mithril-protocol/simulation"}],"href":"/doc/category/mithril-protocol"},{"type":"category","label":"Mithril Network","collapsible":true,"collapsed":false,"items":[{"type":"link","label":"Architecture","href":"/doc/mithril/mithril-network/architecture","docId":"mithril/mithril-network/architecture"},{"type":"link","label":"Mithril Aggregator","href":"/doc/mithril/mithril-network/aggregator","docId":"mithril/mithril-network/aggregator"},{"type":"link","label":"Mithril Signer","href":"/doc/mithril/mithril-network/signer","docId":"mithril/mithril-network/signer"},{"type":"link","label":"Mithril Client","href":"/doc/mithril/mithril-network/client","docId":"mithril/mithril-network/client"}],"href":"/doc/category/mithril-network"}]},"docs":{"compiled-binaries":{"id":"compiled-binaries","title":"compiled-binaries","description":"Download compiled binary"},"glossary":{"id":"glossary","title":"Glossary","description":"Here is a comprehensive list of definitions for some common terms used in this guide."},"manual/developer-docs/nodes/mithril-aggregator":{"id":"manual/developer-docs/nodes/mithril-aggregator","title":"Mithril Aggregator Node","description":"This is the node of the Mithril Network responsible for collecting individual signatures from the Mithril Signers and aggregate them into a multi-signature. The Mithril Aggregator uses this ability to provide certified snapshots of the Cardano blockchain.","sidebar":"docSideBar"},"manual/developer-docs/nodes/mithril-client":{"id":"manual/developer-docs/nodes/mithril-client","title":"Mithril Client Node","description":"This is the node of the Mithril Network responsible for restoring the Cardano blockchain on an empty node from a certified snapshot.","sidebar":"docSideBar"},"manual/developer-docs/nodes/mithril-signer":{"id":"manual/developer-docs/nodes/mithril-signer","title":"Mithril Signer Node","description":"This is the node of the Mithril Network responsible for producing individual signatures that are collected and aggregated by the Mithril Aggregator.","sidebar":"docSideBar"},"manual/developer-docs/references":{"id":"manual/developer-docs/references","title":"API Reference","description":"Welcome to the Mithril API references doc!","sidebar":"docSideBar"},"manual/getting-started/bootstrap-cardano-node":{"id":"manual/getting-started/bootstrap-cardano-node","title":"Bootstrap a Cardano Node","description":"Thanks to a Mithril Client connected to a Mithril Aggregator, you will restore a full Cardano node in less than 2 hours!","sidebar":"docSideBar"},"manual/getting-started/run-mithril-devnet":{"id":"manual/getting-started/run-mithril-devnet","title":"Run a Private Mithril network","description":"In this guide, you will learn how to run a demonstration of a Mithril Network working on top of a private devnet Cardano Network. This network is completely autonomous and setup to produce Mithril snapshots every 1 minute.","sidebar":"docSideBar"},"manual/getting-started/run-signer-node":{"id":"manual/getting-started/run-signer-node","title":"Run a Mithril Signer node (SPO)","description":"In this guide, you will learn how to setup a Mithril Signer on top of a Cardano SPO Node for the testnet.","sidebar":"docSideBar"},"manual/welcome":{"id":"manual/welcome","title":"User Manual","description":"Welcome to the Mithril user manual!","sidebar":"docSideBar"},"mithril/intro":{"id":"mithril/intro","title":"About Mithril","description":"Interact with the Mithril Protocol by experiencing with our protocol simulation. This will help you understand how the participants interact to create a multi signature and what\'s the impact of the protocol parameters.","sidebar":"mithrilSideBar"},"mithril/mithril-network/aggregator":{"id":"mithril/mithril-network/aggregator","title":"Mithril Aggregator Node","description":"Welcome to the Mithril Aggregator Node guide!","sidebar":"mithrilSideBar"},"mithril/mithril-network/architecture":{"id":"mithril/mithril-network/architecture","title":"Mithril Network Architecture","description":"Welcome to the Mithril Network Architecture guide!","sidebar":"mithrilSideBar"},"mithril/mithril-network/client":{"id":"mithril/mithril-network/client","title":"Mithril Client Node","description":"Welcome to the Mithril Client Node guide!","sidebar":"mithrilSideBar"},"mithril/mithril-network/signer":{"id":"mithril/mithril-network/signer","title":"Mithril Signer Node","description":"Welcome to the Mithril Signer Node guide!","sidebar":"mithrilSideBar"},"mithril/mithril-protocol/certificates":{"id":"mithril/mithril-protocol/certificates","title":"Mithril Certificate Chain in depth","description":"Introduction","sidebar":"mithrilSideBar"},"mithril/mithril-protocol/protocol":{"id":"mithril/mithril-protocol/protocol","title":"Mithril Protocol in depth","description":"The research paper Mithril: Stake-based Threshold Multisignatures is downloadable here.","sidebar":"mithrilSideBar"},"mithril/mithril-protocol/simulation":{"id":"mithril/mithril-protocol/simulation","title":"Mithril Protocol Simulation","description":"Thanks to this demo you will get a better understanding of the Mithril Protocol*. You will hopefully visualize how the participants interact to create a multi signature and what\'s the impact of the protocol parameters.","sidebar":"mithrilSideBar"},"networks-matrix":{"id":"networks-matrix","title":"networks-matrix","description":"Here is an up to date list of all the Mithril Networks, their configurations and their status:"}}}')}}]);