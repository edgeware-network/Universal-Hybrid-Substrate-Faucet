import { DotExtensionAccount, DotStoredAccount } from "@/types/accounts";
import {
	InjectedExtension,
	InjectedPolkadotAccount,
	connectInjectedExtension,
} from "@polkadot-api/pjs-signer";
import {
	createContext,
	useCallback,
	useEffect,
	useState,
	useSyncExternalStore,
} from "react";

interface DotContext {
	isInitializing: boolean;
	selectedDotAccount:
		| (InjectedPolkadotAccount & { extension: InjectedExtension })
		| null;
	setSelectedDotAccount: (
		extension: InjectedExtension,
		account: InjectedPolkadotAccount
	) => void;
	onToggleDotExtension: (name: string) => Promise<void>;
	availableDotExtensions: string[];
	selectedDotExtensions: InjectedExtension[];
}

const EXTENSIONS_STORAGE_KEY = "polkadot:connected-extensions";
const SELECTED_ACCOUNT_KEY = "polkadot:selected-extension-account";

const getExtensionsStore = () => {
	let connectedDotExtensions = new Map<string, DotExtensionAccount>();
	const listeners = new Set<() => void>();
	let isRunning = false;

	const serverSnapshot = new Map<string, DotExtensionAccount>();

	const getSnapshot = () => connectedDotExtensions;
	const update = () => {
		connectedDotExtensions = new Map(connectedDotExtensions);
		localStorage.setItem(
			EXTENSIONS_STORAGE_KEY,
			JSON.stringify([...connectedDotExtensions.keys()])
		);
		listeners.forEach((cb) => cb());
	};
	const subscribe = (cb: () => void) => {
		listeners.add(cb);
		return () => listeners.delete(cb);
	};

	const onToggleDotExtension = async (name: string) => {
		if (isRunning) return;
		isRunning = true;
		try {
			if (connectedDotExtensions.has(name)) {
				connectedDotExtensions.delete(name);
			} else {
				try {
					const extension = await connectInjectedExtension(name);
					const accounts = extension.getAccounts();
					connectedDotExtensions.set(name, { extension, accounts });
				} catch (error) {
					if (
						error instanceof Error &&
						error.message === "Connection request was cancelled by the user."
					) {
						console.log("Connection request was cancelled by the user.");
						return;
					}
					throw error;
				}
			}
			update();
		} finally {
			isRunning = false;
		}
	};

	const connectSavedExtensions = async () => {
		if (typeof window === "undefined") return;

		const savedExtensions = localStorage.getItem(EXTENSIONS_STORAGE_KEY);
		if (!savedExtensions) return;

		const extensionNames = JSON.parse(savedExtensions) as string[];
		await Promise.all(
			extensionNames.map(async (name) => {
				if (!connectedDotExtensions.has(name)) {
					try {
						const extension = await connectInjectedExtension(name);
						const accounts = await extension.getAccounts();
						connectedDotExtensions.set(name, { extension, accounts });
					} catch (error) {
						console.warn(`Failed to reconnect extension ${name}:`, error);
					}
				}
			})
		);
		update();
	};

	return {
		subscribe,
		getSnapshot,
		getServerSnapshot: () => serverSnapshot,
		onToggleDotExtension,
		connectSavedExtensions,
	};
};

const extensionsStore = getExtensionsStore();

const getJoinedInjectedExtensions = async () => {
	const { getInjectedExtensions } = await import("@polkadot-api/pjs-signer");
	return getInjectedExtensions().join(",");
};

export const DotContext = createContext<DotContext>({
	isInitializing: true,
	selectedDotAccount: null,
	setSelectedDotAccount: () => {},
	onToggleDotExtension: () => Promise.resolve(),
	availableDotExtensions: [],
	selectedDotExtensions: [],
});

export function DotProvider({ children }: { children: React.ReactNode }) {
	const [availableDotExtensions, setAvailableDotExtensions] = useState<
		string[]
	>([]);
	const [isInitializing, setIsInitializing] = useState<boolean>(true);
	const [selectedDotAccount, _setSelectedDotAccount] = useState<
		(InjectedPolkadotAccount & { extension: InjectedExtension }) | null
	>(null);

	function setSelectedDotAccount(
		extension: InjectedExtension,
		account: InjectedPolkadotAccount
	) {
		console.log("selected account", account);
		_setSelectedDotAccount({ ...account, extension });
		// Store selected account info
		const storedAccount: DotStoredAccount = {
			extensionName: extension.name,
			address: account.address,
		};
		localStorage.setItem(SELECTED_ACCOUNT_KEY, JSON.stringify(storedAccount));
	}

	const selectedDotExtensions = useSyncExternalStore(
		extensionsStore.subscribe,
		extensionsStore.getSnapshot,
		extensionsStore.getServerSnapshot
	);

	const restoreSelectedAccount = useCallback(async () => {
		const storedAccountJson = localStorage.getItem(SELECTED_ACCOUNT_KEY);
		if (!storedAccountJson) return;

		try {
			const storedAccount = JSON.parse(storedAccountJson) as DotStoredAccount;
			const extensionData = [...selectedDotExtensions.values()].find(
				(ext) => ext.extension.name === storedAccount.extensionName
			);

			if (!extensionData) return;

			const account = extensionData.accounts.find(
				(acc) => acc.address === storedAccount.address
			);

			if (account) {
				_setSelectedDotAccount({
					...account,
					extension: extensionData.extension,
				});
			}
		} catch (error) {
			console.warn("Failed to restore selected account:", error);
			localStorage.removeItem(SELECTED_ACCOUNT_KEY);
		}
	}, [selectedDotExtensions, _setSelectedDotAccount]);

	useEffect(() => {
		const initializeExtensions = async () => {
			const joinedExtensions = await getJoinedInjectedExtensions();
			setAvailableDotExtensions(joinedExtensions.split(","));
			await extensionsStore.connectSavedExtensions();
			setIsInitializing(false);
		};
		initializeExtensions();
	}, []);

	// Restore selected account after extensions are connected
	useEffect(() => {
		if (selectedDotExtensions.size > 0) {
			restoreSelectedAccount();
		}
	}, [selectedDotExtensions, restoreSelectedAccount]);

	return (
		<DotContext.Provider
			value={{
				isInitializing,
				selectedDotAccount,
				setSelectedDotAccount,
				onToggleDotExtension: extensionsStore.onToggleDotExtension,
				availableDotExtensions,
				selectedDotExtensions: [...selectedDotExtensions.values()].map(
					(ext) => ext.extension
				),
			}}
		>
			{children}
		</DotContext.Provider>
	);
}
