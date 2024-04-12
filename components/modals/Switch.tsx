"use client";
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { FiSearch } from "react-icons/fi";

import { useFaucetContext } from '@/context';
import { Chain, chains } from '@/constants/config';

const Switch = (): React.JSX.Element => {
  const { state, switchEthereumChain, switchPolkadotChain } = useFaucetContext();
  const searchParams = useSearchParams();
  const modal = searchParams.get('switch');
  const pathname = usePathname();
  const [queryChain, setQueryChain] = useState("");

  const handleSwitch = (chain: Chain) => {
    if (state.ethereumConnected && chain.type === "evm") {
      switchEthereumChain(chain);
    }
    if (state.polkadotConnected && chain.type === "substrate") {
      switchPolkadotChain(chain);
    }
  }

  const queryChains = chains.filter((chain) => {
    if (state.ethereumConnected && chain.type === "evm") {
      return chain.name.toLowerCase().startsWith(queryChain.toLowerCase())
    }
    
    if (state.polkadotConnected && chain.type === "substrate") {
      return chain.name.toLowerCase().startsWith(queryChain.toLowerCase())
    }

    if (!state.ethereumConnected && !state.polkadotConnected){
      return chain.name.toLowerCase().startsWith(queryChain.toLowerCase())
    }
  });

  return (
    <>{modal &&
      <dialog className="z-20 bg-[rgba(0,0,0,0.6)] w-[100vw] h-[100vh] flex fixed items-center justify-center inset-0" open>
        <form className="z-50 w-[432px] h-[calc(80vh-16px)] bg-[#131313] flex flex-col items-center gap-[16px] rounded-[16px] border-2 border-[#303030] p-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-[#eaeaea] text-base">Select a chain</h3>
            <Link href={pathname}>
              <button>
                <RxCross2 className="text-[#eaeaea] h-5 w-5 animate-pulse" />
              </button>
            </Link>
          </div>
          <div className="flex flex-row items-center justify-center w-full p-2 bg-[#1b1b1b] rounded-[10px] border border-[#252525]">
            <FiSearch className="text-[#9b9b9b] h-5 w-5" />
            <span className="h-2 w-2 mr-1 block shrink-0" />
            <input 
              type="search"
              className="bg-inherit w-full text-[#eaeaea] text-sm outline-none placeholder:text-[#5b5b5b] placeholder:text-sm"
              onChange={(e) => setQueryChain(e.target.value)}
              placeholder="Search chains"/>
          </div>
          <div className="text-sm w-full text-[#eaeaea] flex flex-wrap gap-[4px]">
            <div className="border-b-2 border-[#303030] w-full" />
            <span className="p-1.5"></span>
          </div>
          <div className="bg-black/30 w-full h-full p-2 flex flex-col gap-2 rounded-[12px] overflow-y-scroll">
            {queryChains.length === 0 
              ? <span className="text-[#9b9b9b] text-sm ml-2 p-2">No chains found</span>
              : queryChains.length > 1
                ? <span className="text-[#9b9b9b] text-sm ml-2 p-2">Popular chains</span> 
                : <span className="text-[#9b9b9b] text-sm ml-2 p-2">Search results</span>}
            {queryChains.map((chain, index) => (
              <div key={index} className="text-[#9b9b9b] w-full px-4 py-2 rounded-md flex items-center cursor-pointer hover:bg-[#181818]">
                <div>
                 <span className="h-2 w-2 mr-2 shrink-0 flex bg-green-600 rounded-full"></span>
                </div>
                <Link href={`/?chain=${chain.url}`} className="w-full">
                  {state.ethereumConnected || state.polkadotConnected 
                    ? <div onClick={() => handleSwitch(chain)} className="flex flex-col items-start text-sm text-[#eaeaea]">
                        <span className="ml-2">{chain.name}</span>
                        <span className="ml-2">{chain.nativeCurrency.symbol}</span>
                      </div>
                    : <div className="flex flex-col items-start text-sm text-[#eaeaea]">
                        <span className="ml-2">{chain.name}</span>
                        <span className="ml-2">{chain.nativeCurrency.symbol}</span>
                      </div>}
                </Link>
              </div>
            ))}
          </div>
        </form>
      </dialog>}
    </>
  );
};

export default Switch;