// src/utils/tokens.js
import crypto from "crypto";

/**
 * generateSecureToken: returns raw token string (use to send to user)
 * we will store a hashed version in DB (hashToken).
 */
export function generateSecureToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * hashToken: deterministic hash used for storing tokens safely in DB
 * Uses HMAC-SHA256 with a server secret if available, otherwise plain SHA256.
 */
export function hashToken(token) {
  const key = process.env.TOKEN_HASH_SECRET || "fallback-secret-change-me";
  return crypto.createHmac("sha256", key).update(token).digest("hex");
}
