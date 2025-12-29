import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    bio: { type: String, trim: true },

    experienceYears: {
      type: Number,
      default: 0,
      index: true,
    },

    subjects: [{
      type: String,
      lowercase: true,
      trim: true,
    }],

    classes: [{ type: Number }],

    languages: [{
      type: String,
      lowercase: true,
      trim: true,
    }],

    city: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },

    expectedSalary: {
      min: Number,
      max: Number,
    },

    availability: { type: String },

    resume: {
      url: String,
      filename: String,
      mimeType: String,
      size: Number,
    },

    photo: {
      url: String,
      filename: String,
    },

    demoVideoUrl: String,

    isPublic: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    credits: {
      type: Number,
      default: 500,
    },
    jobsApplied: {
      type: Number,
      default: 0,
    },
    examsPassed: {
      type: Number,
      default: 0,
    },
    rating:{
      type: Number,
      default: 0,
    },
    tags: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
  },
  { timestamps: true }
);

// TEXT SEARCH
teacherSchema.index({
  bio: "text",
  subjects: "text",
  tags: "text",
});

// FILTER SEARCH
teacherSchema.index({ city: 1 });
teacherSchema.index({ experienceYears: 1 });
teacherSchema.index({ "expectedSalary.min": 1 });
teacherSchema.index({ "expectedSalary.max": 1 });

export default mongoose.model("TeacherProfile", teacherSchema);
