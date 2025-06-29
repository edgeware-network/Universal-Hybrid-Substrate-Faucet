"use server";

import { chains } from "@/constants/chains";
import { FaucetSchemaType } from "@/db/schema";
import { transferEvm } from "@/lib/ethers";
import {
	convertAmount,
	getEncodedAddress,
	initDotAPI,
	transferDot,
} from "@/lib/polkadot-api";
import { getMaxAmount } from "@/lib/utils";

export async function requestTokensAction(data: FaucetSchemaType) {
	// TODO: The form data u get must be validated first and then construct a request object to be sent request token usecase where this request object is executed.
	// TODO: Do something with the response from the usecase.
	// TODO: Captcha verification.

	const isDot = data.chains.every((chain) =>
		chains
			.filter((c) => c.type === "substrate")
			.map((c) => c.url)
			.includes(chain)
	);

	if (isDot) {
		//  dot request
		if (data.chains.length === 1) {
			//  single dot request
			const selectChains = data.chains.map(
				(chain) => chains.filter((c) => c.url === chain)[0]
			)[0];
			const api = await initDotAPI(selectChains.rpc);
			const amount = convertAmount(data.amount!, selectChains.url);
			const address = getEncodedAddress(data.address, selectChains.url);
			console.log(address, amount);
			const txhash = await transferDot(api, {
				address: address,
				amount: amount,
			});
			console.log(txhash.status, txhash.data);
		} else {
			//  multi dot request
			const selectChains = data.chains.map(
				(chain) => chains.filter((c) => c.url === chain)[0]
			);
			const result = await Promise.all(
				selectChains.map(async (chain) => {
					const api = await initDotAPI(chain.rpc);
					const amount = convertAmount(getMaxAmount(chain.url), chain.url);
					const address = getEncodedAddress(data.address, chain.url);
					return await transferDot(api, {
						address: address,
						amount: amount,
					});
				})
			);
			console.log(result);
		}
	} else {
		//  evm request
		const evm = chains.map((c) => c).filter((c) => c.type === "evm");
		const selectedChains = evm.filter((c) => data.chains.includes(c.url));
		if (data.chains.length === 1) {
			//  single evm request
			const result = await transferEvm(selectedChains[0].rpc, {
				address: data.address,
				amount: data.amount!,
			});
			console.log(result);
		} else {
			//  multi evm request
			const result = await Promise.all(
				selectedChains.map(async (chain) => {
					return await transferEvm(chain.rpc, {
						address: data.address,
						amount: getMaxAmount(chain.url),
					});
				})
			);
			console.log(result);
		}
	}
}
