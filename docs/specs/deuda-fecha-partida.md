# Spec · Deuda técnica — Fecha de partida (D1 y D2)

**Diagnóstico:** P2 y P3 · **Tickets:** T-13 (D1), T-14 (D2) · **PRD:** H3, H10.

## Contexto

Días jugados y rachas agrupan las partidas por día. Hoy la API acepta cualquier fecha-hora y fechas futuras, así
que una partida puede quedar en un día distinto al elegido o contar días que no han pasado.

## Contrato

Función pura `errorFechaPartida(valor: unknown, hoy: string): string | null` en `backend/src/dominio/fechaPartida.ts`.
Devuelve `null` si la fecha es válida o el mensaje de error. `partidas.service` la llama en `crear` y `actualizar`
(con `hoy = diaEnEcuador(new Date())`) y, si hay error, lanza `BadRequestError` →
400 `{ tipo: "ValidacionError", detalles: { fecha: "<mensaje>" } }`.

## Reglas

**DEBE**
- DF-1 (D1) Aceptar solo el formato `YYYY-MM-DD` que sea una fecha de calendario real (no `2026-02-30`).
- DF-2 (D2) Rechazar una fecha posterior a hoy en `America/Guayaquil`.
- DF-3 Validar en `PUT` solo si el cuerpo trae `fecha`.

**NO DEBE**
- NDF-1 Cambiar el esquema de `Partida` ni la forma de guardar la fecha (medianoche UTC).
- NDF-2 Tocar las partidas ya guardadas.

## Criterio → verificación

Tests en `backend/src/dominio/fechaPartida.test.ts`.

| Criterio | Verificación | Test |
|---|---|---|
| CA-D1.1 | test + curl | `CA-D1.1 fecha con hora se rechaza` · POST `/partidas` con `"2026-11-10T23:30"` → 400 |
| CA-D1.2 | test | `CA-D1.2 fecha de día válida se acepta` (y `2026-02-30` se rechaza) |
| CA-D2.1 | test + curl | `CA-D2.1 fecha futura se rechaza` · POST con mañana → 400 |
| CA-D2.2 | test | `CA-D2.2 hoy se acepta` |
| CA-D2.3 | test | `CA-D2.3 23:30 en Ecuador: el día siguiente sigue siendo futuro` |

## Ticket → archivos

| Ticket | Archivos |
|---|---|
| T-13 | `backend/src/dominio/fechaPartida.ts`, `backend/src/dominio/fechaPartida.test.ts`, `backend/src/services/partidas.service.ts` |
| T-14 | los mismos |
