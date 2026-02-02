#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"

# Check if model directory exists
$modelDir = ".\sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20"
if (-not (Test-Path $modelDir)) {
    Write-Host "Please download the pre-trained model for testing."
    Write-Host "You can refer to"
    Write-Host ""
    Write-Host "https://k2-fsa.github.io/sherpa/onnx/pretrained_models/zipformer-transducer-models.html#sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20-bilingual-chinese-english"
    Write-Host "for help"
    exit 1
}

# Check if sherpa-onnx is built
$libPath = "..\build\lib\sherpa-onnx-c-api.lib"
$libPath2 = "..\build\bin\Release\sherpa-onnx-c-api.dll"
if (-not (Test-Path $libPath) -and -not (Test-Path $libPath2)) {
    Write-Host "Please build sherpa-onnx first. You can use"
    Write-Host ""
    Write-Host "  cd D:\MyProjects\c_projects\sherpa-onnx"
    Write-Host "  mkdir build"
    Write-Host "  cd build"
    Write-Host "  cmake .. -G `"Visual Studio 17 2022`" -A x64"
    Write-Host "  cmake --build . --config Release"
    exit 1
}

# Check if executable exists
$exePath = ".\build\bin\Release\sherpa-onnx-ffmpeg.exe"
if (-not (Test-Path $exePath)) {
    Write-Host "Building sherpa-onnx-ffmpeg..."
    if (-not (Test-Path ".\build")) {
        New-Item -ItemType Directory -Path ".\build" | Out-Null
    }
    Set-Location ".\build"
    cmake .. -G "Visual Studio 17 2022" -A x64
    cmake --build . --config Release
    Set-Location ".."
    
    if (-not (Test-Path $exePath)) {
        Write-Host "Failed to build sherpa-onnx-ffmpeg"
        exit 1
    }
}

# Test with different decoding methods
$methods = @("greedy_search", "modified_beam_search")
foreach ($method in $methods) {
    Write-Host "Testing method: $method"
    & $exePath `
        "$modelDir\tokens.txt" `
        "$modelDir\encoder-epoch-99-avg-1.onnx" `
        "$modelDir\decoder-epoch-99-avg-1.onnx" `
        "$modelDir\joiner-epoch-99-avg-1.onnx" `
        "$modelDir\test_wavs\0.wav" `
        2 `
        $method
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error occurred while testing with $method"
        exit 1
    }
}

Write-Host ""
Write-Host "Decoding a URL"

& $exePath `
    "$modelDir\tokens.txt" `
    "$modelDir\encoder-epoch-99-avg-1.onnx" `
    "$modelDir\decoder-epoch-99-avg-1.onnx" `
    "$modelDir\joiner-epoch-99-avg-1.onnx" `
    "https://huggingface.co/csukuangfj/sherpa-onnx-streaming-zipformer-bilingual-zh-en-2023-02-20/resolve/main/test_wavs/3.wav"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error occurred while decoding URL"
    exit 1
}

Write-Host ""
Write-Host "All tests completed successfully!"
