import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createDbClient } from '../db/client.js';
import { getTasksReadyForImplementation, markTaskAsCompleted } from '../kanban/service.js';

export function createMCPServer(cwd: string): McpServer {
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
    async () => {
      const db = await createDbClient(cwd);
      const tasks = getTasksReadyForImplementation(db);
      await db.close();

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
        progress: z.string().describe('Progress summary: what was implemented, important files changed, learnings (gotchas, follow-ups)'),
      },
    },
    async ({ taskId, progress }) => {
      const db = await createDbClient(cwd);
      markTaskAsCompleted(db, taskId, progress);
      await db.close();

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
