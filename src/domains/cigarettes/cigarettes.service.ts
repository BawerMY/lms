import { httpError } from "../../utils/http.js";
import {
  CigaretteEntryModel,
  type CigarettesSummary,
  type CreateCigaretteEntryInput,
  type ICigaretteEntry,
  type ListCigarettesQuery
} from "./cigarettes.type.js";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function logCigarettes(
  input: CreateCigaretteEntryInput
): Promise<ICigaretteEntry> {
  const date = input.date ?? today();
  return CigaretteEntryModel.create({ date, count: input.count, notes: input.notes });
}

export async function listEntries(query: ListCigarettesQuery): Promise<ICigaretteEntry[]> {
  const filter: Record<string, unknown> = {};
  if (query.from || query.to) {
    filter.date = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {})
    };
  }
  return CigaretteEntryModel.find(filter).sort({ date: -1 }).limit(query.limit).lean();
}

export async function getEntry(id: string): Promise<ICigaretteEntry> {
  const entry = await CigaretteEntryModel.findById(id).lean();
  if (!entry) throw httpError(404, `Cigarette entry ${id} not found`);
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const entry = await CigaretteEntryModel.findByIdAndDelete(id);
  if (!entry) throw httpError(404, `Cigarette entry ${id} not found`);
}

export async function getSummary(): Promise<CigarettesSummary> {
  const from = shiftDate(today(), 29);
  const entries = await CigaretteEntryModel.find({ date: { $gte: from } })
    .select("date count")
    .lean();

  const byDate = new Map(entries.map((e) => [e.date, e.count]));
  const total = (days: number) =>
    entries
      .filter((e) => e.date >= shiftDate(today(), days - 1))
      .reduce((sum, e) => sum + e.count, 0);

  let smokeFreeStreakDays = 0;
  for (let i = 0; i < 365; i++) {
    if ((byDate.get(shiftDate(today(), i)) ?? 0) > 0) break;
    smokeFreeStreakDays++;
  }

  const last7DaysTotal = total(7);
  return {
    today: byDate.get(today()) ?? 0,
    last7DaysTotal,
    last7DaysDailyAverage: Number((last7DaysTotal / 7).toFixed(2)),
    last30DaysTotal: total(30),
    smokeFreeStreakDays
  };
}
