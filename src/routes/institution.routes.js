// src/routes/institution.routes.js

import express from "express";
import auth from "../middleware/auth.js";
import { allowRoles } from "../middleware/auth.js";

import {
  createInstitutionProfile,
  getInstitutionProfile,
  updateInstitutionProfile,
  deleteInstitutionProfile,
} from "../controllers/institutionController.js";

const router = express.Router();

/**
 * @route POST /api/institution
 * @desc Create Institution Profile
 * @access Protected → Only institution role
 */
router.post(
  "/",
  auth,
  allowRoles("institute","institution"),
  createInstitutionProfile
);

/**
 * @route GET /api/institution/:id
 * @desc Get Institution Profile (public)
 * @access Public
 */
router.get("/:id", getInstitutionProfile);

/**
 * @route PUT /api/institution/:id
 * @desc Update Institution Profile
 * @access Protected → Only institution
 */
router.put(
  "/:id",
  auth,
  allowRoles("institute","institution"),
  updateInstitutionProfile
);

/**
 * @route DELETE /api/institution/:id
 * @desc Delete Institution Profile
 * @access Protected → Only institution
 */
router.delete(
  "/:id",
  auth,
  allowRoles("institute","institution"),
  deleteInstitutionProfile
);

export default router;
