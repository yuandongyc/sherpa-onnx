# Video Converter

A TypeScript module for converting video files to audio formats (WAV and MP3) using FFmpeg.

## Features

- Convert video to WAV format (16kHz, mono, 16-bit)
- Convert video to MP3 format
- Scan input directory for video files
- Generate JSON configuration file for batch processing
- Batch convert videos from configuration file
- Easy-to-use TypeScript API
- Type-safe with full TypeScript definitions

## Installation

This module is part of the English-Resource-Processing project. No additional installation is required.

## Usage

### Basic Usage

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

### TypeScript Usage

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

### Batch Processing Workflow

#### Step 1: Scan and Generate Configuration

```javascript
const { VideoConverter } = require('./video-converter/dist/index.js');
const config = require('./config');

const converter = new VideoConverter({
  ffmpegPath: config.ffmpeg.path,
  outputDir: config.directories.audio,
  audio: config.audio,
});

// Scan input directory and generate JSON configuration
const videoList = converter.scanInputDirectory('input', 'output/video-list.json');
console.log(`Found ${videoList.totalCount} videos`);
```

#### Step 2: Review and Convert

After reviewing the generated JSON configuration file, perform batch conversion:

```javascript
// Convert all videos from the configuration file
const results = converter.convertVideosFromConfig('output/video-list.json');
console.log(`Converted ${results.length} videos`);
```

## API

### `VideoConverter`

#### Constructor

```typescript
constructor(config: ConverterConfig)
```

Creates a new VideoConverter instance.

**Parameters:**
- `config.ffmpegPath` (string): Path to FFmpeg executable
- `config.outputDir` (string): Directory where output files will be saved
- `config.audio.sampleRate` (number): Audio sample rate (default: 16000)
- `config.audio.channels` (number): Number of audio channels (default: 1)
- `config.audio.sampleFormat` (string): Audio sample format (default: 's16')

#### Methods

##### `convertVideoToAudio(videoPath: string): ConversionResult`

Converts a video file to WAV and MP3 formats.

**Parameters:**
- `videoPath` (string): Path to the input video file

**Returns:**
- `ConversionResult`: Object containing:
  - `wavPath` (string): Path to the generated WAV file
  - `mp3Path` (string): Path to the generated MP3 file

**Throws:**
- Error if FFmpeg fails or files cannot be created

##### `scanInputDirectory(inputDir: string, outputFile?: string): VideoListConfig`

Scans the input directory for video files and generates a JSON configuration file.

**Parameters:**
- `inputDir` (string): Path to the input directory to scan
- `outputFile` (string, optional): Path to save the generated JSON configuration file

**Returns:**
- `VideoListConfig`: Object containing:
  - `videos` (VideoFile[]): Array of video file information
  - `totalCount` (number): Total number of videos found
  - `generatedAt` (string): ISO timestamp of when the config was generated

**Supported Video Formats:**
- .mp4, .avi, .mkv, .mov, .flv, .wmv, .webm

**Throws:**
- Error if input directory does not exist

##### `convertVideosFromConfig(configPath: string): ConversionResult[]`

Converts all videos listed in the configuration file.

**Parameters:**
- `configPath` (string): Path to the JSON configuration file

**Returns:**
- `ConversionResult[]`: Array of conversion results for each video

**Throws:**
- Error if configuration file does not exist

## Output Format

### WAV Format
- Sample Rate: 16kHz
- Channels: Mono (1)
- Sample Format: 16-bit PCM (s16)

### MP3 Format
- Sample Rate: Original video audio sample rate
- Channels: Original video audio channels
- Quality: High quality (VBR qscale 2)

## Building

To build the TypeScript module:

```bash
cd video-converter
npm run build
```

Or from the root directory:

```bash
npm run build:converter
```

## Dependencies

- FFmpeg: Must be installed and accessible via the configured path
- Node.js: >= 16

## License

MIT
