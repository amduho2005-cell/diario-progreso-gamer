import { Link } from "react-router-dom";

export function NoEncontrado() {
  return (
    <section className="estado">
      <p className="game-over">GAME OVER</p>
      <h1>404 · Esta pantalla no existe</h1>
      <Link to="/videojuegos" className="btn btn-primario">Continuar ▶</Link>
    </section>
  );
}
