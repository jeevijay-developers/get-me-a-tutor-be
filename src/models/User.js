import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
  type: String,
  required: true,
  select: true
},


    role: {
      type: String,
      enum: ["student", "institute", "parent", "tutor"],
      required: true,
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    emailOTPHash: String,
    emailOTPExpires: Date,

    phoneOTPHash: String,
    phoneOTPExpiresAt: Date,

    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.add({
  credits: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);
