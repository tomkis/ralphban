#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/kanban/repository.ts
async function getNextPendingTask(pool2) {
  const result = await pool2.query(
    "SELECT * FROM tasks WHERE state = 'ReadyForDev' ORDER BY created_at ASC LIMIT 1"
  );
  return result.rows[0] || null;
}
async function updateTaskStatus(pool2, id, state) {
  await pool2.query("UPDATE tasks SET state = $1, updated_at = NOW() WHERE id = $2", [state, id]);
}
var init_repository = __esm({
  "src/kanban/repository.ts"() {
    "use strict";
  }
});

// src/kanban/service.ts
async function getTasksReadyForImplementation(pool2) {
  const task = await getNextPendingTask(pool2);
  return task ? [task] : [];
}
async function markTaskAsCompleted(pool2, taskId) {
  await updateTaskStatus(pool2, taskId, "Done");
}
var init_service = __esm({
  "src/kanban/service.ts"() {
    "use strict";
    init_repository();
  }
});

// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
function createMCPServer(pool2) {
  const server2 = new McpServer(
    {
      name: "ralphban-task-server",
      version: "0.0.1"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );
  server2.registerTool(
    "get_tasks_ready_for_implementation",
    {
      description: "Get all tasks that are ready for implementation"
    },
    async () => {
      const tasks = await getTasksReadyForImplementation(pool2);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(tasks, null, 2)
          }
        ]
      };
    }
  );
  server2.registerTool(
    "mark_task_done",
    {
      description: "Mark a task as completed",
      inputSchema: {
        taskId: z.string().describe("The ID of the task to mark as done")
      }
    },
    async ({ taskId }) => {
      await markTaskAsCompleted(pool2, taskId);
      return {
        content: [
          {
            type: "text",
            text: `Task ${taskId} marked as done`
          }
        ]
      };
    }
  );
  return server2;
}
var init_server = __esm({
  "src/mcp/server.ts"() {
    "use strict";
    init_service();
  }
});

// src/db/client.ts
import { Pool } from "pg";
function createDbClient() {
  return new Pool({
    connectionString: process.env.DATABASE_URL
  });
}
var init_client = __esm({
  "src/db/client.ts"() {
    "use strict";
  }
});

