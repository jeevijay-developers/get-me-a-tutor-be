import mongoose from "mongoose";

const { Schema } = mongoose;

const parentSchema = new Schema(
  {
    // Link to User (role = parent)
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Parent basic info
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Location (used for job matching)
    city: {
      type: String,
      index: true,
    },

    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    // Children linked to this parent
    childrenIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "StudentProfile",
      },
    ],

    // Parent settings
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* Indexes for search / performance */
parentSchema.index({ city: 1 });
parentSchema.index({ userId: 1 });

export default mongoose.model("ParentProfile", parentSchema);
