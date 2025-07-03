import express from "express";
import { createDID, getDIDByID } from "../controllers/did.controller.js";

const router = express.Router();

router.route("/did/:id").get(getDIDByID);
router.route("/did").post(createDID);

export default router;
