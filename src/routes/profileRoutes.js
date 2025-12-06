// src/routes/profileRoutes.js
import express from "express";
import auth, { allowRoles } from "../middleware/auth.js";
import { upsertTeacherProfile, getTeacherProfile } from "../controllers/teacherProfileController.js";
import { getMyParentProfile } from "../controllers/parentProfileController.js";
import {
  createStudent,
  getMyStudents,
  updateStudent,
  deleteStudent,
} from "../controllers/studentProfileController.js";

const router = express.Router();

// -------- TEACHER PROFILE ROUTES (already existing) --------
router.post("/teacher", auth, allowRoles("tutor"), upsertTeacherProfile);
router.get("/teacher/:userId", auth, getTeacherProfile);

// -------- PARENT PROFILE ROUTES --------

// GET /profile/parent/me  → parent + linked students
router.get(
  "/parent/me",
  auth,
  allowRoles("parent"),
  getMyParentProfile
);

// -------- STUDENT ROUTES (parent only) --------

// POST /profile/student → create child
router.post(
  "/student",
  auth,
  allowRoles("parent"),
  createStudent
);

// GET /profile/students → list all children of logged-in parent
router.get(
  "/students",
  auth,
  allowRoles("parent"),
  getMyStudents
);

// PUT /profile/student/:studentId → update child
router.put(
  "/student/:studentId",
  auth,
  allowRoles("parent"),
  updateStudent
);

// DELETE /profile/student/:studentId → delete child
router.delete(
  "/student/:studentId",
  auth,
  allowRoles("parent"),
  deleteStudent
);

export default router;
