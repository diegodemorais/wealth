# Dashboard HTML — Mapa de Dados, Apresentações e Roadmap
> Data: 2026-04-07
> Origem: HD-carteiraviva-audit → re-análise focada em viabilidade HTML

---

## 1. MAPA DE DADOS (por aba da planilha)

### Aba `Utils`

| # | Dado / Métrica | Tipo | Fonte codebase | Status |
|---|---------------|------|---------------|--------|
| U1 | Posições por ETF (qtde, valor USD) | Externo (IBKR) | `ibkr_sync.py` → snapshot JSON | ✅ |
| U2 | Ganho % por ETF (sobre custo USD) | Calculado | `ibkr_lotes.json` + yfinance | ✅ |
| U3 | Pesos atuais (% portfolio) | Calculado | `ibkr_sync.py`, `checkin_mensal.py` | ✅ |
| U4 | Pesos alvo (meta %) | Config | `checkin_mensal.py` PESOS_TARGET | ✅ |
| U5 | Delta vs meta (%) | Calculado | `portfolio_analytics.py`, `ibkr_sync.py` | ✅ |
| U6 | Breakdown geográfico G1 (Neutro/Fatorial) | Calculado | ❌ ausente | ❌ |
| U7 | Breakdown geográfico G2 (Desenv/EM) | Calculado | ❌ ausente | ❌ |
| U8 | Breakdown geográfico G3 (EUA/Ex-EUA) | Calculado | ❌ ausente | ❌ |
| U9 | Preço médio por ETF (USD) | Externo (IBKR) | `ibkr_lotes.json` (custo por lote) | ✅ |
| U10 | Câmbio BRL/USD atual | Externo (BCB) | `fx_utils.py`, python-bcb, yfinance | ✅ |
| U11 | Aporte mensal configurado | Config | `carteira.md` (R$ 25k) | ✅ |
| U12 | IOF + spread de remessa | Config | `carteira.md` (0.25% + 1.1%) | ✅ |
| U13 | Contribution USD (aporte líquido) | Calculado | `portfolio_analytics.py` otimizador | ✅ |
| U14 | Custo base BRL por bucket | Calculado | `checkin_mensal.py --custo-base` (novo) | ✅ |
| U15 | Ganho % sobre custo BRL por bucket | Calculado | `checkin_mensal.py --custo-base` (novo) | ✅ |
| U16 | Calculadora de PM (preço médio) | Input+Calc | `ibkr_lotes.json` (estático) | ⚠️ sem interatividade |
| U17 | Calculadora de cotas (saldo → qtde) | Input+Calc | ❌ ausente (trivial: valor/preço) | ❌ |
| U18 | Objetivos FIRE (var/fixo/reserva/risco) | Calculado | `fire_montecarlo.py` (parcial) | ⚠️ sem breakdown por bucket |
| U19 | Nomes completos dos ETFs | Referência | ❌ ausente (dados estáticos) | ❌ |
| U20 | Backtest URL Curvo.eu | Calculado | ❌ ausente | ❌ |
| U21 | COE S&P500 valor | Input manual | ❌ não rastreado (ativo legado) | ❌ |
| U22 | Empréstimo XP saldo | Input manual | ❌ não rastreado | ❌ |

### Aba `Aporte`

| # | Dado / Métrica | Tipo | Fonte codebase | Status |
|---|---------------|------|---------------|--------|
| A1 | Data início carteira (01/03/2021) | Config | `historico_carteira.csv` | ✅ |
| A2 | Patrimônio inicial (R$ 1.111.699) | Histórico | `historico_carteira.csv` | ✅ |
| A3 | Patrimônio atual | Calculado | `ibkr_sync.py`, `carteira.md` | ✅ |
| A4 | Retorno anualizado (CAGR) | Calculado | `checkin_mensal.py calcular_cagr_historico()` (novo) | ✅ |
| A5 | Retorno mensal | Calculado | `checkin_mensal.py` Método Dietz | ✅ |
| A6 | Breakdown RF / Crypto / Equity (R$ e %) | Calculado | ❌ breakdown simplificado | ⚠️ |
| A7 | Aporte sugerido + destino por prioridade | Calculado | `portfolio_analytics.py --aporte` | ✅ |
| A8 | Bollinger Bands câmbio (janela 30, mult 2) | Calculado | ❌ ausente | ❌ |
| A9 | Variação semanal por ETF | Externo | ❌ só mensal (yfinance pode dar semanal) | ❌ |
| A10 | Variação mensal por ETF | Externo | `checkin_mensal.py` via yfinance | ✅ |
| A11 | Flag "Comprar?" por ETF | Calculado | `portfolio_analytics.py` (drift → decisão) | ✅ |
| A12 | Histórico de vendas com PM ajustado | Externo (IBKR) | `ibkr_lotes.json` + `ibkr_realized_pnl.json` | ⚠️ parcial |
| A13 | TLH analysis (ganho/perda por lote) | Calculado | `checkin_mensal.py --tlh`, `tlh_monitor.py` | ✅ |
| A14 | Taxa IPCA+ 2040 atual | Externo (TD) | WebFetch Tesouro Direto | ✅ |
| A15 | Taxa Renda+ 2065 atual | Externo (TD) | WebFetch Tesouro Direto | ✅ |
| A16 | USDBRL variação semanal/mensal | Externo | `fx_utils.py` (mensal), yfinance | ⚠️ só mensal |
| A17 | BTCUSD variação semanal/mensal | Externo | yfinance | ⚠️ só mensal |

