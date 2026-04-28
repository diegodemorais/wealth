# HD-risco-portfolio: Mapeamento Completo de Risco do Portfolio

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-risco-portfolio |
| **Dono** | Head + Time Completo |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | Factor, RF, FIRE, Risco, Macro, Advocate, Quant |
| **Co-sponsor** | Dev (implementação dashboard) |
| **Dependencias** | — |
| **Criado em** | 2026-04-27 |
| **Origem** | Diego — "questão nunca devidamente tratada: risco" |

---

## Motivo / Gatilho

Diego identificou que risco nunca foi mapeado sistematicamente. O dashboard atual mostra fragmentos de risco em diferentes abas (drawdown em Backtest, drift em Portfolio, VaR em Simuladores) mas não tem uma visão consolidada e estruturada de:

1. **Quais são TODOS os riscos do portfolio de Diego?**
2. **Quais já estão quantificados? Quais são gaps?**
3. **Como representar risco de forma integrada no dashboard?**
4. **Qual é o perfil de risco atual vs tolerância declarada?**

---

## Escopo

### F1: Inventário de Riscos — Mapeamento Completo

Classificar todos os riscos em dimensões:

**Riscos de Mercado:**
- Risco de mercado equity (volatilidade, drawdown, tail risk)
- Risco fatorial (factor premium variability — AVGS/SCV pode underperformar 8-10 anos)
- Risco de concentração geográfica (US/DM/EM mix)
- Risco de correlação em stress (como os ativos se comportam juntos em crise?)

**Riscos de Renda Fixa:**
- Risco de duration (Renda+ 2065: duration ~46 anos — mark-to-market severo)
- Risco de juros (subida de taxas → perda MtM no Renda+ tático)
- Risco soberano Brasil (CDS 5Y > 400bps → gatilho para revisão)
- Risco de crédito (Tesouro Direto — soberano BR)

**Riscos Cambiais:**
- Exposição USD/BRL (~79% do portfolio em USD)
- "Ganho fantasma" cambial (IR sobre valorização BRL mesmo sem ganho real)
- Risco de repatriação (IOF + spread Okegen)

**Riscos de Sequência (SoRR):**
- Sequence of Returns Risk — primeiros anos pós-FIRE críticos
- Bond pool readiness vs meta (7 anos de gastos)
- Maturidade IPCA+ 2040 = FIRE Day (cobertura anos 1-7)

**Riscos de Longevidade:**
- Horizonte de 40+ anos (2040-2085+)
- Spending smile — gastos declinam mas saúde escala
- Depletação do portfolio em cenário adverso

**Riscos de Capital Humano:**
- Concentração de renda em 2 PJs (Simples Nacional)
- Risco de burnout / FIRE involuntário antes de 2040
- Katia como floor income implícito (não incluído no MC)

**Riscos Regulatórios/Tributários:**
- Lei 14.754/2023 — mudanças de tributação podem alterar breakeven equity vs RF
- Estate tax US (mitigado via UCITS)
- Reforma tributária em andamento

**Riscos Comportamentais:**
- Tracking error regret (AVGS underperformance prolongada)
- Loss aversion em drawdown severo
- Overreaction a ruído de mercado

**Riscos de Crypto:**
- HODL11 banda 1.5-5% — volatilidade extrema (BTC pode cair -70%+)
- Risco operacional B3/XP para wrapper local

### F2: Métricas de Risco — O que Calcular

Para cada dimensão de risco, definir:
- Métrica primária (como quantificar)
- Valor atual
- Threshold de atenção / alarme
- Já está no dashboard? Onde?

### F3: Dashboard — Representação

Questões a responder:
- Risco merece aba própria ou vive dentro das existentes?
- Quais visualizações: gauge, heatmap, tabela, score?
- O que mostrar no NOW tab vs tab dedicada?
- Como criar um "Risk Score" consolidado?

### F4: Implementação Dev

Após debate e spec aprovado, passar spec completo para Dev implementar.

---

## Debates Registrados

### Debate 1 — Factor vs Concentração de Risco (Factor agent)

**Achado central:** AVGS contribui 42% do risco total do portfolio com apenas 30% de peso — alta concentração de risco por unidade de alocação. Isso é esperado (factor tilt amplifica variância), mas precisa ser monitorado.

**Risco de factor drought:** Historicamente, SCV underperformou por até 153 meses consecutivos (12,75 anos). O trigger de revisão de -5pp em 24 meses é correto, mas não cobre o risco de underperformance gradual sem trigger.

**Factor premium pós-publicação:** Haircut correto de 58% (McLean & Pontiff 2016). Alpha líquido real de AVGS ≈ +0.16%/ano. Não justifica sair, mas calibra expectativas realisticamente.

