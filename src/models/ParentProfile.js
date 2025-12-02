// models/ParentProfile.js
import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  childrenIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile" }]
}, { timestamps: true });

export default mongoose.model("ParentProfile", parentSchema);
