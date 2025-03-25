const { exec } = require("child_process");
const path = require("path");

const pythonPath = "/home/shin_chan/miniconda3/envs/AI/bin/python3";
const scriptPath = path.join(__dirname, "predict_emotion.py");

function predictEmotion(audioFile) {
    return new Promise((resolve, reject) => {
        const command = `${pythonPath} ${scriptPath} "${audioFile}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Execution error: ${error.message}`));
                return;
            }
            
            const emotion = stdout.trim().toLowerCase();
            
            // Map Python output to our emotion categories
            const emotionMap = {
                'happy': 'Joy',
                'sad': 'Sad',
                'angry': 'Anger',
                'relaxed': 'Romantic',
                'energetic': 'Excitement'
            };

            if (emotionMap[emotion]) {
                resolve(emotionMap[emotion]);
            } else {
                resolve('Joy'); // Default emotion if mapping not found
            }
        });
    });
}

// Example usage with async/await
async function main() {
    try {
        const audioFilePath = "/home/shin_chan/musicServer/Data/Post Malone_ Swae Lee - Sunflower (Lyrics)(MP3_320K).mp3";
        const emotion = await predictEmotion(audioFilePath);
        console.log(`Detected emotion: ${emotion}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

// Run the example if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = { predictEmotion };
