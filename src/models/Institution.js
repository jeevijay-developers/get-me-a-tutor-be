import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    institutionName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    institutionType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    about: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    address: {
      street: String,
      // city: { type: String, index: true },
      state: String,
      pincode: String,
    },

    credits: {
      type: Number,
      default: 20,
    },

    logo: String,

    galleryImages: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound / nested index
institutionSchema.index({ "address.city": 1 });

export default mongoose.model("Institution", institutionSchema);
