
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import rateLimit from "express-rate-limit";
import profileRoutes from "./src/routes/profileRoutes.js";
import institutionRoutes from "./src/routes/institution.routes.js";
import searchRoutes from "./src/routes/search.routes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import jobApplicationRoutes from "./src/routes/jobApplicationRoutes.js";
const app = express();
app.use(cors({
  origin: "http://localhost:5174",
  credentials: true
}));

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
app.use("/search", searchRoutes);
app.use("/jobs", jobRoutes);
app.use("/applications", jobApplicationRoutes);
const start = async () => {
  try {
   await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const port = process.env.PORT || 5001;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};


start();
