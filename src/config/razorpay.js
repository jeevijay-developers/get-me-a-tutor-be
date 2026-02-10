import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Explicitly load .env from the root of bc directory
dotenv.config({ path: path.join(__dirname, "../../.env") });

console.log("Razorpay Config Loading...");
const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.error("❌ CRITICAL: Razorpay credentials are missing in process.env!");
  console.log("Current working directory:", process.cwd());
  console.log("Attempted .env path:", path.join(__dirname, "../../.env"));
} else {
  console.log(`✅ Razorpay credentials found. Key ID: ${keyId.substring(0, 8)}...`);
}
  
const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export default razorpay;
