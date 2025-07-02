import * as dotenv from 'dotenv';
dotenv.config();
import { Account } from '@near-js/accounts';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';
import { KeyPair } from '@near-js/crypto';
import { NEAR } from '@near-js/tokens';
import { parseSeedPhrase } from 'near-seed-phrase';

const provider = new JsonRpcProvider({
    url: 'https://test.rpc.fastnear.com',
});

// setup account
const { secretKey } = parseSeedPhrase(process.env.NEAR_SEED_PHRASE);
const keyPair = KeyPair.fromString(secretKey);
let signer = new KeyPairSigner(keyPair);
const account = new Account(process.env.NEAR_ACCOUNT_ID, provider, signer);

// get balance
const amount = await account.getBalance(NEAR);
// converts to human-readable string like "1.234"
console.log(NEAR.toDecimal(amount));
