
import express from "express";
import axios from "axios";
import bcrypt from "bcrypt";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
import controller from "./controller.js";


router.get('/momatches', authMiddleware, controller.getMoMatches);
router.get('/fanmatches', authMiddleware, controller.getFanOpenBets);
router.post('/declareresult', authMiddleware, controller.declareResult);
router.post('/void', authMiddleware, controller.voidResult);




// module.exports = router;
export default router;
