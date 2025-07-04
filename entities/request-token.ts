import z from "zod";

export class RequestTokenEntityValidationError extends Error {
	private errors: Record<string, string | undefined>;
	constructor(errors: Record<string, string | undefined>) {
		super("An error occurred while validating the request token entity.");
		this.errors = errors;
	}
	getErrors() {
		return this.errors;
	}
}
export class RequestTokenEntity {
	private address: string;
	private chain: string;
	private amount: string;
	private isDot: boolean;

	constructor({
		address,
		chain,
		amount,
		isDot,
	}: {
		address: string;
		chain: string;
		amount: string;
		isDot: boolean;
	}) {
		this.address = address;
		this.chain = chain;
		this.amount = amount;
		this.isDot = isDot;

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
  getIsDot() {
    return this.isDot;
  }

	private validate() {
		const requestTokenSchema = z.object({
			address: z.string().min(1),
			chain: z.string().min(1),
			amount: z.string().min(1),
			isDot: z.boolean(),
		});

		try {
			requestTokenSchema.parse(this);
		} catch (e) {
			const error = e as z.ZodError;
			const errors = error.flatten().fieldErrors;
			throw new RequestTokenEntityValidationError({
				address: errors.address?.[0],
				chain: errors.chain?.[0],
				amount: errors.amount?.[0],
				isDot: errors.isDot?.[0],
			});
		}
	}
}
