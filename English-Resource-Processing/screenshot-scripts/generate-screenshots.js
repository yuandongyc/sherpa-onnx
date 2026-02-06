const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('========================================');
console.log('  Screenshot Generator');
console.log('========================================\n');

const transcription2Dir = path.join(__dirname, '..', 'output', 'transcription2');
const screenshotsDir = path.join(__dirname, '..', 'output', 'screenshots');
const videoListPath = path.join(__dirname, '..', 'output', 'video-list.json');

try {
  if (!fs.existsSync(transcription2Dir)) {
    console.error(`Error: Transcription2 directory not found: ${transcription2Dir}`);
    process.exit(1);
  }

  const config = require('../config');
  const ffmpegPath = config.ffmpeg.path;

  if (!fs.existsSync(ffmpegPath)) {
    console.error(`Error: FFmpeg not found: ${ffmpegPath}`);
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(transcription2Dir).filter(file => file.endsWith('.json'));
  
  if (jsonFiles.length === 0) {
    console.error('Error: No JSON files found in transcription2 directory');
    process.exit(1);
  }

  if (!fs.existsSync(videoListPath)) {
    console.error(`Error: Video list file not found: ${videoListPath}`);
    process.exit(1);
  }

  const videoList = JSON.parse(fs.readFileSync(videoListPath, 'utf8'));
  const videoMap = {};
  
  videoList.videos.forEach(video => {
    videoMap[video.name] = video.path;
  });

  console.log(`Found ${jsonFiles.length} transcription files\n`);

  let totalScreenshots = 0;

  for (const jsonFile of jsonFiles) {
    const videoName = path.basename(jsonFile, '.json');
    const transcriptionPath = path.join(transcription2Dir, jsonFile);
    
    console.log(`Processing: ${jsonFile}`);

    const transcriptionData = JSON.parse(fs.readFileSync(transcriptionPath, 'utf8'));
    
    if (!transcriptionData.segments || transcriptionData.segments.length === 0) {
      console.log(`  No segments found, skipping\n`);
      continue;
    }

    const screenshotSegments = transcriptionData.segments.filter(seg => 
      seg.text && seg.text.startsWith('Look at number')
    );

    if (screenshotSegments.length === 0) {
      console.log(`  No "Look at number" segments found, skipping\n`);
      continue;
    }

    const videoOutputDir = path.join(screenshotsDir, videoName);
    if (!fs.existsSync(videoOutputDir)) {
      fs.mkdirSync(videoOutputDir, { recursive: true });
      console.log(`  Created output directory: ${videoOutputDir}`);
    }

    console.log(`  Found ${screenshotSegments.length} segments to screenshot`);

    for (let i = 0; i < screenshotSegments.length; i++) {
      const segment = screenshotSegments[i];
      const timestamp = segment.start + 1;
      const filename = `screenshot_${String(i + 1).padStart(4, '0')}.jpg`;
      const outputPath = path.join(videoOutputDir, filename);

      const videoRelativePath = videoMap[videoName];
      if (!videoRelativePath) {
        console.error(`  Error: Video path not found for ${videoName} in video-list.json`);
        continue;
      }

      const videoPath = path.join(__dirname, '..', 'input', videoRelativePath);
      
      if (!fs.existsSync(videoPath)) {
        console.error(`  Error: Video file not found: ${videoPath}`);
        continue;
      }

      const cmd = `"${ffmpegPath}" -i "${videoPath}" -ss ${timestamp.toFixed(2)} -vframes 1 "${outputPath}"`;

      try {
        execSync(cmd, { stdio: 'pipe' });
        console.log(`  [${i + 1}/${screenshotSegments.length}] Generated: ${filename} (${timestamp.toFixed(2)}s)`);
        totalScreenshots++;
      } catch (error) {
        console.error(`  Error generating screenshot ${i + 1}:`, error.message);
      }
    }

    console.log();
  }

  console.log('========================================');
  console.log('  Generation Completed!');
  console.log('========================================');
  console.log(`Total screenshots generated: ${totalScreenshots}`);
  console.log(`Output directory: ${screenshotsDir}`);
  console.log('========================================\n');

} catch (error) {
  console.error('\nError generating screenshots:', error.message);
  console.error(error.stack);
  process.exit(1);
}
