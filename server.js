const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { getAllSongs, getSongsByEmotion, getSongByTitle, findFileInDirectory } = require("./fetchSongs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use('/thumb', express.static('/home/shin_chan/musicServer/Data/Anger/thumb'));
app.use('/thumb', express.static('/home/shin_chan/musicServer/Data/Excitement/thumb'));
app.use('/thumb', express.static('/home/shin_chan/musicServer/Data/Joy/thumb'));
app.use('/thumb', express.static('/home/shin_chan/musicServer/Data/Sad/thumb'));
app.use('/thumb', express.static('/home/shin_chan/musicServer/Data/Surprise/thumb'));

app.use('/song/anger', express.static('/home/shin_chan/musicServer/Data/Anger'));
app.use('/song/excitement', express.static('/home/shin_chan/musicServer/Data/Excitement'));
app.use('/song/joy', express.static('/home/shin_chan/musicServer/Data/Joy'));
app.use('/song/sad', express.static('/home/shin_chan/musicServer/Data/Sad'));
app.use('/song/surprise', express.static('/home/shin_chan/musicServer/Data/Surprise'));

// 🔹 API: Get all songs
app.get("/songs", (req, res) => {
    res.json(getAllSongs());
});

const fetchSongs = require('./fetchSongs');

// Serve all songs regardless of emotion tag
app.get('/song/:filename', (req, res) => {
    const filename = decodeURIComponent(req.params.filename);
    const baseDir = '/home/shin_chan/musicServer/Data';
    const filePath = findFileInDirectory(baseDir, filename);


    // Check if the file exists
    if (filePath && fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
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
