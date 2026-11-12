# Spec · Backend — Meta y progreso semanal

**Historias:** HU-1…HU-5 · **Tickets:** T-01…T-09 · **PRD:** RN-1…RN-6, H1…H14.

## 1. Modelo `Meta` (colección `metas`, `timestamps: true`)

| Campo | Tipo | Reglas |
|---|---|---|
| `videojuego` | ObjectId → `Videojuego` | obligatorio, con índice |
| `horasSemanales` | number | obligatorio, `> 0` y `≤ 100` |
| `diasPorSemana` | number | obligatorio, entero de 1 a 7 |
| `activa` | boolean | por defecto `true` |
| `hitos` | `[{ descripcion: string (obligatoria, trim), porcentajeObjetivo: number 1–100 }]` | máximo 5; sin `_id` propio |

- Índice único parcial `{ videojuego: 1 }` con `activa: true` → como mucho una meta activa por juego, también con peticiones simultáneas.
- **Por qué se referencia:** la meta tiene su propio ciclo de vida (se crea, se edita y se desactiva sin tocar la ficha
  del juego) y guarda un historial de metas anteriores que crecería dentro del juego sin necesidad.
- **Por qué los hitos se embeben:** son como mucho 5, solo tienen sentido dentro de su meta y siempre se leen con ella.
- **Por qué «alcanzado» no se guarda:** sale del avance actual (`porcentajeAvanceActual` del resumen de E1).
  Guardarlo duplicaría un dato de las partidas y podría quedar desactualizado (H6).

## 2. Endpoints

| Método | Ruta | Cuerpo | Respuesta | Errores |
|---|---|---|---|---|
| POST | `/api/metas` | `{ videojuego, horasSemanales, diasPorSemana, hitos? }` | 201 + meta | 400 validación o id · 404 juego inexistente · 409 ya hay meta activa o juego completado/abandonado |
| GET | `/api/metas/:id` | — | 200 + meta | 400 · 404 |
| PUT | `/api/metas/:id` | `{ horasSemanales?, diasPorSemana?, hitos? }` | 200 + meta | 400 · 404 · 409 meta desactivada |
| PATCH | `/api/metas/:id/desactivar` | — | 200 + meta (`activa: false`), idempotente | 400 · 404 |
| GET | `/api/videojuegos/:id/metas` | — | 200 + metas del juego (`createdAt` desc) | 400 · 404 |
| GET | `/api/videojuegos/:id/progreso-semanal` | — | 200 + progreso (§3) | 400 · 404 |

Solo se aceptan del cliente los campos listados en la tabla: `activa` no se puede enviar en POST ni PUT.

## 3. Progreso semanal

```json
{
  "semana": { "inicio": "2026-11-09", "fin": "2026-11-15" },
  "meta": { "_id": "…", "horasSemanales": 5, "diasPorSemana": 4 },
  "horasSemana": 3.5, "porcentajeHoras": 70, "diasJugadosSemana": 3,
  "rachaActual": 4, "mejorRacha": 9,
  "hitos": [{ "descripcion": "Llegar al 50 %", "porcentajeObjetivo": 50, "alcanzado": true }]
}
```

Funciones puras en `src/dominio/progreso.ts` (sin base de datos). El servicio solo consulta y las llama:

| Función | Contrato |
|---|---|
| `diaEnEcuador(instante: Date): string` | Día `YYYY-MM-DD` de ese instante en `America/Guayaquil` |
| `diaDePartida(fecha: Date): string` | Día de una partida: la parte UTC `YYYY-MM-DD` (se guarda a medianoche UTC del día elegido) |
| `sumarDias(dia, n): string` | Aritmética de días sobre `YYYY-MM-DD` |
| `semanaDe(dia): { inicio, fin }` | Lunes y domingo de la semana que contiene `dia` |
| `calcularRachas(dias: string[], hoy): { rachaActual, mejorRacha }` | Sobre días únicos ≤ hoy |
| `calcularHitos(hitos, avance)` | Agrega `alcanzado = avance >= porcentajeObjetivo` |
| `calcularProgreso({ partidas, meta, porcentajeAvanceActual, ahora })` | Arma la respuesta completa |

### Reglas

