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

// src/db/setup.ts
import * as fs from "fs";
import * as path from "path";
import initSqlJs from "sql.js";
function getRalphbanDir(cwd) {
  return path.join(cwd, RALPHBAN_DIR);
}
function getDbPath(cwd) {
  return path.join(getRalphbanDir(cwd), DB_FILENAME);
}
function ensureRalphbanDir(cwd) {
  const dir = getRalphbanDir(cwd);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}
async function loadDatabase(cwd) {
  const SQL = await initSqlJs();
  const dbPath = getDbPath(cwd);
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    return new SQL.Database(buffer);
  }
  return new SQL.Database();
}
function saveDatabase(db2, cwd) {
  ensureRalphbanDir(cwd);
  const dbPath = getDbPath(cwd);
  const data = db2.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}
var RALPHBAN_DIR, DB_FILENAME;
var init_setup = __esm({
  "src/db/setup.ts"() {
    "use strict";
    RALPHBAN_DIR = ".ralphban";
    DB_FILENAME = "ralphban.db";
  }
});

// src/db/client.ts
async function createDbClient(cwd) {
  ensureRalphbanDir(cwd);
  const db2 = await loadDatabase(cwd);
  const save = () => saveDatabase(db2, cwd);
  return {
    db: db2,
    run(sql, params) {
      db2.run(sql, params);
      save();
    },
    exec(sql) {
      return db2.exec(sql);
    },
    close() {
      save();
      db2.close();
    }
  };
}
var init_client = __esm({
  "src/db/client.ts"() {
    "use strict";
    init_setup();
  }
});

// src/kanban/repository.ts
function rowToTask(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    steps: JSON.parse(row.steps),
    state: row.state,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at)
  };
}
function getNextPendingTask(client) {
  const result = client.exec(
    "SELECT id, category, title, description, steps, state, created_at, updated_at FROM tasks WHERE state = 'ReadyForDev' ORDER BY created_at ASC LIMIT 1"
  );
  if (result.length === 0 || result[0].values.length === 0) {
    return null;
  }
  const columns = result[0].columns;
  const values = result[0].values[0];
  const row = Object.fromEntries(columns.map((col, i) => [col, values[i]]));
  return rowToTask(row);
}
function updateTaskStatus(client, id, state) {
  client.run("UPDATE tasks SET state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
    state,
    id
  ]);
}
function getNextTaskId(client, category) {
  const result = client.exec(
    `SELECT id FROM tasks WHERE id LIKE '${category}-%' ORDER BY created_at DESC LIMIT 1`
  );
  if (result.length === 0 || result[0].values.length === 0) {
    return `${category}-001`;
  }
  const lastId = result[0].values[0][0];
  const numPart = parseInt(lastId.split("-")[1], 10);
  const nextNum = numPart + 1;
  return `${category}-${String(nextNum).padStart(3, "0")}`;
}
function createTask(client, params) {
  const id = getNextTaskId(client, params.category);
  const now = /* @__PURE__ */ new Date();
  client.run(
    `INSERT INTO tasks (id, category, title, description, steps, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'ReadyForDev', ?, ?)`,
    [
      id,
      params.category,
      params.title,
      params.description,
      JSON.stringify(params.steps),
      now.toISOString(),
      now.toISOString()
    ]
  );
  return {
    id,
    category: params.category,
    title: params.title,
    description: params.description,
    steps: params.steps,
    state: "ReadyForDev",
    created_at: now,
    updated_at: now
  };
}
function deleteAllTasks(client) {
  client.run("DELETE FROM tasks");
}
var init_repository = __esm({
  "src/kanban/repository.ts"() {
    "use strict";
  }
});

