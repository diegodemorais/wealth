# Auditoria: Carteira Viva (Google Sheets) vs Codebase wealth/
> Data da auditoria: 2026-04-07
> Metodologia: leitura completa das abas da planilha via gviz/tq + leitura de todos os scripts Python, arquivos dados/, e arquivos agentes/

---

## PARTE 1: Mapa da Planilha

### Abas identificadas (via gviz/tq)

#### Aba `Utils`
**Propósito**: Centro operacional da carteira. É a aba mais rica e complexa.

**Estrutura em blocos:**

**Bloco 1 — Classificação por Classe (linhas 1-18)**
- Colunas: ID, Categoria, Classe, ETF, Ganho total, G1, G2, G3 (breakdown geográfico)
- Categorias: Caixa, Renda fixa, Fundo RF, COE, ETF inter, Crypto, Empréstimo
- Métricas por categoria: % Ganho, metas (Meta/Atual/Saldo)
- Breakdown geográfico G3: Desenvolvidos EUA (67-68%) vs Desenv Ex-EUA (32-33%)
- Breakdown G2: Desenvolvidos 72-73% / Emergentes 17-26%
- Breakdown G1: Fator (Neutro 60-67% / Fatorial 30-32%)

**Bloco 2 — Calculadora de Preço Médio (linhas 20-35)**
- Cálculo manual e automatizado de PM por ETF
- Entradas: tipo (Manual/ETF inter), ativo, preço médio anterior, quantidade, valor total, novas compras
- Campos: PM anterior, qtde anterior, valor anterior, novo PM, nova qtde, novo valor
- ETFs com dados: USSC (PM $49.17, 443 cotas), SWRD (PM $32.89, 5405 cotas)
- Câmbio configurado: R$ 5,15
- Aporte configurado: R$ 28.000,00 / IOF+Spread: R$ 84,00
- Contribution USD: $5.417,64 / $5.360,00

**Bloco 3 — Calculadora de Cotas (linhas 28-30)**
- Calcula quantidade de cotas a comprar dado saldo e preço
- Campos saldo/valor ativo/qtde

**Bloco 4 — Portfolio completo (linhas 40-80, aprox.)**
Tabela principal com todas as posições:

| Classe | ETF | Ganho% | Meta% | ValorUSD | Atual% | Delta | Compra planejada | Valor compra | Cotas |
|--------|-----|--------|-------|----------|--------|-------|-----------------|--------------|-------|
| Desenv. neutro | SWRD | 41.22% | 42.5% | $245,797 | 40.7% | -1.77% | 0% | $0 | 0 |
| Desenv. híbrido | EIMI | 50.51% | 17.0% | $93,499 | 15.5% | +9.63% | — | — | — |
| Desenv. small+value | USSC | 67.72% | 25.5% | $30,778 | 5.1% | +6.78% | — | — | — |
| Desenv. small+value | AVUV | 37.82% | — | $61,705 | 10.2% | — | — | — | — |
| Desenv. small+value | AVDV | 75.03% | — | $96,219 | 15.9% | — | — | — | — |
| Desenv. small+value | AVGS | 4.24% | — | $6,067 | 1.0% | — | — | — | — |
| Mom Desenv. | IWMO | -11.79% | 0% | $0 | 0% | 0% | — | — | — |

**Total portfolio**: $603,411.91

**Bloco 5 — Nomes completos dos ETFs (linhas 82-100)**
- Tabela com nome completo, valor USD, % portfolio, ganho%, custo base, % ganho sobre custo

**Bloco 6 — Análise de Risco por Bucket (linhas 100-130, aprox.)**
- Tabela com câmbio R$ 5,15
- Por classe/ETF: delta vs meta, meta%, valor BRL, % portfolio, valor custo BRL, % ganho BRL
- **SWRD**: R$ 1.266.541 (36.1%), custo R$ 522.069 (41.2% de ganho)
- **AVEM bucket** (EIMI+AVES+DGS): R$ 827.983 (23.6%), custo R$ 349.015 (42.2%)
- **AVGS bucket** (USSC+AVUV+AVDV+AVGS): R$ 1.003.606 (28.6%), custo R$ 600.975 (59.9%)
- **JPGL** (IWVL): R$ 11.130 (0.3%), custo R$ 7.716 (69.3%)
- **Tesouro IPCA+ 2029**: R$ 89.095 (2.5%), custo R$ 12.227 (13.7%)
- **Tesouro IPCA+ 2040**: R$ 33.285 (0.9%), custo R$ 20.309 (61.0%)
- **Renda+ 2065**: R$ 112.466 (3.2%), custo R$ 3.912 (3.5%)
- **HODL11**: R$ 100.376 (2.9%), custo -R$ 32.076 (-32.0%)
- **COE S&P500**: R$ 172.869 (4.9%), custo R$ 82.869 (47.9%)
- **Empréstimo XP**: -R$ 108.788 (-3.1%)
- **TOTAL**: R$ 3.511.554 (inclui COE e empréstimo)
- **TOTAL excl. estruturados**: R$ 3.447.474

