import express from "express";
import {
  requestVerification,
  bridgeTokens,
  getTokenTransferStatus,
  getVerificationStatus,
} from "../controllers/bridge.controller.js";

const router = express.Router();

router.route("/verifications").post(requestVerification);
router.route("/bridge-tokens").post(bridgeTokens);
router.route("/transfers/:transferId").get(getTokenTransferStatus);
router.route("/verifications/:requestId").get(getVerificationStatus);

export default router;
