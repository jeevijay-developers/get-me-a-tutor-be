import JobApplication from "../models/jobApplication.js";
import Job from "../models/Job.js";
import TeacherProfile from "../models/TeacherProfile.js";
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

    const teacher = await TeacherProfile.findOne({ userId: tutorId });
    if (!teacher) {
      return res.status(400).json({
        message: "Create teacher profile first",
      });
    }

    let institution = null;
    if (job.institution) {
      institution = await Institution.findById(job.institution);
    }

    const application = await JobApplication.create({
      job: job._id,
      tutor: tutorId,
      institution: institution?._id ?? null,
      jobOwner: job.postedBy,
      jobOwnerRole: job.postedByRole,
      message,
    });

    teacher.credits -= 5;
    teacher.jobsApplied += 1;
    await teacher.save();

    return res.status(201).json({
      success: true,
      application,
      teacher,
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
    const { role, _id: userId } = req.user;

    let filter = { job: jobId };

    if (role === "institute") {
      const institution = await Institution.findOne({ owner: userId });
      if (!institution) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      filter.institution = institution._id;
    }

    if (role === "parent") {
      filter.jobOwner = userId;
    }

    const applications = await JobApplication.find(filter)
      .populate("tutor", "name email phone photo userId")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      applications,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

//view latest 3 applications (institution)
export async function getRecentApplications(req, res) {
  try {
    const { role, _id: userId } = req.user;

    let filter = {};

    // ───────── INSTITUTE ─────────
    if (role === "institute") {
      const institution = await Institution.findOne({ owner: userId });
      if (!institution) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      filter.institution = institution._id;
    }

    // ───────── PARENT ─────────
    if (role === "parent") {
      filter.jobOwner = userId;
    }

    const applications = await JobApplication.find(filter)
      .populate("tutor", "name email phone photo userId")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(3);

    return res.json({
      success: true,
      applications,
    });
  } catch (err) {
    console.error("getRecentApplications error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- UPDATE APPLICATION STATUS ----------------
export async function updateApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const { role, _id: userId } = req.user;

    const application = await JobApplication.findById(applicationId)
      .populate("job");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // ───────── INSTITUTE ─────────
    if (role === "institute") {
      const institution = await Institution.findOne({ owner: userId });
      if (!institution || !application.institution?.equals(institution._id)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    // ───────── PARENT ─────────
    if (role === "parent") {
      if (!application.jobOwner.equals(userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    application.status = status;
    await application.save();

    return res.json({
      success: true,
      application,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

