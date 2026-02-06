const fs = require('fs');
const path = require('path');
const sherpa_onnx = require('sherpa-onnx-node');
const config = require('./config');
const { VideoConverter } = require('./video-converter/dist/index.js');

function createRecognizer() {
  const whisperConfig = {
    'featConfig': {
      'sampleRate': config.audio.sampleRate,
      'featureDim': 80,
    },
    'modelConfig': {
      'whisper': {
        'encoder': path.join(config.models.whisper.dir, config.models.whisper.encoder),
        'decoder': path.join(config.models.whisper.dir, config.models.whisper.decoder),
      },
      'tokens': path.join(config.models.whisper.dir, config.models.whisper.tokens),
      'numThreads': config.whisper.numThreads,
      'provider': config.whisper.provider,
      'debug': config.whisper.debug,
    }
  };

  return new sherpa_onnx.OfflineRecognizer(whisperConfig);
}

function createVad() {
  const vadConfig = {
    sileroVad: {
      model: config.models.vad.path,
      threshold: config.vad.threshold,
      minSpeechDuration: config.vad.minSpeechDuration,
      minSilenceDuration: config.vad.minSilenceDuration,
      maxSpeechDuration: config.vad.maxSpeechDuration,
      windowSize: config.vad.windowSize,
    },
    sampleRate: config.audio.sampleRate,
    debug: true,
    numThreads: 1,
  };

  return new sherpa_onnx.Vad(vadConfig, config.vad.bufferSizeInSeconds);
}

function convertVideoToAudio(videoPath) {
  const converter = new VideoConverter({
    ffmpegPath: config.ffmpeg.path,
    outputDir: config.directories.audio,
    audio: config.audio,
  });
  return converter.convertVideoToAudio(videoPath);
}

function transcribeAudio(audioPath) {
  console.log(`\n=== Transcribing audio ===`);
  console.log(`Input: ${audioPath}`);

  const recognizer = createRecognizer();
  const vad = createVad();

  const wave = sherpa_onnx.readWave(audioPath);

  if (wave.sampleRate != recognizer.config.featConfig.sampleRate) {
    throw new Error(
      `Expected sample rate: ${recognizer.config.featConfig.sampleRate}. Given: ${wave.sampleRate}`);
  }

  console.log('Started transcription...');
  const startTime = Date.now();

  let allResults = [];

  const windowSize = vad.config.sileroVad.windowSize;
  for (let i = 0; i < wave.samples.length; i += windowSize) {
    const thisWindow = wave.samples.subarray(i, i + windowSize);
    vad.acceptWaveform(thisWindow);

    while (!vad.isEmpty()) {
      const segment = vad.front();
      vad.pop();

      let start_time = segment.start / wave.sampleRate;
      let end_time = start_time + segment.samples.length / wave.sampleRate;

      start_time = start_time.toFixed(2);
      end_time = end_time.toFixed(2);

      const stream = recognizer.createStream();
      stream.acceptWaveform({ samples: segment.samples, sampleRate: wave.sampleRate });

      recognizer.decode(stream);
      const r = recognizer.getResult(stream);
      if (r.text.length > 0) {
        const text = r.text.toLowerCase().trim();
        console.log(`${start_time} -- ${end_time}: ${text}`);
        allResults.push({ start: start_time, end: end_time, text: text });
      }
    }
  }

  vad.flush();

  while (!vad.isEmpty()) {
    const segment = vad.front();
    vad.pop();

    let start_time = segment.start / wave.sampleRate;
    let end_time = start_time + segment.samples.length / wave.sampleRate;

    start_time = start_time.toFixed(2);
    end_time = end_time.toFixed(2);

    const stream = recognizer.createStream();
    stream.acceptWaveform({ samples: segment.samples, sampleRate: wave.sampleRate });

    recognizer.decode(stream);
    const r = recognizer.getResult(stream);
    if (r.text.length > 0) {
      const text = r.text.toLowerCase().trim();
      console.log(`${start_time} -- ${end_time}: ${text}`);
      allResults.push({ start: start_time, end: end_time, text: text });
    }
  }

  const endTime = Date.now();
  console.log('Transcription completed!');

  const elapsed_seconds = (endTime - startTime) / 1000;
  const duration = wave.samples.length / wave.sampleRate;
  const real_time_factor = elapsed_seconds / duration;

  console.log(`Wave duration: ${duration.toFixed(3)} seconds`);
  console.log(`Elapsed time: ${elapsed_seconds.toFixed(3)} seconds`);
  console.log(`RTF = ${elapsed_seconds.toFixed(3)}/${duration.toFixed(3)} = ${real_time_factor.toFixed(3)}`);

  const audioName = path.basename(audioPath, path.extname(audioPath));
  const outputFile = path.join(config.directories.transcription, `${audioName}_transcription.txt`);

  const fullText = allResults.map(r => r.text).join(' ');
  const outputContent = `Audio file: ${audioPath}\n\nDuration: ${duration.toFixed(3)} seconds\nProcessing time: ${elapsed_seconds.toFixed(3)} seconds\nRTF: ${real_time_factor.toFixed(3)}\n\n=== Segmented Results ===\n${allResults.map(r => `[${r.start}s - ${r.end}s]: ${r.text}`).join('\n')}\n\n=== Full Text ===\n${fullText}`;

  fs.writeFileSync(outputFile, outputContent, 'utf8');
  console.log(`\nFull transcription saved to: ${outputFile}`);

  return {
    allResults,
    fullText,
    duration,
    elapsed_seconds,
    real_time_factor,
    outputFile
  };
}

function processVideo(videoPath) {
  console.log('========================================');
  console.log('  English Video Processing');
  console.log('========================================');
  console.log(`Video: ${videoPath}\n`);

  if (!fs.existsSync(videoPath)) {
    console.error(`Error: Video file not found: ${videoPath}`);
    return;
  }

  try {
    const { wavPath, mp3Path } = convertVideoToAudio(videoPath);
    const transcription = transcribeAudio(wavPath);

    console.log('\n========================================');
    console.log('  Processing completed!');
    console.log('========================================');
    console.log(`Audio files:`);
    console.log(`  WAV: ${wavPath}`);
    console.log(`  MP3: ${mp3Path}`);
    console.log(`Transcription: ${transcription.outputFile}`);
    console.log(`Full text: ${transcription.fullText}`);
    console.log('========================================\n');

    return {
      wavPath,
      mp3Path,
      transcription
    };
  } catch (error) {
    console.error('\nError processing video:', error.message);
    throw error;
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node index.js <video-file-path>');
    console.log('Example: node index.js input/New-Concept/lesson1.mp4');
    process.exit(1);
  }

  const videoPath = args[0];
  processVideo(videoPath);
}

if (require.main === module) {
  main();
}

module.exports = {
  convertVideoToAudio,
  transcribeAudio,
  processVideo
};
