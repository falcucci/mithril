#!/usr/bin/env bash

set -e
#set -x

# This script sets up a cluster that starts out in Byron, and can transition to Mary.
#
# The script generates all the files needed for the setup, and prints commands
# to be run manually (to start the nodes, post transactions, etc.).
#
# There are three ways of triggering the transition to Shelley:
# 1. Trigger transition at protocol version 2.0.0 (as on mainnet)
#    The system starts at 0.0.0, and we can only increase it by 1 in the major
#    version, so this does require to
#    a) post an update proposal and votes to transition to 1.0.0
#    b) wait for the protocol to change (end of the epoch, or end of the last
#      epoch if it's posted near the end of the epoch)
#    c) change configuration.yaml to have 'LastKnownBlockVersion-Major: 2',
#      and restart the nodes
#    d) post an update proposal and votes to transition to 2.0.0
#    This is what will happen on the mainnet, so it's vital to test this, but
#    it does contain some manual steps.
# 2. Trigger transition at protocol version 2.0.0
#    For testing purposes, we can also modify the system to do the transition to
#    Shelley at protocol version 1.0.0, by uncommenting the line containing
#    'TestShelleyHardForkAtVersion' below. Then, we just need to execute step a)
#    above in order to trigger the transition.
#    This is still close to the procedure on the mainnet, and requires less
#    manual steps.
# 3. Schedule transition in the configuration
#    To do this, uncomment the line containing 'TestShelleyHardForkAtEpoch'
#    below. It's good for a quick test, and does not rely on posting update
#    proposals to the chain.
#    This is quite convenient, but it does not test that we can do the
#    transition by posting update proposals to the network.
#

ROOT=$1
NUM_BFT_NODES=$2
NUM_POOL_NODES=$3
SLOT_LENGTH=$4
EPOCH_LENGTH=$5

if [[ "$SKIP_CARDANO_BIN_DOWNLOAD" = "true" ]]; then
  SKIP_CARDANO_BIN_DOWNLOAD=true
else
  SKIP_CARDANO_BIN_DOWNLOAD=false
fi

SUPPLY=100000000000
NETWORK_MAGIC=42
SECURITY_PARAM=2

NODE_PORT_START=3000
NODE_ADDR_PREFIX="172.16.238"
NODE_ADDR_INCREMENT=10
CARDANO_NODE_VERSION="8.1.2"
CARDANO_BINARY_URL="https://github.com/input-output-hk/cardano-node/releases/download/${CARDANO_NODE_VERSION}/cardano-node-${CARDANO_NODE_VERSION}-linux.tar.gz"
ALONZO_GENESIS_URL="https://book.world.dev.cardano.org/environments/private/alonzo-genesis.json"
CONWAY_GENESIS_URL="https://book.world.dev.cardano.org/environments/private/conway-genesis.json"

GENESIS_VERIFICATION_KEY=5b33322c3235332c3138362c3230312c3137372c31312c3131372c3133352c3138372c3136372c3138312c3138382c32322c35392c3230362c3130352c3233312c3135302c3231352c33302c37382c3231322c37362c31362c3235322c3138302c37322c3133342c3133372c3234372c3136312c36385d
GENESIS_SECRET_KEY=5b3131382c3138342c3232342c3137332c3136302c3234312c36312c3134342c36342c39332c3130362c3232392c38332c3133342c3138392c34302c3138392c3231302c32352c3138342c3136302c3134312c3233372c32362c3136382c35342c3233392c3230342c3133392c3131392c31332c3139395d

BFT_NODES=()
BFT_NODES_N=()
for (( i=1; i<=${NUM_BFT_NODES}; i++ ))
  do
    BFT_NODES=("${BFT_NODES[@]}" "node-bft${i}")
    BFT_NODES_N=("${BFT_NODES_N[@]}" "${i}")
done
BFT_NODES=${BFT_NODES[@]}
BFT_NODES_N=${BFT_NODES_N[@]}

POOL_NODES=()
POOL_NODES_N=()
UTXO_ADDRS=()
USER_ADDRS=()
POOL_ADDRS=()
for (( i=1; i<=${NUM_POOL_NODES}; i++ ))
  do
    POOL_NODES=("${POOL_NODES[@]}" "node-pool${i}")
    POOL_NODES_N=("${POOL_NODES_N[@]}" "${i}")
    UTXO_ADDRS=("${UTXO_ADDRS[@]}" "utxo${i}")
    USER_ADDRS=("${USER_ADDRS[@]}" "user${i}")
    POOL_ADDRS=("${POOL_ADDRS[@]}" "pool-owner${i}")
done
POOL_NODES=${POOL_NODES[@]}
POOL_NODES_N=${POOL_NODES_N[@]}
UTXO_ADDRS=${UTXO_ADDRS[@]}
USER_ADDRS=${USER_ADDRS[@]}
POOL_ADDRS=${POOL_ADDRS[@]}

ALL_NODES="${BFT_NODES} ${POOL_NODES}"

INIT_SUPPLY=$(( SUPPLY+2000000 ))
FUNDS_PER_GENESIS_ADDRESS=$((${INIT_SUPPLY} / ${NUM_BFT_NODES}))
FUNDS_PER_BYRON_ADDRESS=$((${FUNDS_PER_GENESIS_ADDRESS} - 1000000))
# We need to allow for a fee to transfer the funds out of the genesis.
# We don't care too much, 1 ada is more than enough.

OS=$(uname -s) DATE=
case $OS in
  Darwin )       DATE="gdate";;
  * )            DATE="date";;
esac

START_TIME="$(${DATE} -d "now + 30 seconds" +%s)"

if ! mkdir -p "${ROOT}"; then
  echo "The ${ROOT} directory already exists, please move or remove it"
  exit
fi

# download cardano-cli & cardano-node if enabled (default: yes)
if [ "$SKIP_CARDANO_BIN_DOWNLOAD" = false ]; then
  curl -sL ${CARDANO_BINARY_URL} --output cardano-bin.tar.gz
  tar xzf cardano-bin.tar.gz ./cardano-cli ./cardano-node 
  rm -f cardano-bin.tar.gz
fi

# and copy cardano-cli & cardano-node
cp cardano-cli ${ROOT}/cardano-cli
cp cardano-node ${ROOT}/cardano-node

# copy and tweak the configuration
cp configuration.yaml ${ROOT}/
sed -i ${ROOT}/configuration.yaml \
    -e 's/Protocol: RealPBFT/Protocol: Cardano\nPBftSignatureThreshold: 0.6/' \
    -e 's/minSeverity: Info/minSeverity: Info/' \
    -e 's/TracingVerbosity: NormalVerbosity/TracingVerbosity: MinimalVerbosity/' \
    -e 's/TurnOnLogMetrics: True/TurnOnLogMetrics: False/' \
    -e 's|GenesisFile: genesis.json|ByronGenesisFile: byron/genesis.json|' \
    -e '/ByronGenesisFile/ aConwayGenesisFile: shelley/genesis.conway.json' \
    -e '/ByronGenesisFile/ aAlonzoGenesisFile: shelley/genesis.alonzo.json' \
    -e '/ByronGenesisFile/ aShelleyGenesisFile: shelley/genesis.json' \
    -e 's/RequiresNoMagic/RequiresMagic/' \
    -e 's/LastKnownBlockVersion-Major: 0/LastKnownBlockVersion-Major: 8/' \
    -e 's/LastKnownBlockVersion-Minor: 2/LastKnownBlockVersion-Minor: 0/' \
    -e 's/LastKnownBlockVersion-Alt: 0/LastKnownBlockVersion-Alt: 0/'
