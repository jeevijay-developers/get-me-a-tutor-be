import razorpay from "../config/razorpay.js";
import User from "../models/User.js";

// Define credit packages (amount in paise)
const CREDIT_PACKS = {
  "10": { amount: 19900, credits: 10 },   // ₹199 for 10 credits
  "25": { amount: 39900, credits: 25 },   // ₹399 for 25 credits
  "50": { amount: 69900, credits: 50 },   // ₹699 for 50 credits
};

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount against our packages
    const validPackages = Object.values(CREDIT_PACKS);
    const isValidAmount = validPackages.some(pack => pack.amount === amount);

    if (!isValidAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount for credit package"
      });
    }

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${req.user.id}`,
      notes: {
        userId: req.user.id,
        credits: amountToCreditsMap[amount] || 10 // Add credits info to notes for webhook processing
      }
    });

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
};

// Verify payment and update user credits
export const verifyPaymentAndAddCredits = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Role validation
    if (!["tutor", "institute"].includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Verify the payment signature
    const crypto = await import("crypto");
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // 5. Failure transaction
      await Transaction.create({
        user: req.user.id,
        type: "CREDIT_PURCHASE",
        credits: 0, // No credits added due to failure
        status: "FAILED",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    // 2. Fetch order from Razorpay to validate amount
    const razorpayInstance = await import("../config/razorpay.js");
    const order = await razorpayInstance.orders.fetch(razorpay_order_id);

    // Note: In real implementation, you'd need to store the expected amount with the order
    // For now, we'll skip this validation as we don't have the expected amount stored

    // 3. Prevent replay - check if payment ID already exists
    const exists = await Transaction.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (exists) {
      return res.json({ message: "Already processed" });
    }

    // Payment signature is valid, but we'll let the webhook handle credit addition
    // This is safer as the webhook is called directly from Razorpay
    return res.json({
      success: true,
      message: "Payment verified successfully. Credits will be added shortly.",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);

    // 5. Failure transaction
    try {
      await Transaction.create({
        user: req.user.id,
        type: "CREDIT_PURCHASE",
        credits: 0, // No credits added due to failure
        status: "FAILED",
        razorpayPaymentId: req.body.razorpay_payment_id,
        razorpayOrderId: req.body.razorpay_order_id,
      });
    } catch (transactionError) {
      console.error("Error creating failure transaction:", transactionError);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment"
    });
  }
};
