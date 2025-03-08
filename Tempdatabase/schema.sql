CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    album VARCHAR(255),
    duration VARCHAR(10),
    emotion VARCHAR(50) NOT NULL,
    "fileLocation" VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, artist)
); 