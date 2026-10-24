import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { requestId } from "./middlewares/requestId.js";
import { logger } from "./middlewares/logger.js";
import { errorHandler, rutaNoEncontrada } from "./middlewares/errorHandler.js";
import { videojuegosRouter } from "./routes/videojuegos.routes.js";

export const app = express();

app.use(requestId);
app.use(logger);
app.use(cors({ origin: env.CORS_ORIGIN, exposedHeaders: ["X-Request-Id"] }));
app.use(express.json());

app.get("/api/salud", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/videojuegos", videojuegosRouter);

// Solo fuera de producción: ruta para comprobar manualmente el error 500.
if (env.NODE_ENV !== "production") {
  app.get("/api/debug/error", () => {
    throw new Error("Error de prueba para verificar el 500");
  });
}

app.use(rutaNoEncontrada);
app.use(errorHandler);