# Options for making it easier to trigger the transition to Shelley
# If neither of those are used, we have to
# - post an update proposal + votes to go to protocol version 1
# - after that's activated, change the configuration to have
#   'LastKnownBlockVersion-Major: 2', and restart the nodes
# - post another proposal + vote to go to protocol version 2

#uncomment this for an automatic transition after the first epoch
echo "TestShelleyHardForkAtEpoch: 0" >> ${ROOT}/configuration.yaml
echo "TestAllegraHardForkAtEpoch: 0" >> ${ROOT}/configuration.yaml
echo "TestMaryHardForkAtEpoch: 0" >> ${ROOT}/configuration.yaml
echo "TestAlonzoHardForkAtEpoch: 0" >> ${ROOT}/configuration.yaml
echo "ExperimentalHardForksEnabled: True" >> ${ROOT}/configuration.yaml
echo "ExperimentalProtocolsEnabled: True" >> ${ROOT}/configuration.yaml

#uncomment this to trigger the hardfork with protocol version 1
#echo "TestShelleyHardForkAtVersion: 1"  >> ${ROOT}/configuration.yaml


pushd ${ROOT}

# create the node directories
for NODE in ${ALL_NODES}; do

  mkdir ${NODE} ${NODE}/byron ${NODE}/shelley ${NODE}/ipc ${NODE}/tx

done

# create the configuration files
for NODE in ${ALL_NODES}; do

  cp configuration.yaml ${NODE}/configuration.yaml

done

# create the topology files
NODE_PORT=NODE_PORT_START
TOPOLOGY='{"Producers": []}'
TOPOLOGY_DOCKER=$TOPOLOGY
for NODE in ${ALL_NODES}; do

  NODE_PORT=$(( ${NODE_PORT} + 1))
  echo ${NODE_PORT} > ${NODE}/port
  NODE_ADDR="0.0.0.0"
  TOPOLOGY=$(echo ${TOPOLOGY} | jq '.Producers[.Producers| length] |= . + {"addr": "'${NODE_ADDR}'","port": '${NODE_PORT}', "valency": 1}')
  NODE_ADDR_DOCKER="${NODE_ADDR_PREFIX}.${NODE_ADDR_INCREMENT}"
  NODE_ADDR_INCREMENT=$(( ${NODE_ADDR_INCREMENT} + 10))
  echo ${NODE_ADDR_DOCKER} > ${NODE}/host
  TOPOLOGY_DOCKER=$(echo ${TOPOLOGY_DOCKER} | jq '.Producers[.Producers| length] |= . + {"addr": "'${NODE_ADDR_DOCKER}'","port": '3001', "valency": 1}')

done
echo $TOPOLOGY | jq . > topology.json
echo $TOPOLOGY_DOCKER | jq . > topology.docker.json

NODE_IX=0
for NODE in ${ALL_NODES}; do

  cat topology.json |  jq '.Producers |= del(.['${NODE_IX}'])' > ${NODE}/topology.json
  cat topology.docker.json |  jq '.Producers |= del(.['${NODE_IX}'])' > ${NODE}/topology.docker.json
  NODE_IX=$(( ${NODE_IX} + 1))

done
rm topology.docker.json

# Byron setup
cat > byron.genesis.spec.json <<EOF
{
  "heavyDelThd":     "300000000000",
  "maxBlockSize":    "2000000",
  "maxTxSize":       "4096",
  "maxHeaderSize":   "2000000",
  "maxProposalSize": "700",
  "mpcThd": "20000000000000",
  "scriptVersion": 0,
  "slotDuration": "1000",
  "softforkRule": {
    "initThd": "900000000000000",
    "minThd": "600000000000000",
    "thdDecrement": "50000000000000"
  },
  "txFeePolicy": {
    "multiplier": "43946000000",
    "summand": "155381000000000"
  },
  "unlockStakeEpoch": "18446744073709551615",
  "updateImplicit": "10000",
  "updateProposalThd": "100000000000000",
  "updateVoteThd": "1000000000000"
}
EOF

./cardano-cli byron genesis genesis \
  --protocol-magic ${NETWORK_MAGIC} \
  --start-time ${START_TIME} \
  --k ${SECURITY_PARAM} \
  --n-poor-addresses 0 \
  --n-delegate-addresses ${NUM_BFT_NODES} \
  --total-balance ${INIT_SUPPLY} \
  --delegate-share 1 \
  --avvm-entry-count 0 \
  --avvm-entry-balance 0 \
  --protocol-parameters-file byron.genesis.spec.json \
  --genesis-output-dir byron

mv byron.genesis.spec.json byron/genesis.spec.json

# Copy the genesis files
for NODE in ${ALL_NODES}; do

  cp byron/genesis*.json     ${NODE}/byron/

done

# Copy the BFT operator keys from the genesis delegates, for uniformity
for N in ${BFT_NODES_N}; do

  cp byron/delegate-keys.00$((${N} - 1)).key     node-bft${N}/byron/delegate.key
  cp byron/delegation-cert.00$((${N} - 1)).json  node-bft${N}/byron/delegate.cert

done

# Create keys, addresses and transactions to withdraw the initial UTxO into
# regular addresses.
for N in ${BFT_NODES_N}; do

  ./cardano-cli byron key keygen \
    --secret byron/payment-keys.00$((${N} - 1)).key \

  ./cardano-cli byron key signing-key-address \
    --testnet-magic ${NETWORK_MAGIC} \
    --secret byron/payment-keys.00$((${N} - 1)).key > byron/address-00$((${N} - 1))

  ./cardano-cli byron key signing-key-address \
    --testnet-magic ${NETWORK_MAGIC} \
    --secret byron/genesis-keys.00$((${N} - 1)).key > byron/genesis-address-00$((${N} - 1))
done

# Update Proposal and votes
./cardano-cli byron governance create-update-proposal \
            --filepath byron/update-proposal \
            --testnet-magic ${NETWORK_MAGIC} \
            --signing-key byron/delegate-keys.000.key \
            --protocol-version-major 1 \
            --protocol-version-minor 0 \
            --protocol-version-alt 0 \
            --application-name "cardano-sl" \
            --software-version-num 1 \
            --system-tag "linux" \
            --installer-hash 0

for N in ${BFT_NODES_N}; do
    ./cardano-cli byron governance create-proposal-vote \
                --proposal-filepath byron/update-proposal \
                --testnet-magic ${NETWORK_MAGIC} \
                --signing-key byron/delegate-keys.00$((${N} - 1)).key \
                --vote-yes \
                --output-filepath byron/update-vote.00$((${N} - 1))
done

