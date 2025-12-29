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

// Create job (institution)
router.post("/", auth, allowRoles("institute","parent"), createJob);

// Public job list
router.get("/",auth, getAllJobs);

// My jobs (institution)
router.get("/my", auth, allowRoles("institute","parent"), getMyJobs);

// Update job
router.put("/:id", auth, allowRoles("institute","parent"), updateJob);

// Close job
router.patch("/:id/close", auth, allowRoles("institute","parent"), closeJob);

export default router;
