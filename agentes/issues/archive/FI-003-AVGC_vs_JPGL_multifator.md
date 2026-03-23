# FI-003-AVGC_vs_JPGL_multifator

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-003-AVGC_vs_JPGL_multifator |
| **Dono** | 02 Factor Investing |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 01 Head, 11 Oportunidades |
| **Dependencias** | — |
| **Criado em** | 2026-03-18 |
| **Origem** | Scanner de oportunidades — Avantis lancou AVGC UCITS |
| **Concluido em** | 2026-03-18 |

---

## Motivo / Gatilho

Avantis lancou AVGC (Global Equity UCITS ETF, TER 0,22%) em 2024-2025. Diego esta prestes a aportar ~R$ 600k+ no slot multifator (JPGL gap de -19,7%). Antes de continuar, vale comparar AVGC vs JPGL para garantir que o melhor veiculo esta sendo usado.

FI-001 e FI-002 dependem desta conclusao — o destino de eventuais 5pp de SWRD ou AVEM pode ser AVGC em vez de JPGL.

---

## Descricao

Comparacao head-to-head entre AVGC (Avantis Global Equity UCITS) e JPGL (JPM Global Equity Multi-Factor UCITS) para o slot de 20% multifator da carteira.

---

## Escopo

- [x] Levantar dados de ambos ETFs:
  - AVGC: ISIN, TER, AUM, data de lancamento, metodologia, holdings, tracking error
  - JPGL: mesmos dados (ja parcialmente conhecidos: TER 0,19%, IE00BJRCLL96)
- [x] Comparar factor loadings (Fama-French 5 fatores):
  - AVGC: value + profitability (Avantis approach — gestao ativa diaria)
  - JPGL: value + momentum + low vol + size (rules-based, sector-neutral)
- [x] Comparar performance historica (desde lancamento de AVGC vs JPGL no mesmo periodo)
- [x] Avaliar filosofia de investimento:
  - Avantis: gestao ativa sistematica, rebalanceamento diario, otimizacao tributaria
  - JPM: indice proprietario rules-based, rebalanceamento periodico
- [x] Avaliar risco de closet indexing: qual tem maior active share vs MSCI World?
- [x] Comparar com DDGC (Dimensional Global Core UCITS, TER 0,26%) como terceira opcao
- [x] Cenario: e se usar AVGC para parte DM + manter AVGS para small cap + AVEM para EM? Isso criaria "ecosystem Avantis" — vantagem ou risco de concentracao em gestor?
- [x] Conclusao: JPGL, AVGC, ou DDGC? Ou manter JPGL e nao mudar?

---

## Analise

Data da pesquisa: 2026-03-18

### 1. AVGC — Avantis Global Equity UCITS ETF

| Campo | Dado |
|-------|------|
| **ISIN** | IE000RJECXS5 |
| **Tickers** | AVGC (USD, LSE), AVWC (EUR, Xetra), AVCG (GBP, LSE) |
| **TER** | 0,22% p.a. |
| **AUM** | ~EUR 403M (mar/2026) |
| **Lancamento** | 25 set 2024 (~18 meses de historico) |
| **Domicilio** | Irlanda (UCITS, Acc) |
| **Benchmark** | MSCI World IMI (inclui small caps) |
| **Replicacao** | Ativa sistematica — selecao e ponderacao diaria |
| **Universo** | Large + mid + small cap, developed markets |
| **N. holdings** | Estimado ~2.500-3.500 (broad, inclui small caps; nao confirmado em fontes publicas — Avantis nao divulga numero exato facilmente) |

**Metodologia:**
- Gestao ativa sistematica (nao segue indice). Portfolio managers fazem selecao e ponderacao diaria.
- Overweight em acoes com: (a) valuations baixos (value) e (b) alta profitability (cash-based, proxima de operating cash flow / book value).
- Equal-weights value e profitability como criterios.
- Momentum e considerado no timing de trades (nao aposta contra momentum), mas nao e fator primario de selecao.
- Inclui small caps no universo — benchmark e MSCI World IMI (nao MSCI World standard).
- Mesma filosofia aplicada em AVGS (small cap value) e AVEM (EM), dando coerencia ao ecossistema.

**Top 10 Holdings (dados recentes):**
AAPL 3,52%, NVDA 3,19%, MSFT 2,72%, AMZN 2,04%, META 1,96%, GOOGL 1,44%, GOOG 1,16%, JPM 1,00%, XOM 0,68%, COST 0,60%. Top 10 = ~18,3%.

