import { chains } from "@/constants/chains";
import { env } from "@/lib/env";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { AccountInfo } from "@polkadot/types/interfaces";
import {
	cryptoWaitReady,
	decodeAddress,
	encodeAddress,
} from "@polkadot/util-crypto";

type Data = {
	address: string;
	amount: string;
};

export function loadFaucetDotAccount() {
	const seed = env.FAUCET_ACCOUNT_SEED;

	if (!seed) {
		throw new Error("Missing FAUCET_ACCOUNT_SEED");
	}

	const account = new Keyring({ type: "sr25519" }).addFromUri(seed);

	return account;
}

export async function initDotAPI(rpc: string): Promise<ApiPromise> {
	await cryptoWaitReady();

	try {
		const wsProvider = new WsProvider(rpc);
		const api = await ApiPromise.create({
			provider: wsProvider,
			noInitWarn: true,
		});
		await api.isReady;

		return api;
	} catch (error) {
		const err = error as Error;
		return Promise.reject(err.message);
	}
}

export async function closeDotAPI(api: ApiPromise) {
	await api.disconnect();
}

export async function getDotBalances(api: ApiPromise) {
	const raw = (await api.query.system.account(
		env.FAUCET_SUBSTRATE_PUBLIC_KEY
	)) as AccountInfo;

	const balance = raw.data.free;
	return balance.toString();
}

export function convertAmount(amount: string, chain: string) {
	const decimals = chains.filter((c) => c.url === chain)[0].nativeCurrency.decimals;
	return (Number(amount) * Math.pow(10, decimals)).toString();

}

export async function transferDot(api: ApiPromise, data: Data) {
	try {
		const account = loadFaucetDotAccount();
		const hash = await api.tx.balances
			.transferKeepAlive(data.address, data.amount)
			.signAndSend(account, {
				withSignedTransaction: true,
			});
		const txHash = hash.toHex().toString();

		return { status: "success", data: txHash };
	} catch (error) {
		const err = error as Error;
		return { status: "failed", data: err.message };
	}
}

export function getEncodedAddress(address: string, chain: string) {
	const dotChains = chains.filter((c) => c.type === "substrate");

	const prefix = dotChains.find((c) => c.url === chain)?.prefix;
	return encodeAddress(decodeAddress(address), prefix);
}
