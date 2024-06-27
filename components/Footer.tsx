import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub, FaHeartbeat } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import PolkaAssemblyLogo from "../public/polkaassembly_logo.svg";
import SubSquareLogo from "../public/subsquare_logo.svg";

const Footer = (): React.JSX.Element => {
  return (
    <div className="max-w-[1204px] w-[90vw] fixed bottom-5 h-14 flex justify-center items-center bg-[#1b1b1b] font-medium rounded-[10px]">
      <div className="flex flex-col items-center">
        <p className="text-xs font-medium text-[#656565] flex items-center justify-center">
          Made with&nbsp;
          <span className="text-pink-600 animate-pulse text-lg">
            <FaHeartbeat />
          </span>
          &nbsp;by Edgeware contributors
        </p>
        <p className="text-xs text-[#E6007A] font-bold">
          Funded by Polkadot Treasury - {new Date().getFullYear()}
        </p>
      </div>
      <div className="absolute right-5 flex space-x-2">
        <Link
          href="https://github.com/edgeware-network/Universal-Hybrid-Substrate-Faucet"
          title="GitHub"
        >
          <FaGithub className="h-6 w-6 hover:text-[#E6007A]" />
        </Link>
        <Link href="/" title="Twitter">
          <FaXTwitter className="h-6 w-6 hover:text-[#E6007A]" />
        </Link>
        <Link
          href="https://polkadot.polkassembly.io/referenda/541"
          title="Universal Hybrid Substrate Faucet Proposal"
        >
          <Image
            src={PolkaAssemblyLogo}
            alt="PolkaAssembly Logo"
            className="h-6 w-6"
          />
        </Link>
        <Link
          href="https://polkadot.subsquare.io/referenda/904"
          title="Top Up Request"
        >
          <Image src={SubSquareLogo} alt="Subsquare Logo" className="h-6 w-6" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
