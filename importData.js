const mm = require('music-metadata'); // For reading metadata
const fs = require('fs-extra'); // File handling
const path = require('path'); // Path utilities
const sharp = require('sharp'); // Image processing

const MUSIC_DIR = "/home/shin_chan/musicServer/Data"; // Adjust based on your directory
const OUTPUT_JSON = path.join(MUSIC_DIR, "Metadata.json");
const THUMB_DIR = path.join(MUSIC_DIR, "thumb");

// Ensure the thumb directory exists
fs.ensureDirSync(THUMB_DIR);

const emotions = ["Anger", "Joy", "Excitement", "Sad", "Surprise"]; // Emotion categories

async function extractMetadata(filePath, emotion) {
    try {
        const metadata = await mm.parseFile(filePath);
        const common = metadata.common;
        const fileName = path.basename(filePath);

        // Extract metadata fields
        const songData = {
            title: common.title || fileName.replace(/\.[^/.]+$/, ""), // Remove extension if no title
            artist: common.artist || "Unknown Artist",
            album: common.album || "Unknown Album",
            duration: metadata.format.duration ? metadata.format.duration.toFixed(2) : "Unknown",
            emotion: emotion, // Assigned based on folder
            fileLocation: filePath,
            thumbnail: ""
        };

        // Handle thumbnail extraction
        if (common.picture && common.picture.length > 0) {
            const imageBuffer = common.picture[0].data;
            const thumbnailPath = path.join(THUMB_DIR, fileName.replace(/\.[^/.]+$/, ".jpg"));

            await sharp(imageBuffer).resize(300, 300).toFile(thumbnailPath);
            songData.thumbnail = thumbnailPath;
        }

        return songData;
    } catch (error) {
        console.error(`Error processing ${filePath}: ${error.message}`);
        return null;
    }
}

async function processSongs() {
    let allSongs = [];

    for (const emotion of emotions) {
        const emotionPath = path.join(MUSIC_DIR, emotion);

        if (!fs.existsSync(emotionPath)) continue;

        const files = fs.readdirSync(emotionPath).filter(file => file.endsWith('.mp3'));

        for (const file of files) {
            const filePath = path.join(emotionPath, file);
            const songData = await extractMetadata(filePath, emotion);

            if (songData) allSongs.push(songData);
        }
    }

    // Save metadata to JSON file
    fs.writeJsonSync(OUTPUT_JSON, allSongs, { spaces: 4 });
    console.log("Metadata extraction complete! ✅");
}

// Run the script
processSongs();
