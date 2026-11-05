import { Router } from "express";
import { getStats, getExcerciseStats } from "../controllers/statsController.js";
import { isAdmin, verifyToken } from "../middlewares/authing.js";

const router = Router();

router.get("/usuarios", verifyToken, isAdmin, getStats);
router.get("/ejercicios", verifyToken, isAdmin, getExcerciseStats);
export default router;
