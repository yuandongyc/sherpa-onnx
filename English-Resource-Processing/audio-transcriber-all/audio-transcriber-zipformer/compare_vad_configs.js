const fs = require('fs');
const path = require('path');

// 参考文本
const referenceTexts = {
  video2: `lesson two repetition drill look at lesson two look and listen do not speak look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is now you ask the questions ready look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is look at number four is this your watch yes it is look at number five is this your coat yes it is look at number six is this your dress yes it is look at number seven is this your skirt yes it is look at number eight is this your shirt yes it is look at number nine is this your car yes it is look at number ten is this your house`,
  video4: `lesson four repetition drill look at lesson four look and listen do not speak look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is now you ask the questions ready look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is look at number four is this your watch yes it is look at number five is this your coat no it isn't look at number six is this your dress yes it is look at number seven is this your skirt no it isn't look at number eight is this your shirt yes it is look at number nine is this your car yes it is look at number ten is this your house no it isn't look at number eleven is this your suit yes it is look at number twelve is this your school no it isn't look at number thirteen is this your teacher yes it is look at number fourteen is this your son no it isn't look at number fifteen`,
  video6: `lesson six repetition dwell look at lesson six look and listen do not speak look at number eight that's a volvo is it a swedish car or a french car it isn't a french car it's a swedish car look at number nine that's a peugeot is it a french car or a swedish car it isn't a swedish car it's a french car look at number ten that's a mercedes is it a german car or a japanese car it isn't a japanese car it's a german car now you answer the questions in the same way ready look at number eight that's a volvo is it a swedish car or a french car it isn't a french car it's a swedish car look at number nine that's a peugeot is it a french car or a swedish car it isn't a swedish car it's a french car look at number ten that's a mercedes is it a german car or a japanese car it isn't a japanese car it's a german car look at number eleven that's a toyota is it a japanese car or a german car it isn't a german car it's a japanese car look at number twelve that's a daewoo is it a british car or a korean car it isn't a british car it's a korean car look at number thirteen that's a mini is it an american car or an english car it isn't an american car it's an english car look at number fourteen that's a ford is it a swedish car or an american car it isn't a swedish car it's an american car look at number fifteen that's a fiat is it an italian car or an american car it isn't an american car`
};

const videos = ['video2', 'video4', 'video6'];

const vadConfigs = [
  {
    name: '原始配置',
    folder: 'vad_original',
    params: { threshold: 0.5, minSpeechDuration: 0.25, minSilenceDuration: 0.5, maxSpeechDuration: 5 }
  },
  {
    name: '优化配置',
    folder: 'vad_optimized',
    params: { threshold: 0.3, minSpeechDuration: 0.2, minSilenceDuration: 0.3, maxSpeechDuration: 10 }
  },
  {
    name: '激进配置',
    folder: 'vad_aggressive',
    params: { threshold: 0.2, minSpeechDuration: 0.15, minSilenceDuration: 0.2, maxSpeechDuration: 15 }
  }
];

function normalize(text) {
  return text.toLowerCase()
    .replace(/[.,?!]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }
  
  return dp[m][n];
}

function calculateSimilarity(resultText, referenceText) {
  const normResult = normalize(resultText);
  const normReference = normalize(referenceText);
  
  const distance = levenshteinDistance(normResult, normReference);
  const maxLength = Math.max(normResult.length, normReference.length);
  const similarity = ((1 - distance / maxLength) * 100).toFixed(2);
  
  const resultWords = normResult.split(' ').filter(w => w.length > 0);
  const referenceWords = normReference.split(' ').filter(w => w.length > 0);
  
  let matchedWords = 0;
  const wordMap = {};
  
  for (const word of referenceWords) {
    wordMap[word] = (wordMap[word] || 0) + 1;
  }
  
  for (const word of resultWords) {
    if (wordMap[word] > 0) {
      wordMap[word]--;
      matchedWords++;
    }
  }
  
  const wordAccuracy = ((matchedWords / referenceWords.length) * 100).toFixed(2);
  
  return { charSimilarity: similarity, wordAccuracy };
}

console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║          Zipformer Transducer VAD参数调优对比分析                      ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log('');

const results = [];

for (const config of vadConfigs) {
  console.log(`\n【${config.name}】`);
  console.log('VAD参数:');
  console.log(`  threshold: ${config.params.threshold}`);
  console.log(`  minSpeechDuration: ${config.params.minSpeechDuration}`);
  console.log(`  minSilenceDuration: ${config.params.minSilenceDuration}`);
  console.log(`  maxSpeechDuration: ${config.params.maxSpeechDuration}`);
  console.log('');
  
  const configResult = { name: config.name, params: config.params, videos: {}, totalWordAcc: 0, totalCharSim: 0 };
  
  for (const video of videos) {
    const filePath = path.join(__dirname, 'files', config.folder, `${video}.json`);
    
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const metrics = calculateSimilarity(data.fullText || '', referenceTexts[video]);
        configResult.videos[video] = metrics;
        configResult.totalWordAcc += parseFloat(metrics.wordAccuracy);
        configResult.totalCharSim += parseFloat(metrics.charSimilarity);
        console.log(`  ${video}: 词准确率 ${metrics.wordAccuracy}% | 字符相似度 ${metrics.charSimilarity}%`);
      } catch (e) {
        console.log(`  ${video}: 读取失败`);
        configResult.videos[video] = { wordAccuracy: '0.00', charSimilarity: '0.00' };
      }
    } else {
      console.log(`  ${video}: 文件不存在 (${filePath})`);
      configResult.videos[video] = { wordAccuracy: '0.00', charSimilarity: '0.00' };
    }
  }
  
  configResult.avgWordAcc = (configResult.totalWordAcc / videos.length).toFixed(2);
  configResult.avgCharSim = (configResult.totalCharSim / videos.length).toFixed(2);
  results.push(configResult);
  
  console.log(`  平均: 词准确率 ${configResult.avgWordAcc}% | 字符相似度 ${configResult.avgCharSim}%`);
}

// 排名
console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║                          🏆  排 名 结 果                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log('');

results.sort((a, b) => parseFloat(b.avgWordAcc) - parseFloat(a.avgWordAcc));

results.forEach((r, i) => {
  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
  console.log(`${medal} 第${i + 1}名: ${r.name}`);
  console.log(`    平均词准确率: ${r.avgWordAcc}%`);
  console.log(`    平均字符相似度: ${r.avgCharSim}%`);
  console.log(`    threshold: ${r.params.threshold}, minSilence: ${r.params.minSilenceDuration}`);
  console.log('');
});

// 推荐配置
const best = results[0];
console.log('╔══════════════════════════════════════════════════════════════════════╗');
console.log('║                          💡 推 荐 配 置                               ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log('');
console.log(`【${best.name}】为最优配置`);
console.log('');
console.log('推荐VAD参数:');
console.log(`  threshold: ${best.params.threshold}`);
console.log(`  minSpeechDuration: ${best.params.minSpeechDuration}`);
console.log(`  minSilenceDuration: ${best.params.minSilenceDuration}`);
console.log(`  maxSpeechDuration: ${best.params.maxSpeechDuration}`);
console.log(`  windowSize: 512`);
console.log(`  bufferSizeInSeconds: 60`);
console.log('');
console.log('效果提升:');
const original = results.find(r => r.name === '原始配置');
if (original) {
  const improvement = (parseFloat(best.avgWordAcc) - parseFloat(original.avgWordAcc)).toFixed(2);
  console.log(`  词准确率提升: ${improvement}%`);
}
console.log('');
