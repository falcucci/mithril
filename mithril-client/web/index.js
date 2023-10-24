import { verify_mithril_certificate } from './pkg';

// preprod
/* let certificate_hash = "61b241a842ae986e54df26a43f5ebef2c6876d1b6fba5122cb20ca77df74131f";
let aggregator_endpoint = "https://aggregator.release-preprod.api.mithril.network/aggregator";
let genesis_verification_key = "5b3132372c37332c3132342c3136312c362c3133372c3133312c3231332c3230372c3131372c3139382c38352c3137362c3139392c3136322c3234312c36382c3132332c3131392c3134352c31332c3233322c3234332c34392c3232392c322c3234392c3230352c3230352c33392c3233352c34345d";
 */

//mainnet
//let certificate_hash = "5e811dd8b17ace941a3b29fb8fc641469b7a48e91149f437e535a96c4d320222";
//let aggregator_endpoint = "https://aggregator.release-mainnet.api.mithril.network/aggregator";
let genesis_verification_key = "5b3139312c36362c3134302c3138352c3133382c31312c3233372c3230372c3235302c3134342c32372c322c3138382c33302c31322c38312c3135352c3230342c31302c3137392c37352c32332c3133382c3139362c3231372c352c31342c32302c35372c37392c33392c3137365d";

const params = new URL(window.location).searchParams;
let certificate_hash = params.get("certificate");
let aggregator_endpoint = params.get("aggregator");
let genesis_verification_key_url = params.get("genesis_verification_key");


verify_mithril_certificate(aggregator_endpoint, certificate_hash, genesis_verification_key_url);