// Tests de la spec docs/specs/backend-metas-progreso.md §4. Un test por criterio verificable sin base de datos.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calcularHitos,
  calcularProgreso,
  calcularRachas,
  diaDePartida,
  diaEnEcuador,
  semanaDe,
} from "./progreso.js";
import { calcularResumen } from "../services/partidas.service.js";

// "Hoy" fijo: miércoles 2026-11-11 a las 12:00 en Ecuador (UTC-5).
const AHORA = new Date("2026-11-11T17:00:00Z");
const HOY = "2026-11-11";

// Las partidas se guardan a medianoche UTC del día elegido (igual que en la API).
const p = (dia: string, duracionMinutos = 60, porcentajeAvance = 0) => ({
  fecha: new Date(`${dia}T00:00:00.000Z`),
  duracionMinutos,
  porcentajeAvance,
  createdAt: new Date(`${dia}T12:00:00.000Z`),
});

const meta = (horasSemanales: number, diasPorSemana = 4, hitos: { descripcion: string; porcentajeObjetivo: number }[] = []) => ({
  horasSemanales,
  diasPorSemana,
  hitos,
});

const progreso = (partidas: ReturnType<typeof p>[], m: ReturnType<typeof meta> | null, avance = 0) =>
  calcularProgreso({ partidas, meta: m, porcentajeAvanceActual: avance, ahora: AHORA });

// ---------- Semana (HU-4) ----------

test("CA-4.1 semana de lunes a domingo", () => {
  assert.deepEqual(semanaDe(HOY), { inicio: "2026-11-09", fin: "2026-11-15" });
  assert.deepEqual(progreso([], null).semana, { inicio: "2026-11-09", fin: "2026-11-15" });
});

test("CA-4.2 domingo 23:30 en Ecuador sigue en la misma semana; lunes empieza otra", () => {
  const domingoNoche = new Date("2026-11-16T04:30:00Z"); // ya es lunes en UTC
  assert.equal(diaEnEcuador(domingoNoche), "2026-11-15");
  assert.deepEqual(semanaDe(diaEnEcuador(domingoNoche)), { inicio: "2026-11-09", fin: "2026-11-15" });
  assert.deepEqual(semanaDe("2026-11-16"), { inicio: "2026-11-16", fin: "2026-11-22" });
  assert.deepEqual(semanaDe("2026-11-09"), { inicio: "2026-11-09", fin: "2026-11-15" });
});

test("CA-4.3 horas solo de la semana actual", () => {
  const r = progreso([p("2026-11-09", 70), p("2026-11-10", 70), p("2026-11-11", 70), p("2026-11-05", 120)], meta(5));
  assert.equal(r.horasSemana, 3.5);
});

test("D-3 las horas se redondean a 1 decimal solo al final", () => {
  // 3 × 25 min = 75 min = 1.25 h → 1.3 (redondeando por partida daría 1.2)
  assert.equal(progreso([p("2026-11-09", 25), p("2026-11-10", 25), p("2026-11-11", 25)], null).horasSemana, 1.3);
});

test("CA-4.4 porcentaje 70", () => {
  const r = progreso([p("2026-11-09", 70), p("2026-11-10", 70), p("2026-11-11", 70)], meta(5));
  assert.equal(r.porcentajeHoras, 70);
});

test("CA-4.5 porcentaje 140 sin límite", () => {
  const r = progreso([p("2026-11-09", 240), p("2026-11-10", 180)], meta(5));
  assert.equal(r.horasSemana, 7);
  assert.equal(r.porcentajeHoras, 140);
});

test("CA-4.6 dos partidas el mismo día cuentan un día", () => {
  const r = progreso([p("2026-11-09"), p("2026-11-09"), p("2026-11-10")], meta(5));
  assert.equal(r.diasJugadosSemana, 2);
});

test("CA-4.7 sin meta: meta y porcentaje null, pero sí horas, días y rachas", () => {
  const r = progreso([p("2026-11-10", 90), p("2026-11-11", 30)], null);
  assert.equal(r.meta, null);
  assert.equal(r.porcentajeHoras, null);
  assert.deepEqual(r.hitos, []);
  assert.equal(r.horasSemana, 2);
  assert.equal(r.diasJugadosSemana, 2);
  assert.equal(r.rachaActual, 2);
});

test("CA-4.8 sin partidas todo en 0", () => {
  const r = progreso([], meta(5, 4, [{ descripcion: "Mitad", porcentajeObjetivo: 50 }]));
  assert.equal(r.horasSemana, 0);
  assert.equal(r.porcentajeHoras, 0);
  assert.equal(r.diasJugadosSemana, 0);
  assert.equal(r.rachaActual, 0);
  assert.equal(r.mejorRacha, 0);
  assert.equal(r.hitos[0].alcanzado, false);
});

