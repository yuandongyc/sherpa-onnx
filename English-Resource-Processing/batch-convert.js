const { VideoConverter } = require('./video-converter/dist/index.js');
const config = require('./config');
const fs = require('fs');

const converter = new VideoConverter({
  ffmpegPath: config.ffmpeg.path,
  outputDir: config.directories.audio,
  audio: config.audio,
});

const configPath = 'output/video-list.json';

console.log('========================================');
console.log('  Batch Video Converter');
console.log('========================================\n');

try {
  if (!fs.existsSync(configPath)) {
    console.error(`Error: Config file not found: ${configPath}`);
    console.log('Please run scan-videos.js first to generate the config file.');
    process.exit(1);
  }

  const results = converter.convertVideosFromConfig(configPath);

  console.log('\n========================================');
  console.log('  Batch Conversion Completed!');
  console.log('========================================');
  console.log(`Total videos converted: ${results.length}`);
  console.log('\nOutput files:');
  results.forEach((result, index) => {
    console.log(`  ${index + 1}. ${result.wavPath}`);
  });
  console.log('========================================\n');
} catch (error) {
  console.error('\nError during batch conversion:', error.message);
  process.exit(1);
}
