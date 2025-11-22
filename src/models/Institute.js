// src/models/Institute.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;

const instituteSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },

    // add password (for institute admin signup)
    password: { type: String, select: false },

    address: {
      street: String,
      city: { type: String, index: true },
      state: String,
      pincode: String
    },
    description: { type: String },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// Hash password before save if it's new or modified
instituteSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
instituteSchema.methods.matchPassword = async function(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Institute", instituteSchema);
