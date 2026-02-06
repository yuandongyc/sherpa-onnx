const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  Transcription Files Copy Tool');
console.log('========================================\n');

const sourceDir = '../output/transcription';
const targetDir = '../output/transcription2';

try {
  const absoluteSourceDir = path.resolve(__dirname, sourceDir);
  const absoluteTargetDir = path.resolve(__dirname, targetDir);

  if (!fs.existsSync(absoluteSourceDir)) {
    console.error(`Error: Source directory does not exist: ${absoluteSourceDir}`);
    process.exit(1);
  }

  console.log(`Source directory: ${absoluteSourceDir}`);
  console.log(`Target directory: ${absoluteTargetDir}`);

  if (!fs.existsSync(absoluteTargetDir)) {
    fs.mkdirSync(absoluteTargetDir, { recursive: true });
    console.log(`Created target directory: ${absoluteTargetDir}`);
  }

  const files = fs.readdirSync(absoluteSourceDir);
  console.log(`Found ${files.length} files to copy\n`);

  let copiedCount = 0;
  for (const file of files) {
    const sourcePath = path.join(absoluteSourceDir, file);
    const targetPath = path.join(absoluteTargetDir, file);

    const stat = fs.statSync(sourcePath);
    if (stat.isFile()) {
      if (file.endsWith('.json')) {
        const content = fs.readFileSync(sourcePath, 'utf8');
        const data = JSON.parse(content);

        if (data.segments && Array.isArray(data.segments)) {
          const readyIndex = data.segments.findIndex(seg => 
            seg.text && seg.text.toLowerCase().includes('ready')
          );

          if (readyIndex !== -1) {
            data.segments = data.segments.slice(readyIndex + 1);
            fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`Processed: ${file} (removed ${readyIndex + 1} segments before "ready")`);
          } else {
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copied: ${file} (no "ready" found)`);
          }
        } else {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Copied: ${file} (no segments)`);
        }
      } else {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied: ${file}`);
      }
      copiedCount++;
    }
  }

  console.log('\n========================================');
  console.log('  Copy Completed!');
  console.log('========================================');
  console.log(`Successfully copied ${copiedCount} files`);
  console.log(`Target directory: ${absoluteTargetDir}`);
  console.log('========================================\n');

} catch (error) {
  console.error('\nError copying files:', error.message);
  console.error(error.stack);
  process.exit(1);
}
