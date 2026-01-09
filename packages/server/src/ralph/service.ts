import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnProcess } from '../utils/process.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RALPH_PROMPT_TEMPLATE = `
# Ralph Agent Instructions

## Your Task

1. Call \`getTasks\` tool to get the list of tasks
2. Pick highest priority task where \`passes: false\`
   - Tasks are NOT sorted by priority
   - Think about which one is right to pick based on dependencies
3. Implement that ONE task
4. Run \`pnpm typecheck\` to verify no type errors
5. Run \`pnpm lint\` to verify linting issues
6. Fix any type or linting errors if present
7. Ensure the project still works by using \`pnpm test\`
8. Call \`markTaskComplete\` tool with the task ID
9. Commit: \`[Category]: [ID] - [Title]\`
10. Terminate, you are only supposed to work on ONE task

If all tasks have \`passes: true\`, output <promise>COMPLETE</promise>.

## Important Rules

- Only implement ONE task per run
- Always verify with typecheck, lint, and test before marking complete
- Commit your changes with the specified format
`;

function buildPrompt(): string {
  return RALPH_PROMPT_TEMPLATE.trim();
}

export async function runRalphLoop(
  workingDirectory: string,
  options?: {
    onOutput?: (data: string) => void;
    signal?: AbortSignal;
  }
): Promise<string> {
  const scriptPath = join(__dirname, 'ralph.sh');
  const prompt = buildPrompt();

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
