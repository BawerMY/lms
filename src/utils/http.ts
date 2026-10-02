import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodType } from "zod";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function validate<T>(schema: ZodType<T>, source: "body" | "query" | "params") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      (req as any)[`validated${source}`] = schema.parse(req[source]);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function getValidated<T>(req: Request, source: "body" | "query" | "params"): T {
  return (req as any)[`validated${source}`] as T;
}

export function httpError(status: number, message: string): Error {
  return Object.assign(new Error(message), { status });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", issues: err.issues });
    return;
  }
  const status = (err as { status?: number }).status ?? 500;
  const message = err instanceof Error ? err.message : "Internal server error";
  if (status >= 500) console.error("[http]", err);
  res.status(status).json({ error: message });
}
