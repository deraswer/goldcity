import express from "express";
import { getUserProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(getUserProfile);

export default router;
