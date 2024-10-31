const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Function to convert MKV to MP4
function convertMKVtoMP4(inputPath, outputPath) {
    ffmpeg(inputPath)
        .toFormat('mp4')
        .on('end', () => {
            console.log(`Conversion completed for ${path.basename(inputPath)}`);
        })
        .on('error', (err) => {
            console.error(`Error converting ${path.basename(inputPath)}:`, err);
        })
        .save(outputPath);
}

// Function to process all MKV files in a directory
function convertAllMKVs(inputDir, outputDir) {
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Failed to read directory:', err);
            return;
        }

        files.forEach(file => {
            if (path.extname(file).toLowerCase() === '.mkv') {
                const inputPath = path.join(inputDir, file);
                const outputFileName = path.basename(file, '.mkv') + '.mp4';
                const outputPath = path.join(outputDir, outputFileName);
                convertMKVtoMP4(inputPath, outputPath);
            }
        });
    });
}

// Using relative paths
const inputDirectory = './unnamed'; // Adjust the folder name as needed
const outputDirectory = './media'; // Adjust the folder name as needed

// Ensure output directory exists
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

convertAllMKVs(inputDirectory, outputDirectory);