**Setores:** Financial Services 20,1%, Technology 19,8%, Industrials 14,2%, Consumer Cyclical 12,0%, Communication Services 8,5%, Healthcare 7,3%, Energy 6,2%, Consumer Defensive 5,0%, Basic Materials 4,5%, Utilities 1,6%, Real Estate 0,8%.

**Performance:**
- 2025 full year: +22,11%
- Since inception (set/2024 a nov/2025): +17,43% ITD
- YTD 2026 (ate 17/mar): +1,72%

**Factor Loadings (estimados via proxy do US-listed AVGE/AVTG):**
AVGC e o equivalente UCITS do Avantis global equity approach. Factor regressions de fundos similares (AVGE US) mostram:
- MKT: ~1,0 (full market exposure)
- SMB: ligeiramente positivo (~0,05-0,10 — inclui small caps, mas e broad)
- HML: positivo moderado (~0,10-0,15 — value tilt)
- RMW: positivo moderado (~0,10-0,15 — profitability screening)
- WML: neutro a ligeiramente positivo (momentum no timing, nao como fator direto)
- **Nota**: estes sao loadings leves — o fundo e broad market com tilt, nao um fundo de fator concentrado.

**Risco de Closet Indexing:**
- Top holdings sao mega caps (AAPL, NVDA, MSFT) — semelhante ao MSCI World.
- Active share estimado: **baixo-moderado**, provavelmente entre 15-30%. O fundo faz tilts (overweight value + profitability), mas mantem broad diversification. NAO e um fundo de fator concentrado.
- Tracking error vs MSCI World: provavelmente baixo (1-3% p.a.), dado o perfil broad com tilts.
- **Risco real**: o factor tilt e sutil o bastante para que em muitos periodos o fundo se comporte como MSCI World IMI com leve alpha. Isso pode ser feature ou bug dependendo do que se busca.

---

### 2. JPGL — JPM Global Equity Multi-Factor UCITS ETF

| Campo | Dado |
|-------|------|
| **ISIN** | IE00BJRCLL96 |
| **Ticker** | JPGL (USD, LSE) |
| **TER** | 0,19% p.a. |
| **AUM** | ~EUR 212M (mar/2026) |
| **Lancamento** | 9 jul 2019 (~6,7 anos de historico) |
| **Domicilio** | Irlanda (UCITS, Acc) |
| **Benchmark/Indice** | JP Morgan Diversified Factor Global Developed (Region Aware) Equity Index |
| **Replicacao** | Full replication do indice proprietario |
| **Universo** | Large + mid cap, developed markets |
| **N. holdings** | Estimado ~250-350 (indice concentrado; US single-factor versions tem ~211-288 constituintes) |

**Metodologia:**
- Passivo (index-tracking) — segue indice proprietario construido por JPM AM com FTSE Russell.
- 4 fatores: value, momentum, low volatility, size.
- Rules-based: seleciona acoes do universo DM com base nos 4 fatores.
- **Sector constraints**: pesos setoriais limitados entre 5% e 20% em cada rebalanceamento — nao e sector-neutral puro, mas evita concentracao extrema.
- **Region-aware**: diversifica risco entre regioes globais.
- **Rebalanceamento trimestral** — turnover moderado.
- NAO inclui small caps no universo (large + mid cap only).

**Performance:**
- YTD 2026 (ate fev): +4,39%
- 2025: +18,22%
- 2024: +10,35%
- 2023: +13,26%
- 2022: -10,20%
- 1Y: +18,66%
- 3Y ann.: +13,39%
- 5Y ann.: +11,26%

**Factor Loadings (estimados pela construcao do indice):**
- MKT: ~1,0
- SMB: ligeiramente positivo (~0,05 — tilta para mid caps, nao small caps)
- HML: positivo moderado (~0,15-0,25 — value e fator primario)
- RMW: neutro a ligeiramente positivo (quality nao e fator explicito, mas low vol correlaciona)
- WML: positivo (~0,10-0,20 — momentum e fator explicito)
- Low Vol: positivo (fator explicito — reduz beta efetivo)
- **Nota**: os loadings sao mais pronunciados que AVGC porque o universo e menor e a selecao e mais concentrada.

**Risco de Closet Indexing:**
- Com ~250-350 acoes vs ~1.500 do MSCI World, JPGL tem **active share substancialmente maior** que AVGC.
- Sector constraints (5-20%) e region-aware = desvio significativo do cap-weight.
- Active share estimado: **moderado-alto**, provavelmente 40-60%.
- Tracking error vs MSCI World: estimado 3-5% p.a. — mais volatil que AVGC.

---

