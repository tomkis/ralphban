import { spawnProcess } from '../utils/process.js';

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

function buildMcpConfig(workingDirectory: string): string {
  return JSON.stringify({
    mcpServers: {
      ralphban: {
        type: 'stdio',
        command: 'npx',
        args: ['ralphban-mcp', '--cwd', workingDirectory],
      },
    },
  });
}

export async function runRalphLoop(workingDirectory: string): Promise<string> {
  return spawnProcess(
    'claude',
    [
      '--dangerously-skip-permissions',
      '--mcp-config',
      buildMcpConfig(workingDirectory),
      '-p',
      RALPH_PROMPT_TEMPLATE.trim(),
    ],
    {
      cwd: workingDirectory,
    }
  );
}
