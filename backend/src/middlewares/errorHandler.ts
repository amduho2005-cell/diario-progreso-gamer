import mongoose from "mongoose";
import type { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError, ReferenciaInexistenteError } from "../errors/errores.js";
import { env } from "../config/env.js";

interface CuerpoError {
  error: { tipo: string; mensaje: string; detalles?: unknown; requestId: string };
}

// 404 para cualquier ruta que no coincida con las definidas.
export function rutaNoEncontrada(req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}

// Manejador centralizado (último middleware). Siempre responde { error: { tipo, mensaje, detalles?, requestId } }.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const requestId: string = res.locals.requestId;
  const responder = (status: number, tipo: string, mensaje: string, detalles?: unknown) => {
    const cuerpo: CuerpoError = { error: { tipo, mensaje, requestId } };
    if (detalles !== undefined) cuerpo.error.detalles = detalles;
    res.status(status).json(cuerpo);
  };

  // 1. Validación de esquema → 400 con detalle por campo
  if (err instanceof mongoose.Error.ValidationError) {
    const detalles = Object.fromEntries(Object.entries(err.errors).map(([campo, e]) => [campo, e.message]));
    return responder(400, "ValidacionError", "Los datos enviados no son válidos", detalles);
  }

  // 2. Id mal formado → 400
  if (err instanceof mongoose.Error.CastError) {
    return responder(400, "IdInvalido", `El valor "${String(err.value)}" no es un id válido para "${err.path}"`);
  }

  // 3. Referencia inexistente / recurso no encontrado → 404
  if (err instanceof ReferenciaInexistenteError) {
    return responder(404, "ReferenciaInexistente", err.message);
  }
  if (err instanceof NotFoundError) {
    return responder(404, "NoEncontrado", err.message);
  }

  // Variantes de 400 propias: filtros de query o body con valores inválidos, JSON mal formado
  if (err instanceof BadRequestError) {
    return responder(400, "ValidacionError", err.message, err.detalles);
  }
  if (err instanceof SyntaxError && "body" in err) {
    return responder(400, "JsonInvalido", "El cuerpo de la petición no es JSON válido");
  }

  // 4. Error inesperado → 500 (el stack solo se expone fuera de producción)
  console.error(`[${requestId}]`, err);
  const detalles = env.NODE_ENV !== "production" && err instanceof Error ? { stack: err.stack } : undefined;
  return responder(500, "ErrorInterno", "Ocurrió un error inesperado en el servidor", detalles);
}