**Bloco 7 — Objetivos FIRE (linhas 132-145)**
- FIRE var: R$ 3.109.261 (90.2%), ganho 47.6%
- FIRE fixo: R$ 33.285 (1.0%), ganho 61.0%
- Reserva: R$ 89.095 (2.6%), ganho 20.3%
- Risco Juros: R$ 112.466 (3.3%), ganho 3.5%
- Risco Crypto: R$ 103.367 (3.0%), -31.6%

**Bloco 8 — Backtest URL** (Curvo.eu link completo gerado automaticamente)

---

#### Aba `Aporte`
**Propósito**: Calculadora de aporte mensal + histórico de patrimônio + análise de TLH.

**Seção 1 — Resumo geral (linhas 1-13)**
- Datas âncora: **01/03/2021** (início) → **15/12/2025** (último fechamento)
- Câmbio: R$ 5,15
- ETFs internacionais atual: **$603.411,91**
- Patrimônio início: R$ 1.111.699,63
- Patrimônio 15/12/2025: R$ 3.302.824,46
- Patrimônio atual (07/04/26): **R$ 3.511.554,42**
- Retorno anualizado: **5,66%**
- Retorno mensal: 0,54%
- Rentabilidade acumulada: **31,66%** (possivelmente sobre referência específica)

**Seção 2 — Calculadora de aporte (linhas 15-21)**
- Data referência: 07/04/26
- Patrimônio total: R$ 3.511.554
- Breakdown: RF R$ 234.846 (6.7%), Crypto R$ 103.367 (2.9%), Equity R$ 3.109.261 (88.5%)
- Aporte sugerido: R$ 28.000 (parece ser o valor configurado)
- Destino: por prioridade (1º = equity, 2º = crypto, 3º = RF, 4º = FIRE var)
- **Calculadora de Bollinger Bands**: janela 30 dias, mult 2, MA 12
- Referência USDBRL: filtro para análise de câmbio ideal

**Seção 3 — Tabela de posições para aporte (linhas 24-45)**
- Cada ETF com colunas: ganho%, % atual, variação semana, variação mês, meta%, atual%, target ajustado%, delta vs meta%, comprar?, valor compra
- Linha adicional: USDBRL e BTCUSD com variação semanal e mensal
- Flag TRUE/FALSE para cada ETF indicando se é target

**Seção 4 — Calculadora de PM com histórico de vendas (linhas 48-70)**
- PM anterior, novas compras (qtde + preço), PM resultado
- Histórico de lotes de venda: preço médio, qtde vendida, valor recebido, PM atual resultado
- Dados de vendas: DGS, EIMI, USSC, AVUV, SWRD (incluindo vendas/recompras passadas)
- Análise de TLH: preço médio de compra, lotes ativos, % ganho, diferença USD

**Seção 5 — Dados de negócio/EBITDA (linhas 75-85)**
- Linha de análise de negócio: EBITDA antes/depois, custos per capita, benefícios
- Dados: EBITDA antes 13.737 / depois 11.714 / delta -2.023
- Benefícios: antes 80 / depois 500 / delta 420
- Valor do negócio estimado: R$ 180.250 / R$ 2.163.000

**Seção 6 — Objetivos de alocação (linhas resumo)**
- Tabela com objetivo, atual, ação sugerida (Comprar/Manter), ordem de prioridade
- Inclui taxa atual do TD 2040: **7,20%**
- Taxa Renda+ 2065: **6,93%**

---

#### Aba `Evolução`
**Propósito**: Simulação de glide path + tabela mestre de todos os ativos com projeção até 45 anos.

**Estrutura principal:**

**Cabeçalho (linhas 1-4)**
- Euro: R$ 5,98 / Dólar: R$ 5,15
- Idade início: 33 / Ano de investimento: 5
- Início: 01/03/2021 / Hoje: 07/04/2026
- Horizonte: anos 0-45 (coluna por ano)

