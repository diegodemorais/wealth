# HD-hook-protect-sot: Hook de proteção para source of truth

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-hook-protect-sot |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Head (lead), Bookkeeper |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de tools — Claude Code hooks documentation |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

`agentes/contexto/carteira.md` é o source of truth de posições e premissas. `agentes/memoria/*.md` contém decisões irreversíveis. Edições acidentais a esses arquivos podem corromper dados silenciosamente. Hoje não há proteção — qualquer agente pode editar. O CLAUDE.md diz que Bookkeeper é quem atualiza, mas não há enforcement técnico.

---

## Descricao

Configurar hooks em `.claude/settings.json` para proteger arquivos críticos:
1. **PreToolUse (Edit/Write)** em `carteira.md` — warning + confirmação
2. **PreToolUse (Edit/Write)** em `agentes/memoria/*.md` — warning
3. **PreToolUse (Edit/Write)** em `agentes/contexto/gatilhos.md` — warning

---

## Escopo

- [ ] Definir lista de arquivos protegidos (source of truth)
- [ ] Configurar hook PreToolUse em `.claude/settings.json`
- [ ] Testar: edição a carteira.md gera warning?
- [ ] Testar: operação normal em outros arquivos não é afetada?
- [ ] Documentar no CLAUDE.md

---

## Raciocínio

**Argumento central:** Prevenção > correção. Um hook de 5 linhas em settings.json evita corrupção silenciosa dos dados mais críticos do sistema. Custo zero, benefício alto.

**Prioridade Alta:** Risco de corrupção de dados é raro mas catastrófico. Esforço mínimo (config de hook). Pode ser feito em 5 minutos.

---

## Conclusao

Hook implementado e validado. `.claude/settings.json` — `PreToolUse` em `Edit|Write` bloqueia edições a `agentes/contexto/carteira.md`, `agentes/memoria/*.md` e `agentes/contexto/gatilhos.md` com mensagem explicativa (exit 1). Testado ao vivo: tentativa de editar carteira.md bloqueada com aviso ⚠️.
