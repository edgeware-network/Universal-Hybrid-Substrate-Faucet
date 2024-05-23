"use client";
import { Chain } from "@/constants/config";
import { useFaucetContext } from "@/context";
import Image from "next/image";
import React, { useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

interface SelectorProps {
  queryChains: Chain[];
  onClose: () => void;
}

const Selector = ({
  queryChains,
  onClose,
}: SelectorProps): React.JSX.Element => {
  const { user, setUser, selectedChains, setSelectedChains } =
    useFaucetContext();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const westend_chains = queryChains.filter(
    (chain) => chain.chainType === "Westend & Parachain"
  );
  const rococo_chains = queryChains.filter(
    (chain) => chain.chainType === "Rococo & Parachain"
  );
  const paseo_chains = queryChains.filter(
    (chain) => chain.chainType === "Paseo & Parachain"
  );
  const solochains = queryChains.filter(
    (chain) => chain.chainType === "Solochain"
  );

  const all_chains = [
    {
      title: "Westend & Parachain",
      chains: westend_chains,
    },
    {
      title: "Rococo & Parachain",
      chains: rococo_chains,
    },
    {
      title: "Paseo & Parachain",
      chains: paseo_chains,
    },
    {
      title: "Solochains",
      chains: solochains,
    },
  ];

  const handleClick = (chain: Chain) => {
    let updatedSelectedChains: string[] = [];

    if (selectedChains.includes(chain.name)) {
      updatedSelectedChains = selectedChains.filter(
        (chainName) => chainName !== chain.name
      );
    } else {
      updatedSelectedChains = [...selectedChains, chain.name];
    }

    setSelectedChains(updatedSelectedChains);

    if (updatedSelectedChains.length === 0) {
      setSelectedType(null);
    } else if (chain.type === "substrate") {
      setSelectedType("substrate");
    } else if (chain.type === "evm") {
      setSelectedType("evm");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUser({ ...user, chain: selectedChains.toLocaleString() });
    onClose();
  };

  return (
    <form
      id="chain-selector"
      className="flex flex-col items-center justify-end space-y-5 p-1"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col w-full space-y-1">
        {all_chains.map((chain_group) => (
          <div key={chain_group.title} className="w-full p-1 space-y-1">
            <div className="inline-block w-full">
              <span className="text-[#9b9b9b] ml-2 p-2 text-sm">
                {chain_group.title}
              </span>
              <div className="border-b-2 ml-2 border-[#303030]" />
            </div>
            <div className="grid text-sm gap-1 grid-cols-2 font-medium items-center">
              {chain_group.chains.map((chain) => (
                <div
                  key={chain.url}
                  className={`${
                    selectedChains.includes(chain.name)
                      ? "text-[#fff] bg-[#c358c5]"
                      : "text-[#dadada] hover:bg-[#181818]"
                  } ${
                    selectedType && chain.type !== selectedType ? "hidden" : ""
                  } text-wrap text-center flex items-center ml-2 px-2 py-1 h-full rounded-md cursor-pointer`}
                  onClick={() => handleClick(chain)}
                >
                  <div className="flex items-center">
                    {selectedChains.includes(chain.name) && (
                      <IoMdCloseCircle
                        className="h-5 w-5 mr-2 text-[#131313]"
                        onClick={() => handleClick(chain)}
                      />
                    )}
                    <Image
                      src={`/images/${chain.url}.svg`} // Use the image from the config file
                      alt={chain.name}
                      width={20}
                      height={20}
                      className="h-6 w-6"
                    />
                    <span className="h-2 w-2 mr-2 flex shrink-0" />
                    <span>{chain.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="w-1/4 text-[#fff] bg-[rgba(0,102,255,0.7)] hover:bg-[rgba(0,102,255,0.9)] active:scale-95 p-2 rounded-[12px]"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
};

export default Selector;
