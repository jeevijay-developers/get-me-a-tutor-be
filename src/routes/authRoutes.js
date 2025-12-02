

import express from "express";
import { signup, verifyEmail, login ,resendEmailOTP,refreshToken,logout,forgotPassword,resetPassword} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/resend-email-otp", resendEmailOTP);
router.post("/login", login);

router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;

