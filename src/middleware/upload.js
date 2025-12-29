import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resource_type = "image";

    if (file.mimetype.startsWith("video")) {
      resource_type = "video";
    } else if (file.mimetype === "application/pdf") {
      resource_type = "raw";
    }

    return {
      folder: "GetMeATutor",
      resource_type,
    };
  },
});

const upload = multer({ storage });
export default upload;
