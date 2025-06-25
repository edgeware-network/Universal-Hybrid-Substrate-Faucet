type EVMChain = {
	chainId: number;
	type: "evm";
};

type SubstrateChain = {
	prefix: number;
	type: "substrate";
};

export type Chain = {
	name: string;
	url: string;
	rpc: string;
	threshold: number;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	group: string;
} & (EVMChain | SubstrateChain);

export type Chains = Chain[];
