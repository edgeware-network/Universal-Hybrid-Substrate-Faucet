import { isAddress } from "@polkadot/util-crypto";
import { ethers } from "ethers";
import { z } from "zod";

export const baseSchema = z.object({
	chains: z
		.array(z.string().min(1))
		.min(1)
		.nonempty("At least one chain is required"),
	address: z
		.string()
		.min(1, "Address is required")
		.refine(
			(address) => {
				return isAddress(address) || ethers.utils.isAddress(address);
			},
			{
				message: "Invalid address format",
			}
		),
	amount: z.string().optional(),
});

export const faucetSchema = baseSchema.superRefine((data, ctx) => {
	const { chains, amount } = data;

	if (!amount && chains.length < 2)
		return ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Amount is required",
			path: ["amount"],
		});
});

export type FaucetSchemaType = z.infer<typeof faucetSchema>;
