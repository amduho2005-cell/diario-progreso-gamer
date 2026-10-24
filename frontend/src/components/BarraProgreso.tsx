export function BarraProgreso({ valor }: { valor: number }) {
  return (
    <div className="barra" role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100}>
      <div className="barra-relleno" style={{ width: `${valor}%` }} />
      <span className="barra-texto">{valor}%</span>
    </div>
  );
}
