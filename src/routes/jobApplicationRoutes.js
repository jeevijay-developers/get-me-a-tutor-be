import express from "express";
import auth, { allowRoles } from "../middleware/auth.js";
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/jobApplicationController.js";

const router = express.Router();

// Tutor applies to job
router.post("/apply", auth, allowRoles("tutor"), applyToJob);

// Tutor views own applications
router.get("/my", auth, allowRoles("tutor"), getMyApplications);

// Institution views applications for a job
router.get(
  "/job/:jobId",
  auth,
  allowRoles("institute"),
  getJobApplications
);

// Institution updates application status
router.patch(
  "/:applicationId/status",
  auth,
  allowRoles("institute"),
  updateApplicationStatus
);

export default router;
