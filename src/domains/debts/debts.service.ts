import { httpError } from "../../utils/http.js";
import {
  DebtModel,
  type AddPaymentInput,
  type CreateDebtInput,
  type DebtView,
  type IDebt,
  type ListDebtsQuery
} from "./debts.type.js";

function toView(debt: IDebt): DebtView {
  const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    ...debt,
    payments: debt.payments,
    paid: Number(paid.toFixed(2)),
    balance: Number((debt.principal - paid).toFixed(2)),
    settled: paid >= debt.principal
  };
}

export async function createDebt(input: CreateDebtInput): Promise<DebtView> {
  const debt = await DebtModel.create(input);
  return toView(debt);
}

export async function listDebts(query: ListDebtsQuery): Promise<DebtView[]> {
  const debts = await DebtModel.find().sort({ createdAt: -1 }).lean();
  const views = debts.map((d) => toView(d as IDebt));
  return query.includeSettled ? views : views.filter((d) => !d.settled);
}

export async function getDebt(id: string): Promise<DebtView> {
  const debt = await DebtModel.findById(id).lean<IDebt | null>();
  if (!debt) throw httpError(404, `Debt ${id} not found`);
  return toView(debt);
}

export async function addPayment(id: string, input: AddPaymentInput): Promise<DebtView> {
  const debt = await DebtModel.findById(id);
  if (!debt) throw httpError(404, `Debt ${id} not found`);

  const paid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
  if (input.amount > debt.principal - paid) {
    throw httpError(400, `Payment ${input.amount} exceeds remaining balance ${debt.principal - paid}`);
  }

  debt.payments.push({
    amount: input.amount,
    date: input.date ?? new Date().toISOString().slice(0, 10),
    note: input.note
  });
  await debt.save();
  return toView(debt);
}

export async function getBalancesSummary(): Promise<{
  totalPrincipal: number;
  totalPaid: number;
  totalBalance: number;
  activeDebts: number;
  settledDebts: number;
}> {
  const views = (await DebtModel.find().lean()).map((d) => toView(d as IDebt));
  return {
    totalPrincipal: Number(views.reduce((s, d) => s + d.principal, 0).toFixed(2)),
    totalPaid: Number(views.reduce((s, d) => s + d.paid, 0).toFixed(2)),
    totalBalance: Number(views.reduce((s, d) => s + Math.max(d.balance, 0), 0).toFixed(2)),
    activeDebts: views.filter((d) => !d.settled).length,
    settledDebts: views.filter((d) => d.settled).length
  };
}
