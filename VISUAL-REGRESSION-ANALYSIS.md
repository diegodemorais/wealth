# 📊 Visual Regression Analysis — Dashboard v0.1.166 vs stable-v2.77

**Data:** 2026-04-15  
**Baseline:** stable-v2.77 (25 screenshots de 2022)  
**Current:** v0.1.166 (React redesign)

---

## 🎯 Resumo Executivo

| Métrica | Valor | Status |
|---------|-------|--------|
| **Total Gaps** | 1 | ⚠️ CRITICAL |
| **Baseline Valid** | 25/25 screenshots | ✅ OK |
| **Similarity Atual** | 0.2% (RMS: 0.998) | ❌ Muito diferente |
| **Avaliação** | Dashboard completamente redesenhado | ⚠️ Esperado |

---

## 📈 Análise por Aba

### 1️⃣ **NOW Tab** 🔴 CRÍTICO
- **Baseline:** 5 screenshots (1-5.png)
- **Similarity:** 0.2% (RMS error: 0.998)
- **Pixels Different:** 1.75M / 2.17M total
- **Status:** ❌ INCOMPATÍVEL

**Componentes Esperados:**
- ✓ Hero KPI Cards (R$3.59M, 13a9m, 43.1%)
- ✓ Semáforos (Traffic Light Status)
- ✓ Indicadores Principais
- ✓ Time to FIRE chart
- ✓ Patrimônio allocation

**Diferenças Encontradas:**
1. **Layout:** Redesign completo (v2.77 era HTML estático → v0.1.166 é React SPA)
2. **Componentes:** Estrutura visual completamente diferente
3. **Cores/Tipografia:** Paleta de 2022 vs nova paleta 2026
4. **Densidade:** Informação reorganizada

**Próximas Ações:**
- [ ] Capturar novo baseline de v0.1.166 como referência
- [ ] Atualizar TAB_MAPPING com novas componentes
- [ ] Re-rodar teste com novo baseline

---

### 2️⃣ **PORTFOLIO Tab** 🟡 MEDIUM
- **Baseline:** 2 screenshots (6-7.png)
- **Similarity:** 0.2% (RMS: 0.998) — mesmo screenshot que Now
- **Status:** ⚠️ NÃO VALIDADO

**Componentes Esperados:**
- Alocação gráfica (Donut/Pie)
- ETFs Grid (SWRD, AVGS, AVEM)
- Posições IERE (tabela internacional)
- Base de Custo e Alocação (bond pool)

**Próximas Ações:**
- [ ] Capturar screenshot específico da aba Portfolio
- [ ] Comparar contra baselines 6-7.png

---

### 3️⃣ **PERFORMANCE Tab** 🟡 MEDIUM
- **Baseline:** 2 screenshots (8-9.png)
- **Similarity:** 0.2% (RMS: 0.998) — mesmo screenshot que Now
- **Status:** ⚠️ NÃO VALIDADO

**Componentes Esperados:**
- Alpha vs IBRX chart (green box)
- Premiações vs Realizados (table)
- Retornos Mensais Heatmap (red/green grid)
- Retornos Anuais (bar chart)

**Próximas Ações:**
- [ ] Implementar navegação por abas no capture (wkhtmltopdf limitado)
- [ ] Comparar contra baselines 8-9.png

---

### 4️⃣ **FIRE Tab** 🟡 MEDIUM
- **Baseline:** 4 screenshots (9-12.png)
- **Similarity:** 0.2% (RMS: 0.998) — mesmo screenshot que Now
- **Status:** ⚠️ NÃO VALIDADO

**Componentes Esperados:**
- FIRE Trajectory chart (time vs patrimony)
- FIRE Matrix (4 scenarios: Atual, Solteiro, Casado, +Filho)
- Meta tracking (2038, R$1.2M, P(FIRE))
- Collapse sections (bond rails, guardrails)

**Próximas Ações:**
- [ ] Capturar screenshot específico da aba FIRE
- [ ] Validar FIRE Matrix rendering

---

### 5️⃣ **WITHDRAW Tab** 🟢 LOW
- **Baseline:** 1 screenshot (13.png)
- **Similarity:** 0.2% (RMS: 0.998) — mesmo screenshot que Now
- **Status:** ⚠️ NÃO VALIDADO

