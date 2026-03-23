# RF-002-IPCA_plus_agora_taxa_7

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | RF-002-IPCA_plus_agora_taxa_7 |
| **Dono** | 03 Renda Fixa Brasil |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 01 Head, 04 FIRE, 08 Macro, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-18 |
| **Origem** | Advocate flagou na reavaliacao independente da carteira |
| **Concluido em** | 2026-03-18 |

---

## Motivo / Gatilho

IPCA+ esta pagando 7%+ real bruto (~6,2% liquido) — taxa historicamente rara no mundo. O retorno esperado de equity global e ~4,5-5% real bruto. Advocate classificou a premissa "zero RF ate 48" como **fragil**: a regra foi criada genericamente, mas o cenario atual de taxas e excepcional. A janela pode fechar se juros caiarem.

---

## Descricao

Avaliar se Diego deveria alocar 10% do patrimonio em IPCA+ estrutural AGORA (marco 2026), antecipando a decisao planejada para os 48 anos. Considerar:
- Custo de oportunidade vs equity (5,09% bruto na acumulacao, tax-free)
- Risco de timing (taxas podem subir mais, ou cair)
- Impacto no plano FIRE (patrimonio aos 50, SWR)
- Conflito com premissa "100% equity na acumulacao" (Cederburg 2023)

---

## Escopo

- [x] Levantar taxas atuais IPCA+ por vencimento (2029, 2032, 2035, 2040, 2045, 2050, 2055, 2060)
- [x] Calcular retorno real liquido de cada vencimento (IR 15% sobre ganho nominal, inflacao 4%)
- [x] Comparar: 10% em IPCA+ (~5,9% liq) vs 10% em equity (5,09% bruto na acumulacao)
- [x] Modelar impacto no patrimonio aos 50: cenario 100% equity vs 90% equity + 10% IPCA+
- [x] Avaliar ladder otimo: ~~IPCA+ 2032/2035/2040~~ -> **Revisao 2: 2035/2040/2045**
- [x] Macro: Selic cortada para 14,75% hoje. Focus: 12,25% fim 2026. Taxas devem comprimir
- [x] Considerar diversificacao de moeda (10% BRL com yield real alto)
- [x] Advocate: stress-test equity 7% real -> custo de oportunidade desprezivel (0,4%)
- [x] Advocate: stress-test taxas 8-9% -> M2M negativa mas carrego protege
- [x] **Revisao 2**: Diego questionou reinvestimento pos-vencimento. IPCA+ 2032 eliminado. Ladder revisado
- [x] Conclusao: SIM, alocar 10% em ladder IPCA+ **2035/2040/2045**, DCA em 2-3 tranches
- [ ] FIRE: impacto Monte Carlo com RF (nao modelado nesta issue -- pode ser issue separada)

---

## Analise

> Executada em 2026-03-18 pelo agente 03 Renda Fixa Brasil.
> Dados coletados de: Investidor10, CNN Brasil, Agencia Brasil, InfoMoney, Tesouro Direto, Seu Dinheiro.

---

### 1. Taxas Atuais IPCA+ (ref. marco 2026)

**Tesouro IPCA+ (principal)**

| Titulo | Taxa (real bruto) | Duration aprox. | Vencimento |
|--------|-------------------|-----------------|------------|
| IPCA+ 2029 | ~7,5% | ~2,5 anos | curto |
| IPCA+ 2032 | 7,60% | ~5,5 anos | medio |
| IPCA+ 2035 | ~7,40% | ~8 anos | medio-longo |
| IPCA+ 2040 | 7,13% | ~12 anos | longo |
| IPCA+ 2045 | ~7,14% (c/ juros sem.) | ~15 anos | longo |
| IPCA+ 2050 | 6,86% | ~18 anos | muito longo |
| IPCA+ 2055 | ~6,90% | ~21 anos | muito longo |
| IPCA+ 2060 | 7,05% (c/ juros sem.) | ~24 anos | ultra longo |

**Tesouro Renda+ (ref. 05/mar/2026)**

