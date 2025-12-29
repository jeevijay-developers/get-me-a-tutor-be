import { v2 as cloudinary } from "cloudinary";

// No need to pass keys manually
// CLOUDINARY_URL from .env is auto-used
cloudinary.config();

export default cloudinary;
