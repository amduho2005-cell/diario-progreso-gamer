import type { Request, Response } from "express";
import * as partidasService from "../services/partidas.service.js";

type ConId = Request<{ id: string }>;

export async function listar(req: Request, res: Response) {
  res.json(await partidasService.listar(req.query));
}

export async function obtener(req: ConId, res: Response) {
  res.json(await partidasService.obtener(req.params.id));
}

export async function crear(req: Request, res: Response) {
  res.status(201).json(await partidasService.crear(req.body ?? {}));
}

export async function actualizar(req: ConId, res: Response) {
  res.json(await partidasService.actualizar(req.params.id, req.body ?? {}));
}

export async function eliminar(req: ConId, res: Response) {
  await partidasService.eliminar(req.params.id);
  res.status(204).end();
}

// Rutas anidadas bajo /api/videojuegos/:id
export async function listarPorVideojuego(req: ConId, res: Response) {
  res.json(await partidasService.listarPorVideojuego(req.params.id));
}

export async function resumen(req: ConId, res: Response) {
  res.json(await partidasService.obtenerResumen(req.params.id));
}
