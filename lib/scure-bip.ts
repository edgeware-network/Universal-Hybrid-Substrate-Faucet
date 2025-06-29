import { env } from "@/lib/env";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";

export function loadFaucetEvmAccount() {
	const seed = env.FAUCET_ACCOUNT_SEED;

	if (!seed) {
		throw new Error("Missing FAUCET_ACCOUNT_SEED");
	}

	const mnemonic = mnemonicToSeedSync(seed);
	const hd = HDKey.fromMasterSeed(mnemonic);

	const hdwallet = hd.derive("m/44'/60'/0'/0/0").privateKey;

	if (!hdwallet) {
		throw new Error("Failed to derive private key");
	}
	return `0x${Buffer.from(hdwallet).toString("hex")}`;
}
