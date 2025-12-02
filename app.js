

import "dotenv/config";


import express from "express";
import mongoose from "mongoose";
import authRoutes from "./src/routes/authRoutes.js";
import rateLimit from "express-rate-limit";
import profileRoutes from "./src/routes/profileRoutes.js";
import institutionRoutes from "./src/routes/institution.routes.js";

const app = express();
app.use(express.json());

// basic rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { message: "Too many requests, try again later." }
});
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/auth", authLimiter, authRoutes);
app.use("/profile", profileRoutes);
app.use("/api/institution", institutionRoutes);
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected");

    const port = process.env.PORT || 5001;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};


start();
