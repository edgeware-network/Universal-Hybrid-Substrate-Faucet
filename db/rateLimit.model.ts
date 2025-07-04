import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema({
	ip: { type: String, required: true },
	chain: { type: String, required: true },
	count: { type: Number, default: 1 },
	createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 }, // 24h TTL
});

rateLimitSchema.index({ ip: 1, chain: 1 }, { unique: true });

export const RateLimitModel =
	mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);

	