// src/kanban/service.ts
function getTasksReadyForImplementation(client) {
  const task = getNextPendingTask(client);
  return task ? [task] : [];
}
function markTaskAsCompleted(client, taskId) {
  updateTaskStatus(client, taskId, "Done");
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
function createMCPServer(cwd) {
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
      const db2 = await createDbClient(cwd);
      const tasks = getTasksReadyForImplementation(db2);
      await db2.close();
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
      const db2 = await createDbClient(cwd);
      markTaskAsCompleted(db2, taskId);
      await db2.close();
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
    init_client();
    init_service();
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
    if (db) {
      db.close();
    }
    process.stderr.write("Shutdown complete\n");
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Error during shutdown: ${error}
`);
    process.exit(1);
  }
}
async function runMcpServer(cwd) {
  mcpServer = createMCPServer(cwd);
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}
var db, mcpServer;
var init_mcp_cli = __esm({
  "src/mcp-cli.ts"() {
    "use strict";
    init_server();
    db = null;
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
function checkTablesExist(db2) {
  const result = db2.exec(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='tasks';
  `);
  return result.length > 0 && result[0].values.length > 0;
}
function initializeSchema(db2) {
  const tablesExist = checkTablesExist(db2);
  if (tablesExist) {
    return;
  }
  console.log("Initializing database schema...");
  db2.run(SCHEMA);
  console.log("Database schema initialized");
  if (process.env.SEED_DATABASE === "true") {
    console.log("Seeding database with test data...");
    db2.run(SEED);
    console.log("Database seeded");
  }
}
var SCHEMA, SEED;
var init_init = __esm({
  "src/db/init.ts"() {
    "use strict";
    SCHEMA = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT NOT NULL,
  state TEXT DEFAULT 'ReadyForDev' CHECK (state IN ('ReadyForDev', 'Done')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_state ON tasks(state);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
`;
    SEED = `
DELETE FROM tasks;
INSERT INTO tasks (id, category, title, description, steps, state) VALUES
('FEAT-001', 'feat', 'Initialize empty javascript project', 'Initialize empty javascript project using pnpm init', '["Use pnpm init to create a new typescript project", "Create index file that logs hello world", "Add dev script to package json that would node start this"]', 'ReadyForDev');
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
var TaskSchema, CreateTaskInputSchema, kanbanRouter;
var init_kanban = __esm({
  "../api/dist/routers/kanban.js"() {
    "use strict";
    init_trpc();
    TaskSchema = z2.object({
      id: z2.string(),
      title: z2.string(),
      status: z2.enum(["todo", "in_progress", "done"])
    });
    CreateTaskInputSchema = z2.object({
      category: z2.enum(["feat", "bug", "chore"]),
      title: z2.string().min(1),
      description: z2.string(),
      steps: z2.array(z2.string())
    });
    kanbanRouter = router({
      getTasks: publicProcedure.query(async ({ ctx }) => {
        return ctx.kanban.getTasks();
      }),
      createTask: publicProcedure.input(CreateTaskInputSchema).mutation(async ({ ctx, input }) => {
        return ctx.kanban.createTask(input);
      }),
      deleteAllTasks: publicProcedure.mutation(async ({ ctx }) => {
        return ctx.kanban.deleteAllTasks();
      })
    });
  }
});

// ../api/dist/routers/ralph.js
import { z as z3 } from "zod";
var RalphStatusSchema, ralphRouter;
var init_ralph = __esm({
  "../api/dist/routers/ralph.js"() {
    "use strict";
    init_trpc();
    RalphStatusSchema = z3.object({
      isRunning: z3.boolean()
    });
    ralphRouter = router({
      getStatus: publicProcedure.query(async ({ ctx }) => {
        return ctx.ralph.getStatus();
      }),
      start: publicProcedure.mutation(async ({ ctx }) => {
        return ctx.ralph.start();
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
function mapRowToApiTask(row) {
  return {
    id: row.id,
    title: row.title,
    status: mapStateToStatus(row.state)
  };
}
function createKanbanService(client) {
  return {
    async getTasks() {
      const result = client.exec("SELECT id, title, state FROM tasks ORDER BY created_at ASC");
      if (result.length === 0) {
        return [];
      }
      const columns = result[0].columns;
      const rows = result[0].values.map(
        (values) => Object.fromEntries(columns.map((col, i) => [col, values[i]]))
      );
      return rows.map(mapRowToApiTask);
    },
    async createTask(input) {
      const serverTask = createTask(client, input);
      return {
        id: serverTask.id,
        title: serverTask.title,
        status: mapStateToStatus(serverTask.state)
      };
    },
    async deleteAllTasks() {
      deleteAllTasks(client);
    }
  };
}
var init_trpc_service = __esm({
  "src/kanban/trpc-service.ts"() {
    "use strict";
    init_repository();
  }
});

// src/utils/process.ts
import { spawn as spawn2 } from "child_process";
function spawnProcess(command, args, options) {
  return new Promise((resolve, reject) => {
    const spawnOptions = {
      cwd: options?.cwd,
      env: options?.env,
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
function buildMcpConfig(workingDirectory) {
  const mcpPath = process.env.RALPHBAN_MCP_PATH;
  const mcpServer2 = mcpPath ? {
    type: "stdio",
    command: "node",
    args: [mcpPath, "--mcp", `--cwd=${workingDirectory}`]
  } : {
    type: "stdio",
    command: "npx",
    args: ["github:tomkis/ralphban", "--mcp", `--cwd=${workingDirectory}`]
  };
  return JSON.stringify({ mcpServers: { ralphban: mcpServer2 } });
}
async function runRalphLoop(workingDirectory) {
  return spawnProcess(
    "claude",
    [
      "--dangerously-skip-permissions",
      "--mcp-config",
      buildMcpConfig(workingDirectory),
      "-p",
      RALPH_PROMPT_TEMPLATE.trim()
    ],
    {
      cwd: workingDirectory,
      env: {
        ...process.env
      }
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
function createRalphService(cwd) {
  return {
    async getStatus() {
      return { isRunning };
    },
    async start() {
      if (isRunning) {
        return;
      }
      isRunning = true;
      runRalphLoop(cwd).finally(() => {
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
function createContext(db2, cwd) {
  return {
    kanban: createKanbanService(db2),
    ralph: createRalphService(cwd)
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
function createTrpcHandler(cwd) {
  return async (req, res) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") {
        headers[key] = value;
      }
    }
    const db2 = await createDbClient(cwd);
    const response = await fetchRequestHandler({
      endpoint: "/trpc",
      req: new Request(url, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? void 0 : JSON.stringify(req.body)
      }),
      router: appRouter,
      createContext: () => createContext(db2, cwd)
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
    init_client();
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
import path2 from "path";
import express from "express";
function createServer(config) {
  console.log("Starting server with config:", { cwd: config.cwd });
  const { cwd } = config;
  const port = config.port ?? parseInt(process.env.PORT ?? "3001", 10);
  const errorHandler = (err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
  };
  const app = express();
  app.use(express.json());
  app.all("/trpc/{*path}", createTrpcHandler(cwd));
  if (config.staticDir) {
    app.use(express.static(config.staticDir));
    app.get("{*path}", (_req, res) => {
      res.sendFile(path2.join(config.staticDir, "index.html"));
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
import fs2 from "fs";
import path3 from "path";
import { fileURLToPath } from "url";
async function shutdown2(signal) {
  console.log(`
Received ${signal}, shutting down...`);
  try {
    if (server) {
      await server.stop();
    }
    if (appDb) {
      appDb.close();
    }
    console.log("Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}
async function runHttpServer(cwd) {
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
  appDb = await createDbClient(cwd);
  try {
    initializeSchema(appDb);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database initialization failed:", message);
    appDb.close();
    process.exit(1);
  }
  const webDistInDir = path3.resolve(__dirname, "web-dist");
  const webDistInParent = path3.resolve(__dirname, "..", "web-dist");
  const webDistPath = fs2.existsSync(webDistInDir) ? webDistInDir : webDistInParent;
  server = createServer({ cwd, staticDir: webDistPath });
  await server.start();
  console.log("ralphban is ready");
}
var __dirname, server, appDb;
var init_cli = __esm({
  "src/cli.ts"() {
    "use strict";
    init_git_validation();
    init_init();
    init_client();
    init_server2();
    __dirname = path3.dirname(fileURLToPath(import.meta.url));
    server = null;
    appDb = null;
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
}).option("cwd", {
  type: "string",
  description: "Working directory for Ralph execution",
  default: process.cwd()
}).help().parse();
if (argv.mcp) {
  const { runMcpServer: runMcpServer2 } = await Promise.resolve().then(() => (init_mcp_cli(), mcp_cli_exports));
  await runMcpServer2(argv.cwd);
} else {
  const { runHttpServer: runHttpServer2 } = await Promise.resolve().then(() => (init_cli(), cli_exports));
  await runHttpServer2(argv.cwd);
}
