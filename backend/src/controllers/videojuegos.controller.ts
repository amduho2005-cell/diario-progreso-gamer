import type { Request, Response } from "express";
import * as videojuegosService from "../services/videojuegos.service.js";

// Controladores delgados: leen la request, llaman al servicio y responden.
// Express 5 reenvía automáticamente al errorHandler cualquier error de una función async.

type ConId = Request<{ id: string }>;
type ConLogro = Request<{ id: string; logroId: string }>;

export async function listar(req: Request, res: Response) {
  res.json(await videojuegosService.listar(req.query));
}

export async function obtener(req: ConId, res: Response) {
  res.json(await videojuegosService.obtener(req.params.id));
}

export async function crear(req: Request, res: Response) {
  res.status(201).json(await videojuegosService.crear(req.body ?? {}));
}

export async function actualizar(req: ConId, res: Response) {
  res.json(await videojuegosService.actualizar(req.params.id, req.body ?? {}));
}

export async function eliminar(req: ConId, res: Response) {
  await videojuegosService.eliminar(req.params.id);
  res.status(204).end();
}

export async function agregarLogro(req: ConId, res: Response) {
  res.status(201).json(await videojuegosService.agregarLogro(req.params.id, req.body ?? {}));
}

export async function actualizarLogro(req: ConLogro, res: Response) {
  res.json(await videojuegosService.actualizarLogro(req.params.id, req.params.logroId, req.body?.obtenido));
}

export async function eliminarLogro(req: ConLogro, res: Response) {
  res.json(await videojuegosService.eliminarLogro(req.params.id, req.params.logroId));
}
