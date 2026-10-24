import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { videojuegosApi } from "../api/videojuegosApi";
import { ApiError } from "../api/client";
import { Cargando, MensajeError } from "../components/Estados";
import { ESTADOS, GENEROS, PLATAFORMAS, type VideojuegoInput } from "../types";
import { ETIQUETA_ESTADO, ETIQUETA_GENERO } from "../utils";

const VACIO: VideojuegoInput = { nombre: "", plataforma: "PC", genero: "accion", estado: "jugando", logros: [] };

// Sirve para /videojuegos/nuevo y /videojuegos/:id/editar.
export function FormVideojuego() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<VideojuegoInput>(VACIO);
  const [nuevoLogro, setNuevoLogro] = useState("");
  const [cargando, setCargando] = useState(editando);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    if (!id) return;
    setCargando(true);
    setErrorCarga(null);
    try {
      const j = await videojuegosApi.obtener(id);
      setForm({ nombre: j.nombre, plataforma: j.plataforma, genero: j.genero, estado: j.estado, logros: j.logros });
    } catch (e) {
      setErrorCarga(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof VideojuegoInput>(campo: K, valor: VideojuegoInput[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  function agregarLogro() {
    const nombre = nuevoLogro.trim();
    if (!nombre) return;
    set("logros", [...form.logros, { nombre, obtenido: false }]);
    setNuevoLogro("");
  }

  function validar() {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    form.logros.forEach((l, i) => {
      if (!l.nombre.trim()) e[`logros.${i}.nombre`] = "El logro necesita un nombre";
    });
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
      const juego = id ? await videojuegosApi.actualizar(id, form) : await videojuegosApi.crear(form);
      navigate(`/videojuegos/${juego._id}`);
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : "Error al guardar");
      if (err instanceof ApiError && err.detalles) setErrores(err.detalles);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;
  if (errorCarga) return <MensajeError mensaje={errorCarga} onReintentar={cargar} />;

  return (
    <section className="estrecho">
      <Link to={id ? `/videojuegos/${id}` : "/videojuegos"} className="volver">← Volver</Link>
      <h1>{editando ? "Editar videojuego" : "Nuevo videojuego"}</h1>

      <form className="panel formulario" onSubmit={guardar} noValidate>
        {errorGeneral && <p className="error-campo error-general" role="alert">{errorGeneral}</p>}

        <label>
          Nombre
          <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} aria-invalid={Boolean(errores.nombre)} />
          {errores.nombre && <span className="error-campo">{errores.nombre}</span>}
        </label>

        <div className="fila">
          <label>
            Plataforma
            <select value={form.plataforma} onChange={(e) => set("plataforma", e.target.value as VideojuegoInput["plataforma"])}>
              {PLATAFORMAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errores.plataforma && <span className="error-campo">{errores.plataforma}</span>}
          </label>
          <label>
            Género
            <select value={form.genero} onChange={(e) => set("genero", e.target.value as VideojuegoInput["genero"])}>
              {GENEROS.map((g) => <option key={g} value={g}>{ETIQUETA_GENERO[g]}</option>)}
            </select>
            {errores.genero && <span className="error-campo">{errores.genero}</span>}
          </label>
          <label>
            Estado
            <select value={form.estado} onChange={(e) => set("estado", e.target.value as VideojuegoInput["estado"])}>
              {ESTADOS.map((s) => <option key={s} value={s}>{ETIQUETA_ESTADO[s]}</option>)}
            </select>
            {errores.estado && <span className="error-campo">{errores.estado}</span>}
          </label>
        </div>

        <fieldset>
          <legend>Logros</legend>
          {form.logros.length === 0 && <p className="meta">Sin logros todavía.</p>}
          <ul className="logros-editables">
            {form.logros.map((l, i) => (
              <li key={l._id ?? `nuevo-${i}`}>
                <input
                  type="checkbox"
                  checked={l.obtenido}
                  aria-label="Obtenido"
                  onChange={(e) => set("logros", form.logros.map((x, k) => (k === i ? { ...x, obtenido: e.target.checked } : x)))}
                />
                <input
                  value={l.nombre}
                  aria-label={`Nombre del logro ${i + 1}`}
                  onChange={(e) => set("logros", form.logros.map((x, k) => (k === i ? { ...x, nombre: e.target.value } : x)))}
                />
                <button type="button" className="btn btn-peligro btn-chico" aria-label="Quitar logro"
                  onClick={() => set("logros", form.logros.filter((_, k) => k !== i))}>✕</button>
                {errores[`logros.${i}.nombre`] && <span className="error-campo">{errores[`logros.${i}.nombre`]}</span>}
              </li>
            ))}
          </ul>
          <div className="agregar-logro">
            <input
              placeholder="Nuevo logro…"
              value={nuevoLogro}
              onChange={(e) => setNuevoLogro(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  agregarLogro();
                }
              }}
            />
            <button type="button" className="btn" onClick={agregarLogro}>Agregar</button>
          </div>
        </fieldset>

        <button className="btn btn-primario" disabled={guardando}>
          {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear videojuego"}
        </button>
      </form>
    </section>
  );
}
