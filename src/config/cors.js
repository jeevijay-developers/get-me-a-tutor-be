import dotenv from "dotenv";
dotenv.config();

const allowedOrigins = [
  "http://localhost:8080", // frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / curl
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
  
export default corsOptions;
// VERY IMPORTANT (preflight fix)