"use server";

import { chains } from "@/constants/chains";
import { requestToken } from "@/data-access/request-token/request-token.persistence";
import { faucetSchema } from "@/db/schema";
import { withRateLimit } from "@/lib/rate-limit";
import { action, ActionError } from "@/lib/safe-action";
import { getMaxAmount } from "@/lib/utils";
import { verifyHCaptcha } from "@/lib/verify-hcaptcha";
import { requestTokenUseCase } from "@/usecases/request-token.usecase";
import { Context, Data, Result } from "@/usecases/types";
import { headers } from "next/headers";
import { addEntryAction } from "./add-entry-action";

async function getClientIP(): Promise<string> {
	const h = await headers();
	return (
		h.get("x-forwarded-for")?.split(",")[0].trim() ||
		h.get("x-real-ip") ||
		"unknown"
	);
}

const rateLimitedRequestTokenUseCase = withRateLimit<Context, Data, Result>(
	requestTokenUseCase
);

export const requestTokensAction = action
	.inputSchema(faucetSchema)
	.action(async (data) => {
		// TODO: Captcha verification.

		console.log(data.parsedInput);

		const valid = await verifyHCaptcha(data.parsedInput.captchaToken);

		if (!valid) {
			throw new ActionError("Invalid CAPTCHA. Please try again.");
		}

		const isDot = data.parsedInput.chains.every((chain) =>
			chains
				.filter((c) => c.type === "substrate")
				.map((c) => c.url)
				.includes(chain)
		);

		const ip = await getClientIP();

		const disburses = await Promise.all(
			data.parsedInput.chains.map((chain) => {
				return rateLimitedRequestTokenUseCase(
					{
						requestToken: requestToken,
					},
					{
						address: data.parsedInput.address,
						chain: chain,
						amount:
							data.parsedInput.chains.length === 1
								? data.parsedInput.amount!
								: getMaxAmount(chain),
						isDot: isDot,
						ip: ip,
					}
				);
			})
		);

		for (const disburse of disburses) {
			if (disburse.status === "success") {
				await addEntryAction({
					address: disburse.data.address,
					chain: disburse.data.chain,
					amount: Number(disburse.data.amount),
					txhash: disburse.data.txHash,
					ip: ip,
				});
			}
		}

		return disburses;
	});
