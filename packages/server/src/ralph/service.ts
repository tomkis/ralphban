import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnProcess } from '../utils/process.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface RalphResult {
  output: string;
  isComplete: boolean;
  exitCode: number | null;
}

export async function runRalphLoop(
  workingDirectory: string,
  prompt: string,
  options?: {
    onOutput?: (data: string) => void;
    signal?: AbortSignal;
  }
): Promise<RalphResult> {
  const scriptPath = join(__dirname, 'ralph.sh');

  try {
    const result = await spawnProcess('bash', [scriptPath, workingDirectory, prompt], {
      cwd: workingDirectory,
      onStdout: options?.onOutput,
      signal: options?.signal,
    });

    const isComplete = result.stdout.includes('<promise>COMPLETE</promise>');

    if (result.exitCode !== 0 && !isComplete) {
      throw new Error(`Ralph process exited with code ${result.exitCode}: ${result.stderr}`);
    }

    return {
      output: result.stdout,
      isComplete,
      exitCode: result.exitCode,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Process was aborted') {
      throw new Error('Ralph loop was aborted');
    }
    throw error;
  }
}
