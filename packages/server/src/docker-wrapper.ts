#!/usr/bin/env node

import { spawn, spawnSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const DOCKER_IMAGE = 'ghcr.io/tomkis/ralphban:latest';
const DEFAULT_PORT = 3001;

function checkDockerAvailable(): boolean {
  const result = spawnSync('docker', ['--version'], { stdio: 'pipe' });
  return result.status === 0;
}

async function main() {
  if (!checkDockerAvailable()) {
    console.error('Error: Docker is not available. Please install Docker to use ralphban.');
    process.exit(1);
  }

  const argv = await yargs(hideBin(process.argv))
    .option('cwd', {
      type: 'string',
      description: 'Working directory for Ralph execution',
      default: process.cwd(),
    })
    .option('port', {
      type: 'number',
      description: 'Port for HTTP server',
      default: DEFAULT_PORT,
    })
    .help()
    .parse();

  const workDir = argv.cwd;
  const dockerArgs: string[] = [
    'run',
    '--rm',
    '-it',
    '-p', `${argv.port}:${argv.port}`,
    '-v', `${workDir}:/workspace`,
    '-e', 'SKIP_GIT_VALIDATION=true',
    DOCKER_IMAGE,
    '--cwd=/workspace',
  ];

  const docker = spawn('docker', dockerArgs, { stdio: 'inherit' });

  docker.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  docker.on('error', (err) => {
    console.error('Failed to start Docker container:', err.message);
    process.exit(1);
  });
}

main();
