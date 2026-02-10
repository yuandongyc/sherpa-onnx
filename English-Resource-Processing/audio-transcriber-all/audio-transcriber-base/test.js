const { AudioTranscriber } = require('./dist/index.js');
const path = require('path');

const config = {
  whisper: {
    encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-base.en/base.en-encoder.onnx',
    decoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-base.en/base.en-decoder.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-base.en/base.en-tokens.txt',
    numThreads: 2,
    provider: 'cpu',
    debug: 0,
  },
  vad: {
    model: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad.onnx',
    threshold: 0.5,
    minSpeechDuration: 0.25,
    minSilenceDuration: 0.5,
    maxSpeechDuration: 5,
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },
};

async function test() {
  console.log('=== Testing audio-transcriber-base ===\n');
  
  const transcriber = new AudioTranscriber(config);
  const inputDir = 'D:/MyProjects/c_projects/sherpa-onnx/English-Resource-Processing/output/audio';
  const outputDir = path.join(__dirname, 'files');
  
  await transcriber.transcribeDirectory(inputDir, outputDir);
  
  console.log('\n=== Test completed for audio-transcriber-base ===');
}

test().catch(console.error);
