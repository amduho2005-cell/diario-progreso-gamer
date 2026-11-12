# Auditoría — E2 · Metas y rachas

Fecha: 2026-11-11 · Rama `feature/e2-metas-rachas`. Una fila por criterio de cada spec.

**Entorno de verificación:** `npm test` en el backend (34/34 en verde: 30 de E2 y deuda, 4 de E1).
API levantada en local contra un MongoDB **en memoria** (`mongodb-memory-server`, fuera del repo) para no tocar Atlas.
Pruebas con curl (§4) y en el navegador con el frontend (`vite`) apuntando a esa API. Hoy = miércoles 11-nov-2026.

## 1. Spec backend — `docs/specs/backend-metas-progreso.md`

| Criterio | Cómo se verificó | Resultado | Evidencia |
|---|---|---|---|
| CA-1.1 crear meta | curl POST `/metas` | ✅ 201, `activa: true` | §4 «Crear meta» · commit `3e48b55` |
| CA-1.2 segunda meta activa | curl (y 4 POST simultáneos) | ✅ 409 «ya tiene una meta activa»; solo 1 creada | §4 · índice único parcial `meta.model.ts` |
| CA-1.3 límites horas/días | curl 0 h / 8 días / 101 h / 3.5 días | ✅ 400 con `detalles` por campo | §4 |
| CA-1.4 juego completado | curl POST para Hades | ✅ 409 | §4 |
| CA-1.5 juego inexistente | curl | ✅ 404 `ReferenciaInexistente` | §4 |
| CA-2.1 hitos 25/50/100 con 67 % | test + curl | ✅ `[true, true, false]` | `progreso.test.ts` «CA-2.1» · §4 |
| CA-2.2 avance = objetivo | test | ✅ | «CA-2.2» |
| CA-2.3 menos avance des-alcanza | test + navegador | ✅ | «CA-2.3» · al borrar la partida del 55 % el hito del 50 % volvió a «Pendiente» |
| CA-2.4 6 hitos / 0 % / sin descripción | curl | ✅ 400 | §4 |
| CA-2.5 sin partidas | test | ✅ | «CA-2.5» |
| CA-3.1 cambio de meta a mitad de semana | test + curl | ✅ 70 % → 50 % con 7 h | «CA-3.1» · §4 |
| CA-3.2 desactivar y crear otra | curl | ✅ | §4 |
| CA-3.4 completar desactiva | curl PUT juego + GET meta | ✅ `activa: false` | §4 · `a3d4fe4` |
| CA-3.5 eliminar juego borra metas | curl DELETE + GET | ✅ 404 | §4 · `a3d4fe4` |
| CA-3.6 historial | curl GET `/videojuegos/:id/metas` | ✅ 2 metas, la más reciente primero | §4 |
| CA-3.7 editar desactivada | curl PUT | ✅ 409 | §4 |
| CA-4.1 semana lun–dom | test + curl | ✅ 2026-11-09 → 2026-11-15 | «CA-4.1» |
| CA-4.2 domingo 23:30 Ecuador | test | ✅ | «CA-4.2» |
| CA-4.3 horas de la semana | test + curl | ✅ 3.5 | «CA-4.3» · §4 |
| CA-4.4 porcentaje 70 | test + curl | ✅ | «CA-4.4» · §4 |
| CA-4.5 porcentaje 140 | test + navegador | ✅ «140%» con barra llena | «CA-4.5» |
| CA-4.6 mismo día = 1 día | test + curl | ✅ 2 partidas el 10-nov → 3 días | «CA-4.6» · §4 |
| CA-4.7 sin meta | test + curl | ✅ `meta: null`, `porcentajeHoras: null` | «CA-4.7» · §4 |
| CA-4.8 sin partidas | test + curl | ✅ todo en 0 | «CA-4.8» · §4 |
| CA-4.9 400 / 404 | curl | ✅ `IdInvalido` / `NoEncontrado` | §4 |
| CA-4.10 día registrado | test | ✅ | «CA-4.10» |
| CA-5.1 … CA-5.6 rachas | tests | ✅ | «CA-5.1» … «CA-5.6»; curl: racha rota 4 → actual 3, mejor 4 |
| D-3 redondeo al final | test | ✅ | «D-3» |
| D-15 409 en errorHandler | curl | ✅ `{ tipo: "Conflicto" }` | `2b6e4f6` |
| N-1 nada calculado se guarda | revisión de código | ✅ `Meta` no tiene `alcanzado` ni totales | `meta.model.ts` |
| N-2 dominio sin BD | revisión | ✅ `src/dominio/` no importa mongoose | `progreso.ts` |
| N-3 días futuros no cuentan | test | ✅ | «N-3» |
| N-4 `activa` no se acepta del cliente | curl PUT con `activa:false` | ✅ ignorado | §4 |
| N-5 resumen de E1 intacto | tests de E1 | ✅ 4/4 | `partidas.service.test.ts` |

