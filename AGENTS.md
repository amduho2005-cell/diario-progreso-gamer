# AGENTS.md — Diario de Progreso Gamer

## Proyecto
App para registrar videojuegos, partidas y progreso. E1 (Proyecto 3): juegos, logros, partidas y resumen.
E2 (actual): metas semanales por juego, días jugados, rachas e hitos. Producto en `docs/prd/`.

## Stack
- Backend: Node 20+, Express 5, TypeScript, Mongoose 8, MongoDB Atlas. Tests: `node:test` + `tsx`.
- Frontend: React 19, TypeScript, Vite, React Router 7. CSS propio, sin librerías de UI.
- Despliegue: Render (Web Service + Static Site).

## Estructura
- `backend/src/` → `models/` · `services/` (acceso a datos) · `dominio/` (funciones puras, sin BD)
  · `controllers/` · `routes/` · `middlewares/` · `errors/` · `scripts/seed.ts`
- `frontend/src/` → `api/` (servicios HTTP) · `types/` · `components/` · `hooks/` · `pages/`
- `docs/` → `diagnostico.md` · `prd/` · `backlog/` · `specs/` · `AUDITORIA.md` · `bitacora-agente.md`

## Comandos
- Backend: `cd backend && npm run dev` · `npm test` · `npx tsc --noEmit` · `npm run seed`
- Frontend: `cd frontend && npm run dev` · `npm run build` · `npm run lint`

## Convenciones
- Código, nombres y mensajes en español (`horasSemanales`, `obtenerProgreso`).
- Controladores delgados; la lógica va en servicios; los cálculos, en `dominio/` como funciones puras.
- Errores con las clases de `src/errors/`; el `errorHandler` traduce a 400/404/409/500 con
  `{ error: { tipo, mensaje, detalles?, requestId } }`.
- Commits: `tipo(E2): T-XX descripción` para implementación; `docs:` para documentación.
- Fechas de partida: `YYYY-MM-DD` guardado a medianoche UTC. «Hoy» y la semana: `America/Guayaquil`.

## Frontend
- La identidad visual está en `DESIGN.md`: léelo antes de tocar estilos o componentes.
- Solo variables CSS de `index.css` derivadas de `DESIGN.md`; nada de colores sueltos.
- Las llamadas HTTP van en `src/api/*Api.ts`, nunca dentro de los componentes.

## Reglas
1. NUNCA leer, mostrar ni modificar archivos `.env` (solo `.env.example`). Un hook lo bloquea.
2. Ninguna funcionalidad sin una spec en `docs/specs/`. Si no existe, escribirla y commitearla primero.
3. Seguir la cadena SDD: PRD → historia → criterio → ticket → spec → test → código → auditoría.
4. En dominio: primero el test que falla, luego el código.
5. Ejecutar `npm test` (backend) y `npm run build` (frontend) antes de dar una tarea por terminada.
6. No cambiar el modelo de Videojuego/Partida ni el resumen sin una decisión en `docs/diagnostico.md`.
7. Si algo no está en la spec o el PRD, preguntar; no inventar producto.
8. No agregar dependencias sin justificarlo en la spec.
