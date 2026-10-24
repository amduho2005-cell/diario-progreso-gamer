import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { videojuegosApi } from "../api/videojuegosApi";
import { partidasApi } from "../api/partidasApi";
import { ApiError } from "../api/client";
import { useCarga } from "../hooks/useCarga";
import { Cargando, MensajeError, Vacio } from "../components/Estados";
import { hoyISO } from "../utils";

export function NuevaPartida() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const juegos = useCarga(() => videojuegosApi.listar(), []);

  const [form, setForm] = useState({
    videojuego: params.get("videojuego") ?? "",
    fecha: hoyISO(),
    duracionMinutos: "",
    porcentajeAvance: "",
    notas: "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const set = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }));

  function validar() {
    const e: Record<string, string> = {};
    const dur = Number(form.duracionMinutos);
    const av = Number(form.porcentajeAvance);
    if (!form.videojuego) e.videojuego = "Elige un videojuego";
    if (!form.fecha) e.fecha = "La fecha es obligatoria";
    if (!form.duracionMinutos || !Number.isFinite(dur) || dur < 1) e.duracionMinutos = "Mínimo 1 minuto";
    if (form.porcentajeAvance === "" || !Number.isFinite(av) || av < 0 || av > 100) e.porcentajeAvance = "Entre 0 y 100";
    return e;
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    setErrorGeneral(null);
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length) return;

    setGuardando(true);
    try {
      await partidasApi.crear({
        videojuego: form.videojuego,
        fecha: form.fecha,
        duracionMinutos: Number(form.duracionMinutos),
        porcentajeAvance: Number(form.porcentajeAvance),
        notas: form.notas.trim() || undefined,
      });
      // Al detalle del juego: allí se vuelve a pedir el resumen ya actualizado.
      navigate(`/videojuegos/${form.videojuego}`);
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : "Error al guardar");
      if (err instanceof ApiError && err.detalles) setErrores(err.detalles);
    } finally {
      setGuardando(false);
    }
  }

  if (juegos.cargando && !juegos.datos) return <Cargando texto="Cargando videojuegos…" />;
  if (juegos.error) return <MensajeError mensaje={juegos.error} onReintentar={juegos.recargar} />;
  if (!juegos.datos?.length)
    return (
      <Vacio mensaje="Primero necesitas registrar un videojuego.">
        <Link to="/videojuegos/nuevo" className="btn btn-primario">Crear videojuego</Link>
      </Vacio>
    );

  return (
    <section className="estrecho">
      <Link to="/partidas" className="volver">← Volver</Link>
      <h1>Nueva partida</h1>

      <form className="panel formulario" onSubmit={guardar} noValidate>
        {errorGeneral && <p className="error-campo error-general" role="alert">{errorGeneral}</p>}

        <label>
          Videojuego
          <select value={form.videojuego} onChange={set("videojuego")} aria-invalid={Boolean(errores.videojuego)}>
            <option value="">— Elige uno —</option>
            {juegos.datos.map((j) => <option key={j._id} value={j._id}>{j.nombre} ({j.plataforma})</option>)}
          </select>
          {errores.videojuego && <span className="error-campo">{errores.videojuego}</span>}
        </label>

        <div className="fila">
          <label>
            Fecha
            <input type="date" value={form.fecha} onChange={set("fecha")} aria-invalid={Boolean(errores.fecha)} />
            {errores.fecha && <span className="error-campo">{errores.fecha}</span>}
          </label>
          <label>
            Duración (minutos)
            <input type="number" min={1} value={form.duracionMinutos} onChange={set("duracionMinutos")} aria-invalid={Boolean(errores.duracionMinutos)} />
            {errores.duracionMinutos && <span className="error-campo">{errores.duracionMinutos}</span>}
          </label>
          <label>
            % de avance
            <input type="number" min={0} max={100} value={form.porcentajeAvance} onChange={set("porcentajeAvance")} aria-invalid={Boolean(errores.porcentajeAvance)} />
            {errores.porcentajeAvance && <span className="error-campo">{errores.porcentajeAvance}</span>}
          </label>
        </div>

        <label>
          Notas (opcional)
          <textarea rows={3} maxLength={500} value={form.notas} onChange={set("notas")} />
          {errores.notas && <span className="error-campo">{errores.notas}</span>}
        </label>

        <button className="btn btn-primario" disabled={guardando}>{guardando ? "Guardando…" : "Guardar partida"}</button>
      </form>
    </section>
  );
}
