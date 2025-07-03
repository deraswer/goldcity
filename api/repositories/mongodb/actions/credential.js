import Credential from "../models/credential.js";

export const getCredentialsByDid = async (did) => {
  return await Credential.find({ did });
};

export const getCredentialByHash = async (credentialHash) => {
  return await Credential.findOne({ credentialHash });
};

export const createCredential = async (data) => {
  const newCredential = new Credential(data);
  return await newCredential.save();
};

export const getCredentialByHashForVerify = async (credentialHash) => {
  return await Credential.findOne({ credentialHash });
};

export const updateCredentialStatus = async (credentialHash, status) => {
  return await Credential.findOneAndUpdate(
    { credentialHash },
    { status },
    { new: true }
  );
};
