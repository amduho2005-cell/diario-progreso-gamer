import type { ErrorApi } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

// Error con el mensaje (y detalles por campo) que envía el backend.
export class ApiError extends Error {
  status: number;
  detalles?: Record<string, string>;

  constructor(mensaje: string, status: number, detalles?: Record<string, string>) {
    super(mensaje);
    this.name = "ApiError";
    this.status = status;
    this.detalles = detalles;
  }
}

export async function request<T>(ruta: string, opciones: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${ruta}`, {
      method: opciones.method ?? "GET",
      headers: opciones.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. ¿Está corriendo el backend?", 0);
  }

  if (res.status === 204) return undefined as T;
  const datos = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (datos as ErrorApi | null)?.error;
    throw new ApiError(error?.mensaje ?? `Error ${res.status}`, res.status, error?.detalles);
  }
  return datos as T;
}
