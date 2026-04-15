# ABA-1-HOJE — Reutilizable CSS Patterns

**Purpose**: Quick reference for extending or cloning HOJE components in other tabs or future revisions.

---

## 1. HERO KPI Pattern

### Base Card
```css
.hero-kpi {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.hero-kpi.primary {
  border: 2px solid var(--accent);
  background: rgba(59, 130, 246, 0.07);
}

.hero-kpi .hlbl {
  font-size: 0.6rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-kpi .hval {
  font-size: 2rem;
  font-weight: 800;
  margin: 4px 0;
  line-height: 1;
  color: var(--text);
}

.hero-kpi .hsub {
  font-size: 0.65rem;
  color: var(--muted);
  margin-top: 4px;
}
```

### Container Grid
```css
.hero-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .hero-strip {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### Usage
```html
<div class="hero-strip">
  <div class="hero-kpi primary">
    <div class="hlbl">Main Metric</div>
    <div class="hval">123.4M</div>
    <div class="hsub">Context text</div>
  </div>
  <div class="hero-kpi">
    <div class="hlbl">Secondary Metric</div>
    <div class="hval" style="color: rgb(34, 197, 94);">+5.2%</div>
    <div class="hsub">2024 YTD</div>
  </div>
</div>
```

---

## 2. KPI Grid Pattern (Metrics Cards)

### Base Styles
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.kpi {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
}

.kpi-fire {
  border: 2px solid var(--accent);
  background: rgba(59, 130, 246, 0.07);
}

.kpi-label {
  font-size: 0.65rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2px;
  color: var(--text);
}

.kpi-sub {
  font-size: 0.7rem;
  color: var(--muted);
  margin-top: 2px;
}

@media (max-width: 900px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .kpi-value {
    font-size: 1.2rem;
  }
}
```

### Usage
```html
<div class="kpi-grid">
  <div class="kpi kpi-fire">
    <div class="kpi-label">Probability FIRE</div>
    <div class="kpi-value" style="color: rgb(34, 197, 94);">86.5%</div>
    <div class="kpi-sub">fav 92% · stress 83%</div>
  </div>
  
  <div class="kpi">
    <div class="kpi-label">Maximum Drift</div>
    <div class="kpi-value" style="color: rgb(234, 179, 8);">9.1pp</div>
    <div class="kpi-sub">IPCA -9.1pp vs target</div>
  </div>
</div>
```

---

## 3. Progress Bar Pattern (Animated Gradient)

### Base Styles
```css
.progress-bar-container {
  margin: 10px 0;
  background: var(--card2);
  border-radius: 6px;
  height: 12px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--accent), var(--purple));
  transition: width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.progress-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--muted);
  margin-bottom: 4px;
  margin-top: 4px;
}

.progress-bar-note {
  font-size: 0.6rem;
  color: var(--muted);
  text-align: center;
  margin-bottom: 8px;
}
```

### Usage
```html
<div class="progress-bar-label">
  <span>Start (Apr/21)</span>
  <span style="color: var(--text);">Current R$3.59M</span>
  <span>Goal (R$8.3M)</span>
</div>

<div class="progress-bar-container">
  <div class="progress-bar-fill" id="myProgressBar" style="width: 75%"></div>
</div>

<div class="progress-bar-note">
  📏 Logarithmic scale — each visual increment = same multiplication
</div>
```

---

## 4. DCA Card Pattern (Status Cards with Left Border)

### Base Styles
```css
.dca-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

.dca-card {
  background: var(--card2);
  border: none;
  border-left: 3px solid var(--accent);
  border-radius: 8px;
  padding: 14px;
  transition: opacity 0.3s ease, border-color 0.3s ease;
}

.dca-card.paused {
  border-left-color: var(--muted);
  opacity: 0.8;
}

.dca-card.paused .dca-title {
  opacity: 0.7;
}

.dca-title {
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--text);
}

.dca-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  padding: 2px 0;
  color: var(--text);
}

.dca-row .dca-label {
  color: var(--muted);
}

.dca-row .dca-val {
  font-weight: 600;
  text-align: right;
}

@media (max-width: 900px) {
  .dca-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .dca-grid {
    grid-template-columns: 1fr;
  }
}
```

