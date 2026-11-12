#!/usr/bin/env bash
# PostToolUse: tras editar un .ts/.tsx, corre el type-check del paquete afectado y avisa al agente si falla.
archivo=$(jq -r '.tool_input.file_path // ""')
case "$archivo" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
raiz="$CLAUDE_PROJECT_DIR"
case "$archivo" in
  "$raiz"/backend/*)  salida=$(cd "$raiz/backend" && npx tsc --noEmit 2>&1) ;;
  "$raiz"/frontend/*) salida=$(cd "$raiz/frontend" && npx tsc -b 2>&1) ;;
  *) exit 0 ;;
esac
if [ $? -ne 0 ]; then
  echo "Type-check falló después de editar $archivo:" >&2
  echo "$salida" | head -30 >&2
  exit 2
fi
exit 0
