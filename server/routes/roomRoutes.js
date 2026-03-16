import express from "express";
import {
    getRooms,
    createRoom,
    joinRoom,
    getPendingRequests,
    approveJoin,
    rejectJoin,
} from "../controllers/roomController.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRooms);
router.post("/create", protect, createRoom);
router.post("/join/:roomId", protect, joinRoom);
router.get("/pending/:roomId", protect, getPendingRequests);
router.post("/approve/:roomId/:userId", protect, approveJoin);
router.post("/reject/:roomId/:userId", protect, rejectJoin);

export default router;