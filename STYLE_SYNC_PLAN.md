# Style Sync Plan: React App v0.1.170 → stable-v2.77 Reference

## 📊 Análise das Diferenças Visuais

### Componente 1: Hero KPI Strip
**Arquivo:** `react-app/src/components/primitives/KpiHero.tsx`

**Referência (stable-v2.77):**
```css
.hero-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* 4 cols desktop */
  gap: 10px;
  margin-bottom: 16px;
}

.hero-kpi {
  background: var(--card);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  text-align: center;
}

.hero-kpi.primary {
  border: 2px solid var(--accent);
  background: rgba(59, 130, 246, 0.07);  /* 7% opacity */
}

.hero-kpi .hval {
  font-size: 2rem;
  font-weight: 800;
  margin: 4px 0;
  line-height: 1;
}

.hero-kpi .hlbl {
  font-size: 0.6rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-kpi .hsub {
  font-size: 0.65rem;
  color: var(--muted);
  margin-top: 4px;
}
```

**Atual (React v0.1.170):**
```tsx
<div className="grid grid-cols-4 gap-2.5 mb-4">
  {/* gap-2.5 = 10px ✓ */}
  {/* mb-4 = 16px ✓ */}
  <div className="... bg-blue-950/25 border-accent border-2 border-l-4">
    {/* bg-blue-950/25 ≠ rgba(59,130,246,.07) ✗ */}
    {/* border-l-4 = extra blue left border ✗ */}
```

**Problemas Identificados:**
1. `bg-blue-950/25` é muito escuro/opaco comparado com `rgba(59,130,246,.07)`
2. Tem uma barra azul no lado esquerdo (`border-l-4`) que não existe na referência
3. Tailwind classes não refletem exatamente o CSS da referência

**Solução:** Usar inline styles ou CSS personalizado para match exato
```tsx
style={{
  border: '2px solid var(--accent)',
  background: 'rgba(59, 130, 246, 0.07)',
  borderLeft: 'none', // remove left border
  borderRadius: '12px',
}}
```

---

### Componente 2: Tab Navigation
**Arquivo:** `react-app/src/styles/dashboard.css` (linhas 195-262)

**Referência (stable-v2.77):**
```css
.tab-nav {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: hsl(var(--bg));
  padding: 8px 0 6px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.tab-nav::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(to right, transparent, var(--bg));
  pointer-events: none;
  z-index: 10;
}

.tab-btn {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  color: var(--muted);
  padding: 7px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: var(--accent);
  color: hsl(var(--text));
}

.tab-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
  border-bottom: 2px solid var(--accent);
}
```

**Atual (React v0.1.170):**
✅ PARECE OK (usar verificação visual em runtime)

---

### Componente 3: KPI Cards (Grid)
**Arquivo:** `react-app/src/styles/dashboard.css` (linhas 178-183)

**Referência:**
```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.kpi {
  background: hsl(var(--card));
  border-radius: 10px;
  padding: 14px 16px;
  border: 1px solid hsl(var(--border));
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2px;
}
```

**Atual (React):**
✅ PARECE OK (usar verificação visual)

---

### Componente 4: Charts
**Arquivo:** `react-app/src/styles/dashboard.css`

**Referência:**
```css
.chart-box {
  height: 240px;
  width: 100%;
}
```

**Problema:** Altura de 240px é pequena demais. Referência mostra 300px+ em screentshots.

**Solução:**
```css
.chart-box {
  height: 300px;  /* aumentado de 240px */
  width: 100%;
}

.chart-box-lg {
  height: 340px;  /* para charts primários */
  width: 100%;
}
```

---

### Componente 5: Responsiveness  
**Referência (stable-v2.77):**
```css
@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: 1fr 1fr; }
  .hero-strip { grid-template-columns: repeat(3, 1fr) !important; }
}

@media (max-width: 900px) {
  .hero-strip { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  body { font-size: 13px; }
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .hero-strip { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  body { font-size: 12px; }
  .hero-strip { grid-template-columns: repeat(2, 1fr); }
}
```

**Atual (React):**
✅ Parece cobrir estes breakpoints

---

## 🔧 AÇÕES CONCRETAS

### AÇÃO 1: Fix KpiHero.tsx borders e background
**Arquivo:** `react-app/src/components/primitives/KpiHero.tsx`

**Mudanças:**
```diff
- className={`rounded-lg p-4 text-center border transition-colors border-l-4 ${
-   kpi.primary
-     ? 'bg-blue-950/25 border-accent border-2 border-l-blue-500'
-     : 'bg-card border-border/50 border-l-blue-500'
- }`}

+ className={`rounded-xl p-4 text-center border transition-colors ${
+   kpi.primary ? 'border-2' : ''
+ }`}
+ style={kpi.primary ? {
+   borderColor: 'hsl(var(--accent))',
+   background: 'rgba(59, 130, 246, 0.07)',
+ } : {
+   borderColor: 'hsl(var(--border))',
+   background: 'hsl(var(--card))',
+ }}
```

### AÇÃO 2: Increase chart heights
**Arquivo:** `react-app/src/styles/dashboard.css`

```diff
+ .chart-box {
+   height: 300px;  /* foi 240px */
+   width: 100%;
+ }
+ 
+ .chart-box-lg {
+   height: 340px;
+   width: 100%;
+ }
```

### AÇÃO 3: Verify semaforo colors
✅ JÁ CORRETO (usar CSS variables)

### AÇÃO 4: Check button states
⚠️ Adicionar hover/focus rings se faltando

---

## ✅ Checklist de Validação

- [ ] Hero cards com border-radius 12px
- [ ] Hero primary background exato: `rgba(59, 130, 246, 0.07)`
- [ ] Tab navigation com scroll fade (::after pseudo-element)
- [ ] KPI cards com grid auto-fit minmax(170px, 1fr)
- [ ] Charts com altura mínima 300px
- [ ] Semaforo colors com rgba + var(--*)
- [ ] Responsiveness em 5 breakpoints
- [ ] Button focus rings visíveis
- [ ] Tipografia escalando em mobile

