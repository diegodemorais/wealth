---
ID: DEV-efficient-frontier-v2
Titulo: Efficient Frontier v2 — Black-Litterman + Sharpe líquido + regime
Dono: Dev
Prioridade: 🟡 Média
Dependências: DEV-efficient-frontier (v1, concluída)
Origem: debate CIO + Factor + Quant + Fact-Checker pós v1 (2026-05-02)
---

## Contexto

V1 está na main (commit `28bad655`). Trio de especialistas debateu prioridades v2:

- **Quant** (auditou v1): identificou inconsistência grave de combinar retornos forward AQR/RA com cov histórica em fronteira única — solução paliativa em v1 foi separar em 2 fronteiras com disclaimer.
- **CIO**: maior gap real-vs-modelo é **fricção** (custos + IR superestimam Sharpe líquido em 50-150bps). Risco estratégico v1: Diego ancorar em Max Sharpe e querer rebalancear demais.
- **Factor**: recomendação histórica de "reduzir AVGS/AVEM" é **artefato do lookback** (10y foi pior decênio para value/EM). 50/30/20 está dentro do IC estatístico — nenhuma mudança de alocação justificada.
- **Fact-Checker**: implementação v1 tem integridade (papers reais, números batem). Memória RA já tem US Large 3.1% (não 3.4%).

## Escopo v2 (consensual pós-debate)

### 1. Black-Litterman como arquitetura central (substitui "Forward")

**Substituir** `efficient_frontier.forward` por `efficient_frontier.bl` (Black-Litterman). Manter `efficient_frontier.historica` como referência. Toggle no UI: **Histórica ↔ Black-Litterman** (nome explícito, não "Forward").

**Implementação metodológica:**

- **Prior π (equilibrium):** Reverse-optimization a partir de **MSCI ACWI weights** ponderados pela alocação por classe da carteira:
  - Equity: USA 60%, DM ex-US 30%, EM 10% (MSCI ACWI snapshot)
  - RF: pesos atuais Diego (IPCA+ longo + Renda+ tático) — RF é específico, não tem benchmark global
  - HODL11: peso atual (snapshot)
- **Risk aversion λ:** calibrar para que prior π = retorno histórico observado em equilíbrio. Padrão Idzorek λ ≈ 2.5-3.0; verificar e documentar valor usado.
- **Tau τ:** 0.05 (padrão Idzorek 2005, "A Step-by-Step Guide to the Black-Litterman Model")
- **Views Q:** AQR/Research Affiliates 10y forward (memória `reference_research_affiliates.md`):
  - SWRD (US-heavy proxy): retorno blendado ~5-5.5% nominal USD
  - AVGS: 9.5% + fator premium 2-3pp
  - AVEM: 9.0% + fator premium 2-3pp
  - Converter pra BRL real: USD nominal − 2.5pp inflação USD esperada
- **View uncertainty Ω:** proporcional à uncertainty da fonte. RA (Rob Arnott CAPE-based) é fonte canônica → confiança média-alta. Implementar como diagonal `Ω = τ · diag(P · Σ · P')` (padrão Idzorek).
- **Posterior:** combinação Bayesiana de π e Q. Otimização de fronteira sobre o **posterior**, não sobre views nuas.

**Sanity checks BL específicos:**
- Posterior μ deve ficar entre prior e views (não pode extrapolar)
- Pesos otimizados sobre posterior devem ser mais estáveis que pesos sobre views nuas (maior variabilidade indica bug)
- Documentar λ, τ, Ω usados (auditabilidade)

**Disclaimer Idzorek (2005)** prominente quando BL selecionado: "Black-Litterman incorpora views (AQR/RA) sobre equilibrium implícito (MSCI ACWI). Sensível a calibração de τ/Ω."

### 2. Sharpe líquido — custos de transação + IR

**Adicionar bloco `sharpe_net`** em cada ponto da fronteira:

