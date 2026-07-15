import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const processes = [];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function start(command, args, label) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`${label} exited with code ${code}`);
      cleanup(code);
    }
  });

  processes.push(child);
  return child;
}

function cleanup(code = 0) {
  for (const proc of processes) {
    if (!proc.killed) {
      proc.kill();
    }
  }
  process.exit(code);
}

start('node', ['server/index.js'], 'server');
start('node', [path.join(__dirname, '..', 'node_modules', 'vite', 'bin', 'vite.js')], 'vite');

process.on('SIGINT', () => cleanup(0));
process.on('SIGTERM', () => cleanup(0));
