import { env } from "./config/env.js";
import { conectarDB } from "./config/conexionDB.js";
import { app } from "./app.js";

try {
  await conectarDB(env.MONGODB_URI);
  app.listen(env.PORT, () => console.log(`🎮 API escuchando en http://localhost:${env.PORT}`));
} catch (err) {
  console.error("❌ No se pudo conectar a MongoDB:", err);
  process.exit(1);
}
