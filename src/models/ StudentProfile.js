// models/StudentProfile.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  board: String,      // e.g., "CBSE", "ICSE"
  className: String,  // e.g., "9th", "12th"
  rollNumber: String,
  city: String
}, { timestamps: true });

export default mongoose.model("StudentProfile", studentSchema);
