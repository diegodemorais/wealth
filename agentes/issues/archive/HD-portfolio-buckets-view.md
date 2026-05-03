---
ID: HD-portfolio-buckets-view
Titulo: Componente "Ativos vs Target por Bucket" — performance individual ITD (desde 2021)
Dono: Head (orquestra) → Bookkeeper → CIO → Dev → QA + Tester + Quant → CIO
Prioridade: 🟡 Média
Dependências: —
Origem: pedido de Diego (2026-05-03) — visualização que combine alocação (atual vs target) com performance individual de cada ETF/título desde início da série IBKR (abr/2021)
---

## Contexto

Hoje o dashboard tem peças separadas:
- **Composição atual vs target** — `BalancoHolistico`, `EFRebalanceTable`, `OverlapChart`
- **Performance individual** — `AlphaVsSWRDChart` (só AVGS), backtest histórico do portfolio
- **Drift** — `MaxDriftCard`, `DriftMonitor`

Falta uma visão integrada: **por bucket**, mostrar (a) cada ativo, (b) peso atual vs target, (c) performance individual desde 2021 (ITD), (d) indicadores comparativos (vs benchmark do bucket, vol, max DD).

## Buckets esperados

| Bucket | Target | Ativos atuais | Benchmark |
|--------|--------|---------------|-----------|
| Equity DM Core | 50% × 79% = 39.5% | SWRD | MSCI World Net |
| Equity DM Factor | 30% × 79% = 23.7% | AVGS (+ legacy AVUV, AVDV) | MSCI World Small Value |
| Equity EM | 20% × 79% = 15.8% | AVEM (+ legacy EIMI, AVES, DGS) | MSCI EM |
| RF Estrutural | ~16% | Tesouro IPCA+ longo (NTN-Bs longas) | IMA-B 5+ |
| RF Tático | ~5% | Renda+ 2065 | IMA-B 5+ |
| Crypto | ~3% | HODL11 | BTC USD |

(Pesos exatos vêm do `carteira_params.json` / `data.json` no momento da spec.)

## Métricas por ativo (esperadas)

- Ticker / nome curto
- Peso atual (% bucket / % carteira)
- Peso target (se aplicável)
- Drift (atual − target)
- TWR ITD (desde abr/2021) — anualizado
- TWR YTD
- Vol anualizada (mensal × √12)
- Max DD ITD
- Sharpe ITD (vs CDI ou taxa real BRL)
- Δ vs benchmark do bucket (alpha)
- Status (✓ alvo / ↗ overweight / ↘ underweight / 🔄 legacy a migrar)

## Workflow em 5 fases

### Fase 1 — Bookkeeper (provê dados)

Inputs a entregar:
- Lista canônica de **buckets** com pesos target oficiais (de `carteira_params.json`)
- Para cada **ativo**: ticker, ISIN, bucket, peso atual em R$ e %, status (atual/legacy/transitório)
- Caminho/método para obter **TWR ITD individual** por ativo:
  - SWRD/AVGS/AVEM: yfinance + lotes IBKR (já tem em `tlh_lotes.json` e `historico_carteira.csv`)
  - Legacy (EIMI, AVES, DGS, AVUV, AVDV): mesma fonte, validar disponibilidade
  - Tesouro IPCA+ / Renda+: ANBIMA via `pyield`
  - HODL11: B3 via yfinance
- Identificar **gaps de dados** (ativo sem série completa desde 2021 → como tratar?)

Output: documento estruturado com tabela de inputs + decisões de tratamento de gaps.

### Fase 2 — CIO (analisa e especifica)

Com dados do Bookkeeper:
- Definir **UX**: layout (uma seção colapsável por bucket? um único componente vertical?)
- Definir **métricas exibidas** (subset das esperadas — quais são essenciais vs ruído)
- Definir **benchmark por bucket** + cálculo do Δ alpha
- Definir **regras de cor**: drift, alpha, DD (semáforo consistente com resto do dashboard)
- Definir **placement** no dashboard: aba PORTFOLIO? PERFORMANCE? Nova seção?
- Definir **comportamento privacy mode** (R$ → ••••, % visível)
- Especificação técnica para Dev: estrutura de dados em `data.json` (campo novo? deriva de existente?), nomes de componentes, data-testids esperados
- Critérios de aceite mensuráveis

Output: spec markdown completo, pronto pra Dev consumir.

### Fase 3 — Dev (implementa)

- Pipeline Python (se necessário): novo computador em `generate_data.py` que produz `bucket_view[]` no `data.json`
- Componente React: `<BucketAssetsView />` ou nome conforme spec
- Wireamento na aba indicada
- Privacy mode preservado
- data-testids para regression
- Entry no changelog (helper canônico obrigatório)
- Release gate verde antes de push

### Fase 4 — Validação cruzada (QA + Tester + Quant)

- **Tester (perfil 22)**: release gate mecânico (TS, build, vitest, Playwright, sanity, anti-cliff, changelog timestamp)
- **QA (perfil 23)**: exploratory testing
  - Toggle entre buckets funciona?
  - Mobile (Diego usa iPhone — viewport ~390px)
  - Privacy mode em todos os campos
  - Edge cases (ativo legacy zerado, drift extremo, dados ausentes)
- **Quant**: validar todos os números
  - TWR ITD bate com cálculo independente?
  - Δ alpha vs benchmark coerente?
  - Drift = atual − target (assinatura correta)?
  - Sharpe usa taxa real BRL ou CDI? (decisão CIO)
  - Vol anualizada via raiz de 12 (mensal) — não diária

### Fase 5 — CIO valida + Diego aprova

- CIO confere que implementação reflete spec da Fase 2
- Diego decide se aprova permanência no dashboard
- Issue arquivada após aprovação

## Critérios de aceite

- [ ] Fase 1: documento Bookkeeper entregue + revisado
- [ ] Fase 2: spec CIO completa (UX + métricas + placement + edge cases)
- [ ] Fase 3: componente implementado, gate verde, push em main
- [ ] Fase 4: 3 validadores assinam (cada um produz checklist próprio)
- [ ] Fase 5: CIO confirma alinhamento spec ↔ implementação
- [ ] Diego aprova
- [ ] Issue arquivada

## Restrições

- Memória `feedback_data_provenance.md`: dados vêm da fonte primária (yfinance + IBKR + ANBIMA + B3). Não inventar série.
- Memória `feedback_paper_validation_completa.md`: se Quant precisar comparar com paper/factsheet, validar fonte.
- Memória `feedback_dashboard_test_protocol.md`: Playwright obrigatório no gate.
- Memória `feedback_verificacao_visual.md`: Diego remoto, não abrir browser local.
- Memória `feedback_privacy_transformar.md`: privacy mascara, não esconde.
- Memória `feedback_premissa_rentabilidade.md`: nunca usar "não precisa de rentabilidade adicional" como argumento numa decisão derivada deste componente.
- Não duplicar visualizações já existentes — se houver overlap forte com `BalancoHolistico` ou `OverlapChart`, CIO decide: consolidar ou diferenciar.

## Conclusão

> A preencher após Fase 5 (CIO valida + Diego aprova).
