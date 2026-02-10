const fs = require('fs');
const path = require('path');

const referenceTexts = {
  video2: 'lesson two repetition drill look at lesson two look and listen do not speak look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is now you ask the questions ready look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is look at number four is this your watch yes it is look at number five is this your coat yes it is look at number six is this your dress yes it is look at number seven is this your skirt yes it is look at number eight is this your shirt yes it is look at number nine is this your car yes it is look at number ten is this your house',
  video4: 'lesson four repetition drill look at lesson four look and listen do not speak look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is now you ask the questions ready look at number one is this your pen yes it is look at number two is this your pencil yes it is look at number three is this your book yes it is look at number four is this your watch yes it is look at number five is this your coat no it is not look at number six is this your dress yes it is look at number seven is this your skirt no it is not look at number eight is this your shirt yes it is look at number nine is this your car yes it is look at number ten is this your house no it is not look at number eleven is this your suit yes it is look at number twelve is this your school no it is not look at number thirteen is this your teacher yes it is look at number fourteen is this your son no it is not look at number fifteen',
  video6: 'lesson six repetition dwell look at lesson six look and listen do not speak look at number eight that is a volvo is it a swedish car or a french car it is not a french car it is a swedish car look at number nine that is a peugeot is it a french car or a swedish car it is not a swedish car it is a french car look at number ten that is a mercedes is it a german car or a japanese car it is not a japanese car it is a german car now you answer the questions in the same way ready look at number eight that is a volvo is it a swedish car or a french car it is not a french car it is a swedish car look at number nine that is a peugeot is it a french car or a swedish car it is not a swedish car it is a french car look at number ten that is a mercedes is it a german car or a japanese car it is not a japanese car it is a german car look at number eleven that is a toyota is it a japanese car or a german car it is not a german car it is a japanese car look at number twelve that is a daewoo is it a british car or a korean car it is not a british car it is a korean car look at number thirteen that is a mini is it an american car or an english car it is not an american car it is an english car look at number fourteen that is a ford is it a swedish car or an american car it is not a swedish car it is an american car look at number fifteen that is a fiat is it an italian car or an american car it is not an american car'
};

function normalize(text) {
  return text.toLowerCase().replace(/[.,?!]/g, '').replace(/\s+/g, ' ').trim();
}

function levenshteinDistance(str1, str2) {
  const m = str1.length, n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
    }
  }
  return dp[m][n];
}

function calculateSimilarity(resultText, referenceText) {
  const normResult = normalize(resultText);
  const normReference = normalize(referenceText);
  const distance = levenshteinDistance(normResult, normReference);
  const maxLength = Math.max(normResult.length, normReference.length);
  return ((1 - distance / maxLength) * 100).toFixed(2);
}

console.log('Whisper Tiny VAD优化后准确率:');
console.log('='.repeat(50));

const videos = ['video2', 'video4', 'video6'];
let totalSim = 0;

videos.forEach(video => {
  const filePath = path.join('audio-transcriber-tiny', 'files', video + '.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const sim = calculateSimilarity(data.fullText, referenceTexts[video]);
    totalSim += parseFloat(sim);
    console.log(video + ': 字符相似度 ' + sim + '%');
  }
});

console.log('平均字符相似度: ' + (totalSim / videos.length).toFixed(2) + '%');
console.log('');
console.log('优化前: 88.90%');
console.log('优化后: ' + (totalSim / videos.length).toFixed(2) + '%');
