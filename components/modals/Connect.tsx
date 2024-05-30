"use client";
import React, { FC, useEffect } from "react";
import { PiCaretDoubleRightBold } from "react-icons/pi";
import { RxCross2 } from "react-icons/rx";
import { useFaucetContext } from "@/context";
import { WalletWidget } from "../WalletWidget";
import { gsap } from "gsap";

interface ConnectModalProps {
  onClose: () => void;
}

export const dynamic = "force-dynamic";

const Connect: FC<ConnectModalProps> = ({ onClose }: ConnectModalProps) => {
  useEffect(() => {
    const tl = gsap.timeline();

    // Animation for sliding in from the right
    tl.fromTo(".connect-modal", { x: "100%" }, { duration: 0.5, x: "0%" });

    return () => {
      tl.reverse(); // Reverse animation on unmount
    };
  }, []);

  const handleClose = () => {
    // Animation for sliding out to the right
    gsap.to(".connect-modal", {
      duration: 0.5,
      x: "100%",
      onComplete: onClose, // Call onClose after animation completes
    });
  };

  const {
    state,
    handleConnect,
    user,
    setUser,
    handleDisconnect,
    ethereumAccounts,
    polkadotAccounts,
    setSelectedEthereumAccount,
    setSelectedPolkadotAccount,
    toggle,
  } = useFaucetContext();

  return (
    <div className="connect-modal bg-transparent w-[432px] h-[calc(100vh-16px)] fixed left-auto right-0 mt-1 mr-2 inset-0 flex overflow-hidden rounded-[16px]">
      <div className="text-white w-[80px] hover:bg-[#4040402a] p-2">
        <button
          onClick={handleClose}
          className="text-[#606060] w-full h-full flex items-start justify-start"
          type="button"
        >
          <PiCaretDoubleRightBold className="h-5 w-5" />
        </button>
      </div>
      <div className="bg-[#131313] w-full p-4 h-full flex flex-col gap-[20px] items-center border-2 border-[#252525] rounded-[12px]">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-[#eaeaea] text-base">Connect a wallet</h3>
          <button onClick={handleClose} type="button">
            <RxCross2 className="text-[#eaeaea] h-5 w-5" />
          </button>
        </div>
        <div className="w-full flex flex-col gap-[10px] items-center">
          {!state.ethereumConnected && (
            <WalletWidget
              toggle={toggle}
              type="polkadot"
              connected={state.polkadotConnected}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              accounts={polkadotAccounts}
              user={user}
              setUser={setUser}
              selectedAccount={state.selectedPolkadotAccount}
              setSelectedAccount={setSelectedPolkadotAccount}
            />
          )}

          {!state.polkadotConnected && (
            <WalletWidget
              toggle={toggle}
              type="ethereum"
              connected={state.ethereumConnected}
              onConnect={handleConnect}
              accounts={ethereumAccounts}
              user={user}
              setUser={setUser}
              onDisconnect={handleDisconnect}
              selectedAccount={state.selectedEthereumAccount}
              setSelectedAccount={setSelectedEthereumAccount}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Connect;
