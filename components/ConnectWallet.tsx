import { useFaucetContext } from '@/context';
import Link from 'next/link';
import React from 'react';

const ConnectWallet = (): React.JSX.Element => {
  const { state } = useFaucetContext();
  const address = state.ethereumConnected ? state.selectedEthereumAccount :  state.selectedPolkadotAccount;
  const truncate = (_walletAddress: string | undefined): string => {
    if (!_walletAddress) return ""
    return _walletAddress.substring(0,6) + "..." + _walletAddress.slice(-4);
  }
  return (
    <Link href="?connect=true">
      <button className="flex items-center justify-center px-4 py-2 bg-[#311C31] text-[#FC72FF] sm:text-base text-sm font-medium rounded-[10px] active:scale-95">
        {(state.ethereumConnected || state.polkadotConnected) 
          ? <span>{truncate(address)}</span> 
          : <span>Connect Wallet</span>}
        </button>
    </Link>
    );
};

export default ConnectWallet;