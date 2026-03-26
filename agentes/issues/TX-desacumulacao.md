# TX-desacumulacao: Custos tributarios de desacumulacao pos-FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-desacumulacao |
| **Dono** | 05 Tributacao |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 00 Head, 04 FIRE, 07 FX, 11 Quant |
| **Dependencias** | — |
| **Criado em** | 2026-03-23 |
| **Refinado em** | 2026-03-26 |
| **Origem** | HD-009 (Auditoria de gastos) |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

HD-009 identificou que o saving de ~R$49k/ano de tributos PJ (ISS etc.) ao se aposentar pode ser parcialmente ou totalmente consumido por custos tributarios de desacumulacao do portfolio. O Advocate estimou custos de R$37-62k/ano, deixando saving liquido de R$0-12k. Precisa ser quantificado com precisao antes de usar como margem no modelo FIRE.

**Baseline atualizado (2026-03-26):** gastos reais auditados = R$215k/ano (HD-009). Saque necessario do portfolio:
- **50-65 anos (Go-Go):** R$270-290k/ano - 0 (sem INSS) = R$270-290k/ano do portfolio
- **65-80 anos:** R$270-290k/ano - R$97k (INSS) = R$173-193k/ano do portfolio

O pico de saque e o pico de IR — primeiros anos pos-FIRE sao os mais custosos tributariamente.

---

## Descricao

Quantificar os custos tributarios recorrentes de desacumulacao do portfolio de Diego pos-FIRE, com base na legislacao atual (Lei 14.754/2023 e demais normas aplicaveis). Comparar com o saving de ~R$49k/ano de tributos PJ para calcular o saving liquido real. Definir a sequencia otima de desacumulacao por fase de vida.

---

## Escopo

### Bloco 1 — Custos por instrumento

- [x] **ETFs UCITS (Lei 14.754):** 15% flat sobre ganho nominal em BRL. Fato gerador: resgate/venda. DARF: 31/01 do ano seguinte (regime anual de apuracao). Sem isencao R$35k. Sem come-cotas. Prejuizo compensa lucro futuro na mesma categoria (offshores). Metodo FIFO — **PENDENTE** confirmacao in RFB (lei silente; IN SRFB 1.585/2015 + orientacoes recentes apontam FIFO, mas nao explicitado para UCITS)
- [x] **Ganho fantasma cambial:** com BRL depreciando 0,5%/ano, ~11% do IR pago sobre ETFs UCITS e sobre ganho inexistente em poder de compra real. Para saque de ~R$280k/ano: IR total estimado ~R$29k/ano → ~R$3.2k/ano e ganho fantasma. Custo real (vs custo percebido): modesto, mas acumula ao longo de 15 anos (50-65).
- [x] **IPCA+ Tesouro Direto (HTM):** tabela regressiva — 15% para holding acima de 720 dias. HTM (2040/2050): IR retido na fonte no vencimento. Diferimento integral ate 2040: capital que ficaria preso no imposto cresce livremente por anos. VP do diferimento estimado: ~R$28.5k para o alvo de R$523k (equivale a +69 bps/ano vs pagar IR no caminho). **Regra: nunca vender IPCA+ HTM antes do vencimento.**
- [x] **ETFs de RF (IMAB11, B5P211, IRFM11):** IR 15% flat sobre ganho de capital na venda (nao tabela regressiva). Sem come-cotas. Sem isencao R$35k. Vantagem vs TD direto: liquidez diaria — vende parcialmente sem liquidar posicao inteira. Util para TLH em drawdown + ajuste fino de cashflow na desacumulacao. Papel complementar, nao substituto do TD.
- [x] **Renda+ 2065:** mesmo tratamento IPCA+ (titulo publico, tabela regressiva, 15% se holding >720 dias). Se gatilho de venda acionado (taxa <= 6,0%): aguardar 720 dias se holding < 2 anos (IR 17,5% vs 15%). Renda+ NAO integra sequencia sistematica de desacumulacao — e trade tatico com gatilho de mercado (taxa), nao de cashflow.
- [x] **HODL11:** ETF de cripto — isencao R$35k/mes NAO se aplica (isencao e para crypto direto/spot, nao ETF). IR = 15% sobre ganho de capital, como qualquer ETF B3. **Corrецao: escopo original assumia isencao erroneamente.**
- [x] **IOF na desacumulacao (corrigido por Diego 26/03/2026):** IOF = 1,10% (ida e volta, mesmo rate). + spread Okegen 0,25% = 1,35% por operacao de cambio. Para saque anual ~R$280k convertido de USD p/ BRL: ~R$3.78k/ano de IOF+spread. Frequencia otima: anual (IOF e por operacao, nao por tempo — minimizar numero de remessas). Nota: havia controversia sobre 0,38% "retorno" mas Diego confirmou 1,10% e a mesma taxa.
- [x] **Custos operacionais:** custodia B3 0,20%/ano sobre RF Brasil (~R$427/ano no alvo), declaracao/contabilidade ~R$3-5k/ano. Total operacional: ~R$4-6k/ano (imaterial vs IR).

