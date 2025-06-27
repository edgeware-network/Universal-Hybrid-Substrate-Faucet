"use client";

import { dotwallets } from "@/components/account/wallets";
import { checkIsMobile } from "@/lib/utils";
import { DotContext } from "@/providers/dot-provider";
import { DotWallet, DotWalletPlatform } from "@/types/wallets";
import { use, useEffect, useState } from "react";
import { useMediaQuery } from "./use-media-query";

export function useDotWallets() {
	const [dotWallets, setDotWallets] = useState<DotWallet[]>([]);
	const { availableDotExtensions } = use(DotContext);
	const isMobile = useMediaQuery("(max-width: 640px)");

	useEffect(() => {
		const systemWallets = dotwallets
			.filter((wallet) =>
				checkIsMobile()
					? wallet.platforms.includes(DotWalletPlatform.Android) ||
					  wallet.platforms.includes(DotWalletPlatform.iOS)
					: wallet.platforms.includes(DotWalletPlatform.Browser)
			)
			.sort((a, b) =>
				availableDotExtensions.includes(a.id)
					? -1
					: availableDotExtensions.includes(b.id)
					? 1
					: 0
			);
		setDotWallets(systemWallets);
	}, [availableDotExtensions, isMobile]);

	return dotWallets;
}
