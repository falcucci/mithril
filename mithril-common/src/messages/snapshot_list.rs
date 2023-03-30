use serde::{Deserialize, Serialize};

use crate::entities::Beacon;

use crate::entities::Epoch;

/// Message structure of a snapshot list
pub type SnapshotListMessage = Vec<SnapshotListItemMessage>;

/// Message structure of a snapshot list item
#[derive(Clone, Debug, PartialEq, Eq, Default, Serialize, Deserialize)]
pub struct SnapshotListItemMessage {
    /// Digest that is signed by the signer participants
    pub digest: String,

    /// Mithril beacon on the Cardano chain
    pub beacon: Beacon,

    /// Hash of the associated certificate
    pub certificate_hash: String,

    /// Size of the snapshot file in Bytes
    pub size: u64,

    /// Date and time at which the snapshot was created
    pub created_at: String,

    /// Locations where the binary content of the snapshot can be retrieved
    pub locations: Vec<String>,
}

impl SnapshotListItemMessage {
    /// Return a dummy test entity (test-only).
    pub fn dummy() -> Self {
        Self {
            digest: "0b9f5ad7f33cc523775c82249294eb8a1541d54f08eb3107cafc5638403ec7c6".to_string(),
            beacon: Beacon {
                network: "preview".to_string(),
                epoch: Epoch(86),
                immutable_file_number: 1728,
            },
            certificate_hash: "d5daf6c03ace4a9c074e951844075b9b373bafc4e039160e3e2af01823e9abfb"
                .to_string(),
            size: 807803196,
            created_at: "2023-01-19T13:43:05.618857482Z".to_string(),
            locations: vec!["https://host/certificate.tar.gz".to_string()],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn golden_message() -> SnapshotListMessage {
        vec![SnapshotListItemMessage {
            digest: "0b9f5ad7f33cc523775c82249294eb8a1541d54f08eb3107cafc5638403ec7c6".to_string(),
            beacon: Beacon {
                network: "preview".to_string(),
                epoch: Epoch(86),
                immutable_file_number: 1728,
            },
            certificate_hash: "d5daf6c03ace4a9c074e951844075b9b373bafc4e039160e3e2af01823e9abfb"
                .to_string(),
            size: 807803196,
            created_at: "2023-01-19T13:43:05.618857482Z".to_string(),
            locations: vec!["https://host/certificate.tar.gz".to_string()],
        }]
    }

    // Test the retro compatibility with possible future upgrades.
    #[test]
    fn test_v1() {
        let json = r#"[{
"digest": "0b9f5ad7f33cc523775c82249294eb8a1541d54f08eb3107cafc5638403ec7c6",
"beacon": {
  "network": "preview",
  "epoch": 86,
  "immutable_file_number": 1728
},
"certificate_hash": "d5daf6c03ace4a9c074e951844075b9b373bafc4e039160e3e2af01823e9abfb",
"size": 807803196,
"created_at": "2023-01-19T13:43:05.618857482Z",
"locations": [
  "https://host/certificate.tar.gz"
]
}]"#;
        let message: SnapshotListMessage = serde_json::from_str(json).expect(
            "This JSON is expected to be succesfully parsed into a SnapshotListMessage instance.",
        );

        assert_eq!(golden_message(), message);
    }
}