### Bloco 2 — INSS pos-FIRE

- [x] **Qualidade de segurado pos-FIRE:** se Diego parar contribuicoes ao FIRE (50), periodo de graca = 12 meses. Apos: perde qualidade. POREM: para aposentadoria por IDADE (65 anos, homens), pode requerer beneficio mesmo sem qualidade de segurado, desde que tenha carencia minima — Lei 10.666/2003, art. 3. Diego tem >33 anos = 396 meses >> 180 minimo. Pode parar no FIRE e ainda receber por idade aos 65.
- [x] **Beneficio INSS — revisao critica (extrato lido 26/03/2026):** contribuicoes no salario minimo de 08/2003 a 12/2016 (13+ anos: R$240-880/mes). No TETO apenas de 01/2017 em diante (9 anos). EC 103/2019 usa media aritmetica de TODAS as competencias. Media ponderada estimada (real 2026 BRL): ~R$3.000-4.400/mes. Fator com 34 anos (parar no FIRE/50): 60% + (34-20) × 2% = 88%. Beneficio estimado: **~R$46-55k/ano real 2026 — nao R$97k** como estava no modelo. R$97k so e atingivel se continuar contribuindo no teto ate ~65 anos. REQUER validacao previdenciaria profissional.
- [x] **Contribuicao minima pos-FIRE:** plano simplificado 11% = R$1.518 × 11% = R$167/mes. POREM: contribuicoes minimas reduzem a media do beneficio (R$167 << media atual ~R$4.380), reduzindo o beneficio final. Nao e recomendado contribuir minimo para maximizar beneficio. Opcao: verificar com especialista se faz sentido contribuir em nivel intermediario (20% de alguma base) para manter segurado sem destruir media.

### Bloco 3 — Sequencia otima de desacumulacao

- [x] **Sequencia aprovada:**
  1. **ETFs transitorios** com menor % de ganho nominal (FIFO por lote) — liquidar gradualmente pos-FIRE; seguem sendo diluidos ate la
  2. **HODL11** se atingir teto alocacao (5%) para rebalancear
  3. **Renda+ 2065** SE gatilho de mercado acionado — nao integra sequencia sistematica
  4. **IPCA+ 2040/2050** no VENCIMENTO (2040/2053) — nunca vender antes; HTM e a estrategia
  5. **Equity UCITS** (FIFO por lote) — fonte principal na fase madura (53+)
- [x] **Tax timing diferencial:** IPCA+ HTM difere ~R$28.5k de IR ate 2040/2050 vs ETFs que pagam no resgate. Regra: nunca vender IPCA+ HTM antes do vencimento.
- [x] **TLH em drawdown:** se transitorios ficarem com perda (raro; todos em lucro hoje), vender + migrar para UCITS = duplo beneficio tributario.

### Bloco 4 — Calculos consolidados

- [x] **Custo total anual de desacumulacao — 50-65 anos (saque ~R$280k/ano):**

| Custo | Estimativa | Base |
|-------|-----------|------|
| IR UCITS 15% (ganho nominal ~R$195k de R$280k saque) | ~R$29k/ano | ~70% do saque e ganho, 30% devolucao de custo |
| IOF + spread 1,35% sobre conversao FX | ~R$3.8k/ano | sobre ~R$280k convertido |
| Custodia B3 + declaracao | ~R$5k/ano | fixo |
| **TOTAL estimado** | **~R$37-40k/ano** | |

