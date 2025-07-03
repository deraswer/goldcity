import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";

import connectDB from "./repositories/mongodb/connect.js";
import { connectRedis } from "./repositories/redis/connect.js";

import userRouter from "./routes/user.routes.js";
import propertyRouter from "./routes/property.routes.js";
import authRouter from "./routes/auth.routes.js";
import authProfileRouter from "./routes/auth.profile.routes.js";
import didRouter from "./routes/did.routes.js";
import credRouter from "./routes/cred.routes.js";
import bridgeRouter from "./routes/bridge.routes.js";
import kycRouter from "./routes/kyc.routes.js";

import authMiddleware from "./middleware/auth.js";

const envPath =
  process.env.NODE_ENV === "production"
    ? new URL("../.env.prod", import.meta.url).pathname
    : new URL("../.env.development", import.meta.url).pathname;

dotenv.config({ path: envPath });

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.send({ message: "Server running!" });
});

app.use("/api/v1/users", authMiddleware, userRouter);
app.use("/api/v1/properties", propertyRouter);

app.use("/api/auth", authRouter);
app.use("/api/auth/profile", authMiddleware, authProfileRouter);
app.use("/api/identity", authMiddleware, didRouter);
app.use("/api/credential", authMiddleware, credRouter);
app.use("/api/admin/cross-chain", authMiddleware, bridgeRouter);
app.use("/api/kyc", authMiddleware, kycRouter);

const startServer = async () => {
  try {
    if (process.env.MONGODB_URL) {
      connectDB(process.env.MONGODB_URL);
    }
    if (process.env.REDIS_URL) {
      await connectRedis(process.env.REDIS_URL);
    }
    app.listen(process.env.PORT, () =>
      console.log("Server started on port 8080")
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
