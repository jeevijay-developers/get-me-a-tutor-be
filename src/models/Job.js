import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    subjects: [
      {
        type: String,
        index: true,
      },
    ],

    classRange: {
      type: String, // "6-10", "11-12"
    },

    salary: {
      type: Number,
    },

    location: {
      type: String,
      index: true,
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
      default: "draft",
    },
  },
  { timestamps: true }
);



export default mongoose.model("Job", jobSchema);
