# sherpa-onnx-ffmpeg for Windows

This is a Windows-compatible version of the sherpa-onnx-ffmpeg example that allows you to perform real-time speech recognition using FFmpeg on Windows.

## Introduction

You can use `sherpa-onnx-ffmpeg.exe` to decode audio from wav, mp3, or even URLs.

See <https://github.com/ossrs/srs>
for more supported formats and protocols, e.g.,
RTMP/WebRTC/HLS/HTTP-FLV/SRT/MPEG-DASH/GB28181.

## Prerequisites

### 1. Build sherpa-onnx

First, you need to build sherpa-onnx with C API enabled:

```powershell
cd D:\MyProjects\c_projects\sherpa-onnx
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022" -A x64
cmake --build . --config Release
```

### 2. Install FFmpeg Development Libraries

Download FFmpeg development libraries for Windows from one of these sources:

- **gyan.dev**: <https://www.gyan.dev/ffmpeg/builds/>
- **BtbN**: <https://github.com/BtbN/FFmpeg-Builds/releases>

Choose the "dev" build which includes headers and libraries.

Extract the FFmpeg files to a location of your choice, for example:
```
D:\ffmpeg
```

The directory structure should look like:
```
D:\ffmpeg\
├── include\
│   ├── libavcodec\
│   ├── libavformat\
│   └── ...
└── lib\
    ├── avcodec.lib
    ├── avformat.lib
    └── ...
```

## Building

### Option 1: Using pkg-config (if available)

If you have pkg-config installed and configured for FFmpeg:

```powershell
cd D:\MyProjects\c_projects\sherpa-onnx\ffmpeg-examples-windows
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022" -A x64
cmake --build . --config Release
```

### Option 2: Manual FFmpeg paths

If you don't have pkg-config, specify the FFmpeg paths manually:

```powershell
cd D:\MyProjects\c_projects\sherpa-onnx\ffmpeg-examples-windows
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022" -A x64 ^
    -DFFMPEG_INCLUDE_DIR="D:\ffmpeg\include" ^
    -DFFMPEG_LIBRARIES="D:\ffmpeg\lib"
cmake --build . --config Release
```

The executable will be located at:
```
D:\MyProjects\c_projects\sherpa-onnx\ffmpeg-examples-windows\build\bin\Release\sherpa-onnx-ffmpeg.exe
```

## Usage

### Basic Usage

```powershell
.\build\bin\Release\sherpa-onnx-ffmpeg.exe `
    /path/to/tokens.txt `
    /path/to/encoder.onnx `
    /path/to/decoder.onnx `
    /path/to/joiner.onnx `
    /path/to/foo.wav
```

### With Custom Number of Threads

```powershell
.\build\bin\Release\sherpa-onnx-ffmpeg.exe `
    /path/to/tokens.txt `
    /path/to/encoder.onnx `
    /path/to/decoder.onnx `
    /path/to/joiner.onnx `
    /path/to/foo.wav `
    4
```

### With Custom Decoding Method

```powershell
.\build\bin\Release\sherpa-onnx-ffmpeg.exe `
    /path/to/tokens.txt `
    /path/to/encoder.onnx `
    /path/to/decoder.onnx `
    /path/to/joiner.onnx `
    /path/to/foo.wav `
    2 `
    modified_beam_search
```

### Decoding from URL

```powershell
.\build\bin\Release\sherpa-onnx-ffmpeg.exe `
    /path/to/tokens.txt `
    /path/to/encoder.onnx `
    /path/to/decoder.onnx `
    /path/to/joiner.onnx `
    https://example.com/audio.wav
```

## Parameters

- **tokens.txt**: Path to the tokens file
- **encoder.onnx**: Path to the encoder model
- **decoder.onnx**: Path to the decoder model
- **joiner.onnx**: Path to the joiner model
- **audio_file**: Path to the audio file (wav, mp3, etc.) or URL
- **num_threads** (optional): Number of threads to use (default: 1)
- **decoding_method** (optional): Decoding method - `greedy_search` (default) or `modified_beam_search`

## Downloading Pre-trained Models

Please refer to:
<https://k2-fsa.github.io/sherpa/onnx/pretrained_models/index.html>

For a list of pre-trained models to download.

Example model: sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20

## Running Tests

Use the provided PowerShell script to run tests:

```powershell
.\run.ps1
```

## Troubleshooting

### FFmpeg not found

If you encounter errors about FFmpeg libraries not being found:
1. Verify that you downloaded the "dev" build of FFmpeg
2. Check that the paths specified in CMake are correct
3. Ensure all required libraries are present: avcodec.lib, avformat.lib, avfilter.lib, avutil.lib, swresample.lib, swscale.lib, avdevice.lib

### Missing DLLs

If you get "DLL not found" errors at runtime:
1. Copy the FFmpeg DLLs (avcodec.dll, avformat.dll, etc.) to the same directory as the executable
2. Or add the FFmpeg bin directory to your PATH

### Build errors

If you encounter build errors:
1. Ensure you're using Visual Studio 2019 or later
2. Make sure sherpa-onnx was built successfully first
3. Check that the CMake generator matches your Visual Studio version

## Supported Audio Formats

Thanks to FFmpeg, this example supports a wide variety of audio formats and protocols:

### Local Files
- WAV
- MP3
- FLAC
- OGG
- AAC
- And many more

### Network Streams
- HTTP/HTTPS URLs
- RTMP
- HLS (m3u8)
- HTTP-FLV
- SRT
- MPEG-DASH
- And other streaming protocols

## Differences from Linux Version

This Windows version differs from the original Linux version in the following ways:

1. Uses CMake instead of Makefile
2. Uses PowerShell script (run.ps1) instead of Bash script (run.sh)
3. Removed Linux-specific headers (unistd.h)
4. Supports both pkg-config and manual FFmpeg path configuration
5. Uses Windows-specific path handling in documentation

## License

Copyright (c) 2023 Xiaomi Corporation

See the source code for detailed license information.
