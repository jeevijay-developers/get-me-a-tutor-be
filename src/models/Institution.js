import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    institutionName: { type: String, required: true },
    institutionType: { type: String, required: true },
    about: { type: String },

    email: { type: String },
    phone: { type: String },
    website: { type: String },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    logo: { type: String },
    galleryImages: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Institution", institutionSchema);
