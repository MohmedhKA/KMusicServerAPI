const express = require("express");
const cors = require("cors");
const { getAllSongs, getSongsByEmotion, getSongByTitle } = require("./fetchSongs");

const app = express();
const PORT = 3000;

app.use(cors());

// 🔹 API: Get all songs
app.get("/songs", (req, res) => {
    res.json(getAllSongs());
});

// 🔹 API: Get songs by emotion
app.get("/songs/emotion/:emotion", (req, res) => {
    res.json(getSongsByEmotion(req.params.emotion));
});

// 🔹 API: Get song by title
app.get("/songs/title/:title", (req, res) => {
    const song = getSongByTitle(req.params.title);
    if (song) res.json(song);
    else res.status(404).json({ message: "Song not found" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🎵 Music API running at http://localhost:${PORT}`);
});
