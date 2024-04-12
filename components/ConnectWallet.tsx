"use client";
import React, { useState } from 'react';
import { useFaucetContext } from '@/context';
import Connect from './modals/Connect';

export const dynamic = 'force-dynamic';

const ConnectWallet = (): React.JSX.Element => {
  const { state } = useFaucetContext();
  const address = state.ethereumConnected ? state.selectedEthereumAccount :  state.selectedPolkadotAccount;
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleShowConnectModal = () => {
    setShowConnectModal(true);
  };

  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
  };

  const truncate = (_walletAddress: string | undefined): string => {
    if (!_walletAddress) return ""
    return _walletAddress.substring(0,6) + "..." + _walletAddress.slice(-4);
  };

  return (
    <div>
      <button onClick={handleShowConnectModal} className="flex items-center justify-center px-4 py-2 bg-[#311C31] text-[#FC72FF] sm:text-base text-sm font-medium rounded-[10px] active:scale-95">
        {(state.ethereumConnected || state.polkadotConnected) 
          ? <span>{truncate(address)}</span> 
          : <span>Connect Wallet</span>}
      </button>
      {showConnectModal && <Connect onClose={handleCloseConnectModal} />}
    </div>
    );
};

export default ConnectWallet;