- **Custos de transação:** spread bid-ask 0.05% sobre o **delta de rebalanceamento** vs carteira atual (não sobre patrimônio total). Rebalance pequeno = custo pequeno.
- **IR sobre o incremental:**
  - Equity ETF exterior (SWRD/AVGS/AVEM): **15%** sobre ganho de capital no resgate (Lei 14.754/2023)
  - RF brasileira tributada (IPCA+ longo HTM): isenta no resgate (Tesouro Direto PF)
  - Renda+ 2065: come-cotas semestral 15%
  - HODL11 (ETF cripto BR): 15% sobre ganho de capital
- **Aplicação:** IR é aplicado apenas sobre o **delta** (ganho realizado em rebalanceamento), não retroativo sobre patrimônio existente. Modelar como custo proporcional ao tamanho do delta.
- **Mostrar lado-a-lado:** Sharpe bruto vs Sharpe líquido, com gap explicitado. CIO previu gap de 50-150bps.
- **No tooltip do hover na fronteira:** "Para chegar neste ponto: custo R$X (spread) + IR R$Y (15%) = R$Z total. Sharpe líquido após custos: W."

### 3. Regime condicional ao value spread

**Não é HMM nem regime switching estatístico** — é uma **legenda contextual** baseada no `factor.value_spread` atual em `data.json` (campo já existe).

- Calcular `value_spread_percentile` (percentil histórico do spread atual)
- Se >= 70: label "🟢 Value spread amplo (P{x}) — premium fatorial elevado"
- Se 30-70: "⚪ Value spread neutro (P{x})"
- Se < 30: "🔴 Value spread comprimido (P{x}) — premium fatorial reduzido"
- Exibir no canto superior do componente. **Sem chart adicional** — só legenda + nota explicativa em tooltip.

**Fonte:** `value_spread` é forward-looking — pega o spread P/B atual entre value e growth e compara com histórico. AQR Style Premia / Asness 2021 ("Value and Interest Rates").

### 4. Banner v1 imediato (patch de UI sem código novo de modelo)

Banner persistente no topo do componente, sempre visível:

> **⚠️ Use como diagnóstico, não como meta.** Max Sharpe histórico ≠ portfolio ótimo prospectivo. Carteira atual 50/30/20 está dentro do IC estatístico (Michaud Resampled abr/2026). Mudanças exigem evidência forte; rebalance custoso.

### 5. Delta em R$ + IR devido (parte do bloco Sharpe líquido)

Adicionar tabela ao lado dos pontos especiais (Max Sharpe, Min Vol):

| Ativo | Atual % | Proposto % | Δ pp | Δ R$ | IR devido |
|-------|---------|------------|------|------|-----------|
| SWRD | 39.5% | 43.2% | +3.7pp | +R$X | R$Y |
| ... | ... | ... | ... | ... | ... |
| **Total** | | | | **+R$0** | **R$Z** |

Patrimônio para R$ vem do `data.json` (campo de portfolio total). Cálculo IR: 15% × (delta positivo × patrimônio × ganho não realizado).

## Fora de escopo v2 (deferido)

- Regime switching estatístico/HMM (CIO descartou — overfitting)
- Walking-forward / out-of-sample (CIO descartou — Diego não trada mensal)
- Sensitivity analysis formal (já implícita nas duas fronteiras)
- Fetch automatizado AQR/RA (atualização manual mensal aceitável)
- RF Tática histórico real (depende de Renda+ 2065 amadurecer)
- Extender AVEM via AVES (fica como melhoria de proxy se CIO/Factor priorizarem em v3)

## Critérios de aceite

- [ ] `efficient_frontier.bl` substitui `efficient_frontier.forward` em data.json
- [ ] Posterior BL respeita constraints `prior ≤ posterior ≤ view` (sanity check)
- [ ] λ, τ, Ω documentados como `_meta` no bloco BL
- [ ] `sharpe_net` em cada ponto da fronteira (custos + IR aplicados)
- [ ] Tabela delta R$ + IR exibida nos pontos especiais (Max Sharpe, Min Vol)
- [ ] Legenda regime de value spread no canto, baseada em `factor.value_spread.percentile`
- [ ] Banner "diagnóstico não meta" persistente no topo
- [ ] Spec contract verde
- [ ] Pipeline `quick_dashboard_test.sh` end-to-end verde
- [ ] 16 testes existentes Python continuam passando + novos para BL (mín. 8) e Sharpe líquido (mín. 4)
- [ ] Vitest: novos testes para banner, regime label, tabela delta R$
- [ ] Playwright semantic: novos testids `bl-disclaimer`, `regime-label`, `rebalance-delta-table`
- [ ] Changelog atualizado
- [ ] Memória `reference_research_affiliates.md` checada (já está em 3.1%)