./cardano-cli byron governance create-update-proposal \
            --filepath byron/update-proposal-1 \
            --testnet-magic ${NETWORK_MAGIC} \
            --signing-key byron/delegate-keys.000.key \
            --protocol-version-major 2 \
            --protocol-version-minor 0 \
            --protocol-version-alt 0 \
            --application-name "cardano-sl" \
            --software-version-num 1 \
            --system-tag "linux" \
            --installer-hash 0

for N in ${BFT_NODES_N}; do
    ./cardano-cli byron governance create-proposal-vote \
                --proposal-filepath byron/update-proposal-1 \
                --testnet-magic ${NETWORK_MAGIC} \
                --signing-key byron/delegate-keys.00$((${N} - 1)).key \
                --vote-yes \
                --output-filepath byron/update-vote-1.00$((${N} - 1))
done

echo "====================================================================="
echo "Generated genesis keys and genesis files:"
echo
ls -1 byron/*
echo "====================================================================="


# Shelley era. Set up our template
mkdir shelley
curl -s ${ALONZO_GENESIS_URL} -o shelley/genesis.alonzo.spec.json
curl -s ${CONWAY_GENESIS_URL} -o shelley/genesis.conway.spec.json
# Fix the error that crashes the startup of the devnet: 
# `Command failed: genesis create  Error: Error while decoding Shelley genesis at: shelley/genesis.conway.spec.json Error: Error in $: key "genDelegs" not found`
# The error is due to a missing field 'genDelegs' in the genesis configuration file downloaded. This fix adds it manually after the download.
mv shelley/genesis.conway.spec.json shelley/genesis.conway.spec.json.tmp && cat shelley/genesis.conway.spec.json.tmp | jq '. += {"genDelegs":{}}' > shelley/genesis.conway.spec.json && rm shelley/genesis.conway.spec.json.tmp
./cardano-cli genesis create --testnet-magic ${NETWORK_MAGIC} --genesis-dir shelley --start-time $(date -u +%Y-%m-%dT%H:%M:%SZ)
mv shelley/genesis.spec.json shelley/genesis.spec.json.tmp && cat shelley/genesis.spec.json.tmp | jq . > shelley/genesis.spec.json && rm shelley/genesis.spec.json.tmp

# Then edit the genesis.spec.json ...

# We're going to use really quick epochs (300 seconds), by using short slots 0.2s
# and K=10, but we'll keep long KES periods so we don't have to bother
# cycling KES keys
sed -i shelley/genesis.spec.json \
    -e 's/"slotLength": 1/"slotLength": '${SLOT_LENGTH}'/' \
    -e 's/"activeSlotsCoeff": 5.0e-2/"activeSlotsCoeff": 0.50/' \
    -e 's/"securityParam": 2160/"securityParam": '${SECURITY_PARAM}'/' \
    -e 's/"epochLength": 432000/"epochLength": '${EPOCH_LENGTH}'/' \
    -e 's/"maxLovelaceSupply": 0/"maxLovelaceSupply": 1000000000/' \
    -e 's/"decentralisationParam": 1.0/"decentralisationParam": 0.7/' \
    -e 's/"major": 0/"major": 4/' \
    -e 's/"updateQuorum": 5/"updateQuorum": 2/'

# Now generate for real:

./cardano-cli genesis create \
    --testnet-magic ${NETWORK_MAGIC} \
    --genesis-dir shelley/ \
    --gen-genesis-keys ${NUM_BFT_NODES} \
    --gen-utxo-keys ${NUM_POOL_NODES}

echo "====================================================================="
echo "Generated genesis keys and genesis files:"
echo
ls -1 shelley/*
echo "====================================================================="

echo "Generated genesis.json:"
echo
cat shelley/genesis.json
echo
echo "====================================================================="

# Copy the genesis files
for NODE in ${ALL_NODES}; do

  cp shelley/genesis*.json     ${NODE}/shelley/

done

# Make the pool operator cold keys
# This was done already for the BFT nodes as part of the genesis creation

for NODE in ${POOL_NODES}; do

  ./cardano-cli node key-gen \
      --cold-verification-key-file                 ${NODE}/shelley/operator.vkey \
      --cold-signing-key-file                      ${NODE}/shelley/operator.skey \
      --operational-certificate-issue-counter-file ${NODE}/shelley/operator.counter

  ./cardano-cli node key-gen-VRF \
      --verification-key-file ${NODE}/shelley/vrf.vkey \
      --signing-key-file      ${NODE}/shelley/vrf.skey

done

# Copy the BFT operator keys from the genesis delegates, for uniformity

for N in ${BFT_NODES_N}; do

  cp shelley/delegate-keys/delegate${N}.skey node-bft${N}/shelley/operator.skey
  cp shelley/delegate-keys/delegate${N}.vkey node-bft${N}/shelley/operator.vkey
  cp shelley/delegate-keys/delegate${N}.counter node-bft${N}/shelley/operator.counter
  cp shelley/delegate-keys/delegate${N}.vrf.vkey node-bft${N}/shelley/vrf.vkey
  cp shelley/delegate-keys/delegate${N}.vrf.skey node-bft${N}/shelley/vrf.skey

done


# Make hot keys and for all nodes

for NODE in ${ALL_NODES}; do

  ./cardano-cli node key-gen-KES \
      --verification-key-file ${NODE}/shelley/kes.vkey \
      --signing-key-file      ${NODE}/shelley/kes.skey

  ./cardano-cli node issue-op-cert \
      --kes-period 0 \
      --kes-verification-key-file                  ${NODE}/shelley/kes.vkey \
      --cold-signing-key-file                      ${NODE}/shelley/operator.skey \
      --operational-certificate-issue-counter-file ${NODE}/shelley/operator.counter \
      --out-file                                   ${NODE}/shelley/node.cert

done

echo "Generated node operator keys (cold, hot) and operational certs:"
echo
ls -1 ${ALL_NODES}
echo "====================================================================="


# Make some payment and stake addresses
# user1..n:       will own all the funds in the system, we'll set this up from
#                 initial utxo the
# pool-owner1..n: will be the owner of the pools and we'll use their reward
#                 account for pool rewards

ADDRS="${USER_ADDRS} ${POOL_ADDRS}"

mkdir addresses

cp -r shelley/utxo-keys/* addresses

for ADDR in ${UTXO_ADDRS}; do
     # Payment addresses
    ./cardano-cli address build \
        --payment-verification-key-file addresses/${ADDR}.vkey \
        --testnet-magic ${NETWORK_MAGIC} \
        --out-file addresses/${ADDR}.addr
done

for ADDR in ${ADDRS}; do

  # Payment address keys
  ./cardano-cli address key-gen \
      --verification-key-file addresses/${ADDR}.vkey \
      --signing-key-file      addresses/${ADDR}.skey

  # Stake address keys
  ./cardano-cli stake-address key-gen \
      --verification-key-file addresses/${ADDR}-stake.vkey \
      --signing-key-file      addresses/${ADDR}-stake.skey

  # Payment addresses
  ./cardano-cli address build \
      --payment-verification-key-file addresses/${ADDR}.vkey \
      --stake-verification-key-file addresses/${ADDR}-stake.vkey \
      --testnet-magic ${NETWORK_MAGIC} \
      --out-file addresses/${ADDR}.addr

  # Stake addresses
  ./cardano-cli stake-address build \
      --stake-verification-key-file addresses/${ADDR}-stake.vkey \
      --testnet-magic ${NETWORK_MAGIC} \
      --out-file addresses/${ADDR}-stake.addr

  # Stake addresses registration certs
  ./cardano-cli stake-address registration-certificate \
      --stake-verification-key-file addresses/${ADDR}-stake.vkey \
      --out-file addresses/${ADDR}-stake.reg.cert

done

# user N will delegate to pool N
for N in ${POOL_NODES_N}; do

  # Stake address delegation certs
  ./cardano-cli stake-address delegation-certificate \
      --stake-verification-key-file addresses/user${N}-stake.vkey \
      --cold-verification-key-file  node-pool${N}/shelley/operator.vkey \
      --out-file addresses/user${N}-stake.deleg.cert

  cp addresses/pool-owner${N}-stake.vkey node-pool${N}/owner.vkey
  cp addresses/pool-owner${N}-stake.skey node-pool${N}/owner.skey

done

echo "Generated payment address keys, stake address keys,"
echo "stake address regitration certs, and stake address delegatation certs"
echo
ls -1 addresses/
echo "====================================================================="
echo

# Next is to make the stake pool registration cert
for NODE in ${POOL_NODES}; do

  ./cardano-cli stake-pool registration-certificate \
    --testnet-magic ${NETWORK_MAGIC} \
    --pool-pledge 0 --pool-cost 0 --pool-margin 0 \
    --cold-verification-key-file             ${NODE}/shelley/operator.vkey \
    --vrf-verification-key-file              ${NODE}/shelley/vrf.vkey \
    --reward-account-verification-key-file   ${NODE}/owner.vkey \
    --pool-owner-stake-verification-key-file ${NODE}/owner.vkey \
    --out-file                               ${NODE}/registration.cert

done

echo "Generated stake pool registration certs:"
ls -1 node-*/registration.cert
echo "====================================================================="
echo

