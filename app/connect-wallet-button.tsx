"use client";
import { AccountView, WalletView } from "@/components/account";
import {
	Button,
	DialogView,
	Identicon,
	MultiViewDialog,
} from "@/components/ui";
import { trimAddress } from "@/lib/utils";
import { DotContext } from "@/providers/dot-provider";
import { EvmContext } from "@/providers/evm-provider";
import { NavigationContext } from "@/providers/navigation-provider";
import { use } from "react";

function Wallet({ address, name }: { address: string; name: string }) {
	return (
		<div className="font-manrope flex w-full items-center justify-between gap-3">
			<div className="flex w-full flex-col items-start justify-center">
				<span className="text-foreground truncate text-sm font-bold">
					{name}
				</span>
				<span className="text-[12px] font-medium font-poppins">
					{trimAddress(address, 6)}
				</span>
			</div>
		</div>
	);
}

export function ConnectWalletButton() {
	const { selectedDotExtensions } = use(DotContext);
	const { selectedEvmExtensions } = use(EvmContext);
	const { selectedAccount } = use(NavigationContext);

	const hasConnectedDotAccounts = selectedDotExtensions.some((ext) => {
		return ext.getAccounts().some((acc) => {
			return acc.address;
		});
	});

	const hasConnectedEvmAccounts = selectedEvmExtensions.some((ext) => {
		return ext.acc.some((acc) => {
			return acc.address;
		});
	});

	const views: DialogView[] = [
		{
			title: "Connect a wallet",
			description: "",
			content: ({ next, previous }) => (
				<WalletView next={next} previous={previous} />
			),
		},
		{
			title: "Select an account",
			description: "Which account would you like to use?",
			content: ({ previous }) => <AccountView previous={previous} />,
		},
	];

	return (
		<Button
			variant="quaternary"
			className="font-manrope font-medium font-stretch-condensed cursor-pointer text-base px-2.5 min-w-32 h-10 transition-colors active:scale-[0.99] tracking-normal rounded-[0.7rem] duration-100 z-0"
		>
			<MultiViewDialog
				views={views}
				initialView={hasConnectedDotAccounts || hasConnectedEvmAccounts ? 1 : 0}
				trigger={
					<div className="font-manrope font-medium">
						{(selectedDotExtensions.length > 0 ||
							selectedEvmExtensions.length > 0) &&
						selectedAccount ? (
							<Wallet
								address={selectedAccount.address}
								name={selectedAccount.AccountName}
							/>
						) : (
							"Connect"
						)}
					</div>
				}
			/>
			{selectedAccount &&
				(selectedDotExtensions.length > 0 ||
					selectedEvmExtensions.length > 0) && (
					<Identicon className="h-8 w-8" address={selectedAccount.address} />
				)}
		</Button>
	);
}
