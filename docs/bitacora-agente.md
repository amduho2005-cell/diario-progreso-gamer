# Bitácora del trabajo con el agente (Claude Code)

Momentos clave de E2, en orden. Formato: qué se pidió → qué hizo el agente → cómo se corrigió o confirmó.

## 1. Diagnóstico: el hallazgo de la fecha UTC
- **Pedido:** leer el Proyecto 3 en modo lectura y entregar estado + tabla de problemas.
- **Bien:** además de la tabla, notó que `Partida.fecha` se guarda a medianoche UTC del día elegido; convertirla a
  `America/Guayaquil` movería cada partida a las 19:00 del día anterior. De ahí salieron `diaDePartida()` (usar la parte
  UTC) y la deuda D1/D2.
- **Decisión mía:** qué bloquea (P1–P4) y qué se difiere (P5–P11).

## 2. Huecos de la ficha
- **Pedido:** buscar huecos en la ficha de hechos.
- **Bien:** presentó los 8 huecos con una opción recomendada y su consecuencia; encontró 6 más (H9–H14: qué es «hoy»,
  partidas futuras, reactivar metas, mejor racha, juego sin partidas, hitos repetidos).
- **Decisión mía:** elegí las 8 respuestas (todas coincidieron con la recomendación) antes de escribir el PRD.

## 3. Backlog: tickets marcados como terminados antes de tiempo
- **Mal:** al generar la tabla de tickets, el agente puso `✅` en la columna Estado de los 15 tickets, sin código escrito.
- **Corrección:** se detectó al revisar el archivo antes del commit; se cambiaron a `⏳` y solo se marcaron al auditar.
  Lección: el estado de un ticket lo cambia la auditoría, no quien lo planifica.

## 4. El hook de `.env` bloqueó al propio agente
- **Qué pasó:** con el hook `PreToolUse` activo, el `git commit` del harness fue bloqueado porque el *mensaje* decía
  «hooks (.env y type-check)»: el patrón mira todo el comando de Bash, no solo rutas.
- **Corrección:** se reformuló el mensaje («secretos»). Se dejó el hook estricto a propósito: un falso positivo cuesta
  reescribir un mensaje; un falso negativo filtra credenciales. Mejora anotada: analizar solo argumentos con ruta.

## 5. Verificar sin tocar producción + índice duplicado
- **Pedido:** probar el endpoint con curl (juego sin partidas, ≥5 partidas con racha rota, 400/404/409).
- **Bien:** no había MongoDB local y el `.env` apunta a Atlas (el mismo de Render). En vez de usarlo, levantó un
  MongoDB en memoria fuera del repo y pasó `MONGODB_URI` por variable de entorno (sin leer `.env`).
- **Mal → corregido:** al arrancar, Mongoose avisó «Duplicate schema index on {videojuego:1}». La spec decía
  «videojuego con índice» y el agente lo siguió al pie de la letra, pero ese índice chocaba con el índice único parcial
  (misma clave, otras opciones; en Atlas el segundo `createIndex` falla). Se corrigieron el modelo **y la spec** (`f7f29c5`).

## 6. Desvío de la spec en el frontend (nota requerida)
- **Mal:** la spec `frontend-progreso-meta.md` dice «Días jugados `diasJugadosSemana / diasPorSemana` **con su barra**».
  En T-11 el agente mostró solo el número («2 de 4») y dio el ticket por hecho: compilaba, el lint pasaba y se veía bien.
- **Cómo lo detecté:** en la revisión de diseño recorrí la spec renglón por renglón contra la pantalla (no contra el
  código). La tabla criterio → verificación no tenía una fila para la barra de días, así que ningún paso la comprobaba.
- **Corrección:** `caf10cd` agrega la barra (y arregla la grilla móvil encontrada en la misma revisión). Lección: cada
  frase con «DEBE» de una spec necesita su fila de verificación; si no, el agente puede saltarla sin que nada falle.

## 7. Lint: `setState` dentro de un efecto
- **Mal:** la primera versión de `FormMeta` llenaba el formulario con un `useEffect` + `setState`; `oxlint` avisó
  `set-state-in-effect`.
- **Corrección:** se separó en `FormMeta` (carga) y `FormularioMeta` (inicializa `useState` con la meta ya cargada).

## 8. TDD visible en el historial
- **Pedido:** primero los tests de dominio y después el código.
- **Bien:** los tests se commitearon en rojo (`011c2e9`, `480da9d`) antes de la implementación (`1c69d28`,
  `179698a`, `568650a`). En la deuda se separó D1 y D2 en commits distintos: con D1 implementado, los tests de D2
  seguían en rojo, como debía ser.
