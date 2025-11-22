import mongoose  from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  phone:{
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "institute", "parent","tutor"],
    required: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  emailOTPHash: {
    type: String,
  },
    phoneOTPHash: {
        type: String,
    },
    emailOTPExpires: {
        type: Date,
    },
    phoneOTPExpiresAt: {
        type: Date,
    },
 
});

const User = mongoose.model("User", userSchema);
export default User;