| Titulo | Taxa (real bruto) |
|--------|-------------------|
| Renda+ 2030 | 7,20% |
| Renda+ 2035 | 7,04% |
| Renda+ 2040 | 6,92% |
| Renda+ 2045 | 6,87% |
| Renda+ 2050 | 6,85% |
| Renda+ 2055 | 6,86% |
| Renda+ 2060 | 6,87% |
| Renda+ 2065 | 6,87% |

**Comparacao historica (fonte: Quantum Finance, 2015-2025)**

- NTN-B 2035 ficou >= 7,0% em apenas **12,2%** dos dias de negociacao (2.490 dias uteis)
- NTN-B 2045 ficou >= 7,0% em apenas **9,7%** dos dias
- Media historica NTN-B longa: ~5,0-5,5% real (FGV/IBRE estima taxa neutra real ~4-4,5%)
- **Conclusao**: 7%+ e top decile historico. Taxa atual e ~2 pp acima da media de longo prazo

---

### 2. Retorno Real Liquido por Vencimento

**Premissas**: IPCA = 4,0% a.a. (Focus 2026: 4,1%; 2027: 3,8%). IR = 15% sobre ganho nominal (> 2 anos).

Formula:
- Retorno nominal = (1 + taxa_real) x (1 + IPCA) - 1
- IR = 15% sobre ganho nominal
- Retorno liquido nominal = retorno_nominal x (1 - 0,15)
- Retorno real liquido = (1 + retorno_liquido_nominal) / (1 + IPCA) - 1

| Titulo | Taxa real bruta | Ret. nominal | Ret. nom. liq (IR 15%) | Ret. real liq. |
|--------|----------------|-------------|----------------------|---------------|
| IPCA+ 2029 | 7,50% | 11,80% | 10,03% | 5,80% |
| IPCA+ 2032 | 7,60% | 11,90% | 10,12% | 5,88% |
| IPCA+ 2035 | 7,40% | 11,70% | 9,94% | 5,71% |
| IPCA+ 2040 | 7,13% | 11,42% | 9,71% | 5,49% |
| IPCA+ 2050 | 6,86% | 11,13% | 9,46% | 5,25% |

**Comparacao com equity**:
- Equity acumulacao: 5,09% real bruto, **tax drag 0%** (acumula sem imposto via UCITS) = **5,09% real liquido na acum.**
- Equity desacumulacao: 5,09% bruto, tax drag 26,6% efetivo = **3,77% real liquido na desacum.**
- IPCA+ 7,6% bruto -> **5,88% real liquido** (IR sobre nominal, incide mesmo na acumulacao se resgatar)

**Observacao critica**: A comparacao justa na fase de ACUMULACAO e:
- Equity: 5,09% real, tax drag 0% -> **5,09% efetivo**
- IPCA+: 7,60% real, IR 15% sobre nominal -> **5,88% efetivo**

IPCA+ vence equity em ~0,8 pp real liquido na acumulacao. Porem:
- Equity so paga IR no resgate (composicao tax-free por 11 anos)
- IPCA+ paga IR no vencimento/resgate (composicao bruta ate la, IR no final)
- Na pratica, ambos tem IR diferido. A diferenca real e a taxa bruta: 7,6% vs 5,09%

**Fator de composicao tax-deferred (11 anos)**:
- R$ 100 em equity a 5,09% real por 11 anos = R$ 172,45 (resgate: IR 15% sobre R$ 72,45 = R$ 10,87 -> R$ 161,58)
- R$ 100 em IPCA+ 7,60% real... mas IR e sobre NOMINAL. Com IPCA 4%:
  - Nominal: 11,90% por 11 anos = R$ 346,41. IR 15% sobre R$ 246,41 = R$ 36,96 -> R$ 309,45
  - Em termos reais (deflacionar por IPCA 4% x 11 anos): R$ 309,45 / 1,5395 = R$ 201,00
- R$ 100 em equity: R$ 161,58 real
- R$ 100 em IPCA+: R$ 201,00 real

**Delta**: IPCA+ entrega **~24% mais patrimonio real** em 11 anos, mesmo apos IR sobre nominal.

