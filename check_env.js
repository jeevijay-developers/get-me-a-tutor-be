// check-env.js
import dotenv from "dotenv";
dotenv.config();

console.log({
  EMAIL_USER: !!process.env.EMAIL_USER,
  EMAIL_PASS: !!process.env.EMAIL_PASS,
  TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM: !!process.env.TWILIO_WHATSAPP_FROM,
  MONGODB_URI: !!process.env.MONGODB_URI
});
