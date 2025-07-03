import KYCVerification from "../models/kyc.js";

export const createVerification = async (data) => {
  const newVerification = new KYCVerification(data);
  return await newVerification.save();
};

export const getVerificationById = async (verificationId) => {
  return await KYCVerification.findOne({ verificationId });
};

export const getVerificationsByWallet = async (walletAddress) => {
  return await KYCVerification.find({ walletAddress });
};

export const updateVerificationWithProof = async (verificationId, proof) => {
  return await KYCVerification.findOneAndUpdate(
    { verificationId },
    { proof },
    { new: true }
  );
};
