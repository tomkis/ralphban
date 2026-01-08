import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Pool } from 'pg';
import {
  getAllTasks,
  getTasksReadyForImplementation,
  markTaskAsCompleted,
} from '../kanban/service';

export function createMCPServer(pool: Pool): McpServer {
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
    'get_all_tasks',
    {
      description:
        'Get all tasks from database with complete information including id, category, title, description, steps, state, and timestamps',
    },
    async () => {
      const tasks = await getAllTasks(pool);

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
    'get_tasks_ready_for_implementation',
    {
      description: 'Get all tasks that are ready for implementation',
    },
    async () => {
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
  );

  server.registerTool(
    'mark_task_done',
    {
      description: 'Mark a task as completed',
      inputSchema: {
        taskId: z.string().describe('The ID of the task to mark as done'),
      },
    },
    async ({ taskId }) => {
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
  );

  return server;
}
