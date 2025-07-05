import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
  verificationId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["PENDING", "VERIFIED", "REJECTED"],
    default: "PENDING",
  },
  createdAt: { type: Date, default: Date.now },
  proof: { type: String, default: null },
});

const KYCVerification = mongoose.model("KYCVerification", verificationSchema);

export default KYCVerification;
