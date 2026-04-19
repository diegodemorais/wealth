# DEV-discovery-tab: Aba Discovery — Novos Componentes + Órfãos

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-discovery-tab |
| **Dono** | Dev |
| **Status** | Doing |
| **Prioridade** | Média |
| **Participantes** | Factor, RF, FIRE, Tax, Risco, Macro, FX, Bookkeeper, Advocate, Head |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-19 |
| **Origem** | Conversa — Diego solicitou aba temporária de descoberta |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego pediu uma aba temporária chamada "Discovery" no dashboard com dois objetivos:
1. **Novos componentes** sugeridos por cada agente especialista — mockups com dados próximos do real para avaliar valor antes de integrar nas abas permanentes
2. **Componentes órfãos** — componentes que existem no codebase mas não estão sendo usados em nenhuma aba, para reavaliar se vale reintegrar

---

## Descrição

Aba temporária `discovery/` no Next.js com:
- Seção A: "Componentes Sugeridos" — cada agente contribui 1-2 sugestões de visualização ainda não existente, implementadas como mockup com dados reais ou próximos
- Seção B: "Componentes Órfãos" — lista visual dos componentes existentes não importados em nenhuma página

---

## Componentes Órfãos Identificados

Componentes em `src/components/dashboard/` que **não** são importados por nenhuma página:

| Componente | Descrição provável | Status |
|------------|-------------------|--------|
| AlphaVsSWRDChart | Alpha vs SWRD benchmark | Órfão |
| AttributionAnalysis | Atribuição de retorno | Órfão |
| BondMaturityLadder | Escada de vencimentos RF | Órfão |
| BondPoolComposition | Composição do bond pool | Órfão |
| BondPoolRunway | Runway do bond pool | Órfão |
| CryptoBandChart | Bandas BTC/HODL11 | Órfão |
| DCAStatusGrid | Grid DCA status | Órfão |
| DrawdownHistoryChart | Histórico de drawdowns | Órfão |
| EtfsPositionsTable | Tabela de posições ETFs | Órfão |
| FactorLoadingsTable | Factor loadings | Órfão |
| FamilyScenarioCards | Cards de cenários familiares | Órfão |
| FinancialWellnessActions | Ações de wellness | Órfão |
| FireSimulator | Simulador FIRE | Órfão |
| GeographicExposureChart | Exposição geográfica | Órfão |
| GlidePath | Glide path lifecycle | Órfão |
| IpcaTaxaProgress | Progresso taxa IPCA+ | Órfão |
| LifeEventsTable | Tabela life events | Órfão |
| RebalancingStatus | Status de rebalanceamento | Órfão |
| RollingMetricsChart | Métricas rolling | Órfão |
| ScenarioCompare | Comparação cenários | Órfão |
| SemaforoTriggers | Semáforo triggers | Órfão |
| SpendingBreakdown | Breakdown de gastos | Órfão |
| StatusDot | Dot indicador status | Órfão |
| TrackingFireChart | Tracking FIRE progress | Órfão |

---

## Sugestões dos Agentes

### Factor
1. **FactorDroughtMonitor** — tracking de meses consecutivos de underperformance fatorial vs benchmark. Gatilho: 5 anos consecutivos. Dados: `factor_rolling`, `backtest`.
2. **FactorPremiumScorecard** — tabela com 4 fatores (Market, HML, SMB, RMW) × 3 períodos (post-2000/2010/2015) + retorno anualizado + IC 90% + haircut 58% aplicado. Compara premissa da carteira vs realizado. Dados: `factor_loadings`, `factor_rolling`.

### RF
1. **RealYieldGauge** — para cada título (IPCA+2029/2040/2050, Renda+2065): taxa nominal, IPCA esperado, yield real pós-IR (15%), carry vs Selic real. Gauge com zonas (<6%, 6-7.5%, >7.5%). Dados: `rf.*`, `macro.selic_meta`, `macro.ipca_12m`.
2. **Reativar BondMaturityLadder** — escada de vencimentos com valor atual + meses de gastos cobertos por posição. Mostra estrutura de liquidez sequencial do portfolio RF.

### FIRE
1. **SequenceOfReturnsHeatmap** — mapa de calor 2D: ano de FIRE (X: 2035-2040) × retorno do ano-1 pós-FIRE (Y: -30% a +20%). Células mostram P(FIRE) resultante. Dados: `fire_swr_percentis`, `fire_trilha`.
2. **Reativar SpendingBreakdown como FIRE Cashflow Planner** — R$250k/ano decompostos em lifestyle/saúde/INSS-offset ao longo do tempo, com spending smile sobreposto e marcador do salto ANS (58→59 anos). Dados: `spending_breakdown`, `spendingSmile`.

