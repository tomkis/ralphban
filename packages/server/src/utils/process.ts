import { spawn, ChildProcess, SpawnOptions } from 'child_process';

export interface SpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface SpawnProcessOptions {
  cwd?: string;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  signal?: AbortSignal;
}

export function spawnProcess(
  command: string,
  args: string[],
  options?: SpawnProcessOptions
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      cwd: options?.cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    };

    const child: ChildProcess = spawn(command, args, spawnOptions);

    let stdout = '';
    let stderr = '';

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
      stdout += chunk;
      options?.onStdout?.(chunk);
    });

    child.stderr?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      stderr += chunk;
      options?.onStderr?.(chunk);
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code,
      });
    });
  });
}
