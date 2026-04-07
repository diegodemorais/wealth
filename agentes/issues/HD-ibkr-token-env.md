# HD-ibkr-token-env: Configurar IBKR token no ambiente Claude Code web

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-ibkr-token-env |
| **Dono** | Head + Diego |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head, Bookkeeper |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Dashboard HTML diverge da planilha em 114 cotas de SWRD. ibkr_sync.py não roda sem token. |
| **Concluido em** | — |

---

## Motivo / Gatilho

O `ibkr_sync.py` precisa de `IBKR_TOKEN` e `IBKR_QUERY_POSITIONS` no `.env` para consultar posições ao vivo via Flex Query. No ambiente Claude Code web, o `.env` não existe — apenas o `.env.example`.

Consequências:
1. **ibkr_lotes.json desatualizado** — faltam 114 cotas de SWRD (compra recente não registrada)
2. **Dashboard HTML diverge** da planilha (~$5k em equity, ~R$15k no total)
3. **Reconciliação automática impossível** — `/reconciliar` e `/checkin-automatico` não conseguem puxar dados ao vivo
4. **ibkr_sync.py --trades** não funciona — impossível verificar trades recentes

---

## Escopo

- [ ] Diego: fornecer IBKR_TOKEN e IBKR_QUERY_POSITIONS para configurar no ambiente
- [ ] Configurar `.env` no ambiente Claude Code web (ou via secrets do projeto)
- [ ] Rodar `ibkr_sync.py` para verificar as 114 cotas faltantes de SWRD
- [ ] Atualizar `ibkr_lotes.json` com posições atuais
- [ ] Regenerar dashboard HTML com dados ao vivo
- [ ] Documentar processo para manter token atualizado entre sessões

---

## Notas

- O token IBKR é **read-only** (apenas consulta, não executa trades)
- Flex Query usa endpoint `ndcdyn.interactivebrokers.com` (não o `gdcdyn` que é bloqueado)
- Alternativa: Diego pode rodar `python3 scripts/ibkr_sync.py --save` no PC e commitar o snapshot
