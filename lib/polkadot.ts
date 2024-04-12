"use client";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import BigNumber from 'bignumber.js';

export const initPolkadotAPI = async (rpcUrl: string) => {
  const web3Enable = (await import('@polkadot/extension-dapp')).web3Enable;
  await web3Enable('Polkadot-JS Apps');

  const registry = new TypeRegistry();

  const api = await ApiPromise.create({
    provider: new WsProvider(rpcUrl),
    registry,
  });

  await api.isReady;
  return api;
};

export const getBigNumberAmount = (amount: number, chainDecimals: number) => {
  const bn = new BigNumber(amount).shiftedBy(chainDecimals);

  return bn.toFixed();
};