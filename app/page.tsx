"use client";
import Switch from '@/components/modals/Switch';
import { Chain, chains } from '@/constants/config';
import { useFaucetContext } from '@/context';
import { Menu } from '@headlessui/react';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { KeyboardEvent, MouseEvent, useState } from 'react';
import { LuChevronsUpDown } from 'react-icons/lu';

export default function Home() {
  const { user, setUser, selectedChains, toggle } = useFaucetContext();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const handleShowSwitchModal = () => {
    setShowSwitchModal(true);
  };

  const handleCloseSwitchModal = () => {
    setShowSwitchModal(false);
  };
  
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

  const getAddress = (chain: string) => {
    const type = chains.find((c) => c.name === chain)?.type;
    if (type === "substrate") {
      const prefix = chains.find((c) => c.name === chain)?.prefix;
      const address = encodeAddress(decodeAddress(user.address), prefix);
      setUser({ ...user, address: address });
    };
  };

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    console.log(user);
  };

  return (
    <main className="relative top-[100px]">
      <div className="sm:flex hidden flex-col items-center justify-center gap-[8px] p-[4px] bg-[#131313] rounded-[12px]">
        <div className="flex flex-col items-center space-y-[5px]">
          <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
            <span className="text-xs text-[#9b9b9b] h-6">Chain</span>
            <div className="flex items-center justify-between w-full">
              <input 
                type="text" 
                className="w-2/3 h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]" 
                value={user.chain} 
                onChange={(e) => setUser({ ...user, chain: e.target.value })}
                placeholder="Polkadot" />
              {toggle
                ? <button className="w-[120px] h-full p-2 flex gap-2 items-center justify-between bg-[#311C31] text-sm text-[#FC72FF] font-medium rounded-md outline-none" onClick={handleShowSwitchModal}>
                    {!user.chain ? <p>Switch</p> : <p>{chains.find((a) => a.name === user.chain)?.nativeCurrency.symbol}</p>}
                    <LuChevronsUpDown className='h-5 w-5' />
                  </button>
                : <button className="w-[120px] h-full p-2 flex gap-2 items-center justify-between bg-[#311C31] text-sm text-[#FC72FF] font-medium rounded-md outline-none" onClick={handleShowSwitchModal}>
                    <p>Select</p>
                    <LuChevronsUpDown className='h-5 w-5' />
                  </button>}
              {showSwitchModal && <Switch onClose={handleCloseSwitchModal} />}
            </div>
            {toggle
              ? <span className="h-3 w-full text-[#9b9b9b] text-xs">
                  {user.chain === "" ? "" : `You are on ${user.chain}`}
                </span>
              : <span className="h-3 w-full text-[#9b9b9b] text-xs">
                {user.chain === "" ? "" : `You have selected ${selectedChains.length} chains`}
                </span>}
          </div>
          <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#404040]">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#9b9b9b] h-6">Address</span>
              {!toggle &&
                <Menu>
                  <Menu.Button className="text-[#0066ff] bg-[rgba(0,102,255,0.1)] px-2 py-1 rounded-md text-xs">Switch address</Menu.Button>
                  <Menu.Items className={`absolute left-auto right-0 top-[170px] z-50 mt-2 origin-bottom-right mr-4 w-[160px] rounded-md bg-[#131313] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-1`}>
                    {selectedChains.map((chain) => (
                      <Menu.Item key={chain}>
                        {({ active }) => (
                          <div
                            onClick={() => getAddress(chain)}
                            className={`cursor-pointer text-wrap text-start p-2 ${
                              active
                                ? 'bg-[rgba(0,102,255,0.1)] text-[#0066ff]'
                                : 'text-[#9b9b9b]'
                            } flex rounded-md items-center w-full text-xs`}
                          >
                            {chain}
                          </div>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Menu>}
            </div>
            <div className="flex items-center justify-between w-full">
              <input 
                type="text" 
                className="w-full h-10 text-3xl bg-inherit outline-none placeholder:text-[#5d5d5d]" 
                value={user.address} 
                onChange={(e) => setUser({ ...user, address: e.target.value })}
                placeholder="0x" />
            </div>
            {toggle
              ? <span className="h-3 w-full text-[#9b9b9b] text-xs">
                  {user.chain === "" ? "" : `Your ${user.chain} wallet address`}
                </span>
              : <span className="h-3 w-full text-[#9b9b9b] text-xs">
                {user.chain === "" ? "" : `Click on switch button to change address.`}
                </span>}
          </div>
          <div className="max-w-[568px] w-[100vw] bg-[#1b1b1b] flex flex-col space-y-[3px] items-start justify-center p-4 rounded-[12px] border-2 border-[#202020] focus-within:border-[#0e0909]">
            <span className="text-xs text-[#9b9b9b] h-6">Amount</span>
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
        <button type="submit" onClick={handleSubmit} className="bg-[#311C31] text-[#FC72FF] w-full h-14 text-lg font-medium rounded-[10px]">Request tokens</button>
      </div>
    </main>
  );
};
