const { AudioTranscriber } = require('./dist/index.js');
const path = require('path');

const config = {
  zipformerCtc: {
    model: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-ctc-en-2023-10-02/model.int8.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-ctc-en-2023-10-02/tokens.txt',
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
  console.log('=== Testing audio-transcriber-zipformer-ctc (with VAD v4 + Zipformer CTC) ===\n');
  
  const transcriber = new AudioTranscriber(config);
  const inputDir = 'D:/MyProjects/c_projects/sherpa-onnx/English-Resource-Processing/output/audio';
  const outputDir = path.join(__dirname, 'files');
  
  await transcriber.transcribeDirectory(inputDir, outputDir);
  
  console.log('\n=== Test completed for audio-transcriber-zipformer-ctc ===');
}

test().catch(console.error);
