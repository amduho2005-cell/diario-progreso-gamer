import mongoose from "mongoose";

export async function conectarDB(uri: string): Promise<void> {
  await mongoose.connect(uri);
  console.log(`✅ Conectado a MongoDB (${mongoose.connection.name})`);
}
