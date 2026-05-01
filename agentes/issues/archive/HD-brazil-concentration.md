# HD-brazil-concentration: Qual é a exposição real ao Brasil?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-brazil-concentration |
| **Dono** | 07 FX |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 07 FX (lead), 08 Macro, 10 Advocate, 09 Quant, 11 Fact-Checker, 12 Cético |
| **Dependencias** | — |
| **Criado em** | 2026-03-24 |
| **Origem** | Meta-debate echo chamber 2026-03-24 |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

A concentração em risco Brasil nunca foi quantificada de forma integrada. Os itens visíveis são: IPCA+ longo (15% alvo), Renda+ tático (≤5%), reserva, cripto em BRL (HODL11). Mas o risco Brasil vai além:

- **Capital humano 100% BRL**: renda de PJ em reais, correlacionada com economia brasileira
- **Moradia em São Paulo**: ativo ilíquido com exposição a mercado imobiliário BR
- **Risco regulatório**: IOF punitivo sobre remessas, controle de capital, confisco histórico (Plano Collor)

Viceira (2001) e Campbell & Viceira (2002) são explícitos: **quando capital humano está concentrado em um país, o portfolio financeiro deveria subpesar esse país, não somar à concentração**. Nunca verificamos se a carteira atual segue esse princípio.

---

## Regra deste issue (burden of proof invertido)

A concentração Brasil atual deve se justificar. A evidência que mudaria ≥10% da alocação: se a exposição consolidada ao risco Brasil (capital humano + ativos financeiros BR) estiver acima do ótimo de portfolio com labor income correlacionado.

**Irrefalsifiabilidade:** Qual seria a exposição máxima a Brasil compatível com a teoria, e onde está Diego hoje?

---

## Escopo

- [ ] FX: quantificar exposição consolidada ao Brasil — capital humano (valor presente da renda futura), ativos financeiros BR (IPCA+, Renda+, HODL11), moradia estimada
- [ ] Macro: qual é a correlação entre renda de consultoria/PJ BR e retornos de IPCA+ e equity BR? Em crise fiscal, ambos caem juntos?
- [ ] Advocate: modelar cenário extremo — crise fiscal grave (CDS >800 bps, IOF 10% sobre remessas, controle de capital). Impacto total na riqueza de Diego?
- [ ] Calcular: % da riqueza total (incluindo capital humano) exposta ao risco Brasil vs recomendação de portfolio com labor income correlacionado
- [ ] Recomendação: qual % máximo em ativos BRL é compatível com a teoria? Diego está acima ou abaixo?
- [ ] Irrefalsifiabilidade: definir antes de começar

---

## Análise

### Balanço Patrimonial Completo (confirmado por Diego, 2026-03-26)

| Ativo | Valor (R$) | Brasil | Notas |
|-------|-----------|--------|-------|
| Equity UCITS (SWRD/AVGS/AVEM/JPGL) | 3.161.381 | 0% | Hedge soberano internacional |
| RF Brasil (IPCA+, Renda+, Reserva) | 213.162 | 100% | Reserva R$88k + IPCA+ legado R$13k + Renda+ R$112k |
| HODL11 (BTC via B3) | 105.000 | 0% | Ativo subjacente = BTC global |
| Capital humano (PV líquido) | 3.650.248 | 100% | R$517k líquido/ano × fator 8.3064 × haircut 15%. Validado Quant. |
| Imóvel equity (Pinheiros) | 450.000 | 100% | Valor mercado ~R$902k − hipoteca SAC R$452k (quita 2051) |
| Terreno | 150.000 | 100% | Confirmado por Diego |
| INSS futuro (PV) | 283.000 | 100% | Pró-labore no teto 10+ anos → R$97k/ano a partir dos 65. PV(65)=R$1.006M / 3.56 = R$283k |
| Participação empresarial | 800.000 | 100% | Shares PJ, estimativa conservadora. Confirmado por Diego. |
| **TOTAL** | **8.812.791** | — | — |

### Concentração Brasil

| Métrica | Valor |
|---------|-------|
| Total riqueza | R$8.813k |
| Exposição Brasil | R$5.546k |
| **Concentração Brasil** | **62.9%** |
| Hedge internacional (equity UCITS) | R$3.161k = **35.9%** da riqueza total |
| Portfolio financeiro total | R$3.479k |
| Brasil no portfolio financeiro | R$213k = **6.1%** do financeiro |