### Aba `Evolução`

| # | Dado / Métrica | Tipo | Fonte codebase | Status |
|---|---------------|------|---------------|--------|
| E1 | Tabela master de ativos (valor, %, target, delta) | Calculado | `holdings.md`, `ibkr_sync.py` | ✅ |
| E2 | Composição de cada grupo (quais ETFs) | Config | `checkin_mensal.py` BUCKET_MAPEAMENTO | ✅ |
| E3 | Retorno anualizado por grupo | Calculado | `backtest_fatorial.py`, `factor_regression.py` | ✅ |
| E4 | Glide path — alocação alvo por ano (0–45) | Calculado | `fire_glide_path_scenarios.py` (3 cenários) | ⚠️ parcial (3 cenários, não 6; sem tabela granular ano-a-ano) |
| E5 | Cenários A/B/C/D/E/F com toggle | Config | ❌ ausente (só A/B/C no script) | ❌ |
| E6 | Links para páginas dos ETFs | Referência | ❌ dados estáticos ausentes | ❌ |
| E7 | Watchlist (EMMV, MVOL, HYLA, etc.) | Config | ❌ sem tabela persistente | ❌ |
| E8 | Delta vs meta BRL (R$ e %) | Calculado | `ibkr_sync.py`, `portfolio_analytics.py` | ✅ |

---

## 2. MAPA DE APRESENTAÇÕES VISUAIS (por aba da planilha)

### Aba `Utils`

| # | Elemento Visual | O que mostra | Equivalente codebase | Viab. HTML | Lib sugerida |
|---|----------------|-------------|---------------------|-----------|-------------|
| V-U1 | **KPI cards** (patrimônio total, equity, RF, crypto) | Resumo top-level | stdout `checkin_mensal.py` | Simples | HTML/CSS cards |
| V-U2 | **Tabela posições** com ganho%, meta%, delta, cotas | Portfolio completo por ETF | stdout `ibkr_sync.py` | Simples | Tabela HTML sortable |
| V-U3 | **Formatação condicional** (verde/vermelho) em delta | Over/underweight visual | ❌ | Simples | CSS classes |
| V-U4 | **Breakdown geográfico** hierárquico (G1→G2→G3) | Treemap ou sunburst de exposição | ❌ | Médio | Chart.js treemap ou Plotly sunburst |
| V-U5 | **Donut chart** FIRE buckets (var/fixo/reserva/risco) | Composição por objetivo | ❌ | Simples | Chart.js doughnut |
| V-U6 | **Calculadora PM** (input → resultado) | Simula preço médio pós-compra | ❌ (estático em ibkr_lotes) | Médio | Form HTML + JS |
| V-U7 | **Calculadora cotas** (saldo → qtde) | Quantas cotas comprar | ❌ | Simples | Form HTML + JS |
| V-U8 | **Tabela custo base BRL** por bucket | Custo vs valor vs ganho% | `--custo-base` (novo, stdout) | Simples | Tabela HTML |
| V-U9 | **Barra progresso** meta vs atual por bucket | Gap visual | ❌ | Simples | Progress bar CSS |

### Aba `Aporte`

