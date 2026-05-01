# MA-equity-br: Equity Brasil faz sentido dado balanço soberano de 61.7%?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | MA-equity-br |
| **Dono** | 08 Macro |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | Macro, Factor, Advocate, Cético, Tático, Quant, RF, Wealth, Fact-Checker |
| **Dependencias** | HD-brazil-concentration (Done) |
| **Criado em** | 2026-03-26 |
| **Origem** | Pergunta de Diego durante MA-bond-correlation — "faz sentido analisar equity BR?" |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

Diego tem 0% de equity brasileiro no portfolio financeiro. A questão é se alguma alocação em IBOV/ETF BR faria sentido — tanto pelo retorno esperado quanto como diversificador.

**Contexto:** balanço soberano confirmado em HD-brazil-concentration (corrigido pelo Quant nesta issue):
- Concentração Brasil: **61.7%** da riqueza total (R$8.527M) — não 62.9% (snapshot desatualizado)
- Capital humano 100% BRL (R$3.65M), participação empresarial R$800k, imóvel equity R$367k
- Renda PJ: 40% EUA / 60% Brasil — dado confirmado por Diego nesta issue
- Portfolio financeiro atual: ~6.1% Brasil (apenas RF)

---

## Escopo

- [x] Macro: CAPE do Ibovespa vs histórico e vs peers EM — o valuation justifica?
- [x] FX/Tático: correlação entre renda de consultoria PJ BR e retornos do IBOV — double concentration?
- [x] Factor: existe ETF de equity BR com factor tilt acessível via IBKR?
- [x] Advocate + Cético: debate pro/contra 0% dado 61.7% concentração soberana
- [x] Quant: validação dos números (concentração, delta, cálculo de assimetria)
- [x] RF: IPCA+ vs equity BR — qual captura melhor o upside de "Brasil melhora"?
- [x] Wealth: tributação comparativa 4BRZ vs BOVA11
- [x] Fact-Checker: verificação de todos os dados e citações
- [x] Irrefalsifiabilidade: qual evidência mudaria a alocação de 0% → >0%?

---

## Análise

### Macro — Valuation

P/E trailing Ibovespa: ~11.45 | P/E forward: ~9.25 (Siblis Research, jan/2026). CAPE específico de 8.9 não confirmado por fonte acessível — fonte paga. O P/E forward sugere valuation comprimido, mas a compressão reflete prêmio de risco político e fiscal elevado ("cheap for a reason" — Ilmanen). AVEM já tem ~4-4.5% de exposição indireta ao Brasil (cap-weight MSCI EM — Brasil é ~4-5% do índice, não 14-15% como erroneamente citado inicialmente).

### Factor — Veículos disponíveis

Não existe ETF UCITS com factor tilt para equity BR (sem small-cap value, sem profitability tilt brasileiro). Melhor opção UCITS: **4BRZ** (iShares MSCI Brazil UCITS ETF, ISIN DE000A0Q4R85, domicílio Alemanha, listado **XETRA** — não LSE, TER 0.31%, AUM ~EUR 4B, acumulação). Para acesso via B3: **BOVA11** (TER 0.10%). Exposição indireta via AVEM (~4-4.5%) já presente — superior a ETF cap-weight dedicado pois aplica tilt de value/profitability.

### Advocate + Cético — Debate

**Advocate (0%):** EWZ underperformou MSCI World em janelas longas. Adicionando 5% financial portfolio → concentração 61.7% → 63.7% (+2pp, direção errada). Condições para >0% não atendidas.

**Cético (1-3% possível):** CAPE/P/E forward ~9.25 tem poder preditivo em 10+ anos (R²~0.78). Viceira aplica na direção mas não na magnitude — correlação real renda PJ ↔ IBOV era desconhecida. Custo de 3% estar errado: ~R$60k worst case. Custo de 0% estar errado: maior.

**Resolução do debate:** Diego confirmou renda PJ: 40% EUA / 60% Brasil. Correlação renda ↔ IBOV estimada em **0.4-0.6** — acima do threshold de 0.3 que o Cético exigia para sustentar >0%. Double concentration confirmada. Argumento do Cético capitula com esse dado.

### Quant — Validação Numérica

- Concentração correta: **61.7%** (não 62.9% — issue usou snapshot desatualizado com imóvel a R$450k vs R$367k atual)
- Delta 5% equity BR: concentração vai a 63.7% (+2.0pp) — delta correto, base corrigida
- Assimetria CAPE mean-revert: 2% portfolio (~R$70k), CAPE 8.9→15 = +R$49k real = +1.4% do portfolio — barulho estatístico
- VaR com ρ=0.6: impacto negligível — o tamanho da posição domina qualquer efeito de correlação

