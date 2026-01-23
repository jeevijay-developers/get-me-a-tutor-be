import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const razorpaySignature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(req.body) // ✅ RAW BUFFER
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    const paymentId = payment.id;
    const userId = payment.notes.userId;
    const credits = Number(payment.notes.credits);

    // 🔒 IDENTITY CHECK
    const alreadyProcessed = await Transaction.findOne({
      razorpayPaymentId: paymentId,
    });

    if (alreadyProcessed) {
      return res.json({ status: "duplicate" });
    }

    // ✅ ADD CREDITS
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits } },
      { new: true }
    );

    // 🧾 LOG TRANSACTION
    await Transaction.create({
      user: userId,
      type: "CREDIT_PURCHASE",
      credits,
      reason: "PAYMENT",
      razorpayPaymentId: paymentId,
      razorpayOrderId: payment.order_id, // Get order ID from payment object
      status: "SUCCESS",
      balanceAfter: user.credits,
    });
  }

  res.json({ status: "ok" });
};
