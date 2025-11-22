// src/models/Tutor.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;

const tutorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },

    // add password (optional on existing documents; required for registration)
    password: { type: String, select: false },

    address: {
      city: { type: String, index: true },
      state: String
    },

    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active"
    }
  },
  { timestamps: true }
);

// Hash password before save if it's new or modified
tutorSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
tutorSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Tutor", tutorSchema);
