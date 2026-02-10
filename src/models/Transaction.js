import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    reason: {
      type: String,
      enum: ["JOB_APPLY", "JOB_POST", "PAYMENT"],
    },

    razorpayPaymentId: String,
    razorpayOrderId: String,

    balanceAfter: Number,

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);