### Tax
1. **TaxDeferralClock** — por ETF: barra empilhada (base de custo vs ganho latente vs IR embutido 15%). "Dias diferidos" desde a primeira compra. Torna visível o empréstimo gratuito do governo. Dados: `tax.ir_diferido`, `tax.custo_medio_brl`, `tax.ganho_latente`.
2. **TLHOpportunityRadar** — lotes com P&L negativo ou próximo de break-even, cruzados com benefício fiscal potencial (perda × 15%). Badge: "TLH Disponível" / "Próximo Break-even" / "Lucro — aguardar". Dados: `tlh`, `tlhGatilho`, `posicoes`.

### Risco
1. **Reativar DrawdownHistoryChart com Recovery Timeline** — eventos históricos: peak, trough, drawdown %, dias ao trough, dias à recuperação total. Linha de referência com recovery médio histórico. Dados: `drawdown_history` + adicionar `recovery_days`.
2. **PortfolioRiskMonitor** — exposição geográfica por ETF (EUA/Europa/EM), concentração efetiva (% em EUA ~65%+), volatilidade implícita do portfolio pelos pesos × vol histórica. Dados: `etf_composition`.

### Macro
1. **CurvaJurosReaisBR** — yield curve IPCA+ por vencimento (2029/2040/2050/2065) em eixo temporal. Zonas: vermelho (<6%), amarelo (6-6.5%), verde (>6.5%). Sinaliza onde o prêmio de risco está concentrado. Dados em tempo real necessários (Tesouro Direto / Investidor10). Mockup usa taxas atuais do `rf.*`.
2. **CarryDifferentialMonitor** — spread Selic vs Fed Funds (atual + 3 snapshots mensais) + BRL/USD vs MM6M. Badge de alerta se spread comprimir >200bps ou BRL depreciar >5%/30d. Dados: `macro.selic_meta`, `macro.spread_selic_ff`, `macro.cambio`.

### FX
1. **BRLPurchasingPowerTimeline** — projeção do portfolio em BRL real (poder de compra 2026) em 3 cenários de depreciação BRL. Overlay: linha de meta FIRE (R$250k/ano capitalizado com IPCA 4%). Mostra o asset-liability mismatch temporal. Dados: `macro.depreciacao_brl_premissa`, `posicoes`, premissas FIRE.
2. **FXCostDragAcumulado** — custo total de conversão BRL→USD (acumulação 14 anos) + USD→BRL (desacumulação): IOF 1.1% + spread Okegen 0.25% + ganho fantasma cambial IR 15%. Em R$ absolutos acumulados. Dados: aporte R$25k/mês, taxas já no pipeline.

### Bookkeeper
1. **ExecutionDashboard** — decisões aprovadas + prazo + tranches completadas/alvo + status (aguardando aporte vs independente de caixa). Alertas: atrasado >30d (vermelho), prazo <7d (amarelo). Reativa: `RebalancingStatus`.
2. **DriftMonitor expandido** — peso atual/alvo/drift para cada bucket, com ação sugerida ("Próximo aporte → SWRD prioritário"). Reativa: `EtfsPositionsTable` estendido.

### Advocate (pontos cegos críticos)
1. **PatrimonioLiquidoIR** — patrimônio bruto menos IR latente (R$133k) = patrimônio real disponível no FIRE Day. Hoje o P(FIRE) roda sobre patrimônio bruto, distorcendo a análise. Dados: `tax.ir_diferido`, `patrimonio_holistico`.
2. **CorrelacaoBrasilStress** — mapa de correlação soberana: em stress fiscal BR, quais ativos falham juntos (Tesouro IPCA+, Renda+, reserva, câmbio)? `concentracao_brasil` (5.9%) existe nos dados mas não é exibido em nenhuma aba.

---

## Escopo

- [x] Criar issue
- [x] Identificar componentes órfãos
- [ ] Coletar sugestões de todos os agentes especialistas
- [ ] Priorizar sugestões com Head
- [ ] Dev implementar mockups dos novos componentes
- [ ] Dev montar aba Discovery com seção A (novos) + seção B (órfãos)
- [ ] Build passando suite de testes
- [ ] Deploy

---

## Conclusão

*(a preencher)*

---

## Resultado

*(a preencher)*
