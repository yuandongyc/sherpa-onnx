import { execSync, ExecSyncOptions } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface ConversionResult {
  wavPath: string;
}

export interface ConverterConfig {
  ffmpegPath: string;
  outputDir: string;
  audio: {
    sampleRate: number;
    channels: number;
    sampleFormat: string;
  };
}

export interface VideoFile {
  path: string;
  name: string;
  category: string;
  extension: string;
  duration: number;
  duration2: number;
}

export interface VideoListConfig {
  videos: VideoFile[];
  totalCount: number;
  generatedAt: string;
}

export class VideoConverter {
  private config: ConverterConfig;

  constructor(config: ConverterConfig) {
    this.config = config;
  }

  convertVideoToAudio(videoPath: string, duration?: number): ConversionResult {
    console.log('\n=== Converting video to audio ===');
    console.log(`Input: ${videoPath}`);

    const videoName = path.basename(videoPath, path.extname(videoPath));
    const wavPath = path.join(this.config.outputDir, `${videoName}.wav`);

    console.log(`Output WAV: ${wavPath}`);

    try {
      let ffmpegCommand = `"${this.config.ffmpegPath}" -i "${videoPath}" -ar ${this.config.audio.sampleRate} -ac ${this.config.audio.channels} -sample_fmt ${this.config.audio.sampleFormat}`;

      if (duration) {
        ffmpegCommand += ` -t ${duration}`;
        console.log(`Duration limit: ${duration} seconds`);
      }

      ffmpegCommand += ` "${wavPath}"`;

      console.log('\nConverting to WAV (16kHz, mono, 16-bit)...');
      execSync(ffmpegCommand, { stdio: 'inherit' });
      console.log('WAV conversion completed!');

      return { wavPath };
    } catch (error: any) {
      console.error('Error converting video:', error.message);
      throw error;
    }
  }

  private getVideoDuration(videoPath: string): number {
    try {
      const ffmpegDir = path.dirname(this.config.ffmpegPath);
      const ffprobePath = path.join(ffmpegDir, process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');
      const output = execSync(
        `"${ffprobePath}" -i "${videoPath}" -v error -show_entries format=duration`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('duration=')) {
          const durationMatch = line.match(/duration=(\d+\.\d+)/);
          if (durationMatch) {
            const duration = parseFloat(durationMatch[1]);
            return Math.round(duration);
          }
        }
      }
      return 0;
    } catch (error: any) {
      console.warn(`Warning: Could not get duration for ${videoPath}: ${error.message}`);
      return 0;
    }
  }

  private scanDirectory(dir: string, baseDir: string): VideoFile[] {
    const videoFiles: VideoFile[] = [];
    const videoExtensions = ['.mp4', '.avi', '.mkv', '.mov', '.flv', '.wmv', '.webm'];

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = this.scanDirectory(fullPath, baseDir);
        videoFiles.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (videoExtensions.includes(ext)) {
          const relativePath = path.relative(baseDir, fullPath);
          const category = path.dirname(relativePath);
          const name = path.basename(entry.name, ext);

          const duration = this.getVideoDuration(fullPath);

          videoFiles.push({
            path: relativePath.replace(/\\/g, '/'),
            name: name,
            category: category || '',
            extension: ext,
            duration: duration,
            duration2: duration,
          });
        }
      }
    }

    return videoFiles;
  }

  scanInputDirectory(inputDir: string, outputFile?: string): VideoListConfig {
    console.log('\n=== Scanning input directory ===');
    console.log(`Input directory: ${inputDir}`);

    const absoluteInputDir = path.resolve(inputDir);

    if (!fs.existsSync(absoluteInputDir)) {
      throw new Error(`Input directory does not exist: ${inputDir}`);
    }

    const videos = this.scanDirectory(absoluteInputDir, absoluteInputDir);

    const config: VideoListConfig = {
      videos,
      totalCount: videos.length,
      generatedAt: new Date().toISOString(),
    };

    console.log(`Found ${videos.length} video files`);

    if (outputFile) {
      const absoluteOutputFile = path.resolve(outputFile);
      const outputDir = path.dirname(absoluteOutputFile);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(absoluteOutputFile, JSON.stringify(config, null, 2), 'utf8');
      console.log(`Video list saved to: ${outputFile}`);
    }

    return config;
  }

  convertVideosFromConfig(configPath: string): ConversionResult[] {
    console.log('\n=== Batch converting videos ===');
    console.log(`Config file: ${configPath}`);

    const absoluteConfigPath = path.resolve(configPath);

    if (!fs.existsSync(absoluteConfigPath)) {
      throw new Error(`Config file does not exist: ${configPath}`);
    }

    const configContent = fs.readFileSync(absoluteConfigPath, 'utf8');
    const config: VideoListConfig = JSON.parse(configContent);

    console.log(`Found ${config.totalCount} videos to convert`);

    const results: ConversionResult[] = [];

    const projectRoot = path.dirname(path.dirname(absoluteConfigPath));

    for (let i = 0; i < config.videos.length; i++) {
      const video = config.videos[i];
      console.log(`\n[${i + 1}/${config.videos.length}] Processing: ${video.path}`);
      console.log(`Duration: ${video.duration2} seconds`);

      const videoPath = path.resolve(projectRoot, 'input', video.path);
      const result = this.convertVideoToAudio(videoPath, video.duration2);
      results.push(result);
    }

    console.log(`\n=== Batch conversion completed ===`);
    console.log(`Successfully converted ${results.length} videos`);

    return results;
  }
}
