use mithril_common::digesters::ImmutableFileObserver;
use mithril_common::entities::SignerWithStake;
use slog::Drain;
use std::{path::PathBuf, sync::Arc, time::Duration};

use mithril_common::crypto_helper::{
    key_encode_hex, tests_setup, ProtocolClerk, ProtocolSingleSignature,
};
use mithril_common::{
    chain_observer::FakeObserver,
    digesters::{DumbImmutableDigester, DumbImmutableFileObserver},
    entities::{Beacon, CertificatePending, Epoch, Signer},
    store::{adapter::MemoryAdapter, StakeStore, StakeStorer},
    BeaconProvider, BeaconProviderImpl,
};

use mithril_signer::{
    Config, DumbCertificateHandler, MithrilSingleSigner, ProtocolInitializerStore,
    ProtocolInitializerStorer, SignerRunner, SignerServices, SignerState, StateMachine,
};

struct StateMachineTester {
    state_machine: StateMachine,
    immutable_observer: Arc<DumbImmutableFileObserver>,
    chain_observer: Arc<FakeObserver>,
    beacon_provider: Arc<BeaconProviderImpl>,
    certificate_handler: Arc<DumbCertificateHandler>,
    protocol_initializer_store: Arc<ProtocolInitializerStore>,
    single_signer: Arc<MithrilSingleSigner>,
    stake_store: Arc<StakeStore>,
    cycle_no: u32,
    next_signers_with_stake: Vec<SignerWithStake>,
}

impl StateMachineTester {
    async fn init() -> Self {
        let config = Config {
            aggregator_endpoint: "http://0.0.0.0:8000".to_string(),
            cardano_cli_path: PathBuf::new(),
            cardano_node_socket_path: PathBuf::new(),
            db_directory: PathBuf::new(),
            network: "devnet".to_string(),
            network_magic: Some(42),
            party_id: "00000000000000000000000000000001".to_string(),
            protocol_initializer_store_directory: PathBuf::new(),
            run_interval: 5000,
            stake_store_directory: PathBuf::new(),
        };

        let immutable_observer = Arc::new(DumbImmutableFileObserver::new());
        immutable_observer.shall_return(Some(1)).await;
        let chain_observer = Arc::new(FakeObserver::new(Some(Beacon {
            epoch: Epoch(1),
            immutable_file_number: 1,
            network: "devnet".to_string(),
        })));
        chain_observer
            .set_signers(
                tests_setup::setup_signers(2)
                    .into_iter()
                    .map(|(party_id, stake, key, _, _)| SignerWithStake {
                        party_id,
                        stake,
                        verification_key: key_encode_hex(key).unwrap(),
                    })
                    .collect(),
            )
            .await;
        let beacon_provider = Arc::new(BeaconProviderImpl::new(
            chain_observer.clone(),
            immutable_observer.clone(),
            config.get_network().unwrap(),
        ));
        let certificate_handler = Arc::new(DumbCertificateHandler::new());
        let digester = Arc::new(DumbImmutableDigester::new("DIGEST", true));
        let protocol_initializer_store = Arc::new(ProtocolInitializerStore::new(Box::new(
            MemoryAdapter::new(None).unwrap(),
        )));
        let single_signer = Arc::new(MithrilSingleSigner::new(config.party_id.clone()));
        let stake_store = Arc::new(StakeStore::new(Box::new(MemoryAdapter::new(None).unwrap())));

        let services = SignerServices {
            beacon_provider: beacon_provider.clone(),
            certificate_handler: certificate_handler.clone(),
            chain_observer: chain_observer.clone(),
            digester: digester.clone(),
            protocol_initializer_store: protocol_initializer_store.clone(),
            single_signer: single_signer.clone(),
            stake_store: stake_store.clone(),
        };

        let runner = Box::new(SignerRunner::new(config, services));

        let state_machine =
            StateMachine::new(SignerState::Unregistered, runner, Duration::from_secs(5));

        StateMachineTester {
            state_machine,
            immutable_observer,
            chain_observer,
            beacon_provider,
            certificate_handler,
            protocol_initializer_store,
            single_signer,
            stake_store,
            cycle_no: 0,
            next_signers_with_stake: Vec::new(),
        }
    }

    async fn cycle(&mut self) -> &mut Self {
        self.cycle_no += 1;
        self.state_machine.cycle().await.expect(&format!(
            "cycling the state machine should not fail, iteration n°{}",
            self.cycle_no
        ));

        self
    }

    async fn cycle_registered(&mut self) -> &mut Self {
        self.cycle().await;
        assert!(self.state_machine.get_state().is_registered());

        self
    }

    async fn cycle_signed(&mut self) -> &mut Self {
        self.cycle().await;
        assert!(self.state_machine.get_state().is_signed());

        self
    }

    async fn cycle_unregistered(&mut self) -> &mut Self {
        self.cycle().await;
        assert!(self.state_machine.get_state().is_unregistered());

        self
    }

    async fn check_protocol_initializer(&mut self, epoch: Epoch) -> &mut Self {
        self.protocol_initializer_store
            .get_protocol_initializer(epoch)
            .await
            .expect("fetching from the protocol initializer store should not fail")
            .expect(&format!(
                "there should be a protocol intializer in store for Epoch {}, here is the last 3 in store: {:?}",
                epoch,
                self.protocol_initializer_store
                    .dump_last_protocol_initializer(2)
                    .await
                    .unwrap(),
            ));

        self
    }