# Next is to prepare the pool metadata & env files
NODE_ID=1
PARTY_IDS=()
for NODE in ${POOL_NODES}; do
    PARTY_ID=$(./cardano-cli stake-pool id \
                --cold-verification-key-file ${NODE}/shelley/operator.vkey)
    PARTY_IDS[$NODE_ID]=$PARTY_ID
    echo PARTY_ID=${PARTY_ID} > ${NODE}/pool.env
    cat >> ${NODE}/metadata.json <<EOF
{
"name": "Mithril Pool ${NODE_ID}",
"description": "Mithril Pool ${NODE_ID}",
"ticker": "MITHRIL-DEVNET-SPO-${NODE_ID}",
"homepage": "https://mithril.network"
}
EOF
    NODE_ID=$(( $NODE_ID + 1))
done

echo "Generated pool env files:"
ls -1 node-*/pool.env
echo "====================================================================="

cat >> activate.sh <<EOF
#!/usr/bin/env bash
set -e

EOF

# Prepare transactions for activating stake pools
for N in ${POOL_NODES_N}; do

  AMOUNT_STAKED=$(( N*1000000 ))
  
  # We'll transfer funds to the user1, which delegates to pool1
  # We'll register certs to:
  #  1. register the pool-owner1 stake address
  #  2. register the stake pool 1
  #  3. register the user1 stake address
  #  4. delegate from the user1 stake address to the stake pool
  cat >> activate.sh <<EOF
CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli transaction build \\
    --alonzo-era \\
    --tx-in \$(./cardano-cli genesis initial-txin \\
                --testnet-magic ${NETWORK_MAGIC} \\
                --verification-key-file addresses/utxo${N}.vkey) \\
    --tx-out \$(cat addresses/user${N}.addr)+${AMOUNT_STAKED} \\
    --change-address \$(cat addresses/utxo${N}.addr) \\
    --testnet-magic ${NETWORK_MAGIC} \\
    --certificate-file addresses/pool-owner${N}-stake.reg.cert \\
    --certificate-file node-pool${N}/registration.cert \\
    --certificate-file addresses/user${N}-stake.reg.cert \\
    --certificate-file addresses/user${N}-stake.deleg.cert \\
    --invalid-hereafter 100000 \\
    --out-file node-pool${N}/tx/tx${N}.txbody \\
    --witness-override 4

EOF

  # So we'll need to sign this with a bunch of keys:
  # 1. the initial utxo spending key, for the funds
  # 2. the user1 stake address key, due to the delegation cert
  # 3. the pool1 owner key, due to the pool registration cert
  # 4. the pool1 operator key, due to the pool registration cert
  cat >> activate.sh <<EOF
CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli transaction sign \\
    --signing-key-file addresses/utxo${N}.skey \\
    --signing-key-file addresses/user${N}-stake.skey \\
    --signing-key-file node-pool${N}/owner.skey \\
    --signing-key-file node-pool${N}/shelley/operator.skey \\
    --testnet-magic ${NETWORK_MAGIC} \\
    --tx-body-file  node-pool${N}/tx/tx${N}.txbody \\
    --out-file      node-pool${N}/tx/tx${N}.tx

EOF

  # Copy submit transaction to activate.sh script
  cat >> activate.sh <<EOF
CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli transaction submit \\
    --tx-file node-pool${N}/tx/tx${N}.tx \\
    --testnet-magic ${NETWORK_MAGIC}

EOF

  # Copy retrieve transaction id to activate.sh script
  cat >> activate.sh <<EOF
CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli transaction txid \\
    --tx-file node-pool${N}/tx/tx${N}.tx

EOF

done

    # Wait until pools are activated on the Cardano network
    cat >> activate.sh <<EOF
echo ">> Wait for Cardano pools to be activated"
POOLS_ACTIVATION_WAIT_ROUND_DELAY=2
POOLS_ACTIVATION_WAIT_ROUNDS_MAX=\$(echo "scale=0; 20 * $EPOCH_LENGTH * $SLOT_LENGTH / \$POOLS_ACTIVATION_WAIT_ROUND_DELAY" | bc)
POOLS_ACTIVATION_WAIT_ROUNDS=1
POOL_STAKE_RETRIEVAL_WAIT_ROUND_DELAY=2
POOL_STAKE_RETRIEVAL_WAIT_ROUNDS_MAX=\$POOLS_ACTIVATION_WAIT_ROUNDS_MAX

