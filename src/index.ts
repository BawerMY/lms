import { env } from "./config/env.js";
import { createApp } from "./rest/app.js";
import { connectDatabase, disconnectDatabase } from "./utils/database.js";

async function main(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const httpServer = app.listen(env.PORT, () => {
    console.log(`[rest] listening on http://localhost:${env.PORT}/api`);
    console.log(`[mcp]  streamable http on http://localhost:${env.PORT}${env.MCP_PATH}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[${signal}] shutting down...`);
    httpServer.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
