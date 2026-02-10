const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  Audio Transcriber (VAD + SenseVoice)');
console.log('========================================\n');

const config = require('./config');

try {
  const { AudioTranscriberSense } = require('./audio-transcriber-sense/dist/index.js');

  const inputDir = config.directories.audio;
  const outputDir = path.join(__dirname, 'output', 'transcription-sense');

  if (!fs.existsSync(inputDir)) {
    console.error(`Error: Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(config.models.senseVoice.dir)) {
    console.error(`Error: SenseVoice model directory does not exist: ${config.models.senseVoice.dir}`);
    process.exit(1);
  }

  console.log('=== Batch transcribing audio files ===');
  console.log(`Input directory: ${inputDir}`);
  console.log(`Output directory: ${outputDir}`);
  console.log(`SenseVoice model: ${config.models.senseVoice.model}\n`);

  const transcriber = new AudioTranscriberSense({
    vad: {
      model: config.models.vad.path,
      threshold: config.vad.threshold,
      minSpeechDuration: config.vad.minSpeechDuration,
      minSilenceDuration: config.vad.minSilenceDuration,
      maxSpeechDuration: config.vad.maxSpeechDuration,
      windowSize: config.vad.windowSize,
      bufferSizeInSeconds: config.vad.bufferSizeInSeconds,
    },
    senseVoice: {
      modelDir: config.models.senseVoice.dir,
      model: config.models.senseVoice.model,
      tokens: config.models.senseVoice.tokens,
      numThreads: config.models.senseVoice.numThreads || 2,
      provider: config.models.senseVoice.provider || 'cpu',
      debug: config.models.senseVoice.debug || 0,
    },
  });

  await transcriber.transcribeDirectory(inputDir, outputDir);

  console.log('\n========================================');
  console.log('  Transcription Completed!');
  console.log('========================================');
  console.log(`Results saved to: ${outputDir}`);
  console.log('========================================\n');

} catch (error) {
  console.error('\nError during transcription:', error.message);
  console.error(error.stack);
  process.exit(1);
}
