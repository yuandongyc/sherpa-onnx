// Copyright (c)  2023-2024  Xiaomi Corporation (authors: Fangjun Kuang)
// Modified for yd

const sherpa_onnx = require('sherpa-onnx-node');
const fs = require('fs');
const path = require('path');

function createRecognizer() {
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

  return new sherpa_onnx.OfflineRecognizer(config);
}

function createVad() {
  // VAD 模型路径
  const vadModelPath = 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad.onnx';
  
  const config = {
    sileroVad: {
      model: vadModelPath,
      threshold: 0.5,
      minSpeechDuration: 0.25,
      minSilenceDuration: 0.5,
      maxSpeechDuration: 5,
      windowSize: 512,
    },
    sampleRate: 16000,
    debug: true,
    numThreads: 1,
  };

  const bufferSizeInSeconds = 60;

  return new sherpa_onnx.Vad(config, bufferSizeInSeconds);
}

const recognizer = createRecognizer();
const vad = createVad();

// 要转录的音频文件
const waveFilename = 'D:/MyProjects/c_projects/sherpa-onnx/sherpa-onnx-ffmpeg-windows-demo/video2/video2_audio.wav';
const wave = sherpa_onnx.readWave(waveFilename);

if (wave.sampleRate != recognizer.config.featConfig.sampleRate) {
  throw new Error(
      `Expected sample rate: ${recognizer.config.featConfig.sampleRate}. Given: ${wave.sampleRate}`);
}

console.log('Started')
let start = Date.now();

// 保存所有识别结果
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
    stream.acceptWaveform(
        {samples: segment.samples, sampleRate: wave.sampleRate});

    recognizer.decode(stream);
    const r = recognizer.getResult(stream);
    if (r.text.length > 0) {
      const text = r.text.toLowerCase().trim();
      console.log(`${start_time} -- ${end_time}: ${text}`);
      allResults.push({start: start_time, end: end_time, text: text});
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
  stream.acceptWaveform(
      {samples: segment.samples, sampleRate: wave.sampleRate});

  recognizer.decode(stream);
  const r = recognizer.getResult(stream);
  if (r.text.length > 0) {
    const text = r.text.toLowerCase().trim();
    console.log(`${start_time} -- ${end_time}: ${text}`);
    allResults.push({start: start_time, end: end_time, text: text});
  }
}

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

// 保存完整结果到文件
const outputFile = 'D:/MyProjects/c_projects/sherpa-onnx/nodejs-addon-examples/transcription_vad_whisper_result.txt';
const fullText = allResults.map(r => r.text).join(' ');
const outputContent = `音频文件: ${waveFilename}\n\n时长: ${duration.toFixed(3)} 秒\n处理时间: ${elapsed_seconds.toFixed(3)} 秒\nRTF: ${real_time_factor.toFixed(3)}\n\n=== 分段识别结果 ===\n${allResults.map(r => `[${r.start}s - ${r.end}s]: ${r.text}`).join('\n')}\n\n=== 完整文本 ===\n${fullText}`;
fs.writeFileSync(outputFile, outputContent, 'utf8');
console.log(`\n完整结果已保存到: ${outputFile}`);
