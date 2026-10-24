import { request } from "./client";
import type { Partida, PartidaInput } from "../types";

export const partidasApi = {
  listar(filtros: { desde?: string; hasta?: string } = {}) {
    const params = new URLSearchParams(
      Object.entries(filtros).filter((par): par is [string, string] => Boolean(par[1])),
    );
    const query = params.toString();
    return request<Partida[]>(`/partidas${query ? `?${query}` : ""}`);
  },
  crear: (datos: PartidaInput) => request<Partida>("/partidas", { method: "POST", body: datos }),
  eliminar: (id: string) => request<void>(`/partidas/${id}`, { method: "DELETE" }),
};
