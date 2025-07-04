import { z } from "zod";

type ValidatedFields = "address" | "chain" | "amount" | "txhash" | "ip";

export class UserEntityValidationError extends Error {
	private errors: Record<ValidatedFields, string | undefined>;

	constructor(errors: Record<ValidatedFields, string | undefined>) {
		super("An error occurred while validating the user entity.");
		this.errors = errors;
	}
	getErrors() {
		return this.errors;
	}
}

export class UserEntity {
	private address: string;
	private chain: string;
	private amount: number;
	private txhash: string;
	private createdAt: Date;
	private ip: string;

	constructor({
		address,
		chain,
		amount,
		txhash,
		createdAt,
		ip,
	}: {
		address: string;
		chain: string;
		amount: number;
		txhash: string;
		createdAt: Date;
		ip: string;
	}) {
		this.address = address;
		this.chain = chain;
		this.amount = amount;
		this.txhash = txhash;
		this.createdAt = createdAt;
		this.ip = ip;

		this.validate();
	}

	getAddress() {
		return this.address;
	}

	getChain() {
		return this.chain;
	}

	getAmount() {
		return this.amount;
	}

	getTxhash() {
		return this.txhash;
	}

	getCreatedAt() {
		return this.createdAt;
	}

	getIp() {
		return this.ip;
	}

	private validate() {
		const userSchema = z.object({
			address: z.string().min(1),
			chain: z.string().min(1),
			amount: z.number().min(1),
			txhash: z.string().min(1),
			createdAt: z.date(),
			ip: z.string().min(1),
		});

		try {
			userSchema.parse(this);
		} catch (e) {
			const error = e as z.ZodError;
			const errors = error.flatten().fieldErrors;
			throw new UserEntityValidationError({
				address: errors.address?.[0],
				chain: errors.chain?.[0],
				amount: errors.amount?.[0],
				txhash: errors.txhash?.[0],
				ip: errors.ip?.[0],
			});
		}
	}
}