### Usage
```html
<div class="dca-grid">
  <div class="dca-card">
    <div class="dca-title">IPCA+ 2040</div>
    <div class="dca-row">
      <span class="dca-label">Taxa:</span>
      <span class="dca-val" style="color: rgb(34, 197, 94);">7.07%</span>
    </div>
    <div class="dca-row">
      <span class="dca-label">Piso:</span>
      <span class="dca-val">6.0% ✓</span>
    </div>
    <div class="dca-row">
      <span class="dca-label">Status:</span>
      <span class="dca-val">ativo</span>
    </div>
  </div>
  
  <div class="dca-card paused">
    <div class="dca-title">Renda+ 2065</div>
    <div class="dca-row">
      <span class="dca-label">Status:</span>
      <span class="dca-val">pausado</span>
    </div>
  </div>
</div>
```

---

## 5. Scenario Card Pattern (Multi-Option Display)

### Base Styles
```css
.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.scenario-card {
  background: var(--card2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.scenario-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.2);
}

.scenario-card.chosen {
  border: 2px solid var(--accent);
  background: rgba(59, 130, 246, 0.07);
  font-weight: 600;
}

.scenario-label {
  font-size: 0.6rem;
  color: var(--muted);
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.scenario-value {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 6px 0;
  color: var(--text);
}

.scenario-prob {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgb(234, 179, 8);
  margin: 2px 0;
}

.scenario-year {
  font-size: 0.6rem;
  color: var(--muted);
}

@media (max-width: 900px) {
  .scenario-grid {
    grid-template-columns: 1fr;
  }
}
```

### Usage
```html
<div class="scenario-grid">
  <div class="scenario-card chosen">
    <div class="scenario-label">✅ Escolhida</div>
    <div class="scenario-value">FIRE 53</div>
    <div class="scenario-prob">P = 86.5%</div>
    <div class="scenario-year">2040</div>
  </div>
  
  <div class="scenario-card">
    <div class="scenario-label">🚀 Aspiracional</div>
    <div class="scenario-value">FIRE 49</div>
    <div class="scenario-prob">P = 86.5%</div>
    <div class="scenario-year">2036</div>
  </div>
</div>
```

---

## 6. Wellness Row Pattern (Progress + Score)

### Base Styles
```css
.wellness-row {
  display: grid;
  grid-template-columns: 1.4rem 11rem 1fr 4.5rem 3rem;
  align-items: center;
  gap: 8px;
  padding: 6px 2px;
  border-bottom: 1px solid rgba(71, 85, 105, 0.12);
  font-size: 0.75rem;
  transition: background 0.2s ease;
}

.wellness-row:hover {
  background: rgba(71, 85, 105, 0.05);
}

.wellness-icon {
  font-size: 0.82rem;
  line-height: 1;
  text-align: center;
}

.wellness-label {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
}

.wellness-bar {
  height: 6px;
  background: rgba(71, 85, 105, 0.25);
  border-radius: 3px;
  overflow: hidden;
}

.wellness-bar-fill {
  height: 100%;
  background: rgb(34, 197, 94);
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.wellness-value {
  font-size: 0.68rem;
  color: var(--muted);
  white-space: nowrap;
  text-align: right;
}

.wellness-score {
  font-size: 0.72rem;
  color: rgb(34, 197, 94);
  font-weight: 700;
  white-space: nowrap;
  text-align: right;
}

@media (max-width: 768px) {
  .wellness-row {
    grid-template-columns: 1rem 8rem 1fr 3rem 2rem;
    gap: 6px;
  }
  
  .wellness-label {
    font-size: 0.7rem;
  }
}
```

### Usage
```html
<div class="wellness-row">
  <div class="wellness-icon">✅</div>
  <div class="wellness-label">Savings rate</div>
  <div class="wellness-bar">
    <div class="wellness-bar-fill" style="width: 100%"></div>
  </div>
  <div class="wellness-value">~55.6%</div>
  <div class="wellness-score">15/15</div>
</div>

<div class="wellness-row">
  <div class="wellness-icon">⚠️</div>
  <div class="wellness-label">Drawdown handling</div>
  <div class="wellness-bar">
    <div class="wellness-bar-fill" style="width: 80%"></div>
  </div>
  <div class="wellness-value">>5% ok</div>
  <div class="wellness-score">8/10</div>
</div>
```

---

## 7. Collapsible Section Pattern (Semáforo/Guardrails)

