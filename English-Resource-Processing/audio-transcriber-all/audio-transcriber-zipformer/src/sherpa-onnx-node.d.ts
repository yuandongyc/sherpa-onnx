declare module 'sherpa-onnx-node' {
  export interface OfflineRecognizerConfig {
    featConfig: {
      sampleRate: number;
      featureDim: number;
    };
    modelConfig: {
      whisper?: {
        encoder: string;
        decoder: string;
      };
      moonshine?: {
        preprocessor: string;
        encoder: string;
        uncached_decoder: string;
        cached_decoder?: string;
      };
      transducer?: {
        encoder: string;
        decoder: string;
        joiner: string;
      };
      tokens: string;
      numThreads: number;
      provider: string;
      debug: number;
    };
  }
  
  export class OfflineRecognizer {
    constructor(config: OfflineRecognizerConfig);
    createStream(): any;
    decode(stream: any): void;
    getResult(stream: any): any;
  }
  
  export interface VadConfig {
    sileroVad: {
      model: string;
      threshold: number;
      minSpeechDuration: number;
      minSilenceDuration: number;
      maxSpeechDuration: number;
      windowSize: number;
    };
    sampleRate: number;
    debug: boolean;
    numThreads: number;
  }
  
  export class Vad {
    constructor(config: VadConfig, bufferSizeInSeconds: number);
    acceptWaveform(samples: Float32Array): void;
    isEmpty(): boolean;
    front(): any;
    pop(): void;
    flush(): void;
  }
  
  export function readWave(filename: string): {
    samples: Float32Array;
    sampleRate: number;
  };
}