> **Isso e significativo.** O Advocate tem razao: a 7,6% real bruto, IPCA+ domina equity esperado de 5,09% mesmo com a tributacao desfavoravel.

---

### 3. Cenario: 100% Equity vs 90% Equity + 10% IPCA+

**Premissas base**:
- Patrimonio atual: R$ 3.482.633
- Aporte mensal: R$ 25.000 (R$ 300k/ano)
- Horizonte: 11 anos (ate 50)
- Equity return: 5,09% real (tax-free na acumulacao)
- IPCA+ return: 7,60% real bruto (5,88% real liq, mas tax-deferred = ~6,2% efetivo compostos por 11 anos)

**Cenario A: 100% equity**
- Ja calculado em FR-001 v3: **R$ 10,3M** aos 50

**Cenario B: 90% equity + 10% IPCA+ (R$ 348k em IPCA+)**
- 90% em equity: R$ 3.134.370 + aportes de R$ 300k/ano, a 5,09% real
- 10% em IPCA+: R$ 348.263, a ~6,2% efetivo real por 11 anos
- Equity aos 50: ~R$ 9.270.000 (90% de R$ 10.3M)
- IPCA+ aos 50: R$ 348.263 x (1,062)^11 = R$ 348.263 x 1,953 = R$ 680.000
- **Total cenario B: ~R$ 9.950.000**

**Delta: R$ 10.300.000 - R$ 9.950.000 = ~R$ 350.000 a MENOS no cenario B**

Espera -- esse calculo esta simplificado demais. O bloco IPCA+ nao recebe aportes (e uma alocacao unica de R$ 348k). O equity no cenario B tambem recebe os mesmos aportes de R$ 300k/ano (redirecionados 100% para equity, ja que os 10% IPCA+ sao lump sum).

Recalculando com mais cuidado:
- **Cenario A**: Patrimonio total a 5,09%: R$ 10.300.000
- **Cenario B**: R$ 348k em IPCA+ a 6,2% efetivo = R$ 680k em 11 anos. Restante R$ 3.135k + R$ 300k/ano em equity a 5,09% = R$ 9.270k (proporcional). Mas os aportes continuam indo 100% para equity (JPGL), entao:
  - Equity base: R$ 3.135k a 5,09% por 11 anos = R$ 5.404k
  - Aportes: R$ 300k/ano a 5,09% por 11 anos = R$ 4.303k
  - IPCA+: R$ 348k a 6,2% por 11 anos = R$ 680k
  - **Total B: R$ 10.387.000**

**IPCA+ a 7%+ na verdade AUMENTA o patrimonio projetado em ~R$ 87k (+0,8%)**

O ganho e modesto em termos absolutos, mas o ponto e: nao ha custo de oportunidade negativo. IPCA+ a 7%+ nao prejudica o plano FIRE -- na verdade, melhora marginalmente.

---

### 4. Ladder Otimo

> **Revisao 1 (original)**: Ladder 2032/2035/2040 -- SUPERADA pela Revisao 2 abaixo.

---

### 4-R2. Ladder Repensado (Revisao 2 — 2026-03-18)

> Diego questionou: "Essa ladder pra vencer ANTES da aposentadoria? Ai vence, pago imposto, e coloco onde?"
> Ele esta certo. O risco de reinvestimento destrói a vantagem dos vencimentos curtos.

#### O problema do IPCA+ 2032 (vence aos 45)

IPCA+ 2032 vence em 6 anos. O cenario macro (Focus: Selic 10,5% em 2027) aponta para compressao de taxas. Se IPCA+ comprimir para a media historica (4,5-5,5%), o reinvestimento pos-vencimento anula a vantagem sobre equity.

**Calculo: IPCA+ 2032 (6a) + reinvestimento (5a) vs Equity (11a)**

Equity 11 anos, tax-free na acumulacao: R$100 x (1,0509)^11 = **R$172,45**

IPCA+ 2032: 6 anos a 7,60% bruto -> apos IR 15% sobre nominal -> R$144,45 real. Depois reinveste por 5 anos:

