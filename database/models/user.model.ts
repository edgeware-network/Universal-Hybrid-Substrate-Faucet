import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  chain: {
    type: String,
    required: true,
  },
  txhash: {
    type: String,
    required: true,
  },
  expiresAt: Date,
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;