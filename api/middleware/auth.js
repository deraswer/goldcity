// authMiddleware.js
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const token = req.header("authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET || "hello", (error, decoded) => {
        if (error) reject(error);
        else resolve(decoded);
      });
    });

    req.user = decoded;
    if (!req.user.walletAddress) {
      return res.status(401).json({ msg: "Token missing walletAddress" });
    }
    next();
  } catch (error) {
    console.error("Token verification error:", error.message); // Отладка
    res.status(401).json({ msg: "Token is not valid", error: error.message });
  }
};

export default authMiddleware;
