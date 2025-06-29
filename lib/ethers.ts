import { env } from "@/lib/env";
import { loadFaucetEvmAccount } from "@/lib/scure-bip";
import { ethers } from "ethers";
import { Web3 } from "web3";

type Data = {
	address: string;
	amount: string;
};

export function getProvider(
	rpc: string,
	{ chainId, name }: { chainId: number; name: string }
) {
	return new ethers.providers.JsonRpcProvider(rpc, {
		chainId,
		name,
	});
}

export async function getEvmBalances(
	rpc: string,
	{ chainId, name }: { chainId: number; name: string }
) {
	const provider = getProvider(rpc, { chainId, name });
	const raw = await provider.getBalance(env.FAUCET_EVM_ADDRESS);

	const balances = ethers.utils.formatEther(raw);

	return Number(balances);
}

export async function getGasPrice(
	rpc: string,
	{ chainId, name }: { chainId: number; name: string }
) {
	const provider = getProvider(rpc, { chainId, name });
	const gas = await provider.getGasPrice();
	return gas;
}

export async function getNonce(
	rpc: string,
	{ chainId, name }: { chainId: number; name: string }
) {
	const provider = getProvider(rpc, { chainId, name });
	const nonce = await provider.getTransactionCount(env.FAUCET_EVM_ADDRESS);
	return nonce;
}

export function createEvmWallet(
	rpc: string,
	data: { chainId: number; name: string }
) {
	const privateKey = loadFaucetEvmAccount();

	const provider = getProvider(rpc, data);
	return new ethers.Wallet(privateKey, provider);
}

export async function contructEvmTx(
	rpc: string,
	data: Data,
	chainId: number,
	name: string
) {
	const price = await getGasPrice(rpc, { chainId, name });
	const nonce = await getNonce(rpc, { chainId, name });

	return {
		from: env.FAUCET_EVM_ADDRESS,
		to: data.address,
		value: ethers.utils.parseEther(data.amount),
		gas: 21000,
		gasPrice: price,
		nonce: nonce,
	};
}

export async function transferEvm(rpc: string, data: Data) {
	const web3 = new Web3(rpc);
	const price = await web3.eth.getGasPrice();
	const nonce = await web3.eth.getTransactionCount(env.FAUCET_EVM_ADDRESS);

	const faucetBalance = Number(
		web3.utils.fromWei(
			await web3.eth.getBalance(process.env.FAUCET_EVM_ADDRESS!),
			"ether"
		)
	);

	console.log(faucetBalance);
	const tx = {
		from: env.FAUCET_EVM_ADDRESS,
		to: data.address,
		value: web3.utils.toWei(data.amount, "ether"),
		gasLimit: 21000,
		gasPrice: price,
		nonce: nonce,
	};

	const signedTx = await web3.eth.accounts.signTransaction(
		tx,
		loadFaucetEvmAccount()
	);
	const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
	return receipt.transactionHash;
}
