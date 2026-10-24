import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { videojuegosApi } from "../api/videojuegosApi";
import { useCarga } from "../hooks/useCarga";
import { Cargando, MensajeError, Vacio } from "../components/Estados";
import { ESTADOS, GENEROS, PLATAFORMAS, type FiltrosVideojuego } from "../types";
import { ETIQUETA_ESTADO, ETIQUETA_GENERO } from "../utils";

export function ListaVideojuegos() {
  const [filtros, setFiltros] = useState<FiltrosVideojuego>({ plataforma: "", genero: "", estado: "", nombre: "" });
  const [nombre, setNombre] = useState("");

  // Espera 300 ms tras dejar de escribir antes de buscar por nombre.
  useEffect(() => {
    const t = setTimeout(() => setFiltros((f) => ({ ...f, nombre })), 300);
    return () => clearTimeout(t);
  }, [nombre]);

  const { datos: juegos, cargando, error, recargar } = useCarga(
    () => videojuegosApi.listar(filtros),
    [filtros.plataforma, filtros.genero, filtros.estado, filtros.nombre],
  );

  const cambiar = (campo: keyof FiltrosVideojuego) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));

  const hayFiltros = Boolean(filtros.plataforma || filtros.genero || filtros.estado || filtros.nombre);

  return (
    <section>
      <div className="cabecera">
        <h1>Mis videojuegos</h1>
        <Link to="/videojuegos/nuevo" className="btn btn-primario">+ Nuevo videojuego</Link>
      </div>

      <div className="filtros panel">
        <label>
          Buscar
          <input type="search" placeholder="Nombre…" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label>
          Plataforma
          <select value={filtros.plataforma} onChange={cambiar("plataforma")}>
            <option value="">Todas</option>
            {PLATAFORMAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>
          Género
          <select value={filtros.genero} onChange={cambiar("genero")}>
            <option value="">Todos</option>
            {GENEROS.map((g) => <option key={g} value={g}>{ETIQUETA_GENERO[g]}</option>)}
          </select>
        </label>
        <label>
          Estado
          <select value={filtros.estado} onChange={cambiar("estado")}>
            <option value="">Todos</option>
            {ESTADOS.map((e) => <option key={e} value={e}>{ETIQUETA_ESTADO[e]}</option>)}
          </select>
        </label>
      </div>

      {cargando && !juegos ? (
        <Cargando />
      ) : error ? (
        <MensajeError mensaje={error} onReintentar={recargar} />
      ) : !juegos?.length ? (
        <Vacio mensaje={hayFiltros ? "Ningún videojuego coincide con los filtros." : "Aún no tienes videojuegos."}>
          {!hayFiltros && <Link to="/videojuegos/nuevo" className="btn btn-primario">Agregar el primero</Link>}
        </Vacio>
      ) : (
        <ul className="grilla">
          {juegos.map((j) => {
            const obtenidos = j.logros.filter((l) => l.obtenido).length;
            return (
              <li key={j._id}>
                <Link to={`/videojuegos/${j._id}`} className="tarjeta">
                  <span className={`chip chip-${j.estado}`}>{ETIQUETA_ESTADO[j.estado]}</span>
                  <h2>{j.nombre}</h2>
                  <p className="meta">{j.plataforma} · {ETIQUETA_GENERO[j.genero]}</p>
                  <p className="meta">🏆 {obtenidos}/{j.logros.length} logros</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