while true
do
    POOLS=\$(./pools.sh 2> /dev/null)
    if [ "\$POOLS" != "" ] ; then
        echo ">>>> Cardano pools are activated!"
        ./pools.sh | while read POOL_ID ; do
            POOL_STAKE_RETRIEVAL_WAIT_ROUNDS=1
            echo ">>>> Retrieve stakes for pool: \$POOL_ID"
            while true
            do
                POOL_STAKE_PREVIOUS_EPOCH=\$(CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli query stake-snapshot \\
                    --stake-pool-id \$POOL_ID \\
                    --testnet-magic ${NETWORK_MAGIC} | jq '.pools | values | flatten | .[0].stakeMark')
                if [ "\$POOL_STAKE_PREVIOUS_EPOCH" != "0" ] ; then
                    break
                else
                    echo ">>>> Stakes are not retrievable for this pool yet... [attempt \$POOL_STAKE_RETRIEVAL_WAIT_ROUNDS]"
                    sleep \$POOL_STAKE_RETRIEVAL_WAIT_ROUND_DELAY
                fi
                POOL_STAKE_RETRIEVAL_WAIT_ROUNDS=\$(( \$POOL_STAKE_RETRIEVAL_WAIT_ROUNDS + 1 ))
                if [ "\$POOL_STAKE_RETRIEVAL_WAIT_ROUNDS" -gt "\$POOL_STAKE_RETRIEVAL_WAIT_ROUNDS_MAX" ] ; then
                    echo ">>>> Timeout: could not retrieve stakes of pool \$POOL_ID within \$POOL_STAKE_RETRIEVAL_WAIT_ROUNDS_MAX attempts"
                    exit 1
                fi
            done
            echo ">>>> Stakes retrieved for pool: \$POOL_ID / \$POOL_STAKE_PREVIOUS_EPOCH Lovelace"
        done
        break
    else
        echo ">>>> Cardano pools are not activated yet... [attempt \$POOLS_ACTIVATION_WAIT_ROUNDS]"
        sleep \$POOLS_ACTIVATION_WAIT_ROUND_DELAY
    fi
    POOLS_ACTIVATION_WAIT_ROUNDS=\$(( \$POOLS_ACTIVATION_WAIT_ROUNDS + 1 ))
    if [ "\$POOLS_ACTIVATION_WAIT_ROUNDS" -gt "\$POOLS_ACTIVATION_WAIT_ROUNDS_MAX" ] ; then
        echo ">>>> Timeout: pools could not be activated within \$POOLS_ACTIVATION_WAIT_ROUNDS_MAX attempts"
        exit 1
    fi
done

echo ">> Cardano pools activation was successful!"
EOF

chmod u+x activate.sh

echo "Generated activate.sh script"
echo "====================================================================="
echo

cat >> delegate.sh <<EOF
#!/usr/bin/env bash
set -e

CURRENT_EPOCH=\$(CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli query tip \\
                    --cardano-mode \\
                    --testnet-magic ${NETWORK_MAGIC} | jq .epoch)
echo ">>>> Current Epoch: \${CURRENT_EPOCH}"
EOF

# Prepare transactions for activating stake pools
for N in ${POOL_NODES_N}; do

  # We'll transfer funds to the user1, which delegates to pool1
  # We'll register certs to:
  #  1. delegate from the user1 stake address to the stake pool
  cat >> delegate.sh <<EOF
    
    AMOUNT_STAKED=\$(( $N*1000000 +  DELEGATION_ROUND*1 ))

    TX_IN=\$(CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli query utxo \\
      --testnet-magic ${NETWORK_MAGIC}  --address \$(cat addresses/utxo${N}.addr) --out-file tmp.txt \\
      && cat tmp.txt | jq  -r 'to_entries | [last] | .[0].key' \\
      && rm -f tmp.txt)

    CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli transaction build \\
        --alonzo-era \\
        --tx-in \${TX_IN} \\
        --tx-out \$(cat addresses/user${N}.addr)+\${AMOUNT_STAKED} \\
        --change-address \$(cat addresses/utxo${N}.addr) \\
        --testnet-magic ${NETWORK_MAGIC} \\
        --certificate-file addresses/user${N}-stake.deleg.cert \\
        --invalid-hereafter 100000 \\
        --out-file node-pool${N}/tx/tx${N}-\${DELEGATION_ROUND}.txbody \\
        --witness-override 2

EOF

  # So we'll need to sign this with a the following keys:
  # 1. the user1 stake address key, due to the delegation cert
  cat >> delegate.sh <<EOF
    CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli transaction sign \\
        --signing-key-file addresses/utxo${N}.skey \\
        --signing-key-file addresses/user${N}-stake.skey \\
        --testnet-magic ${NETWORK_MAGIC} \\
        --tx-body-file  node-pool${N}/tx/tx${N}-\${DELEGATION_ROUND}.txbody \\
        --out-file      node-pool${N}/tx/tx${N}-\${DELEGATION_ROUND}.tx

EOF

  # Copy submit transaction to delegate.sh script
  cat >> delegate.sh <<EOF
    CARDANO_NODE_SOCKET_PATH=node-pool${N}/ipc/node.sock ./cardano-cli transaction submit \\
        --tx-file node-pool${N}/tx/tx${N}-\${DELEGATION_ROUND}.tx \\
        --testnet-magic ${NETWORK_MAGIC}

EOF

done

chmod u+x delegate.sh

echo "Generated delegate.sh script"
echo "====================================================================="
echo

cat >> query-mithril.sh <<EOF
#!/usr/bin/env bash

AGGREGATOR_API_ENDPOINT="http://0.0.0.0:8080/aggregator"

echo ">> Query pending certificate"
curl -sL \${AGGREGATOR_API_ENDPOINT}/certificate-pending | jq .
echo

echo ">> Query latest certificates"
curl -sL \${AGGREGATOR_API_ENDPOINT}/certificates | jq '.[:2]'
echo

echo ">> Query latest mithril stake distributions"
curl -sL \${AGGREGATOR_API_ENDPOINT}/artifact/mithril-stake-distributions | jq '.[:2]'
echo

echo ">> Query latest snapshots"
curl -sL \${AGGREGATOR_API_ENDPOINT}/artifact/snapshots | jq '.[:2]'
echo

EOF

cat >> query-cardano.sh <<EOF
#!/usr/bin/env bash

echo ">> Query chain tip"
CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query tip \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC} | jq .

echo
echo ">> Query whole utxo"
CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query utxo \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC} \\
    --whole-utxo
echo

echo ">> Query stake pools"
CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query stake-pools \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC}
echo

echo ">> Query stake distribution"
CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query stake-snapshot --all-stake-pools \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC} | jq .
echo

EOF

cat >> query-unused.sh <<EOF
#!/usr/bin/env bash

echo
echo ">> Query utxo1 utxo 'utxo1.addr'"
CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query utxo \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC} \\
    --address \$(cat addresses/utxo1.addr)

echo
echo ">> Query user1 utxo 'user1.addr'"
CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query utxo \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC} \\
    --address \$(cat addresses/user1.addr)

echo ">> Query stake pool params"
echo CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query pool-params \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC} \\
    --stake-pool-id \${STAKE_POOL_ID}
echo

echo ">> Query stake pool snapshot"
echo CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query stake-snapshot \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC} \\
    --stake-pool-id \${STAKE_POOL_ID}
echo

EOF

chmod u+x query-mithril.sh
chmod u+x query-cardano.sh

echo "Generated query-mithril.sh script"
echo "Generated query-cardano.sh script"
echo "====================================================================="
echo

cat >> pools.sh <<EOF
#!/usr/bin/env bash

CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query stake-pools \\
    --cardano-mode \\
    --testnet-magic ${NETWORK_MAGIC}
EOF

chmod u+x pools.sh

echo "Generated pools.sh script"
echo "====================================================================="
echo

echo "Generate docker-compose.yaml file"
cat >> docker-compose.yaml <<EOF
version: "3.9"

services:
EOF

for NODE in ${BFT_NODES}; do

    PORT=$(cat ${NODE}/port)
    HOST=$(cat ${NODE}/host)