**Coluna A**: ID do ativo (SWRD, AVGS_US, AVGS_INT, AVEM, JPGL, IWQU, etc.)
**Coluna B**: Composição do grupo (ex: AVUV+USSC+AVGS)
**Colunas C-D**: Links para ETFs (iShares, Avantis, etc.)
**Colunas E-F**: Nomes descritivos
**Colunas G**: Retorno anualizado do grupo
**Colunas H-K**: Valor atual BRL, USD, % portfolio atual, target %
**Colunas L-O**: Meta valor BRL, USD, delta, delta%
**Colunas P-BZ**: Alocação alvo por ANO (ano 0 até ano 45)

**Ativos na tabela master:**
- SWRD: R$ 1.266.541 (41.15%), target 42.5%
- AVGS(US) = AVUV+USSC+AVGS: R$ 476.547 (15.48%), target 8.93% → delta -R$ 201.836 (-6.56%)
- AVGS(INT) = AVDV+ZPRX: R$ 495.798 (16.11%), target 16.58%
- AVEM = DGS+AVES+AVEM: R$ 346.200 (11.25%), target 17.0%
- JPGL: R$ 481.783 (15.65%), target 0.00% → delta -R$ 481.783 (-15.65%)
- IWQU (IWVL): R$ 11.130 (0.36%), target 0.00%
- EMMV, MVOL, IWMO: R$ 0 (watchlist)
- Total equity: R$ 3.077.999 ($597.345)

**Tesouro IPCA+ Curto**: target 0% atual → sobe para 3% no glide path
**Tesouro IPCA+ Longo**: target 15% (estável nos primeiros anos)
**FIIs (ITIP11, ITIT11)**: target 0%
**RF exterior (HYLA)**: target 0%

**Glide path — cenários (linhas ~30-50)**
- Cenário A (ativo), B (escolhido), C, D, E, F
- 4 eixos: Renda Fixa buffer, Tesouro IPCA+ Longo, Renda Variável, sub-alocações
- Cenário B (TRUE = ativo):
  - Tesouro IPCA+ Curto: 0% → sobe para 3% próximo dos 50
  - Tesouro IPCA+ Longo: 15% constante
  - Equity: 85% nos anos iniciais
  - SWRD: 43% / AVGS(US): 9% / AVGS(INT): 17% / AVEM: 17% / JPGL: 0%
  - **Total aprovado na issue**: AVGS 26%, SWRD 43%, AVEM 17%

**Projeção por coluna/ano** (anos 0-45):
- Cada ativo tem % alvo por ano de vida
- SWRD: 42.5% nos anos iniciais → 41.0% ao redor dos 50 → 41.3% depois
- AVEM: 17.0% → 16.4% → 16.5%
- Total sempre 100%

---

### Período histórico coberto
- **Início tracking**: 01/03/2021
- **Patrimônio inicial**: R$ 1.111.699,63
- **Último fechamento explícito**: 15/12/2025 (R$ 3.302.824,46)
- **Valor atual na planilha**: R$ 3.511.554,42 (07/04/2026)
- **Retorno acumulado período**: ~215% em BRL (R$1.11M → R$3.51M)
- **Retorno anualizado**: 5,66% a.a.

---

### Principais métricas calculadas na planilha

1. **Ganho por ETF** (em USD e %): calculado automaticamente sobre custo base
2. **Delta vs meta**: diferença entre alocação atual e alvo
3. **Retorno anualizado da carteira**: 5,66%
4. **Calculadora de PM**: preço médio ponderado com histórico de compras e vendas
5. **TLH analysis**: ganho/perda por lote, PM atual pós-vendas
6. **Glide path / target allocation**: projeção de alocação alvo por ano de vida (até 45 anos)
7. **Backtest URL**: gerado automaticamente para Curvo.eu
8. **Análise de variação semanal/mensal** por ETF
9. **Bollinger Bands (macro FX)**: para timing de câmbio
10. **Valor de negócio estimado**: análise EBITDA separada

---

## PARTE 2: Gaps — O que a planilha tem e o codebase NÃO tem

### 2.1 Dados históricos exclusivos da planilha

**CRÍTICO — Sem equivalente no codebase:**

1. **Série histórica de retorno anualizado desde 01/03/2021** (5,66% a.a.): o `historico_carteira.csv` só tem 2 entradas (2026-03-19 e 2026-03-20). A planilha contém o snapshot do patrimônio desde o início em 01/03/2021 e R$ 1.111.699 inicial.

2. **Custo base por posição em BRL**: a planilha rastreia custo BRL de cada bucket (ex: AVGS bucket custo R$ 600.975, ganho 59.9%). O codebase tem `tlh_lotes.json` com lotes em USD, mas sem custo base BRL calculado/armazenado por bucket.

3. **Histórico de vendas e recompras**: a aba Aporte registra vendas passadas com PM, qtde, impacto no PM. O codebase em `tlh_lotes.json` tem datas de compra mas não registra vendas/ajustes históricos.