**DEBE**
- D-1 Calcular «hoy» con `diaEnEcuador(ahora)`, y la semana de lunes a domingo que lo contiene (RN-4, H9).
- D-2 Asignar cada partida al día de su `fecha` con `diaDePartida`, sin convertirla de zona (H3).
- D-3 `horasSemana = round(Σ duracionMinutos de la semana / 60, 1 decimal)`, sumando antes de redondear.
- D-4 `porcentajeHoras = round(horasSemana / horasSemanales × 100)`, **sin límite superior** (H5).
- D-5 `diasJugadosSemana` = días distintos de la semana con al menos una partida (H2).
- D-6 `rachaActual`: contar días consecutivos hacia atrás desde hoy; si hoy no hay partida, desde ayer (H1). Si tampoco ayer, 0.
- D-7 `mejorRacha`: la secuencia más larga de días consecutivos del historial, incluida la actual (H12).
- D-8 Hito alcanzado si `porcentajeAvanceActual ≥ porcentajeObjetivo`; `porcentajeAvanceActual` sale de `calcularResumen` de E1 (RN-6, H6).
- D-9 Usar la meta activa al momento de consultar (H4).
- D-10 Sin meta activa: `meta: null`, `porcentajeHoras: null`, `hitos: []`, pero sí horas, días y rachas.
- D-11 Sin partidas: horas, días y rachas en 0; ningún hito alcanzado (H13).
- D-12 Al crear: id con formato válido (400), juego existente (404), juego `jugando` o `pausado` (409, H7), sin otra meta activa (409, RN-1).
- D-13 Al pasar un juego a `completado` o `abandonado`, desactivar su meta activa (H7).
- D-14 Al eliminar un juego, eliminar todas sus metas (H8).
- D-15 `errorHandler`: `ConflictError` y la clave duplicada de MongoDB (código 11000) → **409** `{ tipo: "Conflicto" }`.

**NO DEBE**
- N-1 Guardar `alcanzado`, horas, días ni rachas en la base de datos.
- N-2 Acceder a la base de datos desde `src/dominio/`.
- N-3 Contar partidas con día posterior a hoy (protección extra; D2 ya las impide).
- N-4 Permitir reactivar una meta (`activa` no se acepta del cliente) ni editar una meta desactivada (409, H11).
- N-5 Cambiar el modelo de `Videojuego`/`Partida` ni el resultado de `/resumen`.

## 4. Criterio → verificación

Tests en `backend/src/dominio/progreso.test.ts` (`node:test`), con `ahora` fijo: miércoles 2026-11-11 12:00 en Ecuador.

| Criterio | Verificación | Test / paso |
|---|---|---|
| CA-4.1 | test | `CA-4.1 semana de lunes a domingo` |
| CA-4.2 | test | `CA-4.2 domingo 23:30 en Ecuador sigue en la misma semana; lunes empieza otra` |
| CA-4.3 | test | `CA-4.3 horas solo de la semana actual` |
| CA-4.4 | test | `CA-4.4 porcentaje 70` |
| CA-4.5 | test | `CA-4.5 porcentaje 140 sin límite` |
| CA-4.6 | test | `CA-4.6 dos partidas el mismo día cuentan un día` |
| CA-4.7 | test + curl | `CA-4.7 sin meta: meta y porcentaje null` · curl juego sin meta |
| CA-4.8 | test + curl | `CA-4.8 sin partidas todo en 0` · curl juego sin partidas |
| CA-4.9 | curl | `GET /videojuegos/abc/progreso-semanal` → 400; id inexistente → 404 |
| CA-4.10 | test | `CA-4.10 la partida pertenece al día registrado` |
| CA-3.1 | test + curl | `CA-3.1 se usa la meta actual` · PUT meta y GET progreso |
| CA-5.1 … CA-5.6 | test | `CA-5.1` … `CA-5.6` |
| CA-2.1, 2.2, 2.3, 2.5 | test | `CA-2.1` … `CA-2.5` |
| CA-1.1 | curl | POST `/metas` → 201 |
| CA-1.2 | curl | segundo POST → 409 |
| CA-1.3, CA-2.4 | curl | POST con valores fuera de rango / 6 hitos → 400 con `detalles` |
| CA-1.4 | curl | POST para juego completado → 409 |
| CA-1.5 | curl | POST con juego inexistente → 404 |
| CA-3.2, 3.6 | curl | PATCH desactivar → `activa:false`; GET `/videojuegos/:id/metas` lista ambas |
| CA-3.4 | curl | PUT juego `estado: completado` → meta desactivada |
| CA-3.5 | curl | DELETE juego → GET `/metas/:id` 404 |
| CA-3.7 | curl | PUT de una meta desactivada → 409 |

## 5. Ticket → archivos

| Ticket | Archivos |
|---|---|
| T-01 | `backend/package.json` (script `test`) |
| T-02, T-03, T-04 | `backend/src/dominio/progreso.ts`, `backend/src/dominio/progreso.test.ts` |
| T-05 | `backend/src/models/meta.model.ts`, `backend/src/errors/errores.ts`, `backend/src/middlewares/errorHandler.ts` |
| T-06 | `backend/src/services/metas.service.ts`, `backend/src/controllers/metas.controller.ts`, `backend/src/routes/metas.routes.ts`, `backend/src/routes/videojuegos.routes.ts`, `backend/src/app.ts` |
| T-07 | `backend/src/services/videojuegos.service.ts` |
| T-08 | `backend/src/services/metas.service.ts` (`obtenerProgreso`), `backend/src/controllers/metas.controller.ts`, `backend/src/routes/videojuegos.routes.ts` |
| T-09 | `backend/src/scripts/seed.ts`, `backend/requests.http` |
