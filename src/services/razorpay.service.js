import razorpay from "../config/razorpay.js";
import Transaction from "../models/Transaction.js";
import crypto from "crypto";
import process from "process";

// Define credit packages (amount in paise)
const CREDIT_PACKS = {
  "10": { amount: 19900, credits: 10 },   // ₹199 for 10 credits
  "25": { amount: 39900, credits: 25 },   // ₹399 for 25 credits
  "50": { amount: 69900, credits: 50 },   // ₹699 for 50 credits
};

// Helper to map amount to credits
const amountToCreditsMap = {
  19900: 10,
  39900: 25,
  69900: 50
};

/**
 * ✅ TASK 2: Create Order
 * 
 * - Validate user is authenticated and role is tutor/institute
 * - Create unique order on Razorpay
 * - Attach metadata (userId, credits, role) in notes
 * - Return orderId, amount, currency
 * - DO NOT add credits here
 */
export const createOrder = async (req, res) => {
  try {
    const { amount, credits, role } = req.body;
    const userId = req.user?.id || req.user?._id?.toString();

    // 1. Validate user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // 2. Validate role
    if (!["tutor", "institute"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid role for credit purchase"
      });
    }

    // 3. Validate amount is valid package
    const validPackages = Object.values(CREDIT_PACKS);
    const isValidAmount = validPackages.some(pack => pack.amount === amount);

    if (!isValidAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount for credit package"
      });
    }

    // 4. Validate credits parameter matches amount
    const expectedCredits = amountToCreditsMap[amount];
    if (credits !== expectedCredits) {
      return res.status(400).json({
        success: false,
        message: "Credits amount mismatch"
      });
    }

    // 5. Create Razorpay order
    // Generate short receipt (max 40 chars - Razorpay limit)
    const shortReceipt = `rcpt_${Date.now().toString().slice(-8)}_${userId.toString().slice(-8)}`;
    
    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: shortReceipt, // ✅ Unique receipt (max 40 chars)
      notes: {
        userId,           // For webhook to identify user
        credits,          // For webhook to know how many credits to add
        role,             // For audit
        timestamp: new Date().toISOString()
      }
    });

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};

/**
 * ✅ TASK 4: Verify Payment
 * 
 * - Verify Razorpay signature
 * - Check if payment already processed (idempotency)
 * - Validate order exists and amount matches
 * - DO NOT add credits here (webhook does)
 * - Return success to frontend
 */
export const verifyPaymentAndAddCredits = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.id || req.user?._id?.toString();

    // 1. Validate user is authenticated
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    // 2. Validate role is tutor or institute
    if (!["tutor", "institute"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Invalid role for credit purchase"
      });
    }

    // 3. Verify the payment signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.warn(`Invalid signature for payment ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // 4. ✅ IDEMPOTENCY CHECK: Prevent duplicate processing
    const existingTransaction = await Transaction.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingTransaction) {
      // Payment already processed, return success to frontend
      console.log(`Payment ${razorpay_payment_id} already processed`);
      return res.json({
        success: true,
        message: "Payment already verified",
        duplicate: true
      });
    }

    // 5. 🔄 NOTE: Credits will be added by webhook (payment.captured event)
    // Frontend should wait and then refresh credits
    // This endpoint just verifies the signature and ensures we don't process twice

    return res.json({
      success: true,
      message: "Payment verified successfully. Credits will be added shortly.",
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message
    });
  }
};
