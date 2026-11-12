import { useState } from "react";
import { Link } from "react-router-dom";
import { metasApi } from "../api/metasApi";
import type { ProgresoSemanal as Progreso } from "../types";
import { BarraProgreso } from "./BarraProgreso";
import { Cargando, MensajeError, Vacio } from "./Estados";
import { formatearDiaCorto } from "../utils";

interface Props {
  videojuegoId: string;
  puedeTenerMeta: boolean; // H7: completados y abandonados no llevan meta
  progreso: { datos: Progreso | null; cargando: boolean; error: string | null; recargar: () => Promise<void> };
}

const dias = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

// Todo el cálculo viene del backend (F-1); aquí solo se muestra.
export function ProgresoSemanal({ videojuegoId, puedeTenerMeta, progreso }: Props) {
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const { datos: p, cargando, error, recargar } = progreso;

  async function desactivar() {
    if (!p?.meta || !confirm("¿Desactivar la meta de este juego? Quedará en el historial y podrás crear otra.")) return;
    setErrorAccion(null);
    try {
      await metasApi.desactivar(p.meta._id);
      await recargar();
    } catch (e) {
      setErrorAccion(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  let contenido;
  if (cargando && !p) contenido = <Cargando texto="Calculando tu semana…" />;
  else if (error || !p) contenido = <MensajeError mensaje={error ?? "Sin datos"} onReintentar={recargar} />;
  else {
    const { meta } = p;
    const cumplida = meta && p.horasSemana >= meta.horasSemanales && p.diasJugadosSemana >= meta.diasPorSemana;
    contenido = (
      <>
        <p className="meta">Semana del {formatearDiaCorto(p.semana.inicio)} al {formatearDiaCorto(p.semana.fin)}</p>
        <dl className="stats">
          <div className="stat-ancha">
            <dt>Horas esta semana</dt>
            <dd>
              {p.horasSemana} h{meta && <small className="meta"> de {meta.horasSemanales} h</small>}
              {meta && p.porcentajeHoras !== null && <BarraProgreso valor={p.porcentajeHoras} />}
            </dd>
          </div>
          <div>
            <dt>Días jugados</dt>
            <dd>{p.diasJugadosSemana}{meta && <small className="meta"> de {meta.diasPorSemana}</small>}</dd>
          </div>
          <div>
            <dt>Racha actual</dt>
            <dd className="racha"><span aria-hidden="true">🔥</span> {dias(p.rachaActual)}</dd>
          </div>
          <div>
            <dt>Mejor racha</dt>
            <dd>{dias(p.mejorRacha)}</dd>
          </div>
        </dl>
        {cumplida && <p className="meta-cumplida">¡Meta de la semana cumplida!</p>}

        {meta ? (
          <>
            <h3><span aria-hidden="true">🏁</span> Hitos</h3>
            {p.hitos.length === 0 ? (
              <p className="meta">Esta meta no tiene hitos. Agrégalos desde «Editar meta».</p>
            ) : (
              <ul className="hitos">
                {p.hitos.map((h, i) => (
                  <li key={i} className={h.alcanzado ? "alcanzado" : ""}>
                    <span aria-hidden="true">{h.alcanzado ? "✔" : "○"}</span>
                    <span>{h.descripcion}</span>
                    <span className="hito-objetivo">
                      {h.porcentajeObjetivo}% · {h.alcanzado ? "Alcanzado" : "Pendiente"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : puedeTenerMeta ? (
          <Vacio mensaje="Aún no tienes una meta para este juego. Fíjate cuántas horas y días quieres jugar por semana.">
            <Link to={`/videojuegos/${videojuegoId}/meta`} className="btn">Crear meta</Link>
          </Vacio>
        ) : (
          <Vacio mensaje="Los juegos completados o abandonados no llevan meta semanal." />
        )}
      </>
    );
  }

  return (
    <article className="panel resumen progreso">
      <div className="cabecera">
        <h2><span aria-hidden="true">🎯</span> Progreso semanal</h2>
        {p?.meta && (
          <div className="acciones">
            <Link to={`/videojuegos/${videojuegoId}/meta`} className="btn btn-chico">Editar meta</Link>
            <button className="btn btn-peligro btn-chico" onClick={desactivar}>Desactivar meta</button>
          </div>
        )}
      </div>
      {errorAccion && <MensajeError mensaje={errorAccion} />}
      {contenido}
    </article>
  );
}
