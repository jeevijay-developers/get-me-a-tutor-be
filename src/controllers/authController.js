// src/controllers/authController.js
import Tutor from "../models/Tutor.js";
import Institute from "../models/Institute.js";
import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "change_this_secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

// Tutor register
export const tutorRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password, gender, address } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Name, email and password required" });
    }

    const exists = await Tutor.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

    const tutor = await Tutor.create({ name, email, phone, password, gender, address });
    // return token + tutor (omit password)
    const token = generateToken({ id: tutor._id, role: "tutor" });
    const t = await Tutor.findById(tutor._id).lean(); // password excluded by default
    res.status(201).json({ success: true, data: { ...t, token } });
  } catch (err) {
    next(err);
  }
};

// Tutor login
export const tutorLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    const tutor = await Tutor.findOne({ email }).select("+password");
    if (!tutor) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await tutor.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken({ id: tutor._id, role: "tutor" });
    // return tutor without password
    const t = await Tutor.findById(tutor._id).lean();
    res.json({ success: true, data: { ...t, token } });
  } catch (err) {
    next(err);
  }
};

// Institute register
export const instituteRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password, address, description } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Name, email and password required" });
    }

    const exists = await Institute.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

    const inst = await Institute.create({ name, email, phone, password, address, description });
    const token = generateToken({ id: inst._id, role: "institute" });
    const i = await Institute.findById(inst._id).lean();
    res.status(201).json({ success: true, data: { ...i, token } });
  } catch (err) {
    next(err);
  }
};

// Institute login
export const instituteLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

    const inst = await Institute.findOne({ email }).select("+password");
    if (!inst) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await inst.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken({ id: inst._id, role: "institute" });
    const i = await Institute.findById(inst._id).lean();
    res.json({ success: true, data: { ...i, token } });
  } catch (err) {
    next(err);
  }
};
