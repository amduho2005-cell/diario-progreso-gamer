# 🎮 Diario de Progreso Gamer

Proyecto full-stack del curso **Desarrollo Web 3**: backend en Express + TypeScript + Mongoose (MongoDB Atlas) y frontend en React + TypeScript + Vite.

## 1. Intención del proyecto

Una app para registrar los videojuegos que tengo, las partidas que juego de cada uno y un **resumen calculado** de mi progreso.

**Pregunta que responde:** *¿qué estoy jugando ahora, cuánto le he dedicado y qué tan avanzado voy?*

- **Videojuegos**: nombre, plataforma, género, estado (jugando / pausado / completado / abandonado) y su lista de logros.
- **Partidas**: cada sesión de juego (fecha, duración, % de avance, notas).
- **Resumen**: total de partidas, horas totales, última partida y avance actual de un juego, calculado en el backend en cada petición.

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
