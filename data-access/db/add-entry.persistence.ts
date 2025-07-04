"use server";

import { createRateLimitEntry } from "@/data-access/rate-limit/check-limit";
import { connectToDB } from "@/db/mongoose";
import User from "@/db/users.model";
import { UserDTO } from "@/usecases/types";

connectToDB();

export async function addEntry(user: UserDTO): Promise<void> {
	const newUser = new User({
		address: user.address,
		chain: user.chain,
		amount: user.amount,
		txhash: user.txhash,
		createdAt: user.createdAt,
	});

	await createRateLimitEntry(user.ip, user.chain);

	User.collection.createIndex(
		{ createdAt: 1 },
		{ expireAfterSeconds: 60 * 60 * 24 }
	);
	await newUser.save();
}
