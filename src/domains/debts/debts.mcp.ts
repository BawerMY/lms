import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  addPaymentSchema,
  createDebtSchema,
  listDebtsQuerySchema,
  type AddPaymentInput,
  type CreateDebtInput,
  type ListDebtsQuery
} from "./debts.type.js";
import * as debtsService from "./debts.service.js";
import { z } from "zod";

const text = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }]
});

export function registerDebtsMcp(server: McpServer): void {
  server.registerTool(
    "debts_list",
    {
      title: "List debts",
      description: "List all debts with computed paid amounts and balances.",
      inputSchema: listDebtsQuerySchema
    },
    async (args: ListDebtsQuery) => text(await debtsService.listDebts(args))
  );

  server.registerTool(
    "debts_create",
    {
      title: "Create a debt",
      description: "Record a new debt with a principal amount.",
      inputSchema: createDebtSchema
    },
    async (args: CreateDebtInput) => text(await debtsService.createDebt(args))
  );

  server.registerTool(
    "debts_add_payment",
    {
      title: "Add debt payment",
      description: "Record a payment against an existing debt.",
      inputSchema: addPaymentSchema.extend({ debtId: z.string().min(1) })
    },
    async ({ debtId, ...args }: AddPaymentInput & { debtId: string }) =>
      text(await debtsService.addPayment(debtId, args))
  );

  server.registerTool(
    "debts_summary",
    {
      title: "Debt balances summary",
      description: "Total principal, total paid, remaining balance and debt counts."
    },
    async () => text(await debtsService.getBalancesSummary())
  );

  server.registerResource(
    "debts-summary",
    "lms://debts/summary",
    {
      title: "Debts summary",
      description: "Aggregate debt balances",
      mimeType: "application/json"
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(await debtsService.getBalancesSummary(), null, 2)
        }
      ]
    })
  );
}
