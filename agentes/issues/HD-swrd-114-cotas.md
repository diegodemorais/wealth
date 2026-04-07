# HD-swrd-114-cotas: Investigar 114 cotas de SWRD faltantes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-swrd-114-cotas |
| **Dono** | Bookkeeper |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Criado em** | 2026-04-07 |
| **Origem** | Dashboard HTML vs Planilha — SWRD qty diverge em 114 cotas |
| **Concluido em** | — |

---

## Problema

| Fonte | SWRD Qtde | Data |
|-------|-----------|------|
| `ibkr_lotes.json` (codebase) | 5,291.64 | última atualização do arquivo |
| Planilha Carteira Viva | 5,405.56 | 07/04/2026 |
| **Diferença** | **113.92 cotas** | ~$5,400 USD |

---

## Ação (rodar local com IBKR token)

```bash
# 1. Puxar posições atuais do IBKR
python3 scripts/ibkr_sync.py --cambio 5.15

# 2. Puxar trades recentes para ver a compra
python3 scripts/ibkr_sync.py --trades

# 3. Verificar se são 1 ou mais compras
# 4. Atualizar ibkr_lotes.json com os lotes faltantes
# 5. Regenerar dashboard HTML
python3 scripts/dashboard.py
```

---

## Critério de conclusão

- [ ] ibkr_lotes.json SWRD qty bate com IBKR ao vivo
- [ ] Dashboard HTML sem divergência de cotas vs IBKR
