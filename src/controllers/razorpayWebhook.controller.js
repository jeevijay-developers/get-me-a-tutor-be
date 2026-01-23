import crypto from "crypto";

export const razorpayWebhook = (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(req.body) // raw buffer
    .digest("hex");

  const razorpaySignature = req.headers["x-razorpay-signature"];

  if (signature !== razorpaySignature) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    const paymentId = payment.id;
    const userId = payment.notes.userId;
    const credits = Number(payment.notes.credits);

    // ✅ Call your existing logic
    // await userService.addCredits(userId, credits);
    // await transactionService.create({ paymentId });
  }

  res.json({ status: "ok" });
};
