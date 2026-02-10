const { AudioTranscriber } = require('./dist/index.js');
const path = require('path');

const config = {
  transducer: {
    encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/encoder-epoch-99-avg-1.int8.onnx',
    decoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/decoder-epoch-99-avg-1.int8.onnx',
    joiner: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/joiner-epoch-99-avg-1.int8.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/tokens.txt',
  },
  vad: {
    model: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad_v4.onnx',
    threshold: 0.2,        // 降低阈值，更容易检测语音 (原0.5)
    minSpeechDuration: 0.15,  // 减少最小语音时长 (原0.25)
    minSilenceDuration: 0.2,  // 减少静音间隔，更快切分 (原0.5)
    maxSpeechDuration: 15,   // 增加最大语音时长，减少截断 (原5)
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },
};

async function test() {
  console.log('=== Testing audio-transcriber-zipformer (with VAD v4 + Zipformer) ===\n');
  
  const transcriber = new AudioTranscriber(config);
  const inputDir = 'D:/MyProjects/c_projects/sherpa-onnx/English-Resource-Processing/output/audio';
  const outputDir = path.join(__dirname, 'files');
  
  await transcriber.transcribeDirectory(inputDir, outputDir);
  
  console.log('\n=== Test completed for audio-transcriber-zipformer ===');
}

test().catch(console.error);