// src/mcp-cli.ts
var mcp_cli_exports = {};
__export(mcp_cli_exports, {
  runMcpServer: () => runMcpServer
});
import "dotenv/config";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
async function shutdown(signal) {
  process.stderr.write(`
Received ${signal}, shutting down...
`);
  try {
    if (mcpServer) {
      await mcpServer.close();
    }
    if (pool) {
      await pool.end();
    }
    process.stderr.write("Shutdown complete\n");
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Error during shutdown: ${error}
`);
    process.exit(1);
  }
}
async function runMcpServer() {
  pool = createDbClient();
  mcpServer = createMCPServer(pool);
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}
var pool, mcpServer;
var init_mcp_cli = __esm({
  "src/mcp-cli.ts"() {
    "use strict";
    init_server();
    init_client();
    pool = null;
    mcpServer = null;
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  }
});

// src/utils/git-validation.ts
import { spawn } from "child_process";
function execGit(args, cwd) {
  return new Promise((resolve) => {
    const child = spawn("git", args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });
    child.on("error", () => {
      resolve({ success: false, output: stderr || "Failed to execute git command" });
    });
    child.on("close", (code) => {
      resolve({ success: code === 0, output: code === 0 ? stdout : stderr });
    });
  });
}
async function checkIsGitRepo(cwd) {
  const result = await execGit(["rev-parse", "--git-dir"], cwd);
  if (!result.success) {
    return { valid: false, error: "Not a git repository" };
  }
  return { valid: true };
}
async function checkIsCleanWorkingTree(cwd) {
  const result = await execGit(["status", "--porcelain"], cwd);
  if (!result.success) {
    return { valid: false, error: "Failed to check git status" };
  }
  if (result.output.trim().length > 0) {
    return { valid: false, error: "Working tree has uncommitted changes" };
  }
  return { valid: true };
}
async function validateGitRepository(cwd) {
  const errors = [];
  const gitRepoCheck = await checkIsGitRepo(cwd);
  if (!gitRepoCheck.valid && gitRepoCheck.error) {
    errors.push(gitRepoCheck.error);
    return { valid: false, errors };
  }
  const cleanCheck = await checkIsCleanWorkingTree(cwd);
  if (!cleanCheck.valid && cleanCheck.error) {
    errors.push(cleanCheck.error);
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
var init_git_validation = __esm({
  "src/utils/git-validation.ts"() {
    "use strict";
  }
});

// src/db/init.ts
async function checkTablesExist(pool2) {
  const result = await pool2.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'tasks'
    );
  `);
  return result.rows[0].exists;
}
async function initializeSchema(pool2) {
  try {
    const tablesExist = await checkTablesExist(pool2);
    if (tablesExist) {
      return;
    }
    console.log("Initializing database schema...");
    await pool2.query(SCHEMA);
    console.log("Database schema initialized");
  } catch (error) {
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      throw new Error(
        "Could not connect to PostgreSQL. Ensure PostgreSQL is running and DATABASE_URL is correct."
      );
    }
    throw error;
  }
}
var SCHEMA;
var init_init = __esm({
  "src/db/init.ts"() {
    "use strict";
    SCHEMA = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  category VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps JSONB NOT NULL,
  state TEXT DEFAULT 'ReadyForDev' CHECK (state IN ('ReadyForDev', 'Done')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_state ON tasks(state);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
`;
  }
});

// ../api/dist/trpc.js
import { initTRPC } from "@trpc/server";
var t, router, publicProcedure;
var init_trpc = __esm({
  "../api/dist/trpc.js"() {
    "use strict";
    t = initTRPC.context().create();
    router = t.router;
    publicProcedure = t.procedure;
  }
});

// ../api/dist/routers/kanban.js
import { z as z2 } from "zod";
var TaskSchema, kanbanRouter;
var init_kanban = __esm({
  "../api/dist/routers/kanban.js"() {
    "use strict";
    init_trpc();
    TaskSchema = z2.object({
      id: z2.string(),
      title: z2.string(),
      status: z2.enum(["todo", "in_progress", "done"])
    });
    kanbanRouter = router({
      getTasks: publicProcedure.query(async ({ ctx }) => {
        return ctx.kanban.getTasks();
      })
    });
  }
});

// ../api/dist/routers/ralph.js
import { z as z3 } from "zod";
var RalphStatusSchema, StartRalphInputSchema, ralphRouter;
var init_ralph = __esm({
  "../api/dist/routers/ralph.js"() {
    "use strict";
    init_trpc();
    RalphStatusSchema = z3.object({
      isRunning: z3.boolean()
    });
    StartRalphInputSchema = z3.object({
      workingDirectory: z3.string()
    });
    ralphRouter = router({
      getStatus: publicProcedure.query(async ({ ctx }) => {
        return ctx.ralph.getStatus();
      }),
      start: publicProcedure.input(StartRalphInputSchema).mutation(async ({ ctx, input }) => {
        return ctx.ralph.start(input.workingDirectory);
      })
    });
  }
});

// ../api/dist/router.js
var appRouter;
var init_router = __esm({
  "../api/dist/router.js"() {
    "use strict";
    init_trpc();
    init_kanban();
    init_ralph();
    appRouter = router({
      kanban: kanbanRouter,
      ralph: ralphRouter
    });
  }
});

// ../api/dist/index.js
var init_dist = __esm({
  "../api/dist/index.js"() {
    "use strict";
    init_router();
    init_trpc();
    init_kanban();
    init_ralph();
  }
});

// src/kanban/trpc-service.ts
function mapStateToStatus(state) {
  switch (state) {
    case "ReadyForDev":
      return "todo";
    case "Done":
      return "done";
    default:
      return "todo";
  }
}
function mapServerTaskToApiTask(task) {
  return {
    id: task.id,
    title: task.title,
    status: mapStateToStatus(task.state)
  };
}
function createKanbanService(pool2) {
  return {
    async getTasks() {
      const result = await pool2.query("SELECT * FROM tasks ORDER BY created_at ASC");
      return result.rows.map(mapServerTaskToApiTask);
    }
  };
}
var init_trpc_service = __esm({
  "src/kanban/trpc-service.ts"() {
    "use strict";
  }
});

// src/utils/process.ts
import { spawn as spawn2 } from "child_process";
function spawnProcess(command, args, options) {
  return new Promise((resolve, reject) => {
    const spawnOptions = {
      cwd: options?.cwd,
      stdio: ["ignore", "pipe", "pipe"]
    };
    const child = spawn2(command, args, spawnOptions);
    let stdout = "";
    if (options?.signal) {
      if (options.signal.aborted) {
        child.kill("SIGTERM");
        reject(new Error("Process was aborted"));
        return;
      }
      options.signal.addEventListener("abort", () => {
        child.kill("SIGTERM");
        reject(new Error("Process was aborted"));
      });
    }
    child.stdout?.on("data", (data) => {
      const chunk = data.toString();
      console.log("stdout chunk:", chunk);
      stdout += chunk;
      options?.onStdout?.(chunk);
    });
    child.stderr?.on("data", (data) => {
      console.error("stderr chunk:", data.toString());
    });
    child.on("error", (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
        return;
      }
      resolve(stdout);
    });
  });
}
var init_process = __esm({
  "src/utils/process.ts"() {
    "use strict";
  }
});

// src/ralph/service.ts
function buildMcpConfig() {
  const mcpPath = process.env.RALPHBAN_MCP_PATH;
  const mcpServer2 = mcpPath ? { type: "stdio", command: "node", args: [mcpPath, "--mcp"] } : { type: "stdio", command: "npx", args: ["github:tomkis/ralphban", "--mcp"] };
  return JSON.stringify({ mcpServers: { ralphban: mcpServer2 } });
}
async function runRalphLoop(workingDirectory) {
  return spawnProcess(
    "claude",
    [
      "--dangerously-skip-permissions",
      "--mcp-config",
      buildMcpConfig(),
      "-p",
      RALPH_PROMPT_TEMPLATE.trim()
    ],
    {
      cwd: workingDirectory
    }
  );
}
var RALPH_PROMPT_TEMPLATE;
var init_service2 = __esm({
  "src/ralph/service.ts"() {
    "use strict";
    init_process();
    RALPH_PROMPT_TEMPLATE = `
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
  }
});

// src/ralph/trpc-service.ts
function createRalphService() {
  return {
    async getStatus() {
      return { isRunning };
    },
    async start(workingDirectory) {
      if (isRunning) {
        return;
      }
      isRunning = true;
      runRalphLoop(workingDirectory).finally(() => {
        isRunning = false;
      });
    }
  };
}
var isRunning;
var init_trpc_service2 = __esm({
  "src/ralph/trpc-service.ts"() {
    "use strict";
    init_service2();
    isRunning = false;
  }
});

// src/trpc/context.ts
function createContext(pool2) {
  return {
    kanban: createKanbanService(pool2),
    ralph: createRalphService()
  };
}
var init_context = __esm({
  "src/trpc/context.ts"() {
    "use strict";
    init_trpc_service();
    init_trpc_service2();
  }
});

// src/trpc/adapter.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
function createTrpcHandler(pool2) {
  return async (req, res) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers[key] = value;
      }
    }
    const response = await fetchRequestHandler({
      endpoint: "/trpc",
      req: new Request(url, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? void 0 : JSON.stringify(req.body)
      }),
      router: appRouter,
      createContext: () => createContext(pool2)
    });
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const body = await response.text();
    res.send(body);
  };
}
var init_adapter = __esm({
  "src/trpc/adapter.ts"() {
    "use strict";
    init_dist();
    init_context();
  }
});

