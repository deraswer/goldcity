import mongoose from "mongoose";

const transferSchema = new mongoose.Schema({
  transferId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
});

const verificationSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  did: { type: String, required: true },
  status: {
    type: String,
    enum: ["PENDING", "VERIFIED", "REJECTED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
});

const Transfer = mongoose.model("Transfer", transferSchema);
const Verification = mongoose.model("Verification", verificationSchema);

export { Transfer, Verification };
