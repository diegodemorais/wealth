# FX-multicurrency: Multi-currency tracking nativo BRL/USD

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FX-multicurrency |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Bookkeeper, FIRE, Quant |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | HD-ibkr-import |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs Ghostfolio/rotki multi-currency features |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Nossa carteira opera em duas moedas (BRL para renda fixa + gastos, USD para equity UCITS) mas o tracking é manual e inconsistente. Ghostfolio e rotki têm multi-currency nativo com conversão automática. O check-in trimestral (XX-001) mostrou que "BRL +6.15% neutralizou USD +3.9%". Esse cálculo deveria ser automático.

---

## Descricao

Implementar tracking multi-currency nativo que calcule performance e patrimônio em ambas as moedas automaticamente, com atribuição de retorno cambial separada.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Analisar ferramentas**: estudar como Ghostfolio e rotki implementam multi-currency (spot rates, historical rates, base currency selection)
- [ ] **2. Mapear features**: conversão automática BRL↔USD, performance em moeda local vs base, atribuição de retorno cambial, custo de hedge implícito
- [ ] **3. Avaliar o que temos**: como fazemos hoje? Manual no carteira.md. Performance attribution Q1 foi manual. O que falta?
- [ ] **4. Fonte de dados cambiais**: PTAX (BCB API), Yahoo Finance, OpenExchangeRates — qual é gratuita, confiável, e integrável?
- [ ] **5. Prova de conceito**: criar módulo/função que (a) puxa câmbio histórico BRL/USD, (b) converte portfolio misto para BRL e USD, (c) decompõe retorno em local + cambial
- [ ] **6. Integrar**: plugar no portfolio_analytics.py e no check-in mensal. Patrimônio total em BRL e USD automaticamente
- [ ] **7. Reportar ao time**: FIRE avalia impacto na projeção (BRL vs USD na desacumulação). Quant valida conversões
- [ ] **8. Sintetizar e decidir**: adotar como padrão? Moeda base = BRL (gastos) ou USD (equity)?

---

## Raciocínio

**Argumento central:** 89% do portfolio está em USD (IBKR) e 11% em BRL (Tesouro). Gastos são 100% BRL. A desacumulação envolve conversão USD→BRL. Sem tracking multi-currency automático, não sabemos o retorno real em BRL (a moeda que importa para FIRE).

**Incerteza reconhecida:** Complexidade de implementação pode ser alta para valor incremental baixo (o portfolio não rebalanceia cross-currency frequentemente).

**Falsificação:** Se o impacto cambial for <2pp/ano na maioria dos períodos, tracking manual trimestral é suficiente.

---

## Conclusao

`scripts/fx_utils.py` criado e testado ao vivo. Funcionalidades: (a) `get_ptax()` — PTAX operacional via python-bcb, (b) `get_selic_atual()` e `get_ipca_12m()` — macro BCB, (c) `decompose_return(r_usd, r_fx)` — decompõe retorno em componente local USD + cambial → BRL.

CLI: `--history N` (histórico PTAX), `--decompose r start end` (decomposição). Exportável para outros scripts (`from scripts.fx_utils import get_ptax, to_brl, decompose_return`).

**Dados ao vivo (2026-04-07):** PTAX 5.1532, Selic 14.75%, IPCA 12m 3.81%.

**Decisão:** Fonte de câmbio = python-bcb (`import bcb`) para scripts Python. PTAX operacional para valuation; PTAX D+2 liquidação para IR.
