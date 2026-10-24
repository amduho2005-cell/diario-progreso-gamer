import type { NextFunction, Request, Response } from "express";

// Registra método, ruta, status, duración (ms) y requestId cuando la respuesta termina.
export function logger(req: Request, res: Response, next: NextFunction) {
  const inicio = performance.now();
  res.on("finish", () => {
    const ms = (performance.now() - inicio).toFixed(1);
    console.log(`[${res.locals.requestId}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
  });
  next();
}
