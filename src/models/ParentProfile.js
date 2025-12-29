// src/models/ParentProfile.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const parentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // all students linked to this parent
    childrenIds: [
      { type: Schema.Types.ObjectId, ref: "StudentProfile" }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ParentProfile", parentSchema);
