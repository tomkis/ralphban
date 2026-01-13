import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { DbClient } from '../db/client.js';
import { getTasksReadyForImplementation, markTaskAsCompleted } from '../kanban/service.js';

export function createMCPServer(db: DbClient): McpServer {
  const server = new McpServer(
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

  server.registerTool(
    'get_tasks_ready_for_implementation',
    {
      description: 'Get all tasks that are ready for implementation',
    },
    () => {
      const tasks = getTasksReadyForImplementation(db);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tasks, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'mark_task_done',
    {
      description: 'Mark a task as completed',
      inputSchema: {
        taskId: z.string().describe('The ID of the task to mark as done'),
      },
    },
    ({ taskId }) => {
      markTaskAsCompleted(db, taskId);
      return {
        content: [
          {
            type: 'text',
            text: `Task ${taskId} marked as done`,
          },
        ],
      };
    }
  );

  return server;
}
