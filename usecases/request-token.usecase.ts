import {
	RequestTokenEntity,
	RequestTokenEntityValidationError,
} from "@/entities/request-token";
import { RequestToken } from "@/usecases/types";
import { reqToRequestTokenDtoMapper, ValidationError } from "@/usecases/utils";

export async function requestTokenUseCase(
	context: {
		requestToken: RequestToken;
	},
	data: {
		address: string;
		chain: string;
		amount: string;
		isDot: boolean;
	}
) {
	try {
		const req = new RequestTokenEntity({
			address: data.address,
			chain: data.chain,
			amount: data.amount,
      isDot: data.isDot,
		});

		return context.requestToken(reqToRequestTokenDtoMapper(req));
	} catch (error) {
		const err = error as RequestTokenEntityValidationError;
		throw new ValidationError(err.getErrors());
	}
}
