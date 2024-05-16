import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { mnemonicToSeedSync } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";
import { cryptoWaitReady } from "@polkadot/util-crypto"

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
  console.log(seed)
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
  await cryptoWaitReady();
  const wsProvider = new WsProvider(chain.rpc);
  const api = await ApiPromise.create({ provider: wsProvider });

  const transfer = api.tx.balances.transferKeepAlive(chain.address, (chain.amount*10**(chain.nativeCurrency.decimals)).toString());
  const hash = await transfer.signAndSend(loadFaucetAccount().substrateAccount);

  return hash;
};

export async function disburseEvmToken(chain: DisburseChains) {
  await cryptoWaitReady();
  const web3 = new Web3(chain.rpc);
  const faucetAccountAddress = web3.eth.accounts.privateKeyToAccount(loadFaucetAccount().privateKey).address;

  const tx = {
    from: faucetAccountAddress,
    to: chain.address,
    value: web3.utils.toWei(chain.amount.toString(), 'ether'),
    gas: 21000,
    gasPrice: await web3.eth.getGasPrice(),
    nonce: await web3.eth.getTransactionCount(chain.address)
  };

  console.log(tx);

  const signedTx = await web3.eth.accounts.signTransaction(tx, loadFaucetAccount().privateKey);
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);
  console.log(signedTx, receipt)

  return receipt.transactionHash;

};