import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createCigaretteEntrySchema,
  listCigarettesQuerySchema,
  type CreateCigaretteEntryInput,
  type ListCigarettesQuery
} from "./cigarettes.type.js";
import * as cigarettesService from "./cigarettes.service.js";

const text = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }]
});

export function registerCigarettesMcp(server: McpServer): void {
  server.registerTool(
    "cigarettes_log",
    {
      title: "Log cigarette consumption",
      description: "Record how many cigarettes were smoked on a given day (defaults to today).",
      inputSchema: createCigaretteEntrySchema
    },
    async (args: CreateCigaretteEntryInput) => text(await cigarettesService.logCigarettes(args))
  );

  server.registerTool(
    "cigarettes_list",
    {
      title: "List cigarette entries",
      description: "List logged cigarette entries, optionally filtered by a date range.",
      inputSchema: listCigarettesQuerySchema
    },
    async (args: ListCigarettesQuery) => text(await cigarettesService.listEntries(args))
  );

  server.registerTool(
    "cigarettes_summary",
    {
      title: "Cigarette summary",
      description: "Get consumption summary: today's count, 7/30-day totals, daily average and smoke-free streak."
    },
    async () => text(await cigarettesService.getSummary())
  );

  server.registerResource(
    "cigarettes-summary",
    "lms://cigarettes/summary",
    {
      title: "Cigarettes summary",
      description: "Current cigarette consumption summary",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(await cigarettesService.getSummary(), null, 2)
        }
      ]
    })
  );
}