## 2. Spec frontend — `docs/specs/frontend-progreso-meta.md`

| Criterio | Cómo se verificó | Resultado | Evidencia |
|---|---|---|---|
| CA-1.1 | navegador: Crear meta → panel | ✅ | flujo T-12 |
| CA-1.2 | navegador: formulario abierto + meta creada por curl → Guardar | ✅ se muestra «"Hollow Knight" ya tiene una meta activa…» | error general del formulario |
| CA-1.3, CA-2.4 | navegador: 0 h, 8 días, hitos vacíos | ✅ errores bajo cada campo; «+ Agregar hito» se desactiva en 5/5 | — |
| CA-2.1 | navegador | ✅ ✔ verdes en 25 % y 50 % tras partida de 55 % | — |
| CA-3.1 | navegador: editar a 1.5 h | ✅ 140 % y «¡Meta de la semana cumplida!» | — |
| CA-3.2 | navegador: Desactivar → Aceptar | ✅ aparece invitación «Crear meta» | — |
| CA-3.3 | navegador: Desactivar → Cancelar | ✅ la meta sigue | — |
| CA-4.7 | navegador | ✅ horas/días/rachas + invitación; en juegos completados, mensaje explicativo | — |
| CA-6.1 | navegador: eliminar partida | ✅ 4.1 h → 2.1 h sin recargar | `DetalleVideojuego.tsx` |
| CA-6.2 | navegador: registrar partida desde el detalle | ✅ 2.1 h → 4.1 h, 3 días, racha 3 | — |
| CA-6.3 | navegador: petición de progreso forzada a fallar | ✅ `MensajeError` + «Reintentar» solo en el panel | — |
| F-1 / NF-1 sin cálculos ni fetch en componentes | `grep -rn "fetch\|request(" src/components src/pages` | ✅ 0 coincidencias | — |
| F-7 / NF-2 solo variables de DESIGN.md, sin librerías | revisión de diseño (§5) y `package.json` | ✅ | — |

## 3. Spec deuda — `docs/specs/deuda-fecha-partida.md`

| Criterio | Cómo se verificó | Resultado | Evidencia |
|---|---|---|---|
| CA-D1.1 fecha con hora | test (en rojo antes del código) + curl | ✅ 400 | `fechaPartida.test.ts` · `480da9d` → `179698a` |
| CA-D1.2 día válido / imposible | test + curl | ✅ 201 / 400 | ídem |
| CA-D2.1 fecha futura | test + curl | ✅ 400 | `480da9d` → `568650a` |
| CA-D2.2 hoy | test + curl | ✅ 201 | ídem |
| CA-D2.3 23:30 en Ecuador | test | ✅ | ídem |
| DF-3 PUT sin fecha no valida | curl | ✅ 200 | §4 |

## 4. Pruebas con curl

### 4.1 Metas y progreso (juego sin partidas; juego con 9 partidas en 7 días distintos y racha rota; 400, 404, 409)

