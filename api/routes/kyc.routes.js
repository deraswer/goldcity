import express from "express";
import {
  initVerification,
  getVerificationStatus,
  getUserVerifications,
  generateProof,
} from "../controllers/kyc.controller.js";

const router = express.Router();

router.route("/init-verification").post(initVerification);
router.route("/verification/:verificationId").post(getVerificationStatus);
router.route("/verifications").post(getUserVerifications);
router.route("/proof/:verificationId").post(generateProof);

export default router;
