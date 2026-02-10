import crypto from "crypto";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";

/**
 * ✅ TASK 5: Razorpay Webhook Handler
 * 
 * - Use raw body for signature verification
 * - Verify webhook signature
 * - Handle payment.captured event
 * - Add credits atomically (idempotent)
 * - Create transaction record
 * - Webhook must be idempotent
 */
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers["x-razorpay-signature"];

    if (!secret || !razorpaySignature) {
      console.error("Missing webhook secret or signature");
      return res.status(400).send("Invalid webhook configuration");
    }

    // 1. ✅ Verify webhook signature using RAW body
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body) // ✅ RAW BUFFER, not JSON string
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      console.warn(`Invalid webhook signature: expected ${expectedSignature}, got ${razorpaySignature}`);
      return res.status(400).send("Invalid signature");
    }

    // 2. Parse the webhook event
    const event = JSON.parse(req.body.toString());
    console.log(`Webhook event received: ${event.event}`);

    // 3. Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      const paymentId = payment.id;
      const userId = payment.notes?.userId;
      const credits = Number(payment.notes?.credits);

      // 4. Validate we have required data
      if (!userId || !credits || credits <= 0) {
        console.error(`Invalid webhook data: userId=${userId}, credits=${credits}`);
        return res.status(400).json({ status: "invalid_data" });
      }

      // 5. 🔒 IDEMPOTENCY CHECK: Prevent duplicate credit addition
      const alreadyProcessed = await Transaction.findOne({
        razorpayPaymentId: paymentId,
      });

      if (alreadyProcessed) {
        console.log(`Payment ${paymentId} already processed - returning success (idempotent)`);
        return res.json({ status: "duplicate", message: "Already processed" });
      }

      // 6. ✅ ATOMIC UPDATE: Increment user credits
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { $inc: { credits } },
          { new: true }
        );

        if (!user) {
          console.error(`User not found: ${userId}`);
          return res.status(404).json({ status: "user_not_found" });
        }

        // 7. 🧾 CREATE TRANSACTION RECORD
        await Transaction.create({
          user: userId,
          type: "CREDIT_PURCHASE",
          credits,
          reason: "PAYMENT",
          razorpayPaymentId: paymentId,
          razorpayOrderId: payment.order_id,
          status: "SUCCESS",
          balanceAfter: user.credits,
        });

        console.log(`✅ Credits added: user=${userId}, credits=${credits}, new_balance=${user.credits}`);

        return res.json({
          status: "success",
          message: `Added ${credits} credits to user ${userId}`,
          balanceAfter: user.credits
        });
      } catch (updateError) {
        console.error("Error updating user credits:", updateError);
        return res.status(500).json({ status: "update_failed", error: updateError.message });
      }
    }

    // 8. Handle other events (acknowledge but don't process)
    console.log(`Webhook event not handled: ${event.event}`);
    return res.json({ status: "ok", message: "Event noted but not processed" });

  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to Razorpay to prevent retries
    // Log the error for debugging
    return res.status(200).json({
      status: "error",
      message: "Webhook processed with error",
      error: error.message
    });
  }
};