| Caso | Petición | Status | Resultado |
|---|---|---|---|
| Juego sin partidas ni meta (CA-4.7, 4.8) | `GET /videojuegos/HK/progreso-semanal` | 200 | {"semana":{"inicio":"2026-11-09","fin":"2026-11-15"},"meta":null,"horasSemana":0,"porcentajeHoras":null,"diasJugadosSemana":0,"rachaActual":0,"mejorRacha":0,"hitos":[]} |
| 9 partidas registradas para Elden Ring | `POST /partidas ×9` | 201 | {"fecha":"2026-11-11T00:00:00.000Z","porcentajeAvance":67} (última) |
| Crear meta (CA-1.1) | `POST /metas` | 201 | {"horasSemanales":5,"diasPorSemana":4,"activa":true,"hitos":3} |
| Progreso con ≥5 partidas y racha rota (CA-4.x, 5.x, 2.1) | `GET /videojuegos/ER/progreso-semanal` | 200 | {"semana":{"inicio":"2026-11-09","fin":"2026-11-15"},"meta":{"horasSemanales":5,"diasPorSemana":4},"horasSemana":3.5,"porcentajeHoras":70,"diasJugadosSemana":3,"rachaActual":3,"mejorRacha":4,"hitos":[{"descripcion":"Llegar al 25 %","porcentajeObjetivo":25,"alcanzado":true},{"descripcion":"Llegar al 50 %","porcentajeObjetivo":50,"alcanzado":true},{"descripcion":"Terminar el juego","porcentajeObjetivo":100,"alcanzado":false}]} |
| Segunda meta activa (CA-1.2) | `POST /metas` | 409 | "\"Elden Ring\" ya tiene una meta activa. Edítala o desactívala antes de crear otra." |
| Horas 0 y 8 días (CA-1.3) | `POST /metas` | 400 | {"horasSemanales":"Las horas por semana deben ser mayores que 0","diasPorSemana":"Los días por semana no pueden ser más de 7"} |
| 101 h y 3.5 días (CA-1.3) | `POST /metas` | 400 | {"horasSemanales":"Las horas por semana no pueden ser más de 100","diasPorSemana":"Los días por semana deben ser un número entero"} |
| 6 hitos (CA-2.4) | `POST /metas` | 400 | {"hitos":"Una meta puede tener como máximo 5 hitos"} |
| Hito 0 % sin descripción (CA-2.4) | `POST /metas` | 400 | {"hitos.0.descripcion":"La descripción del hito es obligatoria","hitos.0.porcentajeObjetivo":"El porcentaje objetivo debe ser al menos 1"} |
| Juego completado (CA-1.4) | `POST /metas` | 409 | "\"Hades\" está completado: solo los juegos en curso o pausados pueden tener una meta activa" |
| Juego inexistente (CA-1.5) | `POST /metas` | 404 | "El videojuego referenciado (64b000000000000000000000) no existe" |
| Id de juego mal formado | `POST /metas` | 400 | "IdInvalido" |
| Progreso con id mal formado (CA-4.9) | `GET /videojuegos/abc/progreso-semanal` | 400 | "IdInvalido" |
| Progreso de juego inexistente (CA-4.9) | `GET /videojuegos/64b0…/progreso-semanal` | 404 | "No existe un videojuego con id 64b000000000000000000000" |
| Obtener meta por id | `GET /metas/META` | 200 | {"horasSemanales":5,"activa":true} |
| Meta inexistente | `GET /metas/64b0…` | 404 | "NoEncontrado" |
| Editar meta a 7 h; `activa` se ignora (CA-3.1, N-4) | `PUT /metas/META` | 200 | {"horasSemanales":7,"activa":true} |
| Progreso con la meta nueva (CA-3.1) | `GET /videojuegos/ER/progreso-semanal` | 200 | {"meta":{"horasSemanales":7,"diasPorSemana":4},"horasSemana":3.5,"porcentajeHoras":50} |
| Editar con 0 días | `PUT /metas/META` | 400 | {"diasPorSemana":"Los días por semana deben ser al menos 1"} |
| Desactivar meta (CA-3.2) | `PATCH /metas/META/desactivar` | 200 | {"activa":false} |
| Editar meta desactivada (CA-3.7) | `PUT /metas/META` | 409 | "La meta está desactivada: crea una meta nueva en lugar de editarla" |
| Progreso sin meta activa (CA-4.7) | `GET /videojuegos/ER/progreso-semanal` | 200 | {"meta":null,"porcentajeHoras":null,"horasSemana":3.5,"diasJugadosSemana":3,"rachaActual":3,"hitos":[]} |
| Nueva meta tras desactivar (CA-3.2) | `POST /metas` | 201 | {"horasSemanales":6,"activa":true} |
| Historial de metas (CA-3.6) | `GET /videojuegos/ER/metas` | 200 | [{"horasSemanales":6,"activa":true},{"horasSemanales":7,"activa":false}] |
| Juego pasa a completado → meta desactivada (CA-3.4) | `PUT+GET /videojuegos/ER + /metas/META2` | 200 | {"activa":false} |
| Eliminar juego borra sus metas (CA-3.5) | `DELETE+GET /videojuegos/ER + /metas/META` | 404 | "NoEncontrado" |