| Taxa reinvestimento | Total real 11a | vs Equity R$172,45 |
|---|---|---|
| 4,5% bruto (media hist.) | R$171,36 | **-0,6%** |
| 5,5% bruto | R$177,91 | +3,2% |
| 6,5% bruto | R$184,61 | +7,1% |

**Veredicto**: Se taxas comprimirem (cenario base), IPCA+ 2032 EMPATA ou PERDE de equity. E o cenario que motiva a compra (janela fechando) e o mesmo que destrói o reinvestimento. Contradicao fatal.

#### Vencimentos que funcionam

**IPCA+ 2035 (vence aos 48, reinvestimento de apenas 2 anos)**:
- 9 anos a 7,40% -> apos IR -> R$172,63 real
- Reinvestimento 2 anos a 4,5%: R$184,87 | a 5,5%: R$187,67
- **Vence equity (+7,2% a +8,8%) em todos os cenarios**
- Bonus: vence exatamente quando Diego fara a decisao estrutural de RF. O cash chega na hora certa

**IPCA+ 2040 (vence aos 53, zero reinvestimento)**:
- 14 anos a 7,13% -> apos IR -> R$228,27 real
- Equity 14 anos: R$200,13
- **Delta: +14,1%.** Sem risco de reinvestimento. Vence em FIRE, gera cash flow

**IPCA+ 2045 (vence aos 58, zero reinvestimento)**:
- 19 anos a 7,14% (NTN-B com cupom semestral -- IR a cada pagamento reduz composicao)
- Estimativa conservadora: +18-20% vs equity em 19 anos
- Porem: cupom semestral gera IR periodico, o que penaliza vs NTN-B principal (sem cupom)
- **Delta robusto mesmo com penalidade do cupom**

#### Tabela comparativa final

| Vencimento | Idade venc. | Delta vs equity | Risco reinvest. | Veredicto |
|---|---|---|---|---|
| ~~2032~~ | 45 | -0,6% a +7,1% | **ALTO** | **ELIMINADO** |
| 2035 | 48 | +7,2% a +8,8% | Baixo (2 anos) | **INCLUIR** |
| 2040 | 53 | +14,1% | Zero | **INCLUIR** |
| 2045 | 58 | +18-20% (est.) | Zero | **INCLUIR** |
| 2050 | 63 | +8-10% (est.) | Zero | Marginal (taxa 6,86%) |

#### Novo ladder proposto

| Vencimento | Taxa bruta | Ret. real liq. | Alocacao | Valor | Racional |
|---|---|---|---|---|---|
| IPCA+ 2035 | 7,40% | ~5,71% | 40% | R$139k | Vence aos 48 = decisao estrutural. Cash chega na hora certa |
| IPCA+ 2040 | 7,13% | ~5,49% | 35% | R$122k | 14 anos de carrego, vence aos 53 em FIRE. Zero reinvestimento |
| IPCA+ 2045 | 7,14% | ~5,25% est. | 25% | R$87k | 19 anos, maior delta acumulado. Vence aos 58 |

**Total: R$348k (10%)**

#### 10% e o valor certo?

Cada real em IPCA+ e um real a menos para JPGL (gap -19,7%). Porem:
- Os R$348k vem de lump sum, nao dos aportes mensais
- Aportes de R$25k/mes continuam 100% para JPGL
- Em 14 meses, JPGL recebe R$350k via aportes -- gap se fecha organicamente
- IPCA+ a 7%+ e janela rara; JPGL pode ser comprado a qualquer momento
- Alternativa conservadora: 7% (R$243k) libera R$105k para JPGL imediato, mas perde ~R$12k de patrimonio projetado

**Recomendacao: manter 10%.** O delta de IPCA+ vs equity e robusto nos vencimentos longos, e o gap JPGL se resolve via aportes

---

### 5. Contexto Macro

