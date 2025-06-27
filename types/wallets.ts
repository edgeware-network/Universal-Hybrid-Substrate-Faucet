export interface DotWallet {
	id: string;
	name: string;
	platforms: DotWalletPlatform[];
	urls: {
		website: string;
		chromeExtension?: string;
		firefoxExtension?: string;
		iosApp?: string;
		androidApp?: string;
	};
	logoUrls: string[];
}
export enum DotWalletPlatform {
	Browser = "browser",
	Android = "android",
	iOS = "ios",
}
