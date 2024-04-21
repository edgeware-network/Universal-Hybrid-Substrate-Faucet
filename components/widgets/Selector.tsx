"use client";
import { Chain } from '@/constants/config';
import Image from 'next/image';
import React, { Fragment } from 'react';
import { GiCrossMark } from 'react-icons/gi';
import { RxCross2 } from 'react-icons/rx';

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
            {chain_group.chains.map(chain => (
              <Fragment key={chain.name}>
                {selectedChains.includes(chain.name) 
                ?
                  <div key={chain.url} className="text-[#9b9b9b] bg-[#131313] flex items-center justify-between ml-2 px-2 py-1 w-2/3 h-8 rounded-md cursor-pointer">
                    <div className="">{chain.name}</div>
                    <span className="h-2 w-2 mr-2 flex shrink-0" />
                    <RxCross2 className="h-4 w-4" onClick={() => handleClick(chain)} />
                  </div>
                :
                  <div key={chain.url} className="text-[#dadada] bg-[#131313] flex items-center ml-2 px-2 py-1 h-8 rounded-md cursor-pointer hover:bg-[#181818]">
                    <input type="checkbox" value={chain.name} name={chain.name} onChange={handleChange} checked={selectedChains.includes(chain.name)} />
                    <span className="h-1 w-1 mr-1 block shrink-0" />
                    <div className="flex items-center justify-center">
                      <Image src="/metamask.svg" alt={chain.name} width={20} height={20} className="h-6 w-6" />
                      <span className="h-2 w-2 mr-2 flex shrink-0" />
                      <span className="">{chain.name}</span>
                    </div>
                  </div>
                }                
              </Fragment>
            ))}
          </div> 
        </div>
      ))}
    </div>
  );
};

export default Selector;