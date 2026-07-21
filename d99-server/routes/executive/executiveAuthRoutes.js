import express from "express";
import { ExecutiveAuthController } from "../../controller/executive/executiveAuthController.js";

const router = express.Router();

router.post("/login", ExecutiveAuthController.login);

export default router;
