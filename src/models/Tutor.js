const mongoose = require("mongoose");
const { Schema } = mongoose;

const tutorSchema = new Schema(
  {
  
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"] },

    address: {
      city: { type: String, index: true },
      state: String
    },

    // Ratings
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



module.exports = mongoose.model("Tutor", tutorSchema);