4. **Cálculo de patrimônio em 15/12/2025** (R$ 3.302.824) e trajetória 2021-2026: existe na planilha, não há série temporal no codebase.

5. **Análise EBITDA do negócio**: dados de empresa (EBITDA 13.737 → 11.714, custos per capita, benefícios) existem na planilha, completamente ausentes do codebase.

### 2.2 Métricas e cálculos exclusivos da planilha

1. **Retorno anualizado TWR-like desde o início (5,66%)**: o `checkin_mensal.py` usa Método Dietz mensal, mas não calcula o CAGR desde o início (2021-03-01). Não há TWR cumulativo em lugar algum do codebase.

2. **Calculadora de Bollinger Bands para câmbio**: parâmetros (janela 30, mult 2, MA 12) na aba Aporte para timing de FX. Ausente nos scripts Python.

3. **Delta semanal por ETF**: a planilha rastreia variação semanal além da mensal. O codebase só calcula variações mensais.

4. **Análise de custo base BRL por bucket**: valor de cada grupo (AVGS bucket = R$ 1.003.606 atual vs R$ 600.975 custo, +59.9%). Nenhum script Python consolida essa métrica.

5. **% do ganho sobre custo base BRL por ETF**: SWRD +41.2%, AVEM +42.2%, AVGS +59.9%, JPGL +69.3%. Ausente no codebase.

6. **Calculadora de PM com múltiplos lotes e vendas**: a planilha integra PM anterior + novas compras + vendas num único PM resultante. O script `checkin_mensal.py` tem `custo_base_brl_ponderado()` mas sem tratamento de vendas parciais.

7. **Projeção de glide path por ano absoluto (coluna por coluna de 0 a 45)**: a aba Evolução tem a alocação-alvo de cada ETF para cada ano específico do investidor. O `fire_glide_path_scenarios.py` tem cenários mas não gera esta tabela granular.

8. **Breakdowns geográficos aninhados (G1/G2/G3/G4)**: a planilha decompõe o portfolio em níveis hierárquicos (Neutro/Fatorial → Desenvolvidos/EM → EUA/Ex-EUA). Nenhum script Python faz essa análise.

9. **Comparação cenários de alocação (A/B/C/D/E/F)** na aba Evolução: 6 cenários de glide path com flag ativo/inativo. Ausente no codebase.

10. **Score de prioridade de compra (1º, 2º, 3º, 4º)**: tabela na aba Aporte com ordem de prioridade dos aportes. O codebase tem lógica de drift mas não prioridade explícita.

### 2.3 Visualizações ausentes no codebase

1. **Backtest URL gerado dinamicamente** para Curvo.eu (aba Utils, linha 100): o codebase tem `backtest_portfolio.py` mas não gera URLs Curvo.eu.
2. **Formatação condicional** de delta vs meta (verde se no alvo, vermelho se fora): ausente em qualquer saída dos scripts.
3. **Gráficos de glide path** (aba Evolução): projeção visual da alocação por ano. Nenhum script gera visualização equivalente.

### 2.4 Estruturas de tracking ausentes

1. **Tabela master por ETF com todos os atributos** (valor USD, % atual, % meta, ganho%, custo, link, nome completo): a planilha tem tudo numa tabela. No codebase existe `holdings.md` mas desatualizado (2026-03-22, câmbio R$ 5,32).
2. **Rastreamento de ativos candidatos (watchlist)**: EMMV, MVOL, HYLA, ITIP11, ITIT11 com % = 0 mas presença na tabela. O codebase tem `etf-candidatos-scan.md` como skill mas sem tabela persistente.
3. **Análise de valor de negócio**: presente na planilha, completamente ausente no codebase.

---

## PARTE 3: Incompatibilidades

### 3.1 Divergências de valores