### Base Styles
```css
.section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 14px;
  overflow: hidden;
}

.section.section-critical {
  border-color: rgb(234, 179, 8);
  border-left: 3px solid rgb(234, 179, 8);
}

.section.collapsible {
  cursor: pointer;
  transition: background 0.2s ease;
}

.section.collapsible:hover {
  background: rgba(71, 85, 105, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--muted);
}

.section-badge {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(234, 179, 8);
  flex-shrink: 0;
}

.collapse-body {
  max-height: 1000px;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  opacity: 1;
}

.collapse-body.hidden {
  max-height: 0;
  opacity: 0;
  display: none;
}

.collapse-toggle {
  display: inline-block;
  width: 16px;
  height: 16px;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.collapse-toggle.open {
  transform: rotate(180deg);
}

@media (max-width: 480px) {
  .section {
    padding: 12px;
    border-radius: 8px;
  }
}
```

### Usage
```html
<div class="section section-critical collapsible" onclick="_toggleBlock(this)">
  <div class="section-summary">
    <span class="section-badge"></span>
    IPCA+ 2040: DCA pausado · 4 gatilhos monitorados
  </div>
  
  <div class="collapse-body">
    <table class="guardrails-table">
      <tr>
        <td>🟢 0–15%</td>
        <td>—</td>
        <td>R$ 250.000</td>
        <td style="color: rgb(34, 197, 94);">ATUAL ✓</td>
      </tr>
      <!-- more rows -->
    </table>
  </div>
</div>
```

---

## 8. Responsive Grid Mixin (Media Queries)

### Standard Breakpoints
```css
/* Base (1024px+) */
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

/* Tablet (900px) */
@media (max-width: 900px) {
  .grid-auto {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Small tablet (768px) */
@media (max-width: 768px) {
  .grid-auto {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile (480px) */
@media (max-width: 480px) {
  .grid-auto {
    grid-template-columns: 1fr;
  }
  
  /* Reduce font sizes */
  .kpi-value { font-size: 1.2rem; }
  .fire-big { font-size: 2.5rem; }
  
  /* Hide mobile-unfriendly elements */
  .hide-mobile { display: none; }
}
```

---

## 9. Privacy Mode (Value Masking)

### Base Styles
```css
.private-mode .pv {
  color: transparent !important;
  position: relative;
  white-space: nowrap;
}

.private-mode .pv::after {
  content: "••••";
  color: var(--muted);
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  pointer-events: none;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
}

/* Custom mask via data-pv-mask attribute */
.private-mode .pv[data-pv-mask]::after {
  content: attr(data-pv-mask);
}
```

### Usage
```html
<!-- Normal mode shows actual value -->
<div class="pv">R$3.59M</div>

<!-- Private mode shows mask -->
<div class="pv" data-pv-mask="R$••••M">R$3.59M</div>

<!-- Auto-masked with default •••• -->
<div class="pv">$631k em USD</div>
<!-- Shows: "••••" in private mode -->
```

---

## 10. Color Override Utilities

### Inline Color Overrides (Safe Pattern)
```html
<!-- Green success -->
<div style="color: rgb(34, 197, 94);">86.5%</div>

<!-- Yellow warning -->
<div style="color: rgb(234, 179, 8);">9.1pp</div>

<!-- Red critical -->
<div style="color: rgb(239, 68, 68);">-15.2%</div>

<!-- Muted context -->
<div style="color: var(--muted);">2026-04 · meta R$25k</div>
```

---

## Summary: Component Quick-Pick

| Component | CSS Class | Grid Type | Mobile Breakpoint | Color Scheme |
|-----------|-----------|-----------|-------------------|--------------|
| Hero Strip | `.hero-strip` | 4 col | 2 col @ 480px | --accent primary |
| KPI Grid | `.kpi-grid` | auto-fit(170px) | 2 col @ 480px | --accent + inline |
| Progress Bar | `.progress-bar-*` | N/A (1D) | N/A (full-width) | gradient (--accent + --purple) |
| DCA Cards | `.dca-grid` | auto-fit(260px) | 1 col @ 480px | --accent left border |
| Scenario Cards | `.scenario-grid` | auto-fit(150px) | 1 col @ 900px | persona-specific (blue, purple, cyan) |
| Wellness Row | `.wellness-row` | grid 5col | grid 5col (shrink) | --green filled + --muted |
| Section | `.section` | N/A (block) | N/A (full-width) | --card bg, --border outline |
| Collapsible | `.section.collapsible` | N/A | N/A | --card bg + toggle arrow |

---

**End of CSS Patterns**
