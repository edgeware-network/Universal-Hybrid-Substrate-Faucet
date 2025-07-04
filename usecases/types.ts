export type RequestDTO = {
	chain: string;
	address: string;
	amount: string;
	isDot: boolean;
};

export type DisbursedDTO = {
	status: string;
	data: {
		address: string;
		amount: string;
		chain: string;
		txHash: string;
	};
};
export type RequestToken = (data: RequestDTO) => Promise<DisbursedDTO>;

export type UserDTO = {
	address: string;
	chain: string;
	amount: number;
	txhash: string;
	createdAt: Date;
  ip: string;
};

export type AddEntry = (user: UserDTO) => void;

export type Context = { requestToken: RequestToken };
export type Data = {
	chain: string;
  ip: string;
	address: string;
	amount: string;
	isDot: boolean;
};
export type Result = DisbursedDTO;
