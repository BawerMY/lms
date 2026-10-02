import { Schema, model } from "mongoose";
import { z } from "zod";

export const createDebtSchema = z.object({
  name: z.string().min(1).max(200),
  creditor: z.string().min(1).max(200).optional(),
  principal: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  notes: z.string().min(1).max(500).optional()
});

export const addPaymentSchema = z.object({
  amount: z.number().positive(),
  date: z.iso.date().optional(),
  note: z.string().min(1).max(500).optional()
});

export const listDebtsQuerySchema = z.object({
  includeSettled: z.coerce.boolean().default(false)
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type AddPaymentInput = z.infer<typeof addPaymentSchema>;
export type ListDebtsQuery = z.infer<typeof listDebtsQuerySchema>;

export interface IDebtPayment {
  amount: number;
  date: string;
  note?: string;
}

export interface IDebt {
  name: string;
  creditor?: string;
  principal: number;
  currency: string;
  notes?: string;
  payments: IDebtPayment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DebtView extends IDebt {
  paid: number;
  balance: number;
  settled: boolean;
}

const debtPaymentSchema = new Schema<IDebtPayment>(
  {
    amount: { type: Number, required: true, min: 1 },
    date: { type: String, required: true },
    note: { type: String }
  },
  { _id: false }
);

const debtSchema = new Schema<IDebt>(
  {
    name: { type: String, required: true },
    creditor: { type: String },
    principal: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, default: "USD" },
    notes: { type: String },
    payments: { type: [debtPaymentSchema], default: [] }
  },
  { timestamps: true, versionKey: false }
);

export const DebtModel = model<IDebt>("Debt", debtSchema);
