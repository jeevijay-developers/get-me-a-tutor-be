import express from "express";
import auth from "../middleware/auth.js";
import { allowRoles } from "../middleware/role.js";
// import Job from "../models/Job.js";

import {
  getReceivedApplications,
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/jobApplicationController.js";

const router = express.Router();

/* APPLY TO JOB (Tutor) */
// router.post(
//   "/:jobId",
//   auth,
//   allowRoles("tutor"),
//   async (req, res) => {
//     const exists = await JobApplication.findOne({
//       tutor: req.user.id,
//       job: req.params.jobId,
//     });

//     if (exists) {
//       return res.status(400).json({ message: "Already applied" });
//     }

//     const application = await JobApplication.create({
//       tutor: req.user.id,
//       job: req.params.jobId,
//       ...req.body,
//     });

//     res.json({ success: true, application });
//   }
// );


// Tutor applies to job
router.post("/apply", auth, allowRoles("tutor"), applyToJob);

/**
 * Tutor views own applications
 */
router.get(
  "/my",
  auth,
  allowRoles("tutor"),
  getMyApplications
);


// Institution views applications for a job
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

// Institution views ALL received applications (Dashboard)
router.get(
  "/my-received",
  auth,
  allowRoles("institute"),
  getReceivedApplications
);

// GET single job by ID (for Apply page)
// router.get("/:id", async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.id).populate(
//       "institution",
//       "institutionName city"
//     );

//     if (!job) {
//       return res.status(404).json({ success: false, message: "Job not found" });
//     }

//     res.json({ success: true, job });
//   } catch (err) {
//     res.status(400).json({ success: false, message: "Invalid job id" });
//   }
// });

export default router;
