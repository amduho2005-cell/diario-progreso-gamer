import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularResumen } from "./partidas.service.js";

const p = (fecha: string, duracionMinutos: number, porcentajeAvance: number, createdAt = fecha) => ({
  fecha: new Date(fecha),
  duracionMinutos,
  porcentajeAvance,
  createdAt: new Date(createdAt),
});

test("varias partidas: total, horas, última fecha y avance de la más reciente", () => {
  const resumen = calcularResumen([
    p("2026-09-20", 120, 30),
    p("2026-10-02", 90, 67),
    p("2026-09-28", 60, 50),
  ]);
  assert.deepEqual(resumen, {
    totalPartidas: 3,
    horasTotales: 4.5,
    ultimaPartida: "2026-10-02T00:00:00.000Z",
    porcentajeAvanceActual: 67,
  });
});

test("cero partidas no rompe", () => {
  assert.deepEqual(calcularResumen([]), {
    totalPartidas: 0,
    horasTotales: 0,
    ultimaPartida: null,
    porcentajeAvanceActual: 0,
  });
});

test("redondea a 1 decimal solo al final", () => {
  // 3 × 25 min = 75 min = 1.25 h → 1.3. Redondeando por partida (0.4 × 3) daría 1.2.
  assert.equal(calcularResumen([p("2026-10-01", 25, 1), p("2026-10-02", 25, 2), p("2026-10-03", 25, 3)]).horasTotales, 1.3);
  // 100 min = 1.666… h → 1.7
  assert.equal(calcularResumen([p("2026-10-01", 100, 10)]).horasTotales, 1.7);
});

test("desempate por createdAt cuando dos partidas tienen la misma fecha", () => {
  const resumen = calcularResumen([
    p("2026-10-02", 30, 40, "2026-10-02T10:00:00Z"),
    p("2026-10-02", 30, 45, "2026-10-02T18:00:00Z"),
    p("2026-10-01", 30, 99),
  ]);
  assert.equal(resumen.porcentajeAvanceActual, 45);
});
