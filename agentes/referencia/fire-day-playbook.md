# FIRE Day Playbook — Operacional da Aposentadoria

> Criado em: 2026-04-02 | Issue: FR-fire-execution-plan
> FIRE Day alvo: 2040 (Diego 53 anos). Hard stop: 2040 independente de P(FIRE).
> Revisão obrigatória: anual a partir de 2037 (3 anos antes).

---

## 1. Gate de Entrada — Verificação Final (Jan/2040)

Condição para FIRE em 2040:

| Condição | Ação |
|----------|------|
| Patrimônio real >= R$10M **E** bond pool >= R$1,5M | **FIRE. Sem adiamento.** |
| Patrimônio real R$8-10M **E** bond pool >= R$1,5M | FIRE com guardrail -10% ativo desde o ano 1 (gastar R$225k) |
| Patrimônio real < R$8M **OU** bond pool < R$1,0M | Único cenário de adiamento: 1 ano, reavaliação em jan/2041 |

**Por que não adiar por queda de equity:**
Bond pool de ~R$2,1M cobre 8+ anos sem tocar equity. Drawdown de equity no FIRE Day é irrelevante para os primeiros anos — o bond tent existe exatamente para isso. Adiar 1 ano desperdiça Go-Go irreversivelmente.

**Gate de adiamento: matriz 2×2 (apenas para uso em jan/2040)**

| | Bond pool >= 7 anos | Bond pool < 4 anos |
|---|---|---|
| Drawdown equity < 50% | **NÃO adiar** | Adiar 1 ano + acelerar bond tent |
| Drawdown equity >= 50% | Advocate + MC atualizado | Adiar 2 anos + reconstruir bond tent |

**Exit protocol comportamental (anti-"mais um ano"):**
Se gatilho financeiro atingido e Diego não sair em 12 meses → Behavioral acionado automaticamente. O custo invisível de atrasar é Go-Go perdido — não reversível.

---

## 2. Bond Pool — Mecânica e Valores

### FIRE Day (2040): o que está disponível

| Instrumento | Bruto | IR (15% sobre ganho) | **Líquido estimado** |
|-------------|-------|---------------------|---------------------|
| TD 2040 (80% bloco IPCA+) | ~R$1,906M | ~R$223k | **~R$1,683M** |
| IPCA+ curto 3% (comprar aos 50-51) | ~R$500k | ~R$50k | **~R$450k** |
| **Total bond pool** | **~R$2,4M** | **~R$273k** | **~R$2,1M líquido** |

*TD 2040: crédito automático na conta Tesouro Direto (Nubank). IR retido na fonte. Nenhuma ação necessária.*
*Alíquota IR Tesouro: 15% flat para qualquer prazo acima de 720 dias (tabela regressiva, Lei 11.033/2004).*

### Cobertura do bond pool

| Gasto anual | Anos cobertos (pool R$2,1M) |
|-------------|---------------------------|
| R$250k (base) | ~8,4 anos |
| R$280k (Go-Go escalado) | ~7,5 anos |
| R$320k (Go-Go + overhead FIRE) | ~6,6 anos |

**Atenção:** pool cobre gastos em BRL nominal. Se inflação pessoal de Diego for IPCA+3% (saúde), cobertura real reduz para ~6-7 anos.

---

## 3. Sequência de Saques — Regra Mecânica

### Anos 0-7 (53-60): Bond Pool First

Sacar **exclusivamente do bond pool** para gastos anuais. Equity não é tocado. Esta é a regra mais importante do playbook — sem ela, o bond tent não tem efeito comportamental.

Conta operacional: manter R$125k em conta corrente/Selic (6 meses de gastos). Separar no FIRE Day do TD 2040. O restante do pool fica em Selic/CDB curto no Nubank/XP.

