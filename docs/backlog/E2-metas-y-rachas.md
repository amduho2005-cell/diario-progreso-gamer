# Backlog — E2 · Metas y rachas

Fuente: `docs/prd/PRD.md` (reglas RN-1…RN-6 y decisiones H1…H14). Los criterios no tienen detalle técnico;
la forma de verificarlos está en `docs/specs/`. Fecha de referencia en los ejemplos: hoy es **miércoles 11-nov-2026**.

## Historias y criterios de aceptación

### HU-1 · Fijar una meta semanal
**Como** jugador/a **quiero** fijar para un videojuego cuántas horas y cuántos días por semana quiero jugar
**para** saber qué me propuse y poder medirme.
*(INVEST: independiente del resto, negociable en los límites, valiosa por sí sola, estimable, pequeña y comprobable.)*

- **CA-1.1** DADO un juego «jugando» sin meta activa, CUANDO creo una meta de 5 horas y 4 días, ENTONCES la meta queda activa y la veo en el detalle del juego.
- **CA-1.2** DADO un juego que ya tiene una meta activa, CUANDO intento crear otra, ENTONCES se rechaza con el mensaje de que el juego ya tiene una meta activa.
- **CA-1.3** DADO que escribo 0 horas, más de 100 horas, 0 días, 8 días o 3,5 días, CUANDO guardo la meta, ENTONCES se rechaza indicando qué campo está mal.
- **CA-1.4** DADO un juego completado o abandonado, CUANDO intento crearle una meta, ENTONCES se rechaza explicando que solo los juegos en curso o pausados pueden tener meta (H7).
- **CA-1.5** DADO un juego que no existe, CUANDO intento crearle una meta, ENTONCES se rechaza indicando que el juego no existe.

### HU-2 · Hitos de avance
**Como** jugador/a **quiero** agregar a mi meta hasta 5 hitos de avance (por ejemplo «Llegar al 50 %»)
**para** celebrar las etapas del juego.

- **CA-2.1** DADO una meta con hitos de 25 %, 50 % y 100 % y un avance actual de 67 %, CUANDO veo el progreso, ENTONCES los hitos de 25 % y 50 % aparecen alcanzados y el de 100 % no.
- **CA-2.2** DADO un avance actual de exactamente 50 %, CUANDO veo el progreso, ENTONCES el hito de 50 % aparece alcanzado.
- **CA-2.3** DADO que el hito de 50 % estaba alcanzado, CUANDO registro una partida más reciente con 40 % de avance, ENTONCES el hito deja de aparecer alcanzado (H6).
- **CA-2.4** DADO que intento guardar 6 hitos, o un hito con 0 % o 101 %, o sin descripción, CUANDO guardo, ENTONCES se rechaza indicando el problema.
- **CA-2.5** DADO un juego sin partidas, CUANDO veo el progreso, ENTONCES ningún hito aparece alcanzado.

### HU-3 · Editar, desactivar y consultar metas
**Como** jugador/a **quiero** editar o desactivar mi meta y ver mis metas anteriores
**para** ajustarla cuando cambian mis planes sin perder el historial.

- **CA-3.1** DADO una meta de 5 horas y 3,5 horas jugadas esta semana, CUANDO cambio la meta a 7 horas a mitad de semana, ENTONCES el progreso de esta semana se mide contra 7 horas (50 %) (H4).
- **CA-3.2** DADO una meta activa, CUANDO la desactivo y confirmo, ENTONCES el juego queda sin meta activa, la meta sigue en su historial y puedo crear una nueva.
- **CA-3.3** DADO que pedí desactivar la meta, CUANDO cancelo la confirmación, ENTONCES la meta sigue activa.
- **CA-3.4** DADO un juego con meta activa, CUANDO lo marco como completado o abandonado, ENTONCES su meta se desactiva sola (H7).
- **CA-3.5** DADO un juego con metas, CUANDO lo elimino, ENTONCES sus metas y sus hitos también se eliminan (H8).
- **CA-3.6** DADO un juego con una meta desactivada y una activa, CUANDO consulto sus metas, ENTONCES veo las dos, la más reciente primero.
- **CA-3.7** DADO una meta desactivada, CUANDO intento editarla, ENTONCES se rechaza explicando que está desactivada (H11).

### HU-4 · Progreso de la semana
**Como** jugador/a **quiero** ver cuántas horas y cuántos días he jugado esta semana frente a mi meta
**para** saber si voy cumpliendo lo que me propuse.

