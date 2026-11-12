#!/usr/bin/env bash
# PreToolUse: bloquea cualquier lectura/edición de archivos .env (sí permite .env.example).
entrada=$(cat)
objetivo=$(jq -r '.tool_input.file_path // .tool_input.path // .tool_input.command // ""' <<<"$entrada")
if grep -Eq '\.env($|[[:space:]"'"'"'/;|&)*]|\.local|\.production)' <<<"$objetivo"; then
  echo "Bloqueado por el harness: AGENTS.md prohíbe leer o modificar .env. Usa .env.example." >&2
  exit 2
fi
exit 0
