import * as dotenv from 'dotenv';
dotenv.config();

const { NEAR_ACCOUNT_ID, NEAR_SEED_PHRASE, NEAR_CONTRACT_ID } = process.env;

import { readFileSync } from 'fs';
import { Account } from '@near-js/accounts';
import { JsonRpcProvider } from '@near-js/providers';
import { KeyPairSigner } from '@near-js/signers';
import { KeyPair } from '@near-js/crypto';
import { parseNearAmount } from '@near-js/utils';
import { parseSeedPhrase } from 'near-seed-phrase';

const provider = new JsonRpcProvider({
    url: 'https://test.rpc.fastnear.com',
});

// setup account
const { secretKey } = parseSeedPhrase(NEAR_SEED_PHRASE);
const keyPair = KeyPair.fromString(secretKey);
let signer = new KeyPairSigner(keyPair);

async function deleteAccount(accountId) {
    const account = new Account(accountId, provider, signer);
    try {
        await account.deleteAccount(NEAR_ACCOUNT_ID);
        console.log('Account deleted', accountId);
    } catch (e) {
        console.log('Error deleting account', e);
    }
}

async function createAccount(accountId) {
    const account = new Account(NEAR_ACCOUNT_ID, provider, signer);
    try {
        await account.createAccount(
            accountId,
            (await signer.getPublicKey()).toString(),
            parseNearAmount('5'),
        );
        console.log('Account created', accountId);
    } catch (e) {
        console.log('Error creating account', e);
    }
}

async function deployContract(accountId, path) {
    const account = new Account(accountId, provider, signer);
    try {
        await account.deployContract(await readFileSync(path));
        console.log('Contract deployed', path);
    } catch (e) {
        console.log('Error deploying contract', e);
    }
}

async function view(methodName, args) {
    try {
        const res = await provider.callFunction(
            NEAR_CONTRACT_ID,
            methodName,
            args,
        );
        console.log('View result:', res);
    } catch (e) {
        console.log('Error calling', methodName, e);
    }
}

async function call(methodName, args, deposit = 0n, gas = 30000000000000n) {
    const account = new Account(NEAR_ACCOUNT_ID, provider, signer);
    try {
        const res = await account.callFunction({
            contractId: NEAR_CONTRACT_ID,
            methodName,
            args,
            deposit,
            gas,
        });
        console.log('Call result:', res.length ? res : res === '');
    } catch (e) {
        console.log('Error calling', methodName, e);
    }
}

// test run const

const REDEPLOY_CONTRACT = false;

async function test() {
    if (REDEPLOY_CONTRACT) {
        await deleteAccount(NEAR_CONTRACT_ID);
        await createAccount(NEAR_CONTRACT_ID);
        await deployContract(
            NEAR_CONTRACT_ID,
            './contract/target/near/contract_rs.wasm',
        );
    }

    // test calls

    await view('get_greeting', {});
    await call('set_greeting', { greeting: 'hello world!' });
    await view('get_greeting', {});
}

test();
