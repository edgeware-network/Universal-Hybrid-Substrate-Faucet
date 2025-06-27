"use client";
import { useMediaQuery } from "@/hooks";
import { SelectedAccount } from "@/types/accounts";
import { createContext, useCallback, useEffect, useState } from "react";

interface NavigationContext {
	isMobile: boolean;
	isWalletOpen: boolean;
	setIsWalletOpen: (isWalletOpen: boolean) => void;
	isEvmWalletOpen: boolean;
	setIsEvmWalletOpen: (isEvmWalletOpen: boolean) => void;
	isDotWalletOpen: boolean;
	setIsDotWalletOpen: (isDotWalletOpen: boolean) => void;
	selectedAccount: SelectedAccount | null;
	setSelectedAccount: (account: SelectedAccount | null) => void;
}

const SELECTED_ACCOUNT_KEY = "selected-account";

export const NavigationContext = createContext<NavigationContext>({
	isMobile: false,
	isWalletOpen: false,
	setIsWalletOpen: () => {},
	isEvmWalletOpen: true,
	setIsEvmWalletOpen: () => {},
	isDotWalletOpen: true,
	setIsDotWalletOpen: () => {},
	selectedAccount: null,
	setSelectedAccount: () => {},
});

export function NavigationProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
	const [isEvmWalletOpen, setIsEvmWalletOpen] = useState<boolean>(true);
	const [isDotWalletOpen, setIsDotWalletOpen] = useState<boolean>(true);
	const [selectedAccount, _setSelectedAccount] =
		useState<SelectedAccount | null>(null);

	const isMobile = useMediaQuery("(max-width: 640px)");

	function setSelectedAccount(account: SelectedAccount | null) {
		if (account) {
			_setSelectedAccount(account);
			const storedAccount: SelectedAccount = {
				extensionName: account?.extensionName,
				address: account?.address,
				AccountName: account?.AccountName,
			};
			localStorage.setItem(SELECTED_ACCOUNT_KEY, JSON.stringify(storedAccount));
		}
	}

	const restoreSelectedAccount = useCallback(() => {
		const storedAccount = localStorage.getItem(SELECTED_ACCOUNT_KEY);

		if (!storedAccount) return;

		try {
			const parsedAccount = JSON.parse(storedAccount) as SelectedAccount;
			_setSelectedAccount(parsedAccount);
		} catch (error) {
			console.error("Error parsing stored account:", error);
			localStorage.removeItem(SELECTED_ACCOUNT_KEY);
		}
	}, [_setSelectedAccount]);

	useEffect(() => {
		restoreSelectedAccount();
	}, [restoreSelectedAccount]);

	return (
		<NavigationContext.Provider
			value={{
				isMobile,
				isWalletOpen,
				setIsWalletOpen,
				isEvmWalletOpen,
				setIsEvmWalletOpen,
				isDotWalletOpen,
				setIsDotWalletOpen,
				selectedAccount,
				setSelectedAccount,
			}}
		>
			{children}
		</NavigationContext.Provider>
	);
}
