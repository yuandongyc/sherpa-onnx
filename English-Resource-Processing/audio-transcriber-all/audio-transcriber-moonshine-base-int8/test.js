const { AudioTranscriber } = require('./dist/index.js');
const path = require('path');

const config = {
  moonshine: {
    preprocessor: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-moonshine-tiny-en-int8/preprocess.onnx',
    encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-moonshine-tiny-en-int8/encode.int8.onnx',
    uncachedDecoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-moonshine-tiny-en-int8/uncached_decode.int8.onnx',
    cachedDecoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-moonshine-tiny-en-int8/cached_decode.int8.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-moonshine-tiny-en-int8/tokens.txt',
  },
  vad: {
    model: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad_v4.onnx',
    threshold: 0.5,
    minSpeechDuration: 0.25,
    minSilenceDuration: 0.5,
    maxSpeechDuration: 5,
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },
};

async function test() {
  console.log('=== Testing audio-transcriber-moonshine-base-int8 (with VAD v4 + Moonshine Base int8) ===\n');
  
  const transcriber = new AudioTranscriber(config);
  const inputDir = 'D:/MyProjects/c_projects/sherpa-onnx/English-Resource-Processing/output/audio';
  const outputDir = path.join(__dirname, 'files');
  
  await transcriber.transcribeDirectory(inputDir, outputDir);
  
  console.log('\n=== Test completed for audio-transcriber-moonshine-base-int8 ===');
}

test().catch(console.error);
