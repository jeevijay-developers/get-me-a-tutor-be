import express from "express";
import auth from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import { getJobById } from "../controllers/jobController.js";
import {
  createJob,
  getAllJobs,
  getMyJobs,
  updateJob,
  closeJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

/**
 * Create job
 * Allowed: institute, parent
 */
router.post(
  "/",
  auth,
  allowRoles("institute", "parent"),
  createJob
);

/**
 * Public job feed
 * Allowed: everyone
 */
router.get("/alljobs", getAllJobs);

/**
 * My jobs
 * Allowed: institute, parent
 */
router.get(
  "/my",
  auth,
  allowRoles("institute", "parent"),
  getMyJobs
);

// Get job by ID
router.get("/:id", getJobById);

// Update job
router.put("/:id", auth, allowRoles("institute"), updateJob);

/**
 * Close job
 * Allowed: owner (institute/parent)
 */
// Close job
router.patch(
  "/:id/close",
  auth,
  allowRoles("institute", "parent"),
  closeJob
);

// Delete job
router.delete(
  "/:id",
  auth,
  allowRoles("institute", "parent"),
  deleteJob
);

export default router;
