import express from "express";
import authMiddleware from "../../middleware/authMiddleware.js";
import {
  createExecutive,
  getExecutives,
  updateExecutive,
  setExecutiveActive,
  changeExecutivePassword,
  deleteExecutive
} from "../../controller/executive/executiveController.js";

const router = express.Router();

// All executive-management actions are owner/staff-only; the controller's
// denyNonAdmins guard blocks executives/users/agents. Authentication is
// required on every route.
router.post("/create", authMiddleware, createExecutive);
router.get("/list", authMiddleware, getExecutives);
router.put("/:id", authMiddleware, updateExecutive);
router.patch("/:id/active", authMiddleware, setExecutiveActive);
router.post("/:id/password", authMiddleware, changeExecutivePassword);
router.delete("/:id", authMiddleware, deleteExecutive);

export default router;
