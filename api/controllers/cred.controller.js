import {
  getCredentialsByDid,
  getCredentialByHash,
  createCredential,
  getCredentialByHashForVerify,
  updateCredentialStatus,
} from "../repositories/mongodb/actions/credential.js";
import crypto from "crypto";

const getCredentialsForSubject = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did) {
      return res.status(400).json({ message: "DID is required" });
    }

    const credentials = await getCredentialsByDid(did);
    res.status(200).json({ success: true, credentials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCredential = async (req, res) => {
  try {
    const { credentialHash } = req.params;
    if (!credentialHash) {
      return res.status(400).json({ message: "Credential hash is required" });
    }

    const credential = await getCredentialByHash(credentialHash);
    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }
    res.status(200).json({ success: true, credential });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const issueCredential = async (req, res) => {
  try {
    const { did, credentialType, issuerDid, metadata } = req.body;
    if (!did || !credentialType || !issuerDid) {
      return res.status(400).json({
        message: "DID, credentialType, and issuerDid are required",
      });
    }

    const credentialHash = crypto.randomBytes(16).toString("hex");
    const newCredential = await createCredential({
      did,
      credentialHash,
      credentialType,
      issuerDid,
      metadata,
    });
    res.status(201).json({ success: true, credential: newCredential });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyCredential = async (req, res) => {
  try {
    const { credentialHash } = req.body;
    if (!credentialHash) {
      return res.status(400).json({ message: "Credential hash is required" });
    }

    const credential = await getCredentialByHashForVerify(credentialHash);
    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    const isValid = credential.status === "ACTIVE";
    res.status(200).json({ success: true, isValid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const revokeCredential = async (req, res) => {
  try {
    const { credentialHash } = req.body;
    if (!credentialHash) {
      return res.status(400).json({ message: "Credential hash is required" });
    }

    const credential = await getCredentialByHashForVerify(credentialHash);
    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    await updateCredentialStatus(credentialHash, "REVOKED");
    res.status(200).json({ success: true, credential });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getCredentialsForSubject,
  getCredential,
  issueCredential,
  verifyCredential,
  revokeCredential,
};
