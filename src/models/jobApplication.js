import mongoose from "mongoose";
const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeacherProfile",
      required: true,
      index: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: null,
    },

    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "selected"],
      default: "applied",
    },

    coverLetter: {
      type: String,
    },
  },
  { timestamps: true }
);

// prevent duplicate applications
jobApplicationSchema.index({ job: 1, tutor: 1 }, { unique: true });

export default mongoose.models.JobApplication ||
  mongoose.model("JobApplication", jobApplicationSchema);