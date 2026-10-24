import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export const GENEROS = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export const ESTADOS = ["jugando", "pausado", "completado", "abandonado"] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type Estado = (typeof ESTADOS)[number];

export interface Logro {
  _id: Types.ObjectId;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: Types.DocumentArray<Logro>;
  createdAt: Date;
  updatedAt: Date;
}

export type VideojuegoDoc = HydratedDocument<Videojuego>;

// Sub-schema propio: cada logro es un sub-documento embebido con su _id.
const logroSchema = new Schema<Logro>({
  nombre: { type: String, required: [true, "El nombre del logro es obligatorio"], trim: true },
  obtenido: { type: Boolean, default: false },
});

const videojuegoSchema = new Schema<Videojuego>(
  {
    nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true },
    plataforma: {
      type: String,
      required: [true, "La plataforma es obligatoria"],
      enum: { values: PLATAFORMAS, message: `Plataforma inválida. Valores: ${PLATAFORMAS.join(", ")}` },
    },
    genero: {
      type: String,
      required: [true, "El género es obligatorio"],
      enum: { values: GENEROS, message: `Género inválido. Valores: ${GENEROS.join(", ")}` },
    },
    estado: {
      type: String,
      required: true,
      default: "jugando",
      enum: { values: ESTADOS, message: `Estado inválido. Valores: ${ESTADOS.join(", ")}` },
    },
    logros: { type: [logroSchema], default: [] },
  },
  { timestamps: true }
);

export const VideojuegoModel = model<Videojuego>("Videojuego", videojuegoSchema);
