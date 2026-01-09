import { query } from '@anthropic-ai/claude-agent-sdk';

const RALPH_PROMPT_TEMPLATE = `
# Ralph Agent Instructions

## Your Task

1. Call \`get_tasks_ready_for_implementation\` tool to get tasks ready to implement
2. Pick highest priority task
   - Tasks are NOT sorted by priority
   - Think about which one is right to pick based on dependencies
3. Implement that ONE task
4. Run \`pnpm typecheck\` to verify no type errors
5. Run \`pnpm lint\` to verify linting issues
6. Fix any type or linting errors if present
7. Ensure the project still works by using \`pnpm test\`
8. Call \`mark_task_done\` tool with the task ID
9. Commit: \`[Category]: [ID] - [Title]\`
10. Terminate, you are only supposed to work on ONE task

If no tasks are returned, output <promise>COMPLETE</promise>.

## Important Rules

- Only implement ONE task per run
- Always verify with typecheck, lint, and test before marking complete
- Commit your changes with the specified format
`;

export async function runRalphLoop(
  workingDirectory: string,
  options?: {
    onOutput?: (data: string) => void;
    signal?: AbortSignal;
  }
): Promise<string> {
  const abortController = new AbortController();

  if (options?.signal) {
    options.signal.addEventListener('abort', () => abortController.abort());
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  let fullOutput = '';

  for await (const message of query({
    prompt: RALPH_PROMPT_TEMPLATE.trim(),
    options: {
      cwd: workingDirectory,
      allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      abortController,
      mcpServers: {
        ralphban: {
          type: 'http',
          url: `http://localhost:3001/mcp`,
        },
      },
    },
  })) {
    console.log('message:', message);

    if (message.type === 'result' && message.subtype === 'success') {
      fullOutput = message.result;
    }
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') {
          options?.onOutput?.(block.text);
        }
      }
    }
  }

  console.log('Ralph loop completed:', fullOutput.slice(0, 200));
  return fullOutput;
}
