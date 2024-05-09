import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { mnemonicToSeedSync } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";

export type DisburseChains = {
  name: string;
  address: string;
  amount: number;
  type: string;
  rpc: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export function loadFaucetAccount() {
  const seed = process.env.FAUCET_ACCOUNT_SEED;
  if (!seed) {
    throw new Error("Faucet account seed not set");
  };
  const mnemonic = mnemonicToSeedSync(seed);
  const hd = hdkey.fromMasterSeed(mnemonic);
  const privateKey = hd.derivePath("m/44'/60'/0'/0/0").getWallet().getPrivateKey();
  const substrateAccount = new Keyring({ type: 'sr25519' }).addFromUri(seed);

  return { substrateAccount, privateKey: `0x${privateKey.toString('hex')}` };
};

export async function disburseSubstrateToken(chain: DisburseChains) {
  const wsProvider = new WsProvider(chain.rpc);
  const api = await ApiPromise.create({ provider: wsProvider });

  const transfer = api.tx.balances.transfer(chain.address, chain.amount);
  const hash = await transfer.signAndSend(loadFaucetAccount().substrateAccount);

  return hash;
};

export async function disburseEvmToken(chain: DisburseChains) {

  const web3 = new Web3(chain.rpc);
  const faucetAccountAddress = web3.eth.accounts.privateKeyToAccount(loadFaucetAccount().privateKey).address;

  const tx = {
    from: faucetAccountAddress,
    to: chain.address,
    value: web3.utils.toWei(chain.amount.toString(), 'ether'),
    gas: 21000,
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, loadFaucetAccount().privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

  return receipt.transactionHash;

};