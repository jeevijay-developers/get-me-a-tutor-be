import Job from "../models/Job.js";
import Institution from "../models/Institution.js";
import JobApplication from "../models/JobApplication.js";
import Parent from "../models/ParentProfile.js";

export async function createJob(req, res) {
  try {
    const { role, _id: userId } = req.user;

    if (!["institute", "parent"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to post jobs",
      });
    }

    let institutionId = null;
    let ownerDoc = null; // institute OR parent

    // ───────── INSTITUTE ─────────
    if (role === "institute") {
      ownerDoc = await Institution.findOne({ owner: userId });
      if (!ownerDoc) {
        return res.status(400).json({
          success: false,
          message: "Create institution profile first",
        });
      }
      institutionId = ownerDoc._id;
    }

    // ───────── PARENT ─────────
    if (role === "parent") {
      ownerDoc = await Parent.findOne({ userId });
      if (!ownerDoc) {
        return res.status(400).json({
          success: false,
          message: "Create parent profile first",
        });
      }
    }

    // ───────── CREATE JOB ─────────
    const job = await Job.create({
      ...req.body,
      postedBy: userId,
      postedByRole: role,
      institution: institutionId, // null for parent
    });

    // ───────── CREDIT SYSTEM (BOTH) ─────────
    ownerDoc.credits -= 5;
    ownerDoc.jobsPosted += 1;
    await ownerDoc.save();

    return res.status(201).json({
      success: true,
      job,
    });
  } catch (err) {
    console.error("createJob error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}


export async function getAllJobs(req, res) { //tutor
  try {
    const tutorId = req.user._id;

    const applications = await JobApplication.find(
      { tutor: tutorId },
      { job: 1 }
    );

    const appliedJobIds = applications.map(a => a.job);
    const jobs = await Job.find({
      status: "active",
      _id: { $nin: appliedJobIds },
    })
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
    return res.status(500).json({ success: false, message: err.message });
  }
}

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

export async function closeJob(req, res) {
  try {
    const { id } = req.params;
    const { role, _id: userId } = req.user;

    // 1️⃣ Find job first
    const job = await Job.findOne({
      _id: id,
      postedBy: userId,
      status: { $ne: "closed" },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or already closed",
      });
    }

    // 2️⃣ Update job status
    job.status = "closed";
    await job.save();

    // 3️⃣ Update owner stats
    if (role === "institute") {
      const institution = await Institution.findOne({ owner: userId });
      if (institution && institution.jobsPosted > 0) {
        institution.jobsPosted -= 1;
        await institution.save();
      }
    }

    if (role === "parent") {
      const parent = await Parent.findOne({ userId });
      if (parent && parent.jobsPosted > 0) {
        parent.jobsPosted -= 1;
        await parent.save();
      }
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

