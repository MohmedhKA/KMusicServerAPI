const mm = require('music-metadata');
const path = require('path');
const fs = require('fs');

// Metadata extraction utilities
const extractMetadata = async (filePath) => {
  try {
    // Parse metadata from the audio file
    const metadata = await mm.parseFile(filePath);
    
    // Extract relevant information
    const extractedData = {
      title: metadata.common.title || path.basename(filePath, path.extname(filePath)),
      artist: metadata.common.artist || 'Unknown',
      album: metadata.common.album || 'Unknown',
      duration: metadata.format.duration ? metadata.format.duration.toString() : '0',
      // If there's picture data, we could save it as thumbnail
      hasPicture: metadata.common.picture && metadata.common.picture.length > 0
    };
    
    return extractedData;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    // Return basic info if metadata extraction fails
    return {
      title: path.basename(filePath, path.extname(filePath)),
      artist: 'Unknown',
      album: 'Unknown',
      duration: '0',
      hasPicture: false
    };
  }
};

// Extract and save thumbnail if available
const extractThumbnail = async (filePath, outputDir) => {
  try {
    const metadata = await mm.parseFile(filePath);
    
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const fileName = path.basename(filePath, path.extname(filePath));
      const outputPath = path.join(outputDir, `${fileName}.jpg`);
      
      fs.writeFileSync(outputPath, picture.data);
      return outputPath;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting thumbnail:', error);
    return null;
  }
};

module.exports = {
  extractMetadata,
  extractThumbnail
};