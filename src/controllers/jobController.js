import Job from "../models/Job.js";
import Institution from "../models/Institution.js";

export async function createJob(req, res) {
  try {
    // ensure institution profile exists
    const institution = await Institution.findOne({ owner: req.user._id });
    if (!institution) {
      return res.status(400).json({
        success: false,
        message: "Create institution profile first",
      });
    }

    const job = await Job.create({
      institution: institution._id,
      title: req.body.title,
      description: req.body.description,
      subjects: req.body.subjects,
      salary: req.body.salary,
      location: req.body.location,
      jobType: req.body.jobType,
      deadline: req.body.deadline,
      status: "active",
    });

    if (institution.credits < 5) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits to post job",
      });
    }

    institution.credits -= 5;
    await institution.save();

    return res.status(201).json({
      success: true,
      job,
    });
  } catch (err) {
    console.error("createJob error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAllJobs(req, res) {
  try {
    const jobs = await Job.find({ status: "active" })
      .populate("institution", "institutionName city")
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
    const institution = await Institution.findOne({ owner: req.user._id });
    if (!institution) {
      return res.json({ success: true, jobs: [] });
    }

    const jobs = await Job.find({ institution: institution._id }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      jobs,
    });
  } catch (err) {
    console.error("getMyJobs error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateJob(req, res) {
  try {
    const { id } = req.params;

    const institution = await Institution.findOne({ owner: req.user._id });
    if (!institution) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, institution: institution._id },
      req.body,
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.json({ success: true, job });
  } catch (err) {
    console.error("updateJob error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function closeJob(req, res) {
  try {
    const { id } = req.params;

    const institution = await Institution.findOne({ owner: req.user._id });
    if (!institution) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = await Job.findOneAndUpdate(
      { _id: id, institution: institution._id },
      { status: "closed" },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Job closed",
      job,
    });
  } catch (err) {
    console.error("closeJob error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
