import { useState } from "react";
import { Link } from "react-router-dom";
import { partidasApi } from "../api/partidasApi";
import { useCarga } from "../hooks/useCarga";
import { Cargando, MensajeError, Vacio } from "../components/Estados";
import { formatearFecha, formatearMinutos } from "../utils";

export function ListaPartidas() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const { datos: partidas, cargando, error, recargar } = useCarga(() => partidasApi.listar({ desde, hasta }), [desde, hasta]);

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta partida?")) return;
    setErrorAccion(null);
    try {
      await partidasApi.eliminar(id);
      recargar();
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "Error al eliminar");
    }
  }

  return (
    <section>
      <div className="cabecera">
        <h1>Mis partidas</h1>
        <Link to="/partidas/nueva" className="btn btn-primario">+ Nueva partida</Link>
      </div>

      <div className="filtros panel">
        <label>Desde<input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} /></label>
        <label>Hasta<input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} /></label>
        {(desde || hasta) && (
          <button className="btn" onClick={() => { setDesde(""); setHasta(""); }}>Limpiar</button>
        )}
      </div>

      {errorAccion && <MensajeError mensaje={errorAccion} />}

      {cargando && !partidas ? (
        <Cargando />
      ) : error ? (
        <MensajeError mensaje={error} onReintentar={recargar} />
      ) : !partidas?.length ? (
        <Vacio mensaje={desde || hasta ? "No hay partidas en ese rango de fechas." : "Aún no registras partidas."} />
      ) : (
        <ul className="lista-partidas panel">
          {partidas.map((p) => (
            <li key={p._id}>
              <div>
                {p.videojuego ? (
                  <Link to={`/videojuegos/${p.videojuego._id}`}><strong>{p.videojuego.nombre}</strong></Link>
                ) : (
                  <strong>(videojuego eliminado)</strong>
                )}
                <span className="meta"> · {formatearFecha(p.fecha)} · {formatearMinutos(p.duracionMinutos)} · {p.porcentajeAvance}%</span>
                {p.notas && <p className="notas">{p.notas}</p>}
              </div>
              <button className="btn btn-peligro btn-chico" onClick={() => eliminar(p._id)} aria-label="Eliminar partida">✕</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
