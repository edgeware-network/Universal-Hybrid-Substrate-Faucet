import React from "react";
import type { Account, User } from "@/context";
import { RiArrowDownSLine } from "react-icons/ri";
import { FaPowerOff } from "react-icons/fa6";
import { Listbox } from "@headlessui/react";
import Image from "next/image";

type WalletProps = {
  accounts?: Account[];
  selectedAccount?: string;
  setSelectedAccount?: (account: string) => void;
  connected: boolean;
  user: User;
  setUser: (user: User) => void;
  type: "polkadot" | "ethereum";
  onConnect: (type: "polkadot" | "ethereum") => void;
  onDisconnect: (type: "polkadot" | "ethereum") => void;
};

export const WalletWidget = ({
  connected,
  user,
  setUser,
  type,
  onConnect,
  onDisconnect,
  accounts,
  selectedAccount,
  setSelectedAccount,
}: WalletProps) => {
  if (!connected) {
    const handleConnect = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onConnect(type);
    };

    return (
      <button
        className="flex w-full active:scale-95 bg-[#1b1b1b] hover:bg-[#2b2b2b] flex-row items-center rounded-[12px] text-white p-4"
        onClick={handleConnect}
      >
        <Image
          priority={true}
          src={`${type === "polkadot" ? "/polkadot.svg" : "/metamask.svg"}`}
          alt="logo"
          width={100}
          height={100}
          className="h-12 w-12"
        />
        <span className="mr-1 h-2 w-2 rounded-full bg-grey-500"></span>
        Connect {type === "polkadot" ? "Substrate" : "EVM"} Wallet
      </button>
    );
  }

  const handleDisconnect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onDisconnect(type);
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="w-full rounded border border-grey-700 p-4">
        <span>No accounts found</span>
      </div>
    );
  }

  if (!selectedAccount) {
    return null;
  }

  const fullSelectedAccount = accounts.find(
    (a) => a.address === selectedAccount
  )!;

  const truncate = (_walletAddress: string) => {
    if (!_walletAddress) return "";
    return _walletAddress.substring(0, 6) + "..." + _walletAddress.slice(-4);
  };

  // console.log(fullSelectedAccount, connected, accounts)
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex relative w-full h-20 bg-[#1b1b1b] flex-row items-center rounded-[12px] text-white p-4">
        <Listbox value={selectedAccount} onChange={setSelectedAccount}>
          <Listbox.Button className="flex w-full items-center">
            <span className="mr-4 h-2 w-2 shrink-0 rounded-full bg-green-500" />
            <span className="block grow text-left">
              <span className="flex items-center gap-1 w-full truncate">
                {fullSelectedAccount.balance && (
                  <span className="ml-2 text-xs text-grey-500">
                    {fullSelectedAccount.balance}
                  </span>
                )}
                <span className="block w-full truncate text-sm text-[#9b9b9b]">
                  {fullSelectedAccount.symbol}
                </span>
              </span>
              <span className="block w-full truncate text-sm text-[#5d4f4f]">
                {truncate(fullSelectedAccount.address)}
              </span>
            </span>
            <RiArrowDownSLine
              className={`ml-2 h-6 w-6 shrink-0 fill-grey-600 active:scale-95`}
            />
          </Listbox.Button>
          <Listbox.Options className="absolute right-0 top-[72px] mt-3 w-full overflow-auto rounded-[12px] bg-[#1b1b1b]">
            {accounts.map((account) => (
              <Listbox.Option
                key={account.address}
                value={account.address}
                className="flex cursor-pointer flex-row items-center p-4 text-left hover:bg-grey-800"
                onClick={() =>
                  setUser({
                    ...user,
                    address: account.address,
                  })
                }
              >
                <span
                  className={`mr-2 h-2 w-2 shrink-0 rounded-full ${
                    account.address === selectedAccount ? "bg-green-500" : ""
                  }`}
                />
                <span className="h-2 w-2 shrink-0" />
                <span className="block grow">
                  <span className="block w-full truncate text-sm text-[#9b9b9b]">
                    {truncate(account.address)}
                  </span>
                </span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>
      <button onClick={handleDisconnect}>
        <FaPowerOff
          className={`ml-2 text-red-500 h-6 w-6 shrink-0 fill-grey-600 cursor-pointer active:scale-9`}
        />
      </button>
    </div>
  );
};
