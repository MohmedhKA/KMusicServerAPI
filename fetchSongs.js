const fs = require("fs");
const path = require("path");

// Load Metadata
const metadataFile = path.join(__dirname, "../Data/Metadata.json");
let songsMetadata = [];

if (fs.existsSync(metadataFile)) {
    songsMetadata = JSON.parse(fs.readFileSync(metadataFile));
} else {
    console.error("❌ Metadata file not found!");
}

// Update Thumbnail URL for All Songs
const songs = songsMetadata.map(song => {
    const emotion = song.emotion.toLowerCase(); // Ensure emotion is included

    return {
        ...song,
        // Single thumbnail URL (same for compressed & full-size, handled on the app side)
        thumbnail: `http://100.102.217.22:3000/thumb/${emotion}/${path.basename(song.thumbnail)}`
    };
});


// Fetch all songs
function getAllSongs() {
    return songs;
}

// Fetch songs by emotion
function getSongsByEmotion(emotion) {
    return songs.filter(song => song.emotion.toLowerCase() === emotion.toLowerCase());
}

// Fetch song by title
function getSongByTitle(title) {
    return songs.find(song => song.title.toLowerCase() === title.toLowerCase());
}

// Recursively search for the file in the directory
function findFileInDirectory(directory, filename) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            const result = findFileInDirectory(filePath, filename);
            if (result) return result;
        } else if (file === filename) {
            return filePath;
        }
    }
    return null;
}

// Recursively scan directories for all .mp3 files
const baseUrl = 'http://100.102.217.22:3000';

const scanDirectoriesForSongs = (dirPath) => {
    let results = [];

    const list = fs.readdirSync(dirPath);
    list.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Recursively search directories
            results = results.concat(scanDirectoriesForSongs(filePath));
        } else if (path.extname(file).toLowerCase() === '.mp3') {
            // Construct URL without emotion tags
            const relativePath = filePath.replace('/home/shin_chan/musicServer/Data/', '');
            const url = baseUrl + '/song/' + encodeURIComponent(relativePath);
            results.push(url);
        }
    });

    return results;
};

// Fetch all songs from all folders
function getAllSongsFromAllFolders() {
    const baseDir = '/home/shin_chan/musicServer/Data';
    return scanDirectoriesForSongs(baseDir);
}

module.exports = { getAllSongs, getSongsByEmotion, getSongByTitle, getAllSongsFromAllFolders, findFileInDirectory };
