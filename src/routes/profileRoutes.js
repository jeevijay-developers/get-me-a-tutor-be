// src/routes/profileRoutes.js
import express from "express";
import auth from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import TeacherProfile from "../models/TeacherProfile.js";
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
router.get("/public", async (req, res) => {
  const teachers = await TeacherProfile.find({
    isPublic: true,
    isActive: true,
  }).populate("userId", "name");

  const formatted = teachers.map(t => ({
    _id: t._id,
    name: t.userId?.name ?? "Tutor",
    subject: t.subjects?.[0] ?? "—",
    specialization: t.subjects?.join(", ") ?? "—",
    rating: 4.8,
    reviews: 0,
    hourlyRate: t.expectedSalary?.min ?? 0,
    experience: `${t.experienceYears} years`,
    city: t.city ?? "",
    avatar: t.userId?.name?.slice(0, 2).toUpperCase() ?? "T",
    verified: t.isVerified,
  }));

  res.json({ success: true, teachers: formatted });
});

// router.get("/public", async (req, res) => {
//   const teachers = await TeacherProfile.find({
//     isPublic: true,
//     isActive: true,
//     experienceYears: { $gt: 0 },
//     subjects: { $ne: [] },
//     city: { $ne: "" },
//   }).populate("userId", "name");

//   res.json({ success: true, teachers });
// });
router.get("/teacher/profile/:profileId", async (req, res) => {
  const profile = await TeacherProfile.findById(req.params.profileId)
    .populate("userId", "name email");

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  res.json({ success: true, profile });
});

router.get(
  "/teacher/me",
  auth,
  allowRoles("tutor"),
  async (req, res) => {
    const profile = await TeacherProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.json({ profile: null, isComplete: false });
    }

    res.json({
      profile,
      isComplete: profile.isComplete,
    });
  }
);

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
