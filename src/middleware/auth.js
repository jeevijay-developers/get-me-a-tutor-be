// src/middlewares/auth.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// -------------------- AUTHENTICATE USER --------------------
export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id)
      .select("-password -emailOTPHash -phoneOTPHash");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("auth middleware error:", err?.message || err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}


// -------------------- ROLE CHECK MIDDLEWARE --------------------
export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}
