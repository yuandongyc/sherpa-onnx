# Audio Transcriber

An audio transcription module using VAD + Whisper for speech recognition.

## Features

- Voice Activity Detection (VAD) using Silero VAD model
- Real-time speech recognition using Whisper
- Batch processing of WAV audio files
- Output with timestamps and segments
- Full text transcription
- Easy-to-use TypeScript API

## Installation

This module is part of English-Resource-Processing project. No additional installation is required.

## Usage

### Basic Usage

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
console.log(`Segments: ${result.segments.length}`);
console.log(`Full text: ${result.fullText}`);
```

### Batch Processing

```javascript
const { AudioTranscriber } = require('./audio-transcriber/dist/index.js');
const config = require('./config');

const transcriber = new AudioTranscriber({
  vad: { ... },
  whisper: { ... },
});

await transcriber.transcribeDirectory('output/audio', 'output/transcription');
```

## API

### `AudioTranscriber`

#### Constructor

```typescript
constructor(config: TranscriberConfig)
```

Creates a new AudioTranscriber instance.

**Parameters:**
- `config.vad.modelPath` (string): Path to Silero VAD model
- `config.vad.threshold` (number): VAD threshold (default: 0.5)
- `config.vad.minSpeechDuration` (number): Minimum speech duration in seconds (default: 0.25)
- `config.vad.minSilenceDuration` (number): Minimum silence duration in seconds (default: 0.5)
- `config.vad.maxSpeechDuration` (number): Maximum speech duration in seconds (default: 5)
- `config.vad.windowSize` (number): VAD window size (default: 512)
- `config.vad.bufferSizeInSeconds` (number): Buffer size in seconds (default: 60)
- `config.whisper.modelDir` (string): Path to Whisper model directory
- `config.whisper.encoder` (string): Whisper encoder model name
- `config.whisper.decoder` (string): Whisper decoder model name
- `config.whisper.tokens` (string): Whisper tokens file name
- `config.whisper.numThreads` (number): Number of threads for Whisper (default: 2)
- `config.whisper.provider` (string): Provider for Whisper (default: 'cpu')
- `config.whisper.debug` (number): Debug level (default: 1)

#### Methods

##### `transcribe(audioPath: string): Promise<TranscriptionResult>`

Transcribe a single audio file.

**Parameters:**
- `audioPath` (string): Path to input WAV audio file

**Returns:**
- `TranscriptionResult`: Object containing:
  - `segments` (TranscriptionSegment[]): Array of transcription segments with timestamps
  - `fullText` (string): Complete transcription text

**Throws:**
- Error if audio file does not exist
- Error if transcription fails

##### `transcribeDirectory(inputDir: string, outputDir: string): Promise<void>`

Batch transcribe all WAV files in a directory.

**Parameters:**
- `inputDir` (string): Path to input directory containing WAV files
- `outputDir` (string): Path to output directory for JSON results

**Returns:**
- None (async operation)

**Throws:**
- Error if input directory does not exist

## Output Format

### JSON Result Format

```json
{
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "Hello world"
    }
  ],
  "fullText": "Hello world"
}
```

## Building

To build the TypeScript module:

```bash
cd audio-transcriber
npm run build
```

Or from root directory:

```bash
npm run build:transcriber
```

## Dependencies

- sherpa-onnx-node: Must be installed
- Node.js: >= 16
- TypeScript: >= 5.0

## License

MIT
