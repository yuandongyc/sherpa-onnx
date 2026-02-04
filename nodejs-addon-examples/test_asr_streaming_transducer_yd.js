// Copyright (c)  2024  Xiaomi Corporation
const sherpa_onnx = require('sherpa-onnx-node');

// 使用绝对路径
const path = require('path');
const modelDir = 'D:/MyProjects/c_projects/sherpa-onnx/sherpa-onnx-ffmpeg-windows-demo/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20';

const config = {
  'featConfig': {
    'sampleRate': 16000,
    'featureDim': 80,
  },
  'modelConfig': {
    'transducer': {
      'encoder': path.join(modelDir, 'encoder-epoch-99-avg-1.onnx'),
      'decoder': path.join(modelDir, 'decoder-epoch-99-avg-1.onnx'),
      'joiner': path.join(modelDir, 'joiner-epoch-99-avg-1.onnx'),
    },
    'tokens': path.join(modelDir, 'tokens.txt'),
    'numThreads': 2,
    'provider': 'cpu',
    'debug': 1,
  }
};

const waveFilename = 'D:/MyProjects/c_projects/sherpa-onnx/sherpa-onnx-ffmpeg-windows-demo/video2/video2_audio.wav';

const recognizer = new sherpa_onnx.OnlineRecognizer(config);
console.log('Started')
let start = Date.now();
const stream = recognizer.createStream();
const wave = sherpa_onnx.readWave(waveFilename);
stream.acceptWaveform({sampleRate: wave.sampleRate, samples: wave.samples});

const tailPadding = new Float32Array(wave.sampleRate * 0.4);
stream.acceptWaveform({samples: tailPadding, sampleRate: wave.sampleRate});

while (recognizer.isReady(stream)) {
  recognizer.decode(stream);
}
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
const fs = require('fs');
const outputFile = 'D:/MyProjects/c_projects/sherpa-onnx/nodejs-addon-examples/transcription_result.txt';
const outputContent = `音频文件: ${waveFilename}\n\n时长: ${duration.toFixed(3)} 秒\n处理时间: ${elapsed_seconds.toFixed(3)} 秒\nRTF: ${real_time_factor.toFixed(3)}\n\n=== 转录文本 ===\n${result.text}\n\n=== 详细结果 ===\n${JSON.stringify(result, null, 2)}`;
fs.writeFileSync(outputFile, outputContent, 'utf8');
console.log(`\n完整结果已保存到: ${outputFile}`);
