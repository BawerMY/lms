import { z } from 'zod';
import { Schema, model } from 'mongoose';

// 1. Base date transformer
const dateInput = z
  .union([z.string(), z.date()])
  .transform((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) throw new Error('Invalid date format');
    return d;
  });

// 2. Core Domain Data Schema (Zod Source of Truth)
export const CigaretteLogSchema = z.object({
  date: dateInput.default(() => new Date()),
  count: z.number().int().positive('Count must be at least 1'),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

// 3. API Request DTO Schemas
export const LogCigaretteInputSchema = z.object({
  date: dateInput.optional().nullable().transform((val) => val ?? new Date()),
  count: z.number().int().positive('Count must be at least 1'),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateCigaretteInputSchema = z.object({
  date: dateInput.optional(),
  count: z.number().int().positive().optional(),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

export const QueryLogsInputSchema = z.object({
  date: dateInput.optional(),
  startDate: dateInput.optional(),
  endDate: dateInput.optional(),
  limit: z.coerce.number().int().positive().default(50),
});

export const SummaryQueryInputSchema = z.object({
  from: dateInput.optional(),
  to: dateInput.optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
});

// 4. Inferred TypeScript Types
export type LogCigaretteInput = z.infer<typeof LogCigaretteInputSchema>;
export type UpdateCigaretteInput = z.infer<typeof UpdateCigaretteInputSchema>;
export type QueryLogsInput = z.infer<typeof QueryLogsInputSchema>;
export type SummaryQueryInput = z.infer<typeof SummaryQueryInputSchema>;

export interface CigaretteLog extends z.infer<typeof CigaretteLogSchema> {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 5. Native Mongoose Schema
const mongooseSchema = new Schema<CigaretteLog>(
  {
    date: { type: Date, required: true, default: Date.now },
    count: { type: Number, required: true, min: 1 },
    brand: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

mongooseSchema.index({ date: -1 });

// 6. Export Mongoose Model
export const CigaretteModel = model<CigaretteLog>('CigaretteLog', mongooseSchema);
