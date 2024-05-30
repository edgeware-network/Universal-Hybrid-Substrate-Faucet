"use client";
import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FiSearch } from "react-icons/fi";
import { GiCycle } from "react-icons/gi";
import { useFaucetContext } from "@/context";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { Chain, chains } from "@/constants/config";
import Selection from "../widgets/Selection";

type SwitchModalProps = {
  onClose: () => void;
  selectorMode: Chain[];
  switcherMode: Chain | undefined;
  setSelectorMode: (chains: Chain[]) => void;
  setSwitcherMode: (chain: Chain | undefined) => void;
}

export default function Switch({ selectorMode, setSelectorMode, switcherMode, setSwitcherMode, onClose }: SwitchModalProps){
  const {
    state,
    switchEthereumChain,
    switchPolkadotChain,
    toggle,
    setToggle,
    setUser,
    user,
  } = useFaucetContext();
  const [queryChain, setQueryChain] = useState("");

  useEffect(() => {
    localStorage.setItem("SET_SELECTED_CHAINS", JSON.stringify(selectorMode));

  },[selectorMode])

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLDivElement && e.target.id === "switch_modal")
      onClose();
  };

  const handleSwitch = (chain: Chain) => {
    if (state.ethereumConnected && chain.type === "evm") {
      switchEthereumChain(chain);
    }
    if (state.polkadotConnected && chain.type === "substrate") {
      switchPolkadotChain(chain);
    }
  };

  const queryChains = chains.filter((chain) => {
    if (state.ethereumConnected && chain.type === "evm") {
      return chain.name.toLowerCase().startsWith(queryChain.toLowerCase());
    }

    if (state.polkadotConnected && chain.type === "substrate") {
      return chain.name.toLowerCase().startsWith(queryChain.toLowerCase());
    }

    if (!state.ethereumConnected && !state.polkadotConnected) {
      return chain.name.toLowerCase().startsWith(queryChain.toLowerCase());
    }
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if(toggle){
      setSelectorMode([])
      localStorage.removeItem("SET_TYPE");
    } else {
      setSwitcherMode(undefined); 
    };
  };

  return (
    <div
      id="switch_modal"
      onClick={handleClose}
      className="z-40 bg-[rgba(0,0,0,0.6)] w-[100vw] h-[100vh] flex fixed items-center justify-center inset-0"
    >
      <div className="z-50 md:w-[65vw] w-[95vw] h-[calc(80vh-16px)] bg-[#131313] flex flex-col items-center gap-[16px] rounded-[16px] border-2 border-[#303030] p-4">
        <div className="flex items-center justify-between w-full h-[calc(10vh-16px)] gap-2 p-2">
          <div className="flex flex-row items-center justify-center w-full h-full p-4 bg-[#1a1a1a] rounded-[12px]">
            <FiSearch className="text-[#9b9b9b] h-5 w-5" />
            <span className="h-2 w-2 mr-1 block shrink-0" />
            <input
              type="search"
              className="bg-inherit w-full text-[#eaeaea] text-sm outline-none placeholder:text-[#5b5b5b] placeholder:text-sm"
              onChange={(e) => setQueryChain(e.target.value)}
              placeholder="Search chains"
            />
          </div>
          <div
            className="flex flex-row items-center justify-center p-2 bg-[#212121] rounded-[10px]"
            onClick={handleClick}
          >
            <HeadlessSwitch
              checked={toggle}
              onChange={setToggle}
              className="relative inline-flex h-6 w-6 items-center rounded-full "
            >
              <span className="sr-only text-white">Mode</span>
              <GiCycle
                className={`${
                  toggle ? "rotate-0" : "rotate-180"
                } inline-block h-10 w-10 transform text-[#ffffff] transition`}
              />
            </HeadlessSwitch>
          </div>
          <div className={`flex flex-row text-wrap text-center ${toggle ? "bg-[rgba(0,102,255,0.1)] text-[#0066ff]": "bg-[#311C31] text-[#FC72FF]"} items-center space-x-[5px] p-2 rounded-[16px] w-full h-full cursor-pointer`}>
            <span className="h-2 w-2 mr-2 block shrink-0" />
            {toggle ? (
              <span className="text-sm">Network Switcher</span>
            ) : (
              <span className="text-sm">Network Selector</span>
            )}
          </div>
          <button onClick={onClose}>
            <RxCross2 className="text-[#eaeaea] h-5 w-5 animate-pulse" />
          </button>
        </div>
        <div className="bg-black/30 w-full h-full p-2 flex flex-col gap-2 rounded-[12px] overflow-y-scroll">
          {toggle ? (
            <Selection user={user} switchChain={handleSwitch} setUser={setUser} options={queryChains} onClose={onClose} value={switcherMode} onChange={(o) => setSwitcherMode(o)}/>
          ) : (
            <Selection user={user} setUser={setUser} mode options={queryChains} onClose={onClose} value={selectorMode} onChange={(o) => setSelectorMode(o)}/>
          )}
        </div>
      </div>
    </div>
  );
};