**Conclusão Factor:** Exposição fatorial é risco intencional e bem calibrado. Maior risco prático: tracking error regret em underperformance de 3-5 anos (comportamental, não estrutural).

---

### Debate 2 — Duration Risk (RF agent)

**Achado central:** Renda+ 2065 tem Modified Duration ≈ 43.25 — o instrumento mais sensível a juros do portfolio inteiro. +1pp na taxa = -43.25% MtM de perda mark-to-market.

**Dados quantificados:**
- Renda+ tático: ~R$95k (2.7% do portfolio)
- DV01 Renda+: ≈ R$41/bp por R$1k investido
- IPCA+ 2040 (bond pool): Modified Duration ≈ 10.5 — muito mais gerenciável

**Contexto importante:** Renda+ é posição tática — MtM não importa se segurada até 2065. O risco só se materializa se houver venda antecipada. A RF total (10%) tem duration média ponderada ≈ 12-15 anos.

**Risk real:** Risco de crédito soberano (CDS 5Y Brasil) mais relevante que duration pura para posição carry.

---

### Debate 3 — Sequence of Returns Risk (FIRE agent)

**Achado central:** P(FIRE quality ≥ R$220k/ano) ≈ 80-84% vs headline 86.4%. A diferença são cenários onde P(FIRE) = 1 (não depleta) mas spending médio cai abaixo de R$220k — "sucesso técnico, insucesso real."

**Gaps críticos identificados:**
1. **Bond pool FIRE 2035 (aspiracional): INEXISTE.** Nenhum instrumento matura em 2035. IPCA+ 2040 só protege FIRE base. Se Diego se aposentar em 2035, os primeiros 5 anos ficam sem buffer — maior vulnerabilidade SoRR do portfolio.
2. **Healthcare shock:** Gasto não previsto de R$200-500k em saúde correlacionado com crash de mercado = pior combinação. Não modelado no MC.
3. **Spending smile:** Gastos declinam 1-2% aa após 65 anos, mas saúde cresce. Efeito líquido incerto.

**Guardrails funcionam:** Os guardrails definidos (0-15%: hold; 15-25%: -10%; 25-35%: -20%; >35%: R$180k floor) são mecanismo correto de mitigação SoRR. O problema é comportamental: há disciplina para aplicá-los em crash real?

---

### Debate 4 — Risco Macro (Macro agent)

**Contexto macroeconômico:**
- Selic elevada aumenta custo de oportunidade vs IPCA+, mas risco fiscal domina
- CDS Brasil 5Y: nível atual acima de threshold de revisão (>400bps) é gatilho para review
- Câmbio BRL/USD: 79% do portfolio em USD — proteção natural em cenário de fiscal dominance BR

**Risk macro não quantificado:**
- Fiscal dominance: governo força BACEN a manter Selic baixa via pressão → IPCA dispara → RF IPCA+ perde real via indexação insuficiente
- Reforma tributária: mudanças nas alíquotas de investimentos no exterior alteram breakeven equity vs RF

**Mitigação existente:** Globalização da carteira (79% USD) é a melhor proteção contra risco Brasil. Reforma tributária BR afeta apenas fluxos futuros — portfolio USD existente é grandfathered parcialmente.

---

### Debate 5 — Stress Test / Devil's Advocate (Advocate agent)

**Premissas contestadas:**

1. **Vol 16.8% subestimada em stress:** Volatilidade realizada em crises é 20-22% (2008: 42%, 2020: 35%). Usar 16.8% em cenários de stress é conservador no sentido errado — subestima tail risk.

2. **"Katia como floor income" não modelado:** Se Katia contribui R$80-120k/ano como renda de trabalho, P(FIRE) real pode ser 90-92%. Se ela para (doença, divórcio), P(FIRE) cai. Essa assimetria não está no MC.

3. **Risco comportamental é o maior risco real:** Queda de -35% seguida de 5 anos de underperformance fatorial → probabilidade alta de Diego mudar estratégia no pior momento. Histórico mostra que investidores saem próximo de mínimas.

4. **Drawdown bug confirma gap de observabilidade:** Sistema reporta -14.74% como max drawdown quando o real é -30.27% (set/2022). Isso não é bug menor — significa que qualquer análise de Calmar Ratio, drawdown histórico ou tail risk estava errada.

**Steelman da posição atual:** Portfolio bem estruturado para acumulação. Risco 7.7/10 é intencional e adequado para horizonte 11 anos. Os riscos listados são conhecidos, não ignorados.

---

### Debate 6 — Risk Score e Arquitetura Dashboard (Risco agent)

**Risk Score calculado: 7.7/10 — "Agressivo-Moderado"**

