import { UserEntity, UserEntityValidationError } from "@/entities/user";
import { AddEntry } from "@/usecases/types";
import { userToAddEntryDtoMapper, ValidationError } from "@/usecases/utils";

export async function addEntryUseCase(
	context: {
		addEntry: AddEntry;
	},
	data: {
		address: string;
		chain: string;
		amount: number;
		txhash: string;
    ip: string;
	}
) {
	try {
		const user = new UserEntity({
			address: data.address,
			chain: data.chain,
			amount: data.amount,
			txhash: data.txhash,
			createdAt: new Date(),
      ip: data.ip
		});
		context.addEntry(userToAddEntryDtoMapper(user));
	} catch (error) {
		const err = error as UserEntityValidationError;
		throw new ValidationError(err.getErrors());
	}
}
