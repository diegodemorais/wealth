| Campo | Valor |
|-------|-------|
| ID | HD-multi-llm-validation |
| Título | Validação multi-model das 5 decisões estruturais (anti-sycophancy D8) |
| Dono | Head |
| Status | 🔴 Doing |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-22 |
| Participantes | Head, Advocate, Quant, modelos externos (GPT/Gemini/DeepSeek) |

## Motivo

Todas as decisões estruturais da carteira foram tomadas por agentes Claude (mesmo LLM). A decisão 50/30/20 teve sycophancy documentada. Protocolo D8 exige validação multi-model para decisões >5% do portfolio.

## 5 Decisões a Validar

1. **50/30/20 (SWRD/AVGS/AVEM)** — alocação equity com sycophancy documentada
2. **IPCA+ 15%, piso 6.0%** — bond tent e DCA de renda fixa
3. **Premissas retorno (4.85% BRL real)** — base do MC inteiro
4. **Guardrails como withdrawal strategy** — vs SWR/TPAW/VPW
5. **Healthcare R$18k base, VCMH +2.7%/ano** — premissa de gastos com saúde

## Escopo

- [x] Montar prompt de contestação para modelos externos
- [x] Rodar `multi_llm_query.py` com prompt
- [x] Registrar respostas de cada modelo (3/5 responderam: Gemini, GPT-OSS, Llama4)
- [ ] Head + Advocate sintetizam: o que muda, o que confirma
- [ ] Diego decide ações

Respostas completas: `agentes/issues/HD-multi-llm-validation-results.md`

## Síntese — Consenso dos 3 Modelos Externos

### Decisão 1: 50/30/20

| Modelo | Veredicto | Principal crítica |
|--------|-----------|-------------------|
| Gemini | STRONGLY DISAGREE | Concentração excessiva em SCV + double-dip EM para brasileiro |
| GPT-OSS | PARTIALLY DISAGREE | 30% SCV é massive factor-tilt, single-fund concentration |
| Llama4 | PARTIALLY DISAGREE | AVGS overconcentrado, EM não ajusta pra exposição Brasil |

**Consenso externo**: 30% AVGS é alto demais. Sugerem 15-20% AVGS. EM overweight pra brasileiro. Sycophancy invalidou o processo.

**Head**: Discordo parcialmente. A crítica de double-dip EM é válida em teoria (Diego é brasileiro), mas na prática sua renda é em BRL e equity é em USD — são exposições não-correlacionadas. O 30% AVGS é agressivo mas intencional (50/50 neutro/fatorial). A sycophancy no processo é o ponto mais legítimo — o 50/30/20 pode estar certo pelo motivo errado.

### Decisão 2: IPCA+ 15%

| Modelo | Veredicto | Principal crítica |
|--------|-----------|-------------------|
| Gemini | STRONGLY DISAGREE | 15% bonds na acumulação draga retorno |
| GPT-OSS | PARTIALLY DISAGREE | Oversized pra 14 anos de acumulação, reduzir pra 5-10% |
| Llama4 | STRONGLY DISAGREE | Muito conservador, reduzir pra 5-7% |

**Consenso externo**: 15% é demais na acumulação. Sugerem 5-10%.

**Head**: Discordo. Os modelos não estão considerando que IPCA+ a 7.16% real líquido é extraordinário historicamente — yield superior ao equity expected return (4.85% BRL real). É uma oportunidade assimétrica. Não é "bond allocation conservadora" — é yield picking oportunístico.

### Decisão 3: Premissas retorno (4.85%)

| Modelo | Veredicto | Principal crítica |
|--------|-----------|-------------------|
| Gemini | (truncado) | — |
| GPT-OSS | PARTIALLY DISAGREE | AVGS 5% otimista com haircut 58%. Vol deveria ser 20-22%, não 16.8% |
| Llama4 | PARTIALLY DISAGREE | AVGS/AVEM otimistas, reduzir 0.5-1pp |

**Consenso externo**: AVGS 5.0% pode ser otimista. Vol 16.8% possivelmente subestimada.

**Head**: Ponto válido. O haircut de 58% já é aplicado (alpha líquido ~0.16%/ano), mas o premium de 1.3pp inclui mais do que alpha puro — inclui composição geográfica (ex-US barato). Vol de 16.8% é a medida histórica real da carteira em 5 anos. Não vou ajustar sem dado empírico.

### Decisão 4: Guardrails

| Modelo | Veredicto | Principal crítica |
|--------|-----------|-------------------|
| Gemini | (truncado) | — |
| GPT-OSS | STRONGLY DISAGREE | R$250k baixo pra casal SP idoso. R$180k não sobrevive. Bond pool 7y insuficiente |
| Llama4 | PARTIALLY DISAGREE | R$250k e R$180k floor podem ser irrealistas com healthcare |

**Consenso externo**: Spending e floor estão baixos. Healthcare vai explodir os números.

**Head**: Ponto forte. R$250k é para solteiro/casal jovem. Casal idoso em SP com saúde privada pode precisar de R$300-350k. O floor R$180k é apertado mas sobrevivível (exclui luxo, mantém essenciais). O ponto real é que o custo de saúde puxa tudo pra cima — ver Decisão 5.

### Decisão 5: Healthcare R$18k

| Modelo | Veredicto | Principal crítica |
|--------|-----------|-------------------|
| Gemini | STRONGLY DISAGREE | (truncado mas título claro) |
| GPT-OSS | STRONGLY DISAGREE | R$18k é custo de grupo PJ. Individual 50+ custa R$30-48k/ano. VCMH +2.7% subestima spikes. LTC não modelado |
| Llama4 | STRONGLY DISAGREE | Severamente subestimado. Base deveria ser R$30k. Inflator +4-5%/ano real |

**Consenso externo: UNANIMIDADE — R$18k é severamente subestimado.** Todos os 3 modelos concordam que:
1. R$18k é custo de plano coletivo PJ — perdido no FIRE
2. Individual 50+ custa R$30-48k/ano (2-3x o modelado)
3. VCMH +2.7% subestima spikes recentes (6-11%)
4. ANS age brackets e LTC não modelados

**Head**: Este é o achado mais crítico. Se saúde base for R$35k (não R$18k) com inflator de 4% real (não 2.7%), o impacto no P(FIRE) é material. Precisa rerodar MC com premissa corrigida.
