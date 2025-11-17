const mongoose = require("mongoose");
const { Schema } = mongoose;

const parentSchema = new Schema(
  {

    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },


    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);



module.exports = mongoose.model("Parent", parentSchema);
