import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnProcess } from '../utils/process.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function runRalphLoop(
  workingDirectory: string,
  prompt: string,
  options?: {
    onOutput?: (data: string) => void;
    signal?: AbortSignal;
  }
): Promise<string> {
  const scriptPath = join(__dirname, 'ralph.sh');

  try {
    const output = await spawnProcess('bash', [scriptPath, workingDirectory, prompt], {
      cwd: workingDirectory,
      onStdout: options?.onOutput,
      signal: options?.signal,
    });

    console.log('Ralph loop completed:', output.slice(0, 200));
    return output;
  } catch (error) {
    console.error('Ralph loop error:', error);
    throw error;
  }
}
