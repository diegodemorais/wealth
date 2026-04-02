# Retirement Spending Data — Gastos na Aposentadoria

Voce e o agente FIRE buscando dados empíricos sobre padrões de gasto na aposentadoria para calibrar o modelo FIRE de Diego. Foco em Brasil (POF/IBGE/ANS) com referências internacionais (BLS, JPMorgan, Blanchett) para spending smile e saúde.

## Objetivo

Substituir estimativas genéricas por dados reais sobre:
- Como os gastos evoluem com a idade (spending smile)
- Custo real de saúde por faixa etária no Brasil
- Composição de gastos de aposentados brasileiros por renda
- Validar ou ajustar o baseline R$215k/ano e o target FIRE R$250-300k+

## Fontes de Dados

### Brasil (primárias)

| Fonte | O que tem | Como acessar |
|-------|-----------|--------------|
| **IBGE POF** (Pesquisa de Orçamentos Familiares) | Gastos por idade, renda, região. POF 2017-2018 é a mais recente. | `https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html` |
| **IBGE SIDRA** | Tabelas da POF acessíveis por API | `https://sidra.ibge.gov.br/pesquisa/pof/tabelas` |
| **ANS** (Agência Nacional de Saúde) | Custos de plano de saúde por faixa etária, reajustes históricos, IPCAM | `https://www.ans.gov.br/aans/noticias-ans/numeros-do-setor/` |
| **IBGE IPCA subgrupos** | IPCA Saúde (IPCAM) histórico separado do IPCA geral | `https://sidra.ibge.gov.br/tabela/1737` (série 2290 = IPCA-Saúde) |
| **FGV / IBRE** | Índices de custo de vida por faixa de renda | WebSearch: `site:ibre.fgv.br "custo de vida" aposentadoria` |

### Internacional (referências para spending smile e saúde)

| Fonte | O que tem | Como acessar |
|-------|-----------|--------------|
| **BLS Consumer Expenditure Survey** | Gastos US por faixa etária (55-64, 65-74, 75+). Estrutura e % por categoria. | `https://www.bls.gov/cex/tables.htm` (Tabela 3: Age of reference person) |
| **JPMorgan Guide to Retirement** | Spending smile empírico com dados reais. Atualizado anualmente. | WebSearch: `"JPMorgan Guide to Retirement" {ano} spending smile` |
| **Blanchett (2014)** | Paper seminal do spending smile: "Estimating the True Cost of Retirement". Morningstar. | WebSearch: `site:ssrn.com Blanchett "True Cost of Retirement" spending smile` |
| **EBRI — Banerjee (2015)** | "Expenditure Patterns of Older Americans, 2001-2009" — HRS data | WebSearch: `site:ebri.org Banerjee expenditure patterns older Americans` |
| **Vanguard "How America Saves"** | Spending data por idade e fase de aposentadoria | WebSearch: `Vanguard "How America Saves" {ano}` |

## Como Executar

### Passo 1: Definir o que calibrar

A partir da conversa, identificar o que precisa de dados:
- **Spending smile geral**: como gastos totais mudam com a idade (go-go / slow-go / no-go)
- **Componente saúde**: IPCAM vs IPCA, custo por faixa etária (→ TX-saude-fire)
- **Composição de gastos**: quanto vai para moradia, saúde, lazer, alimentação por faixa de renda
- **Validação do baseline**: R$215k/ano é realista para perfil de Diego (alta renda, SP)?

### Passo 2: Buscar dados Brasil (POF + ANS)

**POF IBGE — tabelas de gastos por idade e renda:**
```
WebFetch: https://sidra.ibge.gov.br/tabela/7060
(Despesa monetária e não monetária média mensal familiar por tipo — POF 2017-2018)
```

Filtros relevantes: classe de rendimento alta (10+ SM), região Sudeste/SP, faixa etária 50-64 anos e 65+.

Se SIDRA não retornar direto, usar WebSearch:
```
WebSearch: "POF 2017-2018" gastos saúde faixa etária renda alta IBGE
WebSearch: IBGE POF "despesas com saúde" por idade aposentadoria
```

**ANS — custos de saúde por faixa etária:**
```
WebSearch: ANS "faixas etárias" plano saúde custo reajuste 2024 2025
WebSearch: "variação por faixa etária" ANS plano individual 2025
WebSearch: IPCAM IBGE "inflação de saúde" histórico 2010 2024
```

Dado crítico: ANS regulamenta reajustes máximos por faixa etária — faixa 59-63 anos paga até 2.0× a faixa base (0-18 anos). Buscar tabela vigente.

