import { chains as allChains } from "@/constants/chains";
import { hexToU8a, isHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { isAddress } from "web3-validator";
import { z } from "zod";

export const baseSchema = z.object({
	chains: z
		.array(z.string().min(1))
		.min(1)
		.nonempty("At least one chain is required"),
	address: z.string().min(1, "Address is required"),
	amount: z.string().optional(),
});

export const faucetSchema = baseSchema.superRefine((data, ctx) => {
	const { chains, amount, address } = data;

	const dotChains = allChains.reduce((acc, chain) => {
		if (chain.type === "substrate") acc.push(chain.url);
		return acc;
	}, [] as string[]);

	const evmChains = allChains.reduce((acc, chain) => {
		if (chain.type === "evm") acc.push(chain.url);
		return acc;
	}, [] as string[]);

	const onlyDot = chains.every((chain) => dotChains.includes(chain));
	const onlyEvm = chains.every((chain) => evmChains.includes(chain));

	const hasDot = chains.some((chain) => dotChains.includes(chain));
	const hasEvm = chains.some((chain) => evmChains.includes(chain));

	function isDotAddress(address: string) {
		try {
			const decoded = isHex(address)
				? hexToU8a(address)
				: decodeAddress(address);

			return decoded.length === 32;
		} catch {
			return false;
		}
	}

	function isEvmAddress(address: string) {
		return isAddress(address) && address.length === 42;
	}

	if (!isDotAddress(address) && !isEvmAddress(address)) {
		return ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invalid address format — must be Substrate or EVM address.",
			path: ["address"],
		});
	}

	if (hasDot && hasEvm)
		return ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Faucet supports one chain type per request",
			path: ["chains"],
		});

	if (onlyDot && isEvmAddress(address))
		return ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Looks like an EVM address — try a Substrate address instead",
			path: ["address"],
		});

	if (onlyEvm && isDotAddress(address))
		return ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Looks like an Substrate address — try an EVM address instead",
			path: ["address"],
		});

	if (!amount && chains.length < 2)
		return ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Amount is required",
			path: ["amount"],
		});
});

export type FaucetSchemaType = z.infer<typeof faucetSchema>;
