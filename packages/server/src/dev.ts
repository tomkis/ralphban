import { runHttpServer } from './cli';
import { rm, mkdir, writeFile } from 'fs/promises';
import { execSync } from 'child_process';
import { join } from 'path';

const workingDirectory = '/tmp/ralphban';

await rm(workingDirectory, { recursive: true, force: true });
await mkdir(workingDirectory, { recursive: true });
execSync('git init', { cwd: workingDirectory });
await writeFile(join(workingDirectory, '.gitignore'), '.ralphban\n');
execSync('git add .gitignore && git commit -m "init"', { cwd: workingDirectory });

await runHttpServer(workingDirectory);
