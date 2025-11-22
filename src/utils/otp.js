import crypto from "crypto";

/**
 * generateOTP() -> string 6 digits
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * hashOTP(otp) -> returns "salt:hash"
 * We use HMAC-SHA256 with random salt so stored OTP cannot be reversed.
 */
export function hashOTP(otp) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hmac = crypto.createHmac("sha256", salt).update(otp).digest("hex");
  return `${salt}:${hmac}`;
}

/**
 * verifyOTP(otp, stored)
 * stored format: salt:hash
 */
export function verifyOTP(otp, stored) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hmac = crypto.createHmac("sha256", salt).update(otp).digest("hex");
  return hmac === hash;
}