- [x] **65-80 anos (saque ~R$183k/ano, com INSS ~R$46k):** IR proporcional cai para ~R$18-22k/ano. Total: ~R$25-30k/ano.
- [x] **Saving liquido = R$49k (PJ taxes) - R$38k (desacumulacao 50-65) = ~R$11-12k/ano** — modesto; zero se qualquer despesa PJ for menor que estimado.
- [x] **ALERTA — Cashflow gap 50-53 (Finding critico):** IPCA+ 2040 vence quando Diego tem 53 anos (2040). Nos primeiros 3 anos pos-FIRE (50-53), sem essa RF, saque necessario = ~R$840k de equity. SoRR buffer atual (IPCA+ curto 3% = ~R$180k) cobre apenas 21% do gap. Em bear market no FIRE, sequence-of-returns risk amplificado. Alternativa: ampliar IPCA+ curto para 5-6%, ou usar Lombard como buffer nos primeiros anos.

### Bloco 5 — Cenario alternativo (PT-onelife)

- [x] **Lombard lending (bond OneLife):** IR desacumulacao = zero (emprestimo nao e fato gerador). Custo = juros Lombard ~2-3% sobre saldo utilizado. NPV Lombard vs resgate direto ao longo de 15 anos (5% real): ~**R$1,7M de vantagem** por diferimento composto (capital que pagaria IR fica rendendo).
- [x] **Break-even Lombard vs resgate direto:** Lombard superior quando retorno esperado portfolio (5-6% real) > custo efetivo do Lombard (juros / (1-IR) = 2,5% / 0,85 = 2,9%). Com equity esperando 5-6% real: Lombard e financeiramente superior em praticamente todo o intervalo relevante. Restricao: liquidez e termos do bond OneLife (PT-onelife cobre).
- [x] **Nota:** empresa R$800k fora do escopo — estrutura de propriedade indefinida.

---

## Outputs Esperados

1. **Custo anual de desacumulacao** por periodo (50-65 e 65-80), com breakdown por instrumento
2. **Saving liquido real** pos-FIRE (R$49k PJ - custos de desacumulacao)
3. **Sequencia otima de desacumulacao** por fase de vida
4. **Comparativo base vs Lombard** (se PT-onelife for adotado)
5. Resultado alimenta **FR-spending-smile** (baseline de gastos pos-FIRE)

---

## Analise

Executado em 2026-03-26 com 7 agentes: Tax, RF, FX, FIRE, Advocate, Fact-Checker, Quant.

### Findings por bloco

**IR por instrumento:**
- ETFs UCITS: 15% flat sobre ganho nominal BRL. Regime anual (DARF 31/01). Sem isencao, sem come-cotas. Metodo FIFO a confirmar (lei silente; pesquisa pendente).
- IPCA+ HTM: 15% no vencimento (2040/2050). VP do diferimento = ~R$28.5k para alvo R$523k = +69 bps/ano gratis. Nunca vender antes.
- ETFs RF B3 (IMAB11 etc.): 15% flat no resgate, sem come-cotas. Papel: liquidez parcial na desacumulacao.
- Renda+ 2065: igual IPCA+ (tabela regressiva). Trade tatico, nao integra sequencia sistematica.
- HODL11: 15% sobre ganho, SEM isencao R$35k (ETF, nao spot). Erro do escopo original corrigido.
- IOF desacumulacao: 1,10% + Okegen 0,25% = 1,35% sobre cada remessa FX (mesma taxa da ida). Confirmado por Diego.

**Ganho fantasma cambial:** ~11% do IR sobre UCITS e sobre componente BRL depreciation (0,5%/ano) que nao representa ganho real de poder de compra. Para saque de R$280k/ano: ~R$3.2k/ano de "imposto falso".

**INSS — revisao critica (extrato lido):** contribuicoes no minimo de 2003-2016 (13 anos). Teto apenas de 01/2017. EC 103/2019 usa media de TODAS as competencias. Beneficio estimado se parar no FIRE/50: ~R$46-55k/ano real (nao R$97k do modelo anterior). Para aposentadoria por IDADE (65), dispensa qualidade de segurado ativa se carencia > 180 meses (Diego tem 396+). Beneficio de R$97k so e atingivel continuando no teto ate ~65. Requer validacao previdenciaria.

