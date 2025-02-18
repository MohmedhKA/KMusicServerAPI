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
    return {
        ...song,
        thumbnail: song.thumbnail
            .replace('/home/shin_chan/musicServer/Data/Anger/thumb/', 'http://192.168.1.128:3000/thumb/')
            .replace('/home/shin_chan/musicServer/Data/Excitement/thumb/', 'http://192.168.1.128:3000/thumb/')
            .replace('/home/shin_chan/musicServer/Data/Joy/thumb/', 'http://192.168.1.128:3000/thumb/')
            .replace('/home/shin_chan/musicServer/Data/Sad/thumb/', 'http://192.168.1.128:3000/thumb/')
            .replace('/home/shin_chan/musicServer/Data/Surprise/thumb/', 'http://192.168.1.128:3000/thumb/')
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
const baseUrl = 'http://192.168.1.128:3000';
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
