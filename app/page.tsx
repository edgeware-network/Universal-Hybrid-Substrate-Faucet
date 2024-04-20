"use client";
import Switch from '@/components/modals/Switch';
import { chains } from '@/constants/config';
import { useFaucetContext } from '@/context';
import { useSearchParams } from 'next/navigation';
import { KeyboardEvent, MouseEvent, useState } from 'react';
import { LuChevronsUpDown } from 'react-icons/lu';

export interface IUser {
  chain: string;
  address: string;
  amount: string;
};

export default function Home() {
  const { state, ethereumAccounts, polkadotAccounts } = useFaucetContext();
  const [user, setUser] = useState<IUser>({
    chain: "",
    address: "",
    amount: "",
  });
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const searchParams = useSearchParams();
  const switchToChain = searchParams.get('chain');
  const switchChain = chains.find((chain) => chain.url === switchToChain)?.name ?? "";

  const handleShowSwitchModal = () => {
    setShowSwitchModal(true);
  };

  const handleCloseSwitchModal = () => {
    setShowSwitchModal(false);
  };

  function getInitialChain(){
    if(state.ethereumConnected) {
    const selectedAccount = ethereumAccounts.find((account) => account.address === state.selectedEthereumAccount)
    const selectedChain = chains.find((chain) => chain.chainId === String((selectedAccount?.chainId)))
    return selectedChain?.name
    };
    if(state.polkadotConnected) {
      const selectedAccount = polkadotAccounts.find((account) => account.address === state.selectedPolkadotAccount)
      const selectedChain = chains.find((chain) => chain.name === selectedAccount?.chain)
      return selectedChain?.name
    };
  };
  
  function getAddress(){
    if(state.ethereumConnected) {
      const selectedAccount = ethereumAccounts.find((account) => account.address === state.selectedEthereumAccount)
      return selectedAccount?.address
    };
    if(state.polkadotConnected) {
      const selectedAccount = polkadotAccounts.find((account) => account.address === state.selectedPolkadotAccount)
      return selectedAccount?.address
    };
  };
  
  const address = getAddress() === undefined ? user.address : getAddress() ?? ""; 
  const chain = getInitialChain() === undefined ? switchChain === undefined ? user.chain : switchChain : getInitialChain() ?? "";

  const checkForNumbers = (event: KeyboardEvent<HTMLInputElement>) => {
		const neededChars = ["Backspace", "Tab", "Enter", ",", "."];
		// allow only numbers, backspace, tab, enter, comma and period
		if ((event.key.charCodeAt(0) < 48 || event.key.charCodeAt(0) > 57 || (event.key.startsWith("Numpad"))) && (!neededChars.includes(event.key))) {
			event.preventDefault();
		}
		// allow only one period
		if(event.currentTarget.value.split(".").length === 2 && (event.key === "." || event.key === ",")) {
			event.preventDefault();
		}
	};

  const getMaxAmount = (event: MouseEvent<HTMLButtonElement>) => {
    setUser({...user, amount: "10"});
    event.preventDefault();
  };

  return (
    <main className="relative top-[100px]">
      <div className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[4px] bg-[#131313] rounded-[12px]">
        <div className="flex flex-col items-center space-y-[5px]">
          <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
            <span className="text-xs text-[#9b9b9b]">Chain</span>
            <div className="flex items-center justify-between w-full">
              <input 
                type="text" 
                className="w-2/3 h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]" 
                value={chain} 
                onChange={(e) => setUser({ ...user, chain: e.target.value })}
                placeholder="Polkadot" />
              <button className="w-[120px] h-full p-2 flex gap-2 items-center justify-between bg-[#311C31] text-sm text-[#FC72FF] font-medium rounded-md outline-none" onClick={handleShowSwitchModal}>
                {!chain ? <p>Switch</p> : <p>{chains.find((a) => a.name === chain)?.nativeCurrency.symbol}</p>}
                <LuChevronsUpDown className='h-5 w-5' />
              </button>
              {showSwitchModal && <Switch onClose={handleCloseSwitchModal} />}
            </div>
            <span className="h-3 w-full text-[#9b9b9b] text-xs">
              {chain === "" ? "" : `You are on ${chain}`}
            </span>
          </div>
          <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
            <span className="text-xs text-[#9b9b9b]">Address</span>
            <div className="flex items-center justify-between w-full">
              <input 
                type="text" 
                className="w-full h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]" 
                value={address} 
                onChange={(e) => setUser({ ...user, address: e.target.value })}
                placeholder="0x" />
            </div>
            <span className="h-3 w-full text-[#9b9b9b] text-xs">
              {chain === "" ? "" : `Your ${chain} wallet address`}
            </span>
          </div>
          <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
            <span className="text-xs text-[#9b9b9b]">Amount</span>
            <div className="flex items-center justify-between w-full">
              <input 
                type="text" 
                className="w-1/2 h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]" 
                value={user.amount} 
                inputMode='decimal'
                onKeyDown={checkForNumbers}
                onChange={(e) => setUser({ ...user, amount: e.target.value.replace(",", ".") })}
                placeholder="0" />
              <button onClick={getMaxAmount} className="w-1/2 h-full p-2 flex gap-2 items-center justify-center bg-[rgba(0,102,255,0.1)] text-base text-[#0066FF] font-medium rounded-[8px] outline-none">Max</button>
            </div>
            <span className="text-[#9b9b9b] text-xs h-3 w-full">You can request up to 10 tokens.</span>
          </div>
        </div>
        <button type="submit" className="bg-[#311C31] text-[#FC72FF] w-full h-14 text-lg font-medium rounded-[10px]">Request tokens</button>
      </div>
    </main>
  );
};
