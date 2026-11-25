import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authing.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
