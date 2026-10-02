import { Router } from "express";
import { asyncHandler, getValidated, validate } from "../../utils/http.js";
import * as cigarettesService from "./cigarettes.service.js";
import {
  createCigaretteEntrySchema,
  listCigarettesQuerySchema,
  type CreateCigaretteEntryInput,
  type ListCigarettesQuery
} from "./cigarettes.type.js";

export const cigarettesRouter = Router();

cigarettesRouter.get(
  "/",
  validate(listCigarettesQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const query = getValidated<ListCigarettesQuery>(req, "query");
    res.json(await cigarettesService.listEntries(query));
  })
);

cigarettesRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    res.json(await cigarettesService.getSummary());
  })
);

cigarettesRouter.post(
  "/",
  validate(createCigaretteEntrySchema, "body"),
  asyncHandler(async (req, res) => {
    const input = getValidated<CreateCigaretteEntryInput>(req, "body");
    res.status(201).json(await cigarettesService.logCigarettes(input));
  })
);

cigarettesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await cigarettesService.getEntry(String(req.params.id)));
  })
);

cigarettesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await cigarettesService.deleteEntry(String(req.params.id));
    res.status(204).end();
  })
);
