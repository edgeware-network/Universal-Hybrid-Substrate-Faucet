import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { mnemonicToSeedSync } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";
import { cryptoWaitReady } from "@polkadot/util-crypto"
import { AccountInfo } from "@polkadot/types/interfaces";
import { AxiosError } from "axios";

export type DisburseChains = {
  chain: string;
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
  const seed = process.env.FAUCET_ACCOUNT_SEED!;
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
  try {
    const wsProvider = new WsProvider(chain.rpc);
    const api = await ApiPromise.create({ provider: wsProvider });
  
    const transfer = api.tx.balances.transferKeepAlive(chain.address, (chain.amount*10**(chain.nativeCurrency.decimals)).toString());
    const hash = await transfer.signAndSend(loadFaucetAccount().substrateAccount);
  
    return hash;

  } catch (error) {
    console.log((error instanceof AxiosError) ? error.response?.data.message : "");
    return null;
  };
};

export async function disburseEvmToken(chain: DisburseChains) {
  await cryptoWaitReady();
  try {
    const web3 = new Web3(chain.rpc);
    
    const tx = {
      from: process.env.FAUCET_EVM_ADDRESS!,
      to: chain.address,
      value: web3.utils.toWei(chain.amount.toString(), 'ether'),
      gas: 21000,
      gasPrice: await web3.eth.getGasPrice(),
      nonce: await web3.eth.getTransactionCount(process.env.FAUCET_EVM_ADDRESS!)
    };
    
    console.log(tx);
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, loadFaucetAccount().privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(receipt.transactionHash);
    
    return receipt.transactionHash;

  } catch(error) {
    console.log((error instanceof AxiosError) ? error.response?.data.message : "");
    return null;
  }
};

export async function getBalances(rpc: string, type: string) {
  await cryptoWaitReady();
  if(type === 'evm') {
    try {
      const web3 = new Web3(rpc);
      const faucetAccountAddress = process.env.FAUCET_EVM_ADDRESS!;
      const balance = web3.utils.fromWei(await web3.eth.getBalance(faucetAccountAddress), "wei");
      return balance;
    } catch(error) {
      console.log((error instanceof AxiosError) ? error.response?.data.message : "");
      return null;
    }
  };

  try {
    const wsProvider = new WsProvider(rpc);
    wsProvider.on("error", (error) => {
      console.log("wsProvider error", error);
      return null;
    });
    const api = await ApiPromise.create({ provider: wsProvider });
    await api.isReady;
    const faucetPublicKey = process.env.FAUCET_SUBSTRATE_PUBLIC_KEY!;
    const account = (await api.query.system.account(faucetPublicKey) as AccountInfo);
    await api.disconnect();
    return account.data.free.toString();
  } catch (error) {
    console.log((error instanceof AxiosError) ? error.response?.data.message : "");
    return null;
  };
};