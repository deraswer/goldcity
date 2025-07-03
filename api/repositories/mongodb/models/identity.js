import mongoose from "mongoose";

const IdentitySchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String, required: false },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const identityModel = mongoose.model("Identity", IdentitySchema);

export default identityModel;
