import Room from "../models/Room.js";

const createLobby = async () => {
    const lobby = await Room.findOne({ isMain: true });

    if (!lobby) {
        await Room.create({
            name: "Ghost Lobby",
            isMain: true,
            isActive: true,
        });

        console.log(" Lobby created");
    }
};

export default createLobby;
