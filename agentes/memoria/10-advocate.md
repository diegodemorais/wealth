# Memoria: Devil's Advocate

## Premissas Desafiadas

| Data | Premissa | Veredicto | Detalhes |
|------|----------|-----------|----------|
| 2026-03-18 | (Nao acionado na fundacao) | Gap identificado | Retro HD-001: regra de acionamento obrigatorio criada no Head |
| 2026-03-18 | HODL11 como exposicao a risco Brasil | **Incorreto** | HODL11 e wrapper B3 de Bitcoin (HODL/Hashdex). Ativo subjacente e cripto global, nao risco fiscal BR. Risco Brasil e so operacional (custodia B3). Exposicao real a risco Brasil: Renda+ + Reserva IPCA+ = ~6-7,5% |
| 2026-03-18 | Estrategia geral (carteira alvo + glidepath + taticas) | **Validada** | Revisao completa com Factor, FIRE, Risco. Sem mudancas necessarias. Pontos de atencao: drawdown comportamental, custo de vida futuro (FR-001) |
| 2026-03-20 | 90% equity acumulacao 11 anos | **Parcialmente fragil** | Ausencia de bond tent pre-FIRE (47-48) e risco de sequence-of-returns. Drawdown -45% aos 48 atrasa FIRE 3-5 anos |
| 2026-03-20 | Factor premiums justificam 65% em factor ETFs | **Fragil-moderada** | McLean&Pontiff -58% decay, HML=0% 1990-2025 nos EUA. Custo de estar errado e baixo (~R$70-80k/11a). Avantis multifator mitiga. Manter mas aceitar underperformance vs VWRA |
| 2026-03-20 | 20% EM (overweight vs 12% mkt cap) | **Robusta** | Valuations atrativas, diversificacao. Risco: Taiwan/China = 45% do indice. Monitorar geopolitica |
| 2026-03-20 | JPGL 20% da carteira | **Moderadamente fragil** | Track record curto, metodologia menos transparente que Avantis/DFA. Gap -19.7% concentra risco de timing |
| 2026-03-20 | IPCA+ estrutural deveria ser 12-22% (nao 7%) | **Premissa rejeitada apos analise liquida** | Conta liquida (IR sobre nominal + cambio + custos) mostrou que vantagem do IPCA+ e menor que analise bruta sugeria. Breakeven cambial 2.1%/ano > CAGR historico BRL 0.77%/ano. 7% e suficiente: gera R$1.26M no vencimento (5 anos de despesas). Time convergiu 5x2 para 7% |
| 2026-03-20 | Renda+ 2065 tatico (duration 43.6) | **Fragil** | Assimetria negativa: upside +39.5% vs downside -86% se taxa for a 9%. Cenario fiscal BR desfavoravel. Hard cap 5% contem dano |
| 2026-03-20 | 3% crypto | **Robusta (irrelevante)** | Impacto marginal no FIRE. 3% nao faz diferenca nem positiva nem negativa |
| 2026-03-20 | Nunca vender para rebalancear | **Parcialmente fragil** | Com R$25k/mes vs R$3.5M, aportes = 0.7% do portfolio. Convergencia lenta. Transitorios criam complexidade. Considerar venda seletiva |
| 2026-03-20 | 85% equity na aposentadoria + guardrails | **Fragil** | Sequence-of-returns nos primeiros 5 anos. Kitces/Pfau: rising glidepath superior. Implementar bond tent 48-53 |
| 2026-03-20 | R$250k/ano custo de vida estavel | **Fragil** | Nao contempla casamento/filhos/saude. Healthcare BR cresce 15-20%/ano. Modelar R$300-400k |
| 2026-03-20 | Sistema de 14 agentes agrega valor | **Parcialmente fragil** | Mesmo LLM = groupthink simulado. Valor real e como checklist/framework, nao como diversidade de opiniao. Buscar opiniao humana externa anual |
| 2026-03-20 | Renda+ DCA parado a 3.2% (RF-003) | **Parcialmente fragil** | Time focou em sizing, nao em probabilidade. Ciclo de corte Selic favorece compressao de taxas. Valor esperado provavelmente positivo. Decisao defensavel por disciplina, mas cenario probabilistico favorecia mais exposicao |
| 2026-03-20 | 88% equity no FIRE sem bond tent (FR-004) | **Parcialmente fragil** | Cherry-picking de ERN (ignorou que ERN recomenda buffer 5y). Drawdown -40% + -15% nos anos 1-2 leva SWR a 4.72% (perigoso para 39 anos). Pos-2040: 37 anos com 92% equity e zero RF real. Nenhum guardrail de retirada em drawdown |
| 2026-03-20 | Equity 89% como risco aceito (RK-001) | **Nao debatida — falha do time** | Risco identificou como dominante, ninguem discutiu. Confirmation bias: equity alto e premissa fundacional, time evitou questionar |
| 2026-03-20 | Reserva emergencia 100% soberano BR | **Parcialmente fragil** | Em crise fiscal severa (confisco/IOF), reserva comprometida pelo mesmo emissor. Considerar componente offshore (USD cash em IB) |
| 2026-03-20 | Ordem liquidacao generica (RK-001) | **Parcialmente fragil** | Nao discrimina por tipo de crise. Em crise fiscal BR, equity global (menos afetado) deveria ser liquidado antes da reserva IPCA+ (mais afetada) |