**Transição bond → equity:**
- Trigger: saldo do pool BRL < 2× gasto anual (~R$500-560k)
- Ano da transição: 50% pool + 50% equity
- Ano seguinte: 100% equity
- Estimativa: transição começa por volta do ano 7-8 (Diego ~60-61)

### Anos 8+ (60+): Equity com Rebalanceamento por Saques

**Não vender um ETF para comprar outro.** Os saques fazem o rebalanceamento:
- Calcular peso de SWRD/AVGS/AVEM vs target (50/30/20)
- Sacar do ETF **mais overweight** a cada ano
- Threshold: rebalancear apenas se desvio > 5pp do target; abaixo disso, sacar pro-rata

**Ordem de liquidação dos transitórios (US-listed primeiro):**

| Ordem | Ativo | Motivo | Timing |
|-------|-------|--------|--------|
| 1 | IWVL | Menor valor, UCITS, IR quase zero | Q1 2040 |
| 2 | DGS | Menor US-listed ($11k), menor ganho % | Q1 2040 |
| 3 | AVES | US-listed ($55k), +32% ganho | Q2 2040 |
| 4 | AVUV | US-listed ($61k), +36% ganho | Q2 2040 |
| 5 | USSC | UCITS, sem estate tax. Pode aguardar | Q3 2040 |
| 6 | EIMI | UCITS, +56% ganho | Q1 2041 |
| 7 | AVDV | US-listed ($95k), +66% ganho — maior IR, deixar por último | Q2 2041 |

**Reinvestimento:** no mesmo dia de cada venda, comprar UCITS equivalente (DGS/AVES/EIMI → AVEM; AVUV/USSC → AVGS; AVDV → AVGS ou SWRD conforme peso).
Sem wash sale no Brasil (Lei 14.754/2023 silente sobre prazo de recompra).

**IR das vendas:** DARF até 31/jan do ano seguinte (Lei 14.754/2023, apuração anual). Total estimado da migração completa: ~R$130-135k.

**Cripto (HODL11):** se subir acima de 5% do portfolio, vender excesso. Abaixo de 1,5%, deixar diluir — não repor.

### Ano 10 (2050, Diego 63): TD 2050 vence

TD 2050 (20% do bloco IPCA+ longo) vence em 2050. Capital: ~R$500-600k estimado.

**Ação:** usar como segundo buffer de RF (bridge pré-INSS). Não reinvestir em equity ainda. Cobre gastos dos anos 11-12 da desacumulação. Reduz pressão sobre equity exatamente no período pré-INSS (60-65) quando saúde está acelerando.

**Exceção:** se em 2050 o patrimônio total for >50% acima do target (>R$20M real 2026), reinvestir em equity faz sentido — P(FIRE) é robusto e risco de SoRR é secundário.

### Ano 12+ (2052, Diego 65): INSS ativa

Floor parcial de ~R$46-55k/ano real. Reduz necessidade de saque equity em ~R$50k/ano (20% do gasto base). Impacto em P(FIRE): +0,2pp (pequeno, mas estrutural para as próximas décadas).

### Renda+ 2065 pós-FIRE

Manter gatilho inalterado: vender tudo se taxa <= 6,0%. Não usar para saques parciais.
**Risco ignorado:** duration 43,6 — se Diego precisar vender antes do gatilho de taxa por necessidade de caixa, MtM pode ser -40%+. Renda+ 2065 não é instrumento de liquidez. Nunca sacar parcialmente.

---

## 4. Renovação do Bond Tent (Finding Crítico — Advocate)

**Problema:** tabela de alocação por idade mostra 94% equity aos 60-70+ como *consequência mecânica* de gastar o bond pool — não é design intencional. Sem buffer nos anos 60-80, um bear market severo nessa fase pode comprometer o FIRE.

**Cenário de falha:** equity cai 40% quando Diego tem 62 anos → patrimônio de R$11M → R$6,6M → SWR ~4,5% → P(sucesso) ~55-60%.

**A estrutura já resolve parcialmente:**

