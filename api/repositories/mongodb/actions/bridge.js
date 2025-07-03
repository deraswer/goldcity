import { Transfer, Verification } from "../models/bridge.js";

export const createVerification = async (data) => {
  const newVerification = new Verification(data);
  return await newVerification.save();
};

export const getVerificationByRequestId = async (requestId) => {
  return await Verification.findOne({ requestId });
};

export const createTransfer = async (data) => {
  const newTransfer = new Transfer(data);
  return await newTransfer.save();
};

export const getTransferByTransferId = async (transferId) => {
  return await Transfer.findOne({ transferId });
};
