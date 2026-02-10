import express from "express";
import {
  signup,
  verifyEmail,
  login,
  resendEmailOTP,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  getUserById,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// auth
router.post("/signup", signup);
router.post("/login", login);

// email
router.post("/verify-email", verifyEmail);
router.post("/resend-email-otp", resendEmailOTP);

// tokens
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// user info (protected routes)
router.get("/me", auth, getMe);
router.get("/:id", auth, getUserById);

export default router;
