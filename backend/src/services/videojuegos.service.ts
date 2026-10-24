import mongoose from "mongoose";
import {
  VideojuegoModel,
  PLATAFORMAS,
  GENEROS,
  ESTADOS,
  type Videojuego,
  type VideojuegoDoc,
} from "../models/videojuego.model.js";
import { PartidaModel } from "../models/partida.model.js";
import { NotFoundError, BadRequestError } from "../errors/errores.js";

export interface FiltrosVideojuego {
  plataforma?: unknown;
  genero?: unknown;
  estado?: unknown;
  nombre?: unknown;
}

// Solo estos campos se aceptan del cliente (evita que manden _id, createdAt, etc.).
function camposPermitidos(datos: Record<string, unknown>): Partial<Videojuego> {
  const { nombre, plataforma, genero, estado, logros } = datos;
  return Object.fromEntries(
    Object.entries({ nombre, plataforma, genero, estado, logros }).filter(([, v]) => v !== undefined)
  ) as Partial<Videojuego>;
}

function validarEnum(campo: string, valor: unknown, permitidos: readonly string[], errores: Record<string, string>) {
  if (valor === undefined || valor === "") return undefined;
  if (typeof valor !== "string" || !permitidos.includes(valor)) {
    errores[campo] = `Valor inválido "${String(valor)}". Valores permitidos: ${permitidos.join(", ")}`;
    return undefined;
  }
  return valor;
}

export async function listar(filtros: FiltrosVideojuego): Promise<VideojuegoDoc[]> {
  const errores: Record<string, string> = {};
  const consulta: Record<string, unknown> = {};

  const plataforma = validarEnum("plataforma", filtros.plataforma, PLATAFORMAS, errores);
  const genero = validarEnum("genero", filtros.genero, GENEROS, errores);
  const estado = validarEnum("estado", filtros.estado, ESTADOS, errores);
  if (Object.keys(errores).length) throw new BadRequestError("Filtros inválidos", errores);

  if (plataforma) consulta.plataforma = plataforma;
  if (genero) consulta.genero = genero;
  if (estado) consulta.estado = estado;
  if (typeof filtros.nombre === "string" && filtros.nombre.trim()) {
    // Búsqueda parcial e insensible a mayúsculas; se escapan caracteres especiales de regex.
    const texto = filtros.nombre.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    consulta.nombre = { $regex: texto, $options: "i" };
  }

  return VideojuegoModel.find(consulta).sort({ createdAt: -1 });
}

export async function obtener(id: string): Promise<VideojuegoDoc> {
  const juego = await VideojuegoModel.findById(id);
  if (!juego) throw new NotFoundError(`No existe un videojuego con id ${id}`);
  return juego;
}

export async function crear(datos: Record<string, unknown>): Promise<VideojuegoDoc> {
  return VideojuegoModel.create(camposPermitidos(datos));
}

export async function actualizar(id: string, datos: Record<string, unknown>): Promise<VideojuegoDoc> {
  const juego = await VideojuegoModel.findByIdAndUpdate(id, camposPermitidos(datos), {
    new: true,
    runValidators: true,
  });
  if (!juego) throw new NotFoundError(`No existe un videojuego con id ${id}`);
  return juego;
}

export async function eliminar(id: string): Promise<void> {
  const juego = await VideojuegoModel.findByIdAndDelete(id);
  if (!juego) throw new NotFoundError(`No existe un videojuego con id ${id}`);
  // Borrado en cascada: sin el juego, sus partidas quedarían como referencias huérfanas.
  await PartidaModel.deleteMany({ videojuego: id });
}

// ---------- Logros (sub-documentos embebidos) ----------

function buscarLogro(juego: VideojuegoDoc, logroId: string) {
  if (!mongoose.isValidObjectId(logroId)) {
    throw new mongoose.Error.CastError("ObjectId", logroId, "logroId");
  }
  const logro = juego.logros.id(logroId);
  if (!logro) throw new NotFoundError(`El videojuego no tiene un logro con id ${logroId}`);
  return logro;
}

export async function agregarLogro(id: string, datos: Record<string, unknown>): Promise<VideojuegoDoc> {
  const juego = await obtener(id);
  juego.logros.push({ nombre: datos.nombre, obtenido: datos.obtenido });
  return juego.save();
}

export async function actualizarLogro(id: string, logroId: string, obtenido: unknown): Promise<VideojuegoDoc> {
  if (typeof obtenido !== "boolean") {
    throw new BadRequestError("Datos inválidos", { obtenido: "Debe ser true o false" });
  }
  const juego = await obtener(id);
  buscarLogro(juego, logroId).obtenido = obtenido;
  return juego.save();
}

export async function eliminarLogro(id: string, logroId: string): Promise<VideojuegoDoc> {
  const juego = await obtener(id);
  buscarLogro(juego, logroId).deleteOne();
  return juego.save();
}
