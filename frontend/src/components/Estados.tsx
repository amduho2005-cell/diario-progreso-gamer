import type { ReactNode } from "react";

export function Cargando({ texto = "Cargando…" }: { texto?: string }) {
  return (
    <div className="estado" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}

export function MensajeError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div className="estado estado-error" role="alert">
      <p className="estado-icono" aria-hidden="true">💥</p>
      <p>{mensaje}</p>
      {onReintentar && (
        <button className="btn" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Vacio({ mensaje, children }: { mensaje: string; children?: ReactNode }) {
  return (
    <div className="estado">
      <p className="estado-icono" aria-hidden="true">🕹️</p>
      <p>{mensaje}</p>
      {children}
    </div>
  );
}