cat >> docker-compose.yaml <<EOF
  cardano-${NODE}:
    image: inputoutput/cardano-node:latest
    profiles:
      - cardano
    volumes:
    - ./${NODE}:/data:z
    environment:
    - CARDANO_NODE_SOCKET_PATH=/data/ipc/node.sock
    networks:
      cardano_network:
        ipv4_address: ${HOST}
    ports:
    - "${PORT}:3001"
    command:
      [
        "run",
        "--config",
        "/data/configuration.yaml",
        "--topology",
        "/data/topology.docker.json",
        "--database-path",
        "/data/db",
        "--socket-path",
        "/data/ipc/node.sock",
        "--shelley-operational-certificate",
        "/data/shelley/node.cert",
        "--shelley-kes-key",
        "/data/shelley/kes.skey",
        "--shelley-vrf-key",
        "/data/shelley/vrf.skey",
        "--delegation-certificate",
        "/data/byron/delegate.cert",
        "--signing-key",
        "/data/byron/delegate.key",
        "--host-addr",
        "${HOST}",
        "--port",
        "3001"
      ]

EOF

done

for NODE in ${POOL_NODES}; do

    PORT=$(cat ${NODE}/port)
    HOST=$(cat ${NODE}/host)
cat >> docker-compose.yaml <<EOF
  cardano-${NODE}:
    image: inputoutput/cardano-node:latest
    profiles:
      - cardano
    volumes:
    - ./${NODE}:/data:z
    environment:
    - CARDANO_NODE_SOCKET_PATH=/data/ipc/node.sock
    networks:
      cardano_network:
        ipv4_address: ${HOST}
    ports:
    - "${PORT}:3001"
    command:
      [
        "run",
        "--config",
        "/data/configuration.yaml",
        "--topology",
        "/data/topology.docker.json",
        "--database-path",
        "/data/db",
        "--socket-path",
        "/data/ipc/node.sock",
        "--shelley-operational-certificate",
        "/data/shelley/node.cert",
        "--shelley-kes-key",
        "/data/shelley/kes.skey",
        "--shelley-vrf-key",
        "/data/shelley/vrf.skey",
        "--host-addr",
        "${HOST}",
        "--port",
        "3001"
      ]

EOF

done

for NODE in ${BFT_NODES}; do

cat >> docker-compose.yaml <<EOF
  mithril-aggregator:
    image: \${MITHRIL_AGGREGATOR_IMAGE}
    restart: always
    profiles:
      - mithril
    volumes:
      - ./${NODE}:/data:z
    networks:
    - mithril_network
    ports:
      - "8080:8080"
    environment:
      - RUST_BACKTRACE=1
      - GOOGLE_APPLICATION_CREDENTIALS_JSON=
      - NETWORK=devnet
      - NETWORK_MAGIC=${NETWORK_MAGIC}
      - PROTOCOL_PARAMETERS__K=5
      - PROTOCOL_PARAMETERS__M=100
      - PROTOCOL_PARAMETERS__PHI_F=0.65
      - RUN_INTERVAL=1000
      - URL_SNAPSHOT_MANIFEST=
      - SNAPSHOT_STORE_TYPE=local
      - SNAPSHOT_UPLOADER_TYPE=local
      - SNAPSHOT_COMPRESSION_ALGORITHM=zstandard
      - DATA_STORES_DIRECTORY=/data/mithril/aggregator/stores
      - CARDANO_NODE_SOCKET_PATH=/data/ipc/node.sock
      - CARDANO_NODE_VERSION=${CARDANO_NODE_VERSION}
      - CARDANO_CLI_PATH=/app/bin/cardano-cli
      - GENESIS_VERIFICATION_KEY=${GENESIS_VERIFICATION_KEY}
      - DB_DIRECTORY=/data/db
      - SNAPSHOT_DIRECTORY=/data/mithril/aggregator
      - SERVER_PORT=8080
    command:
      [
        "-vvv",
        "serve"
      ]

  mithril-aggregator-genesis:
    image: \${MITHRIL_AGGREGATOR_IMAGE}
    profiles:
      - mithril-genesis
    volumes:
      - ./${NODE}:/data
    networks:
    - mithril_network
    ports:
      - "8080:8080"
    environment:
      - RUST_BACKTRACE=1
      - GOOGLE_APPLICATION_CREDENTIALS_JSON=
      - NETWORK=devnet
      - NETWORK_MAGIC=${NETWORK_MAGIC}
      - PROTOCOL_PARAMETERS__K=5
      - PROTOCOL_PARAMETERS__M=100
      - PROTOCOL_PARAMETERS__PHI_F=0.65
      - RUN_INTERVAL=1000
      - URL_SNAPSHOT_MANIFEST=
      - SNAPSHOT_STORE_TYPE=local
      - SNAPSHOT_UPLOADER_TYPE=local
      - DATA_STORES_DIRECTORY=/data/mithril/aggregator/stores
      - CARDANO_NODE_SOCKET_PATH=/data/ipc/node.sock
      - CARDANO_NODE_VERSION=${CARDANO_NODE_VERSION}
      - CARDANO_CLI_PATH=/app/bin/cardano-cli
      - GENESIS_VERIFICATION_KEY=${GENESIS_VERIFICATION_KEY}
      - GENESIS_SECRET_KEY=${GENESIS_SECRET_KEY}
      - DB_DIRECTORY=/data/db
    command:
      [
        "-vvv",
        "genesis",
        "bootstrap"
      ]
    
EOF
break

done

NODE_IX=0
for NODE in ${POOL_NODES}; do
    NODE_ID=$(( $NODE_IX + 1))
if [ `expr $NODE_IX % 2` == 0 ] || [ -z "${WITH_UNCERTIFIED_SIGNERS}" ]; then 
    # 50% of signers with key certification
    cat >> ${NODE}/info.json <<EOF
{
"name": "Signer ${NODE_ID}",
"description": "Certified PoolId",
"pool_id": "${PARTY_IDS[$NODE_ID]}"
}
EOF

    cat >> docker-compose.yaml <<EOF
  mithril-signer-${NODE}:
    image: \${MITHRIL_SIGNER_IMAGE}
    restart: always
    profiles:
      - mithril
    volumes:
      - ./${NODE}:/data:z
    networks:
    - mithril_network
    env_file:
    - ./${NODE}/pool.env
    environment:
      - RUST_BACKTRACE=1
      - AGGREGATOR_ENDPOINT=http://mithril-aggregator:8080/aggregator
      - NETWORK=devnet
      - NETWORK_MAGIC=${NETWORK_MAGIC}
      - RUN_INTERVAL=700
      - DB_DIRECTORY=/data/db
      - DATA_STORES_DIRECTORY=/data/mithril/signer-${NODE}/stores
      - CARDANO_NODE_SOCKET_PATH=/data/ipc/node.sock
      - CARDANO_CLI_PATH=/app/bin/cardano-cli
      - KES_SECRET_KEY_PATH=/data/shelley/kes.skey
      - OPERATIONAL_CERTIFICATE_PATH=/data/shelley/node.cert
    command:
      [
        "-vvv"
      ]

