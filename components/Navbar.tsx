"use client";
import React from "react";
import ConnectWallet from "./ConnectWallet";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = (): React.JSX.Element => {
	const path = usePathname();

	return (
		<nav className="w-full h-[64px] z-10 top-0 left-0 flex fixed items-center backdrop-blur-[2px] justify-between bg-transparent p-2">
			<div className="flex items-center justify-center space-x-10">
				<h1 className="sm:text-xl text-lg font-semibold p-1.5 cursor-pointer">
					Universal Faucet
				</h1>
				<ul className="sm:flex text-sm flex-row hidden items-center justify-between space-x-5">
					<li
						className={`${path === "/" ? "text-[#EAEAEA] underline underline-offset-8" : "text-[#606060]"}`}
					>
						<Link href="/">
							<p>Faucet</p>
						</Link>
					</li>
					<li
						className={`${
							path === "/status" ? "text-[#EAEAEA] underline underline-offset-8" : "text-[#606060]"
						}`}
					>
						<Link href="/status">
							<p>Status</p>
						</Link>
					</li>
				</ul>
			</div>
			<ConnectWallet />
		</nav>
	);
};

export default Navbar;
