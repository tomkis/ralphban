import { spawnProcess } from '../utils/process.js';

const RALPH_PROMPT_TEMPLATE = `
# Ralph Agent Instructions

## Your Task

1. Call \`get_progress\` tool to read progress from completed tasks and understand past context
2. Call \`get_tasks_ready_for_implementation\` tool to get tasks ready to implement
3. Pick highest priority task
   - Tasks are NOT sorted by priority
   - Think about which one is right to pick based on dependencies
4. Implement that ONE task
5. Call \`mark_task_done\` tool with the task ID and progress summary
6. Terminate, you are only supposed to work on ONE task

If no tasks are returned, output <promise>COMPLETE</promise>.

## Important Rules

- Only implement ONE task per run
- When marking task done, provide progress summary:
  - What was implemented
  - Important files changed
  - Learnings (gotchas encountered, proposed follow-ups)
`;

function buildMcpConfig(workingDirectory: string): string {
  const mcpPath = process.env.RALPHBAN_MCP_PATH;

  const mcpServer = mcpPath
    ? {
        type: 'stdio',
        command: 'node',
        args: [mcpPath, '--mcp', `--cwd=${workingDirectory}`],
      }
    : {
        type: 'stdio',
        command: 'npx',
        args: ['github:tomkis/ralphban', '--mcp', `--cwd=${workingDirectory}`],
      };

  return JSON.stringify({ mcpServers: { ralphban: mcpServer } });
}

const MAX_ITERATIONS = 5;
const STOP_CONDITION = '<promise>COMPLETE</promise>';

export async function runRalphLoop(workingDirectory: string): Promise<string> {
  console.log(`[Ralph] Starting loop (max ${MAX_ITERATIONS} iterations)`);

  let allOutput = '';

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`[Ralph] Iteration ${i + 1}/${MAX_ITERATIONS}`);

    const mockPath = process.env.CLAUDE_MOCK_PATH;
    const command = mockPath ? 'node' : 'claude';
    const args = [
      ...(mockPath ? [mockPath] : []),
      '--dangerously-skip-permissions',
      '--mcp-config',
      buildMcpConfig(workingDirectory),
      '-p',
      RALPH_PROMPT_TEMPLATE.trim(),
    ];
    const output = await spawnProcess(command, args,
      {
        cwd: workingDirectory,
        env: {
          ...process.env,
        },
      }
    );

    allOutput += output;

    if (output.includes(STOP_CONDITION)) {
      console.log('[Ralph] Stop condition met, ending loop');
      break;
    }
  }

  console.log('[Ralph] Loop ended');
  return allOutput;
}
