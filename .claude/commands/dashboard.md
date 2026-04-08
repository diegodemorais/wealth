# Dashboard — Gerar HTML da Carteira

Gera `analysis/dashboard.html` — dashboard visual single-file com Chart.js. Abre no browser.

## Fluxo

### 1. Coletar dados do codebase
- Ler `analysis/backtest_output/ibkr_lotes.json` — quantidades e custo base por ETF
- Ler `dados/historico_carteira.csv` — série histórica patrimônio (CAGR + timeline)
- Ler `agentes/metricas/scorecard.md` — P(FIRE), shadows, TER
- Ler `agentes/metricas/shadow-portfolio.md` — retornos shadows Q1
- Ler `dados/holdings.md` — RF e crypto (IPCA+ 2029/2040, Renda+ 2065, HODL11)

### 2. Coletar dados da web (WebSearch)
- **Preços atuais** dos ETFs: SWRD.L, AVGS.L, AVEM.L, AVUV, AVDV, USSC.L, EIMI.L, AVES, DGS
- **Câmbio** USD/BRL atual
- **HODL11** cotação atual
- **PTAX semanal** últimos 3 meses (para Bollinger Bands) — ~15 pontos
- **Variação semanal** dos ETFs (última semana)

### 3. Computar métricas
Para cada ETF: `valor_usd = qty × preço_atual`, `ganho% = preço / avg_cost - 1`

Buckets (agregar transitórios):
- SWRD bucket: SWRD
- AVGS bucket: AVGS + AVUV + AVDV + USSC
- AVEM bucket: AVEM + EIMI + AVES + DGS

Breakdown geográfico (equity):
- EUA: SWRD×67% + AVUV×100% + USSC×100% + AVGS×50%
- Desenv. ex-EUA: SWRD×33% + AVDV×100% + AVGS×50%
- Emergentes: EIMI + AVES + DGS + AVEM

Targets (% portfolio total): SWRD 39.5%, AVGS 23.7%, AVEM 15.8%

### 4. Gerar HTML
Usar o template em `analysis/dashboard.html` como base. Atualizar TODOS os dados inline:
- KPI cards (patrimônio, P(FIRE), CAGR, delta A)
- Timeline patrimônio (array do CSV)
- Donut alocação + geográfico
- P(FIRE) + tornado sensibilidade
- Delta vs meta + progress bars
- Glide path stacked area
- FIRE buckets
- Tabela posições (com var semanal)
- Calculadora de aporte (preços atuais nos defaults JS)
- Shadows
- Bollinger Bands (PTAX semanal)
- TLH monitor
- RF cards

Salvar em `analysis/dashboard.html`. Não commitar automaticamente — Diego decide.

### 5. Output
```
Dashboard atualizado: analysis/dashboard.html
Patrimônio: R$ X.XXXk | Equity: $XXXk | Câmbio: R$ X.XX
P(FIRE): XX.X% | CAGR: XX.X% | Delta A: +X.Xpp
```

## Checklist de Qualidade (review 2026-04-08)

Antes de entregar, verificar:

- [ ] **CAGR ≠ TWR**: label deve dizer "Cresc. Patrimonial" (inclui aportes), não "CAGR". TWR separado (~8%)
- [ ] **Glide path soma 100%** em cada ano. Pós-FIRE = rising equity (Pfau-Kitces), não declinante
- [ ] **Shadow C presente** na tabela de shadows (79% VWRA + IPCA+ + crypto)
- [ ] **IPCA+ longo no delta bar** — maior gap (-14.1pp), não pode estar invisível
- [ ] **KPIs FIRE**: anos p/ FIRE, progresso % do gatilho, SWR implícita
- [ ] **Timestamps por seção** — alertar dados > 7 dias
- [ ] **Tornado disclaimer**: se estimativa manual, marcar "⚠️ Estimativa"
- [ ] **Bollinger**: label MA5 (não MA20)
- [ ] **Timeline**: todos os meses presentes (sem gaps jan/fev)

## Notas
- Se WebSearch falhar para algum preço, usar último valor conhecido do HTML anterior
- Bollinger: MA de 5 períodos (janela curta por ter poucos pontos) ± 2σ
- Tornado: usar estimativas do scorecard (não rodar MC — leva minutos). Marcar como estimativa.
- Dados de RF (IPCA+, Renda+): manter valores do holdings.md até próximo checkin
- Dark theme, responsivo mobile, Chart.js CDN
- Retorno patrimonial NUNCA apresentar como retorno de investimento sem disclaimer
