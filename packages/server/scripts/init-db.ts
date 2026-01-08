import { config } from "dotenv";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

config();

import { createDbClient } from "../src/db/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  const pool = createDbClient();
  const client = await pool.connect();

  try {
    console.log("Initializing database...");

    const schemaPath = join(__dirname, "../db/schema.sql");
    const seedPath = join(__dirname, "../db/seed.sql");

    const schema = readFileSync(schemaPath, "utf-8");
    const seed = readFileSync(seedPath, "utf-8");

    await client.query("BEGIN");

    console.log("Executing schema.sql...");
    await client.query(schema);

    console.log("Executing seed.sql...");
    await client.query(seed);

    await client.query("COMMIT");

    console.log("Database initialized successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
