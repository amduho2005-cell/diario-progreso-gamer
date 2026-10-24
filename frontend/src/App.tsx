import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ListaVideojuegos } from "./pages/ListaVideojuegos";
import { DetalleVideojuego } from "./pages/DetalleVideojuego";
import { FormVideojuego } from "./pages/FormVideojuego";
import { ListaPartidas } from "./pages/ListaPartidas";
import { NuevaPartida } from "./pages/NuevaPartida";
import { NoEncontrado } from "./pages/NoEncontrado";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Navigate to="/videojuegos" replace />} />
          <Route path="/videojuegos" element={<ListaVideojuegos />} />
          <Route path="/videojuegos/nuevo" element={<FormVideojuego />} />
          <Route path="/videojuegos/:id" element={<DetalleVideojuego />} />
          <Route path="/videojuegos/:id/editar" element={<FormVideojuego key="editar" />} />
          <Route path="/partidas" element={<ListaPartidas />} />
          <Route path="/partidas/nueva" element={<NuevaPartida />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
    </>
  );
}
