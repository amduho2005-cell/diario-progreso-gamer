#!/usr/bin/env bash
# Pruebas de la API E2 contra un backend local. Uso: curl-e2.sh http://localhost:3999/api
API=${1:-http://localhost:3999/api}
req() { # método ruta [json] → imprime "STATUS cuerpo"
  local r; r=$(curl -s -w '\n%{http_code}' -X "$1" "$API$2" -H 'Content-Type: application/json' ${3:+-d "$3"})
  CUERPO=$(sed '$d' <<<"$r"); STATUS=$(tail -1 <<<"$r")
}
fila() { printf '| %s | `%s %s` | %s | %s |\n' "$1" "$2" "$3" "$STATUS" "$4"; }

echo "| Caso | Petición | Status | Resultado |"; echo "|---|---|---|---|"
req POST /videojuegos '{"nombre":"Hollow Knight","plataforma":"Switch","genero":"accion"}'; HK=$(jq -r ._id <<<"$CUERPO")
req POST /videojuegos '{"nombre":"Elden Ring","plataforma":"PC","genero":"rol"}'; ER=$(jq -r ._id <<<"$CUERPO")
req POST /videojuegos '{"nombre":"Hades","plataforma":"Switch","genero":"accion","estado":"completado"}'; HA=$(jq -r ._id <<<"$CUERPO")

req GET /videojuegos/$HK/progreso-semanal; fila "Juego sin partidas ni meta (CA-4.7, 4.8)" GET "/videojuegos/HK/progreso-semanal" "$(jq -c '{semana,meta,horasSemana,porcentajeHoras,diasJugadosSemana,rachaActual,mejorRacha,hitos}' <<<"$CUERPO")"

# Elden Ring: racha de 4 (1–4 nov) rota y racha actual 10–11 nov; 2 partidas el 10; semana actual 9–15 nov
for x in "2026-11-01 90 10" "2026-11-02 60 18" "2026-11-03 120 25" "2026-11-04 60 33" "2026-11-06 30 40" "2026-11-09 70 50" "2026-11-10 70 58" "2026-11-10 30 60" "2026-11-11 40 67"; do
  set -- $x; req POST /partidas "{\"videojuego\":\"$ER\",\"fecha\":\"$1\",\"duracionMinutos\":$2,\"porcentajeAvance\":$3}"
done
fila "9 partidas registradas para Elden Ring" POST "/partidas ×9" "$(jq -c '{fecha,porcentajeAvance}' <<<"$CUERPO") (última)"

req POST /metas "{\"videojuego\":\"$ER\",\"horasSemanales\":5,\"diasPorSemana\":4,\"hitos\":[{\"descripcion\":\"Llegar al 25 %\",\"porcentajeObjetivo\":25},{\"descripcion\":\"Llegar al 50 %\",\"porcentajeObjetivo\":50},{\"descripcion\":\"Terminar el juego\",\"porcentajeObjetivo\":100}]}"
META=$(jq -r ._id <<<"$CUERPO"); fila "Crear meta (CA-1.1)" POST /metas "$(jq -c '{horasSemanales,diasPorSemana,activa,hitos:(.hitos|length)}' <<<"$CUERPO")"

req GET /videojuegos/$ER/progreso-semanal; fila "Progreso con ≥5 partidas y racha rota (CA-4.x, 5.x, 2.1)" GET "/videojuegos/ER/progreso-semanal" "$(jq -c 'del(.meta._id)' <<<"$CUERPO")"

req POST /metas "{\"videojuego\":\"$ER\",\"horasSemanales\":3,\"diasPorSemana\":2}"; fila "Segunda meta activa (CA-1.2)" POST /metas "$(jq -c .error.mensaje <<<"$CUERPO")"
req POST /metas "{\"videojuego\":\"$HK\",\"horasSemanales\":0,\"diasPorSemana\":8}"; fila "Horas 0 y 8 días (CA-1.3)" POST /metas "$(jq -c .error.detalles <<<"$CUERPO")"
req POST /metas "{\"videojuego\":\"$HK\",\"horasSemanales\":101,\"diasPorSemana\":3.5}"; fila "101 h y 3.5 días (CA-1.3)" POST /metas "$(jq -c .error.detalles <<<"$CUERPO")"
H='{"descripcion":"h","porcentajeObjetivo":10}'
req POST /metas "{\"videojuego\":\"$HK\",\"horasSemanales\":3,\"diasPorSemana\":3,\"hitos\":[$H,$H,$H,$H,$H,$H]}"; fila "6 hitos (CA-2.4)" POST /metas "$(jq -c .error.detalles <<<"$CUERPO")"
req POST /metas "{\"videojuego\":\"$HK\",\"horasSemanales\":3,\"diasPorSemana\":3,\"hitos\":[{\"descripcion\":\"\",\"porcentajeObjetivo\":0}]}"; fila "Hito 0 % sin descripción (CA-2.4)" POST /metas "$(jq -c .error.detalles <<<"$CUERPO")"
req POST /metas "{\"videojuego\":\"$HA\",\"horasSemanales\":3,\"diasPorSemana\":3}"; fila "Juego completado (CA-1.4)" POST /metas "$(jq -c .error.mensaje <<<"$CUERPO")"
req POST /metas '{"videojuego":"64b000000000000000000000","horasSemanales":3,"diasPorSemana":3}'; fila "Juego inexistente (CA-1.5)" POST /metas "$(jq -c .error.mensaje <<<"$CUERPO")"
req POST /metas '{"videojuego":"abc","horasSemanales":3,"diasPorSemana":3}'; fila "Id de juego mal formado" POST /metas "$(jq -c .error.tipo <<<"$CUERPO")"
req GET /videojuegos/abc/progreso-semanal; fila "Progreso con id mal formado (CA-4.9)" GET "/videojuegos/abc/progreso-semanal" "$(jq -c .error.tipo <<<"$CUERPO")"
req GET /videojuegos/64b000000000000000000000/progreso-semanal; fila "Progreso de juego inexistente (CA-4.9)" GET "/videojuegos/64b0…/progreso-semanal" "$(jq -c .error.mensaje <<<"$CUERPO")"
req GET /metas/$META; fila "Obtener meta por id" GET "/metas/META" "$(jq -c '{horasSemanales,activa}' <<<"$CUERPO")"
req GET /metas/64b000000000000000000000; fila "Meta inexistente" GET "/metas/64b0…" "$(jq -c .error.tipo <<<"$CUERPO")"

req PUT /metas/$META '{"horasSemanales":7,"activa":false}'; fila "Editar meta a 7 h; \`activa\` se ignora (CA-3.1, N-4)" PUT "/metas/META" "$(jq -c '{horasSemanales,activa}' <<<"$CUERPO")"
req GET /videojuegos/$ER/progreso-semanal; fila "Progreso con la meta nueva (CA-3.1)" GET "/videojuegos/ER/progreso-semanal" "$(jq -c '{meta:(.meta|del(._id)),horasSemana,porcentajeHoras}' <<<"$CUERPO")"
req PUT /metas/$META '{"hitos":[]}'; req PUT /metas/$META '{"diasPorSemana":0}'; fila "Editar con 0 días" PUT "/metas/META" "$(jq -c .error.detalles <<<"$CUERPO")"

req PATCH /metas/$META/desactivar; fila "Desactivar meta (CA-3.2)" PATCH "/metas/META/desactivar" "$(jq -c '{activa}' <<<"$CUERPO")"
req PUT /metas/$META '{"horasSemanales":4}'; fila "Editar meta desactivada (CA-3.7)" PUT "/metas/META" "$(jq -c .error.mensaje <<<"$CUERPO")"
req GET /videojuegos/$ER/progreso-semanal; fila "Progreso sin meta activa (CA-4.7)" GET "/videojuegos/ER/progreso-semanal" "$(jq -c '{meta,porcentajeHoras,horasSemana,diasJugadosSemana,rachaActual,hitos}' <<<"$CUERPO")"
req POST /metas "{\"videojuego\":\"$ER\",\"horasSemanales\":6,\"diasPorSemana\":5}"; META2=$(jq -r ._id <<<"$CUERPO"); fila "Nueva meta tras desactivar (CA-3.2)" POST /metas "$(jq -c '{horasSemanales,activa}' <<<"$CUERPO")"
req GET /videojuegos/$ER/metas; fila "Historial de metas (CA-3.6)" GET "/videojuegos/ER/metas" "$(jq -c 'map({horasSemanales,activa})' <<<"$CUERPO")"

req PUT /videojuegos/$ER '{"estado":"completado"}'; req GET /metas/$META2; fila "Juego pasa a completado → meta desactivada (CA-3.4)" "PUT+GET" "/videojuegos/ER + /metas/META2" "$(jq -c '{activa}' <<<"$CUERPO")"
req DELETE /videojuegos/$ER; req GET /metas/$META; fila "Eliminar juego borra sus metas (CA-3.5)" "DELETE+GET" "/videojuegos/ER + /metas/META" "$(jq -c .error.tipo <<<"$CUERPO")"
