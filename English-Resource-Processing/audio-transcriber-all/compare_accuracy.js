const fs = require('fs');
const path = require('path');

// 正确的参考文本（从SRT提取）
const referenceTexts = {
  video2: `Lesson 2. repetition drill. Look at lesson 2. Look and listen. Do not speak. Look at number one. Is this your pen? Yes, it is. Look at number two. Is this your pencil? Yes, it is. Look at number 3. Is this your book? Yes, it is. Now you ask the questions. ready. Look at number one. Is this your pen? Yes, it is. Look at number two. Is this your pencil? Yes, it is. Look at number three. Is this your book? Yes, it is. Look at number 4. Is this your watch? Yes, it is. Look at number five. Is this your coat? Yes, it is. Look at number 6. Is this your dress? Yes, it is. Look at number 7. Is this your skirt? Yes, it is. Look at number eight. Is this your shirt? Yes, it is. Look at number 9. Is this your car? Yes, it is. Look at number 10. Is this your house?`,
  video4: `Lesson four. Repetition drill. Look at lesson four. Look and listen. Do not speak. Look at number one. Is this your pen? Yes, it is. Look at number two. Is this your pencil? Yes, it is, Look at number three. Is this your book? Yes, it is, Now you ask the questions. Ready? Look at number one. Is this your pen? Yes it is. Look at number two. Is this your pencil? Yes it is. Look at number three, Is this your book? Yes it is. Look at number four. Is this your watch? Yes, it is, Look at number five, Is this your coat? No. It isn't. Look at number six. Is this your dress? Yes, it is. Look at number seven. Is this your skirt? No it isn't. Look at number eight. Is this your shirt? Yes, it is. Look at number nine. Is this your car? Yes, it is. Look at number ten. Is this your house? No, it isn't. Look at number eleven. Is this your suit? Yes, it is, Look at number 12. Is this your school? No, it isn't. Look at number thirteen. Is this your teacher? Yes, it is. Look at number fourteen. Is this your son? No, it isn't. Look at number fifteen.`,
  video6: `Lesson six. Repetition dwell. Look at lesson six. Look and listen. Do not speak. Look at number eight. That's a vol Is it a Swedish car? Or a French car. It isn't a French car, it's a Swedish car. Look at number nine. That's a Peugeot. Is it a French car? Or a Swedish car. It isn't a Swedish car, it's a French car. Look at number ten. That's a Mercedes. Is it a German car? Or a Japanese car. It isn't a Japanese car. It's a German car. Now you answer the questions in the same way Ready? Look at number eight. That's a Vovel. Is it a Swedish car? Or a French car. It isn't a French car, it's a Swedish car. Look at number nine. That's a pejot. Is it a Fren car or a Swedish car? It isn't a Swedish car, it's a French car. Look at number ten. That's a Mercedes. Is it a German car? Or a Japanese car. It isn't a Japanese car, but It's a German car. Look at number eleven. That's a Toyota. Is it a Japanese car? Or a German car. It isn't a German car. It's a Japanese car. Look at number twelve. That's a day woo. Is it a British car? Or a Korean car. It isn't a British car, it's a Korean car. Look at number thirteen. That's a mini Is it an American car? Or an English car. It isn't an American car. It's an English car. Look at number fourteen. That's a Ford. Is it a Swedish car? Or an American car. It isn't a Swedish car. It's an American car. Look at number 15. That's a fiat. Is it an Italian car? Or an American car. It isn't an American car.`
};

// 模型目录列表
const models = [
  'audio-transcriber-base',
  'audio-transcriber-moonshine-base-int8',
  'audio-transcriber-moonshine-tiny-int8',
  'audio-transcriber-small',
  'audio-transcriber-tiny-v4',
  'audio-transcriber-tiny',
  'audio-transcriber-zipformer-ctc',
  'audio-transcriber-zipformer'
];

const videos = ['video2', 'video4', 'video6'];

