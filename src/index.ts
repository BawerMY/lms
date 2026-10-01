import 'dotenv/config';
import express from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { connectDatabase } from './common/database';
import { buildContainer } from './services';
import { createCigarettesRouter } from './domains/cigarettes/cigarettes.rest';
import { getCigarettesMcpTools } from './domains/cigarettes/cigarettes.mcp';

async function bootstrap() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/life_management';
  const PORT = process.env.PORT || 3000;

  await connectDatabase(MONGO_URI);
  const container = buildContainer();

  // 1. Setup Express REST API
  const app = express();
  app.use(express.json());
  app.use('/api/cigarettes', createCigarettesRouter(container.cigarettes));

  app.listen(PORT, () => {
    console.log(`REST Server running on http://localhost:${PORT}`);
  });

  // 2. Setup MCP Server
  const mcpToolsList = [
    ...getCigarettesMcpTools(container.cigarettes),
  ];

  const mcpServer = new Server(
    { name: 'life-management-mcp', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: mcpToolsList.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema as any,
    })),
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = mcpToolsList.find((t) => t.name === request.params.name);
    if (!tool) throw new Error(`Tool ${request.params.name} not found`);

    const result = await tool.execute(request.params.arguments);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  });

  const stdioTransport = new StdioServerTransport();
  await mcpServer.connect(stdioTransport);
}

bootstrap().catch(console.error);
