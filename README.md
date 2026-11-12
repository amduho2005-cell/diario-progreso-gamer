# 🎮 Diario de Progreso Gamer

Proyecto full-stack del curso **Desarrollo Web 3**: backend en Express + TypeScript + Mongoose (MongoDB Atlas) y frontend en React + TypeScript + Vite.

## 1. Intención del proyecto

Una app para registrar los videojuegos que tengo, las partidas que juego de cada uno y un **resumen calculado** de mi progreso.

**Preguntas que responde:**
- E1 (Proyecto 3): *¿qué estoy jugando ahora, cuánto le he dedicado y qué tan avanzado voy?*
- E2 · Metas y rachas (Proyecto 4): *¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?*

- **Videojuegos**: nombre, plataforma, género, estado (jugando / pausado / completado / abandonado) y su lista de logros.
- **Partidas**: cada sesión de juego (fecha, duración, % de avance, notas).
- **Resumen**: total de partidas, horas totales, última partida y avance actual de un juego, calculado en el backend en cada petición.
- **Metas** (E2): por juego, horas y días por semana, con hasta 5 hitos de avance; una sola activa por juego.
- **Progreso semanal** (E2): horas y días de la semana (lunes a domingo, hora de Ecuador), racha actual, mejor racha e hitos alcanzados, calculados en el backend con funciones puras (`backend/src/dominio/`).

## 2. Modelo de datos

```
Videojuego  (colección "videojuegos", timestamps)
├── _id
├── nombre: string (required, trim)
├── plataforma: "PC" | "PlayStation" | "Xbox" | "Switch" | "Movil" (required)
├── genero: "accion" | "rol" | "estrategia" | "puzzle" | "deportes" | "otro" (required)
├── estado: "jugando" | "pausado" | "completado" | "abandonado" (required, default "jugando")
├── logros: [                       ← SUB-DOCUMENTOS EMBEBIDOS
│     ├── _id
│     ├── nombre: string (required, trim)
│     └── obtenido: boolean (default false)
│   ]
├── createdAt
└── updatedAt

Partida  (colección "partidas", timestamps)
├── _id
├── videojuego: ObjectId → ref "Videojuego" (required, index)   ← REFERENCIA
├── fecha: Date (required)
├── duracionMinutos: number (required, min 1)
├── porcentajeAvance: number (required, 0–100)
├── notas?: string (trim, maxlength 500)
├── createdAt
└── updatedAt
```

```
Meta  (colección "metas", timestamps) — E2
├── _id
├── videojuego: ObjectId → ref "Videojuego" (required)        ← REFERENCIA
├── horasSemanales: number (> 0 y ≤ 100)
├── diasPorSemana: number entero (1–7)
├── activa: boolean (default true)  — índice único parcial: máx. 1 activa por juego
├── hitos: [ { descripcion, porcentajeObjetivo: 1–100 } ]  (máx. 5)   ← EMBEBIDOS
├── createdAt
└── updatedAt
```

- **Meta se referencia** porque tiene su propio ciclo de vida (se crea, se edita y se desactiva sin tocar la ficha del juego) y guarda un historial de metas anteriores.
- **Los hitos se embeben** porque son pocos (máx. 5) y solo tienen sentido dentro de su meta.
- **«Alcanzado» no se guarda**: se calcula con el avance actual del juego, para no duplicar un dato que ya está en las partidas.

### ¿Por qué `logros` se embebe?

- **Se lee siempre junto con el juego**: en la pantalla de detalle se muestran el juego y sus logros a la vez; embebidos se obtienen en una sola consulta, sin `populate` ni joins.
- **No tiene entidad propia**: un logro no existe fuera de su juego ni se consulta por separado ("el logro X" no tiene sentido sin "del juego Y").
- **Lista corta y acotada**: un juego tiene un número pequeño y limitado de logros, así que el documento no crece sin control.
- Aun así cada logro tiene su propio `_id`, lo que permite operar sobre uno solo (`PATCH /api/videojuegos/:id/logros/:logroId`).

### ¿Por qué `Partida` se referencia?

