# DESIGN.md — Sistema de diseño del Diario Gamer

Identidad heredada del Proyecto 3: **tema oscuro «gamer»**, violeta neón con acentos cian, tarjetas con borde fino
y brillo suave. Las variables viven en `frontend/src/index.css` (`:root`); ningún componente usa colores sueltos.

## Colores

| Variable | Valor | Uso |
|---|---|---|
| `--fondo` | `#0b0b14` | Fondo de la página y de inputs y celdas de stats |
| `--panel` | `#15142a` | Fondo de paneles y tarjetas |
| `--panel-2` | `#1d1b3a` | Botón por defecto, hover, pista de barras |
| `--borde` | `#2e2a5c` | Bordes de paneles, inputs y separadores |
| `--texto` | `#e8e6ff` | Texto principal |
| `--tenue` | `#9d98c9` | Texto secundario, etiquetas, metadatos |
| `--primario` / `--primario-2` | `#8b5cf6` / `#a78bfa` | Acción principal, foco de inputs, inicio del degradado de barras |
| `--acento` | `#22d3ee` | Enlaces, anillo de foco, fin del degradado, estado «jugando» |
| `--verde` | `#4ade80` | Logro obtenido, hito alcanzado, meta cumplida, «completado» |
| `--amarillo` | `#facc15` | Racha (🔥), estado «pausado» |
| `--rosa` | `#f472b6` | Solo pantalla 404 («Game Over») |
| `--peligro` | `#f43f5e` | Errores, acciones destructivas, «abandonado» |

Los colores semánticos siempre van acompañados de texto o icono: el color nunca es la única señal.

## Tipografía

- **Inter** (400, 600, 700) para todo el texto. `line-height: 1.5`.
- **Press Start 2P** solo para el logo y la pantalla 404. Nunca en párrafos, formularios ni números.
- Escala: `h1` `clamp(1.5rem, 4vw, 2.1rem)` · `h2` `1.15rem` · cuerpo `1rem` · etiquetas `0.8–0.9rem`
  · números destacados (stats) `1.35rem` en 700.
- Etiquetas de stats (`dt`) en MAYÚSCULAS, `letter-spacing: 0.05em`, color `--tenue`.

## Espaciado y forma

- Escala en `rem`: `0.25 · 0.5 · 0.75 · 1 · 1.25 · 1.5`. Separación entre paneles: `1.25rem`.
- Radios: `--radio` (`12px`) para paneles y tarjetas, `10px` botones y celdas, `8px` inputs, `999px` chips y barras.
- Contenedor máximo `1100px`; formularios en `.estrecho` (`720px`).
- Responsive: bajo `760px` las columnas pasan a una y los stats a dos por fila.

## Componentes

- **Panel** (`.panel`): fondo `--panel`, borde `--borde`, padding `1.25rem`. Encabezado `h2` con emoji decorativo.
- **Panel destacado** (`.resumen`, también el de progreso semanal): borde `--primario` con brillo violeta.
- **Stats** (`.stats`): rejilla de 3 columnas; cada celda con `dt` (etiqueta) y `dd` (número grande).
- **Barra de progreso** (`BarraProgreso`): pista `--panel-2`, relleno degradado `--primario → --acento`,
  texto centrado. El relleno nunca pasa del 100 %, pero el texto muestra el valor real (ej. «140 %»).
- **Botones**: `.btn` (secundario), `.btn-primario` (una sola acción principal por vista), `.btn-peligro`
  (borrar, desactivar), `.btn-chico`.
- **Chips** (`.chip-*`): estado del juego, borde y texto del color semántico.
- **Listas de checks** (`.logros`, `.hitos`): fila con icono o checkbox y texto; alcanzado en `--verde`.
- **Estados**: `Cargando` (spinner), `MensajeError` (con «Reintentar»), `Vacio` (icono + texto + acción).
- **Formularios** (`.formulario`): `label` en columna, error bajo el campo en `.error-campo`,
  error general arriba en `.error-general`, `aria-invalid` en el campo con error.

## Tono de los textos

- Español neutro, tuteo, frases cortas y en positivo: «Llevas 4 días seguidos», «¡Meta cumplida!».
- Motivador sin culpar: «Aún no juegas esta semana», no «No has cumplido».
- Botones con verbo: «Crear meta», «Guardar meta», «Desactivar meta».
- Los mensajes de error del backend se muestran tal cual (ya vienen en español y son claros).
- Emojis solo como decoración de encabezados y estados (🎯 meta, 🔥 racha, 🏁 hitos), con `aria-hidden`.

## Accesibilidad

- Contraste AA: texto `--texto` y `--tenue` sobre `--fondo`/`--panel`.
- Foco visible siempre: `:focus-visible` con contorno `--acento` de 2px.
- Barras con `role="progressbar"` y `aria-valuenow/min/max`; spinner con `role="status"`; errores con `role="alert"`.
- Todo input tiene `label` visible. Los botones solo-icono llevan `aria-label`.
- Acciones destructivas (eliminar, desactivar) piden confirmación.
- Respeta `prefers-reduced-motion`.

## No hacemos

- Librerías de UI o de componentes (Material, Bootstrap, Tailwind, Chakra…) ni librerías de gráficos.
- Colores, sombras o tamaños escritos a mano en un componente: todo sale de las variables o clases de `index.css`.
- Estilos en línea, salvo el ancho dinámico del relleno de una barra.
- Tema claro, modales propios o animaciones llamativas (solo transiciones cortas).
- Gráficos históricos, rankings o notificaciones (fuera de alcance del producto).
- Más de una acción primaria por vista o textos en MAYÚSCULAS largos.
