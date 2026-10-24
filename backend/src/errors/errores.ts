// Recurso o referencia inexistente → el errorHandler lo traduce a 404.
export class NotFoundError extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = "NotFoundError";
  }
}

// Filtro de query inválido (ej. ?plataforma=Atari) → 400.
export class BadRequestError extends Error {
  constructor(mensaje: string, public detalles?: Record<string, string>) {
    super(mensaje);
    this.name = "BadRequestError";
  }
}
