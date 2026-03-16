const ghostAdjectives = [
    "Shadow", "Phantom", "Silent", "Hollow", "Fading",
    "Cursed", "Veiled", "Drifting", "Lurking", "Frozen",
    "Wicked", "Spectral", "Eerie", "Twisted", "Haunted",
    "Void", "Grim", "Pale", "Sinister", "Mystic",
    "Nether", "Obsidian", "Crimson", "Midnight", "Ashen",
];

const ghostNouns = [
    "Wraith", "Specter", "Spirit", "Shade", "Ghoul",
    "Whisper", "Phantom", "Reaper", "Banshee", "Revenant",
    "Poltergeist", "Apparition", "Echo", "Omen", "Haunt",
    "Crawler", "Lurker", "Drifter", "Walker", "Stalker",
    "Howler", "Watcher", "Seeker", "Fang", "Skull",
];

const generateGhostName = () => {
    const adj = ghostAdjectives[Math.floor(Math.random() * ghostAdjectives.length)];
    const noun = ghostNouns[Math.floor(Math.random() * ghostNouns.length)];
    const number = Math.floor(Math.random() * 99);
    return `${adj}${noun}${number}`;
};

export default generateGhostName;
