"use client";
import React, { FC } from 'react';
import { PiCaretDoubleRightBold } from "react-icons/pi";
import { RxCross2 } from 'react-icons/rx';
import { useFaucetContext } from '@/context';
import { WalletWidget } from '../WalletWidget';

interface ConnectModalProps{
  onClose: () => void;
};

export const dynamic = 'force-dynamic';

const Connect: FC<ConnectModalProps> = ({onClose}: ConnectModalProps) => {
  const { state, handleConnect, user, setUser, handleDisconnect, ethereumAccounts, polkadotAccounts, setSelectedEthereumAccount, setSelectedPolkadotAccount } = useFaucetContext();

  return (
    <div className="z-40 bg-transparent w-[432px] h-[calc(100vh-16px)] fixed left-auto right-0 mt-1 mr-2 inset-0 flex overflow-hidden rounded-[16px]" >
      <div className="text-white w-[80px] hover:bg-[#4040402a] p-2">
        <button onClick={onClose} className="text-[#606060] w-full h-full flex items-start justify-start" type='button'>
          <PiCaretDoubleRightBold className="h-5 w-5" />
        </button>
      </div>
      <div className="bg-[#131313] w-full p-4 h-full flex flex-col gap-[20px] items-center border-2 border-[#252525] rounded-[12px]">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[#eaeaea] text-base">Connect a wallet</h3>
            <button onClick={onClose} type='button'>
              <RxCross2 className='text-[#eaeaea] h-5 w-5' />
            </button>
        </div>
        <div className="w-full flex flex-col gap-[10px] items-center">
          {!state.ethereumConnected &&
          <WalletWidget
            type='polkadot'
            connected={state.polkadotConnected}
            onConnect={handleConnect} 
            onDisconnect={handleDisconnect}
            accounts={polkadotAccounts}
            user={user}
            setUser={setUser}
            selectedAccount={state.selectedPolkadotAccount}
            setSelectedAccount={setSelectedPolkadotAccount}/>}
          
          {!state.polkadotConnected &&
          <WalletWidget
            type='ethereum'
            connected={state.ethereumConnected}
            onConnect={handleConnect} 
            accounts={ethereumAccounts}
            user={user}
            setUser={setUser}
            onDisconnect={handleDisconnect}
            selectedAccount={state.selectedEthereumAccount}
            setSelectedAccount={setSelectedEthereumAccount}/>}
        </div>
      </div>
  </div>
  );
};

export default Connect;