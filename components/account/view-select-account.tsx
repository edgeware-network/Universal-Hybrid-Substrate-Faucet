"use client";

import { NavigationButton } from "@/components/account";
import { Button, Identicon, ViewNavigationProps } from "@/components/ui";
import { useDotWallets } from "@/hooks";
import { trimAddress } from "@/lib/utils";
import { DotContext } from "@/providers/dot-provider";
import { EvmContext } from "@/providers/evm-provider";
import { NavigationContext } from "@/providers/navigation-provider";
import Image from "next/image";
import { use } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";

function AccountInfo({
	address,
	logo,
	name,
}: {
	address: string;
	logo: string | undefined;
	name: string;
}) {
	return (
		<div className="flex w-full items-center justify-between gap-2">
			<Identicon className="h-10 w-10" address={address} />
			<div className="flex w-full flex-col items-start justify-center gap-1">
				<div className="flex items-center gap-1">
					{logo && (
						<Image
							src={logo}
							alt={name}
							width={32}
							height={32}
							priority
							className="h-4 w-4"
						/>
					)}
					<span className="text-foreground truncate text-sm font-bold">
						{name}
					</span>
				</div>
				<span className="text-info text-xs font-medium tracking-tight font-poppins">
					{trimAddress(address, 12)}
				</span>
			</div>
		</div>
	);
}
export function AccountView({ previous }: ViewNavigationProps) {
	const { setSelectedDotAccount, selectedDotExtensions } = use(DotContext);

	const { evmWallets, setSelectedEvmAccount, selectedEvmExtensions } =
		use(EvmContext);

	const { setIsWalletOpen, setSelectedAccount } = use(NavigationContext);

	const dotWallets = useDotWallets();

	return (
		<div className="flex flex-col gap-2 p-2">
			<div className="flex flex-col gap-2 overflow-y-auto px-2 grow max-h-[45vh] sm:max-h-[70vh]">
				{selectedDotExtensions.map((extension, index) => {
					const logo = dotWallets.find((wallet) => wallet.id === extension.name)
						?.logoUrls[0];
					return (
						<div key={index} className="flex flex-col gap-2">
							{extension.getAccounts().map((account, index) => {
								return (
									<Button
										key={index}
										className="font-manrope bg-background/10 border-2 border-border hover:bg-[#252525]/50 h-14 w-full cursor-pointer rounded-[0.6rem] p-2"
										onClick={() => {
											setSelectedDotAccount(extension, account);
											setSelectedAccount({
												extensionName: extension.name,
												address: account.address,
												AccountName: account.name ?? "Account",
											});
											setIsWalletOpen(false);
										}}
									>
										<AccountInfo
											address={account.address}
											logo={logo}
											name={account.name || ""}
										/>
									</Button>
								);
							})}
						</div>
					);
				})}
				{selectedEvmExtensions.map((extension, index) => {
					const logo = evmWallets.find(
						(wallet) => wallet.info.name === extension.ext.name
					)?.info.icon;
					return (
						<div key={index} className="flex flex-col gap-2">
							{extension.acc.map((account, index) => {
								return (
									<Button
										key={index}
										className="font-manrope bg-background/10 border-2 border-border hover:bg-[#252525]/50 h-14 w-full cursor-pointer rounded-[0.6rem] p-2"
										onClick={() => {
											setSelectedEvmAccount(account, extension);
											setSelectedAccount({
												extensionName: extension.ext.name,
												address: account.address,
												AccountName: account.label,
											});
											setIsWalletOpen(false);
										}}
									>
										<AccountInfo
											address={account.address}
											logo={logo?.trim()}
											name={account.label}
										/>
									</Button>
								);
							})}
						</div>
					);
				})}
			</div>
			<NavigationButton
				Icon={MdOutlineKeyboardDoubleArrowLeft}
				text="Manage wallets"
				onClick={previous}
				disabled={
					!selectedEvmExtensions.length && !selectedDotExtensions.length
				}
			/>
		</div>
	);
}
