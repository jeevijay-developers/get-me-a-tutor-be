// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP, hashOTP, verifyOTP } from "../utils/otp.js";
import { sendEmailOTP } from "../utils/email.js";
// import { sendPhoneOTP } from "../utils/whatsapp.js"; // not used anymore

// OTP expire time
const OTP_EXPIRE_MS = 10 * 60 * 1000; // 10 minutes

// JWT settings
const JWT_EXPIRES = "7d"; // change if you want shorter
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set in .env");
}

// ------------------ SIGNUP ------------------
export async function signup(req, res) {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check existing by email or phone
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) {
      return res.status(400).json({ message: "Email or phone already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate email OTP only
    const emailOTP = generateOTP();
    const emailOTPHash = hashOTP(emailOTP);
    const expiry = Date.now() + OTP_EXPIRE_MS;

    // create user (unverified email). We intentionally do NOT set phoneOTP fields.
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      emailOTPHash,
      emailOTPExpires: expiry
      // phoneOTPHash and phoneOTPExpires are NOT created here
    });

    // send email OTP
    try {
      await sendEmailOTP(email, emailOTP);
    } catch (err) {
      console.error("Email send failed:", err?.message || err);
      // continue — you can implement resend logic on frontend/backend
    }

    return res.status(201).json({
      message: "Signup successful. Please verify your email OTP (check your email).",
      userId: user._id
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ------------------ VERIFY EMAIL ------------------
export async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.emailOTPHash || !user.emailOTPExpires)
      return res.status(400).json({ message: "No pending email OTP" });

    if (user.emailOTPExpires < Date.now())
      return res.status(400).json({ message: "Email OTP expired" });

    const ok = verifyOTP(otp, user.emailOTPHash);
    if (!ok) return res.status(400).json({ message: "Invalid OTP" });

    user.emailVerified = true;
    user.emailOTPHash = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ------------------ (optional) VERIFY PHONE stub ------------------
// If you no longer want phone verification at all, remove this function and the route.
// For now it's commented out to show how it used to be.
// export async function verifyPhone(req, res) { ... }

// ------------------ LOGIN ------------------
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Provide identifier (email or phone) and password" });
    }

    // find by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // ONLY email verification is required now:
    if (!user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    // sign JWT
    const payload = { id: user._id.toString(), role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
