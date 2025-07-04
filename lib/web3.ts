import { chains } from "@/constants/chains";
import { env } from "@/lib/env";
import { loadFaucetEvmAccount } from "@/lib/scure-bip";
import { Web3 } from "web3";

type Data = {
	address: string;
	amount: string;
};

export async function disburseEvmTokens(
	name: string,
	data: Data
): Promise<{
	status: string;
	data: { address: string; amount: string; chain: string; txHash: string };
}> {
	const chain = chains
		.filter((c) => c.type === "evm")
		.find((c) => c.url === name)!;
	const web3 = new Web3(chain.rpc);
	const price = await web3.eth.getGasPrice();
	const nonce = await web3.eth.getTransactionCount(env.FAUCET_EVM_ADDRESS);

	const faucetBalance = Number(
		web3.utils.fromWei(
			await web3.eth.getBalance(process.env.FAUCET_EVM_ADDRESS!),
			"ether"
		)
	);

	const transferAmount = Number(web3.utils.fromWei(data.amount, "ether"));

	console.log(faucetBalance, transferAmount);
	const tx = {
		from: env.FAUCET_EVM_ADDRESS,
		to: data.address,
		value: web3.utils.toWei(data.amount, "ether"),
		gasLimit: 21000,
		gasPrice: price,
		nonce: nonce,
	};

	if (faucetBalance === 0) {
		return {
			status: "failed",
			data: {
				address: data.address,
				amount: data.amount,
				chain: chain.url,
				txHash: "No funds available!",
			},
		};
	}

	if (faucetBalance && transferAmount > faucetBalance) {
		return {
			status: "failed",
			data: {
				address: data.address,
				amount: data.amount,
				chain: chain.url,
				txHash: "Insufficient funds!",
			},
		};
	}

	try {
		const signedTx = await web3.eth.accounts.signTransaction(
			tx,
			loadFaucetEvmAccount()
		);
		const receipt = await web3.eth.sendSignedTransaction(
			signedTx.rawTransaction
		);
		return {
			status: "success",
			data: {
				address: data.address,
				amount: data.amount,
				chain: chain.url,
				txHash: receipt.transactionHash.toString(),
			},
		};
	} catch (error) {
		const err = error as Error;
		return {
			status: "failed",
			data: {
				address: data.address,
				amount: data.amount,
				chain: chain.url,
				txHash: err.message,
			},
		};
	}
}
