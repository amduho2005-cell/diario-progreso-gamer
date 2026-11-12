import type { Request, Response } from "express";
import * as metasService from "../services/metas.service.js";

type ConId = Request<{ id: string }>;

export async function crear(req: Request, res: Response) {
  res.status(201).json(await metasService.crear(req.body ?? {}));
}

export async function obtener(req: ConId, res: Response) {
  res.json(await metasService.obtener(req.params.id));
}

export async function actualizar(req: ConId, res: Response) {
  res.json(await metasService.actualizar(req.params.id, req.body ?? {}));
}

export async function desactivar(req: ConId, res: Response) {
  res.json(await metasService.desactivar(req.params.id));
}

// Rutas anidadas bajo /api/videojuegos/:id
export async function listarPorVideojuego(req: ConId, res: Response) {
  res.json(await metasService.listarPorVideojuego(req.params.id));
}
