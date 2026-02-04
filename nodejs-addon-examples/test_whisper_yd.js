// Copyright (c)  2024  Xiaomi Corporation
const sherpa_onnx = require('sherpa-onnx-node');
const fs = require('fs');
const path = require('path');

console.log(`version : ${sherpa_onnx.version}`);
console.log(`git sha1: ${sherpa_onnx.gitSha1}`);
console.log(`git date: ${sherpa_onnx.gitDate}`);

// Whisper 模型路径
const modelDir = 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-whisper-tiny.en';

const config = {
  'featConfig': {
    'sampleRate': 16000,
    'featureDim': 80,
  },
  'modelConfig': {
    'whisper': {
      'encoder': path.join(modelDir, 'tiny.en-encoder.int8.onnx'),
      'decoder': path.join(modelDir, 'tiny.en-decoder.int8.onnx'),
    },
    'tokens': path.join(modelDir, 'tiny.en-tokens.txt'),
    'numThreads': 2,
    'provider': 'cpu',
    'debug': 1,
  }
};

// 要转录的音频文件
const waveFilename = 'D:/MyProjects/c_projects/sherpa-onnx/sherpa-onnx-ffmpeg-windows-demo/video2/video2_audio.wav';

const recognizer = new sherpa_onnx.OfflineRecognizer(config);
console.log('Started')
let start = Date.now();
const stream = recognizer.createStream();
const wave = sherpa_onnx.readWave(waveFilename);
stream.acceptWaveform({sampleRate: wave.sampleRate, samples: wave.samples});

recognizer.decode(stream);
const result = recognizer.getResult(stream);
let stop = Date.now();
console.log('Done')

const elapsed_seconds = (stop - start) / 1000;
const duration = wave.samples.length / wave.sampleRate;
const real_time_factor = elapsed_seconds / duration;
console.log('Wave duration', duration.toFixed(3), 'seconds')
console.log('Elapsed', elapsed_seconds.toFixed(3), 'seconds')
console.log(
    `RTF = ${elapsed_seconds.toFixed(3)}/${duration.toFixed(3)} =`,
    real_time_factor.toFixed(3))
console.log(waveFilename)
console.log('result\n', result)

// 保存完整文本到文件
const outputFile = 'D:/MyProjects/c_projects/sherpa-onnx/nodejs-addon-examples/transcription_whisper_result.txt';
const outputContent = `音频文件: ${waveFilename}\n\n时长: ${duration.toFixed(3)} 秒\n处理时间: ${elapsed_seconds.toFixed(3)} 秒\nRTF: ${real_time_factor.toFixed(3)}\n\n=== 转录文本 ===\n${result.text}\n\n=== 详细结果 ===\n${JSON.stringify(result, null, 2)}`;
fs.writeFileSync(outputFile, outputContent, 'utf8');
console.log(`\n完整结果已保存到: ${outputFile}`);
