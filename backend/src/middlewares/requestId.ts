import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

// Un UUID por request: se guarda en res.locals y viaja al cliente en el header X-Request-Id.
export function requestId(_req: Request, res: Response, next: NextFunction) {
  const id = randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}
