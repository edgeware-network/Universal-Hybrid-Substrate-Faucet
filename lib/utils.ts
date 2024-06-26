import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { mnemonicToSeedSync } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";
import { cryptoWaitReady, decodeAddress, encodeAddress } from "@polkadot/util-crypto";
import { AccountInfo } from "@polkadot/types/interfaces";
import { AxiosError } from "axios";
import { Chain } from "@/constants/config";
import BigNumber from "bignumber.js";

export type DisburseChain = {
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
  if (!seed) {
    throw new Error("Faucet account seed not set");
  }
  const mnemonic = mnemonicToSeedSync(seed);
  const hd = hdkey.fromMasterSeed(mnemonic);
  const privateKey = hd.derivePath("m/44'/60'/0'/0/0").getWallet().getPrivateKey();
  const substrateAccount = new Keyring({ type: 'sr25519' }).addFromUri(seed);

  return { substrateAccount, privateKey: `0x${privateKey.toString('hex')}` };
}

export async function disburseSubstrateToken(chain: DisburseChain) {
  await cryptoWaitReady();
  try {
    const wsProvider = new WsProvider(chain.rpc);
    const api = await ApiPromise.create({ provider: wsProvider });

    await api.isReady;

    const transferAmount = chain.amount * 10 ** chain.nativeCurrency.decimals;
    const faucetBalance = Number((await api.query.system.account(process.env.FAUCET_SUBSTRATE_PUBLIC_KEY!) as AccountInfo).data.free.toString());

    console.log(`${chain.chain}:`, faucetBalance, transferAmount);

    if (faucetBalance > 0 && faucetBalance > transferAmount) {
      const transfer = api.tx.balances.transferKeepAlive(chain.address, transferAmount.toString());
      const hash = await transfer.signAndSend(loadFaucetAccount().substrateAccount);

      return `${hash}`;
    } else {
      return -1;
    }
  } catch (error: any) {
    console.log((error instanceof AxiosError) ? error.response?.data.message : error.message);
    return null;
  }
}

export async function disburseEvmToken(chain: DisburseChain) {
  await cryptoWaitReady();
  try {
    const web3 = new Web3(chain.rpc);

    const faucetBalance = Number(web3.utils.fromWei(await web3.eth.getBalance(process.env.FAUCET_EVM_ADDRESS!), 'ether'));
    const transferAmount = chain.amount;

    console.log(`${chain.chain}:`, faucetBalance, transferAmount);

    if (faucetBalance > 0 && faucetBalance > transferAmount) {
      const tx = {
        from: process.env.FAUCET_EVM_ADDRESS!,
        to: chain.address,
        value: web3.utils.toWei(transferAmount.toString(), 'ether'),
        gas: 21000,
        gasPrice: await web3.eth.getGasPrice(),
        nonce: await web3.eth.getTransactionCount(process.env.FAUCET_EVM_ADDRESS!)
      };

      console.log(tx);

      const signedTx = await web3.eth.accounts.signTransaction(tx, loadFaucetAccount().privateKey);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      console.log(receipt.transactionHash);

      return `${receipt.transactionHash}`;
    } else {
      return -1;
    }
  } catch (error: any) {
    console.log((error instanceof AxiosError) ? error.response?.data.message : error.message);
    return null;
  }
}

export async function getEvmBalances(chain: Chain) {
  console.log(`Connecting to ${chain.name}...`);
  await cryptoWaitReady();

  try {
    const web3 = new Web3(chain.rpcUrl);
    const faucetAccountAddress = process.env.FAUCET_EVM_ADDRESS!;
    const balance = web3.utils.fromWei(await web3.eth.getBalance(faucetAccountAddress), "wei");
    console.log(`${chain.name}: ${balance}`);
    return balance;
  } catch (error: any) {
    console.log(`getEvmBalances Worker: failed for reason: `, error);
    return null;
  }
}

async function createSubstrateApiWithRetry(rpcUrl: string, retries: number = 3, delayMs: number = 5000): Promise<ApiPromise> {
  let attempts = 0;
  while (attempts < retries) {
    try {
      const wsProvider = new WsProvider(rpcUrl);
      const api = await ApiPromise.create({ provider: wsProvider });
      await api.isReadyOrError;

      if (wsProvider.isConnected) {
        return api;
      } else {
        throw new Error('WebSocket not connected');
      }
    } catch (error: any) {
      attempts += 1;
      if (attempts >= retries) {
        throw new Error(`Failed to connect to Substrate API after ${retries} attempts: ${error.message}`);
      }
      console.log(`Retrying connection (${attempts}/${retries})...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error('Unable to create Substrate API');
}

export async function getSubstrateBalances(chain: Chain) {
  console.log(`Connecting to ${chain.name}...`);
  await cryptoWaitReady();

  try {
    const api = await createSubstrateApiWithRetry(chain.rpcUrl);
    const faucetPublicKey = process.env.FAUCET_SUBSTRATE_PUBLIC_KEY!;
    const account = (await api.query.system.account(faucetPublicKey) as AccountInfo);
    const balance = new BigNumber(account.data.free.toString());
    await api.disconnect();
    console.log(`${chain.name}: ${balance}`);
    return balance;
  } catch (error: any) {
    console.log(`getSubstrateBalances Worker: failed for reason: `, error);
    return null;
  }
}

export function disburse(toggle: boolean, address: string, amount: string, chain: Chain | undefined, chains: Chain[]) {
  if (toggle) {
    if (chain) return [{ chain: chain.name, address: address, amount: Number(amount), type: chain.type, rpc: chain.rpcUrl, nativeCurrency: chain.nativeCurrency }];
  } else {
    const data = chains.map((chain) => {
      // INFO: For now, we use 0.1% of the threshold as the amount
      return { chain: chain.name, address: chain.type === "substrate" ? encodeAddress(decodeAddress(address), chain.prefix) : address, amount: chain.threshold * 0.001, type: chain.type, rpc: chain.rpcUrl, nativeCurrency: chain.nativeCurrency };
    });

    return data;
  }
}