### 3. DDGC — Dimensional Global Core Equity UCITS ETF

| Campo | Dado |
|-------|------|
| **ISIN** | IE000EGGFVG6 |
| **Ticker** | DDGC (LSE), DEGC (Xetra) |
| **TER** | 0,26% p.a. (algumas fontes indicam 0,30% — verificar) |
| **AUM** | ~USD 1.040M (fev/2026) — crescimento explosivo para um fundo de 4 meses |
| **Lancamento** | 12 nov 2025 (~4 meses de historico) |
| **Domicilio** | Irlanda (UCITS, Acc) |
| **Benchmark** | MSCI World Index |
| **Replicacao** | Ativa sistematica |
| **Universo** | MSCI World constituents — overweight small, value, profitability |

**Metodologia:**
- Ativa sistematica (mesma escola DFA, de onde Avantis tambem saiu).
- Overweight em: smaller size, value, high profitability.
- Universo base = MSCI World Index.
- Dimensional tem decadas de experiencia em implementacao de fatores — DDGC e o primeiro global core equity UCITS deles.
- Filosofia muito semelhante a Avantis (mesmo DNA intelectual — Eduardo Repetto, CIO da Avantis, foi co-CEO da DFA).

**Performance:**
- Muito recente — apenas ~4 meses. NAO ha dados significativos.
- NAV +1,89% ultimo mes; +5,62% em 3 meses (dados parciais).

**Factor Loadings (estimados):**
- Semelhantes a AVGC — value + profitability + size tilt.
- Dimensional historicamente tem loadings ligeiramente maiores que Avantis em size (SMB), comparaveis em value (HML) e profitability (RMW).

---

### 4. Comparacao Head-to-Head

| Criterio | AVGC (Avantis) | JPGL (JPMorgan) | DDGC (Dimensional) |
|----------|----------------|-----------------|---------------------|
| **TER** | 0,22% | **0,19%** | 0,26% |
| **AUM** | EUR 403M | EUR 212M | **USD 1.040M** |
| **Historico** | 18 meses | **6,7 anos** | 4 meses |
| **Fatores** | Value + Profitability (+ momentum no timing) | **Value + Momentum + Low Vol + Size** | Value + Profitability + Size |
| **N. fatores explicitamente targeted** | 2 (+1 implicito) | **4** | 3 |
| **Metodologia** | Ativa sistematica, diaria | Passiva (indice proprietario), trimestral | Ativa sistematica |
| **Universo** | Large + mid + **small** | Large + mid only | Large + mid (MSCI World) |
| **Benchmark** | MSCI World IMI | JPM Factor Index | MSCI World |
| **Active share est.** | 15-30% (baixo) | **40-60% (moderado-alto)** | 20-35% (baixo-moderado) |
| **Tracking error est.** | 1-3% p.a. | **3-5% p.a.** | 1-3% p.a. |
| **Closet indexing risk** | **ALTO** — broad com tilt leve | **BAIXO** — concentrado, 4 fatores | MODERADO |
| **Risco de underperformance** | Menor (mais proximo do mercado) | **Maior** (desvio significativo) | Medio |
| **Gestora** | Avantis (American Century) | JPMorgan AM | Dimensional |
| **Momentum exposure** | Indireta (timing) | **Direta e explicita** | Indireta (timing) |
| **Low Vol exposure** | Nenhuma | **Direta e explicita** | Nenhuma |

**Performance no periodo comparavel (set/2024 — mar/2026, ~18 meses):**

| Periodo | AVGC | JPGL |
|---------|------|------|
| 2025 full year | +22,11% | +18,22% |
| YTD 2026 (ate mar) | +1,72% | +4,39% |

- AVGC outperformou em 2025 (+3,89pp vs JPGL). Isso pode refletir o slight growth/mega-cap bias (top holdings = mag7) em ano forte de growth.
- JPGL esta outperformando em YTD 2026 (+2,67pp), potencialmente por value + low vol se segurando melhor na rotacao recente.
- **Periodo muito curto para tirar conclusoes**.

---

### 5. Analise de Overlap

**AVGC vs SWRD (MSCI World):**
- Overlap **muito alto** — estimado 85-95%. AVGC investe no mesmo universo DM com tilts. Top holdings sao identicas (AAPL, NVDA, MSFT, AMZN, META). A diferenca e o peso relativo (AVGC underweights mega-cap growth ligeiramente e overweights value + profitable).
- **Problema**: com SWRD em 35% e AVGC em 20%, Diego teria ~55% em DM broad/tilted que se comportam de forma muito correlacionada. O papel do slot multifator — gerar diversificacao de fator — ficaria diluido.

