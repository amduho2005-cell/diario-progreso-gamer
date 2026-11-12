import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import type { Hito } from "../dominio/progreso.js";

export interface Meta {
  videojuego: Types.ObjectId;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: Hito[];
  createdAt: Date;
  updatedAt: Date;
}

export type MetaDoc = HydratedDocument<Meta>;

// Embebido: lista corta (máx. 5) que solo tiene sentido dentro de su meta. "alcanzado" NO se guarda (H6).
const hitoSchema = new Schema<Hito>(
  {
    descripcion: { type: String, required: [true, "La descripción del hito es obligatoria"], trim: true },
    porcentajeObjetivo: {
      type: Number,
      required: [true, "El porcentaje objetivo es obligatorio"],
      min: [1, "El porcentaje objetivo debe ser al menos 1"],
      max: [100, "El porcentaje objetivo no puede ser mayor a 100"],
    },
  },
  { _id: false }
);

const metaSchema = new Schema<Meta>(
  {
    // Referencia (no embebido en Videojuego): ciclo de vida propio e historial de metas anteriores.
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "El videojuego es obligatorio"],
      index: true,
    },
    horasSemanales: {
      type: Number,
      required: [true, "Las horas por semana son obligatorias"],
      validate: { validator: (v: number) => v > 0, message: "Las horas por semana deben ser mayores que 0" },
      max: [100, "Las horas por semana no pueden ser más de 100"],
    },
    diasPorSemana: {
      type: Number,
      required: [true, "Los días por semana son obligatorios"],
      min: [1, "Los días por semana deben ser al menos 1"],
      max: [7, "Los días por semana no pueden ser más de 7"],
      validate: { validator: Number.isInteger, message: "Los días por semana deben ser un número entero" },
    },
    activa: { type: Boolean, default: true },
    hitos: {
      type: [hitoSchema],
      default: [],
      validate: { validator: (h: Hito[]) => h.length <= 5, message: "Una meta puede tener como máximo 5 hitos" },
    },
  },
  { timestamps: true }
);

// RN-1: como mucho una meta activa por videojuego, incluso con peticiones simultáneas (→ 409 en el errorHandler).
metaSchema.index({ videojuego: 1 }, { unique: true, partialFilterExpression: { activa: true } });

export const MetaModel = model<Meta>("Meta", metaSchema);
