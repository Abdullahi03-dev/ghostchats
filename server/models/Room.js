import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        pendingMembers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isMain: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        expiresAt: {
            type: Date,
            default: null,
        },

        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
