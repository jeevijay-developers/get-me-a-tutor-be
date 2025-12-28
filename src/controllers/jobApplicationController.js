import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";

// ---------------- APPLY TO JOB ----------------
export async function applyToJob(req, res) {
  try {
    const { jobId, message } = req.body;

    const job = await Job.findById(jobId);
    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "Job not available" });
    }

    const application = await JobApplication.create({
      job: job._id,
      tutor: req.user._id,
      jobOwner: job.postedBy,
      jobOwnerRole: job.postedByRole,
      message,
    });

    return res.status(201).json({
      success: true,
      application,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Already applied to this job",
      });
    }
    console.error("applyToJob error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- VIEW MY APPLICATIONS ----------------
export async function getMyApplications(req, res) {
  try {
    const applications = await JobApplication.find({
      tutor: req.user._id,
    })
      .populate("job")
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- VIEW JOB APPLICATIONS (OWNER) ----------------
export async function getJobApplications(req, res) {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      postedBy: req.user._id,
    });

    if (!job) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const applications = await JobApplication.find({
      job: job._id,
    })
      .populate("tutor", "name email phone")
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ---------------- UPDATE APPLICATION STATUS ----------------
export async function updateApplicationStatus(req, res) {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.applicationId,
      jobOwner: req.user._id,
    });

    if (!application) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    application.status = req.body.status;
    await application.save();

    return res.json({ success: true, application });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}



// 🔓 Reveal Tutor Contact
// export async function revealTutorContact(req, res) {
//   try {
//     const { applicationId } = req.params;

//     const application = await JobApplication.findById(applicationId)
//       .populate("institution");

//     if (!application) {
//       return res.status(404).json({ message: "Application not found" });
//     }

//     const institution = await Institution.findById(application.institution);

//     // Already revealed
//     if (application.contactRevealed) {
//       return res.json({
//         success: true,
//         message: "Contact already revealed",
//       });
//     }

//     // Check credits
//     if (institution.credits < 1) {
//       return res.status(402).json({
//         message: "Insufficient credits",
//       });
//     }

//     // Deduct credit
//     institution.credits -= 1;
//     await institution.save();

//     // Update application
//     application.contactRevealed = true;
//     application.contactRevealedAt = new Date();
//     application.revealedBy = institution._id;
//     await application.save();

//     // Create transaction
//     await Transaction.create({
//       institution: institution._id,
//       type: "CREDIT_DEBIT",
//       credits: -1,
//       reason: "Reveal tutor contact",
//       referenceId: application._id,
//     });

//     return res.json({
//       success: true,
//       message: "Contact revealed successfully",
//     });

//   } catch (err) {
//     console.error("revealTutorContact error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// }