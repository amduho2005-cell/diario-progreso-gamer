import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { videojuegosApi } from "../api/videojuegosApi";
import { partidasApi } from "../api/partidasApi";
import { useCarga } from "../hooks/useCarga";
import { Cargando, MensajeError, Vacio } from "../components/Estados";
import { BarraProgreso } from "../components/BarraProgreso";
import { ETIQUETA_ESTADO, ETIQUETA_GENERO, formatearFecha, formatearMinutos } from "../utils";

export function DetalleVideojuego() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  const juego = useCarga(() => videojuegosApi.obtener(id), [id]);
  // El resumen SIEMPRE lo calcula el backend; aquí solo se pide y se vuelve a pedir tras cada cambio.
  const resumen = useCarga(() => videojuegosApi.obtenerResumen(id), [id]);
  const partidas = useCarga(() => videojuegosApi.obtenerPartidas(id), [id]);

  async function accion(fn: () => Promise<void>) {
    setErrorAccion(null);
    try {
      await fn();
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  const toggleLogro = (logroId: string, obtenido: boolean) =>
    accion(async () => {
      juego.setDatos(await videojuegosApi.actualizarLogro(id, logroId, obtenido));
      resumen.recargar();
    });

  const eliminarPartida = (partidaId: string) =>
    accion(async () => {
      if (!confirm("¿Eliminar esta partida?")) return;
      await partidasApi.eliminar(partidaId);
      await Promise.all([partidas.recargar(), resumen.recargar()]);
    });

  const eliminarJuego = () =>
    accion(async () => {
      if (!confirm(`¿Eliminar "${juego.datos?.nombre}" y todas sus partidas?`)) return;
      await videojuegosApi.eliminar(id);
      navigate("/videojuegos");
    });

  if (juego.cargando && !juego.datos) return <Cargando texto="Cargando videojuego…" />;
  if (juego.error || !juego.datos) return <MensajeError mensaje={juego.error ?? "No encontrado"} onReintentar={juego.recargar} />;

  const j = juego.datos;
  const obtenidos = j.logros.filter((l) => l.obtenido).length;

  return (
    <section>
      <Link to="/videojuegos" className="volver">← Volver</Link>
      <div className="cabecera">
        <div>
          <span className={`chip chip-${j.estado}`}>{ETIQUETA_ESTADO[j.estado]}</span>
          <h1>{j.nombre}</h1>
          <p className="meta">{j.plataforma} · {ETIQUETA_GENERO[j.genero]}</p>
        </div>
        <div className="acciones">
          <Link to={`/videojuegos/${id}/editar`} className="btn">Editar</Link>
          <button className="btn btn-peligro" onClick={eliminarJuego}>Eliminar</button>
        </div>
      </div>

      {errorAccion && <MensajeError mensaje={errorAccion} />}

      <div className="columnas">
        <article className="panel resumen">
          <h2>📊 Resumen</h2>
          {resumen.cargando && !resumen.datos ? (
            <Cargando texto="Calculando…" />
          ) : resumen.error || !resumen.datos ? (
            <MensajeError mensaje={resumen.error ?? "Sin datos"} onReintentar={resumen.recargar} />
          ) : (
            <dl className="stats">
              <div><dt>Partidas</dt><dd>{resumen.datos.totalPartidas}</dd></div>
              <div><dt>Horas totales</dt><dd>{resumen.datos.horasTotales} h</dd></div>
              <div>
                <dt>Última partida</dt>
                <dd>{resumen.datos.ultimaPartida ? formatearFecha(resumen.datos.ultimaPartida) : "—"}</dd>
              </div>
              <div className="stat-ancha">
                <dt>Avance actual</dt>
                <dd><BarraProgreso valor={resumen.datos.porcentajeAvanceActual} /></dd>
              </div>
            </dl>
          )}
        </article>

        <article className="panel">
          <h2>🏆 Logros <small>{obtenidos}/{j.logros.length}</small></h2>
          {j.logros.length === 0 ? (
            <Vacio mensaje="Este juego no tiene logros. Agrégalos desde Editar." />
          ) : (
            <ul className="logros">
              {j.logros.map((l) => (
                <li key={l._id}>
                  <label className={l.obtenido ? "obtenido" : ""}>
                    <input type="checkbox" checked={l.obtenido} onChange={(e) => toggleLogro(l._id, e.target.checked)} />
                    {l.nombre}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <article className="panel">
        <div className="cabecera">
          <h2>🕹️ Partidas</h2>
          <Link to={`/partidas/nueva?videojuego=${id}`} className="btn btn-primario">+ Registrar partida</Link>
        </div>
        {partidas.cargando && !partidas.datos ? (
          <Cargando />
        ) : partidas.error ? (
          <MensajeError mensaje={partidas.error} onReintentar={partidas.recargar} />
        ) : !partidas.datos?.length ? (
          <Vacio mensaje="Aún no registras partidas de este juego." />
        ) : (
          <ul className="lista-partidas">
            {partidas.datos.map((p) => (
              <li key={p._id}>
                <div>
                  <strong>{formatearFecha(p.fecha)}</strong>
                  <span className="meta"> · {formatearMinutos(p.duracionMinutos)} · {p.porcentajeAvance}%</span>
                  {p.notas && <p className="notas">{p.notas}</p>}
                </div>
                <button className="btn btn-peligro btn-chico" onClick={() => eliminarPartida(p._id)} aria-label="Eliminar partida">✕</button>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
