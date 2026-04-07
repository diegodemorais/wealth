# HD-cmd-portfolio-snapshot: Command /portfolio-snapshot

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-cmd-portfolio-snapshot |
| **Dono** | Bookkeeper |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Bookkeeper (lead), Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Gap identificado no mapeamento de commands |
| **Concluido em** | — |

---

## Motivo / Gatilho

Hoje, para saber a posição atual da carteira, Diego precisa perguntar ao bookkeeper que lê `carteira.md` manualmente. Não existe um command que gere snapshot rápido com posições, pesos atuais vs alvos, drift, e próximos aportes sugeridos. É a pergunta mais frequente ("quanto tenho em cada ETF?") e deveria ser instantânea.

---

## Descricao

Criar `/portfolio-snapshot` que lê `carteira.md` e gera:
- Posições atuais (R$ e USD) por ativo
- Pesos atuais vs alvos (SWRD 50%, AVGS 30%, AVEM 20%)
- Drift por ativo (over/underweight)
- Patrimônio total (BRL e USD)
- Data da última atualização

---

## Escopo

- [ ] Criar `.claude/commands/portfolio-snapshot.md`
- [ ] Definir formato de output (tabela compacta)
- [ ] Testar com dados reais de `carteira.md`
- [ ] Documentar no CLAUDE.md se necessário

---

## Raciocínio

**Argumento central:** Pergunta mais frequente, resposta mais lenta. Command elimina friction de toda interação que precisa de contexto de posições.

**Prioridade Alta:** Usado em quase toda sessão. Baixo esforço (1 arquivo .md).
