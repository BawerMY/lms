import express from "express";
import { domains } from "../domains/index.js";
import { attachMcpServer } from "../mcp/server.js";
import { errorMiddleware } from "../utils/http.js";

export function createApp(): express.Express {
  const app = express();

  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  for (const domain of domains) {
    app.use(`/api/${domain.name}`, domain.router);
  }

  attachMcpServer(app);

  app.use(errorMiddleware);
  return app;
}
