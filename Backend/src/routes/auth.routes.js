import express from "express";
import {
  signup,
  login,
  refreshToken,
  changePassword,
  logout,
  getMe,
} from "../controllers/auth.controller.js";
import authenticate from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);   // Silent token refresh — no auth needed

// Protected
router.get("/me", authenticate, getMe);
router.put("/change-password", authenticate, changePassword);
router.post("/logout", authenticate, logout);

export default router;