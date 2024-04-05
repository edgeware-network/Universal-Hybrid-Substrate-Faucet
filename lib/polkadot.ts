"use client";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import BigNumber from 'bignumber.js';

const getNetworkUrl = (network: string) => {
  return network === 'testnet' ? 'wss://beresheet.jelliedowl.net' : 'wss://edgeware.jelliedowl.net';
};

export const initPolkadotAPI = async (network = 'testnet') => {
  const web3Enable = (await import('@polkadot/extension-dapp')).web3Enable;
  await web3Enable('Polkadot-JS Apps');

  const polkadotUrl = getNetworkUrl(network);
  const registry = new TypeRegistry();

  const api = await ApiPromise.create({
    provider: new WsProvider(polkadotUrl),
    registry,
  });

  await api.isReady;
  return api;
};

export const getBigNumberAmount = (amount: number, chainDecimals: number) => {
  const bn = new BigNumber(amount).shiftedBy(chainDecimals);

  return bn.toFixed();
};