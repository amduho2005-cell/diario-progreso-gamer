import { request } from "./client";
import type { Meta, MetaInput, ProgresoSemanal } from "../types";

export const metasApi = {
  obtenerProgreso: (videojuegoId: string) =>
    request<ProgresoSemanal>(`/videojuegos/${videojuegoId}/progreso-semanal`),
  listarPorVideojuego: (videojuegoId: string) => request<Meta[]>(`/videojuegos/${videojuegoId}/metas`),
  crear: (videojuegoId: string, datos: MetaInput) =>
    request<Meta>("/metas", { method: "POST", body: { ...datos, videojuego: videojuegoId } }),
  actualizar: (id: string, datos: MetaInput) => request<Meta>(`/metas/${id}`, { method: "PUT", body: datos }),
  desactivar: (id: string) => request<Meta>(`/metas/${id}/desactivar`, { method: "PATCH" }),
};
