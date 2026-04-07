# TX-tlh-automation: Tax-loss harvesting automático

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-tlh-automation |
| **Dono** | Tax |
| **Status** | Backlog |
| **Prioridade** | Baixa |
| **Participantes** | Tax (lead), Bookkeeper, Quant, Head |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | HD-ibkr-import |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs Wealthfolio/rotki TLH features. Já temos framework TLH (TX-002) e tlh_lotes.json, mas sem automação. |
| **Concluido em** | — |

---

## Motivo / Gatilho

Temos framework TLH definido (TX-002) e `tlh_lotes.json` com lotes reais, mas o monitoramento é manual. Wealthfolio e rotki oferecem TLH scanning automático. Com dados de IBKR automatizados (HD-ibkr-import), poderíamos ter alertas automáticos de oportunidades TLH.

---

## Descricao

Automatizar o monitoramento de oportunidades de tax-loss harvesting usando dados reais de lotes do IBKR e o framework TLH existente.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Analisar ferramentas**: estudar como Wealthfolio e rotki implementam TLH scanning. Que lógica usam?
- [ ] **2. Mapear features**: detecção automática de lotes com perda, cálculo de economia fiscal, identificação de substitutos, wash sale checks (não aplicável no Brasil, mas documentar)
- [ ] **3. Avaliar o que temos**: nosso `tlh_lotes.json` + framework TX-002. O que falta para automação?
- [ ] **4. Prova de conceito**: criar script `tlh_monitor.py` que (a) lê lotes do IBKR (depende de HD-ibkr-import), (b) calcula P&L por lote, (c) identifica lotes com perda ≥ threshold, (d) calcula economia fiscal potencial
- [ ] **5. Integrar alertas**: gerar alerta no check-in mensal quando houver oportunidade TLH material
- [ ] **6. Reportar ao time**: Tax e Quant avaliam. Economia fiscal justifica a complexidade?
- [ ] **7. Sintetizar e decidir**: ativar monitoramento automático? Qual threshold de perda para alertar?

---

## Raciocínio

**Argumento central:** TLH é o único "almoço grátis" em tributação — reduz IR sem mudar exposição. Automatizar o monitoramento elimina o risco de perder janelas de oportunidade em drawdowns.

**Alternativas rejeitadas:** TLH manual no check-in mensal — funciona mas é reativo, não proativo. Em drawdowns rápidos (V-shape), a janela pode fechar antes do próximo check-in.

**Incerteza reconhecida:** Todos os ETFs estão no lucro hoje. Valor real só surge em drawdowns. Prioridade baixa reflete isso.

**Falsificação:** Se após 2 anos de monitoramento nunca houver oportunidade material (>R$5k de economia), desativar.
