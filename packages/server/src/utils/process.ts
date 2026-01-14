import { spawn, ChildProcess, SpawnOptions } from 'child_process';

export interface SpawnProcessOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  onStdout?: (data: string) => void;
  signal?: AbortSignal;
}

export function spawnProcess(
  command: string,
  args: string[],
  options?: SpawnProcessOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      cwd: options?.cwd,
      env: options?.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    };

    const child: ChildProcess = spawn(command, args, spawnOptions);

    let stdout = '';

    if (options?.signal) {
      if (options.signal.aborted) {
        child.kill('SIGTERM');
        reject(new Error('Process was aborted'));
        return;
      }

      options.signal.addEventListener('abort', () => {
        child.kill('SIGTERM');
        reject(new Error('Process was aborted'));
      });
    }

    child.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      console.log('stdout chunk:', chunk);
      stdout += chunk;
      options?.onStdout?.(chunk);
    });

    child.stderr?.on('data', (data: Buffer) => {
      console.error('stderr chunk:', data.toString());
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      resolve(stdout);
    });
  });
}
