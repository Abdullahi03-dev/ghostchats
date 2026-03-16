import express from "express";
import { signup, login, logout, profile, toggleAnonymous } from "../controllers/authController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, profile);
router.put("/toggle-anonymous", protect, toggleAnonymous);

export default router;