| Métrica | Planilha | Codebase | Delta | Fonte codebase |
|---------|----------|----------|-------|----------------|
| Patrimônio total (07/04/26) | R$ 3.511.554 | R$ 3.372.673 | **+R$ 138.881** | carteira.md (desatualizado) |
| ETFs internacionais (USD) | $603.411,91 | $587.959,22 | **+$15.453** | holdings.md (2026-03-22, câmbio R$5.32) |
| SWRD valor USD | $245.797 | $243.415 | +$2.382 | holdings.md |
| AVUV cotas | 548,88 | 548,88 | igual | OK |
| AVDV cotas | 947,60 | 947,60 | igual | OK |
| EIMI cotas | 2.020,29 | 2.020,29 | igual | OK |
| SWRD cotas | 5.405,56 (planilha) | 5.291,64 (holdings.md) | **+113,92 cotas** | Diferença real — aporte recente não refletido |
| Renda+ 2065 | R$ 112.466 | ~R$ 99.673 (carteira.md) | +R$ 12.793 | Valorização MtM |
| Câmbio referência | R$ 5,15 | R$ 5,16 (carteira.md) | -R$ 0,01 | Diferença de data |
| holdings.md câmbio | — | R$ 5,32 | — | holdings.md desatualizado vs carteira.md (5.16) |
| Aporte mensal | R$ 28.000 (planilha) | R$ 25.000 (carteira.md) | +R$ 3.000 | Planilha pode refletir aporte maior |
| Tesouro IPCA+ 2040 | R$ 33.285 (planilha) | R$ 13.308 (holdings.md) | **+R$ 19.977** | holdings.md desatualizado |
| Tesouro IPCA+ 2029 | R$ 89.095 | R$ 87.862 (holdings.md) | +R$ 1.233 | Valorização MtM |

### 3.2 Definições divergentes

1. **Alocação target JPGL**: planilha usa 0% para JPGL (corretamente refletindo a decisão de 2026-04-01), mas `checkin_mensal.py` e `backtest_portfolio.py` ainda têm JPGL com pesos 20%/0.158. `shadow-portfolio.md` tem "Target" com JPGL 20%.

2. **Pesos equity internos**:
   - Planilha (aba Evolução, cenário B ativo): SWRD 43% / AVGS 26% / AVEM 17% (dentro do equity)
   - carteira.md: SWRD 50% / AVGS 30% / AVEM 20% (aprovado FI-equity-redistribuicao)
   - `portfolio_analytics.py`: SWRD 50% / AVGS 30% / AVEM 20% (correto, atualizado)
   - `ibkr_sync.py`: SWRD 50% / AVGS 30% / AVEM 20% (correto)
   - `backtest_portfolio.py`: SWRD 35% / AVGS 25% / AVEM 20% / JPGL 20% (defasado)
   - `checkin_mensal.py` PESOS_TARGET: SWRD 27.65% / AVGS 19.75% / AVEM 15.8% / JPGL 15.8% (defasado)
   - `shadow-portfolio.md`: Target tem 35% SWRD + 25% AVGS + 20% AVEM + 20% JPGL (defasado)
   - **A planilha mostra 43/26/17 que é inconsistente com a decisão aprovada 50/30/20**

3. **Patrimônio FIRE var**: planilha separa JPGL em "FIRE var" (incluindo IWVL R$ 11.130). carteira.md inclui JPGL como "não comprar mais". A planilha ainda precifica o JPGL como 0% alvo mas mantém o valor existente.

4. **Renda+ 2065 taxa atual**: planilha mostra 6,93% (aba Aporte). carteira.md mostra 7,08% (2026-04-01). Diferença de 15 bps — taxa mudou entre as datas.

5. **IPCA+ 2040 taxa**: planilha: 7,20%. carteira.md: 7,21%. holdings.md: 7,16%. Inconsistência de fonte/data.

6. **Método Dietz vs retorno na planilha**: a planilha calcula retorno anualizado simples (5,66% desde 2021). O `checkin_mensal.py` usa Método Dietz mensal que é mais correto para aportes frequentes. As duas métricas respondem perguntas diferentes mas coexistem sem reconciliação explícita.

7. **Holdings.md (2026-03-22) vs carteira.md (2026-04-01)**: `holdings.md` referencia câmbio R$ 5,32, JPGL como "FOCO dos aportes", AVGS target 25%. Está 10+ dias defasado e reflete a estratégia pré-decisão de abril.

### 3.3 Dados desatualizados

| Arquivo | Última atualização | Dado desatualizado |
|---------|-------------------|-------------------|
| `holdings.md` | 2026-03-22 | Câmbio R$ 5,32 (atual R$ 5,15), JPGL como foco de aportes, pesos equity defasados |
| `dados/historico_carteira.csv` | 2026-03-20 | Só 2 linhas; últimos dados de 6+ dias atrás |
| `checkin_mensal.py` PESOS_TARGET | Código | JPGL 15.8%, SWRD 27.65% — ainda reflete estratégia pré-2026-04-01 |
| `backtest_portfolio.py` PESOS_TARGET | Código | SWRD 35%/AVGS 25%/AVEM 20%/JPGL 20% — reflete estratégia anterior |
| `shadow-portfolio.md` Target | 2026-03-26 | 35% SWRD + 25% AVGS + 20% AVEM + 20% JPGL — pré-FI-equity-redistribuicao |
| `scorecard.md` Custo de Complexidade | 2026-03-26 | TER calculado com JPGL 19.75% / SWRD 27.7% / AVGS 19.8% |
| `fire_montecarlo.py` PREMISSAS | Código | patrimonio_atual = 3.372.673 — desatualizado |

