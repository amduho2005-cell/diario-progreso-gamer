import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { metasApi } from "../api/metasApi";
import { videojuegosApi } from "../api/videojuegosApi";
import { ApiError } from "../api/client";
import { useCarga } from "../hooks/useCarga";
import { Cargando, MensajeError } from "../components/Estados";
import type { ProgresoSemanal, Videojuego } from "../types";

const MAX_HITOS = 5;
type HitoForm = { descripcion: string; porcentajeObjetivo: string };

// /videojuegos/:id/meta → edita la meta activa del juego o, si no tiene, crea una.
export function FormMeta() {
  const { id = "" } = useParams();
  const datos = useCarga(() => Promise.all([videojuegosApi.obtener(id), metasApi.obtenerProgreso(id)]), [id]);

  if (datos.cargando && !datos.datos) return <Cargando texto="Cargando meta…" />;
  if (datos.error || !datos.datos) return <MensajeError mensaje={datos.error ?? "Sin datos"} onReintentar={datos.recargar} />;
  const [juego, progreso] = datos.datos;
  return <FormularioMeta juego={juego} progreso={progreso} />;
}

// El estado inicial sale de la meta activa (si existe), que ya viene cargada.
function FormularioMeta({ juego, progreso }: { juego: Videojuego; progreso: ProgresoSemanal }) {
  const id = juego._id;
  const navigate = useNavigate();
  const meta = progreso.meta;

  const [horas, setHoras] = useState(meta ? String(meta.horasSemanales) : "");
  const [dias, setDias] = useState(meta ? String(meta.diasPorSemana) : "");
  const [hitos, setHitos] = useState<HitoForm[]>(
    progreso.hitos.map((h) => ({ descripcion: h.descripcion, porcentajeObjetivo: String(h.porcentajeObjetivo) })),
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiarHito = (i: number, campo: keyof HitoForm, valor: string) =>
    setHitos((hs) => hs.map((h, k) => (k === i ? { ...h, [campo]: valor } : h)));

  // F-4: las mismas reglas que el backend (RN-2, RN-3).
  function validar() {
    const e: Record<string, string> = {};
    const h = Number(horas);
    const d = Number(dias);
    if (horas === "" || !Number.isFinite(h) || h <= 0 || h > 100) e.horasSemanales = "Entre 0,1 y 100 horas";
    if (dias === "" || !Number.isInteger(d) || d < 1 || d > 7) e.diasPorSemana = "Un número entero de 1 a 7";
    if (hitos.length > MAX_HITOS) e.hitos = `Máximo ${MAX_HITOS} hitos`;
    hitos.forEach((hito, i) => {
      const p = Number(hito.porcentajeObjetivo);
      if (!hito.descripcion.trim()) e[`hitos.${i}.descripcion`] = "Describe el hito";
      if (hito.porcentajeObjetivo === "" || !Number.isFinite(p) || p < 1 || p > 100)
        e[`hitos.${i}.porcentajeObjetivo`] = "Entre 1 y 100";
    });
    return e;
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    setErrorGeneral(null);
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;

    const input = {
      horasSemanales: Number(horas),
      diasPorSemana: Number(dias),
      hitos: hitos.map((h) => ({ descripcion: h.descripcion.trim(), porcentajeObjetivo: Number(h.porcentajeObjetivo) })),
    };
    setGuardando(true);
    try {
      if (meta) await metasApi.actualizar(meta._id, input);
      else await metasApi.crear(id, input);
      navigate(`/videojuegos/${id}`); // el detalle vuelve a pedir el progreso (F-2)
    } catch (err) {
      // F-5: el mensaje del 409 (meta duplicada, juego completado) se muestra tal cual.
      setErrorGeneral(err instanceof Error ? err.message : "Error al guardar");
      if (err instanceof ApiError && err.detalles) setErrores(err.detalles);
    } finally {
      setGuardando(false);
    }
  }

  const err = (campo: string) => errores[campo] && <span className="error-campo">{errores[campo]}</span>;

  return (
    <section className="estrecho">
      <Link to={`/videojuegos/${id}`} className="volver">← Volver</Link>
      <h1>{meta ? "Editar meta" : "Nueva meta"}</h1>
      <p className="meta">{juego.nombre} · ¿Cuánto quieres jugar cada semana (de lunes a domingo)?</p>

      <form className="panel formulario" onSubmit={guardar} noValidate>
        {errorGeneral && <p className="error-campo error-general" role="alert">{errorGeneral}</p>}

        <div className="fila">
          <label>
            Horas por semana
            <input type="number" min={0.5} max={100} step={0.5} value={horas} onChange={(e) => setHoras(e.target.value)}
              aria-invalid={Boolean(errores.horasSemanales)} />
            {err("horasSemanales")}
          </label>
          <label>
            Días por semana
            <input type="number" min={1} max={7} step={1} value={dias} onChange={(e) => setDias(e.target.value)}
              aria-invalid={Boolean(errores.diasPorSemana)} />
            {err("diasPorSemana")}
          </label>
        </div>

        <fieldset>
          <legend>Hitos de avance ({hitos.length}/{MAX_HITOS})</legend>
          <p className="meta">Un hito se alcanza cuando tu % de avance en el juego llega a su objetivo.</p>
          {err("hitos")}
          <ul className="logros-editables">
            {hitos.map((h, i) => (
              <li key={i}>
                <input value={h.descripcion} placeholder="Ej. Llegar al 50 %" aria-label={`Descripción del hito ${i + 1}`}
                  onChange={(e) => cambiarHito(i, "descripcion", e.target.value)}
                  aria-invalid={Boolean(errores[`hitos.${i}.descripcion`])} />
                <input type="number" min={1} max={100} className="input-porcentaje" value={h.porcentajeObjetivo}
                  aria-label={`Porcentaje objetivo del hito ${i + 1}`}
                  onChange={(e) => cambiarHito(i, "porcentajeObjetivo", e.target.value)}
                  aria-invalid={Boolean(errores[`hitos.${i}.porcentajeObjetivo`])} />
                <button type="button" className="btn btn-peligro btn-chico" aria-label={`Quitar hito ${i + 1}`}
                  onClick={() => setHitos((hs) => hs.filter((_, k) => k !== i))}>✕</button>
                {err(`hitos.${i}.descripcion`)}
                {err(`hitos.${i}.porcentajeObjetivo`)}
              </li>
            ))}
          </ul>
          <button type="button" className="btn" disabled={hitos.length >= MAX_HITOS}
            onClick={() => setHitos((hs) => [...hs, { descripcion: "", porcentajeObjetivo: "" }])}>
            + Agregar hito
          </button>
        </fieldset>

        <button className="btn btn-primario" disabled={guardando}>
          {guardando ? "Guardando…" : meta ? "Guardar meta" : "Crear meta"}
        </button>
      </form>
    </section>
  );
}
