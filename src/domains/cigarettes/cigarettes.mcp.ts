import { z } from 'zod';
import { CigarettesService } from './cigarettes.service';
import {
  LogCigaretteInputSchema,
  UpdateCigaretteInputSchema,
  QueryLogsInputSchema,
  SummaryQueryInputSchema,
} from './cigarettes.schema';
import { createMcpTool } from '../../common/mcp/createTool';

export function getCigarettesMcpTools(service: CigarettesService) {
  return [
    createMcpTool({
      name: 'log_cigarettes',
      description: 'Log cigarette consumption. Leave date null or omitted for today.',
      schema: LogCigaretteInputSchema,
      execute: (args) => service.logCigarettes(args),
    }),

    createMcpTool({
      name: 'get_cigarette_logs',
      description: 'Get cigarette logs by single date or date range.',
      schema: QueryLogsInputSchema,
      execute: (args) => service.getLogs(args),
    }),

    createMcpTool({
      name: 'get_cigarette_summary',
      description: 'Get total cigarettes smoked over a period (day, week, month, year) or custom date range.',
      schema: SummaryQueryInputSchema,
      execute: (args) => service.getSummary(args),
    }),

    createMcpTool({
      name: 'update_cigarette_log',
      description: 'Update an existing cigarette entry count or timestamp by ID.',
      schema: z.object({
        id: z.string(),
        updates: UpdateCigaretteInputSchema,
      }),
      execute: ({ id, updates }) => service.updateLog(id, updates),
    }),
  ];
}
