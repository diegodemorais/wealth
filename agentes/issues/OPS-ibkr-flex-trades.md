| Campo | Valor |
|-------|-------|
| ID | OPS-ibkr-flex-trades |
| Título | Configurar Flex Query de Trades na IBKR |
| Dono | Ops |
| Status | 🟡 Backlog |
| Prioridade | 🟡 Média |
| Criada | 2026-04-22 |

## Motivo

`ibkr_sync.py` suporta `--trades` via `IBKR_QUERY_TRADES`, mas a Flex Query nunca foi criada na IBKR. Hoje dependemos de export manual de CSV para atualizar lotes. Com a Flex Query de trades, o pipeline `ibkr_lotes.py` pode ser atualizado automaticamente.

## Escopo

Diego precisa fazer na IBKR (5 min):
1. IBKR Account Management → Reports → Flex Queries → New Query
2. Selecionar: **Trades** (não Positions)
3. Período: **Last 365 days** (ou Maximum)
4. Format: **XML**
5. Salvar → anotar o **Query ID**
6. Adicionar ao `.env`: `IBKR_QUERY_TRADES=<query_id>`

Depois, Dev integra:
- [ ] `ibkr_lotes.py` aceita `--flex` para puxar trades via API e merge com CSV histórico
- [ ] Automatizar no `/scan` para manter lotes sempre atualizados
