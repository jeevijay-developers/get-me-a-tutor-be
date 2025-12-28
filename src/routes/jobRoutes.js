import express from "express";
import auth, { allowRoles } from "../middleware/auth.js";
import {
  createJob,
  getAllJobs,
  getMyJobs,
  updateJob,
  closeJob,
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

/**
 * Update job
 * Allowed: owner (institute/parent)
 */
router.put(
  "/:id",
  auth,
  allowRoles("institute", "parent"),
  updateJob
);

/**
 * Close job
 * Allowed: owner (institute/parent)
 */
router.patch(
  "/:id/close",
  auth,
  allowRoles("institute", "parent"),
  closeJob
);

export default router;
