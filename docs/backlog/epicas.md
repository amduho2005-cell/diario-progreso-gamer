# Épicas

## E1 · Registro y resumen de progreso (Proyecto 3 — terminada)

**Objetivo:** responder *¿qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy?*

**Alcance que cubre:**
- CRUD de videojuegos (nombre, plataforma, género, estado) con filtros.
- Logros embebidos en el videojuego: agregar, marcar/desmarcar y eliminar.
- CRUD de partidas (fecha, duración, % de avance, notas) con filtro por fechas; validación de que el juego exista.
- Resumen calculado por juego: total de partidas, horas totales, última partida y avance actual.
- Borrado en cascada de partidas al eliminar un juego. Manejo centralizado de errores 400/404/500.
- Frontend con listado, detalle, formularios y estados de carga, error y vacío. Despliegue en Render.

**Estado:** terminada (PR #1 y #2). Deuda conocida en `docs/diagnostico.md`.

## E2 · Metas y rachas (Proyecto 4 — esta entrega)

**Objetivo:** responder *¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?*

**Alcance que cubre:**
- Meta por videojuego (horas y días por semana), con máximo una activa, hitos de avance (máx. 5),
  edición y desactivación. Historial de metas anteriores.
- Progreso de la semana actual (lunes a domingo, hora de Ecuador): horas, porcentaje frente a la meta, días jugados.
- Racha actual y mejor racha a partir de todo el historial de partidas.
- Estado de cada hito calculado con el avance actual del juego.
- Sección de progreso semanal y formulario de meta en el detalle del juego.
- Reglas H1–H14 del PRD y pago de la deuda que bloquea la épica (P1–P4).

**Fuera de alcance:** notificaciones, recordatorios, metas compartidas, rankings y gráficos históricos.

**Métrica:** la persona cumple su meta semanal al menos 3 de 4 semanas en un mes.

**Historias y tickets:** `docs/backlog/E2-metas-y-rachas.md`.
