use clap::Parser;
use config::{builder::DefaultState, ConfigBuilder};
use libp2p::Multiaddr;
use mithril_common::StdResult;
use slog_scope::error;

use crate::AggregatorRelay;

#[derive(Parser, Debug, Clone)]
pub struct AggregatorCommand {
    /// Peer listening port
    #[clap(long, env = "LISTEN_PORT", default_value_t = 0)]
    listen_port: u16,

    /// Dial to peer multi-address (e.g. /ip4/0.0.0.0/tcp/1234)
    #[clap(long, env = "DIAL_TO")]
    dial_to: Option<Multiaddr>,

    /// Aggregator endpoint URL.
    #[clap(long, env = "AGGREGATOR_ENDPOINT")]
    aggregator_endpoint: String,
}

impl AggregatorCommand {
    /// Main command execution
    pub async fn execute(&self, _config_builder: ConfigBuilder<DefaultState>) -> StdResult<()> {
        let dial_to = self.dial_to.to_owned();
        let addr: Multiaddr = format!("/ip4/0.0.0.0/tcp/{}", self.listen_port).parse()?;
        let aggregator_endpoint = self.aggregator_endpoint.to_owned();

        let mut relay = AggregatorRelay::start(&addr, &aggregator_endpoint).await?;
        if let Some(dial_to_address) = dial_to {
            relay.dial_peer(dial_to_address.clone())?;
        }

        loop {
            if let Err(err) = relay.tick().await {
                error!("RelayAggregator: tick error"; "error" => format!("{err:#?}"));
            }
        }
    }
}