- **Crece sin límite**: cada sesión de juego agrega una partida; embebidas, el documento del juego crecería indefinidamente y podría acercarse al **límite de 16 MB por documento** de MongoDB.
- **Se consulta independiente del juego**: por ejemplo "todas mis partidas de esta semana" (`GET /api/partidas?desde=...&hasta=...`) cruza todos los juegos; con una colección propia es una consulta directa por `fecha`.
- El campo `videojuego` tiene **índice**, así que "las partidas de un juego" (ruta anidada y resumen) también es eficiente. Cuando se necesita el juego completo se usa `.populate("videojuego")`.

### ¿Por qué el resumen se calcula en el backend?

- Vive en la **capa de servicio** (`partidas.service.ts`), no en el controlador ni en el frontend: es **una sola fuente de verdad** para cualquier cliente (esta web, una app móvil, Postman…), todos obtienen exactamente el mismo número.
- **Nunca se guarda**: se recalcula en cada request, así que siempre está actualizado al agregar o eliminar partidas (no hay datos derivados desincronizados).
- El frontend solo lo pide (`GET /api/videojuegos/:id/resumen`) y lo vuelve a pedir tras cada cambio.

## 3. Fórmula del resumen

`GET /api/videojuegos/:id/resumen` → se toman **todas** las partidas del videojuego (404 si el juego no existe) y se calcula con la función pura `calcularResumen(partidas)`:

| Campo | Fórmula |
|---|---|
| `totalPartidas` | cantidad de partidas |
| `horasTotales` | `Math.round((Σ duracionMinutos / 60) * 10) / 10` → horas con **1 decimal**. Se suma todo en minutos y se redondea **solo al final**, no partida por partida |
| `ultimaPartida` | la `fecha` más reciente, en ISO 8601 |
| `porcentajeAvanceActual` | el `porcentajeAvance` de la partida con la `fecha` más reciente. **Desempate**: si dos partidas tienen la misma fecha, gana la de `createdAt` más reciente |

**Caso cero partidas** (no se rompe):

```json
{ "totalPartidas": 0, "horasTotales": 0, "ultimaPartida": null, "porcentajeAvanceActual": 0 }
```

Ejemplo con 8 partidas (870 minutos):

```json
{
  "totalPartidas": 8,
  "horasTotales": 14.5,
  "ultimaPartida": "2026-10-02T00:00:00.000Z",
  "porcentajeAvanceActual": 67
}
```

## 4. Endpoints

Base: `/api`. Todas las respuestas son JSON e incluyen el header `X-Request-Id`.