Fórmula validada pelo Quant:
```
score_base = 0.79 × 10 = 7.90          # equity pct
addon_btc = 0.029 × (4.5 - 1) × 0.5 = 0.05   # BTC vol premium
addon_duration = 0.027 × (43.25/46) × 0.5 = 0.01  # Renda+ tático
addon_conc_br = 0                        # BR RF < 20%
discount_diversificacao = -0.30          # UCITS global
score = 7.66 ≈ 7.7
```

**Decisão arquitetural: Option D Hybrid** (consenso 6/7 agentes)
- NÃO criar aba Risk separada (seria fantasma — Diego não visita)
- Integrar blocos de risco nas abas existentes onde o contexto faz sentido

**6 blocos especificados (R1-R6):**

| Block | Aba | Tipo | Conteúdo |
|-------|-----|------|----------|
| R1 | NOW | ECharts Gauge | Risk Score 0-10 com zonas verde/amarelo/vermelho |
| R2 | NOW | Semáforos 3 linhas | Equity drift, BTC%, Renda+ taxa vs gatilho |
| R3 | Portfolio | Barras horizontais | Risk Contribution % por ativo |
| R4 | Portfolio | Tabela cenários | +1pp/+2pp MtM scenarios para Renda+ |
| R5 | Performance | Drawdown monitor | Drawdown atual + guardrail badge |
| R6 | FIRE | Tabela SoRR | P(FIRE) em crash scenarios (-20%, -30%, -40%) |

---

### Debate 7 — Validação Quantitativa (Quant agent)

**Métricas calculadas para o portfolio atual (R$3.47M):**

| Métrica | Valor | Observação |
|---------|-------|------------|
| Volatilidade equity | 16.8% | Input MC — usado como proxy portfolio |
| Volatilidade portfolio real | ~14.53% | Equity domina; MC levemente conservador |
| VaR 95% (1 ano) | R$520k (15%) | Paramétrico normal |
| CVaR 95% (1 ano) | R$716k (20.6%) | Expected shortfall além do VaR |
| Max Drawdown real (ITD) | **-30.27%** (set/2022) | BUG: pipeline reporta -14.74% |
| Calmar Ratio | 0.316 | CAGR 9.57% / Drawdown 30.27% |
| HHI | 0.226 | 4.4 ativos equivalentes (concentração moderada) |
| Risk Score | 7.7/10 | Fórmula validada |

**Bug crítico confirmado:** `drawdown_history.json` mede drawdown vs pico recente, não vs pico histórico absoluto. Max drawdown real ITD é -30.27% (set/2022) vs os -14.74% reportados. Todos os cálculos de Calmar Ratio, análise de tail risk e thresholds baseados em drawdown estão incorretos no pipeline atual.

**Validação da vol:** 16.8% como proxy do portfolio é conservador (verdadeiro ~14.53%), o que significa que MC overestima risco → P(FIRE) 86.4% provavelmente é lower bound conservador. Correto manter como está.

---

## Conclusão

O risco do portfolio de Diego está **adequado para a fase de acumulação** (Risk Score 7.7/10) e **conscientemente estruturado** — não aleatório ou ignorado. Os principais achados do debate completo de 7 agentes:

**O que está funcionando:**
- Globalização (79% USD) é proteção natural contra risco Brasil
- Guardrails de drawdown são o mecanismo correto de mitigação SoRR
- Bond pool IPCA+ 2040 cobre os anos críticos pós-FIRE base (2040)
- Factor tilt (AVGS 30%) é risco intencional e bem dimensionado

**Gaps críticos a resolver:**
1. **Bug drawdown pipeline** — max drawdown reportado (-14.74%) está errado. Real: -30.27%. Fix obrigatório antes de qualquer análise de risco futura.
2. **Bond pool FIRE 2035 inexiste** — cenário aspiracional não tem buffer. Decisão: aceitar explicitamente ou criar instrumento.
3. **P(FIRE quality)** — headline 86.4% inclui cenários de gasto abaixo de R$220k. Métrica real: 80-84%. Deve ser reportada junto.
4. **Healthcare shock não modelado** — maior risco qualitativo sem quantificação. Correlação negativa com mercado (pior hora para gastar).
5. **Vol stress** — 16.8% subestima cenários extremos (2008: 42%); considerar stress test separado com 22%.

**Decisão de dashboard:** Option D Hybrid — integrar risco nas abas existentes (NOW, Portfolio, Performance, FIRE) em vez de criar aba dedicada. 6 blocos R1-R6 aprovados para implementação Dev.

---

## Resultado

**F1 (Inventário):** Completo — 9 dimensões de risco catalogadas com 30+ riscos individuais.

**F2 (Métricas):**

