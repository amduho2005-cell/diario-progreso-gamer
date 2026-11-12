import mongoose from "mongoose";
import { MetaModel, type Meta, type MetaDoc } from "../models/meta.model.js";
import { VideojuegoModel } from "../models/videojuego.model.js";
import { PartidaModel } from "../models/partida.model.js";
import { ConflictError, NotFoundError, ReferenciaInexistenteError } from "../errors/errores.js";
import { calcularResumen } from "./partidas.service.js";
import { calcularProgreso, type ProgresoSemanal } from "../dominio/progreso.js";

// N-4: "activa" no se acepta del cliente; se desactiva con su propio endpoint y no se reactiva.
function camposPermitidos(datos: Record<string, unknown>): Partial<Meta> {
  const { horasSemanales, diasPorSemana, hitos } = datos;
  return Object.fromEntries(
    Object.entries({ horasSemanales, diasPorSemana, hitos }).filter(([, v]) => v !== undefined)
  ) as Partial<Meta>;
}

async function verificarVideojuego(id: string): Promise<void> {
  if (!(await VideojuegoModel.exists({ _id: id }))) throw new NotFoundError(`No existe un videojuego con id ${id}`);
}

// D-12: id válido (400), juego existente (404), juego en curso o pausado (409), sin otra meta activa (409).
export async function crear(datos: Record<string, unknown>): Promise<MetaDoc> {
  const videojuegoId = datos.videojuego;
  if (videojuegoId !== undefined) {
    if (!mongoose.isValidObjectId(videojuegoId)) {
      throw new mongoose.Error.CastError("ObjectId", videojuegoId, "videojuego");
    }
    const juego = await VideojuegoModel.findById(videojuegoId).select("nombre estado");
    if (!juego) throw new ReferenciaInexistenteError(`El videojuego referenciado (${String(videojuegoId)}) no existe`);
    if (juego.estado === "completado" || juego.estado === "abandonado") {
      throw new ConflictError(
        `"${juego.nombre}" está ${juego.estado}: solo los juegos en curso o pausados pueden tener una meta activa`
      );
    }
    if (await MetaModel.exists({ videojuego: videojuegoId, activa: true })) {
      throw new ConflictError(`"${juego.nombre}" ya tiene una meta activa. Edítala o desactívala antes de crear otra.`);
    }
  }
  return MetaModel.create({ ...camposPermitidos(datos), videojuego: videojuegoId });
}

export async function obtener(id: string): Promise<MetaDoc> {
  const meta = await MetaModel.findById(id);
  if (!meta) throw new NotFoundError(`No existe una meta con id ${id}`);
  return meta;
}

export async function listarPorVideojuego(videojuegoId: string): Promise<MetaDoc[]> {
  await verificarVideojuego(videojuegoId);
  return MetaModel.find({ videojuego: videojuegoId }).sort({ createdAt: -1 });
}

export async function actualizar(id: string, datos: Record<string, unknown>): Promise<MetaDoc> {
  const meta = await obtener(id);
  if (!meta.activa) throw new ConflictError("La meta está desactivada: crea una meta nueva en lugar de editarla");
  meta.set(camposPermitidos(datos));
  return meta.save(); // save() corre todas las validaciones, incluido el máximo de 5 hitos
}

// Idempotente: desactivar una meta ya desactivada responde igual.
export async function desactivar(id: string): Promise<MetaDoc> {
  const meta = await MetaModel.findByIdAndUpdate(id, { activa: false }, { new: true });
  if (!meta) throw new NotFoundError(`No existe una meta con id ${id}`);
  return meta;
}

// ---------- Progreso semanal (T-08) ----------
// El servicio solo consulta; todo el cálculo lo hacen las funciones puras de src/dominio/progreso.ts.
export async function obtenerProgreso(videojuegoId: string): Promise<ProgresoSemanal> {
  await verificarVideojuego(videojuegoId);
  const [partidas, meta] = await Promise.all([
    PartidaModel.find({ videojuego: videojuegoId }).select("fecha duracionMinutos porcentajeAvance createdAt").lean(),
    MetaModel.findOne({ videojuego: videojuegoId, activa: true }).lean(), // D-9 / H4: la meta activa de ahora
  ]);
  const { porcentajeAvanceActual } = calcularResumen(partidas); // D-8: mismo avance que el resumen de E1
  return calcularProgreso({ partidas, meta, porcentajeAvanceActual, ahora: new Date() });
}