### Videojuegos

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/videojuegos` | Lista videojuegos. Filtros opcionales: `?plataforma=&genero=&estado=&nombre=` (nombre: parcial, sin distinguir mayúsculas). Valores de enum inválidos → 400 | 200, 400 |
| GET | `/videojuegos/:id` | Obtiene un videojuego con sus logros | 200, 400, 404 |
| POST | `/videojuegos` | Crea un videojuego (con logros opcionales) | 201, 400 |
| PUT | `/videojuegos/:id` | Actualiza (`runValidators: true`, `new: true`) | 200, 400, 404 |
| DELETE | `/videojuegos/:id` | Elimina el videojuego **y todas sus partidas** (borrado en cascada, para no dejar referencias huérfanas) | 204, 400, 404 |
| POST | `/videojuegos/:id/logros` | Agrega un logro `{ nombre }` | 201, 400, 404 |
| PATCH | `/videojuegos/:id/logros/:logroId` | Marca/desmarca un logro `{ obtenido: boolean }` | 200, 400, 404 |
| DELETE | `/videojuegos/:id/logros/:logroId` | Elimina un logro | 200, 400, 404 |
| GET | `/videojuegos/:id/partidas` | Partidas de ese videojuego (fecha desc) | 200, 400, 404 |
| GET | `/videojuegos/:id/resumen` | **Resumen calculado** (ver sección 3) | 200, 400, 404 |

### Partidas

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| GET | `/partidas` | Todas las partidas con `populate("videojuego")`, por fecha desc. Filtros opcionales `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` (ambos inclusivos) | 200, 400 |
| GET | `/partidas/:id` | Una partida (con populate) | 200, 400, 404 |
| POST | `/partidas` | Crea una partida. El servicio valida que el videojuego referenciado exista | 201, 400, 404 |
| PUT | `/partidas/:id` | Actualiza una partida (misma validación de referencia) | 200, 400, 404 |
| DELETE | `/partidas/:id` | Elimina una partida | 204, 400, 404 |

### Metas y progreso semanal (E2)

| Método | Ruta | Descripción | Códigos |
|---|---|---|---|
| POST | `/metas` | Crea una meta `{ videojuego, horasSemanales, diasPorSemana, hitos? }`. Solo juegos `jugando`/`pausado` y sin otra meta activa | 201, 400, 404, 409 |
| GET | `/metas/:id` | Obtiene una meta | 200, 400, 404 |
| PUT | `/metas/:id` | Edita horas, días e hitos de una meta activa (`activa` se ignora) | 200, 400, 404, 409 |
| PATCH | `/metas/:id/desactivar` | Desactiva la meta (queda en el historial) | 200, 400, 404 |
| GET | `/videojuegos/:id/metas` | Historial de metas del juego (más reciente primero) | 200, 400, 404 |
| GET | `/videojuegos/:id/progreso-semanal` | **Progreso calculado**: semana, meta, horas, % (sin tope: puede ser 140), días, rachas e hitos | 200, 400, 404 |

Eliminar un videojuego también elimina sus metas; marcarlo como completado o abandonado desactiva su meta activa.
Las reglas completas (huecos H1–H14) están en [`docs/prd/PRD.md`](docs/prd/PRD.md) y el contrato en
[`docs/specs/backend-metas-progreso.md`](docs/specs/backend-metas-progreso.md). Desde E2, la `fecha` de una partida debe
ser `AAAA-MM-DD` y no puede ser futura (400).

Otros: `GET /api/salud` (health check), y cualquier ruta inexistente → 404 JSON.

Ejemplos listos para ejecutar en [`backend/requests.http`](backend/requests.http) (extensión REST Client de VS Code o Thunder Client).

## 5. Manejo de errores

Un único `errorHandler` (último middleware) responde siempre con el mismo formato:

```json
{ "error": { "tipo": "ValidacionError", "mensaje": "Los datos enviados no son válidos", "detalles": { "plataforma": "Plataforma inválida…" }, "requestId": "3a01a44c-…" } }
```

| # | Caso | Origen | Status | `tipo` |
|---|---|---|---|---|
| 1 | Validación de esquema (campo requerido, enum, min/max…) | `mongoose.Error.ValidationError` | **400** (con `detalles` por campo) | `ValidacionError` |
| 2 | Id mal formado (ej. `/videojuegos/abc`) | `mongoose.Error.CastError` | **400** | `IdInvalido` |
| 3 | Referencia inexistente (partida con un videojuego que no existe) / recurso no encontrado | `ReferenciaInexistenteError` / `NotFoundError` (propios, en `src/errors/`) | **404** | `ReferenciaInexistente` / `NoEncontrado` |
| 4 | Conflicto con el estado actual (segunda meta activa, meta para un juego completado, editar meta desactivada) | `ConflictError` / clave duplicada de MongoDB (11000) | **409** | `Conflicto` |
| 5 | Error inesperado | cualquier otro | **500** (el `stack` solo se incluye si `NODE_ENV` ≠ `production`) | `ErrorInterno` |

Además: filtros de query inválidos y body mal formado (`JSON` roto, `obtenido` no booleano) → 400. Express 5 envía automáticamente al `errorHandler` los errores de los controladores `async`, así que no hace falta un `asyncHandler`.

Middlewares: `requestId` (UUID con `crypto.randomUUID()`, en `res.locals.requestId` y header `X-Request-Id`) y `logger` (método, ruta, status, duración en ms y requestId).

### Cómo provocar cada error (con `backend/requests.http`)

1. **400 validación**: `POST /api/videojuegos` con `{ "plataforma": "Atari", "genero": "terror" }`.
2. **400 id mal formado**: `GET /api/videojuegos/abc`.
3. **404 referencia inexistente**: `POST /api/partidas` con `"videojuego": "64b000000000000000000000"` (ObjectId válido que no existe).
4. **409 conflicto**: `POST /api/metas` dos veces para el mismo juego (ver sección E2 de `requests.http`).
5. **500**: en desarrollo, `GET /api/debug/error` (ruta de prueba que lanza un error; no existe en producción). Alternativa: con el servidor corriendo, quitar tu IP de *Network Access* en Atlas (o pausar el cluster) y llamar a `GET /api/videojuegos`.

## 6. Instalación y ejecución local

Requisitos: Node 20+ y un cluster de MongoDB Atlas (gratis).

```bash
git clone <URL_DEL_REPO>
cd diario-progreso-gamer
```

**Backend** (terminal 1):

```bash
cd backend
cp .env.example .env      # completa MONGODB_URI con tu cadena de Atlas
npm install
npm run seed              # limpia y carga datos de ejemplo
npm run dev               # http://localhost:3000/api
npm test                  # 34 tests: resumen (E1), progreso/rachas/hitos (E2) y fecha de partida
```

**Frontend** (terminal 2):

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev               # http://localhost:5173
```

