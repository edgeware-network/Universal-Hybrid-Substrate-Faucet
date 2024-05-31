import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { mnemonicToSeedSync } from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";
import { cryptoWaitReady, decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { AccountInfo } from "@polkadot/types/interfaces";
import { AxiosError } from "axios";
import { Chain } from "@/constants/config";

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

export async function disburseSubstrateToken(chain: DisburseChain) {
  await cryptoWaitReady();
  try {
    const wsProvider = new WsProvider(chain.rpc);
    const api = await ApiPromise.create({ provider: wsProvider });

    await api.isReady;

    const transferAmount = chain.amount * 10 ** (chain.nativeCurrency.decimals);
    const faucetBalance = Number((await api.query.system.account(process.env.FAUCET_SUBSTRATE_PUBLIC_KEY!) as AccountInfo).data.free.toString());

    console.log(`${chain.chain}:`, faucetBalance, transferAmount);

    if(faucetBalance > 0 && faucetBalance > transferAmount){
      const transfer = api.tx.balances.transferKeepAlive(chain.address, transferAmount.toString());
      const hash = await transfer.signAndSend(loadFaucetAccount().substrateAccount);
    
      return `${hash}`;

    } else {
      return -1;

    };
  
  } catch (error) {
    console.log((error instanceof AxiosError) ? error.response?.data.message : "");
    return null;

  };
};

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

    };

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

export function disburse(toggle: boolean, address: string, amount: string, chain: Chain | undefined, chains: Chain[]){
  if(toggle){
    if (chain) return [{chain: chain.name, address: address, amount: Number(amount), type: chain.type, rpc: chain.rpcUrl, nativeCurrency: chain.nativeCurrency}]

  } else {
    const data = chains.map((chain) => {
      // INFO: For now, we use 10% of the threshold as the amount
      return {chain: chain.name, address: chain.type === "substrate" ? encodeAddress(decodeAddress(address), chain.prefix) : address, amount:chain.threshold * 0.1, type: chain.type, rpc: chain.rpcUrl, nativeCurrency: chain.nativeCurrency}
    })

    return data
  };
};