EOF
else
    # 50% of signers without key certification (legacy)
    # TODO: Should be removed once the signer certification is fully deployed
    cat >> ${NODE}/info.json <<EOF
{
"name": "Signer ${NODE_ID}",
"description": "Uncertified PoolId (Legacy)",
"pool_id": "${PARTY_IDS[$NODE_ID]}"
}
EOF

cat >> docker-compose.yaml <<EOF
  mithril-signer-${NODE}:
    image: \${MITHRIL_SIGNER_IMAGE}
    restart: always
    profiles:
      - mithril
    volumes:
      - ./${NODE}:/data:z
    networks:
    - mithril_network
    env_file:
    - ./${NODE}/pool.env
    environment:
      - RUST_BACKTRACE=1
      - AGGREGATOR_ENDPOINT=http://mithril-aggregator:8080/aggregator
      - NETWORK=devnet
      - NETWORK_MAGIC=${NETWORK_MAGIC}
      - RUN_INTERVAL=700
      - DB_DIRECTORY=/data/db
      - DATA_STORES_DIRECTORY=/data/mithril/signer-${NODE}/stores
      - CARDANO_NODE_SOCKET_PATH=/data/ipc/node.sock
      - CARDANO_CLI_PATH=/app/bin/cardano-cli
    command:
      [
        "-vvv"
      ]

EOF
fi

    NODE_IX=$(( $NODE_IX + 1))

done

cat >> docker-compose.yaml <<EOF
  mithril-client:
    image: \${MITHRIL_CLIENT_IMAGE}
    profiles:
      - mithril-client
    networks:
    - mithril_network
    environment:
      - RUST_BACKTRACE=1
      - AGGREGATOR_ENDPOINT=http://mithril-aggregator:8080/aggregator
      - NETWORK=devnet
      - GENESIS_VERIFICATION_KEY=${GENESIS_VERIFICATION_KEY}
    
EOF

cat >> docker-compose.yaml <<EOF
networks:
  mithril_network:
    driver: bridge
  cardano_network:
    driver: bridge
    ipam:
        driver: default
        config:
            - subnet: ${NODE_ADDR_PREFIX}.0/24
              gateway: ${NODE_ADDR_PREFIX}.1
    
EOF

echo "====================================================================="
echo
echo "First change directory:"
echo
echo cd ${ROOT}
echo
echo "To start the nodes, in separate terminals use:"
echo
cat >> start-cardano.sh <<EOF
#!/usr/bin/env bash

echo ">> Start Cardano network"
killall cardano-node > /dev/null 2>&1

# Stop when there's an error, activate it after the killall since it will report an error if it doesn't kill anything
set -e

./cardano-cli --version
./cardano-node --version

EOF
for NODE in ${BFT_NODES}; do

  echo ./${ROOT}/${NODE}/start-node.sh

  cat >> ${NODE}/start-node.sh <<EOF
#!/usr/bin/env bash

./cardano-node run \\
  --config                          ${NODE}/configuration.yaml \\
  --topology                        ${NODE}/topology.json \\
  --database-path                   ${NODE}/db \\
  --socket-path                     ${NODE}/ipc/node.sock \\
  --shelley-kes-key                 ${NODE}/shelley/kes.skey \\
  --shelley-vrf-key                 ${NODE}/shelley/vrf.skey \\
  --shelley-operational-certificate ${NODE}/shelley/node.cert \\
  --port                            $(cat ${NODE}/port) \\
  --delegation-certificate          ${NODE}/byron/delegate.cert \\
  --signing-key                     ${NODE}/byron/delegate.key \\
  > ${NODE}/node.log
EOF
  chmod u+x ${NODE}/start-node.sh

  cat >> start-cardano.sh <<EOF
echo ">> Starting Cardano node '${NODE}'"
./${NODE}/start-node.sh &

EOF

done
for NODE in ${POOL_NODES}; do

  echo ./${ROOT}/${NODE}/start-node.sh

  cat >> ${NODE}/start-node.sh <<EOF
#!/usr/bin/env bash

./cardano-node run \\
  --config                          ${NODE}/configuration.yaml \\
  --topology                        ${NODE}/topology.json \\
  --database-path                   ${NODE}/db \\
  --socket-path                     ${NODE}/ipc/node.sock \\
  --shelley-kes-key                 ${NODE}/shelley/kes.skey \\
  --shelley-vrf-key                 ${NODE}/shelley/vrf.skey \\
  --shelley-operational-certificate ${NODE}/shelley/node.cert \\
  --port                            $(cat ${NODE}/port) \\
  > ${NODE}/node.log
EOF
  chmod u+x ${NODE}/start-node.sh

  cat >> start-cardano.sh <<EOF
echo ">> Starting Cardano node '${NODE}'"
./${NODE}/start-node.sh &

EOF

done

cat >> start-cardano.sh <<EOF
echo ">> Wait for Cardano network to be ready"
CARDANO_ACTIVATION_WAIT_ROUNDS_MAX=30
CARDANO_ACTIVATION_WAIT_ROUNDS=1
CARDANO_ACTIVATION_WAIT_ROUND_DELAY=2
while true
do
    EPOCH=\$(CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query tip --cardano-mode --testnet-magic ${NETWORK_MAGIC} 2> /dev/null | jq -r .epoch)
    if [ "\$EPOCH" != "" ] ; then
        echo ">>>> Cardano network is ready!"
        break
    else
        echo ">>>> Cardano network is not ready yet... [attempt \$CARDANO_ACTIVATION_WAIT_ROUNDS]"
        sleep \$CARDANO_ACTIVATION_WAIT_ROUND_DELAY
    fi
    CARDANO_ACTIVATION_WAIT_ROUNDS=\$(( \$CARDANO_ACTIVATION_WAIT_ROUNDS + 1 ))
    if [ "\$CARDANO_ACTIVATION_WAIT_ROUNDS" -gt "\$CARDANO_ACTIVATION_WAIT_ROUNDS_MAX" ] ; then
        echo ">>>> Timeout: Cardano network could no start within \$CARDANO_ACTIVATION_WAIT_ROUNDS_MAX attempts"
        exit 1
    fi
done

echo ">> Activate Cardano pools"
./activate.sh ${ROOT}

EOF

cat >> start-cardano.sh <<EOF
echo ">> Wait for Cardano nodes to have enough immutable files"
for NODE in ${ALL_NODES}; do
  echo ">> Wait for \${NODE} to have enough immutable files"
  NODE_ACTIVATION_WAIT_ROUNDS_MAX=100
  NODE_ACTIVATION_WAIT_ROUNDS=1
  NODE_ACTIVATION_WAIT_ROUND_DELAY=2
  while true
  do
      TOTAL_IMMUTABLE_FILES=\$(ls -1q \${NODE}/db/immutable | grep ".chunk" | wc -l)
      if [ "\$TOTAL_IMMUTABLE_FILES" -gt "1" ] ; then
          echo ">>>> \${NODE} has enough immutable files!"
          break
      else
          echo ">>>> \${NODE} has not enough immutable files yet... [attempt \$NODE_ACTIVATION_WAIT_ROUNDS]"
          sleep \$NODE_ACTIVATION_WAIT_ROUND_DELAY
      fi
      NODE_ACTIVATION_WAIT_ROUNDS=\$(( \$NODE_ACTIVATION_WAIT_ROUNDS + 1 ))
      if [ "\$NODE_ACTIVATION_WAIT_ROUNDS" -gt "\$NODE_ACTIVATION_WAIT_ROUNDS_MAX" ] ; then
          echo ">>>> Timeout: \${NODE} has not enough immutable files within \$NODE_ACTIVATION_WAIT_ROUNDS_MAX attempts"
          exit 1
      fi
  done
