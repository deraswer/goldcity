import express from "express";
import {
  initVerification,
  getVerificationStatus,
  getUserVerifications,
  getUserVerificationById,
  generateProof,
} from "../controllers/kyc.controller.js";

const router = express.Router();

router.route("/init-verification").post(initVerification);
router.route("/verification/:verificationId").post(getVerificationStatus);
router.route("/verifications").get(getUserVerifications);
router.route("/verifications/:verificationId").get(getUserVerificationById);
router.route("/proof/:verificationId").post(generateProof);

export default router;
