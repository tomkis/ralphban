import { query } from '@anthropic-ai/claude-agent-sdk';

const RALPH_PROMPT_TEMPLATE = `
# Ralph Agent Instructions

## Your Task

1. Call \`get_tasks_ready_for_implementation\` tool to get tasks ready to implement
2. Pick highest priority task
   - Tasks are NOT sorted by priority
   - Think about which one is right to pick based on dependencies
3. Implement that ONE task
4. Call \`mark_task_done\` tool with the task ID
5. Terminate, you are only supposed to work on ONE task

If no tasks are returned, output <promise>COMPLETE</promise>.

## Important Rules

- Only implement ONE task per run
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
          type: 'stdio',
          command: 'pnpm',
          args: ['--filter', 'server', 'mcp:stdio'],
        },
      },
    },
  })) {
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

  return fullOutput;
}