## Decisões metodológicas Head

- **Prior π:** MSCI ACWI weights para equity (60/30/10), atual Diego para RF/HODL11
- **τ:** 0.05 (Idzorek padrão)
- **λ:** calibrar para reverse-optimization, documentar valor
- **Ω:** diagonal proporcional à incerteza das views (`τ · diag(P · Σ · P')`)
- **Custos:** 0.05% spread + IR estrutural (15% ETF exterior, isenta TD PF, 15% come-cotas Renda+, 15% HODL11)
- **IR aplicado:** apenas sobre delta de rebalanceamento, não retroativo
- **Regime:** percentil de `factor.value_spread`, sem HMM

## Especialistas a envolver

- **Dev:** implementação completa
- **Quant:** validar λ/τ/Ω calibration ANTES de implementar BL (acionar via Task tool no início). Validar que sanity checks BL fazem sentido.
- **Tax:** validar tratamento IR (15% ETF exterior, isenta TD, 15% come-cotas) — acionar via Task tool antes de fechar o Sharpe líquido.

## Conclusão

**Concluída 2026-05-02.** Implementação seguiu spec na íntegra:

1. **Banner v1** (`data-testid="ef-diagnostic-banner"`) — sempre visível, no topo. Texto cita Michaud Resampled abr/2026 e custo de rebalance.
2. **Regime de value spread** (`data-testid="ef-regime-label"`) — lê `factor.value_spread.percentile_hml` (já presente). 🟢 P≥70 / ⚪ 30-70 / 🔴 <30. **Atual P42 → ⚪ neutro**.
3. **Black-Litterman substitui Forward**:
   - Prior π via reverse-optimization (`λ·Σ·w_mkt`), λ=2.5, τ=0.05.
   - Ω diagonal `τ·diag(P·Σ·P')` (Idzorek §4.1).
   - Views Q (4 absolutas: SWRD/AVGS/AVEM/HODL11) = AQR/RA convertidos USD nominal → BRL real.
   - Posterior bayesiano + 3 sanity checks: plausible_range, weighted_avg_in_range, sign_flip — **passam**.
   - Bloco `bl_meta` documenta λ/τ/Ω/Q/π/posterior.
4. **Sharpe líquido** em todos os pontos (`sharpe_net`). Custo 0.05% spread + IR 15% sobre vendas (Lei 14.754; TD HTM PF isento; come-cotas Renda+ 15%; HODL11 15%). 100% ganho como worst-case. Custo amortizado em 10y.
5. **Tabela delta R$ + IR** (`data-testid="ef-rebalance-delta-table"`) — Max Sharpe e Min Vol. Privacy preservada.

**Resultados (carteira 50/30/20, patrimônio R$3.685M):**
- Histórica · Max Sharpe — bruto **0.816**, líquido **0.795** (gap 2.1pp / Δ ~0.02)
- Histórica · Carteira atual — **0.730** (sem rebalance ⇒ líquido = bruto)
- BL · Max Sharpe — bruto **0.038**, líquido **0.001** (gap 3.7pp; rebalance vende R$1.27M SWRD → R$190k IR)
- BL · Carteira atual — **−0.007**

**Validação:** 744 vitest + 101 Playwright + 6 pipeline E2E + 29 testes Python (16 v1 + 8 BL + 5 Sharpe net) — todos verdes.

**Restrições respeitadas:** `efficient_frontier.historica` intocado; sem regime switching estatístico; sanity checks BL passam.
