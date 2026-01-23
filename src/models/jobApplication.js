import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      // index: true,
    },

    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // index: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "selected"],
      default: "applied",
    },

    coverLetter: {
      type: String,
    },
     //  CONTACT REVEAL SYSTEM
    // contactRevealed: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);

// prevent duplicate applications
jobApplicationSchema.index({ job: 1, tutor: 1 }, { unique: true });

export default mongoose.model("JobApplication", jobApplicationSchema);
