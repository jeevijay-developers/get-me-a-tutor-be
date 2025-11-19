import mongoose from "mongoose";
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true },
    phone: { type: String },

    class: { type: String, required: true },       // e.g., "5th", "10th"
    school: { type: String },
    board: { type: String },                       // CBSE / ICSE / STATE

    address: {
      city: { type: String, index: true },
      state: String,
      pincode: String
    },


    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);



export default mongoose.model("Student", studentSchema);