**Cashflow gap 50-53 (Finding critico):** IPCA+ 2040 so vence em 2040 (Diego com 53 anos). Primeiros 3 anos pos-FIRE sem essa RF = ~R$840k de equity necessario. Buffer atual (IPCA+ curto 3% = ~R$180k) cobre 21%. Em bear market no FIRE, sequence-of-returns risk amplificado. Mitigantes: ampliar IPCA+ curto ou usar Lombard.

**Sequencia otima:** transitorios (menor % ganho) → HODL11 se acima do teto → Renda+ se gatilho tatico → IPCA+ no vencimento HTM → equity UCITS FIFO.

**Saving liquido:** R$49k PJ taxes - R$37-40k custos desacumulacao = **~R$11-12k/ano** (central). Zero se qualquer premissa for adversa.

**Lombard:** NPV +R$1,7M vs resgate direto ao longo de 15 anos. Financeiramente superior em praticamente qualquer cenario (custo 2-3% < IR efetivo sobre retirada). Barreira: liquidez do bond OneLife (PT-onelife define).

**Erros corrigidos durante execucao:**
1. IOF retorno: corrigido para 1,10% (mesmo da ida) — confirmado por Diego
2. HODL11: sem isencao R$35k (ETF, nao spot)
3. INSS R$97k: overstated — real ~R$46-55k se parar no FIRE
4. Nominal BRL: (1.0596)(1.04)-1 = 10,20% (havia double-counting de 0,5% BRL dep)

---

## Conclusao

**Custos de desacumulacao sao reais e consomem a maior parte do saving PJ:**
- 50-65 anos: ~R$37-40k/ano em IR + IOF + operacional
- 65-80 anos: ~R$25-30k/ano
- Saving liquido central: ~R$12k/ano (pode ser zero em cenario adverso)

**INSS precisa ser revisto no modelo:** R$97k/ano era premissa incorreta. Beneficio estimado por idade (65 anos, parando no FIRE/50) = R$46-55k/ano real 2026. Impacto: reduz a seguranca do modelo FIRE para a fase 65-80. Recomendado: consultar especialista previdenciario para simulacao exata; atualizar FR-003 com R$50k como premissa conservadora.

**Cashflow gap 50-53 e o risco nao modelado mais critico:** IPCA+ 2040 (15% da carteira) so esta disponivel em 2040. 3 anos de equity exposure pura sem RF como buffer. Ampliar IPCA+ curto de 3% para 5% ou usar estrutura Lombard resolveriam isso.

**Lombard e financeiramente superior mas tem restricoes operacionais:** a questao nao e se e melhor (e) mas se a estrutura OneLife funciona para o caso de Diego (PT-onelife define).

**Sequencia otima definida:** transitorios → Renda+ (tatico) → IPCA+ no vencimento → UCITS FIFO.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma mudanca imediata. Gap 50-53 e risco monitorar: ampliar IPCA+ curto de 3% para 5% como mitigante (decisao futura). |
| **Estrategia** | Sequencia de desacumulacao definida. HTM absoluto confirmado para IPCA+. Sequencia: transitorios → Renda+ (tatico) → IPCA+ vencimento → UCITS FIFO. |
| **Conhecimento** | Saving liquido ~R$12k/ano (nao R$49k bruto). INSS R$97k overstated: real ~R$46-55k/ano se parar no FIRE. Lombard NPV +R$1,7M. IOF = 1,35% ida e volta. HODL11 sem isencao R$35k. FIFO a confirmar para UCITS. |
| **Memoria** | project_patrimonio_total.md: INSS PV atualizado R$283k → R$134k (beneficio R$46k, conservador). Requer validacao previdenciaria. |
| **Pendente** | FIFO UCITS: pesquisa em andamento (fact-checker). Validacao INSS: especialista previdenciario. Atualizar FR-003 com INSS R$50k. Gap 50-53: decisao sobre ampliar IPCA+ curto. |

---

## Proximos Passos

- [x] Issue executada — 7 agentes em 2026-03-26
- [ ] Atualizar FR-003 (Monte Carlo) com INSS ~R$50k (nao R$97k) — impacto em P(FIRE)
- [ ] Decidir sobre ampliar IPCA+ curto de 3% para 5% para cobrir gap 50-53
- [ ] Consultar especialista previdenciario para simulacao exata do beneficio INSS
- [ ] Confirmar FIFO UCITS com RFB / advogado tributarista
- [ ] Resultado alimenta FR-spending-smile (custos saude com inflator proprio)
