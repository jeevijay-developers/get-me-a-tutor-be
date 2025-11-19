// src/routes/authRoutes.js
import express from "express";
import {
  tutorRegister,
  tutorLogin,
  instituteRegister,
  instituteLogin
} from "../controllers/authController.js";

import { tutorValidation } from "../middleware/tutorValidation.js";
import { instituteValidation } from "../middleware/instituteValidation.js";
import { validate } from "../middleware/validate.js";
import { body } from "express-validator";

const router = express.Router();

const loginValidation = [
  body("email").notEmpty().isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];
router.post("/tutors/register",tutorValidation,validate, tutorRegister);
router.post("/tutors/login",loginValidation,validate, tutorLogin);

router.post("/institutes/register",instituteValidation,validate, instituteRegister);
router.post("/institutes/login",loginValidation,validate, instituteLogin);


export default router;
