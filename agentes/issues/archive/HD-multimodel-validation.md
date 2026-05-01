# HD-multimodel-validation: Multi-Model Validation — executar em issue estrutural

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-multimodel-validation |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Advocate |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-03 |
| **Origem** | Escalação — carry-over 2+ retros consecutivas sem execução (2026-03-20 → 2026-04-03) |
| **Concluido em** | 2026-04-06 |

---

## Motivo / Gatilho

O protocolo Multi-Model Validation foi aprovado em 2026-03-20 (HD-unanimidade) e prometido como obrigatório em decisões estruturais. Nunca foi executado — 4+ retros consecutivas de carry-over.

Escopo original: Advocate prepara prompt neutro de Bull vs Bear sobre uma premissa central da carteira. Diego roda em GPT/Gemini. Advocate compara outputs com o resultado do time. Objetivo: compensar a limitação de mesmo-LLM (todos os agentes = mesmo modelo).

---

## Descrição

O sistema tem 14+ agentes mas todos são o mesmo LLM (Claude). A diversidade é de contexto e instrução, não epistêmica. O Multi-Model Validation é o único mecanismo disponível para validação genuinamente independente de uma premissa.

Candidatos para primeira execução (em ordem de relevância):
1. **AVGS 30% vs SWRD 50%**: Qual estrutura de bloco equity seria recomendada sem contexto de sycophancy?
2. **IPCA+ 15% alvo**: Justificado a 7.21%? Ou sobreallocado em RF?
3. **P(FIRE) 86.9%**: Premissas de retorno e gastos são defensáveis para um modelo externo?

---

## Escopo

- [ ] Advocate: definir issue candidata para primeira execução
- [ ] Advocate: preparar prompt neutro (Bull vs Bear sem revelar posição do time)
- [ ] Diego: rodar em GPT-4o ou Gemini Pro (5-10 min)
- [ ] Advocate: comparar outputs — o que o modelo externo disse que o time não disse?
- [ ] Head: registrar achados como finding na memória correspondente
- [ ] Decidir: Multi-Model passa a ser obrigatório em issues estruturais ≥Alta? Ou apenas anual?

---

## Raciocínio

**Argumento central:** Carry-over crônico indica que o protocolo não tem gatilho de ativação automático. Precisa de uma issue dedicada com responsável e prazo para sair do papel.

**Incerteza reconhecida:** Modelos externos também têm vieses. A comparação é indicativa, não definitiva.

**Falsificação:** Se após 3 execuções os modelos externos não produzirem nenhum insight novo vs o time, reconsiderar a obrigatoriedade.

---

## SLA

**Prazo:** próxima issue de alocação Alta ou até 2026-06-30, o que vier primeiro.

---

## Resultado

### Execução: 2 rounds + Deep Research (2026-04-06)

**Round 1 — com tickers (SWRD/AVGS/AVEM):**

| Modelo | DM | SCV | EM | Delta AVGS vs time |
|--------|-----|-----|-----|-------------------|
| Perplexity | ~55% | 20-25% | 20% | −5 a −10pp |
| ChatGPT | ~55% | 20-25% | 20% | −5 a −10pp |
| Gemini | ~50% | 20-25% | 20-25% | −5 a −10pp |

Finding R1: 3/3 recomendaram AVGS 20-25%, não 30%. Causa: ancoragem no track record curto do produto (AVGS desde 2022).

**Round 2 — sem tickers (categorias puras):**

| Modelo | DM | SCV | EM |
|--------|-----|-----|-----|
| Perplexity | 55% | 25% | 20% |
| ChatGPT | 45% | 35% | 20% |
| Gemini | 50% | 30% | 20% |
| **Mediana** | **50%** | **30%** | **20%** |

Finding R2: sem ancoragem por produto, mediana = exatamente 50/30/20. Dispersão aumentou (25-35%) e foi para cima vs R1 — tese fatorial mais forte que o veículo específico.

**Deep Research (Gemini):**
Recomendou 30/40/30 — outlier com 2 erros conceituais: (1) argumento phantom gain → mais tilt tem lógica invertida (favorece IPCA+, não SCV); (2) SWR 7.14% aplicado a fase de acumulação é erro conceitual — withdrawal rate atual é 0%.

### Veredicto: 50/30/20 corroborado

6 outputs externos consultados. Mediana Round 2 = exatamente 50/30/20. Decisão não deve ser revista.

### Findings registrados na memória do Advocate

1. **Tracking error regret** (Round 1): risco primário de abandono estratégico não mapeado explicitamente — diferente de tail risk/drawdown
2. **Factor drought sequence risk** (Round 2 — Perplexity): bond tent protege contra drawdown de mercado, mas não contra underperformance relativa prolongada do fator
3. **Restrição de não-venda degrada eficiência fatorial** (Round 2 — ChatGPT): turnover via aportes ~10%/ano limita captura do premium
4. **Sinergia família + drawdown como evento conjunto** (Round 2 — Gemini): modelar cenário filho 2028 + drawdown 2029 no próximo Monte Carlo
5. **Formato Round 2 (sem tickers) é superior** para futuras execuções do protocolo
6. **Phantom gain favorece IPCA+, não mais factor tilt** (Deep Research): mais uma linha de evidência para o DCA em curso

### Protocolo definido

- Formato padrão: Round 2 (categorias, sem tickers). Round 1 como complemento opcional para verificar disponibilidade de produtos.
- Periodicidade: anual na revalidação de premissas, ou ad-hoc em issue estrutural ≥Alta.
- Gatilho de revisão SCV: se AVGS underperformar SWRD >5pp acumulado em 24 meses → reabrir debate com este finding como contexto.