| Período | Diego | Cobertura |
|---------|-------|-----------|
| Anos 0-8 | 53-61 | Bond pool (TD 2040 + IPCA+ curto) |
| Anos 8-10 | 61-63 | Equity puro — 3 anos, horizonte ainda 25+ anos |
| Ano 10 | 63 | **TD 2050 vence** → segundo buffer (já na carteira como 20% do IPCA+ longo) |

3 anos de equity puro aos 60-63 é aceitável: horizonte remanescente ~25+ anos, guardrails ativos, INSS próximo (65 anos).

**Decisão 7 reformulada:** NÃO comprar IPCA+ 2045 com juros semestrais — reinvestimento de cupons + IR antecipado (~1-1,5% de eficiência perdida) não compensam para esse propósito. Em vez disso, verificar se TD 2050 já existente tem tamanho suficiente para cobrir o gap. Se TD 2050 >= 3% do portfolio em 2040, nenhuma ação adicional necessária.

**Gatilho de revisão:** em cada retro anual a partir de 2037, verificar tamanho do TD 2050 vs 3% do portfolio. Se abaixo: aumentar DCA de TD 2050 (sem juros, já disponível) antes de considerar instrumento novo.

**IPCA+ sem juros semestrais disponíveis no TD:** apenas 2029 e 2035. Acima de 2035, o TD oferece apenas NTN-B com juros semestrais — subótimo para acumulação HTM.

---

## 5. Liquidação dos Transitórios — Estratégia Completa

### Antes do FIRE (2026-2039)

| Ação | Timing | Por quê |
|------|--------|---------|
| **Contratar seguro de vida temp. ~$65k, 14 anos** | **AGORA** | ~R$1,5k/ano elimina R$340k de estate tax risk. Custo vs benefício: 22× |
| Monitorar custo médio BRL de cada transitório | Mensal (Bookkeeper) | TLH se algum entrar em prejuízo |
| Se US-listed em prejuízo (drawdown): TLH + migrar para UCITS | Evento | Duplo benefício: crédito fiscal + elimina estate tax |
| Escalonamento opcional (50-51): considerar vender 1/3 dos US-listed menores | 2037-2038 | Reduz concentração de FX risk no FIRE Day |

**Estate tax — NÃO liquidar antes do FIRE:** diferimento de 14 anos vale mais que o risco atuarial (2-3% probabilidade de morte antes de 53). Seguro de vida temporário é a solução correta.

### No FIRE (2040-2041)

Concentrar liquidação nos 2 primeiros anos. Não distribuir por 5 anos — 15% flat torna espalhamento temporal irrelevante para fins de IR.

**Regra de FX:** se BRL estiver historicamente depreciado (>R$7,00) no momento da venda, considerar atrasar 6-12 meses os transitórios de maior ganho (AVDV, EIMI) — ganho fantasma cambial infla a base tributável.

---

## 6. IR e Tributação — Resumo Operacional

| Evento | Tributação | Prazo DARF |
|--------|-----------|------------|
| TD 2040 vence | 15% retido na fonte automaticamente | N/A (automático) |
| TD 2050 vence | 15% retido na fonte automaticamente | N/A (automático) |
| Venda de ETFs exterior (transitórios) | 15% flat sobre ganho nominal BRL (Lei 14.754/2023) | 31/jan do ano seguinte |
| Prejuízo realizado (TLH) | Compensa ganhos futuros de ETFs exterior. Não compensa HODL11/Tesouro | Carregar na DIRPF |
| Renda+ 2065 (se vender) | 15% retido na fonte | N/A (automático) |

**IR total estimado dos transitórios (migração completa 2040-2041):** ~R$130-135k.

---

## 7. Trial Run de Gastos (Recomendação Advocate)

Antes do FIRE (aos 50-51), fazer "trial run" de 2-3 meses simulando padrão de gastos do FIRE:
- Saúde: contratar plano individual (não empresarial) por 2 meses — validar custo real
- Lazer: orçamento de Go-Go expandido por 2 meses
- Sem deduções de custo PJ (sem almoços, sem transporte, sem seguros corporativos)

