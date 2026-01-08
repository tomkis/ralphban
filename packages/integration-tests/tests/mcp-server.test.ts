import { describe, it, expect } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

describe('MCP Server', () => {
  it('should call get_tasks_ready_for_implementation tool and return data', async () => {
    const transport = new StreamableHTTPClientTransport(
      new URL('http://localhost:3001/api/mcp'),
      {
        fetch,
      }
    );

    const client = new Client(
      {
        name: 'test-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);

    const result = await client.callTool({
      name: 'get_tasks_ready_for_implementation',
      arguments: {},
    });

    console.log('get_tasks_ready_for_implementation result:', JSON.stringify(result, null, 2));

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);

    await client.close();
  });
});
