import { isRateLimited } from "@/data-access/rate-limit/check-limit";
import { DisbursedDTO } from "@/usecases/types";

export function withRateLimit<
	Context,
	Data extends { ip: string; chain: string; address: string; amount?: string },
	Result
>(useCase: (context: Context, data: Data) => Promise<Result>) {
	return async (context: Context, data: Data) => {
		const { ip, chain } = data;
		const limited = await isRateLimited(ip, chain);
		if (limited) {
			return {
				status: "rate-limit",
				data: {
					address: data.address,
					amount: data.amount!,
					chain: chain,
					txHash: "Rate limit exceeded!",
				},
			} as DisbursedDTO;
		}
		return await useCase(context, data);
	};
}
