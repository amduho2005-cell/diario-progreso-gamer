import mongoose from "mongoose";
import { env } from "../config/env.js";
import { conectarDB } from "../config/conexionDB.js";
import { VideojuegoModel } from "../models/videojuego.model.js";
import { PartidaModel } from "../models/partida.model.js";

const logros = (...nombres: string[]) => nombres.map((nombre, i) => ({ nombre, obtenido: i < 2 }));

async function seed() {
  await conectarDB(env.MONGODB_URI);

  // Limpia las colecciones antes de insertar.
  await Promise.all([PartidaModel.deleteMany({}), VideojuegoModel.deleteMany({})]);

  const [eldenRing, hades, civ, fifa] = await VideojuegoModel.create([
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
  ]);

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
  ]);

  console.log(`🌱 Seed listo: 4 videojuegos (${fifa.nombre} sin partidas) y 12 partidas.`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("❌ Error en el seed:", err);
  await mongoose.disconnect();
  process.exit(1);
});