**IPCA-Saúde (série BCB/IBGE):**
```
WebFetch: https://api.bcb.gov.br/dados/serie/bcdata.sgs.4449/dados?formato=json
(Série 4449 = IPCA Saúde e cuidados pessoais — mensal)
```
Ou via SIDRA série 2290.

### Passo 3: Buscar dados internacionais (spending smile)

**BLS Consumer Expenditure Survey:**
```
WebFetch: https://www.bls.gov/cex/tables.htm
```
Buscar tabela por faixa etária. Extrair: total spending, healthcare %, housing %, food %, transportation % para 55-64, 65-74, 75+. Calcular índice de spending relativo (65-74 vs 55-64 = pico).

**JPMorgan e Blanchett:**
```
WebSearch: "JPMorgan Guide to Retirement" 2024 OR 2025 spending smile
WebSearch: Blanchett "spending smile" retirement "real spending" decline
```

### Passo 4: Adaptar para o perfil de Diego

Diego é investidor de alta renda em SP, aposentando aos 50. Ajustes:
- POF: usar faixa de renda ≥ 10 SM (R$14k+/mês) — não usar média geral
- Spending smile: padrão US pode ter forma similar ao BR, mas com diferenças em saúde (sistema público vs privado)
- Go-go years (50-60): gastos elevados (viagens, lifestyle). Slow-go (60-70): estabilização. No-go (70+): saúde domina
- Filho: acrescentar custos de educação (5-18 anos = ~2028-2041)

---

## Formato do Relatório

```
## Retirement Spending Data — {data}

### Brasil: POF IBGE — Estrutura de Gastos (Renda Alta, SP/Sudeste)

| Categoria | % dos gastos (50-64) | % dos gastos (65+) | Δ |
|-----------|--------------------|--------------------|---|
| Saúde | X% | X% | +Xpp |
| Moradia | X% | X% | |
| Alimentação | X% | X% | |
| Transporte | X% | X% | |
| Lazer/Cultura | X% | X% | |
| Outros | X% | X% | |

### Brasil: Inflação Saúde vs IPCA Geral (IPCAM)

| Período | IPCA Acum. | IPCAM Acum. | Diferencial |
|---------|-----------|------------|-------------|
| 2010-2015 | X% | X% | +Xpp/ano |
| 2015-2020 | X% | X% | +Xpp/ano |
| 2020-2024 | X% | X% | +Xpp/ano |
| **Média histórica** | — | — | **+Xpp/ano** |

### ANS: Faixas Etárias — Multiplicador de Custo

| Faixa | Multiplicador máximo (ANS) |
|-------|--------------------------|
| 0-18 | 1,0× (base) |
| 19-23 | X,X× |
| ... | |
| 59-63 | X,X× |
| 64+ | X,X× (cap ANS: máx 6× base) |

### Spending Smile Internacional (Referência)

| Fonte | Formato | Queda go-go → no-go | Saúde: % do total aos 70+ |
|-------|---------|--------------------|-----------------------------|
| BLS CEX (EUA) | U-shape | -X%/ano real | X% |
| JPMorgan (EUA) | Smile moderado | -X% total | X% |
| Blanchett (2014) | -1% a -2%/ano real | Confirmado | — |

### Impacto no Modelo FIRE de Diego

| Item | Premissa atual | Dado empírico | Ajuste sugerido |
|------|---------------|---------------|-----------------|
| Baseline gastos 50-60 | R$215k/ano | | |
| Inflator saúde | IPCA geral | IPCA + Xpp | Inflator próprio |
| Gastos aos 70+ vs 50 | 100% | ~X% | Spending smile |
| Custo saúde PF aos 59 | estimado | R$X/mês (ANS faixa X) | Calibrar TX-saude-fire |

### Issues Impactadas

- **TX-saude-fire**: dados ANS + IPCAM → calibrar componente saúde
- **FR-spending-smile**: dados POF + BLS → modelar curva de gastos por fase
- **Baseline FIRE**: validar R$215k atual e target R$270-300k+ com filho
```

## Regras

- Sempre separar dados BR (POF/ANS) de referências internacionais — Brasil tem saúde privada cara + sistema público diferente do US/EU
- POF 2017-2018 é a mais recente disponível — indicar defasagem; POF 2024-2025 pode estar em campo
- IPCAM vs IPCA: o diferencial é estrutural e documentado — não é outlier de pandemia
- Não usar média geral da população como referência para Diego — usar faixa de renda alta
- Sempre vincular achados às issues abertas (TX-saude-fire, FR-spending-smile)

## Frequência Recomendada

- **Ao executar TX-saude-fire** (issue backlog Alta)
- **Ao executar FR-spending-smile** (quando entrar em Doing)
- **Quando POF nova for publicada** (próxima ~2025-2026)
- **Ao revisar baseline de gastos** após grandes mudanças de vida (casamento, filho)
