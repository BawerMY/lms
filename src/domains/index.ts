import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Router } from "express";
import { cigarettesRouter } from "./cigarettes/cigarettes.rest.js";
import { registerCigarettesMcp } from "./cigarettes/cigarettes.mcp.js";
import { debtsRouter } from "./debts/debts.rest.js";
import { registerDebtsMcp } from "./debts/debts.mcp.js";

export interface Domain {
  name: string;
  router: Router;
  registerMcp: (server: McpServer) => void;
}

export const domains: Domain[] = [
  {
    name: "cigarettes",
    router: cigarettesRouter,
    registerMcp: registerCigarettesMcp
  },
  {
    name: "debts",
    router: debtsRouter,
    registerMcp: registerDebtsMcp
  }
];

// To add a new domain: create domains/<name>/<name>.{type,service,rest,mcp}.ts
// then register it here.
