import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface Partida {
  videojuego: Types.ObjectId;
  fecha: Date;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PartidaDoc = HydratedDocument<Partida>;

const partidaSchema = new Schema<Partida>(
  {
    // Referencia (no embebido): las partidas crecen sin límite y se consultan por separado.
    videojuego: {
      type: Schema.Types.ObjectId,
      ref: "Videojuego",
      required: [true, "El videojuego es obligatorio"],
      index: true,
    },
    fecha: { type: Date, required: [true, "La fecha es obligatoria"] },
    duracionMinutos: {
      type: Number,
      required: [true, "La duración es obligatoria"],
      min: [1, "La duración debe ser de al menos 1 minuto"],
    },
    porcentajeAvance: {
      type: Number,
      required: [true, "El porcentaje de avance es obligatorio"],
      min: [0, "El avance no puede ser menor a 0"],
      max: [100, "El avance no puede ser mayor a 100"],
    },
    notas: { type: String, trim: true, maxlength: [500, "Las notas no pueden superar 500 caracteres"] },
  },
  { timestamps: true }
);

export const PartidaModel = model<Partida>("Partida", partidaSchema);
