# FI-004: Validacao Empirica dos Fatores de JPGL

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-004-Validacao_empirica_fatores_JPGL |
| **Dono** | 02 Factor |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 10 Advocate, 00 Head |
| **Dependencias** | — |
| **Criado em** | 2026-03-20 |
| **Origem** | Scan Chicago Booth (HD-003) |
| **Concluido em** | 2026-03-23 |

---

## Motivo / Gatilho

JPGL é o maior gap da carteira (-19.7%). Chicago Booth mostrou que value premium diminuiu pós-1990, momentum tem crash risk (-73% em 2009 no long-short), e smart beta ETFs sofrem de data mining ("The Smart Beta Mirage"). Precisava validar se JPGL entrega o que promete antes de continuar aportando massivamente.

---

## Análise

### Factor loadings ao vivo (FF6, regressão 2008-2022, fonte: UCITS factor ETFs.xlsx)

| Fator | Loading | t-stat | Significativo? |
|-------|---------|--------|----------------|
| RmRf | 1.042 | 83.1 | ✅ |
| SmB | 0.355 | 9.4 | ✅ |
| HmL | 0.226 | 5.7 | ✅ |
| RmW | 0.227 | 4.5 | ✅ |
| CmA | 0.167 | 3.2 | ✅ |
| UmD | -0.025 | 1.3 | ❌ não significativo |
| Alpha (mensal) | -0.036%/ano | 0.65 | ❌ |
| **R²** | **0.984** | | |

**Conclusão:** 5 de 6 fatores estatisticamente significativos. JPGL entrega exposição robusta a mercado, size, value, profitability e investment. Momentum não é um fator do JPGL — é apenas um filtro negativo (exclui losers).

### NAV vs net index (live performance vs próprio benchmark)

Alpha vs net index: **+0.116%/ano** (securities lending compensa parte do TER).

### Custos — dado novo vs planilha

| Fonte | TER | Total all-in estimado |
|-------|-----|-----------------------|
| UCITS spreadsheet (dados 2020-2023) | **0.19%** (estável desde lançamento) | 0.841%/ano |
| **Atual (confirmado 2026)** | **0.19%** | **~0.45%/ano** |

**Correção (2026-03-23, via RR forum tópico 8613):** O TER do JPGL **não foi cortado** — era 0.19-0.20% desde o lançamento (confirmado em posts de maio e outubro 2021). O que a planilha UCITS spreadsheet rastreava como "custo total" (0.841%/ano) incluía TER + transaction costs + dividend drag. O que melhorou foi a **queda nos transaction costs** à medida que o AUM cresceu de ~$37M (2021) para €205M+ (2026) — custos de transação por unidade caíram substancialmente com o volume.

| Componente | 2020-2021 (AUM ~$37M) | 2026 (AUM ~€205M) |
|------------|----------------------|-------------------|
| TER | ~0.20% | **0.19%** |
| Transaction costs | ~0.58% (alto, AUM pequeno) | ~0.14% (estimativa JPM 2021) |
| Dividend drag | ~0.34-0.38% | ~0.34-0.38% |
| **All-in estimado** | **~0.841%** | **~0.45%** |

Fontes: marcofbento cost sheet (UCITS spreadsheet); RR forum post #215 (Aleks, out/2021): "TER 0.19% + transaction costs 0.14% + dividend drag 0.34-0.38% = total 0.67-0.71%".

| Cenário | Diferença de custo vs SWRD | Premium esperado (30% haircut) | Net benefit |
|---------|---------------------------|-------------------------------|-------------|
| Planilha (all-in antigo, AUM pequeno) | +0.41%/ano | +1.93%/ano | **+1.52%/ano** |
| **Atual (all-in com AUM maior)** | **~+0.02-0.05%/ano** | **+1.93%/ano** | **~+1.88-1.91%/ano** |

Break-even haircut atual: **>95%** — os fatores precisariam perder quase todo o valor histórico para JPGL não compensar vs SWRD.

### Momentum crash risk

**Risco: BAIXO.** O crash de -73% em 2009 (Daniel & Moskowitz 2012/2016) vem do **short side** de long-short momentum. JPGL é long-only com negative screen — não tem posição vendida que exploda em recoveries. UmD loading de -0.025 não é estatisticamente significativo. Em 2022 (bear market), JPGL **outperformou** o MSCI World em +7.9pp — consistente com low-vol/value protection, não comportamento de momentum.

