"use client";
import React from 'react';
import {useSearchParams, usePathname} from "next/navigation";
import { PiCaretDoubleRightBold } from "react-icons/pi";
import Link from 'next/link';
import { RxCross2 } from 'react-icons/rx';
import { WalletWidget } from './WalletWidget';
import { useFaucetContext } from '@/context';

const Modal= (): React.JSX.Element  => {
  const { state, handleConnect, handleDisconnect, ethereumAccounts, polkadotAccounts, setSelectedEthereumAccount, setSelectedPolkadotAccount } = useFaucetContext();
  const searchParams = useSearchParams();
  const modal = searchParams.get('connect');
  const pathname = usePathname();

  // console.log("inside modal:", state, ethereumAccounts, polkadotAccounts)

  return (
    <>{modal && 
        <dialog  className="z-20 bg-transparent w-[432px] h-[calc(100vh-16px)] fixed left-auto right-0 mr-2 inset-0 flex overflow-hidden rounded-[16px]" open>
          <div className="text-white w-[80px] hover:bg-[#4040402a] p-2">
          <Link href={pathname}>
            <button className="text-[#606060] w-full h-full flex items-start justify-start" type='button'>
              <PiCaretDoubleRightBold className="h-5 w-5" />
            </button>
          </Link>
          </div>
          <div className="bg-[#131313] w-full p-4 h-full flex flex-col gap-[20px] items-center border-2 border-[#252525] rounded-[12px]">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-[#eaeaea] text-base">Connect a wallet</h3>
              <Link href={pathname}>
                <button>
                  <RxCross2 className='text-[#eaeaea] h-5 w-5' />
                </button>
              </Link>
            </div>
            <div className="w-full flex flex-col gap-[10px] items-center">
              {!state.ethereumConnected &&
              <WalletWidget
                type='polkadot'
                connected={state.polkadotConnected}
                onConnect={handleConnect} 
                onDisconnect={handleDisconnect}
                accounts={polkadotAccounts}
                selectedAccount={state.selectedPolkadotAccount}
                setSelectedAccount={setSelectedPolkadotAccount}/>}
              
              {!state.polkadotConnected &&
              <WalletWidget
                type='ethereum'
                connected={state.ethereumConnected}
                onConnect={handleConnect} 
                accounts={ethereumAccounts}
                onDisconnect={handleDisconnect}
                selectedAccount={state.selectedEthereumAccount}
                setSelectedAccount={setSelectedEthereumAccount}/>}
            </div>
          </div>
      </dialog>}
    </>
  );
};

export default Modal;