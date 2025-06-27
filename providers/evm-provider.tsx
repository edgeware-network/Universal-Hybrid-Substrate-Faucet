"use client";

import {
	EvmAccount,
	EvmExtensionAccount,
	InjectedEvmExtension,
	StoredEvmAccount,
} from "@/types/accounts";
import {
	createContext,
	useCallback,
	useEffect,
	useState,
	useSyncExternalStore,
} from "react";

declare global {
	interface WindowEventMap {
		"eip6963:announceProvider": CustomEvent<EIP6963AnnounceProviderEvent>;
	}
}
let providers: EIP6963ProviderDetail[] = [];

interface EvmContext {
	evmWallets: EIP6963ProviderDetail[];
	isInitializing: boolean;
	selectedEvmAccount: (EvmAccount & { extension: InjectedEvmExtension }) | null;
	setSelectedEvmAccount: (
		account: EvmAccount,
		extension: InjectedEvmExtension
	) => void;
	onToggleEvmExtension: (provider: EIP6963ProviderDetail) => void;
	availableEvmExtensions: string[];
	selectedEvmExtensions: InjectedEvmExtension[];
}

const EXTENSIONS_STORAGE_KEY = "evm:connected-extensions";
const SELECTED_ACCOUNT_KEY = "evm:selected-extension-account";

export const store = {
	value: () => providers,

	subscribe: (callback: () => void) => {
		function onAnnouncement(event: EIP6963AnnounceProviderEvent) {
			// Prevent adding a provider if it already exists in the list based on its uuid.
			if (providers.some((p) => p.info.uuid === event.detail.info.uuid)) return;

			// Add the new provider to the list and call the provided callback function.
			providers = [...providers, event.detail];
			callback();
		}

		window.addEventListener(
			"eip6963:announceProvider",
			onAnnouncement as unknown as EventListener
		);
		window.dispatchEvent(new Event("eip6963:requestProvider"));

		return () =>
			window.removeEventListener(
				"eip6963:announceProvider",
				onAnnouncement as unknown as EventListener
			);
	},
};