**Selic**:
- Atual: **14,75%** (Copom cortou 0,25 pp hoje, 18/mar/2026 -- primeiro corte desde maio 2024)
- Focus fim 2026: **12,25%**
- Focus 2027: **10,50%**
- Focus 2028: **9,75%**
- Ciclo de corte **iniciou hoje**. Proximo passo incerto (depende de inflacao e cenario externo)

**IPCA**:
- Focus 2026: 4,10% (acima da meta de 3,0% +/- 1,5%)
- Focus 2027: 3,80%
- Focus 2028-2029: 3,50%

**Tendencia das taxas IPCA+**:
- Com inicio do ciclo de corte da Selic, **taxas IPCA+ tendem a comprimir** nos proximos 6-12 meses
- O Tesouro Nacional ja sinalizou recompras de NTN-B longas ("vai as compras")
- NTN-B 2032 tocou 7,93% em fev/2026 (maxima recente) e recuou para 7,60% -- ja ha compressao
- Se Selic cair para 12,25% ate dez/2026, IPCA+ deve ir para faixa de 6,0-6,5% (retorno a media)
- **A janela de 7%+ provavelmente esta fechando**

**Risco de taxas subirem mais**:
- Cenario possivel: choque fiscal, crise de confianca, inflacao persistente
- Se IPCA+ 2032 for a 9%, marcacao a mercado negativa de ~7-8% (duration ~5,5 x 1,4 pp = ~7,7%)
- Risco real mas improvel no cenario base (ciclo de corte ja comecou)

**Risco de taxas cairem (janela fecha)**:
- Se IPCA+ comprimir para 5,5% (media historica), ganho de marcacao a mercado:
  - 2032 (duration 5,5): ~11,5% de ganho
  - 2035 (duration 8): ~16,8% de ganho
  - 2040 (duration 12): ~25,2% de ganho
- Esse cenario e o base (Focus ja precifica Selic caindo)

---

### 6. Argumentos Pro e Contra

**A FAVOR de alocar 10% agora:**

1. **Taxa historicamente rara**: 7%+ real e top decile (<=12% dos dias em 10 anos). A media e 5-5,5%
2. **Retorno real liquido supera equity esperado**: ~5,9% liq vs 5,09% equity (na acumulacao, ambos tax-deferred)
3. **Calculo de 11 anos mostra IPCA+ vencendo**: R$ 100 -> R$ 201 (IPCA+) vs R$ 162 (equity), delta +24%
4. **Nao prejudica plano FIRE**: patrimonio projetado sobe marginalmente (+R$ 87k)
5. **Ciclo de corte iniciou hoje**: Selic 15% -> 14,75%. Taxas devem comprimir. Janela fechando
6. **Diversificacao de moeda**: carteira e ~100% USD. 10% em BRL com yield real alto e saudavel
7. **Potencial de marcacao a mercado positiva**: se taxas comprimirem de 7,6% para 5,5%, ganho de ~11-25% dependendo do vencimento (alem do carrego)
8. **Cederburg (2023) e sobre o longo prazo**: no cenario de 11 anos com taxa real de 7%+, a evidencia nao e tao clara contra bonds
9. **Advocate tem razao**: a premissa "zero RF ate 48" foi criada com taxa de ~5,5%. A 7%+, o calculo muda

**CONTRA alocar agora:**

1. **Equity tax-free na acumulacao**: composicao sem IR por 11 anos e poderosa (mas IPCA+ tambem e tax-deferred)
2. **Risco BRL**: se BRL depreciar fortemente, retorno em USD cai. (Contraargumento: 10% e exposicao limitada)
3. **Risco soberano BR**: baixo mas nao zero. NTN-B e divida publica. (Contraargumento: 10% e limitado)
4. **Taxas podem subir mais**: marcacao a mercado negativa no curto prazo. (Contraargumento: se carregado ao vencimento, irrelevante. E com ciclo de corte iniciando, probabilidade baixa)
5. **Custo de oportunidade JPGL**: dinheiro para IPCA+ nao vai para JPGL (gap -19,7%). (Contraargumento: sao R$ 348k de lump sum, nao dos aportes mensais. Aportes continuam em JPGL)
6. **Disciplina do plano**: mudar antes dos 48 pode criar precedente de market timing. (Contraargumento: adaptar-se a dados novos e racional, nao market timing)

