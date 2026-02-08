const path = require('path');

module.exports = {
  ffmpeg: {
    path: path.join(__dirname, 'extern', 'ffmpeg', 'ffmpeg.exe'),
  },

  models: {
    whisper: {
      dir: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-base.en',
      encoder: 'base.en-encoder.int8.onnx',
      decoder: 'base.en-decoder.int8.onnx',
      tokens: 'base.en-tokens.txt',
    },
    senseVoice: {
      dir: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-sense-voice-zh-en-ja-ko-yue-2024-07-17',
      model: 'model.int8.onnx',
      tokens: 'tokens.txt',
    },
    vad: {
      path: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad.onnx',
    },
  },

  directories: {
    root: __dirname,
    input: path.join(__dirname, 'input'),
    output: path.join(__dirname, 'output'),
    audio: path.join(__dirname, 'output', 'audio'),
    transcription: path.join(__dirname, 'output', 'transcription'),
  },

  audio: {
    sampleRate: 16000,
    channels: 1,
    sampleFormat: 's16',
  },

  vad: {
    threshold: 0.5,
    minSpeechDuration: 0.25,
    minSilenceDuration: 0.5,
    maxSpeechDuration: 5,
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },

  whisper: {
    numThreads: 2,
    provider: 'cpu',
    debug: 1,
  },
};
