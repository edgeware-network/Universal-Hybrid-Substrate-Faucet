"use client";
import { Chain } from '@/constants/config';
import Image from 'next/image';
import React from 'react';

interface SelectorProps {
  queryChains: Chain[];
};

const Selector = ({ queryChains }: SelectorProps): React.JSX.Element => {

  const westend_chains = queryChains.filter(chain => chain.chainType === "Westend & Parachain");
  const rococo_chains = queryChains.filter(chain => chain.chainType === "Rococo & Parachain");
  const paseo_chains = queryChains.filter(chain => chain.chainType === "Paseo & Parachain");
  const solochains = queryChains.filter(chain => chain.chainType === "Solochain");
  const [activeChain, setActiveChain] = React.useState<string>("");
  const [selectedChains, setSelectedChains] = React.useState<string[]>([]);
  console.log(selectedChains);
  const all_chains = [
    {
      title: 'Westend & Parachain',
      chains: westend_chains
    },
    {
      title: 'Rococo & Parachain',
      chains: rococo_chains
    },
    {
      title: 'Paseo & Parachain',
      chains: paseo_chains
    },
    {
      title: 'Solochains',
      chains: solochains
    }
  ];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {name, checked} = event.target;
    if (checked) {
      setSelectedChains([...selectedChains, name]);
    } else {
      setSelectedChains(selectedChains.filter((chain) => chain !== name));
    }
  };

  const handleClick = (chain: Chain) => {
    setActiveChain(chain.name);
    if (selectedChains.includes(chain.name)) {
      setSelectedChains(selectedChains.filter((chain_name) => chain_name !== chain.name));
    } else {
      setSelectedChains([...selectedChains, chain.name]);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-1 p-1">
      {all_chains.map(chain_group => (
        <div key={chain_group.title} className="w-full p-1 space-y-1">
          <div className="inline-block w-full">
            <span className="text-[#9b9b9b] ml-2 p-2 text-sm">{chain_group.title}</span>
            <div className="border-b-2 ml-2 border-[#303030]" />
          </div>
          <div className="grid text-sm gap-1 grid-cols-2 items-center font-bold">
            {chain_group.chains.map((chain) => (
              <div key={chain.name} id="current" className="text-[#dadada] bg-[#131313] flex items-center ml-2 px-2 py-1 h-full rounded-md cursor-pointer hover:bg-[#181818]" onClick={() => handleClick(chain)}>
                <div className="flex items-center justify-center space-x-1">
                  <input id={chain.name} type="checkbox" checked={selectedChains.includes(chain.name)} onChange={handleChange} value={chain.name} name={chain.name} />
                  <Image src="/metamask.svg" alt={chain.name} width={20} height={20} className="h-6 w-6" />
                  <span className="h-2 w-2 mr-2 flex shrink-0" />
                  <span className="">{chain.name}</span>
                </div>
              </div>
            ))}
          </div> 
        </div>
      ))}
    </div>
  );
};

export default Selector;