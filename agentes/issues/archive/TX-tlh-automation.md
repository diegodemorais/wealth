# TX-tlh-automation: Tax-loss harvesting automático

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-tlh-automation |
| **Dono** | Tax |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | Tax (lead), Bookkeeper, Quant, Head |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | HD-ibkr-import |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs Wealthfolio/rotki TLH features. Já temos framework TLH (TX-002) e tlh_lotes.json, mas sem automação. |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Temos framework TLH definido (TX-002) e `tlh_lotes.json` com lotes reais, mas o monitoramento é manual. Wealthfolio e rotki oferecem TLH scanning automático. Com dados de IBKR automatizados (HD-ibkr-import), poderíamos ter alertas automáticos de oportunidades TLH.

---

## Descricao

Automatizar o monitoramento de oportunidades de tax-loss harvesting usando dados reais de lotes do IBKR e o framework TLH existente.

---

## Escopo — Roteiro Padrão de Integração

- [x] **1. Analisar ferramentas**: Wealthfolio/rotki usam FIFO + threshold de perda + mapa de substitutos
- [x] **2. Mapear features**: P&L por lote, economia IR 15%, substituto UCITS, sem wash sale rule no Brasil
- [x] **3. Avaliar o que temos**: tlh_lotes.json com FIFO correto (bug comissão IBKR corrigido em ibkr_analysis.py)
- [x] **4. Prova de conceito**: `scripts/tlh_monitor.py` criado — lê lotes, busca preços via yfinance, calcula P&L, exit 1 se material (≥ R$5k)
- [x] **5. Integrar alertas**: integrado em `/relatorio-mensal` como seção 6
- [x] **6. Reportar ao time**: Tax validou. Sem wash sale rule confirmado (Lei 14.754/2023)
- [x] **7. Sintetizar e decidir**: threshold -5%, material ≥ R$5k. Estado atual: zero oportunidade (FIFO — lotes baratos já vendidos em set/25)

---

## Raciocínio

**Argumento central:** TLH é o único "almoço grátis" em tributação — reduz IR sem mudar exposição. Automatizar o monitoramento elimina o risco de perder janelas de oportunidade em drawdowns.

**Alternativas rejeitadas:** TLH manual no check-in mensal — funciona mas é reativo, não proativo. Em drawdowns rápidos (V-shape), a janela pode fechar antes do próximo check-in.

**Incerteza reconhecida:** Todos os ETFs estão no lucro hoje. Valor real só surge em drawdowns. Prioridade baixa reflete isso.

**Falsificação:** Se após 2 anos de monitoramento nunca houver oportunidade material (>R$5k de economia), desativar.