| # | Elemento Visual | O que mostra | Equivalente codebase | Viab. HTML | Lib sugerida |
|---|----------------|-------------|---------------------|-----------|-------------|
| V-A1 | **Timeline** patrimônio (2021 → hoje) | Evolução patrimonial | `historico_carteira.csv` (4 pontos) | Médio | Chart.js line |
| V-A2 | **KPIs** retorno (CAGR, acumulado, mensal) | Performance summary | `calcular_cagr_historico()` (novo) | Simples | HTML cards |
| V-A3 | **Tabela aporte** com var semanal/mensal + flag | Decisão de aporte por ETF | `portfolio_analytics.py --aporte` | Simples | Tabela HTML |
| V-A4 | **Bollinger Bands** chart (câmbio BRL/USD) | Timing de remessa FX | ❌ | Médio | Chart.js line + fill |
| V-A5 | **Tabela TLH** com semáforo ganho/perda | Oportunidades de TLH | `tlh_monitor.py` | Simples | Tabela HTML |
| V-A6 | **Cards** taxas RF (IPCA+, Renda+, Selic) | Snapshot renda fixa | WebFetch | Simples | HTML cards |
| V-A7 | **Tabela prioridade** de compra (1º/2º/3º) | Ordem de alocação | `portfolio_analytics.py --aporte` | Simples | Tabela HTML ordered |

### Aba `Evolução`

| # | Elemento Visual | O que mostra | Equivalente codebase | Viab. HTML | Lib sugerida |
|---|----------------|-------------|---------------------|-----------|-------------|
| V-E1 | **Stacked area chart** glide path (% por ano) | Alocação projetada 0–45 anos | `fire_glide_path_scenarios.py` (parcial) | Médio | Chart.js stacked area |
| V-E2 | **Tabela master** ativos com delta BRL | Todas posições + gap | `holdings.md` + `ibkr_sync.py` | Simples | Tabela HTML |
| V-E3 | **Toggle** cenários (A/B/C/...) com atualização chart | Comparação de glide paths | ❌ | Complexo | JS toggle + Chart.js update |
| V-E4 | **Bar chart** delta vs meta por ativo | Over/underweight visual | `ibkr_sync.py` | Simples | Chart.js horizontal bar |

### Extras (não na planilha, mas superiores)

| # | Elemento Visual | O que mostra | Fonte | Viab. HTML | Lib sugerida |
|---|----------------|-------------|-------|-----------|-------------|
| V-X1 | **Gauge** P(FIRE) com 3 cenários | Probabilidade FIRE | `fire_montecarlo.py` | Médio | Chart.js gauge / custom SVG |
| V-X2 | **Tearsheet** QuantStats (já existe como HTML) | Performance completa vs benchmark | `portfolio_analytics.py --html` | ✅ já existe | QuantStats |
| V-X3 | **Shadow portfolios** comparativo (4 colunas) | Atual vs Target vs A vs B vs C | `checkin_mensal.py` | Simples | Tabela HTML |
| V-X4 | **Factor regression** rolling loadings chart | Exposição a fatores ao longo do tempo | `factor_regression.py --rolling` | Complexo | Plotly multi-line |
| V-X5 | **Fronteira eficiente** scatter | Risco/retorno com carteira plotada | `portfolio_analytics.py --fronteira` | Complexo | Plotly scatter |
| V-X6 | **Tornado chart** sensibilidade P(FIRE) | Quais premissas mais impactam | `fire_montecarlo.py --tornado` | Médio | Chart.js horizontal bar |
| V-X7 | **Câmbio PTAX** histórico + decomposição | BRL/USD e impacto na carteira | `fx_utils.py --history --decompose` | Médio | Chart.js line |

---

## 3. GAP ANALYSIS + PLANO HTML

### 3.1 Dados faltantes antes do HTML

| Gap | Esforço | Impacto no dashboard | Prioridade |
|-----|---------|---------------------|-----------|
| Breakdown geográfico G1/G2/G3 (U6-U8) | 2h — mapeamento estático ETF→região | Treemap/sunburst de exposição | Nice-to-have |
| Variação semanal por ETF (A9) | 30min — yfinance já dá `period="5d"` | Coluna extra na tabela de aporte | Nice-to-have |
| Bollinger Bands câmbio (A8) | 2h — `fx_utils.py` + PTAX série 90d | Chart de timing FX | Nice-to-have |
| Glide path granular ano-a-ano (E4-E5) | 3h — expandir `fire_glide_path_scenarios.py` | Stacked area chart | Nice-to-have |
| Nomes completos + links ETFs (U19, E6) | 30min — JSON estático | Tooltip/link na tabela | Nice-to-have |
| Watchlist (E7) | 1h — `dados/watchlist.json` | Seção menor no dashboard | Nice-to-have |
| **posicoes_snapshot.json** (U1-U5 consolidado) | 1h — output JSON de `ibkr_sync.py` | **Fonte primária de dados para o HTML** | **MVP** |

