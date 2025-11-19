import { body } from "express-validator";

export const instituteValidation = [

  body("name")
    .notEmpty()
    .withMessage("Institute name is required")
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


  body("description")
    .optional()
    .isString()
    .withMessage("Description must be text"),

  body("address.city")
    .optional()
    .isString()
    .withMessage("City must be a string"),

  body("address.state")
    .optional()
    .isString(),

  body("address.pincode")
    .optional()
    .isString(),


  body("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid status value"),


  body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters")

];
