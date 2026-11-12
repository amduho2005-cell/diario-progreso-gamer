---
name: nueva-spec
description: Crea una spec SDD en docs/specs/ a partir de tickets del backlog (reglas DEBE/NO DEBE, criterio → verificación, ticket → archivos).
disable-model-invocation: true
argument-hint: "<nombre-spec> <T-XX,T-YY,...>"
---

Crea `docs/specs/$0.md` para los tickets indicados en `$1`.

1. Lee `docs/prd/`, `docs/backlog/E2-metas-y-rachas.md` y los criterios (CA-x.y) de las historias de esos tickets.
2. No inventes producto: toda regla debe salir del PRD o de un criterio. Si falta algo, pregunta.
3. Usa esta estructura:
   - **Contexto** (historias y tickets que cubre)
   - **Contrato** (endpoints, tipos o componentes; aquí sí va el detalle técnico)
   - **Reglas** en dos listas: `DEBE` y `NO DEBE`
   - **Tabla criterio → verificación**: `| CA | Verificación (test automático / curl / manual) | Archivo de test o paso |`
   - **Tabla ticket → archivos**: `| Ticket | Archivos que crea o modifica |`
4. No escribas código. Al terminar, sugiere el commit `docs: spec <nombre>` (la spec va antes que el código).