> **Conclusão: nenhum gap bloqueia o MVP.** Todos os dados críticos existem. Os gaps são enriquecimentos.

### 3.2 Estrutura do HTML Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Carteira Diego — R$ 3.51M — 07/Abr/2026           │
│  [Atualizar] [Câmbio: R$ 5.15]  [CAGR: 25.3% a.a.]        │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  SEÇÃO 1: OVERVIEW   │  SEÇÃO 2: ALOCAÇÃO                  │
│  ┌────┐ ┌────┐      │  ┌──────────────────────────────┐    │
│  │ Pat│ │FIRE│      │  │  Donut: Equity/RF/Crypto     │    │
│  │ BRL│ │ %  │      │  │  + Treemap geográfico        │    │
│  └────┘ └────┘      │  └──────────────────────────────┘    │
│  ┌────┐ ┌────┐      │  ┌──────────────────────────────┐    │
│  │CAGR│ │Δ A │      │  │  Bar: Delta vs Meta          │    │
│  │    │ │    │      │  │  (over/underweight)           │    │
│  └────┘ └────┘      │  └──────────────────────────────┘    │
│                      │                                      │
├──────────────────────┴──────────────────────────────────────┤
│                                                             │
│  SEÇÃO 3: POSIÇÕES                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Tabela: ETF | Qtde | Valor | % | Meta | Delta |    │    │
│  │            Ganho% | Custo BRL | Bucket              │    │
│  │ [Formatação condicional: verde=alvo, vermelho=gap]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SEÇÃO 4: SHADOWS + PERFORMANCE                             │
│  ┌────────────────────────┐ ┌──────────────────────────┐   │
│  │ Tabela: Shadow A/B/C   │ │ Line: Patrimônio vs      │   │
│  │ retorno, pat, delta    │ │ Shadows (timeline)        │   │
│  └────────────────────────┘ └──────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SEÇÃO 5: FIRE                                              │
│  ┌──────────────┐ ┌────────────────────────────────────┐   │
│  │ Gauge P(FIRE) │ │ Stacked area: Glide path 0-45     │   │
│  │ 90.4% base   │ │ anos (equity → bond tent)          │   │
│  │ 94.1% fav    │ │                                    │   │
│  │ 86.8% stress │ │                                    │   │
│  └──────────────┘ └────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SEÇÃO 6: APORTE DO MÊS                                    │
│  ┌────────────────────────────────────────────┐             │
│  │ Prioridade: 1º SWRD | 2º IPCA+ | 3º ...   │             │
│  │ Calculadora: [R$ ___] → [X cotas de SWRD]  │             │
│  │ Taxas RF: IPCA+ 7.20% | Renda+ 6.93%      │             │
│  └────────────────────────────────────────────┘             │
│  ┌────────────────────────────────────────────┐             │
│  │ Chart: Bollinger Bands BRL/USD (timing FX) │             │
│  └────────────────────────────────────────────┘             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SEÇÃO 7: TLH MONITOR                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Tabela: Transitórios | PM | Preço | Ganho | Ação    │    │
│  │ [Semáforo: verde=lucro, vermelho=oportunidade TLH]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Seções detalhadas — fonte + componente + prioridade

