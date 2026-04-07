# FI-portfolio-optimization: Validação formal de alocação via otimização

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-portfolio-optimization |
| **Dono** | Factor |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Factor (lead), Head, FIRE, Advocate, Quant |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs PyPortfolioOpt/Riskfolio-Lib/skfolio |
| **Concluido em** | — |

---

## Motivo / Gatilho

Nossa alocação 50/30/20 (SWRD/AVGS/AVEM) foi decidida por debate qualitativo entre agentes. Ferramentas como PyPortfolioOpt, Riskfolio-Lib e skfolio permitem validação quantitativa via efficient frontier, HRP, risk parity, Black-Litterman. Gap identificado no scan (2026-04-07).

---

## Descricao

Usar ferramentas de otimização de portfolio para validar (ou questionar) a alocação equity atual com dados históricos e modelos formais.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Instalar e avaliar**: instalar PyPortfolioOpt, Riskfolio-Lib e skfolio. Comparar features, API, maturidade
- [ ] **2. Mapear features**: efficient frontier (mean-variance), HRP (hierarchical risk parity), risk parity, Black-Litterman, minimum volatility, maximum Sharpe
- [ ] **3. Avaliar o que temos**: nossa alocação 50/30/20 cai onde na efficient frontier? É Sharpe-optimal? Risk-parity? Nenhuma?
- [ ] **4. Prova de conceito**: rodar otimização com proxies canônicos (SWRD→URTH, AVGS→AVDV+AVUV, AVEM→VWO) usando 10-20 anos de dados
- [ ] **5. Comparar outputs**: tabela de pesos ótimos por método vs nossa alocação atual
- [ ] **6. Reportar ao time**: Factor, Advocate e FIRE avaliam. A otimização confirma ou questiona 50/30/20?
- [ ] **7. Sintetizar e decidir**: usar como input adicional em futuras revisões de alocação? Incorporar no check-in anual?

---

## Raciocínio

**Argumento central:** Debate qualitativo pode convergir para alocações sub-ótimas por ancoragem. Otimização formal fornece um benchmark quantitativo (mesmo com limitações conhecidas — sensitivity to inputs, overfitting).

**Alternativas rejeitadas:** Usar otimização como único critério de decisão — sabemos que é garbage-in/garbage-out com estimativas de retorno incertas. O valor é como validação, não como prescrição.

**Incerteza reconhecida:** 50/30/20 pode estar perto do ótimo para nossos constraints (sem short, UCITS only, factor tilt intencional). Se sim, a issue confirma sem mudar nada.

**Falsificação:** Se a efficient frontier mostrar que 50/30/20 está >1 desvio-padrão do ótimo em qualquer métrica (Sharpe, Sortino, min-variance), devemos investigar.
