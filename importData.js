const { Client } = require('pg');
const fs = require('fs');

// PostgreSQL Configuration
const client = new Client({
    user: 'shin_chan',
    host: 'localhost',
    database: 'musicdb',
    password: '2006',
    port: 5432,
});


// Connect to PostgreSQL
client.connect();

// Read JSON File
const rawData = fs.readFileSync('Metadata.json');
const songs = JSON.parse(rawData);

async function insertSongs() {
    for (const song of songs) {
        try {
            const query = `INSERT INTO songs (title, artist, album, duration, emotion, file_location, thumbnail)
                           VALUES ($1, $2, $3, $4, $5, $6, $7)`;
            
            const values = [
                song.title || 'Unknown Title',
                song.artist || 'Unknown Artist',
                song.album || 'Unknown Album',
                Math.round(parseFloat(song.duration)) || 0,
                song.emotion || 'unknown',
                song.fileLocation,
                song.thumbnail && song.thumbnail.trim() !== '' ? song.thumbnail : '/home/shin_chan/musicServer/Data/thumb/default.png'
            ];

            await client.query(query, values);
            console.log(`Inserted: ${song.title}`);
        } catch (error) {
            console.error(`Error inserting ${song.title}:`, error);
        }
    }
    client.end();
}

// Run the Insert Function
insertSongs();
