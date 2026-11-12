import mongoose from "mongoose";
import { env } from "../config/env.js";
import { conectarDB } from "../config/conexionDB.js";
import { VideojuegoModel } from "../models/videojuego.model.js";
import { PartidaModel } from "../models/partida.model.js";
import { MetaModel } from "../models/meta.model.js";
import { diaEnEcuador, sumarDias } from "../dominio/progreso.js";

const logros = (...nombres: string[]) => nombres.map((nombre, i) => ({ nombre, obtenido: i < 2 }));

async function seed() {
  await conectarDB(env.MONGODB_URI);

  // Limpia las colecciones antes de insertar.
  await Promise.all([PartidaModel.deleteMany({}), VideojuegoModel.deleteMany({}), MetaModel.deleteMany({})]);

  const [eldenRing, hades, civ, fifa, hollow] = await VideojuegoModel.create([
    {
      nombre: "Elden Ring",
      plataforma: "PC",
      genero: "rol",
      estado: "jugando",
      logros: logros("Derrotar a Margit", "Llegar a Liurnia", "Derrotar a Rennala", "Derrotar a Malenia", "Final de la Era de las Estrellas"),
    },
    {
      nombre: "Hades",
      plataforma: "Switch",
      genero: "accion",
      estado: "completado",
      logros: logros("Escapar del Tártaro", "Primera fuga", "Conocer a todos los dioses", "Final verdadero"),
    },
    {
      nombre: "Civilization VI",
      plataforma: "PC",
      genero: "estrategia",
      estado: "pausado",
      logros: logros("Victoria científica", "Victoria cultural", "Victoria por dominación"),
    },
    {
      nombre: "EA Sports FC 26",
      plataforma: "PlayStation",
      genero: "deportes",
      estado: "abandonado",
      logros: logros("Ganar la liga", "Marcar 100 goles", "Fichar a una estrella"),
    },
    {
      nombre: "Hollow Knight",
      plataforma: "Switch",
      genero: "accion",
      estado: "jugando",
      logros: logros("Derrotar al Falso Caballero", "Conseguir el Ala de Mariposa", "Derrotar a Hornet"),
    },
  ]);

  // E2 — Hollow Knight con fechas RELATIVAS a hoy (Ecuador) para que la demo siempre tenga progreso:
  // racha de 4 días hace una semana (rota) y racha actual de 2 (ayer y anteayer; hoy aún sin partida).
  const hoy = diaEnEcuador(new Date());
  const sesionesHollow: [number, number, number][] = [
    [-9, 60, 8], [-8, 45, 14], [-7, 90, 22], [-6, 30, 26], [-2, 75, 38], [-1, 50, 45],
  ];

  // Elden Ring: 8 partidas, 870 minutos = 14.5 h, última el 2026-10-02 con 67% → replica el ejemplo del README.
  const sesionesElden: [string, number, number, string][] = [
    ["2026-09-05", 90, 5, "Creación de personaje y Necrolimbo"],
    ["2026-09-08", 120, 12, "Primeras horas en Limgrave"],
    ["2026-09-12", 60, 18, "Muchas muertes contra Margit"],
    ["2026-09-15", 150, 28, "¡Margit derrotado!"],
    ["2026-09-19", 90, 37, "Castillo de Velo Tormentoso"],
    ["2026-09-23", 120, 46, "Llegada a Liurnia"],
    ["2026-09-28", 105, 58, "Academia de Raya Lucaria"],
    ["2026-10-02", 135, 67, "Rennala derrotada"],
  ];

  await PartidaModel.create([
    ...sesionesElden.map(([fecha, duracionMinutos, porcentajeAvance, notas]) => ({
      videojuego: eldenRing._id,
      fecha: new Date(fecha),
      duracionMinutos,
      porcentajeAvance,
      notas,
    })),
    { videojuego: hades._id, fecha: new Date("2026-08-10"), duracionMinutos: 45, porcentajeAvance: 40 },
    { videojuego: hades._id, fecha: new Date("2026-08-14"), duracionMinutos: 80, porcentajeAvance: 75 },
    { videojuego: hades._id, fecha: new Date("2026-08-20"), duracionMinutos: 95, porcentajeAvance: 100, notas: "¡Final verdadero!" },
    { videojuego: civ._id, fecha: new Date("2026-07-01"), duracionMinutos: 240, porcentajeAvance: 30 },
    ...sesionesHollow.map(([dias, duracionMinutos, porcentajeAvance]) => ({
      videojuego: hollow._id,
      fecha: new Date(sumarDias(hoy, dias)),
      duracionMinutos,
      porcentajeAvance,
    })),
  ]);

  const hitos = (...objetivos: [string, number][]) =>
    objetivos.map(([descripcion, porcentajeObjetivo]) => ({ descripcion, porcentajeObjetivo }));
  await MetaModel.create([
    { videojuego: hollow._id, horasSemanales: 5, diasPorSemana: 4, hitos: hitos(["Llegar al 25 %", 25], ["Llegar al 50 %", 50], ["Terminar el juego", 100]) },
    { videojuego: eldenRing._id, horasSemanales: 4, diasPorSemana: 3, hitos: hitos(["Mitad del juego", 50], ["Llegar a Leyndell", 75], ["Final", 100]) },
    // Historial: meta antigua de Hades, desactivada cuando se completó el juego (H7).
    { videojuego: hades._id, horasSemanales: 3, diasPorSemana: 3, activa: false, hitos: hitos(["Final verdadero", 100]) },
  ]);

  console.log(`🌱 Seed listo: 5 videojuegos (${fifa.nombre} sin partidas), 18 partidas y 3 metas (1 desactivada).`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("❌ Error en el seed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
