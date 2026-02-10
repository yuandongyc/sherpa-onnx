import * as sherpa_onnx from 'sherpa-onnx-node';
import fs from 'fs';
import path from 'path';

export interface TranscriptionResult {
  segments: TranscriptionSegment[];
  fullText: string;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscriberConfig {
  transducer: {
    encoder: string;
    decoder: string;
    joiner: string;
    tokens: string;
  };
  vad: {
    model: string;
    threshold: number;
    minSpeechDuration: number;
    minSilenceDuration: number;
    maxSpeechDuration: number;
    windowSize: number;
    bufferSizeInSeconds: number;
  };
}

export class AudioTranscriber {
  private config: TranscriberConfig;

  constructor(config: TranscriberConfig) {
    this.config = config;
  }

  async transcribe(audioPath: string): Promise<TranscriptionResult> {
    console.log(`\n=== Transcribing audio ===`);
    console.log(`Input: ${audioPath}`);

    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found: ${audioPath}`);
    }

    try {
      const recognizer = this.createRecognizer();
      const vad = this.createVad();
      const wave = (sherpa_onnx as any).readWave(audioPath);

      console.log(`Audio duration: ${wave.samples.length / wave.sampleRate} seconds`);
      console.log('Processing audio with VAD v4 + Zipformer...');

      const segments: TranscriptionSegment[] = [];
      let fullText = '';

      const windowSize = vad.config.sileroVad.windowSize;

      for (let i = 0; i < wave.samples.length; i += windowSize) {
        const thisWindow = wave.samples.subarray(i, i + windowSize);
        vad.acceptWaveform(thisWindow);

        while (!vad.isEmpty()) {
          const segment = vad.front();
          vad.pop();

          const start_time = segment.start / wave.sampleRate;
          const end_time = start_time + segment.samples.length / wave.sampleRate;

          const stream = recognizer.createStream();
          stream.acceptWaveform({ samples: segment.samples, sampleRate: wave.sampleRate });

          recognizer.decode(stream);
          const result = recognizer.getResult(stream);

          if (result && result.text && result.text.trim()) {
            const text = result.text.trim();
            segments.push({
              start: Number(start_time.toFixed(2)),
              end: Number(end_time.toFixed(2)),
              text,
            });
            fullText += text + ' ';
          }
        }
      }

      vad.flush();

      while (!vad.isEmpty()) {
        const segment = vad.front();
        vad.pop();

        const start_time = segment.start / wave.sampleRate;
        const end_time = start_time + segment.samples.length / wave.sampleRate;

        const stream = recognizer.createStream();
        stream.acceptWaveform({ samples: segment.samples, sampleRate: wave.sampleRate });

        recognizer.decode(stream);
        const result = recognizer.getResult(stream);

        if (result && result.text && result.text.trim()) {
          const text = result.text.trim();
          segments.push({
            start: Number(start_time.toFixed(2)),
            end: Number(end_time.toFixed(2)),
            text,
          });
          fullText += text + ' ';
        }
      }

      fullText = fullText.trim();

      const transcriptionResult: TranscriptionResult = {
        segments,
        fullText,
      };

      console.log('\n=== Transcription completed ===');
      console.log(`Total segments: ${segments.length}`);
      console.log(`Full text length: ${fullText.length} characters`);

      return transcriptionResult;
    } catch (error: any) {
      console.error('Error during transcription:', error.message);
      throw error;
    }
  }

  private createRecognizer() {
    const config = {
      featConfig: {
        sampleRate: 16000,
        featureDim: 80,
      },
      modelConfig: {
        transducer: {
          encoder: this.config.transducer.encoder,
          decoder: this.config.transducer.decoder,
          joiner: this.config.transducer.joiner,
        },
        tokens: this.config.transducer.tokens,
        numThreads: 2,
        provider: 'cpu',
        debug: 0,
      },
    };

    return new (sherpa_onnx as any).OfflineRecognizer(config);
  }

  private createVad() {
    const config = {
      sileroVad: {
        model: this.config.vad.model,
        threshold: this.config.vad.threshold,
        minSpeechDuration: this.config.vad.minSpeechDuration,
        minSilenceDuration: this.config.vad.minSilenceDuration,
        maxSpeechDuration: this.config.vad.maxSpeechDuration,
        windowSize: this.config.vad.windowSize,
      },
      sampleRate: 16000,
      debug: false,
      numThreads: 1,
    };

    const bufferSizeInSeconds = this.config.vad.bufferSizeInSeconds;

    return new (sherpa_onnx as any).Vad(config, bufferSizeInSeconds);
  }

  async transcribeDirectory(inputDir: string, outputDir: string) {
    console.log('\n=== Batch transcribing audio files ===');
    console.log(`Input directory: ${inputDir}`);
    console.log(`Output directory: ${outputDir}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const audioFiles = fs.readdirSync(inputDir)
      .filter((file: string) => file.endsWith('.wav'))
      .sort();

    console.log(`Found ${audioFiles.length} audio files`);

    for (let i = 0; i < audioFiles.length; i++) {
      const audioFile = audioFiles[i];
      const inputPath = path.join(inputDir, audioFile);
      const baseName = path.basename(audioFile, '.wav');
      const outputPath = path.join(outputDir, `${baseName}.json`);

      console.log(`\n[${i + 1}/${audioFiles.length}] Processing: ${audioFile}`);

      try {
        const result = await this.transcribe(inputPath);
        
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
        console.log(`Result saved to: ${outputPath}`);
      } catch (error: any) {
        console.error(`Error transcribing ${audioFile}:`, error.message);
      }
    }

    console.log('\n=== Batch transcription completed ===');
    console.log(`Successfully transcribed ${audioFiles.length} files`);
  }
}