| Risco | Métrica | Valor Atual | Threshold |
|-------|---------|-------------|-----------|
| Equity drawdown | Max DD histórico | **-30.27%** (bug: -14.74%) | -35% → guardrail |
| Factor drought | AVGS vs SWRD 24m | Monitor | -5pp → revisão |
| Duration Renda+ | Modified Duration | 43.25 | N/A (tático) |
| Câmbio | % USD | 79% | Decisão consciente |
| SoRR | Bond pool gap | 0 anos (2035) | 7 anos meta |
| Concentração | HHI | 0.226 | 0.30 = alta |
| Tail risk | CVaR 95% 1a | R$716k (20.6%) | Monitor |
| Risk Score | Composto 0-10 | 7.7 | >9 = reavaliação |
| P(FIRE quality) | MC com gasto ≥R$220k | 80-84% | <75% → revisão |

**F3 (Dashboard):** Option D Hybrid aprovada. 6 blocos R1-R6 especificados para Dev.

**F4 (Implementação):** Spec passada ao Dev — ver seção abaixo.

---

## Spec para Dev (F4)

### Pipeline: `scripts/risk_metrics.py` (novo script)

Calcular e exportar para `data.json` sob chave `risk`:

```json
"risk": {
  "score": 7.7,
  "label": "Agressivo-Moderado",
  "score_breakdown": {
    "base_equity": 7.90,
    "addon_btc": 0.05,
    "addon_duration": 0.01,
    "addon_conc_br": 0.00,
    "discount_diversificacao": -0.30
  },
  "vol_portfolio": 0.168,
  "var_95_pct": 0.150,
  "cvar_95_pct": 0.206,
  "max_drawdown_real": -0.3027,
  "hhi": 0.226,
  "calmar_ratio": 0.316,
  "contribution_by_asset": [
    {"name": "SWRD", "weight": 0.50, "risk_contribution_pct": 0.42},
    {"name": "AVGS", "weight": 0.30, "risk_contribution_pct": 0.42},
    {"name": "AVEM", "weight": 0.20, "risk_contribution_pct": 0.14},
    {"name": "HODL11", "weight": 0.029, "risk_contribution_pct": 0.08},
    {"name": "RF", "weight": 0.10, "risk_contribution_pct": 0.04}
  ],
  "semaforos": {
    "equity_drift": {"value": null, "status": "verde", "label": "Dentro da banda"},
    "btc_pct": {"value": 0.029, "status": "verde", "label": "Dentro da banda 1.5-5%"},
    "renda_plus_taxa": {"value": null, "status": "verde", "label": "Abaixo do gatilho"}
  },
  "duration_scenarios": [
    {"shift_pp": 1, "renda_plus_mtm_pct": -0.4325, "ipca2040_mtm_pct": -0.105},
    {"shift_pp": 2, "renda_plus_mtm_pct": -0.865, "ipca2040_mtm_pct": -0.21}
  ],
  "sorr_scenarios": [
    {"crash_pct": -0.20, "pfire_ajustado": 0.82},
    {"crash_pct": -0.30, "pfire_ajustado": 0.76},
    {"crash_pct": -0.40, "pfire_ajustado": 0.68}
  ]
}
```

### Fix obrigatório: `reconstruct_history.py`

Corrigir cálculo de max drawdown — deve usar pico histórico absoluto (cummax), não pico recente janela. Campo corrigido: `drawdown_max_real` em `data.json`.

### Dashboard blocks (React)

**R1 — Risk Score Gauge (NOW tab)**
- ECharts gauge, range 0-10
- Zonas: 0-5 verde, 5-7.5 amarelo, 7.5-10 vermelho
- Valor atual: 7.7, label: "Agressivo-Moderado"
- `data-testid="risk-score-gauge"`

**R2 — Risk Semáforos (NOW tab)**
- 3 linhas: Equity Drift / BTC% / Renda+ Taxa
- Cada linha: ícone (🟢/🟡/🔴) + label + valor
- `data-testid="risk-semaforos"`

**R3 — Risk Contribution (Portfolio tab)**
- Barras horizontais ECharts por ativo
- X: % contribuição ao risco total
- `data-testid="risk-contribution-chart"`

**R4 — Duration Scenarios (Portfolio tab)**
- Tabela 2 linhas: +1pp / +2pp
- Colunas: Instrumento / Duration / Perda MtM R$ / Perda MtM %
- `data-testid="duration-scenarios-table"`

**R5 — Drawdown Monitor (Performance tab)**
- Card com drawdown atual vs max histórico real (-30.27%)
- Badge colorido de guardrail (verde/amarelo/vermelho)
- `data-testid="drawdown-monitor"`

**R6 — SoRR Indicator (FIRE tab)**
- Tabela: cenário crash / P(FIRE ajustado)
- Destaque visual se P(FIRE) < 75%
- `data-testid="sorr-indicator"`
