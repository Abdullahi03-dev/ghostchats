import User from "../models/User.js";
import generateGhostName from "../utils/generateGhostName.js";

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password -email");

        const safeUsers = users.map((user) => {
            const u = user.toObject();
            if (u.isAnonymous) {
                u.username = `Ghost${String(u._id).slice(-4)}`;
            }
            return u;
        });

        res.json(safeUsers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -email");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const safeUser = user.toObject();
        if (safeUser.isAnonymous) {
            safeUser.username = `Ghost${String(safeUser._id).slice(-4)}`;
        }

        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
