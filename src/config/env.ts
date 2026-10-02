import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().default("mongodb://127.0.0.1:27017/life_management"),
  MCP_PATH: z.string().default("/mcp")
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