---

## PARTE 4: Oportunidades de Melhoria no Codebase

### 4.1 ALTA prioridade — Sincronização imediata

**P1.1 — Atualizar pesos da estratégia em todos os scripts**
Arquivos afetados: `checkin_mensal.py` (PESOS_TARGET), `backtest_portfolio.py` (PESOS_TARGET), `shadow-portfolio.md` (Target definição), `scorecard.md` (TER tabela).
Nova estratégia: SWRD 50% / AVGS 30% / AVEM 20% (sem JPGL).
Pesos no portfolio total: SWRD ~39.5% / AVGS ~23.7% / AVEM ~15.8% (considerando 79% equity).

**P1.2 — Criar script de sincronização planilha → historico_carteira.csv**
O arquivo `dados/historico_carteira.csv` tem só 2 linhas. A planilha tem o snapshot de 15/12/2025 (R$ 3.302.824) e o patrimônio inicial de 01/03/2021 (R$ 1.111.699). Criar script que lê a planilha via WebFetch e appenda ao CSV.

**P1.3 — Atualizar holdings.md**
O arquivo está 16 dias desatualizado. Há divergência de 113 cotas no SWRD. O Bookkeeper deve atualizar após cada reconciliação.

### 4.2 MÉDIA prioridade — Implementar funcionalidades da planilha

**P2.1 — TWR acumulado desde T0**
Implementar Time-Weighted Return acumulado desde 01/03/2021 no `checkin_mensal.py`. A planilha mostra 5,66% a.a. — implementar método de cálculo equivalente e adicionar ao output do check-in.

**P2.2 — Custo base BRL consolidado por bucket**
Criar função em `checkin_mensal.py` que usa `tlh_lotes.json` + PTAX BCB para calcular custo base BRL ponderado por bucket (SWRD bucket, AVGS bucket, AVEM bucket). Hoje a planilha tem essa informação mas o codebase não agrega.

**P2.3 — Breakdowns geográficos (G1/G2/G3/G4)**
Implementar análise hierárquica: Neutro vs Fatorial → Desenvolvidos vs EM → EUA vs Ex-EUA. Adicionar ao output do `portfolio_analytics.py` ou como novo módulo.

**P2.4 — Tabela master de posições com todos os atributos**
Criar `dados/posicoes_atual.json` com: ETF, cotas, PM_USD, PM_BRL, valor_USD, valor_BRL, pct_portfolio, pct_alvo, delta, ganho_pct, custo_BRL. Atualizado pelo Bookkeeper a cada reconciliação.

**P2.5 — Variação semanal por ETF**
Adicionar cálculo semanal ao `checkin_mensal.py` além do mensal. Útil para decisões de timing de aporte.

**P2.6 — Bollinger Bands para câmbio**
Implementar em `fx_utils.py` a análise de Bollinger (janela 30, mult 2, MA 12) para indicar se o câmbio está em banda superior/inferior antes de enviar remessa.

### 4.3 BAIXA prioridade — Novos módulos

**P3.1 — CAGR desde o início**
Script simples que lê `historico_carteira.csv` e calcula CAGR, TWR, MWRR desde 2021. Com série histórica mais completa seria muito mais valioso.

**P3.2 — Glide path visualization**
Gerar gráfico (matplotlib) da aba Evolução: % alvo por ETF ao longo dos anos. Complementaria o `fire_glide_path_scenarios.py`.

**P3.3 — Watchlist tracker**
Arquivo `dados/watchlist_etfs.json` com ETFs monitorados (EMMV, MVOL, HYLA, ITIP11, ITIT11) e critérios de entrada. Atualmente existe como skill `etf-candidatos-scan.md` mas sem dados persistentes.

**P3.4 — Análise de valor do negócio**
Se relevante para FIRE, criar `scripts/business_valuation.py` que modela o valor do negócio (PJ) como capital humano adicional.

---

## PARTE 5: Viabilidade do Website

### 5.1 Arquitetura sugerida

**Stack recomendado: Python FastAPI (backend) + Next.js (frontend)**

Justificativas:
- Todo o codebase já é Python — reutilização máxima dos scripts
- FastAPI é performático para dashboards financeiros com requisições periódicas
- Next.js oferece SSR (importante para dados financeiros que precisam de autenticação)
- Alternativa mais simples: **Streamlit** — 80% das features em 20% do esforço

**Estrutura de dados:**