**Objetivo:** confirmar ou ajustar o baseline R$250k antes do FIRE. ERN documenta que gastos dos primeiros 2 anos de aposentadoria antecipada são tipicamente 15-25% maiores que a base pré-aposentadoria.

---

## 8. Timeline Completo

| Ano | Idade | Evento | Ação |
|-----|-------|--------|------|
| 2026 | 39 | Agora | Contratar seguro de vida ~$65k, 14 anos |
| 2037-2038 | 50-51 | Pré-FIRE | Comprar IPCA+ curto 3% (SoRR buffer, vence ~2052-53). Executar Decisão 7 (IPCA+ 2045-2050, 3-5%) |
| 2037-2038 | 50-51 | Pré-FIRE | Trial run de gastos (2-3 meses). Calibrar R$250k vs realidade |
| 2039 | 52 | Ano anterior | Revisão completa do playbook. Gate checklist. Portfólio: escalonar venda de 1/3 dos US-listed menores? |
| Jan/2040 | 53 | FIRE Day gate | Verificar tabela do Gate (seção 1). Go ou No-Go |
| 2040 | 53 | FIRE Day | TD 2040 crédito automático (~R$1,683M líquido). Separar R$125k caixa. Liquidar IWVL + DGS + AVES + AVUV |
| 2041 | 54 | Ano 1 | Liquidar EIMI + AVDV. Pagar DARF 2040. Zero US-listed |
| 2040-2047 | 53-60 | Bond pool | Saques anuais do pool. Equity cresce por inação |
| ~2047 | ~60 | Transição | Pool < 2× gastos → iniciar saques de equity |
| 2050 | 63 | TD 2050 vence | Segundo buffer (~R$500-600k). Bridge pré-INSS |
| 2052 | 65 | INSS | Floor parcial ~R$46-55k/ano |

---

## 9. Incertezas Reconhecidas

| Incerteza | Impacto | Ação |
|-----------|---------|------|
| Estrutura holding/tributária ainda indefinida | IR sobre saques pode mudar | Rever playbook quando TX-sucessao-testamento aberta |
| Lei 14.754/2023 pode ser reformada em 14 anos | Tributação ETFs exterior | Monitoramento anual (Tax) |
| Bond pool path-dependent (DCA pode não atingir 15% se taxa < 6%) | Pool pode ser 50% menor | Modelar cenário bond pool R$1,1M — cobriria só ~4 anos |
| Custo de vida pós-FIRE subestimado | Base R$250k pode ser R$280-320k nos primeiros 3 anos | Trial run + guardrails cobrem |
| IPCA pessoal de Diego > IPCA oficial | Pool real menor | Inflator saúde (VCMH) já modelado separadamente |
| Risco soberano: Tesouro pode não pagar valor face em crise | Bond pool parcialmente comprometido | Componente offshore (USD Treasuries IBKR) para diversificar |

---

## 10. Ações Pendentes Priorizadas

| Prioridade | Ação | Quando | Dono |
|-----------|------|--------|------|
| **URGENTE** | Contratar seguro de vida ~$65k, 14 anos | Agora (2026) | Diego |
| Alta | Decisão 7: IPCA+ 2045-2050 (3-5%) aos 51-52 | 2037-2038 | RF + FIRE |
| Alta | Trial run de gastos | 2037-2038 (2-3 meses) | Diego |
| Média | Modelar cenário bond pool a 50% do target | Próxima retro | Quant + FIRE |
| Média | Componente offshore no bond pool (USD Treasuries) | Abrir issue | FX + RF |
| Média | Teto de equity pós-60: 80-85% em vez de 94% | Decisão formal | Head |
| Baixa | Revisar playbook pós-TX-sucessao-testamento | Quando aberta | Head |