function getExtensionStore() {
	let connectEvmExtensions = new Map<string, EvmExtensionAccount>();
	const listeners = new Set<() => void>();
	let isRunning = false;

	const serverSnapshot = new Map<string, EvmExtensionAccount>();

	const getSnapshot = () => connectEvmExtensions;

	const update = () => {
		connectEvmExtensions = new Map(connectEvmExtensions);
		localStorage.setItem(
			EXTENSIONS_STORAGE_KEY,
			JSON.stringify([...connectEvmExtensions.keys()])
		);
		listeners.forEach((listener) => listener());
	};

	const subscribe = (listener: () => void) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};

	const onToggleEvmExtension = async (provider: EIP6963ProviderDetail) => {
		if (isRunning) return;
		isRunning = true;

		try {
			if (connectEvmExtensions.has(provider.info.name)) {
				connectEvmExtensions.delete(provider.info.name);
			} else {
				try {
					const ethAccounts = (await provider.provider.request({
						method: "eth_requestAccounts",
					})) as string[];
					console.log(ethAccounts);
					const accounts = ethAccounts.map((address) => ({
						address,
						label: `${provider.info.name} ${
							ethAccounts.indexOf(address) + 1
						}`,
					}));
					const extension = {
						ext: provider.info,
						acc: accounts,
					};
					connectEvmExtensions.set(provider.info.name, {
						extension,
						accounts,
					});
				} catch (error) {
					if (
						error instanceof Error &&
						error.message === "Connection request was cancelled by the user."
					) {
						console.error(error.message);
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

	async function connectSavedExtensions(provider: EIP6963ProviderDetail) {
		if (typeof window === "undefined") return;

		const savedExtensions = localStorage.getItem(EXTENSIONS_STORAGE_KEY);

		if (!savedExtensions) return;

		const savedExtensionsArray = JSON.parse(savedExtensions) as string[];
		await Promise.all(
			savedExtensionsArray.map(async (name) => {
				if (!connectEvmExtensions.has(name)) {
					try {
						const ethAccounts = (await provider.provider.request({
							method: "eth_requestAccounts",
						})) as string[];
						const accounts = ethAccounts.map((address) => ({
							address,
							label: `${provider.info.name} ${
								ethAccounts.indexOf(address) + 1
							}`,
						}));
						const extension = {
							ext: provider.info,
							acc: accounts,
						};
						connectEvmExtensions.set(name, {
							extension,
							accounts,
						});
					} catch (error) {
						console.log(error);
					}
				}
			})
		);

		update();
	}

	return {
		subscribe,
		getSnapshot,
		getServerSnapshot: () => serverSnapshot,
		onToggleEvmExtension,
		connectSavedExtensions,
	};
}

const extensionStore = getExtensionStore();

export const EvmContext = createContext<EvmContext>({
	evmWallets: [],
	isInitializing: true,
	selectedEvmAccount: null,
	setSelectedEvmAccount: () => {},
	onToggleEvmExtension: () => {},
	availableEvmExtensions: [],
	selectedEvmExtensions: [],
});

export function EvmProvider({ children }: { children: React.ReactNode }) {
	const [isInitializing, setIsInitializing] = useState(true);
	const [availableEvmExtensions, setAvailableEvmExtensions] = useState<
		string[]
	>([]);
	const [selectedEvmAccount, _setSelectedEvmAccount] = useState<
		| (EvmAccount & {
				extension: InjectedEvmExtension;
		  })
		| null
	>(null);

	function setSelectedEvmAccount(
		account: EvmAccount,
		extension: InjectedEvmExtension
	) {
		_setSelectedEvmAccount({
			...account,
			extension,
		});

		const storedAccount: StoredEvmAccount = {
			extension: extension.ext.name,
			address: account.address,
		};

		localStorage.setItem(SELECTED_ACCOUNT_KEY, JSON.stringify(storedAccount));
	}

	const selectedEvmExtensions = useSyncExternalStore(
		extensionStore.subscribe,
		extensionStore.getSnapshot,
		extensionStore.getServerSnapshot
	);

	const evmWallets = useSyncExternalStore(
		store.subscribe,
		store.value,
		store.value
	);

	const restoreSelectedAccount = useCallback(() => {
		const storedAccountJson = localStorage.getItem(SELECTED_ACCOUNT_KEY);
		if (!storedAccountJson) return;

		try {
			const storedAccount = JSON.parse(storedAccountJson) as StoredEvmAccount;

			const extensionData = [...selectedEvmExtensions.values()].find(
				(ext) => ext.extension.ext.name === storedAccount.extension
			);

			if (!extensionData) return;

			const account = extensionData.accounts.find(
				(acc) => acc.address === storedAccount.address
			);

			if (account) {
				_setSelectedEvmAccount({
					...account,
					extension: extensionData.extension,
				});
			}
		} catch (error) {
			console.error("Error restoring selected account:", error);
			localStorage.removeItem(SELECTED_ACCOUNT_KEY);
		}
	}, [selectedEvmExtensions, _setSelectedEvmAccount]);

	useEffect(() => {
		async function initialize() {
			setAvailableEvmExtensions(
				evmWallets.map((provider) => provider.info.name)
			);
			await extensionStore.connectSavedExtensions(providers[0]);
			setIsInitializing(false);
		}
		initialize();
	}, [evmWallets]);

	useEffect(() => {
		if (selectedEvmExtensions.size > 0) {
			restoreSelectedAccount();
		}
	}, [selectedEvmExtensions, restoreSelectedAccount]);
	return (
		<EvmContext.Provider
			value={{
				evmWallets,
				isInitializing,
				selectedEvmAccount,
				setSelectedEvmAccount,
				onToggleEvmExtension: extensionStore.onToggleEvmExtension,
				availableEvmExtensions,
				selectedEvmExtensions: [...selectedEvmExtensions.values()].map(
					(ext) => ext.extension
				),
			}}
		>
			{children}
		</EvmContext.Provider>
	);
}
