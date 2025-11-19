import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";





dotenv.config();

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => res.send("Backend is running!"));






const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
