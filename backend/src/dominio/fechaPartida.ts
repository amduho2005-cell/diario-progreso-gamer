// Validación pura de la fecha de una partida. Spec: docs/specs/deuda-fecha-partida.md.
// Devuelve null si es válida o el mensaje de error.

export function errorFechaPartida(valor: unknown, hoy: string): string | null {
  // D1: solo un día; con hora, la partida podría quedar en un día distinto al elegido (H3).
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return "La fecha debe ser un día con formato AAAA-MM-DD, sin hora";
  }
  const fecha = new Date(`${valor}T00:00:00Z`);
  if (isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    return `La fecha ${valor} no existe en el calendario`;
  }
  return null;
}