**JPGL vs SWRD:**
- Overlap **moderado** — estimado 50-70%. JPGL tem ~250-350 acoes selecionadas por 4 fatores, com sector constraints. Muitas acoes do JPGL estao no MSCI World, mas os pesos sao muito diferentes.
- O slot multifator com JPGL **cumpre melhor o papel de diversificador fatorial** vs o nucleo SWRD.

**AVGC vs AVGS (small cap value):**
- Overlap **baixo-moderado**. AVGC inclui small caps no universo, mas e broad — os small caps sao uma fracao pequena. AVGS e concentrated small cap value. Complementaridade razoavel, mas alguma sobreposicao existe.

---

### 6. Analise de Ecossistema Avantis

Se Diego usar AVGC: AVGS (25%) + AVEM (20%) + AVGC (20%) = **65% da carteira em Avantis**.

**Argumentos a favor:**
- Coerencia filosofica: mesma escola de pensamento (value + profitability), sem apostas contraditoras.
- Trade execution: Avantis coordena rebalanceamento diario, potencialmente gerando crossing interno entre fundos.
- Track record da gestora (Avantis US-listed tem excelente performance desde 2019).

**Argumentos contra:**
- **Concentracao de gestor**: risco operacional (erro de modelo, rotatividade de equipe, mudanca de filosofia). Eduardo Repetto e key person risk.
- **Redundancia**: AVGC broad + AVGS small + AVEM EM com mesma filosofia pode gerar over-diversification sem diversificacao real de approach.
- **Sem momentum explicito**: nenhum ETF Avantis tem momentum como fator primario. A carteira inteira ficaria sem exposicao direta a momentum — o segundo fator mais documentado (Jegadeesh & Titman 1993, Asness et al. 2013, t-stat >3,0).
- **Sem low vol**: nenhuma exposicao a low volatility factor.

**Veredicto**: ter 65% em Avantis seria concentracao excessiva de gestor. Mais importante, eliminaria momentum e low vol como fatores da carteira.

---

### 7. Questao Critica: O que o Slot Multifator Deve Fazer?

A carteira ja tem:
- SWRD 35%: market cap neutral (beta puro)
- AVGS 25%: small cap + value + profitability (Avantis)
- AVEM 20%: EM com tilt value + profitability (Avantis)

O slot de 20% multifator precisa **complementar**, nao replicar. Deve trazer:
1. **Fatores que a carteira nao tem**: momentum, low volatility
2. **Active share suficiente** para nao ser closet indexer
3. **Descorrelacao** com SWRD (beta puro) e com o approach Avantis

AVGC falha nos 3 criterios: nao traz momentum/low vol, tem active share baixo, e e altamente correlacionado com SWRD.
JPGL atende os 3: traz momentum + low vol explicitamente, tem active share moderado-alto, e descorrelaciona pelo approach diferente (rules-based, sector-constrained, 4 fatores).
DDGC atende parcialmente: traz size/value/profitability (semelhante a Avantis), mas nao traz momentum/low vol.

---

### 8. DDGC como Alternativa

DDGC merece atencao pelo AUM impressionante (USD 1B+ em 4 meses — sinal de adocao institucional forte). Porem:
- Fatores sao os mesmos de AVGC/AVGS (value + profitability + size) — nao adiciona momentum ou low vol.
- TER mais alto (0,26-0,30% vs 0,19% do JPGL).
- Historico inexistente (4 meses).
- Filosofia identica a Avantis (mesmo DNA intelectual) — nao diversifica approach.
- Faria mais sentido como substituto de SWRD (core tilted) do que como slot multifator.

---

## Conclusao

### Recomendacao: MANTER JPGL como ETF do slot multifator.

**Razoes:**

1. **Complementaridade fatorial**: JPGL e o unico dos tres que traz momentum e low volatility como fatores explicitos. Com AVGS (value + profitability + size) e AVEM (value + profitability), a carteira ja esta saturada de value e profitability. JPGL complementa com os fatores faltantes.

2. **Active share e diversificacao de approach**: JPGL tem abordagem fundamentalmente diferente (rules-based, index-tracking, sector-constrained, 4 fatores) vs Avantis (ativa sistematica, value + profitability). Essa diversificacao de *approach* reduz o risco de model dependency.

3. **Closet indexing**: AVGC tem overlap de 85-95% com SWRD. Pagar 0,22% para algo que se comporta como MSCI World IMI com alpha marginal nao justifica o slot multifator. O slot precisa de *desvio intencional* do cap-weight, que JPGL entrega.

