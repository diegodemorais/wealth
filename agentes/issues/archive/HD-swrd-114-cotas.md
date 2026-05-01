# HD-swrd-114-cotas: Investigar 114 cotas de SWRD faltantes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-swrd-114-cotas |
| **Dono** | Bookkeeper |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Criado em** | 2026-04-07 |
| **Origem** | Dashboard HTML vs Planilha — SWRD qty diverge em 114 cotas |
| **Concluido em** | 2026-04-08 |

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

## Root Cause

Toda divergência rastreada ao evento TLH de 2025-09-22 não refletido em `holdings.md`:
- USSC: vendeu 69.75 cotas via TLH → holdings.md mostrava 443.00 (correto: 373.25)
- SWRD: holdings.md tinha 5,405.56 incorreto desde origem — CSV IBKR (zero sells, net buys = 5,291.64) confirmado pelo ibkr_analysis.py e ibkr_sync.py

Diego confirmou: sem compras de SWRD após 2026-03-31.

## Correções Aplicadas (2026-04-08)

- `dados/holdings.md`: SWRD 5,405.56 → **5,291.64** | USSC 443.00 → **373.25**
- Fonte confirmada: `ibkr_analysis.py` processando CSV 2021-04-08 a 2026-03-31
- Dashboard a regenerar com valores corrigidos

## Ação Pendente para Diego

Atualizar **Carteira Viva (Google Sheets)**: SWRD e USSC com as quantidades corretas.

## Critério de conclusão

- [x] holdings.md SWRD qty = 5,291.64 (confirmado pelo CSV IBKR)
- [x] holdings.md USSC qty = 373.25 (confirmado pelo CSV IBKR)
- [x] Root cause identificado e documentado
- [ ] Dashboard regenerado com qtdes corretas (próxima execução do pipeline)
