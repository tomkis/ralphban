import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as fs from 'fs';
import * as path from 'path';

interface McpConfig {
  mcpServers: {
    [name: string]: {
      type: string;
      command: string;
      args: string[];
    };
  };
}

interface ToolCall {
  name: string;
  args?: Record<string, unknown>;
  response: unknown;
}

function parseArgs(args: string[]): { prompt: string; mcpConfig: McpConfig } {
  let prompt = '';
  let mcpConfigStr = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-p' && args[i + 1]) {
      prompt = args[i + 1];
      i++;
    } else if (args[i] === '--mcp-config' && args[i + 1]) {
      mcpConfigStr = args[i + 1];
      i++;
    }
  }

  return {
    prompt,
    mcpConfig: JSON.parse(mcpConfigStr) as McpConfig,
  };
}

async function callTool(
  client: Client,
  name: string,
  args?: Record<string, unknown>
): Promise<ToolCall> {
  const result = await client.callTool({ name, arguments: args });
  return {
    name,
    args,
    response: result.content,
  };
}

function normalizeForSnapshot(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(/\/Users\/[^/]+\/[^\s"]+/g, '/NORMALIZED_PATH')
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, 'TIMESTAMP');
  }
  if (Array.isArray(value)) {
    return value.map(normalizeForSnapshot);
  }
  if (value && typeof value === 'object') {
    const normalized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      normalized[k] = normalizeForSnapshot(v);
    }
    return normalized;
  }
  return value;
}

function formatSnapshot(
  prompt: string,
  mcpConfig: McpConfig,
  toolCalls: ToolCall[]
): string {
  const normalizedConfig = normalizeForSnapshot(mcpConfig);
  const normalizedCalls = normalizeForSnapshot(toolCalls) as ToolCall[];

  let output = '=== MOCK CLAUDE RUN ===\n';
  output += 'PROMPT:\n';
  output += prompt + '\n\n';
  output += 'MCP_CONFIG:\n';
  output += JSON.stringify(normalizedConfig, null, 2) + '\n';

  for (const call of normalizedCalls) {
    output += '\nTOOL: ' + call.name + '\n';
    if (call.args) {
      output += 'ARGS: ' + JSON.stringify(call.args) + '\n';
    }
    output += 'RESPONSE: ' + JSON.stringify(call.response) + '\n';
  }

  return output;
}

async function main() {
  const args = process.argv.slice(2);
  const { prompt, mcpConfig } = parseArgs(args);

  const serverConfig = Object.values(mcpConfig.mcpServers)[0];
  const transport = new StdioClientTransport({
    command: serverConfig.command,
    args: serverConfig.args,
  });

  const client = new Client({ name: 'mock-claude', version: '1.0.0' }, {});
  await client.connect(transport);

  const toolCalls: ToolCall[] = [];

  const progressCall = await callTool(client, 'get_progress');
  toolCalls.push(progressCall);

  const tasksCall = await callTool(client, 'get_tasks_ready_for_implementation');
  toolCalls.push(tasksCall);

  const tasksResponse = tasksCall.response as Array<{ type: string; text: string }>;
  const tasksText = tasksResponse[0]?.text || '[]';
  const tasks = JSON.parse(tasksText) as Array<{ id: string }>;

  if (tasks.length > 0) {
    const markDoneCall = await callTool(client, 'mark_task_done', {
      taskId: tasks[0].id,
      progress: 'Mock implementation completed',
    });
    toolCalls.push(markDoneCall);
  }

  await client.close();

  const snapshot = formatSnapshot(prompt, mcpConfig, toolCalls);
  const snapshotPath = path.join(process.cwd(), 'mock-claude-snapshot.txt');
  fs.writeFileSync(snapshotPath, snapshot);

  console.log('<promise>COMPLETE</promise>');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
