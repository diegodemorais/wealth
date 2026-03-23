# Shadows & Benchmarks da Carteira

> Criado: 2026-03-22 | Revisão anual: março de cada ano

Quadro de referência para comparar a performance real da carteira vs cenários alternativos. Comparação justa exige **base líquida all-in** (pós-tax, pós-cost) para todos os shadows — lição do HD-006.

---

## Os 4 Shadows Oficiais

| # | Shadow | Pergunta que responde |
|---|--------|----------------------|
| S1 | VWRA puro (100% equity global) | Os tilts fatoriais valem a complexidade? |
| S2 | 100% IPCA+ HTM | Qual o custo de oportunidade vs RF garantida? |
| S3 | Carteira com factor decay -35% | E se os premiums se materializarem pela metade? |
| S4 | Carteira atual (pesos reais) | Qual o custo de estar em trânsito? |

**Frequência de comparação**: anual, na retro de março. Não olhar mensalmente — noise domina sinal.

---

## Quadro Comparativo (base líquida all-in, 11 anos, 2026→2037)

### Premissas gerais
- Patrimônio inicial: R$3.482.633
- Aporte mensal: R$25k
- Horizonte: 11 anos (FIRE aos 50, 2037)
- Depreciação real BRL: 0,5%/ano (cenário base)
- IPCA estimado: 4%/ano
- Custos equity all-in deduzidos: TER ~0,25% + TD ~0,10% + WHT ~0,22% + FX amortizado ~0,24%/ano + IR 15% sobre ganho nominal BRL

### Tabela principal

| Shadow | Ret real líq | FV real (R$ hoje) | FV nominal (2037) | SWR |
|--------|-------------|-------------------|-------------------|-----|
| **S2-A** IPCA+ taxa 7,16% constante | 5,90% | R$11,13M | R$17,14M | 2,25% |
| **S2-B** IPCA+ queda gradual → 6,5% | 5,76% | R$11,00M | R$16,94M | 2,27% |
| **S2-C** IPCA+ queda ao piso 6,0% | 5,56% | R$10,81M | R$16,64M | 2,31% |
| **Diego Target** | ~4,20% | ~R$9,70M | ~R$14,90M | ~2,57% |
| **S4b-C** Atual dinâmico (cripto 15% real) | 4,78% | R$10,12M | R$15,58M | 2,47% |
| **S4b-B** Atual dinâmico (cripto 5% real) | 4,39% | R$9,80M | R$15,09M | 2,55% |
| **S4b-A** Atual dinâmico (cripto 0% real) | 4,30% | R$9,72M | R$14,97M | 2,57% |
| **S3** Factor decay -35% | 4,01% | R$9,49M | R$14,61M | 2,63% |
| **S4a-A** Atual estático (cripto 0% real) | 4,03% | R$9,51M | R$14,63M | 2,63% |
| **S1** VWRA puro | 3,70% | R$9,25M | R$14,23M | 2,70% |

> Referência SWR: <3,5% = confortável | 3,5–4,0% = OK | >4,0% = risco elevado. **Todos os cenários estão confortáveis.**

### Cenários de cripto (impacto isolado — 3% da carteira)
| Cenário | Premissa | Delta FV vs cripto 0% |
|---------|----------|----------------------|
| A | 0% real (sem base acadêmica) | baseline |
| B | 5% real (reserva de valor emergente) | +~R$80k |
| C | 15% real (adoção institucional plena) | +~R$400k |

---

## Findings Principais (auditoria 2026-03-22)

**1. IPCA+ domina equity em base líquida all-in por ~170bps.**
S2-A (5,90%) vs Diego Target (~4,20%) = +170bps. Causa: custos all-in do equity são pesados (FX 2,7% amortizado, IR sobre ganho fantasma cambial, WHT). Confirma HD-006.

**2. Factor tilts valem ~50bps líquidos sobre VWRA.**
Diego Target (~4,20%) vs S1 VWRA (3,70%) = +50bps. Margem menor do que a análise bruta sugeria, mas positiva e consistente.

**3. Convergir para target vale R$200–300k.**
S4 dinâmico supera estático: a convergência via aportes (JPGL + IPCA+) adiciona valor vs manter pesos atuais inertes.

**4. Factor decay não inverte o ranking.**
S3 (4,01%) ainda supera S1 (3,70%) mesmo com premiums reduzidos em -35%. Os tilts se pagam mesmo no cenário pessimista.

**5. Cripto: impacto limitado.**
Mesmo cenário C (15% real) adiciona apenas ~R$400k (~4% do FV). Low-stakes para decisão de alocação.

---

## Premissas — Ressalvas Ativas

As seguintes premissas têm confiança menor e devem ser refinadas na revisão anual com dados realizados:

| # | Ressalva | Impacto estimado | Refinamento |
|---|----------|-----------------|-------------|
| 1 | Diego Target sem fórmula explícita (~4,20%) | Médio | Quant calcula com fórmula em 2027 |
| 2 | FX amortizado linear (não captura aportes mensais) | Baixo | Refinamento em 2027 com histórico real |
| 3 | Renda+ 2065 no S4 tratado como HTM (é tático) | Baixo | Corrigir se posição for vendida |
| 4 | Dep BRL 0,5% — cenário stress não captura downside histórico (~3-5%) | Médio | Adicionar cenário BRL -3% em 2027 |
| 5 | S3 decay pode ter double-counting com fontes AQR | Baixo | Zona cinzenta — aceitar como simplificação |

---

## Tracking Anual

A cada março, comparar:

| Métrica | Mar 2026 | Mar 2027 | Mar 2028 |
|---------|----------|----------|----------|
| Ret real líquido Diego (realizado) | baseline | — | — |
| Ret real S1 VWRA (realizado) | baseline | — | — |
| Ret real S2 IPCA+ (marcação HTM) | baseline | — | — |
| Taxa IPCA+ no momento | 7,16% | — | — |
| FV real carteira | R$3,48M | — | — |

---

## Histórico de Revisões

| Data | Evento | Mudança |
|------|--------|---------|
| 2026-03-22 | Criação | Quadro inicial com auditoria Quant. Base líquida all-in. 4 shadows + cenários S2/S4/cripto. |
