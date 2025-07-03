import express from "express";
import {
  getCredentialsForSubject,
  getCredential,
  issueCredential,
  verifyCredential,
  revokeCredential,
} from "../controllers/cred.controller.js";

const router = express.Router();

router.route("/subject/:did").get(getCredentialsForSubject);
router.route("/:credentialHash").get(getCredential);
router.route("/issue").post(issueCredential);
router.route("/verify").post(verifyCredential);
router.route("/revoke").post(revokeCredential);

export default router;
