import {
  CigaretteModel,
  LogCigaretteInput,
  LogCigaretteInputSchema,
  UpdateCigaretteInput,
  UpdateCigaretteInputSchema,
  QueryLogsInput,
  QueryLogsInputSchema,
  SummaryQueryInput,
  SummaryQueryInputSchema,
} from './cigarettes.schema';

export class CigarettesService {
  /**
   * Log a cigarette entry (defaults date to today if omitted/null)
   */
  async logCigarettes(rawInput: LogCigaretteInput) {
    const data = LogCigaretteInputSchema.parse(rawInput);
    const doc = await CigaretteModel.create(data);
    return doc.toObject();
  }

  /**
   * Retrieve logs for a single date OR date range
   */
  async getLogs(rawParams: QueryLogsInput) {
    const query = QueryLogsInputSchema.parse(rawParams);
    const filter: Record<string, any> = {};

    if (query.date) {
      const startOfDay = new Date(query.date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(query.date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      filter.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = query.startDate;
      if (query.endDate) filter.date.$lte = query.endDate;
    }

    return CigaretteModel.find(filter).sort({ date: -1 }).limit(query.limit).lean();
  }

  /**
   * Get summary aggregated count over custom range or preset periods
   */
  async getSummary(rawParams: SummaryQueryInput) {
    const query = SummaryQueryInputSchema.parse(rawParams);
    let fromDate = query.from;
    let toDate = query.to ?? new Date();

    if (query.period && !fromDate) {
      fromDate = new Date();
      switch (query.period) {
        case 'day':
          fromDate.setUTCHours(0, 0, 0, 0);
          break;
        case 'week':
          fromDate.setDate(fromDate.getDate() - 7);
          break;
        case 'month':
          fromDate.setMonth(fromDate.getMonth() - 1);
          break;
        case 'year':
          fromDate.setFullYear(fromDate.getFullYear() - 1);
          break;
      }
    }

    const matchStage: Record<string, any> = {};
    if (fromDate || toDate) {
      matchStage.date = {};
      if (fromDate) matchStage.date.$gte = fromDate;
      if (toDate) matchStage.date.$lte = toDate;
    }

    const result = await CigaretteModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCount: { $sum: '$count' },
          totalEntries: { $sum: 1 },
          firstLog: { $min: '$date' },
          lastLog: { $max: '$date' },
        },
      },
    ]);

    return {
      totalCount: result[0]?.totalCount ?? 0,
      totalEntries: result[0]?.totalEntries ?? 0,
      range: {
        from: fromDate ?? result[0]?.firstLog ?? null,
        to: toDate ?? result[0]?.lastLog ?? null,
      },
    };
  }

  /**
   * Update an existing record by ID
   */
  async updateLog(id: string, rawInput: UpdateCigaretteInput) {
    const updates = UpdateCigaretteInputSchema.parse(rawInput);
    const updated = await CigaretteModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();

    if (!updated) {
      throw new Error(`Cigarette log with ID ${id} not found`);
    }

    return updated;
  }
}