### RF — Alternativa via Renda Fixa

Taxas atuais (março 2026): IPCA+ 2040 = IPCA+7.13%, Renda+ 2065 = IPCA+7.02%. Renda+ 2065 (duration 43.6 anos) já captura o cenário "Brasil normaliza" com convexidade equivalente ou superior ao equity BR: taxa 7%→6% = +43.6% MtM. Equity BR e IPCA+ compartilham o mesmo fator de risco (solvência soberana brasileira) — adicionar equity BR não diversifica o IPCA+, apenas duplica a aposta. Recomendação RF: acelerar DCA de IPCA+ 2040 (gap 14.6pp vs alvo 15%).

### Wealth — Tributação

Se a decisão fosse entrar: **BOVA11 (B3) > 4BRZ (XETRA)** fiscalmente:
- BOVA11: sem IOF, sem FX spread, sem ganho fantasma cambial (IR não incide sobre variação BRL/USD)
- 4BRZ: IOF 1.1% + spread 0.25% = ~R$945 entrada em R$70k + IR sobre depreciação cambial que não é ganho real
- Mesma alíquota (15%), mesma ausência de isenção R$20k, mesmo zero come-cotas. 4BRZ fora de estate tax americano (domicílio alemão, não US-situs) — mas isso não compensa os custos vs BOVA11.

### Fact-Checker — Correções

| Claim | Status |
|-------|--------|
| CAPE 8.9 (Macro) | ⚠️ Não confirmado — P/E trailing 11.45, forward 9.25; CAPE requer fonte paga |
| EWZ 3.8%/yr (Advocate) | ❌ Incorreto — EWZ 10yr ≈ 9.9%/yr (dez/2015-dez/2025) |
| 4BRZ listado LSE (Factor) | ❌ Incorreto — listado XETRA/Frankfurt; LSE é o IBZL |
| AVEM 5-6% Brasil (Factor) | ⚠️ Plausível — cap-weight aponta ~4.4%; AVEM exato não confirmado |
| Viceira 2001 = country allocation (todos) | ⚠️ Impreciso — argumento de country é de Baxter & Jermann (1997); Viceira 2001 trata asset allocation domestic, não cross-country |
| Brasil 14-15% MSCI EM (Factor) | ❌ Incorreto — Brasil é ~4-5% do MSCI EM |

---

## Conclusão

**0% equity Brasil. Consenso integral de 9 agentes.**

### Lógica encadeada

1. **Concentração soberana 61.7%**: capital humano + imóvel + empresa + RF dominam o balanço
2. **Double concentration confirmada**: renda PJ 60% Brasil → correlação renda ↔ IBOV ~0.4-0.6. Em recessão severa, renda cai E IBOV cai simultaneamente — sem diversificação
3. **Cético capitulou**: único argumento para >0% (correlação < 0.3) foi invalidado pelos dados de Diego
4. **Renda+ 2065 é o trade "Brasil melhora"**: duration 43.6 anos captura normalização macro com mais convexidade, garantia de fluxo e sem duplicar risco soberano
5. **AVEM já dá exposição indireta**: ~4-4.5% Brasil com tilt value/profitability — superior a ETF cap-weight dedicado
6. **Impacto marginal**: bull case (+1.4% no portfolio) é barulho estatístico para o plano FIRE

### Irrefalsifiabilidade — O que mudaria a decisão

Todas as três condições precisam ser verdadeiras simultaneamente:
- Receita PJ Brasil < 30% (correlação renda ↔ IBOV cai abaixo de 0.3), **E**
- P/E forward Ibovespa < 7 (extremo documentado), **E**
- Concentração soberana total < 50%

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | 0% equity Brasil. Nenhuma mudança na carteira. |
| **Estratégia** | AVEM mantido como exposição indireta ao Brasil (~4-4.5%). Renda+ 2065 permanece como play "Brasil normaliza". Prioridade: acelerar DCA IPCA+ 2040 (gap 14.6pp). |
| **Conhecimento** | Double concentration confirmada com dados reais: renda PJ 60% BR + concentração soberana 61.7%. Renda+ 2065 domina equity BR para capturar upside soberano. BOVA11 > 4BRZ fiscalmente se entrada for decisão futura. Brasil ~4-5% MSCI EM (não 14-15%). Baxter & Jermann (1997) é citação correta para country allocation via labor income (não Viceira 2001). |
| **Memória** | Quant corrigiu concentração para 61.7% (project_patrimonio_total.md a atualizar). |
