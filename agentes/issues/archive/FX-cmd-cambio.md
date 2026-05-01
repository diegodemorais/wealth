# FX-cmd-cambio: Command /cambio

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FX-cmd-cambio |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | Head (lead), Bookkeeper, Macro |
| **Co-sponsor** | Macro |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Gap identificado no mapeamento de commands |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Câmbio BRL/USD é consultado via WebSearch ad hoc toda vez que Diego pergunta sobre aportes, patrimônio em BRL, ou impacto cambial. Não existe command dedicado que traga PTAX do dia + contexto (média 30/90/365 dias, percentil histórico, impacto na carteira).

---

## Descricao

Criar `/cambio` que:
- Busca PTAX do dia via BCB API (WebFetch)
- Mostra: PTAX compra/venda, média 30d/90d/365d
- Percentil histórico (câmbio atual é caro ou barato vs 5 anos?)
- Impacto na carteira: patrimônio IBKR convertido em BRL
- Spread IBKR estimado vs PTAX

---

## Escopo

- [ ] Criar `.claude/commands/cambio.md`
- [ ] Integrar BCB API (endpoint PTAX)
- [ ] Formato de output: câmbio do dia + contexto histórico + impacto carteira
- [ ] Testar com dados reais

---

## Raciocínio

**Argumento central:** Câmbio afeta 89% do portfolio (IBKR em USD). Consulta recorrente que hoje depende de WebSearch genérico.

**Prioridade Baixa:** Informação facilmente acessível de outras formas. Conveniência pura — não bloqueia nenhuma decisão. BCB API pode ter downtime.

---

## Conclusao

Command `.claude/commands/cambio.md` criado e funcional. Usa python-bcb (PTAX via `bcb.currency.get`) com fallback para WebSearch. Exibe: câmbio atual, média 30/90/365d, impacto carteira IBKR em BRL (patrimônio USD × PTAX), contexto histórico.
