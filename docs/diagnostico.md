# Diagnóstico del Proyecto 3 — punto de partida de E2

Fecha: 2026-11-11 · Rama: `feature/e2-metas-rachas` (desde `feature/diario-gamer`, ya integrada a `main` por PR #1 y #2).

Hecho con el agente en modo lectura (plan mode): leyó el README, todo `backend/src`, todo `frontend/src`, ejecutó los tests, el type-check y el build.

## 1. Estado del proyecto

| Área | Estado | Evidencia |
|---|---|---|
| Backend (Express 5 + TS + Mongoose 8) | ✅ Funciona. Capas: models → services → controllers → routes, más middlewares (`requestId`, `logger`, `errorHandler`) | `npx tsc --noEmit` sin errores |
| Modelo | `Videojuego` (logros embebidos) y `Partida` (referencia a Videojuego, con índice) | `src/models/` |
| Resumen calculado | `calcularResumen` es una función pura, con 4 tests (varias partidas, cero, redondeo, desempate) | `npm test` → 4/4 pasan |
| Errores | `errorHandler` centralizado: 400 (validación, id mal formado, filtros, JSON), 404, 500. **No existe 409** | `middlewares/errorHandler.ts` |
| Borrado en cascada | Eliminar un videojuego borra sus partidas | `videojuegos.service.ts#eliminar` |
| Frontend (React 19 + Vite + Router 7) | ✅ Compila. Listado/detalle/formulario de juegos, listado y alta de partidas, estados de carga/error/vacío con `useCarga` | `npm run build` y `npm run lint` sin errores |
| Estilos | CSS propio con variables (tema oscuro «gamer»), sin librerías de UI | `frontend/src/index.css` |
| Despliegue | Render: Web Service (API) + Static Site (front), MongoDB Atlas | URLs en README §8 |
| Secretos | `.env` ignorado por Git; existen `.env.example` en backend y frontend | `git ls-files` |

## 2. Problemas encontrados

| # | Problema | Impacto en E2 | Decisión |
|---|---|---|---|
| P1 | El `errorHandler` no tiene un caso **409 Conflict** | **Bloquea**: la meta duplicada debe responder 409 | Se resuelve dentro de E2 (ticket T-03) |
| P2 | `fecha` de una partida acepta cualquier fecha-hora (`"2026-11-10T23:30:00-05:00"`) y se guarda tal cual; el resto del sistema asume medianoche UTC del día registrado. Una partida puede caer en un día distinto al que la persona eligió | **Bloquea**: días jugados y racha agrupan por día | **Deuda pagada D1**: solo se acepta `YYYY-MM-DD` |
| P3 | Se aceptan partidas con **fecha futura** | **Bloquea**: inflaría la semana y la racha con días que no han pasado | **Deuda pagada D2**: fecha futura (hora de Ecuador) → 400 |
| P4 | `npm test` ejecuta un único archivo escrito a mano | **Bloquea**: habrá tests nuevos de dominio | Se resuelve en T-01 (script con patrón `src/**/*.test.ts`) |
| P5 | El frontend no tiene pantalla para **editar** una partida (el `PUT` sí existe en la API) | Medio: el requisito «reconsultar al editar» no tiene flujo en la UI | Se difiere (ver backlog, Deuda técnica) |
| P6 | No hay tests de integración de la API (solo de funciones puras) | Medio | Se difiere; la API se verifica con `requests.http` / curl |
| P7 | `calcularResumen` vive en `services/` y no en una capa de dominio | Bajo | Se difiere: el resumen «no cambia» en esta épica; E2 crea `src/dominio/` y lo reutiliza |
| P8 | Sin índice compuesto `{ videojuego, fecha }` en partidas | Bajo con el volumen actual | Se difiere |
| P9 | El frontend no tiene infraestructura de tests | Medio | Se difiere: la lógica nueva se pone en el backend (dominio), que sí se prueba |
| P10 | `hoyISO()` del front usa la zona del navegador; el backend usará `America/Guayaquil` | Bajo (la persona usuaria está en Ecuador) | Se difiere, documentado como supuesto |
| P11 | El README dice que `main` solo tiene el commit inicial; ya no es cierto | Bajo | Se corrige al actualizar el README al final |

## 3. Decisiones

1. **Se completa antes o dentro de E2:** P1, P2, P3, P4.
2. **Se difiere:** P5–P11, cada uno con su motivo en `docs/backlog/E2-metas-y-rachas.md` → «Deuda técnica».
3. **No se tocan** (según el enunciado): el modelo de Videojuego y Partida, el resumen, la arquitectura por capas ni el formato de error. P2 y P3 solo endurecen la validación de `fecha`, no cambian el esquema.
4. Hallazgo clave para E2: `fecha` se guarda como **medianoche UTC del día calendario elegido**. Para saber a qué día pertenece una partida se usa su fecha UTC (`YYYY-MM-DD`), **no** se convierte a hora de Ecuador (convertirla movería todas las partidas al día anterior, 19:00). La zona `America/Guayaquil` solo se usa para saber **qué día es hoy**.
