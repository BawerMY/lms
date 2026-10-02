import { Router } from "express";
import { asyncHandler, getValidated, validate } from "../../utils/http.js";
import * as debtsService from "./debts.service.js";
import {
  addPaymentSchema,
  createDebtSchema,
  listDebtsQuerySchema,
  type AddPaymentInput,
  type CreateDebtInput,
  type ListDebtsQuery
} from "./debts.type.js";

export const debtsRouter = Router();

debtsRouter.get(
  "/",
  validate(listDebtsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const query = getValidated<ListDebtsQuery>(req, "query");
    res.json(await debtsService.listDebts(query));
  })
);

debtsRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    res.json(await debtsService.getBalancesSummary());
  })
);

debtsRouter.post(
  "/",
  validate(createDebtSchema, "body"),
  asyncHandler(async (req, res) => {
    const input = getValidated<CreateDebtInput>(req, "body");
    res.status(201).json(await debtsService.createDebt(input));
  })
);

debtsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await debtsService.getDebt(String(req.params.id)));
  })
);

debtsRouter.post(
  "/:id/payments",
  validate(addPaymentSchema, "body"),
  asyncHandler(async (req, res) => {
    const input = getValidated<AddPaymentInput>(req, "body");
    res.status(201).json(await debtsService.addPayment(String(req.params.id), input));
  })
);