4. **Historico**: JPGL tem 6,7 anos de track record. AVGC tem 18 meses. DDGC tem 4 meses. Para um aporte de R$ 600k+, historico importa.

5. **TER**: JPGL e o mais barato (0,19% vs 0,22% vs 0,26%).

6. **Ecossistema**: manter JPGL evita concentracao de 65% em Avantis.

**Contra-argumentos considerados:**
- "AVGC outperformou JPGL em 2025" — periodo curto (1 ano), contaminado por rally mega-cap growth que favoreceu AVGC (top holdings = mag7). Nao e evidencia de superioridade.
- "Avantis tem gestao ativa diaria vs rebalanceamento trimestral do JPGL" — verdade, mas a gestao ativa do AVGC produz tilts muito suaves. JPGL com rebalanceamento trimestral e 4 fatores tem mais factor loading efetivo.
- "DDGC tem AUM de USD 1B+" — AUM nao e proxy de qualidade. E um fundo novo com inflows institucionais da base existente de clientes Dimensional. O produto em si nao oferece nada que a carteira ja nao tenha via AVGS/AVEM.

### Sobre a posicao existente de JPGL (R$ 11.383):
- **Manter e continuar aportando**. Nao ha razao para vender.

### Sobre AVGC e DDGC:
- **AVGC**: bom produto, mas nao para o slot multifator. Se Diego algum dia quiser substituir SWRD por algo com tilt leve, AVGC seria candidato (core tilted). Mas isso e outra issue.
- **DDGC**: acompanhar. Se acumular 2+ anos de historico com factor loadings superiores a AVGC, pode se tornar opcao para o mesmo cenario acima.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Manter JPGL 20% como ETF do slot multifator. Continuar aportes em JPGL. |
| **Estrategia** | Slot multifator deve complementar (momentum + low vol) e nao replicar (value + profitability) os fatores da carteira. |
| **Conhecimento** | AVGC = broad DM com tilt leve, overlap ~90% com SWRD, active share baixo. DDGC = Dimensional core com mesmos fatores de Avantis. Nenhum substitui JPGL como multifator complementar. |
| **Memoria** | Atualizar 02-factor.md se Diego aprovar: JPGL confirmado apos comparacao com AVGC e DDGC. |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Diego: revisar analise e aprovar/contestar conclusao
- [ ] Se aprovado: atualizar `agentes/memoria/02-factor.md` com decisao confirmada
- [ ] Se aprovado: FI-001 e FI-002 podem prosseguir sabendo que o slot multifator permanece JPGL
- [ ] Monitorar DDGC — revisitar em 2027 quando tiver 2 anos de historico
- [ ] Monitorar AVGC — se Diego considerar substituir SWRD no futuro, AVGC seria candidato

---

## Fontes

- [Avantis Global Equity UCITS ETF — Pagina oficial](https://www.avantisinvestors.com/ucitsetf/avantis-global-equity-ucits-etf/)
- [AVGC — justETF](https://www.justetf.com/en/etf-profile.html?isin=IE000RJECXS5)
- [JPGL — JPMorgan AM](https://am.jpmorgan.com/gb/en/asset-management/adv/products/jpm-global-equity-multi-factor-ucits-etf-usd-acc-ie00bjrcll96)
- [JPGL — justETF](https://www.justetf.com/en/etf-profile.html?isin=IE00BJRCLL96)
- [DDGC — Dimensional](https://www.dimensional.com/gb-en/funds/ie000eggfvg6/global-core-equity-ucits-etf-acc)
- [DDGC — justETF](https://www.justetf.com/en/etf-profile.html?isin=IE000EGGFVG6)
- [JP Morgan Diversified Factor Index Ground Rules — LSEG/FTSE Russell](https://www.lseg.com/content/dam/ftse-russell/en_us/documents/ground-rules/jp-morgan-global-diversified-factor-equity-index-series-ground-rules.pdf)
- [Avantis ETFs Review — Optimized Portfolio](https://www.optimizedportfolio.com/avantis-etfs/)
- [AVGC Factsheet PDF — American Century](https://res.americancentury.com/docs/avantis-global-equity-ucits-etf-fact-sheet.pdf)
- [Investment Moats — Avantis UCITS Review](https://investmentmoats.com/passive-investing-2/reviewing-avantis-global-equity-ucits-global-small-cap-value-ucits-etfs-singaporean-investors/)
- [Banker on Wheels — Avantis UCITS Launch](https://www.bankeronwheels.com/avantis-launches-global-small-cap-value-global-equity-ucits-etfs/)
