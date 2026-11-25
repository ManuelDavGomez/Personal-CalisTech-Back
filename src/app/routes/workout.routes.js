import { Router } from "express";
import { createWorkout, getWorkouts } from "../controllers/workoutController.js";
import { verifyToken } from "../middlewares/authing.js";

const router = Router();

router.get("/", verifyToken, getWorkouts);
router.post("/", verifyToken, createWorkout);

export default router;
