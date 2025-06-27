import {
	InjectedExtension,
	InjectedPolkadotAccount,
} from "@polkadot-api/pjs-signer";

export interface DotExtensionAccount {
	extension: InjectedExtension;
	accounts: InjectedPolkadotAccount[];
}

export interface DotStoredAccount {
	extensionName: string;
	address: string;
}

export interface InjectedEvmExtension {
	ext: EIP6963ProviderInfo;
	acc: EvmAccount[];
}
export interface EvmAccount {
	address: string;
	label: string;
}

export interface EvmExtensionAccount {
	extension: InjectedEvmExtension;
	accounts: EvmAccount[];
}

export interface StoredEvmAccount {
	extension: string;
	address: string;
}

export interface SelectedAccount {
	extensionName: string;
	address: string;
	AccountName: string;
}
