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

export interface ErrorApi {
  error: { tipo: string; mensaje: string; detalles?: Record<string, string>; requestId: string };
}
