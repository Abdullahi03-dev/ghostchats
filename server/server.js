import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import createLobby from "./utils/createLobby.js";
import generateGhostName from "./utils/generateGhostName.js";
import { addPoints } from "./utils/pointsSystem.js";
import User from "./models/User.js";
import Message from "./models/Message.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(" MongoDB connected");
        createLobby();
    })
    .catch((err) => console.log(" MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Socket.io authentication middleware
io.use(async (socket, next) => {
    try {
        const cookies = cookie.parse(socket.handshake.headers.cookie || "");
        const token = cookies.jwt;

        if (!token) {
            return next(new Error("Not authorized"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.user = user;
        next();
    } catch (err) {
        next(new Error("Not authorized"));
    }
});

// Socket.io connection handler
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Join a room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`${socket.user.username} joined room ${roomId}`);
    });

    // Leave a room
    socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId);
    });

    // Send a message
    socket.on("sendMessage", async ({ roomId, text }) => {
        try {
            const user = await User.findById(socket.user._id);
            const displayName = user.isAnonymous
                ? generateGhostName()
                : user.username;

            const message = await Message.create({
                room: roomId,
                sender: user._id,
                senderName: displayName,
                text,
            });

            user.messagesSent += 1;
            user.lastActive = new Date();
            await addPoints(user, 1);

            io.to(roomId).emit("newMessage", {
                _id: message._id,
                room: roomId,
                sender: user._id,
                senderName: displayName,
                text: message.text,
                createdAt: message.createdAt,
            });
        } catch (err) {
            console.log("Message error:", err.message);
        }
    });

    // Vanish a message (deletes from DB and fades out for everyone)
    socket.on("vanishMessage", async ({ roomId, messageId }) => {
        try {
            await Message.findByIdAndDelete(messageId);
            io.to(roomId).emit("messageVanished", messageId);
        } catch (err) {
            console.log("Vanish error:", err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.username}`);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));