```
Backend (FastAPI):
├── /api/portfolio          → posições atuais (da planilha ou ibkr_sync)
├── /api/fire-status        → P(FIRE) em tempo real (fire_montecarlo.py)
├── /api/shadow             → Shadow A/B/C/Target (checkin_mensal.py)
├── /api/tlh                → TLH monitor (checkin_mensal.py)
├── /api/macro              → PTAX, IPCA, Selic (fx_utils.py + python-bcb)
├── /api/history            → histórico_carteira.csv
└── /api/rebalance          → otimizador de aporte (portfolio_analytics.py)

Fontes de dados:
├── Google Sheets (via gviz/tq público) → posições, targets, câmbio
├── IBKR Flex Query (ibkr_sync.py) → posições reais automáticas
├── Yahoo Finance (yfinance) → preços ETFs
├── BCB API (python-bcb) → PTAX, IPCA, Selic
└── Tesouro Direto API → preços TD, taxas IPCA+/Renda+
```

### 5.2 Features sugeridas

| Feature | Inspiração | Complexidade | Prioridade |
|---------|-----------|-------------|-----------|
| Dashboard: patrimônio total + breakdown | Aba Utils | Simples | Alta |
| Posições com ganho% e delta vs meta | Aba Utils bloco 4 | Simples | Alta |
| Gráfico TWR acumulado desde 2021 | Aba Aporte (retorno 5,66%) | Médio | Alta |
| Shadow portfolios comparativo | shadow-portfolio.md | Médio | Alta |
| P(FIRE) gauge com 3 cenários | fire_montecarlo.py | Médio | Alta |
| FIRE progress (patrimônio vs trajetória) | checkin-automatico M3 | Simples | Alta |
| TLH monitor com alertas | checkin_mensal.py | Simples | Alta |
| Calculadora de aporte ótimo | portfolio_analytics.py | Médio | Média |
| Glide path visual (% por ano de vida) | Aba Evolução | Médio | Média |
| Breakdowns G1/G2/G3/G4 | Aba Utils cabeçalho | Simples | Média |
| Bollinger Bands câmbio | Aba Aporte | Médio | Média |
| Frontier eficiente + stress test | portfolio_analytics.py | Complexo | Baixa |
| Factor regression | factor_regression.py | Complexo | Baixa |
| Backtest fatorial vs VWRA | backtest_portfolio.py | Complexo | Baixa |
| Spending analysis | spending_analysis.py | Simples | Baixa |

### 5.3 Complexidade estimada

**Simples (1-3 dias por feature)**:
- Leitura da planilha e exibição de posições
- Cálculo de delta vs meta
- FIRE progress (patrimônio vs trajetória linear)
- TLH alertas

**Médio (3-7 dias por feature)**:
- Shadow portfolios com histórico mensal
- P(FIRE) gauge interativo
- TWR acumulado com gráfico histórico
- Glide path visual
- Bollinger Bands para câmbio

**Complexo (1-3 semanas por feature)**:
- Fronteira eficiente interativa
- Factor regression com rolling loadings
- Backtest completo com múltiplos regimes

**Estimativa total para MVP (dashboard + posições + FIRE gauge + shadows)**:
- Streamlit: 2-3 semanas
- FastAPI + Next.js: 6-8 semanas

### 5.4 Dependência crítica: histórico de patrimônio

O maior gap para um website útil é a **série histórica de patrimônio**. Atualmente:
- `historico_carteira.csv`: apenas 2 pontos (2026-03-19, 2026-03-20)
- Planilha: 2 pontos históricos explícitos (01/03/2021, 15/12/2025) + valor atual

Para gráficos de TWR histórico, seria necessário resgatar o histórico completo mensal desde 2021. Possível fontes: IBKR statements, planilha histórica, memória do Diego.

---

## RELATÓRIO EXECUTIVO — Top 10 Achados + Ações Priorizadas

---

### Top 10 Achados

**1. Estratégia desatualizada em 4 scripts Python**
`checkin_mensal.py`, `backtest_portfolio.py`, `shadow-portfolio.md` e `scorecard.md` ainda usam a estratégia pré-2026-04-01 (com JPGL e pesos antigos). O risco operacional é que uma rodada de `/checkin-automatico` calcule shadow Target incorreto. **URGENTE.**

**2. Holdings.md defasado em 16 dias com 113 cotas de SWRD faltando**
`holdings.md` (câmbio R$ 5,32, 2026-03-22) mostra 5.291 cotas de SWRD. A planilha (07/04/26) mostra 5.405 cotas — diferença de 113 cotas (~R$ 18k). O arquivo também ainda refere JPGL como "FOCO dos aportes".