Concurrencia: 4 POST simultáneos para el mismo juego → 1 creada (201) y 3 rechazadas (409).

### 4.2 Deuda D1/D2 (POST y PUT de partidas)

| Caso | Fecha enviada | Status | Resultado |
|---|---|---|---|
| CA-D1.1 fecha con hora | `2026-11-10T23:30` | 400 | {"fecha":"La fecha debe ser un día con formato AAAA-MM-DD, sin hora"} |
| CA-D1.1 ISO con zona | `2026-11-10T23:30:00-05:00` | 400 | {"fecha":"La fecha debe ser un día con formato AAAA-MM-DD, sin hora"} |
| CA-D1.2 fecha imposible | `2026-02-30` | 400 | {"fecha":"La fecha 2026-02-30 no existe en el calendario"} |
| CA-D2.1 mañana (futura) | `2026-11-12` | 400 | {"fecha":"La fecha no puede ser futura (hoy es 2026-11-11 en Ecuador)"} |
| CA-D2.2 hoy | `2026-11-11` | 201 | {"fecha":"2026-11-11T00:00:00.000Z"} |
| CA-D1.2 día válido | `2026-11-08` | 201 | {"fecha":"2026-11-08T00:00:00.000Z"} |
| DF-3 PUT con fecha futura | `2026-12-01` | 400 | {"fecha":"La fecha no puede ser futura (hoy es 2026-11-11 en Ecuador)"} |
| DF-3 PUT sin fecha | — | 200 | {"notas":"sin fecha"} |

La tabla 4.1 la genera `docs/evidencias/curl-e2.sh <URL_API>` (necesita `jq`); los mismos casos están en
`backend/requests.http` (sección E2).

## 5. Revisión de diseño contra `DESIGN.md`

| Punto de DESIGN.md | Hallazgo | Acción |
|---|---|---|
| Barra de progreso: relleno ≤ 100 %, texto real | Correcto («140%» con barra llena) | — |
| Spec F: días jugados con su barra | **Faltaba la barra de días** (solo había número) | Corregido en `caf10cd` |
| Responsive (< 760 px) | La regla heredada `nth-child(3)` dejaba «Mejor racha» sola a media fila | Corregido en `caf10cd` (`.progreso .stats`) |
| Una sola acción primaria por vista | «Crear meta» usa `.btn` (secundario); la primaria sigue siendo «+ Registrar partida» | — |
| Colores semánticos con texto | Hitos con ✔/○ + «Alcanzado/Pendiente»; racha amarilla con texto | — |
| Solo variables de `index.css` | Estilos nuevos usan `--verde`, `--amarillo`, `--tenue`, `--borde`, `--fondo` | — |
| Sin estilos en línea salvo ancho de barra | Correcto | — |
| Inputs con label visible | Los hitos del formulario usan `aria-label` (mismo patrón que los logros de E1) | Aceptado; anotado como mejora |
| Tono | «Aún no tienes una meta…», «¡Meta de la semana cumplida!», botones con verbo | — |
| Accesibilidad | `role="progressbar"` + `aria-valuetext`, emojis `aria-hidden`, confirmación al desactivar | — |

## 6. Tickets

T-01 … T-14 terminados (ver estado en `docs/backlog/E2-metas-y-rachas.md`). T-15: esta auditoría, README y PR.
Pendiente fuera del repositorio: redeploy de los dos servicios de Render con la rama integrada y prueba de humo en producción.
