import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <header className="navbar">
      <NavLink to="/videojuegos" className="logo">
        <span aria-hidden="true">🎮</span> Diario Gamer
      </NavLink>
      <nav>
        <NavLink to="/videojuegos" end>Videojuegos</NavLink>
        <NavLink to="/partidas" end>Partidas</NavLink>
        <NavLink to="/partidas/nueva" className="btn btn-primario">+ Partida</NavLink>
      </nav>
    </header>
  );
}