- **CA-4.1** DADO que hoy es miércoles 11-nov-2026, CUANDO veo el progreso, ENTONCES la semana mostrada va del lunes 9 al domingo 15 de noviembre.
- **CA-4.2** DADO que en Ecuador es domingo 15-nov a las 23:30 (ya lunes en hora universal), CUANDO veo el progreso, ENTONCES la semana sigue siendo la del 9 al 15; y el lunes 16 empieza una semana nueva.
- **CA-4.3** DADO tres partidas de 70 minutos esta semana y una de 120 minutos la semana pasada, CUANDO veo el progreso, ENTONCES las horas de la semana son 3,5.
- **CA-4.4** DADO una meta de 5 horas y 3,5 horas jugadas, CUANDO veo el progreso, ENTONCES el porcentaje es 70 %.
- **CA-4.5** DADO una meta de 5 horas y 7 horas jugadas, CUANDO veo el progreso, ENTONCES el porcentaje es 140 % (H5).
- **CA-4.6** DADO dos partidas el lunes y una el martes de esta semana, CUANDO veo el progreso, ENTONCES llevo 2 días jugados (H2).
- **CA-4.7** DADO un juego sin meta activa, CUANDO veo el progreso, ENTONCES veo horas, días y rachas, sin porcentaje, y una invitación a crear una meta.
- **CA-4.8** DADO un juego sin partidas, CUANDO veo el progreso, ENTONCES horas, días y rachas están en 0.
- **CA-4.9** DADO un juego que no existe o un identificador mal escrito, CUANDO pido su progreso, ENTONCES se informa que no existe o que el identificador no es válido.
- **CA-4.10** DADO una partida registrada el lunes que terminó pasada la medianoche, CUANDO veo el progreso, ENTONCES cuenta solo para el lunes (H3).

### HU-5 · Rachas
**Como** jugador/a **quiero** ver cuántos días seguidos llevo jugando y cuál fue mi mejor racha
**para** mantener la constancia.

- **CA-5.1** DADO partidas ayer, anteayer y hace tres días y ninguna hoy, CUANDO veo el progreso, ENTONCES mi racha actual es 3 (H1).
- **CA-5.2** DADO partidas hoy y ayer, CUANDO veo el progreso, ENTONCES mi racha actual es 2.
- **CA-5.3** DADO que mi última partida fue anteayer, CUANDO veo el progreso, ENTONCES mi racha actual es 0.
- **CA-5.4** DADO una racha pasada de 4 días que se rompió y una racha actual de 2, CUANDO veo el progreso, ENTONCES la mejor racha es 4 y la actual 2.
- **CA-5.5** DADO tres partidas el mismo día, CUANDO veo el progreso, ENTONCES ese día suma 1 a la racha (H2).
- **CA-5.6** DADO partidas de domingo, lunes y martes seguidos, CUANDO veo el progreso, ENTONCES la racha es 3 aunque cruce de semana.

### HU-6 · Progreso siempre al día
**Como** jugador/a **quiero** que el progreso se actualice al registrar o eliminar una partida
**para** ver de inmediato el efecto en mi semana y mi racha.

- **CA-6.1** DADO que estoy en el detalle del juego, CUANDO elimino una partida, ENTONCES el progreso semanal se actualiza sin recargar la página.
- **CA-6.2** DADO que registro una partida desde el detalle del juego, CUANDO vuelvo al detalle, ENTONCES el progreso ya incluye esa partida.
- **CA-6.3** DADO que el progreso se está calculando o falló, CUANDO veo el detalle, ENTONCES veo un indicador de carga o un mensaje de error con la opción de reintentar.

### Deuda técnica pagada (historias técnicas)

- **CA-D1.1** DADO que envío la fecha de una partida con hora (ej. `2026-11-10T23:30`), CUANDO la registro o edito, ENTONCES se rechaza pidiendo una fecha de día (AAAA-MM-DD).
- **CA-D1.2** DADO una fecha de día válida, CUANDO registro la partida, ENTONCES queda guardada en ese mismo día.
- **CA-D2.1** DADO que hoy es 11-nov en Ecuador, CUANDO registro una partida del 12-nov, ENTONCES se rechaza porque la fecha no puede ser futura.
- **CA-D2.2** DADO que hoy es 11-nov en Ecuador, CUANDO registro una partida de hoy, ENTONCES se acepta.
- **CA-D2.3** DADO que en Ecuador son las 23:30 del 11-nov (ya 12-nov en hora universal), CUANDO registro una partida del 12-nov, ENTONCES se rechaza.

