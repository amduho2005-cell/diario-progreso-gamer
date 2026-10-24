import { request } from "./client";
import type { FiltrosVideojuego, PartidaDeJuego, Resumen, Videojuego, VideojuegoInput } from "../types";

export const videojuegosApi = {
  listar(filtros: FiltrosVideojuego = {}) {
    const params = new URLSearchParams(
      Object.entries(filtros).filter((par): par is [string, string] => Boolean(par[1])),
    );
    const query = params.toString();
    return request<Videojuego[]>(`/videojuegos${query ? `?${query}` : ""}`);
  },
  obtener: (id: string) => request<Videojuego>(`/videojuegos/${id}`),
  crear: (datos: VideojuegoInput) => request<Videojuego>("/videojuegos", { method: "POST", body: datos }),
  actualizar: (id: string, datos: VideojuegoInput) =>
    request<Videojuego>(`/videojuegos/${id}`, { method: "PUT", body: datos }),
  eliminar: (id: string) => request<void>(`/videojuegos/${id}`, { method: "DELETE" }),

  obtenerResumen: (id: string) => request<Resumen>(`/videojuegos/${id}/resumen`),
  obtenerPartidas: (id: string) => request<PartidaDeJuego[]>(`/videojuegos/${id}/partidas`),

  actualizarLogro: (id: string, logroId: string, obtenido: boolean) =>
    request<Videojuego>(`/videojuegos/${id}/logros/${logroId}`, { method: "PATCH", body: { obtenido } }),
  agregarLogro: (id: string, nombre: string) =>
    request<Videojuego>(`/videojuegos/${id}/logros`, { method: "POST", body: { nombre } }),
  eliminarLogro: (id: string, logroId: string) =>
    request<Videojuego>(`/videojuegos/${id}/logros/${logroId}`, { method: "DELETE" }),
};
