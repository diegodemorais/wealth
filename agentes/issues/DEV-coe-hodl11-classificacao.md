---
ID: DEV-coe-hodl11-classificacao
Título: COE + Empréstimo na fonte de verdade e HODL11 reclassificação geográfica
Tipo: Dev
Prioridade: 🔴 Alta
Status: Doing
Dono: Dev
Aberta em: 2026-04-24
---

## Contexto

Dois problemas de classificação identificados após auditoria das fontes de verdade:

### 1. COE + Empréstimo XP

- **COE XP0121A3C3W**: produto estruturado na XP, ativo BRL ~R$172k. Não documentado como bloco em `carteira.md`, não visível no dashboard.
- **Empréstimo XP**: passivo atrelado ao COE, saldo ~-R$108k BRL. Idem.
- **Net position**: ~R$64k (o que impacta o patrimônio real).
- Pipeline já lê do Sheets Histórico via gviz (implementado 2026-04-24), mas:
  - `carteira.md` ainda não documenta o bloco
  - `generate_data.py` não inclui COE no `total_brl` real-time
  - Dashboard não exibe COE como linha de portfolio

### 2. HODL11 — classificação errada

- Atualmente: contado em `brasil_pct` (como ativo BRL B3)
- Correto: ativo global/cripto. BTC é precificado em USD, sem geografica soberana.
  - **Geografia**: Global/Cripto (não Brasil)
  - **Moeda**: USD-correlacionado (BTC/USD), não BRL soberano
  - **Risco operacional**: B3/XP (wrapper), mas não risco soberano/fiscal Brasil
- Impacto: `brasil_pct` está inflado, `cripto_pct` não existe como categoria própria.
- A `exposicao_cambial_pct` (equity IBKR / total) permanece como está — HODL11 não entra nela (BTC ≠ USD, é global sem FX hedge explícito).

## Escopo de Mudanças

### carteira.md
- Adicionar bloco "Operação Estruturada (COE)" com valores correntes e nota de fonte (Sheets gviz)
- Documentar empréstimo XP como passivo atrelado

### generate_data.py
- Ler `coe_brl` da última linha de `historico_carteira.csv` e incluir no `total_brl` real-time
- `compute_concentracao_brasil()`: remover HODL11 do `brasil_total` → brasil = só RF/TD soberanos
- Adicionar campo `cripto_pct` (HODL11 / total) ao output JSON
- Output: `coe_net_brl` e `emprestimo_xp_brl` no JSON para display no dash

### Dashboard (React)
- Portfolio tab ou NOW: linha "COE (estruturado XP)" + linha "Empréstimo XP" (passivo)
- Concentração geográfica: brasil% corrigido (sem HODL11) + cripto% como categoria própria
- As três categorias somam 100%: `brasil_pct + exposicao_cambial_pct + cripto_pct = 100%`

## Impacto Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| brasil_pct | ~12% (inclui HODL11 R$100k) | ~9% (só RF/TD) |
| cripto_pct | não existe | ~3% (HODL11) |
| exposicao_cambial_pct | ~85% | ~85% (sem mudança) |
| COE no dash | invisível | linha própria |

## Conclusão
