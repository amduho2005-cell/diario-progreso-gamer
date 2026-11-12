---
name: commit
description: Crea un commit trazable al ticket (tipo(E2): T-XX descripción) después de correr los tests y el build.
disable-model-invocation: true
argument-hint: "[T-XX] [descripción opcional]"
---

Crea un commit para el trabajo actual siguiendo la trazabilidad de AGENTS.md.

1. Corre `cd backend && npm test && npx tsc --noEmit`. Si cambió el frontend, también `cd frontend && npm run build`.
   Si algo falla, DETENTE y muestra el error; no hagas el commit.
2. Revisa `git status` y `git diff --staged`. Nunca agregues `.env` (solo `.env.example`).
3. Si el argumento trae un ticket (`$ARGUMENTS`), confirma que existe en `docs/backlog/E2-metas-y-rachas.md`
   y que su spec en `docs/specs/` ya está commiteada (`git log --oneline -- docs/specs/`). Si la spec no
   está en el historial, DETENTE: la spec va antes que el código.
4. Mensaje:
   - Implementación: `feat(E2): T-XX <qué hace>` · tests: `test(E2): T-XX ...` · deuda: `fix(deuda): D-X ...`
   - Documentación: `docs: ...`
   - Cuerpo opcional con el criterio de aceptación que cubre (ej. `Cubre CA-2.3`).
5. Haz el commit y muestra `git log --oneline -3`.