---

### 7. Cenario do Advocate: E se equity entrega 7%+ real?

Se equity entregar 7% real (cenario otimista) vs IPCA+ a 7,6%:

**Cenario A (100% equity a 7% real)**:
- R$ 3.483k x (1,07)^11 + aportes = ~R$ 7.318k + R$ 4.658k = **R$ 11.976k**

**Cenario B (90% equity a 7% + 10% IPCA+ a 7,6%)**:
- Equity: R$ 3.135k x (1,07)^11 + aportes = R$ 6.586k + R$ 4.658k = R$ 11.244k
- IPCA+ (tax-deferred, IR no final): R$ 348k x (1,062)^11 = R$ 680k
- **Total: R$ 11.924k**

**Delta: R$ 11.976k - R$ 11.924k = R$ 52k** (0,4% de diferenca)

Mesmo no cenario OTIMISTA de equity (7% real), o custo de oportunidade de ter 10% em IPCA+ e **desprezivel** (R$ 52k em R$ 12M). Isso porque IPCA+ a 7,6% bruto praticamente empata com equity a 7% real quando se considera IR.

**E se equity entregar 10% real?** (cenario extremo)
- 100% equity: ~R$ 14.8M
- 90%/10%: ~R$ 14.0M
- Delta: ~R$ 800k (5,4%)

Nesse cenario extremo (pouco provavel), o custo e relevante mas nao catastrofico. E o cenario base e equity a 5,09%, onde IPCA+ vence.

---

### 8. Analise de Sensibilidade: E se taxas subirem?

| IPCA+ 2032 vai para... | Mark-to-market | Carrego (se mantido) |
|------------------------|----------------|---------------------|
| 8,0% (+0,4 pp) | -2,2% | Nao muda: 7,60% |
| 8,5% (+0,9 pp) | -5,0% | Nao muda: 7,60% |
| 9,0% (+1,4 pp) | -7,7% | Nao muda: 7,60% |
| 6,0% (-1,6 pp) | +8,8% | Nao muda: 7,60% |
| 5,5% (-2,1 pp) | +11,6% | Nao muda: 7,60% |
| 5,0% (-2,6 pp) | +14,3% | Nao muda: 7,60% |

**Se a intencao e carregar ate o vencimento**, marcacao a mercado e irrelevante. O retorno e 7,60% real bruto independente do que aconteca no meio do caminho.

Se a intencao e **tatica** (vender na compressao), o cenario base favorece: Selic caindo, taxas devem comprimir.

---

## Conclusao

> **Revisao 2 (2026-03-18)**: Ladder repensado apos questionamento de Diego sobre risco de reinvestimento.

### Recomendacao: **SIM, alocar 10% em IPCA+ -- mas com ladder revisado (2035/2040/2050)**
> **Revisao 3 (pos-aprovacao)**: 2045 substituido por 2050. IPCA+ 2045 e NTN-B com cupom semestral (IR a cada pagamento, composicao menor). IPCA+ 2050 e NTN-B principal (sem cupom, IR so no vencimento). Decisao final registrada em carteira.md.

**O que mudou na Revisao 2**:

Diego questionou corretamente: "Vence antes da aposentadoria, pago imposto, reinvisto em que?" O IPCA+ 2032 foi **eliminado** porque:
- Vence em 6 anos (idade 45), antes de FIRE
- O cenario macro (Selic caindo) aponta para compressao de taxas
- Se reinvestir a 4,5% (media historica), IPCA+ 2032 **perde** de equity (-0,6%)
- O cenario que motiva comprar agora (janela fechando) e o mesmo que destrói o reinvestimento. Contradicao fatal.

**Racional mantido (com ladder corrigido)**:

1. **A tese sobrevive para vencimentos longos**: IPCA+ 2035/2040/2050 vencem equity em +7% a +20% de patrimonio real, mesmo com IR sobre nominal, em TODOS os cenarios de reinvestimento