Build de producción: `npm run build` en cada carpeta (backend compila a `backend/dist/`, frontend a `frontend/dist/`).

## 7. Despliegue en Render

**0. MongoDB Atlas** → *Network Access* → agregar `0.0.0.0/0` (Render no tiene IP fija).

**1. Backend — Web Service**

| Campo | Valor |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Variables de entorno | `MONGODB_URI` = cadena de Atlas · `CORS_ORIGIN` = `FRONTEND_URL` (sin `/` final; admite varias separadas por comas) · `NODE_ENV` = `production` |

`PORT` lo asigna Render automáticamente y el servidor lo lee de `process.env.PORT`. `typescript` y los `@types/*` están en `dependencies` para que `npm run build` funcione en Render. Para cargar datos de ejemplo en producción, corre `npm run seed` **desde tu computadora** (el `.env` local apunta al mismo cluster de Atlas); en Render no se instala `tsx` porque es devDependency.

**2. Frontend — Static Site**

| Campo | Valor |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Variables de entorno | `VITE_API_URL` = `BACKEND_URL/api` |
| **Redirects/Rewrites** | Source `/*` → Destination `/index.html` → Action **Rewrite** |

> Sin la regla de *Rewrite*, recargar una ruta interna (ej. `/videojuegos/123`) da 404, porque Render buscaría ese archivo en el servidor en lugar de dejar que React Router resuelva la ruta.

`VITE_API_URL` se incrusta en tiempo de build: si la cambias, vuelve a desplegar el frontend. Después de tener la URL del frontend, actualiza `CORS_ORIGIN` en el backend.

## 8. URLs públicas

- **Frontend:** https://diario-progreso-gamer-1-ugo1.onrender.com
- **Backend:** https://diario-progreso-gamer-b994.onrender.com (ej. [`/api/videojuegos`](https://diario-progreso-gamer-b994.onrender.com/api/videojuegos), [`/api/salud`](https://diario-progreso-gamer-b994.onrender.com/api/salud))

> En el plan gratuito de Render el backend se suspende tras 15 min sin uso: la primera petición puede tardar ~50 s.

## 9. Flujo de Git

- E1 se desarrolló en **`feature/diario-gamer`** y se integró a `main` con los PR #1 y #2.
- E2 se desarrolla en **`feature/e2-metas-rachas`** y se integra con un PR que lista los tickets (ver sección 10).
- En E1 se hicieron commits pequeños por capa (`config:`, `modelo:`, `servicio:`, `controlador:`, `ruta:`, `middleware:`, `test:`, `seed:`, `api:`, `pantalla:`…), siguiendo las etapas: diseño → backend Videojuego → backend Partida y resumen → frontend → despliegue.
- En E2 los commits de implementación nombran su ticket (`feat(E2): T-08 …`, `fix(deuda): T-13 …`) y los tests de dominio se commitean en rojo antes del código.
- La integración a `main` se hace siempre mediante un **Pull Request** en GitHub.
- `.env` nunca se commitea; sí `backend/.env.example` y `frontend/.env.example`.