| Seção | Componente Visual | Fonte de Dados | Lib | Prioridade |
|-------|------------------|---------------|-----|-----------|
| **1. Overview** | 4 KPI cards (Pat BRL, P(FIRE), CAGR, Delta A) | `ibkr_sync.py` snapshot + `calcular_cagr_historico()` + `scorecard.md` | HTML/CSS | **MVP** |
| **2. Alocação — Donut** | Donut chart (Equity/RF/Crypto/Renda+) | Posições agrupadas por classe | Chart.js doughnut | **MVP** |
| **2. Alocação — Delta bar** | Horizontal bar (delta vs meta por bucket) | PESOS_TARGET vs posições atuais | Chart.js bar | **MVP** |
| **3. Posições — Tabela** | Tabela sortable com cond. formatting | `ibkr_sync.py` + `ibkr_lotes.json` | HTML table + CSS | **MVP** |
| **3. Posições — Custo BRL** | Sub-tabela custo base por bucket | `custo_base_brl_por_bucket()` | HTML table | **MVP** |
| **4. Shadows — Tabela** | 5 colunas (Atual/Target/A/B/C) | `shadow-portfolio.md` | HTML table | **MVP** |
| **4. Shadows — Timeline** | Line chart patrimônio ao longo do tempo | `historico_carteira.csv` + shadows | Chart.js line | Nice-to-have (precisa mais dados) |
| **5. FIRE — Gauge** | Gauge com 3 cenários (base/fav/stress) | `fire_montecarlo.py` output | Chart.js gauge custom | **MVP** |
| **5. FIRE — Glide path** | Stacked area 0-45 anos | `fire_glide_path_scenarios.py` | Chart.js stacked area | Nice-to-have |
| **6. Aporte — Prioridade** | Cards com ordem + valor | `portfolio_analytics.py --aporte` | HTML cards | **MVP** |
| **6. Aporte — Calculadora** | Form: R$ → cotas por ETF | yfinance preço + câmbio | HTML form + JS | **MVP** |
| **6. Aporte — Bollinger** | Line chart com bandas | PTAX BCB 90d | Chart.js line + fill | Nice-to-have |
| **6. Aporte — Taxas RF** | Cards (IPCA+, Renda+, Selic) | WebFetch TD + BCB | HTML cards | **MVP** |
| **7. TLH — Tabela** | Tabela com semáforo | `tlh_monitor.py` | HTML table + CSS | **MVP** |

### 3.4 Stack técnico recomendado

**Para MVP (single-file, rápido):**
- **1 arquivo HTML** com Chart.js CDN + CSS inline
- Dados injetados como `<script>const DATA = {...}</script>` no topo
- Script Python gera o HTML com dados atuais: `python3 scripts/dashboard.py > analysis/dashboard.html`
- Zero dependência de servidor — abrir no browser

**Evolução futura (se necessário):**
- FastAPI backend servindo JSON
- Frontend React/Next.js
- Refresh automático via IBKR sync cron

### 3.5 Veredito: Planilha vs HTML

| Aspecto | Planilha | HTML Dashboard |
|---------|---------|---------------|
| Dados ao vivo | ✅ Google Finance/Sheets | ✅ yfinance + BCB + IBKR |
| Interatividade | ⚠️ edição manual | ✅ calculadoras JS |
| Visualizações | ⚠️ limitadas (Sheets charts) | ✅ Chart.js/Plotly (superior) |
| P(FIRE) | ❌ não existe | ✅ gauge + tornado |
| Shadows | ❌ não existe | ✅ tabela + timeline |
| Factor analysis | ❌ não existe | ✅ regression + loadings |
| TLH monitor | ⚠️ básico | ✅ automático com alertas |
| Portabilidade | ⚠️ Google-dependent | ✅ local, versionado em git |
| Atualização | Manual | `python3 scripts/dashboard.py` |

**O HTML dashboard seria estritamente superior à planilha em todos os aspectos, exceto edição ad-hoc (que passa para carteira.md).**

---

## 4. ROADMAP DE IMPLEMENTAÇÃO

### Fase 1 — MVP (1 script Python → 1 HTML)
1. Criar `scripts/dashboard.py` que:
   - Lê `ibkr_sync.py` snapshot (ou gera ao vivo)
   - Lê `ibkr_lotes.json` para custo base
   - Lê `historico_carteira.csv` para CAGR
   - Lê `shadow-portfolio.md` (parse) ou hardcode
   - Busca preços via yfinance + PTAX via BCB
   - Gera HTML single-file com Chart.js CDN
2. Seções MVP: Overview (4 cards) + Posições (tabela) + Alocação (donut + delta bar) + Aporte (prioridade + calculadora) + TLH (tabela)
3. Output: `analysis/dashboard.html` — abrir no browser

### Fase 2 — FIRE + Shadows
4. Integrar P(FIRE) gauge (rodar MC inline ou ler último resultado)
5. Shadows tabela + timeline chart
6. Glide path stacked area

### Fase 3 — Enriquecimentos
7. Bollinger Bands câmbio
8. Factor regression chart
9. Breakdown geográfico treemap
10. Variação semanal por ETF
11. Watchlist tracker

---

*Roadmap gerado em: 2026-04-07*
