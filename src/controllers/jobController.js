import Job from "../models/Job.js";
import Institution from "../models/Institution.js";

/**
 * =========================
 * CREATE JOB
 * =========================
 * Allowed roles: institute, parent
 */
export async function createJob(req, res) {
  try {
    const { role, _id: userId } = req.user;

    // ❌ Block tutors & students
    if (!["institute", "parent"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to post jobs",
      });
    }

    let institutionId = null;

    // If institute → institution must exist
    if (role === "institute") {
      const institution = await Institution.findOne({ owner: userId });
      if (!institution) {
        return res.status(400).json({
          success: false,
          message: "Create institution profile first",
        });
      }
      institutionId = institution._id;
    }

    // Salary validation
    if (req.body.salary && req.body.salary < 10000) {
      return res.status(400).json({
        success: false,
        message: "Minimum salary must be 10000",
      });
    }

    const job = await Job.create({
      ...req.body,
      postedBy: userId,
      postedByRole: role,
      institution: institutionId, // null for parent
    });

    return res.status(201).json({
      success: true,
      job,
    });
  } catch (err) {
    console.error("createJob error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * =========================
 * GET ALL ACTIVE JOBS (FEED)
 * =========================
 */
export async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find({ status: "active" })
      .populate("institution", "institutionName city")
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      results: jobs.length,
      jobs,
    });
  } catch (err) {
    console.error("getAllJobs error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * =========================
 * GET MY JOBS (Institute / Parent)
 * =========================
 */
export async function getMyJobs(req, res) {
  try {
    const jobs = await Job.find({
      postedBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      jobs,
    });
  } catch (err) {
    console.error("getMyJobs error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * =========================
 * UPDATE JOB
 * =========================
 */
export async function updateJob(req, res) {
  try {
    const { id } = req.params;

    const job = await Job.findOneAndUpdate(
      { _id: id, postedBy: req.user._id },
      req.body,
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unauthorized",
      });
    }

    return res.json({
      success: true,
      job,
    });
  } catch (err) {
    console.error("updateJob error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

/**
 * =========================
 * CLOSE JOB
 * =========================
 */
export async function closeJob(req, res) {
  try {
    const { id } = req.params;

    const job = await Job.findOneAndUpdate(
      { _id: id, postedBy: req.user._id },
      { status: "closed" },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or unauthorized",
      });
    }

    return res.json({
      success: true,
      message: "Job closed successfully",
      job,
    });
  } catch (err) {
    console.error("closeJob error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
