// Tests de docs/specs/deuda-fecha-partida.md (D1 y D2).
import { test } from "node:test";
import assert from "node:assert/strict";
import { errorFechaPartida } from "./fechaPartida.js";
import { diaEnEcuador } from "./progreso.js";

const HOY = "2026-11-11";

test("CA-D1.1 fecha con hora se rechaza", () => {
  assert.match(errorFechaPartida("2026-11-10T23:30", HOY) ?? "", /AAAA-MM-DD/);
  assert.match(errorFechaPartida("2026-11-10T23:30:00-05:00", HOY) ?? "", /AAAA-MM-DD/);
  assert.match(errorFechaPartida(1762819200000, HOY) ?? "", /AAAA-MM-DD/);
});

test("CA-D1.2 fecha de día válida se acepta (y una fecha imposible no)", () => {
  assert.equal(errorFechaPartida("2026-11-10", HOY), null);
  assert.match(errorFechaPartida("2026-02-30", HOY) ?? "", /no existe/);
  assert.match(errorFechaPartida("2026-13-01", HOY) ?? "", /no existe/);
});

test("CA-D2.1 fecha futura se rechaza", () => {
  assert.match(errorFechaPartida("2026-11-12", HOY) ?? "", /futura/);
});

test("CA-D2.2 hoy se acepta", () => {
  assert.equal(errorFechaPartida(HOY, HOY), null);
});

test("CA-D2.3 23:30 en Ecuador: el día siguiente sigue siendo futuro", () => {
  const hoyEcuador = diaEnEcuador(new Date("2026-11-12T04:30:00Z")); // 23:30 del 11 en Ecuador
  assert.equal(hoyEcuador, "2026-11-11");
  assert.match(errorFechaPartida("2026-11-12", hoyEcuador) ?? "", /futura/);
});
