const sherpa_onnx = require('sherpa-onnx-node');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  Test Sherpa-ONX API');
console.log('========================================\n');

const config = {
  featConfig: {
    sampleRate: 16000,
    featureDim: 80,
  },
  modelConfig: {
    whisper: {
      encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-tiny.en/tiny.en-encoder.int8.onnx',
      decoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-tiny.en/tiny.en-decoder.int8.onnx',
    },
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-tiny.en/tiny.en-tokens.txt',
    numThreads: 2,
    provider: 'cpu',
    debug: 1,
  }
};

console.log('Config:', JSON.stringify(config, null, 2));
console.log('');

try {
  console.log('Creating OfflineRecognizer...');
  const recognizer = new sherpa_onnx.OfflineRecognizer(config);
  console.log('OfflineRecognizer created:', typeof recognizer);
  console.log('');

  const audioPath = 'output/audio/video2.wav';
  console.log('Loading audio file:', audioPath);
  
  if (!fs.existsSync(audioPath)) {
    console.error('Audio file not found:', audioPath);
    process.exit(1);
  }

  const wave = sherpa_onnx.readWave(audioPath);
  console.log('Wave loaded:', wave);
  console.log('');

  console.log('Creating stream...');
  const stream = recognizer.createStream();
  console.log('Stream created:', typeof stream);
  console.log('');

  console.log('Processing audio...');
  stream.acceptWaveform({sampleRate: wave.sampleRate, samples: wave.samples});

  recognizer.decode(stream);
  const result = recognizer.getResult(stream);
  
  console.log('');
  console.log('========================================');
  console.log('  Transcription Completed!');
  console.log('========================================');
  console.log('Result:', result);
  console.log('');
  console.log('========================================\n');

} catch (error) {
  console.error('');
  console.error('========================================');
  console.error('  Transcription Failed!');
  console.error('========================================');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.log('========================================\n');
  process.exit(1);
}
