const { AudioTranscriber } = require('./audio-transcriber/dist/index.js');
const config = require('./config');
const path = require('path');

const transcriber = new AudioTranscriber({
  vad: {
    modelPath: path.resolve(config.models.vad.path),
    threshold: config.vad.threshold,
    minSpeechDuration: config.vad.minSpeechDuration,
    minSilenceDuration: config.vad.minSilenceDuration,
    maxSpeechDuration: config.vad.maxSpeechDuration,
    windowSize: config.vad.windowSize,
    bufferSizeInSeconds: config.vad.bufferSizeInSeconds,
  },
  whisper: {
    modelDir: path.resolve(config.models.whisper.dir),
    encoder: config.models.whisper.encoder,
    decoder: config.models.whisper.decoder,
    tokens: path.resolve(path.join(config.models.whisper.dir, config.models.whisper.tokens)),
    numThreads: config.whisper.numThreads,
    provider: config.whisper.provider,
    debug: config.whisper.debug,
  },
});

console.log('========================================');
console.log('  Test Audio Transcriber');
console.log('========================================\n');

const audioPath = 'output/audio/video2.wav';
const outputPath = 'output/transcription/video2.json';

console.log(`Testing single audio file: ${audioPath}`);
console.log(`Output will be saved to: ${outputPath}\n`);

transcriber.transcribe(audioPath)
  .then((result) => {
    console.log('\n========================================');
    console.log('  Transcription Completed!');
    console.log('========================================');
    console.log(`Total segments: ${result.segments.length}`);
    console.log(`Full text length: ${result.fullText.length} characters`);
    console.log('\nFull text:');
    console.log(result.fullText);
    console.log('\nSegments:');
    result.segments.forEach((segment, index) => {
      console.log(`  [${index + 1}] [${segment.start.toFixed(2)}s - ${segment.end.toFixed(2)}s] ${segment.text}`);
    });
    console.log('========================================\n');
  })
  .catch((error) => {
    console.error('\n========================================');
    console.error('  Transcription Failed!');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.log('========================================\n');
    process.exit(1);
  });
