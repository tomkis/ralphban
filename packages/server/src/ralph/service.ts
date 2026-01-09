import { spawn, ChildProcess } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface RalphResult {
  output: string;
  isComplete: boolean;
  exitCode: number | null;
}

export function runRalphLoop(
  workingDirectory: string,
  prompt: string,
  options?: {
    onOutput?: (data: string) => void;
    signal?: AbortSignal;
  }
): Promise<RalphResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, 'ralph.sh');

    const child: ChildProcess = spawn('bash', [scriptPath, workingDirectory, prompt], {
      cwd: workingDirectory,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    let stderrOutput = '';

    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        child.kill('SIGTERM');
        reject(new Error('Ralph loop was aborted'));
      });
    }

    child.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      output += chunk;
      options?.onOutput?.(chunk);
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderrOutput += data.toString();
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start ralph process: ${err.message}`));
    });

    child.on('close', (code) => {
      const isComplete = output.includes('<promise>COMPLETE</promise>');

      if (code !== 0 && !isComplete) {
        reject(new Error(`Ralph process exited with code ${code}: ${stderrOutput}`));
        return;
      }

      resolve({
        output,
        isComplete,
        exitCode: code,
      });
    });
  });
}
