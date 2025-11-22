import { body } from "express-validator";


export const tutorValidation = [
  
  body("name")
    .notEmpty()
    .withMessage("Tutor name is required")
    .isString()
    .withMessage("Name must be a string"),

 
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),


  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10 })
    .withMessage("Phone number must have at least 10 digits"),


  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),



  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a string"),

    body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters"),


 
  body("status")
    .optional()
    .isIn(["active", "inactive", "blocked"])
    .withMessage("Status must be active, inactive, or blocked")
];
