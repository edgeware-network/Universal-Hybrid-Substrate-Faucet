import { disburseDotTokens } from "@/lib/polkadot-api";
import { disburseEvmTokens } from "@/lib/web3";
import { DisbursedDTO, RequestDTO } from "@/usecases/types";

export async function requestToken(request: RequestDTO): Promise<DisbursedDTO> {
	if (request.isDot) {
		return await disburseDotTokens(
			request.chain,
			request.address,
			request.amount
		);
	} else {
		return await disburseEvmTokens(request.chain, {
			address: request.address,
			amount: request.amount,
		});
	}
}
