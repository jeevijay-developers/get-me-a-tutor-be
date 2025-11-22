import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
console.log("EMAIL util loaded — EMAIL_USER:", !!process.env.EMAIL_USER, "EMAIL_PASS:", !!process.env.EMAIL_PASS);

/**
 * sendEmailOTP: send a plain text OTP email
 * to: recipient email, otp: the plain OTP
 */
export async function sendEmailOTP(to, otp) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Your verification OTP",
    text: `Your verification OTP is ${otp}. It will expire in 10 minutes.`
  });
  return info;
}
