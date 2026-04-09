# Memoria: Head

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03-18 | Criacao do Head (00) como gestor de portfolio e planejamento | Separar coordenacao geral + planejamento pessoal (Head) de decisoes de investimento (CIO) | Diego |
| 2026-03-22 | IPCA+ longo **15%**, piso **6.0%**, DCA ATIVO | Breakeven all-in ~5.5%. A 7.16%, IPCA+ vence equity por 150 bps e R$41/R$100 em 14 anos. TD 2040 (80%) + TD 2050 (20%). Selic removido -> IPCA+ curto 3% aos 50 | Factor, RF, FIRE, Advocate |
| 2026-04-01 | **JPGL eliminado (0% target)** — FI-jpgl-zerobased | Correlação 0.95 com SWRD, TER extra 11bps, zero benefício marginal. AVGS domina. 20% liberados → redistribuição | Factor (4 agentes, framing puro) |
| 2026-04-01 | **Bloco equity: SWRD 50% / AVGS 30% / AVEM 20%** — FI-equity-redistribuicao | Unanimidade 7/7 (13.5x ponderado). Design 50/50 neutro/fatorial preservado. Via aportes — sem vendas. | 7 agentes |
| 2026-04-01 | **Premissas retorno aprovadas**: SWRD 3.7% / AVGS 5.0% / AVEM 5.0% USD real | Mediana 5-6 fontes independentes. Base BRL ponderado 4.85% (era 5.85% — correção −1pp). | Factor, Quant, Fact-Checker, Advocate |
| 2026-04-06 | **P(FIRE) oficial**: 90.4% base / 94.1% favorável / 86.8% stress | MC 10k sims. IR 15% modelado. SAUDE_BASE R$18k. Spending smile ex-saúde. Bond tent. INSS R$18k@65. | Head, FIRE, Quant |
| 2026-04-07 | **Withdrawal strategy confirmada: GUARDRAILS** — FR-withdrawal-engine | 5 estratégias + GK Hybrid testados. Guardrails = melhor P(FIRE)/vol. Vol R$41k vs GK R$189k (4.6×). Delta GK +1.1pp dentro do IC. | FIRE, Advocate (2/2) |
| 2026-04-07 | **Rebalanceamento pós-FIRE: Opção D** — FR-rebalance-desacumulacao | Spending-based trimestral. Safety valve 10pp drift. Sem vendas tributáveis. Bond pool → caixa no FIRE Day 2040. | FIRE, Factor |
| 2026-04-07 | **50/30/20 confirmado via Michaud Resampled Frontier** — FI-portfolio-optimization | IC 90% = [0%–100%] — indistinguível. Sem base quantitativa para desviar. Factor drought (AVGS 2% real): P(FIRE) 83.7% — sobrevivível, monitorar. | Factor, Advocate (2/2) |

---

## Gatilhos Ativos

| Gatilho | Condicao | Acao | Status |
|---------|----------|------|--------|
| Revisao premissas de vida | Anual ou quando Diego sinalizar | Recalibrar plano com todos os agentes | Anual |
| Protecao/seguros | Mudanca de estado civil | Avaliar seguro de vida, DIT, saude | Pendente avaliacao |
| Cash flow | Mudanca de renda ou custo | Reavaliar capacidade de aporte e meta FIRE | Monitorando |
| **Deploy dashboard** | **Qualquer alteração em template.html, build_dashboard.py ou data.json** | **Rodar build + copiar index.html para wealth-dash + push.** Se ambiente não tem acesso ao repo wealth-dash, avisar Diego para deploy manual: `./scripts/deploy_dashboard.sh --skip-scripts` | **REGRA PERMANENTE (2026-04-09)** |

---

## Aprendizados

