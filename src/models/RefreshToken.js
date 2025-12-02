// src/models/RefreshToken.js
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true }, // store hashed token
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
  replacedByHash: { type: String } // optional: rotation link
});

export default mongoose.model("RefreshToken", refreshTokenSchema);
