import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import generateGhostName from "../utils/generateGhostName.js";

// Signup
export const signup = async (req, res) => {
    const { username, email, password, isAnonymous } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const finalUsername = isAnonymous ? generateGhostName() : username;

        const user = await User.create({ username: finalUsername, email, password, isAnonymous });

        generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        generateToken(res, user._id);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

// Logout
export const logout = async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(200).json({ message: "Logged out successfully" });
}

// Get User Profile (Protected Route)
export const profile = async (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            isAnonymous: req.user.isAnonymous,
            ghostPoints: req.user.ghostPoints,
            messagesSent: req.user.messagesSent,
            roomsJoined: req.user.roomsJoined,
            roomsCreated: req.user.roomsCreated,
            accountLevel: req.user.accountLevel,
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
}

// Toggle Anonymous Mode
export const toggleAnonymous = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.isAnonymous = !user.isAnonymous;
        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            isAnonymous: user.isAnonymous,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}