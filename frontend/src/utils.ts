import type { Estado, Genero } from "./types";

// Las fechas se guardan a medianoche UTC: se formatean en UTC para no "perder" un día por la zona horaria.
export const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export const hoyISO = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local

export const ETIQUETA_GENERO: Record<Genero, string> = {
  accion: "Acción",
  rol: "Rol",
  estrategia: "Estrategia",
  puzzle: "Puzzle",
  deportes: "Deportes",
  otro: "Otro",
};

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  jugando: "Jugando",
  pausado: "Pausado",
  completado: "Completado",
  abandonado: "Abandonado",
};

export const formatearMinutos = (min: number) =>
  min >= 60 ? `${Math.floor(min / 60)} h ${min % 60 ? `${min % 60} min` : ""}`.trim() : `${min} min`;
