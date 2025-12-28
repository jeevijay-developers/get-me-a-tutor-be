import express from "express";
import auth from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
import {
  createJob,
  getAllJobs,
  getMyJobs,
  updateJob,
  closeJob,
} from "../controllers/jobController.js";

const router = express.Router();

// Create job (institution)
router.post("/", auth, allowRoles("institute"), createJob);

// Public job list
router.get("/", getAllJobs);

// My jobs (institution)
router.get("/my", auth, allowRoles("institute"), getMyJobs);

// Update job
router.put("/:id", auth, allowRoles("institute"), updateJob);

// Close job
router.patch("/:id/close", auth, allowRoles("institute"), closeJob);

export default router;
