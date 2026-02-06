const { AudioTranscriber } = require('./audio-transcriber/dist/index.js');
const config = require('./config');
const path = require('path');

const transcriber = new AudioTranscriber({
  whisper: {
    encoder: path.resolve(config.models.whisper.dir, config.models.whisper.encoder),
    decoder: path.resolve(config.models.whisper.dir, config.models.whisper.decoder),
    tokens: path.resolve(config.models.whisper.dir, config.models.whisper.tokens),
    numThreads: config.whisper.numThreads,
    provider: config.whisper.provider,
    debug: config.whisper.debug,
  },
  vad: {
    model: config.models.vad.path,
    threshold: config.vad.threshold,
    minSpeechDuration: config.vad.minSpeechDuration,
    minSilenceDuration: config.vad.minSilenceDuration,
    maxSpeechDuration: config.vad.maxSpeechDuration,
    windowSize: config.vad.windowSize,
    bufferSizeInSeconds: config.vad.bufferSizeInSeconds,
  },
});

console.log('========================================');
console.log('  Audio Transcriber (VAD + Whisper)');
console.log('========================================\n');

const inputDir = config.directories.audio;
const outputDir = config.directories.transcription;

try {
  if (!require('fs').existsSync(inputDir)) {
    console.error(`Error: Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  transcriber.transcribeDirectory(inputDir, outputDir)
    .then(() => {
      console.log('\n========================================');
      console.log('  Transcription Completed!');
      console.log('========================================');
      console.log(`Results saved to: ${outputDir}`);
      console.log('========================================\n');
    })
    .catch((error) => {
      console.error('\nError during transcription:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.error('\nError initializing transcriber:', error.message);
  process.exit(1);
}