done

EOF

chmod u+x start-cardano.sh

cat >> start-mithril.sh <<EOF
#!/usr/bin/env bash

echo ">> Start Mithril network"
if [ -z "\${MITHRIL_IMAGE_ID}" ]; then 
  export MITHRIL_AGGREGATOR_IMAGE="mithril/mithril-aggregator"
  export MITHRIL_CLIENT_IMAGE="mithril/mithril-client"
  export MITHRIL_SIGNER_IMAGE="mithril/mithril-signer"
  echo ">> Build Mithril node Docker images"
  PWD=$(pwd)
  cd ../../../
  if [ -z "\${MITHRIL_NODE_DOCKER_BUILD_TYPE}" ]; then 
    MITHRIL_NODE_DOCKER_BUILD_TYPE=ci
  fi
  if [ -z "\${MITHRIL_NODE_DOCKER_CI_IMAGE_FROM}" ]; then 
    MITHRIL_NODE_DOCKER_CI_IMAGE_FROM=debian:12-slim
  fi
  export DOCKER_IMAGE_FROM=\$MITHRIL_NODE_DOCKER_CI_IMAGE_FROM
  if [ "\${MITHRIL_NODE_DOCKER_BUILD_TYPE}" = "ci" ]; then
    DOCKER_BUILD_CMD="make docker-build-ci" 
  else
    DOCKER_BUILD_CMD="make docker-build"
  fi
  echo ">>>> Docker builder will build images with command: '\$DOCKER_BUILD_CMD'"
  echo ">>>> Building Mithril Aggregator node Docker image"
  cd mithril-aggregator && \$DOCKER_BUILD_CMD && cd ..
  echo ">>>> Building Mithril Client node Docker image"
  cd mithril-client-cli && \$DOCKER_BUILD_CMD && cd ..
  echo ">>>> Building Mithril Signer node Docker image"
  cd mithril-signer && \$DOCKER_BUILD_CMD && cd ..
  cd $PWD
else
  export MITHRIL_AGGREGATOR_IMAGE="ghcr.io/input-output-hk/mithril-aggregator:\${MITHRIL_IMAGE_ID}"
  export MITHRIL_CLIENT_IMAGE="ghcr.io/input-output-hk/mithril-client:\${MITHRIL_IMAGE_ID}"
  export MITHRIL_SIGNER_IMAGE="ghcr.io/input-output-hk/mithril-signer:\${MITHRIL_IMAGE_ID}"
fi

docker compose rm -f
docker compose -f docker-compose.yaml --profile mithril up --remove-orphans --force-recreate -d --no-build

echo ">> List of Mithril signers"
    echo --------,--------------------------------------------------------,----------------------------------- | column -t -s,                                                 
EOF

for NODE in ${POOL_NODES}; do
    cat >> start-mithril.sh <<EOF
    cat ${NODE}/info.json | jq -r '"\(.name),\(.pool_id),\(.description)"' | column -t -s,
EOF
done

cat >> start-mithril.sh <<EOF

echo ">> Wait for Mithril signers to be registered"
EPOCH_NOW=\$(CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query tip --cardano-mode --testnet-magic ${NETWORK_MAGIC} 2> /dev/null | jq -r .epoch)
while true
do
    EPOCH=\$(CARDANO_NODE_SOCKET_PATH=node-bft1/ipc/node.sock ./cardano-cli query tip --cardano-mode --testnet-magic ${NETWORK_MAGIC} 2> /dev/null | jq -r .epoch)
    EPOCH_DELTA=\$(( \$EPOCH - \$EPOCH_NOW ))
    if [ \$EPOCH_DELTA -ge 2 ] ; then
        echo ">>>> Ready!"
        break
    else
        echo ">>>> Not ready yet"
        sleep 2
    fi
done

echo ">> Bootstrap the Genesis certificate"
docker compose -f docker-compose.yaml --profile mithril-genesis run mithril-aggregator-genesis

EOF
chmod u+x start-mithril.sh

cat >> stop.sh <<EOF
#!/usr/bin/env bash

echo ">> Stop Cardano network"
killall cardano-node

echo ">> Stop Mithril network"
if [ -z "\${MITHRIL_IMAGE_ID}" ]; then 
  export MITHRIL_AGGREGATOR_IMAGE="mithril/mithril-aggregator"
  export MITHRIL_CLIENT_IMAGE="mithril/mithril-client"
  export MITHRIL_SIGNER_IMAGE="mithril/mithril-signer"
else
  export MITHRIL_AGGREGATOR_IMAGE="ghcr.io/input-output-hk/mithril-aggregator:\${MITHRIL_IMAGE_ID}"
  export MITHRIL_CLIENT_IMAGE="ghcr.io/input-output-hk/mithril-client:\${MITHRIL_IMAGE_ID}"
  export MITHRIL_SIGNER_IMAGE="ghcr.io/input-output-hk/mithril-signer:\${MITHRIL_IMAGE_ID}"
fi
docker compose -f docker-compose.yaml --profile mithril down
EOF
chmod u+x stop.sh

cat >> log-mithril.sh <<EOF
#!/usr/bin/env bash

SEPARATOR="---------------------------------------------------------------------"

# Mithril nodes logs
docker ps --format='{{.Names}}' | grep "mithril" | sort -n | xargs -i  sh -c 'echo '\${SEPARATOR}' && echo docker logs -n '\${LINES}' {} && echo '\${SEPARATOR}' && docker logs -n '\${LINES}' {} && echo '\${SEPARATOR}' && echo'

EOF
chmod u+x log-mithril.sh

cat >> log-cardano.sh <<EOF
#!/usr/bin/env bash

SEPARATOR="---------------------------------------------------------------------"

# Cardano nodes logs
find . -type f -print | grep "node.log" | sort -n | xargs -i  sh -c 'echo '\${SEPARATOR}' && echo tail -n '\${LINES}' {} && echo '\${SEPARATOR}' && tail -n '\${LINES}' {} && echo '\${SEPARATOR}' && echo'

EOF
chmod u+x log-cardano.sh
echo "====================================================================="
echo

echo "Cleanup artifacts directory"
rm -rf byron shelley 
rm configuration.yaml topology.json
for NODE in ${ALL_NODES}; do

  rm ${NODE}/host
  rm ${NODE}/port

done
echo "====================================================================="
echo

echo
echo "Then, activate the pools:"
echo
echo ./activate.sh .
echo
echo "Or do all at once with:"
echo
echo "./start-cardano.sh && ./start-mithril.sh"
echo
echo "Then query the devnet:"
echo
echo ./query.sh
echo
echo "And stop with:"
echo
echo ./stop.sh
echo
echo

popd
