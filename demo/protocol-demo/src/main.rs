mod demonstrator;
mod types;

use crate::demonstrator::{Demonstrator, ProtocolDemonstrator};
use clap::Parser;
use rand_chacha::ChaCha20Rng;
use rand_core::SeedableRng;

/// Simple demonstration of the Mithril protocol
#[derive(Parser, Debug, PartialEq, Clone, Copy)]
pub struct Config {
  /// Security parameter, upper bound on indices
  #[clap(short, long, default_value_t = 200)]
  m: u64,

  /// Quorum parameter
  #[clap(short, long, default_value_t = 5)]
  k: u64,

  /// f in phi(w) = 1 - (1 - f)^w, where w is the stake of a participant.
  #[clap(long, default_value_t = 0.2)]
  phi_f: f64,

  /// Number of parties
  #[clap(long, default_value_t = 5)]
  nparties: usize,

  /// Number of messages to sign
  #[clap(long, default_value_t = 1)]
  nmessages: usize,
}

fn main() {
  let config = Config::parse();

  println!(">> Launch Mithril protocol demonstrator with configuration: \n{config:#?}");

  //////////////////////
  // establish phase //
  /////////////////////

  println!("\n>> Protocol establish phase");
  let seed = [0u8; 32];
  let mut rng = ChaCha20Rng::from_seed(seed);
  let mut mithril_protocol = Demonstrator::new(&config, &mut rng);
  mithril_protocol.establish();

  //////////////////////////
  // initialization phase //
  /////////////////////////

  println!("\n>> Protocol initialize phase:");
  mithril_protocol.initialize(&mut rng);

  //////////////////////
  // operations phase //
  //////////////////////

  println!("\n>> Protocol issue certificates phase:");
  mithril_protocol.issue_certificates();

  println!("\n>> Protocol verify certificates phase:");
  match mithril_protocol.verify_certificates() {
    Ok(_) => {
      println!("\n>> Congrats, protocol terminated with success!\n")
    }
    Err(err) => {
      println!("\n>> Certificate verification failed: {err}\n")
    }
  }
}
