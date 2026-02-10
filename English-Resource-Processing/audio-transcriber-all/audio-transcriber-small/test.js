const { AudioTranscriber } = require('./dist/index.js');
const path = require('path');

const config = {
  whisper: {
    encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-small.en/small.en-encoder.onnx',
    decoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-small.en/small.en-decoder.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-small.en/small.en-tokens.txt',
    numThreads: 2,
    provider: 'cpu',
    debug: 0,
  },
  vad: {
    model: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad_v4.onnx',
    threshold: 0.2,
    minSpeechDuration: 0.15,
    minSilenceDuration: 0.2,
    maxSpeechDuration: 15,
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },
};

async function test() {
  console.log('=== Testing audio-transcriber-small ===\n');
  
  const transcriber = new AudioTranscriber(config);
  const inputDir = 'D:/MyProjects/c_projects/sherpa-onnx/English-Resource-Processing/output/audio';
  const outputDir = path.join(__dirname, 'files');
  
  await transcriber.transcribeDirectory(inputDir, outputDir);
  
  console.log('\n=== Test completed for audio-transcriber-small ===');
}

test().catch(console.error);
