"use client";

import { NavigationButton } from "@/components/account";
import { Button, ViewNavigationProps } from "@/components/ui";
import { useDotWallets } from "@/hooks";
import { DotContext } from "@/providers/dot-provider";
import { EvmContext } from "@/providers/evm-provider";
import Image from "next/image";
import { use } from "react";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

interface WalletInfoProps {
	name: string;
	index: number;
	icon: string;
	accounts: number;
	isConnected: boolean;
	isId: boolean;
	id?: string;
	type: "evm" | "dot";
	provider?: EIP6963ProviderDetail;
	url: string;
}

function WalletInfo({
	name,
	index,
	provider,
	id,
	type,
	accounts,
	icon,
	isConnected,
	isId,
	url,
}: WalletInfoProps) {
	const { onToggleDotExtension } = use(DotContext);

	const { onToggleEvmExtension } = use(EvmContext);
	return (
		<Button
			className="flex items-center justify-between gap-2 rounded-[0.7rem] bg-background/10 border-2 border-border hover:bg-[#252525]/50 w-full p-4 h-16 cursor-pointer"
			key={index}
			onClick={() => {
				if (isId) {
					if (type === "evm" && provider) {
						console.log(provider);
						onToggleEvmExtension(provider);
					}
					if (type === "dot" && id) {
						onToggleDotExtension(id);
					}
				} else {
					window.open(url, "_blank");
				}
			}}
		>
			<div className="flex w-full items-center justify-between gap-2">
				<div className="flex items-center gap-2 justify-center">
					{isConnected ? (
						<div className="h-1 w-1 rounded-full bg-green-500" />
					) : (
						<div className="h-1 w-1 rounded-full bg-info" />
					)}
					{accounts > 0 ? (
						<span className="text-xs text-green-500 font-poppins font-semibold tracking-tight w-2">
							{accounts}
						</span>
					) : (
						<span className="text-xs text-info font-poppins font-semibold tracking-tight w-2">
							0
						</span>
					)}

					<Image
						src={icon}
						alt={name}
						width={16}
						height={16}
						priority
						className="h-6 w-6"
					/>
					<span className="text-base text-foreground font-semibold tracking-tight font-manrope">
						{name}
					</span>
				</div>
				<div className="text-info text-xs font-medium tracking-tight">
					{!isId ? (
						<span className="text-xs font-manrope font-medium text-secondary bg-secondary/10 px-10 py-1 rounded-sm tracking-tight">
							Install
						</span>
					) : isConnected ? (
						<span className="text-xs font-manrope font-medium text-tertiary bg-tertiary/10 px-6 py-1 rounded-sm tracking-tight">
							Disconnect
						</span>
					) : (
						<span className="text-xs font-manrope font-medium text-primary bg-primary/10 px-8 py-1 rounded-sm tracking-tight">
							Connect
						</span>
					)}
				</div>
			</div>
		</Button>
	);
}
export function WalletView({ next }: ViewNavigationProps) {
	const dotWallets = useDotWallets();
	const { availableDotExtensions, selectedDotExtensions } = use(DotContext);

	const { evmWallets, selectedEvmExtensions, availableEvmExtensions } =
		use(EvmContext);

	console.log(`selectedEvmExtensions`, selectedEvmExtensions);
	console.log(`availableEvmExtensions`, availableEvmExtensions);
	return (
		<div className="flex flex-col gap-2 p-2">
			<div className="flex flex-col gap-2 overflow-y-auto sm:max-h-[70vh] max-h-[45vh] pr-2">
				{dotWallets.map((wallet, index) => {
					const connectedExtension = selectedDotExtensions.find(
						(extension) => extension.name === wallet.id
					);
					const isConnected = !!connectedExtension;
					const accounts =
						connectedExtension
							?.getAccounts()
							.filter((acc) => acc.type === "sr25519").length ?? 0;
					return (
						<WalletInfo
							key={index}
							type="dot"
							name={wallet.name}
							index={index}
							id={wallet.id}
							accounts={accounts}
							icon={wallet.logoUrls[0]}
							isConnected={isConnected}
							isId={availableDotExtensions.includes(wallet.id)}
							url={wallet.urls.website}
						/>
					);
				})}
				{evmWallets.map((wallet, index) => {
					const connectedExtension = selectedEvmExtensions.find(
						(extension) => extension.ext.name === wallet.info.name
					);
					const isConnected = !!connectedExtension;
					const accounts = connectedExtension?.acc.length ?? 0;
					return (
						<WalletInfo
							key={index}
							name={wallet.info.name}
							index={index}
							type="evm"
							provider={wallet}
							accounts={accounts}
							icon={wallet.info.icon.trim()}
							isConnected={isConnected}
							isId={availableEvmExtensions.includes(wallet.info.name)}
							url={wallet.info.rdns}
						/>
					);
				})}
			</div>
			<NavigationButton
				Icon={MdOutlineKeyboardDoubleArrowRight}
				text="Manage accounts"
				onClick={next}
				disabled={
					!selectedEvmExtensions.length && !selectedDotExtensions.length
				}
			/>
		</div>
	);
}