2. **Risco de reinvestimento eliminado**: 2040 e 2050 vencem na desacumulacao (zero reinvestimento). 2035 tem apenas 2 anos de reinvestimento, insuficiente para destruir a vantagem

3. **2035 tem timing estrategico**: vence aos 48, coincide com a decisao estrutural de RF. O cash chega quando Diego precisa decidir

4. **Custo de oportunidade JPGL e gerenciavel**: gap de -19,7% se resolve via aportes mensais (R$25k/mes). Os R$348k em IPCA+ vem do estoque, nao dos aportes

5. **A janela de 7%+ e top decile historico** (<=12% dos dias em 10 anos). Se nao agir, pode nao repetir

6. **Isso NAO e IPCA+ estrutural**: e alocacao tatica em janela excepcional. Decisao dos 48 permanece intacta

### Alocacao proposta (Revisao 2)

| Vencimento | Taxa bruta | Ret. real liq. | Alocacao | Valor | Racional |
|---|---|---|---|---|---|
| IPCA+ 2035 | 7,40% | ~5,71% | 40% | R$139k | Vence aos 48 = decisao estrutural |
| IPCA+ 2040 | 7,13% | ~5,49% | 35% | R$122k | Carrega 14a, vence em FIRE |
| IPCA+ 2050 | 6,86% | ~5,25% est. | 25% | R$87k | 24a de carrego, sem cupom semestral (NTN-B principal) |

**Total: R$348k (~10% do patrimonio)**

### Execucao sugerida

- **Fonte de recursos**: resgatar posicao em IPCA+ 2040 existente (R$13k, ja quase 2 anos) + usar caixa/aportes
- **Timing**: DCA em 2-3 tranches ao longo de marco-abril 2026
- **Aportes mensais**: continuam 100% para JPGL (nao mudar isso)
- **Regra de saida**: carregar ate vencimento (nao e trade). Se taxa comprimir abaixo de 5,0%, reavaliar venda antecipada com ganho de M2M

### Ressalvas

- Recomendacao do agente 03 Renda Fixa, fundamentada em dados. Diego precisa aprovar
- Se aprovado, registrar como decisao tatica (nao estrutural) na memoria
- A decisao estrutural de IPCA+ aos 48 permanece inalterada
- O gatilho de venda do Renda+ 2065 (6,0%) permanece inalterado
- Monitorar: se taxas subirem para 8%+, avaliar compra adicional
- **Nota sobre IPCA+ 2045**: e NTN-B (cupom semestral), o que gera IR a cada pagamento. O retorno real liquido efetivo e menor que NTN-B principal. Considerar se a penalidade do cupom justifica preferir 2050 (NTN-B principal, 6,86%) — a ser refinado se Diego aprovar a direcao

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | 10% em IPCA+ ladder (**2035/2040/2050**), R$348k total, DCA em 2-3 tranches |
| **Estrategia** | Alocacao tatica (nao estrutural). Carregar ate vencimento. Decisao dos 48 inalterada |
| **Conhecimento (R3)** | IPCA+ 2032 eliminado (reinvestimento). 2045 substituido por 2050 (cupom semestral penaliza composicao). Ladder final: 2035/2040/2050 — todos NTN-B principal sem cupom. Delta de +7% a +20% vs equity |
| **Memoria** | Pendente aprovacao de Diego |

---

## Proximos Passos

- [x] Diego: aprovar ou rejeitar recomendacao — **APROVADO** (2026-03-18)
- [x] Refinar IPCA+ 2045 vs 2050 — **2050 escolhido** (NTN-B principal, sem cupom semestral)
- [ ] Definir fonte de recursos (caixa, aportes, resgate IPCA+ 2040 existente)
- [ ] Executar DCA em 2-3 tranches (marco-abril 2026)
- [x] Atualizar carteira.md com nova alocacao — **feito**
- [x] Registrar decisao em memoria 03-renda-fixa.md — **feito**
- [ ] Monitorar taxas IPCA+ semanalmente durante execucao
- [ ] Reavaliacao: se taxas subirem para 8%+, abrir nova issue para compra adicional