## Tickets

| Id | Tipo | Título | Criterios | Depende de | Definition of Done | Estado |
|---|---|---|---|---|---|---|
| T-01 | chore | Script de tests con patrón y carpeta `dominio/` | — (P4) | — | `npm test` ejecuta todos los `*.test.ts`; los 4 tests de E1 siguen pasando | ✅ |
| T-02 | dominio | Semana, horas, porcentaje y días jugados (funciones puras) | CA-4.1–4.8, 4.10, 3.1 | T-01 | Tests escritos antes del código, uno por criterio; todos pasan | ✅ |
| T-03 | dominio | Racha actual y mejor racha | CA-5.1–5.6 | T-01 | Ídem | ✅ |
| T-04 | dominio | Hitos alcanzados | CA-2.1–2.3, 2.5 | T-01 | Ídem | ✅ |
| T-05 | backend | Modelo `Meta` y error 409 en el `errorHandler` | CA-1.3, 2.4 | — | Validaciones del esquema; 409 con formato estándar; type-check limpio | ✅ |
| T-06 | backend | CRUD de Meta (crear, obtener, listar por juego, actualizar, desactivar) | CA-1.1, 1.2, 1.4, 1.5, 3.1, 3.2, 3.6, 3.7 | T-05 | Endpoints probados con curl (200/201/400/404/409) | ✅ |
| T-07 | backend | Cascada al eliminar juego y desactivación al completar/abandonar | CA-3.4, 3.5 | T-05 | Probado con curl; sin metas huérfanas | ✅ |
| T-08 | backend | `GET /api/videojuegos/:id/progreso-semanal` | CA-4.1–4.10, 2.1–2.5, 5.x | T-02, T-03, T-04, T-06 | Juego sin partidas, juego con ≥5 partidas y racha rota, 400 y 404 probados | ✅ |
| T-09 | backend | Seed con metas e `requests.http` de E2 | — | T-08 | `npm run seed` carga metas; requests listos para la demo | ✅ |
| T-10 | frontend | Tipos y servicio `metasApi.ts` | — | T-06, T-08 | Sin `fetch` en componentes; build limpio | ✅ |
| T-11 | frontend | Sección de progreso semanal en el detalle | CA-4.7, 2.1, 6.1–6.3 | T-10 | Barras, días, rachas, hitos; estados carga/error/vacío; se recarga al eliminar partida | ✅ |
| T-12 | frontend | Formulario de meta (crear/editar con hitos) y desactivar con confirmación | CA-1.1–1.3, 2.4, 3.1–3.3 | T-10, T-11 | Errores por campo; 409 visible; confirmación al desactivar | ✅ |
| T-13 | deuda | D1: fecha de partida solo como día `YYYY-MM-DD` | CA-D1.1, D1.2 | T-01 | Test que falla primero; 400 con detalle por campo | ✅ |
| T-14 | deuda | D2: rechazar partidas con fecha futura (hora de Ecuador) | CA-D2.1–D2.3 | T-13 | Ídem | ✅ |
| T-15 | docs | Auditoría, README, bitácora, despliegue y PR | todos | todos | `docs/AUDITORIA.md` completa; Render actualizado; PR con tickets | ✅ |

## Deuda técnica (diferida)

| Id | Problema (diagnóstico) | Motivo para diferirlo |
|---|---|---|
| P5 | No hay pantalla para editar partidas | Es una funcionalidad de E1 que no pide E2. El detalle vuelve a pedir el progreso cada vez que se abre, así que una futura pantalla de edición quedará cubierta al volver al detalle (PRD PA2). |
| P6 | Sin tests de integración de la API | Requiere una base de datos de prueba (mongodb-memory-server) y una dependencia nueva. La lógica nueva está en funciones puras probadas; los endpoints se verifican con curl (ver auditoría). |
| P7 | `calcularResumen` está en `services/` y no en `dominio/` | El enunciado pide no cambiar el resumen. El progreso lo reutiliza tal cual. |
| P8 | Sin índice `{ videojuego, fecha }` en partidas | Con el volumen personal (S4), el índice por `videojuego` basta. |
| P9 | El frontend no tiene tests | Agregar Vitest + Testing Library es un cambio de infraestructura grande; la lógica se dejó en el backend. |
| P10 | `hoyISO()` del front usa la zona del navegador | La persona está en Ecuador (S1); el backend valida con la zona de Ecuador (D2). |
