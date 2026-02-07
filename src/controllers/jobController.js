import Job from "../models/Job.js";
import Institution from "../models/Institution.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

/**
 * =========================
 * CREATE JOB
 * =========================
 * Allowed roles: institute, parent
 */
export async function createJob(req, res) {
  try {
    const { role, _id: userId } = req.user;

    // ❌ Block invalid roles
    if (!["institute", "parent"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to post jobs",
      });
    }

    // 🚫 VALIDATE BEFORE CREATING OR TOUCHING CREDITS
    if (!req.body.title || !req.body.description || !req.body.salary || !req.body.location) {
      return res.status(400).json({
        success: false,
        message: "Title, description, salary, and location are required",
      });
    }

    // Salary must be >= 10,000
    if (Number(req.body.salary) < 10000) {
      return res.status(400).json({
        success: false,
        message: "Salary must be at least ₹10,000",
      });
    }

    let institutionId = null;
    let creditsUsed = false;
    let creditsAfter = 0;

    // ===============================
    // CREATE JOB FIRST (NO CREDITS YET)
    // ===============================
    const job = await Job.create({
      institution: null,
      postedBy: userId,
      postedByRole: role,
      title: req.body.title,
      description: req.body.description,
      subjects: req.body.subjects,
      salary: req.body.salary,
      location: req.body.location,
      jobType: req.body.jobType,
      deadline: req.body.deadline,
      status: "active",
    });

    // ===============================
    // DEDUCT CREDIT AFTER JOB CREATION
    // ===============================
    if (role === "institute") {
      const institution = await Institution.findOne({ owner: userId });
      if (!institution) {
        // Delete the job we just created
        await Job.findByIdAndDelete(job._id);
        return res.status(400).json({
          success: false,
          message: "Create institution profile first",
        });
      }

      // 🔒 ATOMIC CREDIT DEDUCTION FROM USER (not Institution)
      // This ensures consistency with /auth/me endpoint
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, credits: { $gte: 1 } },
        { $inc: { credits: -1 } },
        { new: true }
      );

      if (!updatedUser) {
        // Delete the job if credit deduction fails (race condition)
        await Job.findByIdAndDelete(job._id);
        return res.status(402).json({
          success: false,
          message: "Insufficient credits to post job",
        });
      }

      creditsUsed = true;
      creditsAfter = updatedUser.credits;
      institutionId = institution._id;

      // Update job with institution ID
      await Job.findByIdAndUpdate(job._id, { institution: institutionId });
    } else if (role === "parent") {
      // Parent credit deduction
      const user = await User.findById(userId);
      if (!user || user.credits < 1) {
        // Delete the job if insufficient credits
        await Job.findByIdAndDelete(job._id);
        return res.status(402).json({
          success: false,
          message: "Insufficient credits to post job",
        });
      }

      // Deduct credit atomically
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, credits: { $gte: 1 } },
        { $inc: { credits: -1 } },
        { new: true }
      );

      if (!updatedUser) {
        // Delete the job if credit deduction fails (race condition)
        await Job.findByIdAndDelete(job._id);
        return res.status(402).json({
          success: false,
          message: "Insufficient credits to post job",
        });
      }

      creditsUsed = true;
      creditsAfter = updatedUser.credits;
    }

    // ===============================
    // LOG TRANSACTION
    // ===============================
    if (creditsUsed) {
      await Transaction.create({
        user: userId,
        type: "CREDIT_DEBIT",
        credits: -1,
        reason: "JOB_POST",
        balanceAfter: creditsAfter,
      });
    }

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



export const getJobById = async (req, res) => {
  try {
    // The frontend sends the ID as a route parameter
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(200).json({
  success: true,
  job,
});

  } catch (error) {
    console.error('Error fetching job:', error);
    
    // Handle invalid MongoDB ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

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
