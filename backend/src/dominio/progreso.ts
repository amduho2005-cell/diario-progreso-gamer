// Funciones puras del progreso semanal (sin base de datos). Spec: docs/specs/backend-metas-progreso.md §3.
// Los días se manejan como texto "YYYY-MM-DD": se comparan y ordenan como strings.

export const ZONA = "America/Guayaquil";
const MS_DIA = 24 * 60 * 60 * 1000;

export interface Hito {
  descripcion: string;
  porcentajeObjetivo: number;
}
export type HitoConEstado = Hito & { alcanzado: boolean };

export interface MetaParaProgreso {
  _id?: unknown;
  horasSemanales: number;
  diasPorSemana: number;
  hitos: Hito[];
}

export interface PartidaParaProgreso {
  fecha: Date;
  duracionMinutos: number;
}

export interface ProgresoSemanal {
  semana: { inicio: string; fin: string };
  meta: { _id?: unknown; horasSemanales: number; diasPorSemana: number } | null;
  horasSemana: number;
  porcentajeHoras: number | null;
  diasJugadosSemana: number;
  rachaActual: number;
  mejorRacha: number;
  hitos: HitoConEstado[];
}

// D-1: el día calendario de un instante en Ecuador ("en-CA" formatea como YYYY-MM-DD).
export const diaEnEcuador = (instante: Date) => instante.toLocaleDateString("en-CA", { timeZone: ZONA });

// D-2 / H3: la fecha se guarda a medianoche UTC del día elegido; su parte UTC ES el día. No se convierte de zona.
export const diaDePartida = (fecha: Date) => fecha.toISOString().slice(0, 10);

export const sumarDias = (dia: string, n: number) =>
  new Date(Date.parse(`${dia}T00:00:00Z`) + n * MS_DIA).toISOString().slice(0, 10);

// RN-4: lunes a domingo. getUTCDay(): 0 = domingo … 6 = sábado.
export function semanaDe(dia: string): { inicio: string; fin: string } {
  const desdeLunes = (new Date(`${dia}T00:00:00Z`).getUTCDay() + 6) % 7;
  const inicio = sumarDias(dia, -desdeLunes);
  return { inicio, fin: sumarDias(inicio, 6) };
}

// D-6, D-7, H1, H2, H12, N-3.
export function calcularRachas(dias: string[], hoy: string): { rachaActual: number; mejorRacha: number } {
  const unicos = [...new Set(dias.filter((d) => d <= hoy))].sort();
  const jugados = new Set(unicos);

  let mejorRacha = 0;
  let seguidos = 0;
  unicos.forEach((dia, i) => {
    seguidos = i > 0 && sumarDias(unicos[i - 1], 1) === dia ? seguidos + 1 : 1;
    mejorRacha = Math.max(mejorRacha, seguidos);
  });

  // Si hoy aún no hay partida, la racha sigue viva desde ayer.
  let dia = jugados.has(hoy) ? hoy : sumarDias(hoy, -1);
  let rachaActual = 0;
  while (jugados.has(dia)) {
    rachaActual++;
    dia = sumarDias(dia, -1);
  }
  return { rachaActual, mejorRacha };
}

// D-8 / H6: se calcula siempre con el avance actual; nunca se guarda.
export const calcularHitos = (hitos: Hito[], porcentajeAvanceActual: number): HitoConEstado[] =>
  hitos.map(({ descripcion, porcentajeObjetivo }) => ({
    descripcion,
    porcentajeObjetivo,
    alcanzado: porcentajeAvanceActual >= porcentajeObjetivo,
  }));

export function calcularProgreso(entrada: {
  partidas: PartidaParaProgreso[];
  meta: MetaParaProgreso | null;
  porcentajeAvanceActual: number;
  ahora: Date;
}): ProgresoSemanal {
  const { partidas, meta, porcentajeAvanceActual, ahora } = entrada;
  const hoy = diaEnEcuador(ahora);
  const semana = semanaDe(hoy);

  const conDia = partidas.map((p) => ({ dia: diaDePartida(p.fecha), minutos: p.duracionMinutos }));
  // N-3: el fin efectivo es hoy, así no cuentan días futuros de la semana.
  const deLaSemana = conDia.filter((p) => p.dia >= semana.inicio && p.dia <= hoy);

  const minutos = deLaSemana.reduce((suma, p) => suma + p.minutos, 0);
  const horasSemana = Math.round((minutos / 60) * 10) / 10; // D-3: se redondea solo al final

  return {
    semana,
    meta: meta && { _id: meta._id, horasSemanales: meta.horasSemanales, diasPorSemana: meta.diasPorSemana },
    horasSemana,
    // D-4 / H5: sin límite superior.
    porcentajeHoras: meta ? Math.round((horasSemana / meta.horasSemanales) * 100) : null,
    diasJugadosSemana: new Set(deLaSemana.map((p) => p.dia)).size,
    ...calcularRachas(conDia.map((p) => p.dia), hoy),
    hitos: meta ? calcularHitos(meta.hitos, porcentajeAvanceActual) : [],
  };
}
