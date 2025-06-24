"use client";
import Image from "next/image";
import Link from "next/link";
import { ConnectWalletButton } from "./connect-wallet-button";

export function Header() {
	return (
		<header className="w-full h-14 sticky top-0 z-20 bg-background backdrop-blur-md p-2 mx-auto flex items-center justify-center gap-2">
			<nav className="flex flex-row justify-between items-center w-full h-12">
				<Link
					href="/"
					className="flex flex-row items-center gap-[4px] justify-center max-w-fit"
				>
					<Image
						src="/faucet.svg"
						alt="faucet"
						width={24}
						height={24}
						className="w-8 h-8 rounded-full"
						priority
					/>
					<h2 className="max-sm:hidden inline-block text-foreground text-2xl">
						Universal Faucet
					</h2>
				</Link>
				<ConnectWalletButton />
			</nav>
		</header>
	);
}
