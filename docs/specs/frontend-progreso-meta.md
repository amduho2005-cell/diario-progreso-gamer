# Spec · Frontend — Progreso semanal y formulario de meta

**Historias:** HU-1…HU-6 · **Tickets:** T-10, T-11, T-12 · **Diseño:** `DESIGN.md` · **API:** `docs/specs/backend-metas-progreso.md`.

## 1. Contrato

- **Tipos** (`src/types/index.ts`): `Hito`, `Meta`, `MetaInput`, `ProgresoSemanal` (igual a §3 de la spec backend).
- **Servicio** `src/api/metasApi.ts`:
  `obtenerProgreso(videojuegoId)`, `listarPorVideojuego(videojuegoId)`, `crear(input)`, `actualizar(id, input)`, `desactivar(id)`.
- **Componente** `src/components/ProgresoSemanal.tsx`: recibe el estado de `useCarga` del progreso (`datos`,
  `cargando`, `error`, `recargar`), el id del juego y si el juego puede tener meta. Muestra:
  - Semana (`9 nov – 15 nov`).
  - Barra de horas `horasSemana / horasSemanales` con `porcentajeHoras` (el relleno se limita a 100 %, el texto no).
  - Días jugados `diasJugadosSemana / diasPorSemana` con su barra.
  - Racha actual (🔥) y mejor racha.
  - Lista de hitos con estado (✔ alcanzado en verde / ○ pendiente).
  - Acciones «Editar meta» (enlace) y «Desactivar meta» (confirmación).
  - Sin meta activa: horas, días y rachas, más un `Vacio` que invita a «Crear meta» (o, si el juego está completado
    o abandonado, explica que esos juegos no llevan meta).
- **Página** `src/pages/FormMeta.tsx` en `/videojuegos/:id/meta`: si el juego tiene meta activa la edita, si no la crea.
  Campos: horas por semana, días por semana, lista de hitos (descripción + %), agregar/quitar hito (máx. 5).
  Al guardar vuelve al detalle.
- **`DetalleVideojuego`**: agrega el panel de progreso y lo recarga al eliminar una partida.

## 2. Reglas

**DEBE**
- F-1 Pedir el progreso al backend; el front no calcula horas, días, rachas ni hitos.
- F-2 Volver a pedir el progreso al eliminar una partida y cada vez que se abre el detalle (después de registrar una partida o guardar la meta se vuelve al detalle).
- F-3 Mostrar `Cargando`, `MensajeError` con «Reintentar» y el estado vacío «sin meta activa» con invitación a crear una.
- F-4 Validar en el formulario lo mismo que el backend (horas > 0 y ≤ 100, días entero 1–7, máx. 5 hitos, % 1–100, descripción obligatoria) y mostrar los errores por campo, incluidos los `detalles` que devuelva la API.
- F-5 Mostrar el mensaje del 409 tal como lo envía la API (meta duplicada o juego completado).
- F-6 Pedir confirmación antes de desactivar la meta; si se cancela no se llama a la API.
- F-7 Usar solo variables y clases de `index.css` definidas a partir de `DESIGN.md`; accesibilidad según `DESIGN.md`.
- F-8 Mostrar el porcentaje real de horas (ej. «140 %») aunque la barra se vea llena.

**NO DEBE**
- NF-1 Llamar a `fetch` o a `request` desde componentes o páginas (solo desde `src/api/`).
- NF-2 Agregar librerías de UI o de gráficos.
- NF-3 Enviar `activa` en el formulario (la desactivación es una acción aparte).
- NF-4 Mostrar historial de semanas, gráficos o rankings (no-alcance).

## 3. Criterio → verificación

| Criterio | Verificación | Paso |
|---|---|---|
| CA-1.1 | manual | Detalle de juego sin meta → «Crear meta» → 5 h, 4 días → Guardar → el panel muestra la meta |
| CA-1.2 | manual | Con la meta activa, abrir `/videojuegos/:id/meta` en otra pestaña antes de guardar la primera → mensaje 409 |
| CA-1.3, CA-2.4 | manual | Formulario con 0 h, 101 h, 8 días, 3.5 días, 6 hitos, hito 0 % → error bajo el campo, no se envía |
| CA-2.1 | manual | Juego con avance 67 % y hitos 25/50/100 → dos ✔ verdes y uno pendiente |
| CA-3.1 | manual | Editar meta de 5 h a 7 h → el porcentaje cambia en el detalle |
| CA-3.2 | manual | «Desactivar meta» → Aceptar → aparece la invitación a crear meta |
| CA-3.3 | manual | «Desactivar meta» → Cancelar → la meta sigue |
| CA-4.7 | manual | Juego sin meta → horas/días/rachas visibles e invitación a crear meta |
| CA-6.1 | manual | Eliminar una partida en el detalle → el progreso cambia sin recargar |
| CA-6.2 | manual | «+ Registrar partida» desde el detalle → guardar → el progreso incluye la partida |
| CA-6.3 | manual | Backend apagado → `MensajeError` con «Reintentar» en el panel |
| F-7, NF-1, NF-2 | revisión | Revisión de diseño contra `DESIGN.md` (tabla en `docs/AUDITORIA.md`) y `grep fetch src/components src/pages` |

## 4. Ticket → archivos

| Ticket | Archivos |
|---|---|
| T-10 | `frontend/src/types/index.ts`, `frontend/src/api/metasApi.ts` |
| T-11 | `frontend/src/components/ProgresoSemanal.tsx`, `frontend/src/components/BarraProgreso.tsx`, `frontend/src/pages/DetalleVideojuego.tsx`, `frontend/src/index.css` |
| T-12 | `frontend/src/pages/FormMeta.tsx`, `frontend/src/App.tsx`, `frontend/src/index.css` |
