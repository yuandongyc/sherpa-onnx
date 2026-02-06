# 视频转换器 (Video Converter)

使用 FFmpeg 将视频文件转换为音频格式（WAV 和 MP3）的 TypeScript 模块。

## 功能特性

- 将视频转换为 WAV 格式（16kHz，单声道，16位）
- 将视频转换为 MP3 格式
- 扫描输入目录中的视频文件
- 生成 JSON 配置文件用于批量处理
- 从配置文件批量转换视频
- 易于使用的 TypeScript API
- 完整的 TypeScript 类型定义

## 安装

此模块是 English-Resource-Processing 项目的一部分，无需额外安装。

## 使用方法

### 基本用法

```javascript
const { VideoConverter } = require('./video-converter/dist/index.js');
const config = require('./config');

const converter = new VideoConverter({
  ffmpegPath: config.ffmpeg.path,
  outputDir: config.directories.audio,
  audio: config.audio,
});

const result = converter.convertVideoToAudio('path/to/video.mp4');
console.log(`WAV: ${result.wavPath}`);
console.log(`MP3: ${result.mp3Path}`);
```

### TypeScript 用法

```typescript
import { VideoConverter, ConverterConfig, ConversionResult } from './video-converter/dist/index.js';

const config: ConverterConfig = {
  ffmpegPath: '/path/to/ffmpeg.exe',
  outputDir: '/path/to/output',
  audio: {
    sampleRate: 16000,
    channels: 1,
    sampleFormat: 's16',
  },
};

const converter = new VideoConverter(config);
const result: ConversionResult = converter.convertVideoToAudio('path/to/video.mp4');
```

### 批量处理工作流程

#### 步骤1：扫描并生成配置

```javascript
const { VideoConverter } = require('./video-converter/dist/index.js');
const config = require('./config');

const converter = new VideoConverter({
  ffmpegPath: config.ffmpeg.path,
  outputDir: config.directories.audio,
  audio: config.audio,
});

// 扫描输入目录并生成 JSON 配置
const videoList = converter.scanInputDirectory('input', 'output/video-list.json');
console.log(`找到 ${videoList.totalCount} 个视频文件`);
```

#### 步骤2：检查并转换

检查生成的 JSON 配置文件后，执行批量转换：

```javascript
// 从配置文件转换所有视频
const results = converter.convertVideosFromConfig('output/video-list.json');
console.log(`已转换 ${results.length} 个视频`);
```

## API

### `VideoConverter`

#### 构造函数

```typescript
constructor(config: ConverterConfig)
```

创建一个新的 VideoConverter 实例。

**参数:**
- `config.ffmpegPath` (string): FFmpeg 可执行文件的路径
- `config.outputDir` (string): 输出文件的保存目录
- `config.audio.sampleRate` (number): 音频采样率（默认: 16000）
- `config.audio.channels` (number): 音频通道数（默认: 1）
- `config.audio.sampleFormat` (string): 音频采样格式（默认: 's16'）

#### 方法

##### `convertVideoToAudio(videoPath: string): ConversionResult`

将视频文件转换为 WAV 和 MP3 格式。

**参数:**
- `videoPath` (string): 输入视频文件的路径

**返回值:**
- `ConversionResult`: 包含以下属性的对象：
  - `wavPath` (string): 生成的 WAV 文件路径
  - `mp3Path` (string): 生成的 MP3 文件路径

**异常:**
- 如果 FFmpeg 执行失败或无法创建文件，将抛出错误

##### `scanInputDirectory(inputDir: string, outputFile?: string): VideoListConfig`

扫描输入目录中的视频文件并生成 JSON 配置文件。

**参数:**
- `inputDir` (string): 要扫描的输入目录路径
- `outputFile` (string, 可选): 保存生成的 JSON 配置文件的路径

**返回值:**
- `VideoListConfig`: 包含以下属性的对象：
  - `videos` (VideoFile[]): 视频文件信息数组
  - `totalCount` (number): 找到的视频总数
  - `generatedAt` (string): 配置生成的 ISO 时间戳

**支持的视频格式:**
- .mp4, .avi, .mkv, .mov, .flv, .wmv, .webm

**异常:**
- 如果输入目录不存在，将抛出错误

##### `convertVideosFromConfig(configPath: string): ConversionResult[]`

根据配置文件转换所有视频。

**参数:**
- `configPath` (string): JSON 配置文件的路径

**返回值:**
- `ConversionResult[]`: 每个视频的转换结果数组

**异常:**
- 如果配置文件不存在，将抛出错误

## 输出格式

### WAV 格式
- 采样率: 16kHz
- 通道数: 单声道 (1)
- 采样格式: 16位 PCM (s16)

### MP3 格式
- 采样率: 原视频音频采样率
- 通道数: 原视频音频通道数
- 质量: 高质量（VBR qscale 2）

## 构建

构建 TypeScript 模块：

```bash
cd video-converter
npm run build
```

或在根目录执行：

```bash
npm run build:converter
```

## 依赖

- FFmpeg: 必须安装并可通过配置的路径访问
- Node.js: >= 16

## 许可证

MIT
