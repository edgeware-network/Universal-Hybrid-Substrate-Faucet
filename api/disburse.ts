import { NextApiRequest, NextApiResponse } from 'next';
import { Chain, chains } from '../constants/config';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import Web3 from 'web3';
import { mnemonicToSeedSync } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';

type DisburseRequest = {
  chains: {
    name: string;
    type: string;
    address: string;
    amount: string;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chains }: DisburseRequest = req.body;

  try {
    const faucetAccount = loadFaucetAccount();
    const disbursements = chains.map(async ({ name, type, address, amount }) => {
      const chain = chains.find((c) => c.name === name);
      if (!chain) {
        return { error: `Chain ${name} not found` };
      }

      try {
        if (type === 'substrate') {
          return await disburseSubstrateToken(chain, faucetAccount, address, amount);
        } else if (type === 'evm') {
          return await disburseEvmToken(chain, faucetAccount, address, amount);
        } else {
          return { error: `Invalid chain type ${type}` };
        }
      } catch (error) {
        console.error(error);
        return { error: 'Internal server error' };
      }
    });

    const results = await Promise.all(disbursements);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    return res.status(200).json({ message: 'Tokens disbursed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function loadFaucetAccount() {
  const seed = process.env.FAUCET_ACCOUNT_SEED;

  if (!seed) {
    throw new Error('Faucet account seed not provided');
  }

  const keyring = new Keyring({ type: 'sr25519' });
  const substrateAccount = keyring.addFromUri(seed);

  const hdwallet = hdkey.fromMasterSeed(mnemonicToSeedSync(seed));
  const privateKey = hdwallet.derivePath("m/44'/60'/0'/0/0").privateKey;

  return { substrateAccount, privateKey: `0x${privateKey.toString('hex')}` };
}

async function disburseSubstrateToken(
  chain: Chain,
  faucetAccount: any,
  address: string,
  amount: string
) {
  const wsProvider = new WsProvider(chain.rpcUrl);
  const api = await ApiPromise.create({ provider: wsProvider });

  const transfer = api.tx.balances.transfer(address, amount);
  const hash = await transfer.signAndSend(faucetAccount.substrateAccount);

  console.log(
    `Disbursed ${amount} ${chain.nativeCurrency.symbol} to ${address} on ${chain.name}. Hash: ${hash.toHex()}`
  );

  return { success: true };
}

async function disburseEvmToken(
  chain: Chain,
  faucetAccount: any,
  address: string,
  amount: string
) {
  const web3 = new Web3(chain.rpcUrl);

  const faucetAccountAddress = web3.eth.accounts.privateKeyToAccount(
    faucetAccount.privateKey
  ).address;

  const tx = {
    from: faucetAccountAddress,
    to: address,
    value: web3.utils.toWei(amount, 'ether'),
    gas: 21000,
  };

  const signedTx = await web3.eth.accounts.signTransaction(
    tx,
    faucetAccount.privateKey
  );
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  console.log(
    `Disbursed ${amount} ${chain.nativeCurrency.symbol} to ${address} on ${chain.name}. Tx: ${receipt.transactionHash}`
  );

  return { success: true };
}
