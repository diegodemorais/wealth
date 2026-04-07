# FR-withdrawal-engine: Motor parametrizável de withdrawal strategies

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-withdrawal-engine |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | FIRE (lead), Head, Quant, RF |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repositórios open-source — gap vs cFIREsim/FI Calc |
| **Concluido em** | — |

---

## Motivo / Gatilho

Nosso `fire_montecarlo.py` usa guardrails fixos. cFIREsim e FI Calc testam múltiplas withdrawal strategies como opções configuráveis (VPW, Guyton-Klinger, percent-of-portfolio, constant-dollar). Gap identificado no scan de repos open-source (2026-04-07).

---

## Descricao

Parametrizar o motor de withdrawal do Monte Carlo para testar diferentes estratégias de desacumulação e comparar P(sucesso) entre elas.

---

## Escopo — Roteiro Padrão de Integração

- [ ] **1. Instalar e analisar**: baixar/estudar código-fonte de cFIREsim-open e FI Calc. Mapear todas as withdrawal strategies que suportam
- [ ] **2. Mapear features**: VPW (Variable Percentage Withdrawal), Guyton-Klinger guardrails, percent-of-portfolio, constant-dollar, spending smile, CAPE-based, Vanguard Dynamic Spending
- [ ] **3. Avaliar o que temos**: comparar nosso modelo de guardrails atual vs cada estratégia. O que nosso MC já faz? O que falta?
- [ ] **4. Prova de conceito**: implementar pelo menos 3 estratégias alternativas no `fire_montecarlo.py` como flag `--strategy`
- [ ] **5. Executar comparativo**: rodar MC com todas as estratégias usando mesmas premissas. Tabela de P(sucesso) × estratégia
- [ ] **6. Reportar ao time**: apresentar resultados comparativos. Qual estratégia maximiza P(FIRE) para o perfil de Diego?
- [ ] **7. Sintetizar e decidir**: adotar estratégia superior? Manter guardrails atuais? Documentar trade-offs

---

## Raciocínio

**Argumento central:** A escolha de withdrawal strategy tem impacto de 5-15pp no P(sucesso) segundo a literatura. Testar apenas 1 estratégia é equivalente a testar apenas 1 alocação — perde o espaço de otimização.

**Incerteza reconhecida:** Complexidade adicional pode não mudar a decisão se guardrails atuais já são robustos. O valor está em confirmar ou melhorar.

**Falsificação:** Se P(sucesso) variar <2pp entre estratégias com nossas premissas, a complexidade não se justifica.
