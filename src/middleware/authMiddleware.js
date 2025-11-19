// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Tutor from "../models/Tutor.js";
import Institute from "../models/Institute.js";

export const protect = (allowedRoles = []) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change_this_secret");
    // decoded contains { id, role, iat, exp }
    req.user = { id: decoded.id, role: decoded.role };

    // optionally attach full user object
    if (decoded.role === "tutor") {
      req.userDoc = await Tutor.findById(decoded.id).select("-password").lean();
    } else if (decoded.role === "institute") {
      req.userDoc = await Institute.findById(decoded.id).select("-password").lean();
    }

    // if allowedRoles provided, check
    if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};
