# PRD — Diario de Progreso Gamer

Versión 2 (2026-11-11): agrega la épica **E2 · Metas y rachas**. Fuente: ficha de hechos del cliente.
Este documento describe el producto; el detalle técnico vive en `docs/specs/`.

## 1. Problema

La persona usuaria registra en el Diario sus videojuegos y sus partidas (E1), pero **no sabe si está jugando lo
que se propuso ni si es constante**: juega mucho un fin de semana y luego abandona el juego dos semanas.

- E1 responde: *¿qué estoy jugando, cuánto tiempo le dedico y qué tan avanzado voy?*
- E2 responde: *¿estoy cumpliendo lo que me propuse esta semana y cuántos días seguidos llevo jugando?*

## 2. Usuarios

Una sola persona: quien registra sus videojuegos y partidas en el Diario. No hay cuentas ni usuarios compartidos.

## 3. Objetivo y métrica de éxito

- **Objetivo:** que la persona fije una meta por videojuego y vea, en el detalle del juego, cómo va esta semana,
  cuántos días seguidos lleva jugando y qué hitos ha alcanzado.
- **Métrica:** en un mes, la persona **cumple su meta semanal al menos 3 de 4 semanas**.
- **Semana cumplida** (definición nuestra): las horas jugadas en la semana llegan a las horas de la meta **y** los
  días jugados llegan a los días de la meta.

## 4. Alcance (E2)

1. Fijar una meta para un videojuego: horas por semana y días por semana que quiere jugar.
2. Agregar a la meta una lista corta de hitos de avance (máximo 5), cada uno con un porcentaje objetivo.
3. Editar la meta y sus hitos, y desactivarla (con confirmación).
4. Ver en el detalle del juego el progreso de la semana actual: horas frente a la meta, días jugados frente a
   los días objetivo, racha actual, mejor racha y estado de cada hito.
5. El progreso se actualiza al registrar o eliminar una partida.
6. Sin meta activa, el progreso igual muestra horas, días y rachas, e invita a crear una meta.

## 5. No-alcance

Notificaciones, recordatorios, metas compartidas entre usuarios, rankings y gráficos históricos.
Tampoco: historial visual de semanas pasadas, cuentas de usuario.

## 6. Reglas de negocio

### Reglas de la ficha
- **RN-1 Meta única:** cada videojuego tiene como máximo **una meta activa**. Intentar crear una segunda se rechaza
  con un mensaje claro.
- **RN-2 Límites de la meta:** horas por semana mayores que 0 y como máximo 100; días por semana entero de 1 a 7.
- **RN-3 Hitos:** máximo 5 por meta, cada uno con una descripción y un porcentaje objetivo de 1 a 100.
- **RN-4 Semana:** de lunes a domingo, en hora de Ecuador.
- **RN-5 Racha:** días consecutivos con al menos una partida de ese videojuego.
- **RN-6 Hito alcanzado:** cuando el porcentaje de avance actual del juego llega a su objetivo.

### Huecos de la ficha resueltos

| # | Hueco | Decisión |
|---|---|---|
| H1 | Racha y día de hoy | **La racha sigue viva** si la última partida fue ayer: hoy todavía puede jugar. Se rompe solo si ni hoy ni ayer hubo partida. |
| H2 | Varias partidas el mismo día | Cuentan como **un solo día jugado** (para días y racha). Sus horas sí se suman todas. |
| H3 | Partida que cruza la medianoche | Pertenece al **día que la persona registró** (el día en que empezó). No se reparte entre días. |
| H4 | Cambio de meta a mitad de semana | La semana se mide con **la meta activa en el momento de consultar**. Las horas y días jugados no cambian; solo cambia contra qué se comparan. |
| H5 | Meta superada | El porcentaje es el **real** (7 h de 5 h = **140 %**); no se limita. La barra visual se ve llena. |
| H6 | Hito ya alcanzado y luego menos avance | **Deja de estar alcanzado**: el estado se calcula siempre con el avance actual, no se guarda. |
| H7 | Videojuego completado o abandonado | **No puede tener meta activa.** No se permite crearla, y si el juego pasa a completado o abandonado su meta activa se desactiva sola. Un juego pausado sí puede tener meta. |
| H8 | Eliminar un videojuego con meta | Se **eliminan también todas sus metas** (activas y anteriores) con sus hitos, igual que sus partidas. |

### Huecos adicionales encontrados con el agente

| # | Hueco | Decisión |
|---|---|---|
| H9 | ¿Qué es «hoy» y «esta semana»? | El día calendario actual en Ecuador. La semana actual es la que contiene ese día. |
| H10 | Partidas con fecha futura | **No se permiten**: inflarían la semana y la racha con días que no han pasado. |
| H11 | ¿Se puede reactivar una meta desactivada? | No. Se crea una meta nueva; las anteriores quedan como historial. |
| H12 | ¿Qué cuenta como mejor racha? | La racha más larga de todo el historial del juego, incluida la actual. |
| H13 | Juego sin partidas | Horas, días y rachas en 0 y ningún hito alcanzado. |
| H14 | Hitos con el mismo porcentaje | Se permiten (por ejemplo, dos descripciones para el 100 %). |

## 7. Supuestos

- S1: la persona vive y juega en Ecuador (la zona horaria es fija, no configurable).
- S2: una partida se registra con su fecha, sin hora (como en E1).
- S3: el porcentaje de avance del juego es el de la partida más reciente (regla de E1).
- S4: el tamaño de datos es personal (decenas o cientos de partidas por juego).

## 8. Puntos abiertos

- PA1 **Medición de la métrica de éxito:** como los gráficos históricos están fuera de alcance, la app no muestra
  semanas pasadas. Por ahora la métrica se mide revisando las partidas del mes contra la meta. Se propone al
  cliente una vista de historial en una épica futura.
- PA2 **Editar partidas desde la interfaz:** la API lo permite pero la interfaz de E1 no tiene pantalla de edición
  (deuda P5). Cuando exista, también deberá actualizar el progreso.
