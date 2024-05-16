"use client";
import { Chain } from "@/constants/config";
import { useFaucetContext } from "@/context";
import Image from "next/image";
import React, { Fragment } from "react";
import { RxCross2 } from "react-icons/rx";
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
  console.log(selectedChains);
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

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, checked } = event.target;
  //   if (checked) {
  //     setSelectedChains([...selectedChains, name]);
  //   } else {
  //     setSelectedChains(selectedChains.filter((chain) => chain !== name));
  //   }
  // };

  const handleClick = (chain: Chain) => {
    if (selectedChains.includes(chain.name)) {
      setSelectedChains(
        selectedChains.filter((chain_name) => chain_name !== chain.name)
      );
    } else {
      setSelectedChains([...selectedChains, chain.name]);
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
      className="flex flex-col items-center justify-end space-y-5 p-1 "
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
            <div className="grid text-sm gap-1 grid-cols-3 font-normal">
              {chain_group.chains.map((chain) => (
                <div
                  key={chain.url}
                  className={`${
                    selectedChains.includes(chain.name)
                      ? "text-[#fff] bg-[#c358c5]"
                      : "text-[#dadada] hover:bg-[#181818]"
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
                      src="/metamask.svg"
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
