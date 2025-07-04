import { RateLimitModel } from "@/db/rateLimit.model";

const MAX_REQUESTS_PER_CHAIN_PER_IP = 1;

export async function isRateLimited(
	ip: string,
	chain: string
): Promise<boolean> {
	const key = { ip, chain };
	const record = await RateLimitModel.findOne(key);

	if (record) return record.count >= MAX_REQUESTS_PER_CHAIN_PER_IP;

	return false;
}

export async function createRateLimitEntry(ip: string, chain: string) {

	const record = new RateLimitModel({ ip, chain, count: 1 });
	await record.save();


}