## Aprendizados

| Data | Aprendizado | Acao |
|------|-------------|------|
| 2026-03-20 | 6 erros da sessao tinham causa raiz comum: omissao de premissas ao calcular. Advocate tinha HODL11 corrigido na propria memoria e nao impediu o erro 2x. Sugeri IPCA+ 12-22% sem conta liquida | Checklist Pre-Veredicto obrigatorio implementado (ver 00-head.md). Advocate deve cobrar que agentes rodem o checklist antes de apresentar numeros |

---

## Checklist de Stress-Test

### Lógica reversa para trades táticos
Quando a tese de um trade tático é "janela fechando" (ex: taxas vão cair), testar: "se a janela fechar, o que acontece COM a posição?". A contradição fatal do IPCA+ 2032 (retro 2026-03-19) mostrou que o cenário que motiva a compra pode destruir o reinvestimento. Diego identificou isso antes do Advocate — não pode se repetir.

### Assimetria de payoff em renda fixa privada
Testar sempre: nos cenários em que o produto rende mais, o risco de crédito também sobe? Se sim, payoff assimétrico contra o investidor (caso CDB 120% CDI — retro 2026-03-19).

### Analise probabilistica obrigatoria em cenarios
Nunca apresentar cenarios so com magnitude de perda/ganho. SEMPRE atribuir probabilidade estimada a cada cenario. Ratio upside/downside sem probabilidade e incompleto e pode distorcer decisoes (caso RF-003: ratio 0.91x parecia desfavoravel, mas ponderado por probabilidade era favoravel).

### Data de inicio dos gastos em modelos FIRE (aprendizado retro 2026-03-22)
Em qualquer modelo de Plano B (perda de renda, stress de FIRE), verificar explicitamente: "quando os gastos comecam neste cenario?" Perda de renda = aposentadoria forcada = gastos imediatos, nao aos 50. FIRE-002 v1 errou exatamente isso (gastos modelados apenas a partir dos 50). Essa premissa deve ser visivel e questionada antes de qualquer modelagem.

### Pos-vencimento de titulos estruturais
Quando um titulo estrutural (IPCA+ 2040) vence, o que acontece com a protecao que ele oferecia? Se nenhum substituto esta planejado, isso e um gap. Registrar em toda decisao que envolva titulos com data de vencimento.

### Unanimidade como sinal de alerta
Se o time inteiro concorda com uma premissa (equity 89%), e o proprio time identifica isso como o risco dominante, mas NINGUEM debate: isso e confirmation bias institucional. Forcar debate explicito.

### Guardrails de retirada em FIRE
Nao basta definir SWR. Definir o que acontece se drawdown > X% nos primeiros N anos. Sem guardrail, a estrategia depende 100% de disciplina comportamental — que e exatamente o que falha em crise.

---

## Multi-Model Validation — Findings (2026-04-06)

> Execução: HD-multimodel-validation. 2 rounds + Deep Research. Tema: AVGS 30% vs SWRD 50%.

### Decisão validada: 50/30/20 corroborado

6 outputs externos, 2 rounds. Mediana Round 2 (sem tickers) = exatamente 50/30/20. Decisão FI-equity-redistribuicao sobrevive.

### Findings registrados

