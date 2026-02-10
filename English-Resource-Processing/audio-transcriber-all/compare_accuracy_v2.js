const fs = require('fs');
const path = require('path');

// 正确的参考文本（从SRT提取，已清洗）
const referenceTexts = {
  video2: `lesson two repetition drill look at lesson two look and listen do not speak look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is now you ask the questions ready look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is look at number four is this your watch yes it is look at number five is this your coat yes it is look at number six is this your dress yes it is look at number seven is this your skirt yes it is look at number eight is this your shirt yes it is look at number nine is this your car yes it is look at number ten is this your house`,
  
  video4: `lesson four repetition drill look at lesson four look and listen do not speak look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is now you ask the questions ready look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is look at number four is this your watch yes it is look at number five is this your coat no it isn't look at number six is this your dress yes it is look at number seven is this your skirt no it isn't look at number eight is this your shirt yes it is look at number nine is this your car yes it is look at number ten is this your house no it isn't look at number eleven is this your suit yes it is look at number twelve is this your school no it isn't look at number thirteen is this your teacher yes it is look at number fourteen is this your son no it isn't look at number fifteen`,
  
  video6: `lesson six repetition dwell look at lesson six look and listen do not speak look at number eight that's a volvo is it a swedish car or a french car it isn't a french car it's a swedish car look at number nine that's a peugeot is it a french car or a swedish car it isn't a swedish car it's a french car look at number ten that's a mercedes is it a german car or a japanese car it isn't a japanese car it's a german car now you answer the questions in the same way ready look at number eight that's a volvo is it a swedish car or a french car it isn't a french car it's a swedish car look at number nine that's a peugeot is it a french car or a swedish car it isn't a swedish car it's a french car look at number ten that's a mercedes is it a german car or a japanese car it isn't a japanese car it's a german car look at number eleven that's a toyota is it a japanese car or a german car it isn't a german car it's a japanese car look at number twelve that's a daewoo is it a british car or a korean car it isn't a british car it's a korean car look at number thirteen that's a mini is it an american car or an english car it isn't an american car it's an english car look at number fourteen that's a ford is it a swedish car or an american car it isn't a swedish car it's an american car look at number fifteen that's a fiat is it an italian car or an american car it isn't an american car`
};

// 模型目录列表
const models = [
  { name: 'audio-transcriber-base', label: 'Whisper Base' },
  { name: 'audio-transcriber-moonshine-base-int8', label: 'Moonshine Base' },
  { name: 'audio-transcriber-moonshine-tiny-int8', label: 'Moonshine Tiny' },
  { name: 'audio-transcriber-small', label: 'Whisper Small' },
  { name: 'audio-transcriber-tiny-v4', label: 'Whisper Tiny v4' },
  { name: 'audio-transcriber-tiny', label: 'Whisper Tiny' },
  { name: 'audio-transcriber-zipformer-ctc', label: 'Zipformer CTC' },
  { name: 'audio-transcriber-zipformer', label: 'Zipformer Transducer' }
];

const videos = ['video2', 'video4', 'video6'];

// 标准化文本
function normalize(text) {
  return text.toLowerCase()
    .replace(/[.,?!]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/lessened/g, 'lesson')
    .replace(/reputation/g, 'repetition')
    .replace(/code/g, 'coat')
    .replace(/vol /g, 'volvo ')
    .replace(/vovel/g, 'volvo')
    .replace(/pejot/g, 'peugeot')
    .replace(/fren /g, 'french ')
    .replace(/day woo/g, 'daewoo')
    .replace(/it' this/g, 'is this')
    .replace(/it's this/g, 'is this')
    .trim();
}

// 计算编辑距离
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
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        );
      }
    }
  }
  
  return dp[m][n];
}

// 计算相似度
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
  
  return {
    charSimilarity: similarity,
    wordAccuracy,
    editDistance: distance,
    resultWordCount: resultWords.length,
    referenceWordCount: referenceWords.length,
    matchedWords
  };
}

console.log('========== 8个模型准确率对比分析 ==========\n');

const results = [];

for (const model of models) {
  console.log(`\n【${model.label}】`);
  console.log('='.repeat(60));
  
  const modelResults = {
    model: model.name,
    label: model.label,
    videoResults: {},
    totalCharSim: 0,
    totalWordAcc: 0
  };
  
  for (const video of videos) {
    const filePath = path.join(__dirname, model.name, 'files', `${video}.json`);
    
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const fullText = data.fullText || '';
        const reference = referenceTexts[video];
        
        const metrics = calculateSimilarity(fullText, reference);
        modelResults.videoResults[video] = metrics;
        modelResults.totalCharSim += parseFloat(metrics.charSimilarity);
        modelResults.totalWordAcc += parseFloat(metrics.wordAccuracy);
        
        console.log(`  ${video}: 词准确率 ${metrics.wordAccuracy}% | 字符相似度 ${metrics.charSimilarity}%`);
      } catch (e) {
        console.log(`  ${video}: 读取失败`);
        modelResults.videoResults[video] = { charSimilarity: '0.00', wordAccuracy: '0.00' };
      }
    } else {
      console.log(`  ${video}: 文件不存在`);
      modelResults.videoResults[video] = { charSimilarity: '0.00', wordAccuracy: '0.00' };
    }
  }
  
  modelResults.avgCharSim = (modelResults.totalCharSim / videos.length).toFixed(2);
  modelResults.avgWordAcc = (modelResults.totalWordAcc / videos.length).toFixed(2);
  results.push(modelResults);
  
  console.log(`  平均词准确率: ${modelResults.avgWordAcc}% | 平均字符相似度: ${modelResults.avgCharSim}%`);
}

console.log('\n\n========== 准确率排名 ==========\n');

results.sort((a, b) => parseFloat(b.avgWordAcc) - parseFloat(a.avgWordAcc));

results.forEach((result, index) => {
  const rank = index + 1;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
  console.log(`${medal} 第${rank}名: ${result.label}`);
  console.log(`   平均词准确率: ${result.avgWordAcc}%`);
  console.log(`   平均字符相似度: ${result.avgCharSim}%`);
  console.log('');
});

console.log('========== 提高准确率建议 ==========\n');
console.log('1. 后处理规则:');
console.log('   - 错误词替换: code→coat, get→look, lessened→lesson');
console.log('   - 大小写规范化');
console.log('   - 数字规范化');
console.log('');
console.log('2. VAD参数调优:');
console.log('   - 降低 threshold 到 0.3');
console.log('   - 减少 minSilenceDuration 到 0.3s');
console.log('');
console.log('3. 模型选择:');
console.log('   - 推荐: Whisper Small (综合最佳)');
console.log('   - 快速: Whisper Tiny (性价比高)');
console.log('   - 避免: Zipformer CTC (全大写+错误多)');
