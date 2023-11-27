use anyhow::{anyhow, Context};
use clap::Parser;
use slog::{o, Drain, Level, Logger};
use slog_scope::{crit, debug};
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tokio::{
    signal::unix::{signal, SignalKind},
    task::JoinSet,
};

use mithril_common::StdResult;
use mithril_signer::{
    Configuration, DefaultConfiguration, ProductionServiceBuilder, ServiceBuilder, SignerRunner,
    SignerState, StateMachine,
};

/// CLI args
#[derive(Parser)]
#[clap(name = "mithril-signer")]
#[clap(about = "An implementation of a Mithril Signer", long_about = None)]
#[command(version)]
pub struct Args {
    /// Run Mode
    #[clap(short, long, env("RUN_MODE"), default_value = "dev")]
    run_mode: String,

    /// Verbosity level
    #[clap(
        short,
        long,
        action = clap::ArgAction::Count,
        help = "Verbosity level, add more v to increase"
    )]
    verbose: u8,

    /// Configuration file location
    #[clap(
        short,
        long,
        default_value = "./config",
        help = "Directory where the configuration file is located"
    )]
    configuration_dir: PathBuf,

    /// Disable immutables digests cache.
    #[clap(long)]
    disable_digests_cache: bool,

    /// If set the existing immutables digests cache will be reset.
    ///
    /// Will be ignored if set in conjunction with `--disable-digests-cache`.
    #[clap(long)]
    reset_digests_cache: bool,
}

impl Args {
    fn log_level(&self) -> Level {
        match self.verbose {
            0 => Level::Warning,
            1 => Level::Info,
            2 => Level::Debug,
            _ => Level::Trace,
        }
    }
}

fn build_logger(min_level: Level) -> Logger {
    let drain = slog_bunyan::new(std::io::stdout())
        .set_pretty(false)
        .build()
        .fuse();
    let drain = slog::LevelFilter::new(drain, min_level).fuse();
    let drain = slog_async::Async::new(drain).build().fuse();

    Logger::root(Arc::new(drain), o!())
}

#[tokio::main]
async fn main() -> StdResult<()> {
    // Load args
    let args = Args::parse();
    let _guard = slog_scope::set_global_logger(build_logger(args.log_level()));

    #[cfg(feature = "bundle_openssl")]
    openssl_probe::init_ssl_cert_env_vars();

    debug!("Starting"; "node_version" => env!("CARGO_PKG_VERSION"));

    // Load config
    let config: Configuration = config::Config::builder()
        .set_default("disable_digests_cache", args.disable_digests_cache)
        .with_context(|| "configuration error: could not set `disable_digests_cache`")?
        .set_default("reset_digests_cache", args.reset_digests_cache)
        .with_context(|| "configuration error: could not set `reset_digests_cache`")?
        .add_source(DefaultConfiguration::default())
        .add_source(
            config::File::with_name(&format!(
                "{}/{}.json",
                args.configuration_dir.display(),
                args.run_mode
            ))
            .required(false),
        )
        .add_source(config::Environment::default())
        .build()
        .with_context(|| "configuration build error")?
        .try_deserialize()
        .with_context(|| "configuration deserialize error")?;

    let services = ProductionServiceBuilder::new(&config)
        .build()
        .await
        .with_context(|| "services initialization error")?;

    debug!("Started"; "run_mode" => &args.run_mode, "config" => format!("{config:?}"));
    let state_machine = StateMachine::new(
        SignerState::Init,
        Box::new(SignerRunner::new(config.clone(), services)),
        Duration::from_millis(config.run_interval),
    );

    let mut join_set = JoinSet::new();
    join_set.spawn(async move {
        state_machine
            .run()
            .await
            .map_err(|e| anyhow!(e))
            .map(|_| None)
    });

    join_set.spawn(async {
        tokio::signal::ctrl_c()
            .await
            .map_err(|e| anyhow!(e))
            .map(|_| Some("Received Ctrl+C".to_string()))
    });

    join_set.spawn(async move {
        let mut sigterm = signal(SignalKind::terminate()).expect("Failed to create SIGTERM signal");
        sigterm
            .recv()
            .await
            .ok_or(anyhow!("Failed to receive SIGTERM"))
            .map(|_| Some("Received SIGTERM".to_string()))
    });

    join_set.spawn(async move {
        let mut sigterm = signal(SignalKind::quit()).expect("Failed to create SIGQUIT signal");
        sigterm
            .recv()
            .await
            .ok_or(anyhow!("Failed to receive SIGQUIT"))
            .map(|_| Some("Received SIGQUIT".to_string()))
    });

    let shutdown_reason = match join_set.join_next().await {
        Some(Err(e)) => {
            crit!("A critical error occurred: {e:?}");
            None
        }
        Some(Ok(res)) => res?,
        None => None,
    };

    join_set.shutdown().await;

    debug!("Stopping"; "shutdown_reason" => shutdown_reason);

    Ok(())
}
