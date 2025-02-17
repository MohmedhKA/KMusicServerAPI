const fs = require("fs");
const path = require("path");

const metadataFile = path.join(__dirname, "../Data/Metadata.json");

// Load metadata
function loadSongs() {
    if (fs.existsSync(metadataFile)) {
        return JSON.parse(fs.readFileSync(metadataFile));
    } else {
        console.error("❌ Metadata file not found!");
        return [];
    }
}

// Fetch all songs
function getAllSongs() {
    return loadSongs();
}

// Fetch songs by emotion
function getSongsByEmotion(emotion) {
    return loadSongs().filter(song => song.emotion.toLowerCase() === emotion.toLowerCase());
}

// Fetch song by title
function getSongByTitle(title) {
    return loadSongs().find(song => song.title.toLowerCase() === title.toLowerCase());
}

module.exports = { getAllSongs, getSongsByEmotion, getSongByTitle };