// src/trpc/index.ts
var init_trpc2 = __esm({
  "src/trpc/index.ts"() {
    "use strict";
    init_dist();
    init_context();
    init_adapter();
  }
});

// src/server.ts
import path from "path";
import express from "express";
function createServer(config) {
  const { pool: pool2 } = config;
  const port = config.port ?? parseInt(process.env.PORT ?? "3001", 10);
  const errorHandler = (err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  };
  const app = express();
  app.use(express.json());
  app.all("/trpc/{*path}", createTrpcHandler(pool2));
  if (config.staticDir) {
    app.use(express.static(config.staticDir));
    app.get("{*path}", (_req, res) => {
      res.sendFile(path.join(config.staticDir, "index.html"));
    });
  }
  app.use(errorHandler);
  let httpServer = null;
  const start = () => {
    return new Promise((resolve) => {
      httpServer = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        resolve();
      });
    });
  };
  const stop = () => {
    return new Promise((resolve, reject) => {
      if (!httpServer) {
        resolve();
        return;
      }
      httpServer.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };
  return { app, start, stop };
}
var init_server2 = __esm({
  "src/server.ts"() {
    "use strict";
    init_trpc2();
  }
});

// src/cli.ts
var cli_exports = {};
__export(cli_exports, {
  runHttpServer: () => runHttpServer
});
import "dotenv/config";
import fs from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
async function shutdown2(signal) {
  console.log(`
Received ${signal}, shutting down...`);
  try {
    if (server) {
      await server.stop();
    }
    if (appPool) {
      await appPool.end();
    }
    console.log("Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}
async function runHttpServer() {
  const cwd = process.cwd();
  if (process.env.SKIP_GIT_VALIDATION !== "true") {
    const gitValidation = await validateGitRepository(cwd);
    if (!gitValidation.valid) {
      console.error("Git validation failed:");
      for (const error of gitValidation.errors) {
        console.error(`  - ${error}`);
      }
      process.exit(1);
    }
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    console.error("Set it in your .env file or export it in your shell");
    process.exit(1);
  }
  const initPool = createDbClient();
  try {
    await initializeSchema(initPool);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database initialization failed:", message);
    await initPool.end();
    process.exit(1);
  }
  await initPool.end();
  appPool = createDbClient();
  const webDistInDir = path2.resolve(__dirname, "web-dist");
  const webDistInParent = path2.resolve(__dirname, "..", "web-dist");
  const webDistPath = fs.existsSync(webDistInDir) ? webDistInDir : webDistInParent;
  server = createServer({ pool: appPool, staticDir: webDistPath });
  await server.start();
  console.log("ralphban is ready");
}
var __dirname, server, appPool;
var init_cli = __esm({
  "src/cli.ts"() {
    "use strict";
    init_git_validation();
    init_init();
    init_client();
    init_server2();
    __dirname = path2.dirname(fileURLToPath(import.meta.url));
    server = null;
    appPool = null;
    process.on("SIGINT", () => shutdown2("SIGINT"));
    process.on("SIGTERM", () => shutdown2("SIGTERM"));
  }
});

// src/index.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
var argv = await yargs(hideBin(process.argv)).option("mcp", {
  type: "boolean",
  description: "Run in MCP server mode (stdio transport)",
  default: false
}).help().parse();
if (argv.mcp) {
  const { runMcpServer: runMcpServer2 } = await Promise.resolve().then(() => (init_mcp_cli(), mcp_cli_exports));
  await runMcpServer2();
} else {
  const { runHttpServer: runHttpServer2 } = await Promise.resolve().then(() => (init_cli(), cli_exports));
  await runHttpServer2();
}
