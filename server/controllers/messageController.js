import Message from "../models/Message.js";

// Get messages for a room
export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ room: roomId })
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