| # | Finding | Fonte | Ação |
|---|---------|-------|------|
| F-1 | **Tracking error regret é o risco primário de falha**, não drawdown absoluto. Time mapeou tail risk (-45% BRL) mas não aceitou explicitamente o risco de underperformance relativa prolongada (ex: AVGS flat enquanto SWRD +8%/ano por 8 anos). Este é o mecanismo real de abandono de estratégias fatoriais. | R1 — ChatGPT + Perplexity | Adicionar a carteira.md como risco aceito ao lado de tail risk |
| F-2 | **Factor drought sequence risk** ≠ market drawdown. Bond tent protege contra queda de mercado; não protege contra underperformance relativa do fator pré-FIRE. Se AVGS underperforma SWRD por 5+ anos antes de 2040, o SWR no FIRE Day será calculado sobre portfólio que rendeu menos que o mercado por uma década. | R2 — Perplexity | Novo gatilho: se AVGS underperforma SWRD >5pp acum. 24 meses → reabrir debate SCV |
| F-3 | **Restrição "rebalancear só via aportes" degrada eficiência fatorial.** Factor strategies dependem de turnover (comprar barato, vender caro dentro do fator). Com R$25k/mês vs R$3M+, turnover natural ~10%/ano. Premium efetivo capturado provavelmente 0.7-0.9%/ano vs 1.1% teórico. | R2 — ChatGPT | Quantificar em issue futura (baixa prioridade) |
| F-4 | **Sinergia família + drawdown não modelada como evento conjunto.** Filho ~2028, drawdown possível a qualquer momento. Se coincidem: gastos sobem R$50-70k/ano (rígidos) + portfólio deprimido. Modelo FIRE trata como independentes. | R2 — Gemini | Próximo fire_montecarlo.py incluir cenário "filho 2028 + drawdown 2029" |
| F-5 | **Formato sem tickers (Round 2) é superior para multi-model validation.** Round 1: 3 modelos ancoraram em track record curto de AVGS → todos recomendaram menos. Round 2: dispersão honesta (25-35%), mediana = 50/30/20, 3 insights estruturais novos vs 0 no Round 1. | Comparação R1 vs R2 | Protocolo futuro: Round 2 como padrão |
| F-6 | **Argumento phantom gain favorece IPCA+, não mais factor tilt.** Deep Research argumentou que custos maiores (IR sobre ganho nominal) exigem mais retorno → mais SCV. Lógica invertida: se hurdle está alto e IPCA+ 7.21% bruto já entrega ~6.0% real HTM vs equity base 4.85%, o argumento é para mais IPCA+, não mais SCV. Reforça DCA em curso. | Deep Research | Já na estratégia — mais uma linha de evidência |
| F-7 | **Round 1 com tickers ancorou modelos no produto, não na tese.** Sem AVGS (produto novo, 2022), modelos avaliaram SCV como asset class e foram mais agressivos (ChatGPT: 35%). A ancoragem no produto comprime a avaliação da tese subjacente. | R1 vs R2 | — |

### Protocolo futuro

- **Formato padrão**: Round 2 (categorias, sem tickers)
- **Periodicidade**: anual na revalidação de premissas + ad-hoc em issue estrutural ≥Alta
- **Gatilho automático de revisão SCV**: AVGS underperforma SWRD >5pp acumulado em 24 meses → reabrir debate com F-1/F-2 como contexto

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | (Nao foi acionado) | Gap — regra corrigida via HD-001 |
| 2026-03-18 | Revisao geral da estrategia | HODL11 corrigido (nao e risco BR). Estrategia validada. Stress test custo de vida sugerido (FR-001) |
| 2026-03-20 | Revalidacao profunda (10 premissas + meta) | 4 frageis, 3 parcialmente frageis, 2 robustas, 1 irrelevante. Top 3 acoes: (1) bond tent pre-FIRE, (2) elevar IPCA+ para 10-15%, (3) modelar custo de vida R$300-400k |
| 2026-03-20 | Stress-test 3 decisoes aprovadas (RF-003, FR-004, RK-001) | Time foi bonzinho no que ESCOLHEU NAO DISCUTIR. Decisoes defensaveis, mas 4 gaps criticos: (1) equity 89% identificado como risco dominante e ignorado, (2) zero planejamento pos-2040, (3) cherry-picking ERN (ignorou recomendacao de buffer), (4) analise de probabilidade ausente em cenarios Renda+. 8 acoes recomendadas |
| 2026-03-20 | Protocolo Multi-Model Validation implementado | Obrigatorio em decisoes estruturais (Bull vs Bear), revalidacao anual, issues >5% alocacao. Advocate prepara prompt neutro, Diego roda em GPT/Gemini, Advocate compara outputs. Compensa limitacao de mesmo-LLM |