## Estructura

```
diario-progreso-gamer/
├── backend/   Express 5 + TypeScript + Mongoose 8
│   └── src/ config · models · services · dominio · controllers · routes · middlewares · errors · scripts/seed.ts · app.ts · server.ts
├── frontend/  React + TypeScript + Vite + React Router
│   └── src/ api · types · components · hooks · pages
├── docs/      diagnóstico, PRD, backlog, specs, auditoría, bitácora del agente
├── .claude/   skills y hooks del harness
├── AGENTS.md · CLAUDE.md · DESIGN.md
└── README.md
```

## 10. Cómo trabajamos con el agente

E2 se construyó con Claude Code siguiendo **Spec-Driven Development**:
diagnóstico → harness → PRD → épica → historias → criterios → tickets → specs → código con tests → auditoría.
Cada fase terminó en un commit, y cada spec está en el historial **antes** que el código que la implementa.

**Harness**

| Pieza | Archivo | Para qué |
|---|---|---|
| Memoria del proyecto | [`AGENTS.md`](AGENTS.md) (y [`CLAUDE.md`](CLAUDE.md) → `@AGENTS.md`) | Stack, estructura, comandos, convenciones y reglas (no tocar `.env`, nada sin spec, tests antes de terminar) |
| Sistema de diseño | [`DESIGN.md`](DESIGN.md) | Colores, tipografía, espaciado, componentes, tono, accesibilidad y «no hacemos» |
| Skill `/commit` | [`.claude/skills/commit`](.claude/skills/commit/SKILL.md) | Corre tests/build, verifica que la spec del ticket ya esté commiteada y escribe `feat(E2): T-XX …` |
| Skill `/nueva-spec` | [`.claude/skills/nueva-spec`](.claude/skills/nueva-spec/SKILL.md) | Plantilla de spec: DEBE / NO DEBE, criterio → verificación, ticket → archivos |
| Hook `PreToolUse` | [`.claude/hooks/proteger-env.sh`](.claude/hooks/proteger-env.sh) | Bloquea leer o editar cualquier `.env` (permite `.env.example`) |
| Hook `PostToolUse` | [`.claude/hooks/typecheck.sh`](.claude/hooks/typecheck.sh) | Tras editar un `.ts/.tsx`, corre el type-check del paquete y avisa al agente si falla |

Las skills tienen `disable-model-invocation: true`: solo las lanza una persona con `/commit` o `/nueva-spec`.

**Dónde está cada documento**

| Fase | Documento |
|---|---|
| Diagnóstico | [`docs/diagnostico.md`](docs/diagnostico.md) |
| Producto | [`docs/prd/PRD.md`](docs/prd/PRD.md) (huecos H1–H14 resueltos) |
| Épicas | [`docs/backlog/epicas.md`](docs/backlog/epicas.md) |
| Historias, criterios, tickets y deuda | [`docs/backlog/E2-metas-y-rachas.md`](docs/backlog/E2-metas-y-rachas.md) |
| Specs | [`docs/specs/`](docs/specs/) (backend, frontend y deuda de fechas) |
| Auditoría (criterio → evidencia, pruebas curl, revisión de diseño) | [`docs/AUDITORIA.md`](docs/AUDITORIA.md) |
| Bitácora del agente | [`docs/bitacora-agente.md`](docs/bitacora-agente.md) |

**Trazabilidad de un criterio, de punta a punta (ejemplo H1 «la racha sigue viva si hoy aún no juegas»)**
PRD H1 → HU-5 / CA-5.1 → ticket T-03 → spec backend regla D-6 → test `CA-5.1` en `backend/src/dominio/progreso.test.ts`
→ `calcularRachas()` en `backend/src/dominio/progreso.ts` → fila CA-5.1 en `docs/AUDITORIA.md`.
