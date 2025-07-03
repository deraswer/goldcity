import express from "express";
import {
  getChallenge,
  verifySignature,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/verify").post(verifySignature);
router.route("/challenge").post(getChallenge);
router.route("/logout").post(logout);

export default router;
