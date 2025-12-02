// src/routes/profileRoutes.js
import express from "express";
import auth, { allowRoles } from "../middleware/auth.js";
import { upsertTeacherProfile, getTeacherProfile } from "../controllers/teacherProfileController.js";

const router = express.Router();

// Create or update teacher profile (only tutors)
router.post("/teacher", auth, allowRoles("tutor"), upsertTeacherProfile);

// Get teacher profile by userId (auth optional but we call auth to know requester)
router.get("/teacher/:userId", auth, getTeacherProfile);

export default router;
