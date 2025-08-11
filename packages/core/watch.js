import { watch } from 'chokidar';
import { exec } from 'child_process';
import { resolve } from 'path';

const srcPath = resolve('./src');
const buildCommand = 'npm run build';

console.log('🔍 Starting file watcher for core package...');
console.log(`📁 Watching: ${srcPath}`);
console.log(`🔨 Build command: ${buildCommand}`);

const watcher = watch(srcPath, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', path => {
    console.log(`📄 File added: ${path}`);
    triggerBuild();
  })
  .on('change', path => {
    console.log(`📝 File changed: ${path}`);
    triggerBuild();
  })
  .on('unlink', path => {
    console.log(`🗑️  File removed: ${path}`);
    triggerBuild();
  })
  .on('error', error => {
    console.error('❌ Watcher error:', error);
  });

function triggerBuild() {
  console.log('🚀 Triggering build...');
  exec(buildCommand, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Build failed:', error);
      return;
    }
    if (stderr) {
      console.error('⚠️  Build warnings:', stderr);
    }
    console.log('✅ Build completed successfully');
  });
}

console.log('✅ File watcher started successfully');
console.log('💡 Press Ctrl+C to stop watching');