    async fn check_stake_store(&mut self, epoch: Epoch) -> &mut Self {
        self.stake_store
            .get_stakes(epoch)
            .await
            .expect("fetching stake store should not fail")
            .expect(&format!(
                "there should be stake distribution saved for {}, here is the last 3 in the store: {:?}",
                epoch,
                self.stake_store.get_last_stakes(3).await.unwrap(),
            ));

        self
    }

    async fn increase_immutable(&mut self, increment: u64, expected: u64) -> &mut Self {
        let immutable_number = self
            .immutable_observer
            .get_last_immutable_number()
            .await
            .unwrap();
        let new_immutable = immutable_number + increment;
        assert_eq!(expected, new_immutable);
        self.immutable_observer
            .shall_return(Some(new_immutable))
            .await;

        self
    }

    async fn increase_epoch(&mut self, expected: u64) -> &mut Self {
        let new_epoch = self.chain_observer.next_epoch().await.unwrap();
        assert_eq!(expected, new_epoch);

        self
    }

    fn comment(&mut self, comment: &str) -> &mut Self {
        println!("{}", comment);

        self
    }

    async fn generate_new_pending_certificate(&mut self, total_signers: u64) -> &mut Self {
        let mut cert = CertificatePending::default();
        cert.beacon = self.beacon_provider.get_current_beacon().await.unwrap();
        let mut signers: Vec<SignerWithStake> = Vec::new();

        for (party_id, stake, verification_key, _signer, protocol_initializer) in
            tests_setup::setup_signers(total_signers)
        {
            println!("signer id={}, stake={}", party_id, stake);
            let verification_key = key_encode_hex(verification_key).unwrap();
            cert.next_signers.push(Signer {
                party_id: party_id.clone(),
                verification_key: verification_key.clone(),
            });
            cert.protocol_parameters = protocol_initializer.params.into();
            signers.push(SignerWithStake {
                party_id,
                verification_key,
                stake,
            })
        }
        cert.signers = self
            .next_signers_with_stake
            .iter()
            .map(|s| Signer {
                party_id: s.party_id.clone(),
                verification_key: s.verification_key.clone(),
            })
            .collect();
        self.chain_observer
            .set_signers(self.next_signers_with_stake.to_owned())
            .await;
        self.next_signers_with_stake = signers;
        self.certificate_handler
            .set_certificate_pending(Some(cert.clone()))
            .await;

        self
    }
}

#[tokio::test]
async fn test_create_single_signature() {
    let decorator = slog_term::PlainDecorator::new(slog_term::TestStdoutWriter);
    let drain = slog_term::CompactFormat::new(decorator).build().fuse();
    let drain = slog_async::Async::new(drain).build().fuse();
    let _guard = slog_scope::set_global_logger(slog::Logger::root(Arc::new(drain), slog::o!()));

    let mut tester = StateMachineTester::init().await;

    tester
        .comment("1 - the state machine is and remains in UNREGISTERED state until a certificate pending is got")
        .cycle_unregistered().await
        .cycle_unregistered().await
        .comment("increasing immutable files should not change the state")
        .increase_immutable(1, 2).await
        .cycle_unregistered().await
        .comment("changing the epoch should not change the state")
        .increase_epoch(2).await
        .cycle_unregistered().await
        .comment("getting a certificate pending changes the state")
        .generate_new_pending_certificate(5)
        .await
        .cycle_registered()
        .await
        .check_protocol_initializer(Epoch(3))
        .await
        .check_stake_store(Epoch(3))
        .await
        .comment("2 - more cycles, the state machine remains in REGISTERED state")
        .cycle_registered()
        .await
        .comment("changing immutable should not change the state")
        .increase_immutable(1, 3)
        .await
        .cycle_registered()
        .await
        .comment("changing Epoch changes the state → Unregistered")
        .increase_epoch(3)
        .await
        .cycle_unregistered()
        .await
        .comment("creating a new certificate pending with new signers and new beacon")
        .generate_new_pending_certificate(5)
        .await
        .comment("next cycle returns to REGISTERED state")
        .cycle_registered()
        .await
        .check_protocol_initializer(Epoch(4))
        .await
        .check_stake_store(Epoch(4))
        .await
        .comment("3 - since it still cannot be signed, more cycles do not change the state")
        .cycle_registered()
        .await
        .comment("increment immutable, the state should not change")
        .increase_immutable(5, 8)
        .await
        .cycle_registered()
        .await
        .comment("change Epoch one more time")
        .increase_epoch(4)
        .await
        .cycle_unregistered()
        .await
        .generate_new_pending_certificate(5)
        .await
        .cycle_registered()
        .await
        .comment("The signer can now create a single signature");

    println!("STATE = {:?}", tester.state_machine.get_state());
    println!(
        "STAKE STORE = {:?}",
        tester.stake_store.get_last_stakes(5).await.unwrap()
    );
    println!(
        "PRINITIALIZER = {:?}",
        tester
            .protocol_initializer_store
            .dump_last_protocol_initializer(5)
            .await
            .unwrap()
    );

    tester.cycle_signed().await;
}
