import express from "express";
import { getMessages } from "../controllers/messageController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:roomId", protect, getMessages);

export default router;
