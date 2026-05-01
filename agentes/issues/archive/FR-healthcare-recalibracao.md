| Campo | Valor |
|-------|-------|
| ID | FR-healthcare-recalibracao |
| Título | Recalibrar SAUDE_BASE — R$18k→R$30-36k + VCMH 4% + ANS age brackets |
| Dono | FIRE |
| Status | ✅ Done |
| Concluída | 2026-04-23 |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-22 |
| Participantes | FIRE (lead), Quant, Tax, Advocate, Dev |
| Origem | HD-multi-llm-validation — unanimidade de 3 modelos externos em 2 rodadas |

## Motivo

SAUDE_BASE = R$18k/ano foi contestado por 3 modelos externos (Gemini, GPT-OSS, Llama4) em 2 rodadas de debate. Mesmo após justificativas do time, todos mantiveram STRONGLY DISAGREE. É a ÚNICA decisão estrutural que não sobreviveu à validação multi-model.

### O problema

R$18k/ano é o custo atual de plano coletivo PJ (Bradesco). No FIRE (50-53 anos), Diego perde o plano PJ e migra para individual. Plano individual 50+ em SP custa R$30-48k/ano hoje.

### Gaps específicos

1. **Base subestimada**: R$18k = grupo PJ. Individual 50+ = R$30-48k/ano (2-3x)
2. **VCMH +2.7%/ano**: média 18 anos IESS. Spikes recentes de 6-11%. Modelos sugerem 3.5-4.0%
3. **ANS age brackets não modelados**: saltos discretos nos 54→ e 59→ (20-30% de aumento por bracket)
4. **LTC omitido**: custos de cuidado de longo prazo 75+ não estão no base case MC. Só na sensitivity (dashboard)

## Recomendações dos modelos externos

| Modelo | SAUDE_BASE recomendado | VCMH recomendado | ANS | LTC |
|--------|----------------------|-----------------|-----|-----|
| Gemini | R$36k (individual mid-range) | 3.5-4.0% real | Modelar saltos 54→, 59→ | Provisão separada 75+ |
| GPT-OSS | R$35k base FIRE Day | 4.0% real | Incluir brackets | LTC R$72-216k/ano como cenário |
| Llama4 | R$30k | 4-5% real | Modelar | Incluir no modelo |

## Escopo

### Fase 1 — Pesquisa (FIRE + Tax)
- [ ] Cotar plano individual Bradesco/SulAmérica/Amil para homem 50 anos em SP (Diego ou via web)
- [ ] Levantar tabela ANS de reajuste por faixa etária (54-58, 59+)
- [ ] Compilar VCMH IESS dos últimos 5 anos (não só média 18 anos)
- [ ] Estimar custo LTC em SP: home care, asilo, cuidador (R$/mês por nível)

### Fase 2 — Recalibrar modelo (Quant + FIRE)
- [ ] Definir SAUDE_BASE novo (R$30k? R$35k? R$36k?)
- [ ] Definir VCMH inflator (2.7%? 3.5%? 4.0%?)
- [ ] Modelar ANS age brackets como step function no spending smile
- [ ] Incluir LTC como cenário no base case MC (não só sensitivity)
- [ ] Rerodar MC com premissas corrigidas → novo P(FIRE)

### Fase 3 — Impacto e decisão (Head + Diego)
- [ ] Comparar P(FIRE) antigo vs novo
- [ ] Se P(FIRE) cair >5pp: avaliar contramedidas (aporte maior, FIRE date posterior, custo de vida menor)
- [ ] Atualizar carteira.md com nova premissa
- [ ] Dev: atualizar dashboard com novos parâmetros

## Dados de referência

### Modelo atual
```
SAUDE_BASE = 18.000  (Bradesco coletivo PJ)
VCMH = +2.7%/ano real (média 18 anos IESS)
No FIRE Day (14 anos): R$18k × 1.027^14 = ~R$26k
Post-65 com ANS: estimado R$50-80k (não modelado formalmente)
LTC: sensitivity no dashboard, não no MC base
```

### Modelo proposto (mediana das recomendações)
```
SAUDE_BASE = 35.000  (individual mid-range SP, 50 anos)
VCMH = 3.5%/ano real (acima da média, abaixo dos spikes)
No FIRE Day: R$35k × 1.035^14 = ~R$56k
ANS age brackets: +25% aos 54-58, +30% aos 59+ (step function)
Post-65: R$56k × 1.25 × 1.30 = ~R$91k/ano
LTC 75+: R$72k-R$216k/ano adicional (cenário no MC)
```

### Impacto estimado (antes de rodar MC)
- Spending pós-FIRE sobe ~R$30-60k/ano dependendo da idade
- P(FIRE) provavelmente cai 3-8pp
- Pode exigir: aporte maior, FIRE date +1-2 anos, ou custo vida ex-saúde menor

## Resultado Final (23/04/2026)

**SAUDE_BASE: R$18k → R$24k** (plano intermediário coletivo adesão SP, R$2k/mês com buffer)
**VCMH: 2.7% → 5.0%** (mid-point entre média 18a e trend recente 7-10%)
**P(FIRE): 91.0% → 86.4% base** (delta -4.6pp)

Todos os arquivos atualizados: carteira.md, config.py, fire_montecarlo.py, memórias, data.json, dashboard.

## Fontes
- HD-multi-llm-validation: 4 modelos externos, 2 rodadas
- Pesquisa web SP 23/04: Bradesco, SulAmérica, Amil, Hapvida — preços reais por faixa
- IESS: VCMH histórico (15.1% nominal 2023, 27.7% pico pós-pandemia)
- ANS: RN 63/2003 (teto 6x, faixa 59+ congela)
- Gazeta do Povo: reajustes coletivos 15-25%/ano
- InvestNews / Serena Nobre: custos home care e ILPI SP
