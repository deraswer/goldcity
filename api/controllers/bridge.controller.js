import {
  createVerification,
  getVerificationByRequestId,
  createTransfer,
  getTransferByTransferId,
} from "../repositories/mongodb/actions/bridge.js";
import crypto from "crypto";

const requestVerification = async (req, res) => {
  try {
    const { did, targetChain } = req.body;
    if (!did || !targetChain) {
      return res
        .status(400)
        .json({ message: "did and targetChain are required" });
    }

    const requestId = crypto.randomBytes(16).toString("hex");
    const newVerification = await createVerification({
      requestId,
      did,
      targetChain,
    });
    res.status(201).json({ success: true, requestId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bridgeTokens = async (req, res) => {
  try {
    const { targetChain, tokenAddress, amount } = req.body;
    if (!targetChain || !tokenAddress || !amount) {
      return res.status(400).json({
        message: "targetChain, tokenAddress, and amount are required",
      });
    }

    const transferId = crypto.randomBytes(16).toString("hex");
    const newTransfer = await createTransfer({
      transferId,
      targetChain,
      tokenAddress,
      amount,
    });
    res.status(201).json({ success: true, transferId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTokenTransferStatus = async (req, res) => {
  try {
    const { transferId } = req.params;
    if (!transferId) {
      return res.status(400).json({ message: "transferId is required" });
    }

    const transfer = await getTransferByTransferId(transferId);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    res.status(200).json({ success: true, status: transfer.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVerificationStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ message: "requestId is required" });
    }

    const verification = await getVerificationByRequestId(requestId);
    if (!verification) {
      return res.status(404).json({ message: "Verification not found" });
    }

    res.status(200).json({ success: true, status: verification.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  requestVerification,
  bridgeTokens,
  getTokenTransferStatus,
  getVerificationStatus,
};