### Análise por Agente

**FX (lead):** Capital humano domina o balanço (41% da riqueza total). Portfolio financeiro já subpondera Brasil corretamente. Exposição soberana real está no capital humano e imóvel — intransferíveis pelo portfolio.

**Macro:** Equity UCITS funciona como hedge *condicional* ao câmbio. Em crises BR 2002-style (BRL -42%): hedge funciona. Em crises 2022-style (inflação + juros altos, BRL apreciando): hedge falha. Renda+ MtM é o pior ativo em regime de stress (duration longa + risco soberano). IPCA+ HTM imune ao MtM.

**Advocate:** Em crise extrema simulada (CDS 800bps, BRL -42%, renda PJ -25%), riqueza total em BRL *sobe* +7% nominal — equity UCITS em USD compensa via câmbio. Risco real = **mismatch de liquidez**, não alocação de ativos. Recomenda buffer $25k USD cash na IB.

**Quant:** Validou capital humano ✅, INSS ✅. Corrigiu Renda+ MtM: **-82%** (não -75% do Advocate). Divergência de R$7.5k — imaterial para conclusão.

**Fact-Checker:**
- Viceira (2001) ✅ e Campbell & Viceira (2002) ✅ — papers reais, tese correta
- **❌ ERRO GRAVE:** IOF 6% alegado sobre remessas ao exterior — **incorreto**. O IOF de 2010-11 era sobre *entrada de capital estrangeiro* no Brasil, não sobre remessas de PF brasileiro ao exterior. Risco de controle de capital existe historicamente (Plano Collor é o precedente correto), mas magnitude é diferente.
- Desvalorização BRL: ~42-43% (não 50% mencionado pelo Advocate) — imaterial.

**Cético — 3 gaps identificados:**
1. **Cash flow em crise:** buffer $25k na IB assume IB acessível. Se controle de capital bloquear acesso: reserva BRL R$88k / gastos R$18k/mês = ~5 meses. Com renda PJ -25% ainda cobre gastos. Nunca modelado formalmente.
2. **Hedge condicional:** equity UCITS como proteção funciona apenas quando BRL desvaloriza *junto* com crise fiscal. Crises sem desvalorização cambial (2022) deixam portfolio desprotegido.
3. **HTM assume zero venda forçada:** nunca foi modelado cenário de crise de liquidez que force venda de IPCA+ com desconto.

---

## Conclusão

**A alocação financeira está correta pela teoria.**

Viceira (2001) recomenda subponderar o país do capital humano. Diego tem 6.1% do portfolio financeiro em Brasil — bem abaixo de qualquer threshold razoável. Teoria satisfeita.

**A concentração Brasil de 62.9% é estrutural e não solucionável via portfolio financeiro.**

Capital humano (R$3.65M), participação empresarial (R$800k), imóvel (R$450k equity) e terreno (R$150k) somam R$5.05M — 91% da exposição Brasil. Esses ativos não podem ser "hedgeados" via rebalanceamento do portfolio financeiro. São ativos reais que só reduzem via FIRE (elimina capital humano) ou venda de ativos.

**O risco real é liquidez em crise, não alocação.**

Em cenário de crise BR com controle de capital: reserva BRL (~5 meses) + renda PJ reduzida cobrem gastos no curto prazo. O risco não é insolvência — é acesso temporário ao patrimônio internacional.

**Irrefalsifiabilidade respondida:** Com 100% do capital humano em BRL, o portfolio financeiro deveria ter <50% Brasil. Diego está em 6.1%. Posição teórica corretíssima.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Nenhuma mudança. Portfolio financeiro correto pela teoria (6.1% Brasil). |
| **Estratégia** | Avaliar buffer $25k USD cash na IB para liquidez em crise. Cash flow BRL em crise: modelar formalmente na próxima retro. |
| **Conhecimento** | Concentração Brasil é estrutural (62.9%) — capital humano + imóvel + empresa dominam. Portfolio financeiro não resolve isso. Risco real = liquidez, não alocação. IOF histórico sobre PF remessas: sem precedente claro (Collor é o real). |
| **Memória** | Balanço patrimonial atualizado: R$8.813k total, 62.9% Brasil. Salvo em project_patrimonio_total.md. |
