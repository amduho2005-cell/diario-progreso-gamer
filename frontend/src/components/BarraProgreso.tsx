// El relleno nunca pasa de 100 %, pero el texto muestra el valor real (ej. 140%) — DESIGN.md, H5.
export function BarraProgreso({ valor, texto = `${valor}%` }: { valor: number; texto?: string }) {
  const relleno = Math.min(Math.max(valor, 0), 100);
  return (
    <div className="barra" role="progressbar" aria-valuenow={relleno} aria-valuemin={0} aria-valuemax={100} aria-valuetext={texto}>
      <div className="barra-relleno" style={{ width: `${relleno}%` }} />
      <span className="barra-texto">{texto}</span>
    </div>
  );
}
