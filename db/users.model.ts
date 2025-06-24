import mongoose from "mongoose";

const users = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	chain: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	txhash: {
		type: String,
		required: true,
	},
	createdAt: Date,
});

const User = mongoose.models.users || mongoose.model("users", users);

export default User;
