import {
  createVerification,
  getVerificationById,
  getVerificationsByWallet,
  updateVerificationWithProof,
} from "../repositories/mongodb/actions/kyc.js";
import crypto from "crypto";

const initVerification = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: "walletAddress is required" });
    }

    const verificationId = crypto.randomBytes(16).toString("hex");
    const newVerification = await createVerification({
      verificationId,
      walletAddress,
    });
    res.status(201).json({ success: true, verificationId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const { verificationId } = req.params;
    if (!verificationId) {
      return res.status(400).json({ message: "verificationId is required" });
    }

    const verification = await getVerificationById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    res.status(200).json({ success: true, status: verification.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserVerifications = async (req, res) => {
  try {
    const verifications = await getVerificationsByWallet(
      req.user.walletAddress
    );
    res.status(200).json({ success: true, verifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateProof = async (req, res) => {
  try {
    const { verificationId } = req.params;
    if (!verificationId) {
      return res.status(400).json({ message: "verificationId is required" });
    }

    const verification = await getVerificationById(verificationId);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    if (verification.status !== "VERIFIED") {
      return res
        .status(400)
        .json({ message: "Verification must be VERIFIED first" });
    }

    const proof = crypto.randomBytes(32).toString("hex");
    const updatedVerification = await updateVerificationWithProof(
      verificationId,
      proof
    );
    res.status(200).json({ success: true, proof });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  initVerification,
  getVerificationStatus,
  getUserVerifications,
  generateProof,
};