// 计算相似度（简单的词级别）
function calculateAccuracy(resultText, referenceText) {
  // 标准化文本
  const normalize = (text) => {
    return text.toLowerCase()
      .replace(/[.,?!]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const normResult = normalize(resultText);
  const normReference = normalize(referenceText);
  
  const resultWords = normResult.split(' ');
  const referenceWords = normReference.split(' ');
  
  // 计算匹配的词数
  let matchedWords = 0;
  const refWordCount = referenceWords.length;
  
  for (let i = 0; i < Math.min(resultWords.length, referenceWords.length); i++) {
    if (resultWords[i] === referenceWords[i]) {
      matchedWords++;
    }
  }
  
  return {
    wordAccuracy: (matchedWords / refWordCount * 100).toFixed(2),
    resultWordCount: resultWords.length,
    referenceWordCount: refWordCount,
    matchedWords
  };
}

// 读取所有模型的结果
console.log('========== 8个模型准确率对比分析 ==========\n');

const results = [];

for (const model of models) {
  console.log(`\n【${model}】`);
  console.log('-'.repeat(60));
  
  const modelResults = {
    model,
    videoResults: {},
    totalAccuracy: 0
  };
  
  for (const video of videos) {
    const filePath = path.join(__dirname, model, 'files', `${video}.json`);
    
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const fullText = data.fullText || '';
        const reference = referenceTexts[video];
        
        const accuracy = calculateAccuracy(fullText, reference);
        modelResults.videoResults[video] = accuracy;
        modelResults.totalAccuracy += parseFloat(accuracy.wordAccuracy);
        
        console.log(`  ${video}: 词准确率 ${accuracy.wordAccuracy}% (${accuracy.matchedWords}/${accuracy.referenceWordCount} 词)`);
      } catch (e) {
        console.log(`  ${video}: 读取失败 - ${e.message}`);
        modelResults.videoResults[video] = { wordAccuracy: '0.00' };
      }
    } else {
      console.log(`  ${video}: 文件不存在`);
      modelResults.videoResults[video] = { wordAccuracy: '0.00' };
    }
  }
  
  modelResults.avgAccuracy = (modelResults.totalAccuracy / videos.length).toFixed(2);
  results.push(modelResults);
  
  console.log(`  平均准确率: ${modelResults.avgAccuracy}%`);
}

// 排序并显示排名
console.log('\n\n========== 准确率排名 ==========\n');

results.sort((a, b) => parseFloat(b.avgAccuracy) - parseFloat(a.avgAccuracy));

results.forEach((result, index) => {
  const rank = index + 1;
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '  ';
  console.log(`${medal} 第${rank}名: ${result.model}`);
  console.log(`     平均准确率: ${result.avgAccuracy}%`);
  console.log(`     video2: ${result.videoResults.video2?.wordAccuracy || 'N/A'}%`);
  console.log(`     video4: ${result.videoResults.video4?.wordAccuracy || 'N/A'}%`);
  console.log(`     video6: ${result.videoResults.video6?.wordAccuracy || 'N/A'}%`);
  console.log('');
});

// 详细错误分析
console.log('\n========== 常见错误分析 ==========\n');

console.log('1. 【大小写问题】');
console.log('   - 问题: Zipformer CTC/Transducer 输出全大写');
console.log('   - 影响: 准确率计算会受影响');
console.log('   - 建议: 后处理添加大小写规范化\n');

console.log('2. 【词识别错误】');
console.log('   - "repetition" → "reputation/reputation drill" (Zipformer系列)');
console.log('   - "coat" → "code" (Tiny v4, Tiny)');
console.log('   - "Lesson" → "Lessened" (Zipformer CTC)');
console.log('   - "look" → "get" (多个模型)\n');

console.log('3. 【数字识别】');
console.log('   - "number one" → "1" 或缺失 (Moonshine系列)');
console.log('   - "number 3" → "Number 3/three" (不同模型表现不一)\n');

console.log('4. 【标点符号】');
console.log('   - 部分模型缺少标点或问号');
console.log('   - 建议: 使用语言模型后处理添加标点\n');

console.log('\n========== 提高准确率建议 ==========\n');

console.log('1. 【模型选择】');
console.log('   - 推荐: Moonshine Base > Moonshine Tiny > Whisper系列');
console.log('   - 避免: Zipformer CTC (全大写+识别错误较多)\n');

console.log('2. 【VAD参数调优】');
console.log('   - 当前: threshold=0.5, minSpeechDuration=0.25s');
console.log('   - 建议: 尝试 threshold=0.3, minSilenceDuration=0.3s');
console.log('   - 可减少语音截断和合并错误\n');

console.log('3. 【后处理优化】');
console.log('   - 添加大小写规范化');
console.log('   - 使用语言模型校正 (如 KenLM)');
console.log('   - 添加特定领域词汇表 (如 "Peugeot", "Mercedes")\n');

console.log('4. 【音频预处理】');
console.log('   - 降噪处理');
console.log('   - 音量归一化');
console.log('   - 采样率统一为 16kHz\n');
