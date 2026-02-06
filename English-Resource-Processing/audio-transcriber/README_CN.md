# 音频识别器 (Audio Transcriber)

使用 VAD + Whisper 进行语音识别的 TypeScript 模块。

## 功能特性

- 使用 Silero VAD 进行语音活动检测
- 使用 Whisper 进行实时语音识别
- 批量处理 WAV 音频文件
- 生成带时间戳的分段识别结果
- 生成完整文本转录
- 易于使用的 TypeScript API
- 完整的 TypeScript 类型定义

## 安装

此模块是 English-Resource-Processing 项目的一部分，无需额外安装。

## 使用方法

### 基本用法

```javascript
const { AudioTranscriber } = require('./audio-transcriber/dist/index.js');
const config = require('./config');

const transcriber = new AudioTranscriber({
  vad: {
    modelPath: config.models.vad.path,
    threshold: config.vad.threshold,
    minSpeechDuration: config.vad.minSpeechDuration,
    minSilenceDuration: config.vad.minSilenceDuration,
    maxSpeechDuration: config.vad.maxSpeechDuration,
    windowSize: config.vad.windowSize,
    bufferSizeInSeconds: config.vad.bufferSizeInSeconds,
  },
  whisper: {
    modelDir: config.models.whisper.dir,
    encoder: config.models.whisper.encoder,
    decoder: config.models.whisper.decoder,
    tokens: config.models.whisper.tokens,
    numThreads: config.whisper.numThreads,
    provider: config.whisper.provider,
    debug: config.whisper.debug,
  },
});

const result = await transcriber.transcribe('path/to/audio.wav');
console.log(`分段数: ${result.segments.length}`);
console.log(`完整文本: ${result.fullText}`);
```

### TypeScript 用法

```typescript
import { AudioTranscriber, TranscriberConfig, TranscriptionResult } from './audio-transcriber/dist/index.js';

const config: TranscriberConfig = {
  vad: {
    modelPath: '/path/to/silero_vad.onnx',
    threshold: 0.5,
    minSpeechDuration: 0.25,
    minSilenceDuration: 0.5,
    maxSpeechDuration: 5,
    windowSize: 512,
    bufferSizeInSeconds: 60,
  },
  whisper: {
    modelDir: '/path/to/sherpa-onnx-whisper-tiny.en',
    encoder: 'tiny.en-encoder.int8.onnx',
    decoder: 'tiny.en-decoder.int8.onnx',
    tokens: 'tiny.en-tokens.txt',
    numThreads: 2,
    provider: 'cpu',
    debug: 1,
  },
};

const transcriber = new AudioTranscriber(config);
const result: TranscriptionResult = await transcriber.transcribe('path/to/audio.wav');
```

### 批量处理工作流程

#### 步骤1：初始化识别器

```javascript
const { AudioTranscriber } = require('./audio-transcriber/dist/index.js');
const config = require('./config');

const transcriber = new AudioTranscriber({
  vad: { ... },
  whisper: { ... },
});
```

#### 步骤2：批量识别

```javascript
await transcriber.transcribeDirectory('output/audio', 'output/transcription');
```

## API

### `AudioTranscriber`

#### 构造函数

```typescript
constructor(config: TranscriberConfig)
```

创建一个新的 AudioTranscriber 实例。

**参数:**
- `config.vad.modelPath` (string): Silero VAD 模型路径
- `config.vad.threshold` (number): VAD 阈值（默认: 0.5）
- `config.vad.minSpeechDuration` (number): 最小语音时长（默认: 0.25秒）
- `config.vad.minSilenceDuration` (number): 最小静音时长（默认: 0.5秒）
- `config.vad.maxSpeechDuration` (number): 最大语音时长（默认: 5秒）
- `config.vad.windowSize` (number): VAD 窗口大小（默认: 512）
- `config.vad.bufferSizeInSeconds` (number): 缓冲区大小（默认: 60秒）
- `config.whisper.modelDir` (string): Whisper 模型目录路径
- `config.whisper.encoder` (string): Whisper 编码器模型名称
- `config.whisper.decoder` (string): Whisper 解码器模型名称
- `config.whisper.tokens` (string): Whisper tokens 文件名称
- `config.whisper.numThreads` (number): Whisper 线程数（默认: 2）
- `config.whisper.provider` (string): Whisper 提供者（默认: 'cpu'）
- `config.whisper.debug` (number): 调试级别（默认: 1）

#### 方法

##### `transcribe(audioPath: string): Promise<TranscriptionResult>`

识别单个音频文件。

**参数:**
- `audioPath` (string): 输入 WAV 音频文件路径

**返回值:**
- `TranscriptionResult`: 包含以下属性的对象：
  - `segments` (TranscriptionSegment[]): 分段识别结果数组
  - `fullText` (string): 完整识别文本

**异常:**
- 如果音频文件不存在，将抛出错误
- 如果识别失败，将抛出错误

##### `transcribeDirectory(inputDir: string, outputDir: string): Promise<void>`

批量识别目录中的所有 WAV 音频文件。

**参数:**
- `inputDir` (string): 要识别的输入目录路径
- `outputDir` (string): 保存 JSON 结果的输出目录路径

**返回值:**
- 无（异步操作）

**异常:**
- 如果输入目录不存在，将抛出错误

## 输出格式

### JSON 结果格式

```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "你好世界"
    }
  ],
  "fullText": "你好世界"
}
```

**字段说明:**
- `segments`: 分段识别结果数组
  - `start`: 分段开始时间（秒）
  - `end`: 分段结束时间（秒）
  - `text`: 分段文本内容
- `fullText`: 完整的识别文本

## 构建

构建 TypeScript 模块：

```bash
cd audio-transcriber
npm run build
```

或在根目录执行：

```bash
npm run build:transcriber
```

## 依赖

- sherpa-onnx-node: 必须安装
- Node.js: >= 16
- TypeScript: >= 5.0

## 许可证

MIT
