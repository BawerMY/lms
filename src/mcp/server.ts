import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Express, Request, Response } from "express";
import { env } from "../config/env.js";
import { domains } from "../domains/index.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "lms",
    version: "1.0.0"
  });

  for (const domain of domains) {
    domain.registerMcp(server);
  }

  return server;
}

// Stateless mode: a fresh server + transport per request.
export function attachMcpServer(app: Express): void {
  app.post(env.MCP_PATH, async (req: Request, res: Response) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    const server = createMcpServer();

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("[mcp]", err);
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" } });
      }
    }
  });

  const methodNotAllowed = (_req: Request, res: Response) => {
    res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" } });
  };
  app.get(env.MCP_PATH, methodNotAllowed);
  app.delete(env.MCP_PATH, methodNotAllowed);
}
