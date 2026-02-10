const { AudioTranscriber } = require('./dist/index.js');
const path = require('path');
const fs = require('fs');

// 原始VAD配置
const configOriginal = {
  transducer: {
    encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/encoder-epoch-99-avg-1.int8.onnx',
    decoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/decoder-epoch-99-avg-1.int8.onnx',
    joiner: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/joiner-epoch-99-avg-1.int8.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/tokens.txt',
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

// 优化VAD配置 - 降低threshold，减少静音检测时间
const configOptimized = {
  transducer: {
    encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/encoder-epoch-99-avg-1.int8.onnx',
    decoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/decoder-epoch-99-avg-1.int8.onnx',
    joiner: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/joiner-epoch-99-avg-1.int8.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/tokens.txt',
  },
  vad: {
    model: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad_v4.onnx',
    threshold: 0.3,        // 降低阈值，更容易检测语音
    minSpeechDuration: 0.2,  // 减少最小语音时长
    minSilenceDuration: 0.3, // 减少静音间隔，更快切分
    maxSpeechDuration: 10,   // 增加最大语音时长，减少截断
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },
};

// 激进优化配置
const configAggressive = {
  transducer: {
    encoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/encoder-epoch-99-avg-1.int8.onnx',
    decoder: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/decoder-epoch-99-avg-1.int8.onnx',
    joiner: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/joiner-epoch-99-avg-1.int8.onnx',
    tokens: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/sherpa-onnx-zipformer-en-2023-04-01/tokens.txt',
  },
  vad: {
    model: 'D:/MyProjects/c_projects/sherpa-onnx/all_models/silero_vad_v4.onnx',
    threshold: 0.2,        // 更低阈值
    minSpeechDuration: 0.15,
    minSilenceDuration: 0.2,
    maxSpeechDuration: 15,
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },
};

async function testConfig(config, configName, outputSubDir) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`【${configName}】`);
  console.log('='.repeat(70));
  console.log('VAD参数:');
  console.log(`  threshold: ${config.vad.threshold}`);
  console.log(`  minSpeechDuration: ${config.vad.minSpeechDuration}`);
  console.log(`  minSilenceDuration: ${config.vad.minSilenceDuration}`);
  console.log(`  maxSpeechDuration: ${config.vad.maxSpeechDuration}`);
  console.log('');

  const transcriber = new AudioTranscriber(config);
  const inputDir = 'D:/MyProjects/c_projects/sherpa-onnx/English-Resource-Processing/output/audio';
  const outputDir = path.join(__dirname, 'files', outputSubDir);

  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const startTime = Date.now();
  await transcriber.transcribeDirectory(inputDir, outputDir);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n完成! 耗时: ${duration}秒`);
  console.log(`输出目录: ${outputDir}`);

  return { configName, outputDir, duration };
}

async function main() {
  console.log('========================================');
  console.log('Zipformer Transducer VAD参数调优测试');
  console.log('========================================\n');

  const results = [];

  // 测试原始配置
  results.push(await testConfig(configOriginal, '原始配置', 'vad_original'));

  // 测试优化配置
  results.push(await testConfig(configOptimized, '优化配置', 'vad_optimized'));

  // 测试激进配置
  results.push(await testConfig(configAggressive, '激进配置', 'vad_aggressive'));

  // 总结
  console.log('\n' + '='.repeat(70));
  console.log('测试完成总结');
  console.log('='.repeat(70));
  results.forEach(r => {
    console.log(`${r.configName}:`);
    console.log(`  耗时: ${r.duration}秒`);
    console.log(`  输出: ${r.outputDir}`);
    console.log('');
  });

  console.log('请使用 compare_accuracy_v2.js 对比不同VAD配置的结果');
}

main().catch(console.error);
