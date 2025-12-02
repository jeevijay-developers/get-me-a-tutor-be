// models/TeacherProfile.js
import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // basic
  bio: String,
  experienceYears: { type: Number, default: 0 },
  subjects: [{ type: String, index: true }],  // example: ["Math","Physics"]
  classes: [{ type: String }],                 // e.g. ["6","7","12"]
  languages: [{ type: String }],
  city: { type: String, index: true },
  expectedSalary: { type: Number },            // per month/hour as needed
  availability: { type: String },              // e.g. "Weekdays 6-9pm"

  // uploads / assets
  resume: {
    url: String,
    filename: String,
    mimeType: String,
    size: Number
  },
  photo: { url: String, filename: String },
  demoVideoUrl: String,

  // visibility
  isPublic: { type: Boolean, default: true },

  // tags for fast search
  tags: [{ type: String, index: true }],

}, { timestamps: true });

// text index for search
teacherSchema.index({ bio: "text", subjects: "text", tags: "text" });

export default mongoose.model("TeacherProfile", teacherSchema);
