import { Schema, model } from "mongoose";
import { z } from "zod";

export const createCigaretteEntrySchema = z.object({
  date: z.iso.date().optional(),
  count: z.number().int().min(1).max(200),
  notes: z.string().min(1).max(500).optional()
});

export const listCigarettesQuerySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  limit: z.coerce.number().int().positive().max(365).default(30)
});

export type CreateCigaretteEntryInput = z.infer<typeof createCigaretteEntrySchema>;
export type ListCigarettesQuery = z.infer<typeof listCigarettesQuerySchema>;

export interface ICigaretteEntry {
  date: string;
  count: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CigarettesSummary {
  today: number;
  last7DaysTotal: number;
  last7DaysDailyAverage: number;
  last30DaysTotal: number;
  smokeFreeStreakDays: number;
}

const cigaretteEntrySchema = new Schema<ICigaretteEntry>(
  {
    date: { type: String, required: true, index: true },
    count: { type: Number, required: true, min: 1 },
    notes: { type: String }
  },
  { timestamps: true, versionKey: false }
);

export const CigaretteEntryModel = model<ICigaretteEntry>("CigaretteEntry", cigaretteEntrySchema);
