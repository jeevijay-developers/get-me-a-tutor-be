import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    type: {
      type: String,
      enum: ["CREDIT_PURCHASE", "CREDIT_DEBIT"],
      required: true,
    },

    credits: {
      type: Number,
      required: true,
    },

    reason: String,

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
