import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    postedByRole: {
      type: String,
      enum: ["institute", "parent"],
      required: true,
    },

    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      default: null, // only for institute jobs
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    subjects: {
      type: [String],
      required: true,
    },

    classRange: {
      type: String, // "6-10", "11-12"
    },

    salary: {
      type: Number,
      required: true,
      min: [10000, "Salary must be at least ₹10,000"],
    },

    location: {
      type: String,
      required: true,
    },

    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract"],
      default: "full-time",
    },

    deadline: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "active",
    },
  },
  { timestamps: true }
);

/* ✅ Indexes (ONLY HERE — no inline indexes) */
jobSchema.index({ location: 1 });
jobSchema.index({ subjects: 1 });
jobSchema.index({ salary: 1 });
jobSchema.index({ postedByRole: 1 });

export default mongoose.model("Job", jobSchema);
