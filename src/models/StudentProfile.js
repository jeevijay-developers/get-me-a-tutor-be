// src/models/StudentProfile.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    parent: {
      type: Schema.Types.ObjectId,
      ref: "ParentProfile",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    board: {
      type: String,
      enum: ["CBSE", "ICSE", "STATE", "OTHER"],
      default: "CBSE",
    },

    className: {
      type: String, // e.g. "8", "9", "12"
      required: true,
    },

    city: {
      type: String,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// helpful indexes for analytics / search later
studentSchema.index({ board: 1, className: 1 });
studentSchema.index({ city: 1 });

export default mongoose.model("StudentProfile", studentSchema);
