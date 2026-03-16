import Room from "../models/Room.js";
import User from "../models/User.js";
import { addPoints, spendPoints } from "../utils/pointsSystem.js";

// Get all active rooms
export const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ isActive: true }).populate("createdBy", "username");
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create room — costs 100 points, earns 10 back as a reward
export const createRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name } = req.body;

        const user = await User.findById(userId);

        // Deduct 100 points
        const updated = await spendPoints(user, 100);
        if (!updated) {
            return res.status(403).json({
                message: `You need 100 ghost points to create a room. You have ${user.ghostPoints}.`,
            });
        }

        const room = await Room.create({
            name,
            createdBy: userId,
            members: [userId],
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        });

        // Reward: +10 points for creating a room
        user.roomsCreated += 1;
        await addPoints(user, 10);

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Join room
export const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Already a member
        if (room.members.some((m) => m.toString() === userId.toString())) {
            room.lastActivity = new Date();
            await room.save();
            return res.json({ ...room.toObject(), status: "member" });
        }

        // Main lobby — instant join
        if (room.isMain) {
            room.members.push(userId);
            room.lastActivity = new Date();
            await room.save();
            return res.json({ ...room.toObject(), status: "member" });
        }

        // Already pending
        if (room.pendingMembers.some((m) => m.toString() === userId.toString())) {
            return res.json({ ...room.toObject(), status: "pending" });
        }

        // Add to pending
        room.pendingMembers.push(userId);
        await room.save();

        res.json({ ...room.toObject(), status: "pending" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get pending requests (owner only)
export const getPendingRequests = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId).populate("pendingMembers", "username ghostPoints accountLevel");

        if (!room) return res.status(404).json({ message: "Room not found" });

        if (room.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the room owner can view requests" });
        }

        res.json(room.pendingMembers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Approve join (owner only) — approved user earns 5 points
export const approveJoin = async (req, res) => {
    try {
        const { roomId, userId } = req.params;
        const room = await Room.findById(roomId);

        if (!room) return res.status(404).json({ message: "Room not found" });

        if (room.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the room owner can approve requests" });
        }

        room.pendingMembers = room.pendingMembers.filter((m) => m.toString() !== userId);
        if (!room.members.some((m) => m.toString() === userId)) {
            room.members.push(userId);
        }
        await room.save();

        // Reward the approved user
        const user = await User.findById(userId);
        if (user) {
            user.roomsJoined += 1;
            await addPoints(user, 5);
        }

        res.json({ message: "User approved", room });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Reject join (owner only)
export const rejectJoin = async (req, res) => {
    try {
        const { roomId, userId } = req.params;
        const room = await Room.findById(roomId);

        if (!room) return res.status(404).json({ message: "Room not found" });

        if (room.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Only the room owner can reject requests" });
        }

        room.pendingMembers = room.pendingMembers.filter((m) => m.toString() !== userId);
        await room.save();

        res.json({ message: "User rejected" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};