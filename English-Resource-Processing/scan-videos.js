const { VideoConverter } = require('./video-converter/dist/index.js');
const config = require('./config');

const converter = new VideoConverter({
  ffmpegPath: config.ffmpeg.path,
  outputDir: config.directories.audio,
  audio: config.audio,
});

console.log('========================================');
console.log('  Video Scanner');
console.log('========================================\n');

try {
  const videoList = converter.scanInputDirectory('input', 'output/video-list.json');
  
  console.log('\n========================================');
  console.log('  Scan Completed!');
  console.log('========================================');
  console.log(`Total videos found: ${videoList.totalCount}`);
  console.log(`Configuration saved to: output/video-list.json`);
  console.log('\nPlease review the configuration file before proceeding with batch conversion.');
  console.log('========================================\n');
  
  console.log('Video files found:');
  videoList.videos.forEach((video, index) => {
    console.log(`  ${index + 1}. ${video.category}/${video.name}${video.extension}`);
  });
} catch (error) {
  console.error('\nError scanning directory:', error.message);
  process.exit(1);
}