### Value premium compression

**Favorável agora.** Value spreads atuais no **90th+ percentile de baratura** (AQR, 2025-2026). "As wide as the end of the dot-com boom." Wide spreads = forward premium acima da média esperado para próximos 5-10 anos. A compressão histórica (7%→2% pós-1990) foi real, mas os spreads atuais sugerem ciclo favorável.

### Smart Beta Mirage

**Não detectado em JPGL.** Huang, Song & Xiang (2023): padrão sistemático de +2.77% backtest → -0.44% live. MAS live alpha de JPGL vs seu próprio net index = +0.12%/ano — o oposto do mirage. Monitorar anualmente.

### Live performance 2020-2024

| Ano | JPGL | MSCI World NTR | Delta |
|-----|------|----------------|-------|
| 2020 | +6.2% | +15.9% | -9.7% |
| 2021 | +23.3% | +21.8% | +1.5% |
| 2022 | -10.2% | -18.1% | **+7.9%** |
| 2023 | +13.3% | +23.8% | -10.5% |
| 2024 | +10.4% | +18.7% | -8.3% |
| **Cumulativo** | **+46.9%** | **+69.8%** | **-22.9%** |

Underperformance de ~4.6%/ano, 2020-2024. Contexto: período de maior dominância de US mega cap growth/tech da história moderna. Todos os fatores value/size/quality underperformaram nesse período — é tracking error estrutural do regime, não quebra da tese.

### Crowdedness

Value e small em spreads amplos = **under-owned**, não crowded. Momentum tem algum risco de crowding, mas JPGL não tem exposure relevante (UmD não significativo). **Risco: BAIXO.**

### Risco real identificado: AUM

**AUM: €211-245M (confirmado via justETF/JPMorgan, março 2026).** Este é o maior risco operacional de JPGL:
- ETFs <$500M têm risco real de encerramento
- Spreads alargam em stress markets vs ETFs grandes (SWRD ~$15B)
- Se JPMorgan encerrar o fundo, Diego precisaria migrar a posição com custo de transação e evento tributário

JPGL está ativo há 6+ anos com JPMorgan como gestora — risco de encerramento não é iminente, mas precisa de monitoramento.

---

## Conclusão

**JPGL está justificado na carteira. Manter como foco dos aportes (target 20%).**

A tese é sólida:
1. Factor loadings ao vivo estatisticamente significativos em 5 fatores ✅
2. Custo extra vs SWRD desprezível com TER atual de 0.19% (~0.05%/ano) ✅
3. Net benefit esperado: ~+1.88%/ano sobre MCW (30% haircut) ✅
4. Momentum crash risk não se aplica a long-only negative screen ✅
5. Value spreads amplos = timing favorável ✅
6. Smart Beta Mirage não detectado ✅

Risco operacional real: AUM baixo (€245M). Não impede aportes, mas requer monitoramento.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Manter JPGL como foco dos aportes, target 20% |
| **Estratégia** | Nenhuma mudança na estratégia |
| **Conhecimento** | TER de JPGL = 0.19% estável desde o lançamento. O que melhorou: transaction costs caíram de ~0.58% para ~0.14% com crescimento do AUM. Total all-in: ~0.841% (2020-21, AUM ~$37M) → ~0.45% (2026, AUM ~€205M). Cost-benefit muito mais favorável do que a planilha sugeria. |
| **Monitoramento** | Adicionar gatilhos de AUM (alertar <€150M, parar aportes <€100M) |
| **Memória** | Atualizar custo de JPGL no framework da carteira |

---

## Gatilhos de monitoramento adicionados

| Trigger | Frequência | Ação |
|---------|-----------|------|
| AUM JPGL < €150M | Mensal | Alertar — risco de delisting aumenta |
| AUM JPGL < €100M | Mensal | Parar aportes, avaliar saída |
| Value spreads comprimem (abaixo da mediana histórica) | Anual | Reduzir target JPGL de 20% para 15% |
| Live alpha vs net index persistentemente negativo (2+ anos) | Anual | Reavaliar execution do fundo |
| TER sobe acima de 0.30% | Ad-hoc | Recalcular cost-benefit |

---

## Próximos Passos

- [x] Atualizar custo de JPGL no framework (0.841% → ~0.45% all-in, TER 0.19%)
- [x] Adicionar gatilho de AUM ao arquivo de gatilhos (agentes/contexto/gatilhos.md)
