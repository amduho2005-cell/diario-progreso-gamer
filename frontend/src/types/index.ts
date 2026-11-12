export const PLATAFORMAS = ["PC", "PlayStation", "Xbox", "Switch", "Movil"] as const;
export const GENEROS = ["accion", "rol", "estrategia", "puzzle", "deportes", "otro"] as const;
export const ESTADOS = ["jugando", "pausado", "completado", "abandonado"] as const;

export type Plataforma = (typeof PLATAFORMAS)[number];
export type Genero = (typeof GENEROS)[number];
export type Estado = (typeof ESTADOS)[number];

export interface Logro {
  _id: string;
  nombre: string;
  obtenido: boolean;
}

export interface Videojuego {
  _id: string;
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: Logro[];
  createdAt: string;
  updatedAt: string;
}

// Lo que se envía al crear/editar (los logros nuevos aún no tienen _id).
export interface VideojuegoInput {
  nombre: string;
  plataforma: Plataforma;
  genero: Genero;
  estado: Estado;
  logros: { _id?: string; nombre: string; obtenido: boolean }[];
}

export interface FiltrosVideojuego {
  plataforma?: Plataforma | "";
  genero?: Genero | "";
  estado?: Estado | "";
  nombre?: string;
}

// GET /partidas y /partidas/:id devuelven el videojuego poblado (populate).
export interface Partida {
  _id: string;
  videojuego: Videojuego | null; // null si el juego fue borrado (no debería pasar: hay borrado en cascada)
  fecha: string;
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

// GET /videojuegos/:id/partidas devuelve solo el id del videojuego.
export type PartidaDeJuego = Omit<Partida, "videojuego"> & { videojuego: string };

export interface PartidaInput {
  videojuego: string;
  fecha: string; // YYYY-MM-DD
  duracionMinutos: number;
  porcentajeAvance: number;
  notas?: string;
}

export interface Resumen {
  totalPartidas: number;
  horasTotales: number;
  ultimaPartida: string | null;
  porcentajeAvanceActual: number;
}

// ---------- E2 · Metas y rachas ----------

export interface Hito {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface Meta {
  _id: string;
  videojuego: string;
  horasSemanales: number;
  diasPorSemana: number;
  activa: boolean;
  hitos: Hito[];
  createdAt: string;
  updatedAt: string;
}

// "activa" no se envía: la desactivación es una acción aparte (NF-3).
export interface MetaInput {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: Hito[];
}

// Calculado SIEMPRE en el backend (GET /videojuegos/:id/progreso-semanal).
export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { _id: string; horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: (Hito & { alcanzado: boolean })[];
}

export interface ErrorApi {
  error: { tipo: string; mensaje: string; detalles?: Record<string, string>; requestId: string };
}