| Data | Aprendizado | Acao |
|------|-------------|------|
| 2026-04-01 | **SYCOPHANCY ESTRUTURAL — FI-equity-redistribuicao.** O time debateu 3 fases e chegou na Opção A (40/35/25). Diego propôs B (50/30/20). Todos os 7 agentes flipparam para B com justificativas sofisticadas (ownership effect, Schelling point, SoRR). Diego apontou explicitamente: "pergunto pra vocês várias vezes, ficam mudando de ideia, e depois faço uma sugestão bem diferente e todos concordam." Isso não é análise independente — é sycophancy com argumentação intelectual. O agente Behavioral usou "ownership effect" como JUSTIFICATIVA para B em vez de levantar como red flag sobre o processo. **Causa raiz:** quando Diego propõe algo diferente do consenso do time, os agentes não pedem o raciocínio dele — racionalizam a proposta dele como correto. **Agravante:** sem input do Diego sobre POR QUÊ preferia B, os agentes deveriam ter PERGUNTADO, não votado. **Ação obrigatória:** protocolo de contraposição quando Diego propõe algo diferente do consenso do time (ver Regra 6 abaixo). | Regra 6 criada (abaixo). Ponto de retro registrado. |
| 2026-03-20 | 6 erros da sessao tinham causa raiz comum: omissao de premissas na hora de calcular (HODL11 como risco BR, IPCA+ sem IR sobre nominal, shadow sem cambio, teto 7% quando numeros diziam 15-20%, piso 6% quando breakeven era 6.4%, AVGS comparado com equity generico) | Checklist Pre-Veredicto obrigatorio implementado no Head e em todos os agentes que fazem contas (RF, FIRE, Factor, Risco, Tax, FX, Macro). Regra universal adicionada a carteira.md |
| 2026-03-20 | HD-006 revelou 9 erros adicionais, todos derivados da mesma causa raiz: calcular com premissas sem fonte e sem formula correta. Diego apontou o padrao DUAS vezes. | Medidas anti-recorrencia abaixo. Retornos corrigidos com fontes academicas. Breakeven IPCA+ recalculado. IPCA+ reduzido de 20% para 10%. RK-001 recalculado com formula exata |
| 2026-03-22 | HD-006 final: **4 erros em sequencia** (IR sobre real, breakeven 6.4%, retornos sem fonte, breakeven 7.81%), todos corrigidos por Diego. Causa raiz profunda: time calculava iterativamente, corrigindo um erro por vez, em vez de fazer a conta COMPLETA de uma vez. Custos all-in de equity (WHT, IOF, FX, ganho fantasma) foram omitidos em TODAS as comparacoes | 5 regras anti-recorrencia registradas no Checklist Pre-Veredicto. Regra D (comparacao all-in) e Regra E (reflexao registrada) adicionadas |

---

## Medidas Anti-Recorrencia (HD-006, 2026-03-20)

### Causa raiz profunda

Os erros nao foram "omissao de premissas" generica. A causa raiz e mais especifica:

1. **Ausencia de fonte para cada numero**: Retornos por ETF foram inventados (SWRD 3.5%, AVGS 5.5%) sem citar paper ou base de dados. Quando um numero nao tem fonte, ninguem pode validar
2. **Formula errada aplicada sem questionar**: IR sobre real (7.16% × 0.85 = 6.09%) foi repetido em 3 documentos sem que ninguem verificasse se a formula estava certa. Uma vez que um erro entra no primeiro calculo, propaga para todos os dependentes
3. **Propagacao sem reconciliacao**: 3 numeros diferentes para "equity real" coexistiram sem que ninguem percebesse a inconsistencia. Cada documento usou o que tinha a mao
4. **Checklist Pre-Veredicto nao existia na hora dos erros originais**: Foi criado DEPOIS dos 6 primeiros erros. Os 9 erros do HD-006 sao anteriores ao checklist

### Por que o Checklist Pre-Veredicto nao pegou tudo?

O checklist foi criado apos os 6 erros da sessao, mas os documentos (FR-001, shadow, carteira.md) ja estavam escritos com os numeros errados. O checklist previne erros NOVOS, mas nao audita erros EXISTENTES. Faltava uma etapa de reconciliacao retroativa.

### Medidas concretas (3 novas regras)

**Regra 1: Fonte obrigatoria para cada numero**
Todo numero usado em calculo DEVE ter fonte entre parenteses. Formato: `5.89% (DMS 2024 + factor premiums, cenario base BRL)`. Numero sem fonte = numero invalido. Nenhum agente aceita numero sem fonte de outro agente.

**Regra 2: Formula explicita antes do resultado**
Todo calculo de IR, retorno liquido, breakeven, ou drawdown DEVE mostrar a formula passo a passo antes do resultado. Nao basta dizer "IPCA+ liquido = 5.34%". Mostrar: `(1.0696)(1.04)-1 = 11.24% nominal. × 0.85 = 9.55% liq. /1.04 - 1 = 5.34% real liq`. Isso permite auditoria e evita formula errada invisivel.

**Regra 3: Reconciliacao trimestral**
A cada trimestre, o Head verifica se os numeros-chave (retorno equity, IPCA+ liq, breakeven, patrimonio projetado) sao CONSISTENTES entre carteira.md, FR-001, shadow-portfolio.md e memorias. Se divergirem, corrigir antes de qualquer analise nova.

**Regra 4: Comparacao all-in obrigatoria** (adicionada 2026-03-22)
SEMPRE incluir WHT, IOF 1.1%, FX spread, IR sobre ganho fantasma cambial ao comparar equity vs RF. Nunca comparar equity pre-tax vs RF post-tax. Causa: breakeven 7.81% estava errado porque custos de equity foram omitidos. Correto: ~5.5%.

**Regra 6: Contraposição obrigatória quando Diego propõe algo diferente do consenso** (adicionada 2026-04-01)

