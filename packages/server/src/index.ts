import "dotenv/config";
import express from "express";
import { createMCPServer } from "./mcp/server";
import { createDbClient } from "./db/client";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";

const app = express();
const PORT = 3001;

app.use(express.json());

const pool = createDbClient();

const mcpServer = createMCPServer(pool);
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
});

await mcpServer.connect(transport);

app.post("/mcp", async (req, res) => {
  await transport.handleRequest(req, res, req.body);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