**3. historico_carteira.csv tem apenas 2 linhas (19 e 20 de março)**
Este arquivo é a base para cálculos de TWR, CAGR e shadows. Com 2 pontos de dados, é impossível calcular retorno acumulado histórico. A planilha tem o dado de 01/03/2021 (R$ 1.111.699) e 15/12/2025 (R$ 3.302.824) que nunca foram migrados.

**4. Patrimônio diverge R$ 138k entre planilha e carteira.md**
Planilha: R$ 3.511.554. carteira.md: R$ 3.372.673. A diferença inclui a apreciação de março + aporte de R$ 28k (vs R$ 25k configurado no codebase). carteira.md estava atualizado em 01/04/2026 mas já está 6 dias defasado.

**~~5. Aporte mensal: R$ 28k na planilha vs R$ 25k no codebase~~ — FALSO POSITIVO**
Confirmado por Diego: aporte médio é R$ 25k. O R$ 28k na planilha é variação pontual do mês. Codebase correto.

**6. TWR acumulado desde 2021 (5,66% a.a.) existe só na planilha**
O codebase não calcula ou armazena o retorno acumulado histórico. Com a série histórica reconstruída, seria possível comparar o desempenho real contra os shadows de forma retroativa.

**7. Custo base BRL por bucket existe só na planilha — crítico para TLH**
AVGS bucket: custo R$ 600.975, valor R$ 1.003.606 (+59.9% em BRL). Esse dado é essencial para cálculo de IR em venda futura. O `checkin_mensal.py` tem a função `custo_base_brl_ponderado()` mas sem consolidação por bucket.

**~~8. Pesos internos de equity divergem entre planilha e codebase~~ — FALSO POSITIVO**
Confirmado por Diego: os 43/26/17 na aba Evolução são pesos do portfolio total (incluindo RF). Os pesos equity 50/30/20 estão corretos mais abaixo na planilha. Sem divergência real.

**9. Renda+ 2065 taxa diverge: 6,93% (planilha) vs 7,08% (carteira.md)**
Diferença de 15 bps. O gatilho de venda (taxa ≤ 6,0%) está distante em ambos os casos, mas para cálculos de all-in e comparação com equity, a taxa usada no `checkin_mensal.py` (IPCA_PLUS_TAXA_ANUAL = 7.16%) também diverge.

**~~10. Análise de negócio (EBITDA R$ 11.714, valor R$ 2.163.000) existe só na planilha~~ — FALSO POSITIVO**
Confirmado por Diego: não é valor do negócio. Auditoria interpretou dados incorretamente. Descartado.

---

### Ações Priorizadas

| # | Ação | Impacto | Esforço | Dono |
|---|------|---------|---------|------|
| A1 | Atualizar pesos equity em `checkin_mensal.py` (PESOS_TARGET) e `backtest_portfolio.py` para SWRD 50%/AVGS 30%/AVEM 20% sem JPGL | ALTO — cálculos de shadow incorretos | 30min | Bookkeeper |
| A2 | Atualizar `shadow-portfolio.md` Target com nova alocação 50/30/20 | ALTO — performance comparison errada | 15min | Bookkeeper |
| A3 | Atualizar `holdings.md` com posições atuais (planilha 07/04/26) | ALTO — reconciliação incorreta | 1h | Bookkeeper |
| A4 | Adicionar ao `historico_carteira.csv` os pontos: 01/03/2021 e 15/12/2025 da planilha | MÉDIO — habilita CAGR histórico | 15min | Bookkeeper |
| A5 | Sincronizar aporte mensal: R$ 25k ou R$ 28k? Definir e propagar em todos os arquivos | MÉDIO — premissas MC inconsistentes | 10min | Head + Diego |
| A6 | Atualizar `carteira.md` com patrimônio atual R$ 3.511.554 | MÉDIO — fonte de verdade defasada | 15min | Bookkeeper |
| A7 | Corrigir pesos na aba Evolução da planilha (cenário B: 43/26/17 → 50/30/20) | MÉDIO — planilha diverge da estratégia aprovada | 30min | Diego |
| A8 | Implementar custo base BRL por bucket consolidado em `checkin_mensal.py` | MÉDIO — base para TLH e IR futuro | 2h | Bookkeeper |
| A9 | Implementar TWR acumulado desde 2021 no output do checkin | BAIXO-MÉDIO — visibilidade histórica | 4h | Bookkeeper |
| A10 | Investigar e registrar análise de negócio: valor R$ 2.163.000 é real e recente? | BAIXO | 30min | Head + Diego |

---

*Relatório gerado em: 2026-04-07 — Auditoria completa: 3 abas da planilha + 11 scripts Python + 5 arquivos de contexto/dados*