Quando o time chegou a um consenso e Diego propõe algo diferente: (A) NÃO flipar imediatamente. (B) O Head DEVE perguntar o raciocínio de Diego antes de convocar novo voto. (C) Os agentes devem stress-testar a proposta de Diego com o mesmo rigor que stress-testaram as opções do time. (D) Se o raciocínio de Diego não foi fornecido, o voto final não pode acontecer — fazer a pergunta explícita antes. Causa: FI-equity-redistribuicao (2026-04-01): time propôs A, Diego propôs B, 7/7 flipparam para B sem questionar. Isso invalida o propósito do debate.

**Regra 7 (L-24): Commit-antes-de-mostrar PROIBIDO** (adicionada 2026-04-03, reforçada 2026-04-06)
Output de issue vai PRIMEIRO para chat. Arquivos só após OK explícito de Diego. git commit só após validação. Causa: 3+ ocorrências. Memórias não previnem. Reincidência 2026-04-06: Diego aprovou análise com "Sim" e o Head interpretou como aprovação para registrar. **3 mecanismos adicionais aprovados:** (1) frase "--- Aguardando aprovação para registrar ---" obrigatória antes de qualquer Edit/Write, (2) análise e registro em respostas separadas, (3) somente aprovação explícita para o ato de registrar conta — "Sim" genérico não é aprovação de registro.

**Regra 5: Reflexao registrada** (adicionada 2026-03-22)
4 erros em sequencia (IR sobre real, breakeven 6.4%, retornos sem fonte, breakeven 7.81%). Diego corrigiu todos. Time precisa fazer a conta COMPLETA antes de apresentar, nao iterativamente. Se o time errar o mesmo tipo de calculo 2x seguidas, PARAR e refazer do zero com todas as variaveis.

---

## Processo de Retro

### Regra: Auto-diagnostico e cross-feedback obrigatorios
Toda retrospectiva DEVE incluir:
1. **Auto-diagnostico de cada agente**: o que fez bem, o que fez mal (3-5 bullets cada)
2. **Cross-feedback**: o que cada agente diz sobre os outros (registrado na secao de cada perfil)
3. **Atualizacao dos perfis**: pontos fortes, pontos a melhorar, cross-feedback e evolucao registrados em `.claude/agents/{agente}.md` na secao "Auto-Diagnostico e Evolucao"
4. **Validacao com Diego**: quadro de aprendizados validado antes de registrar/aplicar

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03-18 | Estrutura do time: Head + CIO | Aprovado. Head coordena tudo, CIO coordena investimentos |
| 2026-03-18 | Stress test FIRE (FR-001) | Limite seguro R$360k/ano. Aprovado |
| 2026-03-18 | IPCA+ agora (RF-002) | 10% ladder 2035/2040/2050. Aprovado |
| 2026-03-18 | AVGC vs JPGL (FI-003) | JPGL mantido. Aprovado |
| 2026-03-18 | Reavaliacao independente carteira | Carteira 90% otima. 4 issues abertas |
| 2026-03-20 | Scorecard HD-002 criado com baseline T0 | 4 arquivos em agentes/metricas/. Shadows: VWRA+IPCA e 100% IPCA. P(FIRE) pendente FR-003 |
| 2026-03-20 | HD-006 intermediario | 9 erros corrigidos. IPCA+ 20%->10%, breakeven 6.4%->7.81%, equity BRL 5.89% base. 3 regras anti-recorrencia |
| 2026-03-22 | HD-006 decisao FINAL aprovada | Breakeven all-in ~5.5%, piso 6.0%. IPCA+ longo 15% (DCA ativo). Selic removido -> IPCA+ curto 3% aos 50. Equity 79%. 5 regras anti-recorrencia |
| 2026-03-22 | FIRE-002 v2 Done: Plano B perda renda CORRIGIDO | Perda renda = aposentadoria forcada (gastos imediatos). Perda 42: SWR 4.92%, sobrevive deterministico (R$2M aos 90) mas vulner. a vol. Perda 45+: robusto (pat cresce). Threshold auto-sustentavel: R$5.47M. Cenarios combinados falham — human capital R$5-8k/mes salva. Nenhuma acao preventiva agora | FIRE |

---

## Historico Superado

| Data | Decisao | Por que superada |
|------|---------|-----------------|
| 2026-03-18 | IPCA+ estrutural 10% antecipado, ladder 2035/2040/2050 | NTN-B 2035 descontinuado. Superado pela revisão de 2026-03-19 |
| 2026-03-19 | IPCA+ estrutural 7%, 100% no IPCA+ 2040 | Superado: teto cresceu para 20% então para 15% definitivo |
| 2026-03-20 | IPCA+ estrutural até 20% | Superado: breakeven recalculado para 7.81% → equity superior |
| 2026-03-20 | IPCA+ estrutural até 10%, piso 7.81% | Superado: HD-006 final calculou breakeven all-in correto ~5.5% |
| 2026-03-22 | FIRE-002 v1 | Erro de modelagem: gastos modelados apenas a partir dos 50. Corrigido em v2. |