**Componentes Esperados:**
- Bond Pool cascade (IPCA+ / Renda+ / Equity)
- Guardrails bands visualization
- Withdrawal rate calculations

---

### 6️⃣ **SIMULADORES Tab** 🟡 MEDIUM
- **Baseline:** 4 screenshots (14-17.png)
- **Similarity:** 0.2% (RMS: 0.998) — mesmo screenshot que Now
- **Status:** ⚠️ NÃO VALIDADO

**Componentes Esperados:**
- Simulator forms (inputs, sliders)
- Fire simulator results
- Backtest input panel

---

### 7️⃣ **BACKTEST Tab** 🟡 MEDIUM
- **Baseline:** 8 screenshots (18-25.png)
- **Similarity:** 0.2% (RMS: 0.998) — mesmo screenshot que Now
- **Status:** ⚠️ NÃO VALIDADO

**Componentes Esperados:**
- Period selection (date range)
- Backtest results table
- Performance metrics

---

## 🔴 Gap Crítico Detectado

```
VIS-01-now-tab.png
├── Severity: 🔴 CRITICAL
├── Tab: NOW Tab
├── Description: Visual divergence detected: 0% match with baseline
├── Impact: 1,753,254 pixels differ from reference (80.7% of total)
└── RMS Error: 0.998 (max: 1.0 — quase completamente diferente)
```

---

## 🛠️ Próximas Etapas (DEV)

### Phase 1: Baseline Update (1-2h)
1. [ ] Implementar navegação por abas no capture script
   - wkhtmltopdf atualmente captura apenas página principal
   - Considerar: Selenium, Puppeteer, ou Next.js export
2. [ ] Capturar screenshots individuais de cada aba (v0.1.166)
3. [ ] Armazenar como novo baseline em `analysis/screenshots/current/`
4. [ ] Atualizar TAB_MAPPING com novos componentes

### Phase 2: Pixel-Level Comparison (1-2h)
1. [ ] Executar análise completa contra novo baseline
2. [ ] Identificar gaps reais (vs. redesign esperado)
3. [ ] Classificar por:
   - CRITICAL: Missing components, broken layout
   - MEDIUM: Styling drift, spacing issues
   - LOW: Font/color minor differences

### Phase 3: Gap Remediation (Variável)
- Baseado em gaps identificados na Phase 2
- Prioridade: CRITICAL → MEDIUM → LOW
- Threshold default: 0 CRITICAL, max 3 MEDIUM permitido

---

## 📌 Recomendações

### Curto Prazo (Hoje)
✅ **Suite funcional com wkhtmltopdf + PIL**
- Comparação pixel-by-pixel pronta
- Relatórios JSON automatizados
- Integração CI/CD possível

⚠️ **Limitações Atuais**
- wkhtmltopdf não navega abas automaticamente
- Screenshots atuais são do Now tab (cópia para outras abas)
- Baseline é de 2022 (completamente desatualizado)

### Médio Prazo (Esta Semana)
1. Capturar baseline atualizado (v0.1.166)
2. Rodar análise completa contra novo baseline
3. Implementar fixes para gaps reais

### Longo Prazo (Próximas Releases)
- Integrar visual regression em CI/CD
- Monitorar contra baseline v0.1.166
- Update baseline em cada major version (semestral)

---

## 📊 Métricas de Sucesso

| Métrica | Target | Status |
|---------|--------|--------|
| Baseline Updated | ✅ Sim | ⏳ Pendente |
| All Tabs Captured | 7/7 | ⏳ 1/7 (Now tab) |
| Comparison Functional | ✅ Sim | ✅ OK |
| CRITICAL Gaps | 0 | ⏳ Avaliando |
| MEDIUM Gaps | ≤3 | ⏳ Avaliando |
| Test Automation | ✅ Sim | ✅ OK |

---

## 🔗 Referências

- **Suite:** `scripts/test_visual_regression.py`
- **Documentation:** `VISUAL-REGRESSION-SUITE-README.md`
- **Report:** `dashboard/tests/visual_regression_report.json`
- **Baseline:** `analysis/screenshots/stable-v2.77/` (25 images)
- **Issue:** `agentes/issues/QUANT-001-visual-regression-audit.md`

---

**Próximo Owner:** @Dev  
**Status:** 🟡 Awaiting baseline update + tab-specific captures  
**Target:** ✅ Complete visual regression validation by EOD

