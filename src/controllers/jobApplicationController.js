import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import Institution from "../models/Institution.js";

// ---------------- APPLY TO JOB (Tutor) ----------------
export async function applyToJob(req, res) {
  try {
    const { jobId, message } = req.body;
    const tutorId = req.user._id;

    const job = await Job.findById(jobId);
    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "Job not available" });
    }

    const institution = await Institution.findById(job.institution);

    const application = await JobApplication.create({
      job: job._id,
      tutor: tutorId,
      institution: institution._id,
      message,
    });

    return res.status(201).json({
      success: true,
      application,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already applied to this job",
      });
    }

    console.error("applyToJob error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- MY APPLICATIONS (Tutor) ----------------
export async function getMyApplications(req, res) {
  try {
    const applications = await JobApplication.find({
      tutor: req.user._id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- VIEW JOB APPLICATIONS (Institution) ----------------
export async function getJobApplications(req, res) {
  try {
    const { jobId } = req.params;

    const institution = await Institution.findOne({
      owner: req.user._id,
    });

    if (!institution) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const applications = await JobApplication.find({
      job: jobId,
      institution: institution._id,
    })
      .populate("tutor", "name email phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- GET RECEIVED APPLICATIONS (Institution) ----------------
export async function getReceivedApplications(req, res) {
  try {
    const institution = await Institution.findOne({
      owner: req.user._id,
    });

    if (!institution) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const applications = await JobApplication.find({
      institution: institution._id,
    })
      .populate("job", "title")
      .populate("tutor", "name email phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (err) {
    console.error("getReceivedApplications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- UPDATE APPLICATION STATUS ----------------
export async function updateApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const institution = await Institution.findOne({
      owner: req.user._id,
    });

    if (!institution) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const application = await JobApplication.findOneAndUpdate(
      { _id: applicationId, institution: institution._id },
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}
