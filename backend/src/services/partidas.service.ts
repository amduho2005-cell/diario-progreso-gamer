import mongoose from "mongoose";
import { PartidaModel, type Partida, type PartidaDoc } from "../models/partida.model.js";
import { VideojuegoModel } from "../models/videojuego.model.js";
import { BadRequestError, NotFoundError, ReferenciaInexistenteError } from "../errors/errores.js";

export interface Resumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

type PartidaParaResumen = Pick<Partida, "fecha" | "duracionMinutos" | "porcentajeAvance" | "createdAt">;

/**
 * Función pura (sin base de datos) que calcula el resumen de un videojuego a partir de sus partidas.
 * - totalPartidas: cantidad de partidas.
 * - horasTotales: se suman TODOS los minutos y se redondea a 1 decimal solo al final.
 * - ultimaPartida: la fecha más reciente (ISO).
 * - porcentajeAvanceActual: el avance de la partida más reciente; si dos tienen la misma fecha,
 *   gana la de createdAt más reciente (la que se registró después).
 * Con cero partidas devuelve todo en 0 y ultimaPartida = null.
 */
export function calcularResumen(partidas: PartidaParaResumen[]): Resumen {
  if (partidas.length === 0) {
    return { totalPartidas: 0, horasTotales: 0, ultimaPartida: null, porcentajeAvanceActual: 0 };
  }

  const minutosTotales = partidas.reduce((suma, p) => suma + p.duracionMinutos, 0);

  const masReciente = partidas.reduce((actual, p) => {
    const diferencia = p.fecha.getTime() - actual.fecha.getTime();
    if (diferencia !== 0) return diferencia > 0 ? p : actual;
    return p.createdAt.getTime() > actual.createdAt.getTime() ? p : actual; // desempate
  });

  return {
    totalPartidas: partidas.length,
    horasTotales: Math.round((minutosTotales / 60) * 10) / 10,
    ultimaPartida: masReciente.fecha.toISOString(),
    porcentajeAvanceActual: masReciente.porcentajeAvance,
  };
}

// ---------- Acceso a datos ----------

const CAMPOS = ["videojuego", "fecha", "duracionMinutos", "porcentajeAvance", "notas"] as const;

function camposPermitidos(datos: Record<string, unknown>): Partial<Partida> {
  return Object.fromEntries(CAMPOS.filter((c) => datos[c] !== undefined).map((c) => [c, datos[c]]));
}

// Valida en la capa de servicio que el videojuego referenciado exista.
async function validarReferencia(videojuegoId: unknown): Promise<void> {
  if (videojuegoId === undefined) return; // si falta, lo reporta la validación del esquema
  if (!mongoose.isValidObjectId(videojuegoId)) {
    throw new mongoose.Error.CastError("ObjectId", videojuegoId, "videojuego");
  }
  if (!(await VideojuegoModel.exists({ _id: videojuegoId }))) {
    throw new ReferenciaInexistenteError(`El videojuego referenciado (${String(videojuegoId)}) no existe`);
  }
}

async function verificarVideojuego(id: string): Promise<void> {
  if (!(await VideojuegoModel.exists({ _id: id }))) {
    throw new NotFoundError(`No existe un videojuego con id ${id}`);
  }
}

function parsearFecha(campo: string, valor: unknown): Date | undefined {
  if (valor === undefined || valor === "") return undefined;
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || isNaN(Date.parse(valor))) {
    throw new BadRequestError("Filtros inválidos", { [campo]: "Usa el formato YYYY-MM-DD" });
  }
  return new Date(`${valor}T00:00:00.000Z`);
}

export async function listar(filtros: { desde?: unknown; hasta?: unknown }): Promise<PartidaDoc[]> {
  const desde = parsearFecha("desde", filtros.desde);
  const hasta = parsearFecha("hasta", filtros.hasta);
  const fecha: Record<string, Date> = {};
  if (desde) fecha.$gte = desde;
  // "hasta" es inclusivo: todo el día indicado (menor que el inicio del día siguiente).
  if (hasta) fecha.$lt = new Date(hasta.getTime() + 24 * 60 * 60 * 1000);

  return PartidaModel.find(Object.keys(fecha).length ? { fecha } : {})
    .populate("videojuego")
    .sort({ fecha: -1, createdAt: -1 });
}

export async function obtener(id: string): Promise<PartidaDoc> {
  const partida = await PartidaModel.findById(id).populate("videojuego");
  if (!partida) throw new NotFoundError(`No existe una partida con id ${id}`);
  return partida;
}

export async function crear(datos: Record<string, unknown>): Promise<PartidaDoc> {
  await validarReferencia(datos.videojuego);
  const partida = await PartidaModel.create(camposPermitidos(datos));
  return partida.populate("videojuego");
}

export async function actualizar(id: string, datos: Record<string, unknown>): Promise<PartidaDoc> {
  await validarReferencia(datos.videojuego);
  const partida = await PartidaModel.findByIdAndUpdate(id, camposPermitidos(datos), {
    new: true,
    runValidators: true,
  }).populate("videojuego");
  if (!partida) throw new NotFoundError(`No existe una partida con id ${id}`);
  return partida;
}

export async function eliminar(id: string): Promise<void> {
  const partida = await PartidaModel.findByIdAndDelete(id);
  if (!partida) throw new NotFoundError(`No existe una partida con id ${id}`);
}

export async function listarPorVideojuego(videojuegoId: string): Promise<PartidaDoc[]> {
  await verificarVideojuego(videojuegoId);
  return PartidaModel.find({ videojuego: videojuegoId }).sort({ fecha: -1, createdAt: -1 });
}

// Se calcula en cada request (nunca se guarda): siempre refleja las partidas actuales.
export async function obtenerResumen(videojuegoId: string): Promise<Resumen> {
  await verificarVideojuego(videojuegoId);
  const partidas = await PartidaModel.find({ videojuego: videojuegoId })
    .select("fecha duracionMinutos porcentajeAvance createdAt")
    .lean();
  return calcularResumen(partidas);
}
