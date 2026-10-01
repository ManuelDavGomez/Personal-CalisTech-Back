import { Router } from "express";
import { getExercises, createTask,  } from "../controllers/taskControllers.js";
import { isAdmin, verifyToken } from "../middlewares/authing.js";

const router = Router();

router.get("/skills", verifyToken, getExercises);

router.post("/skills", verifyToken, isAdmin, createTask);

export default router;
