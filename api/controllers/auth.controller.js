import crypto from "crypto";
import {
  setChallenge,
  getChallengeByKey,
  deleteChallengeByKey,
} from "../repositories/redis/actions/challenge.js";
import { getIdentityByWalletAddress } from "../repositories/mongodb/actions/identity.js";
import jwt from "jsonwebtoken";

const getChallenge = async (req, res) => {
  try {
    const { walletAddress, chain } = req.body;

    if (!walletAddress || !chain) {
      return res
        .status(400)
        .json({ message: "walletAddress and chain are required" });
    }

    const challenge = `Sign this message to authenticate: ${walletAddress} on ${chain} - ${crypto
      .randomBytes(16)
      .toString("hex")}`;
    const key = `${walletAddress}:${chain}:${Date.now()}`;
    const success = await setChallenge(key, challenge);

    if (!success) {
      return res.status(500).json({ message: "Failed to store challenge" });
    }

    res.status(200).json({ challenge, key });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifySignature = async (req, res) => {
  try {
    const { walletAddress, signature, chain, key } = req.body;

    if (!walletAddress || !signature || !chain || !key) {
      return res.status(400).json({
        message: "walletAddress, signature, chain, and key are required",
      });
    }

    const storedChallenge = await getChallengeByKey(key);
    if (!storedChallenge) {
      return res.status(400).json({ message: "Invalid or expired challenge" });
    }

    if (signature && storedChallenge) {
      await deleteChallengeByKey(key);

      // Generate JWT token
      const token = jwt.sign(
        { walletAddress }, // Payload with walletAddress
        process.env.JWT_SECRET || "hello",
        { expiresIn: "1h" }
      );

      res.status(200).json({
        success: true,
        message: "Signature verified",
        token, // Return token to client
      });
    } else {
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.walletAddress) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const identity = await getIdentityByWalletAddress(req.user.walletAddress);

    if (!identity) {
      // If no identity found, return a default user profile
      return res.status(200).json({
        success: true,
        user: {
          did: null,
          walletAddress: req.user.walletAddress,
          name: null,
          email: null,
          description: null,
          kycVerified: false,
          createdAt: new Date(),
        },
      });
    }

    const response = {
      success: true,
      user: {
        did: identity._id.toString(),
        walletAddress: identity.walletAddress,
        name: identity.name,
        email: identity.email,
        description: identity.description,
        kycVerified: false,
        createdAt: identity.createdAt,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    req.session = null;
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getChallenge, verifySignature, getUserProfile, logout };
