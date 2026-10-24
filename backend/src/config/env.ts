import "dotenv/config";

// Lee y valida las variables de entorno una sola vez; el resto del código importa `env`.
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ Falta la variable de entorno MONGODB_URI. Copia backend/.env.example a backend/.env y complétala.");
  process.exit(1);
}

export const env = {
  MONGODB_URI,
  PORT: Number(process.env.PORT) || 3000,
  // Admite varios orígenes separados por comas: "http://localhost:5173,https://mi-front.onrender.com"
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