test("CA-4.10 la partida pertenece al día registrado (sin convertir de zona)", () => {
  // Guardada a medianoche UTC del lunes 9: en hora de Ecuador serían las 19:00 del domingo 8.
  assert.equal(diaDePartida(new Date("2026-11-09T00:00:00.000Z")), "2026-11-09");
  const r = progreso([p("2026-11-09", 120), p("2026-11-08", 60)], meta(5));
  assert.equal(r.horasSemana, 2); // la del domingo 8 es de la semana pasada
  assert.equal(r.diasJugadosSemana, 1);
});

test("CA-3.1 se usa la meta actual (cambio a mitad de semana)", () => {
  const partidas = [p("2026-11-09", 70), p("2026-11-10", 70), p("2026-11-11", 70)];
  assert.equal(progreso(partidas, meta(5)).porcentajeHoras, 70);
  assert.equal(progreso(partidas, meta(7)).porcentajeHoras, 50);
});

test("la respuesta incluye la meta con horas y días", () => {
  const r = progreso([], meta(5, 4));
  assert.equal(r.meta?.horasSemanales, 5);
  assert.equal(r.meta?.diasPorSemana, 4);
});

// ---------- Rachas (HU-5) ----------

test("CA-5.1 hoy sin partida y ayer sí: la racha sigue viva", () => {
  assert.deepEqual(calcularRachas(["2026-11-10", "2026-11-09", "2026-11-08"], HOY), { rachaActual: 3, mejorRacha: 3 });
});

test("CA-5.2 partidas hoy y ayer", () => {
  assert.equal(calcularRachas(["2026-11-11", "2026-11-10"], HOY).rachaActual, 2);
});

test("CA-5.3 última partida anteayer: racha 0", () => {
  assert.deepEqual(calcularRachas(["2026-11-09"], HOY), { rachaActual: 0, mejorRacha: 1 });
});

test("CA-5.4 racha rota: mejor 4, actual 2", () => {
  const dias = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-10", "2026-11-11"];
  assert.deepEqual(calcularRachas(dias, HOY), { rachaActual: 2, mejorRacha: 4 });
});

test("CA-5.5 tres partidas el mismo día suman 1", () => {
  assert.deepEqual(calcularRachas(["2026-11-11", "2026-11-11", "2026-11-11"], HOY), { rachaActual: 1, mejorRacha: 1 });
});

test("CA-5.6 la racha cruza de semana (domingo, lunes, martes)", () => {
  assert.equal(calcularRachas(["2026-11-08", "2026-11-09", "2026-11-10"], HOY).rachaActual, 3);
});

test("la racha cruza de mes", () => {
  assert.equal(calcularRachas(["2026-10-30", "2026-10-31", "2026-11-01"], "2026-11-01").rachaActual, 3);
});

test("N-3 días futuros no cuentan en racha ni en horas", () => {
  assert.deepEqual(calcularRachas(["2026-11-11", "2026-11-12", "2026-11-13"], HOY), { rachaActual: 1, mejorRacha: 1 });
  assert.equal(progreso([p("2026-11-11", 60), p("2026-11-13", 600)], null).horasSemana, 1);
});

test("rachas calculadas desde las partidas en calcularProgreso", () => {
  const r = progreso([p("2026-11-01"), p("2026-11-02"), p("2026-11-03"), p("2026-11-04"), p("2026-11-10"), p("2026-11-11")], null);
  assert.equal(r.rachaActual, 2);
  assert.equal(r.mejorRacha, 4);
});

// ---------- Hitos (HU-2) ----------

const hitos = [
  { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
  { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 },
  { descripcion: "Terminar el juego", porcentajeObjetivo: 100 },
];

test("CA-2.1 avance 67: 25 y 50 alcanzados, 100 no", () => {
  assert.deepEqual(
    calcularHitos(hitos, 67).map((h) => h.alcanzado),
    [true, true, false],
  );
  assert.deepEqual(calcularHitos(hitos, 67)[0], { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25, alcanzado: true });
});

test("CA-2.2 avance exactamente igual al objetivo cuenta como alcanzado", () => {
  assert.equal(calcularHitos(hitos, 50)[1].alcanzado, true);
});

test("CA-2.3 una partida más reciente con menos avance des-alcanza el hito", () => {
  const partidas = [p("2026-11-09", 60, 50), p("2026-11-10", 60, 40)];
  const avance = calcularResumen(partidas).porcentajeAvanceActual; // regla de E1: la más reciente
  assert.equal(avance, 40);
  assert.equal(progreso(partidas, meta(5, 4, hitos), avance).hitos[1].alcanzado, false);
});

test("CA-2.5 sin partidas ningún hito alcanzado", () => {
  const avance = calcularResumen([]).porcentajeAvanceActual;
  assert.ok(progreso([], meta(5, 4, hitos), avance).hitos.every((h) => !h.alcanzado));
});
