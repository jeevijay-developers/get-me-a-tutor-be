import express from "express";
import auth, { allowRoles } from "../middleware/auth.js";
import {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/jobApplicationController.js";

const router = express.Router();

/**
 * Tutor applies to job
 */
router.post(
  "/apply",
  auth,
  allowRoles("tutor"),
  applyToJob
);

/**
 * Tutor views own applications
 */
router.get(
  "/my",
  auth,
  allowRoles("tutor"),
  getMyApplications
);

/**
 * Job owner views applications
 * Allowed: institute, parent
 */
router.get(
  "/job/:jobId",
  auth,
  allowRoles("institute", "parent"),
  getJobApplications
);

/**
 * Job owner updates application status
 * Allowed: institute, parent
 */
router.patch(
  "/:applicationId/status",
  auth,
  allowRoles("institute", "parent"),
  updateApplicationStatus
);

export default router;
