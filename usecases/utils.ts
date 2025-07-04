import { RequestTokenEntity } from "@/entities/request-token";
import { UserEntity } from "@/entities/user";
import { RequestDTO, UserDTO } from "@/usecases/types";

export class ValidationError extends Error {
	private errors: Record<string, string | undefined>;
	constructor(errors: Record<string, string | undefined>) {
		super("A validation error occurred.");
		this.errors = errors;
	}
	getErrors() {
		return this.errors;
	}
}

export function userToAddEntryDtoMapper(user: UserEntity): UserDTO {
	return {
		address: user.getAddress(),
		chain: user.getChain(),
		amount: user.getAmount(),
		txhash: user.getTxhash(),
		createdAt: user.getCreatedAt(),
    ip: user.getIp(),
	};
}

export function reqToRequestTokenDtoMapper(req: RequestTokenEntity): RequestDTO {
  return {
    address: req.getAddress(),
    chain: req.getChain(),
    amount: req.getAmount(),
    isDot: req.getIsDot(),
  };
}
