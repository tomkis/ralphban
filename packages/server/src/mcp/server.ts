import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Pool } from 'pg';
import { getTasksReadyForImplementation, markTaskAsCompleted } from '../services/task-service';

export function createMCPServer(pool: Pool): Server {
  const server = new Server(
    {
      name: 'ralphban-task-server',
      version: '0.0.1',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler('tools/list' as any, async () => {
    return {
      tools: [
        {
          name: 'get_tasks_ready_for_implementation',
          description: 'Get all tasks that are ready for implementation',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'mark_task_done',
          description: 'Mark a task as completed',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: {
                type: 'string',
                description: 'The ID of the task to mark as done',
              },
            },
            required: ['taskId'],
          },
        },
      ],
    };
  });

  server.setRequestHandler('tools/call' as any, async (request) => {
    if (request.params.name === 'get_tasks_ready_for_implementation') {
      const tasks = await getTasksReadyForImplementation(pool);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tasks, null, 2),
          },
        ],
      };
    }

    if (request.params.name === 'mark_task_done') {
      const { taskId } = request.params.arguments as { taskId: string };
      await markTaskAsCompleted(pool, taskId);
      return {
        content: [
          {
            type: 'text',
            text: `Task ${taskId} marked as done`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
}
