import { zodToJsonSchema } from 'zod-to-json-schema';
import { z } from 'zod';

export interface McpToolDefinition<T extends z.ZodSchema> {
  name: string;
  description: string;
  schema: T;
  execute: (args: z.infer<T>) => Promise<unknown>;
}

export function createMcpTool<T extends z.ZodSchema>(tool: McpToolDefinition<T>) {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: zodToJsonSchema(tool.schema),
    execute: async (rawArgs: unknown) => {
      const validatedArgs = tool.schema.parse(rawArgs);
      return tool.execute(validatedArgs);
    },
  };
}
