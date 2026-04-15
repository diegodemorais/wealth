# ABA-2-CARTEIRA (Design Audit)

**Versão do Dashboard**: v2.76 (gerado 13 abr 2026)

---

## Visão Geral da Aba

A aba **CARTEIRA** (`data-in-tab="carteira"`) concentra 8 componentes principais:
1. **Exposição Geográfica — Equities** (donut chart)
2. **Alocação — Barras Empilhadas** (stacked bar + intra-equity progress bars)
3. **Composição por Região — ETFs** (2 tables: SWRD/AVGS/DM + AVEM/VEM)
4. **Exposição Fatorial — ETFs** (factor loadings table)
5. **Posições — ETFs Internacionais** (IBKR positions table)
6. **Base de Custo e Alocação — Equity por Bucket** (cost basis table)
7. **IR — Detalhado** (tax section — colapsável)
8. **Tax Impact — Histórico** (historical tax data)

---

## Componentes em Detalhe

### 1. Exposição Geográfica — Equities (Donut Chart)

| Aspecto | Valor |
|---------|-------|
| **Tipo** | Pie/Donut chart (Chart.js) |
| **Container** | `.chart-box-sm` |
| **Altura** | 180px (mobile), 360px raw canvas |
| **Canvas ID** | `geoDonut` |
| **Width/Height** | 2428×360 (2x DPR para retina) |
| **Cor de fundo** | Transparent (herda CSS) |
| **Responsividade** | Mobile: height reduzido em media query `480px` |
| **Legenda** | Abaixo do gráfico (via Chart.js tooltip) |

**Estrutura HTML**:
```html
<div class="section tab-hidden" data-in-tab="carteira">
  <h2>Exposição Geográfica — Equities</h2>
  <div class="chart-box-sm">
    <canvas id="geoDonut" width="2428" height="360" 
      style="display: block; box-sizing: border-box; height: 180px; width: 1214px;">
    </canvas>
  </div>
  <div class="src">Premissa: SWRD ≈ 67% US. AVUV/USSC = 100% US. AVDV = 100% DM ex-US. AVGS ~58% US.</div>
</div>
```

**Observações**:
- Usa CSS `box-sizing: border-box` para compatibilidade Chart.js
- `width: 1214px` é 50% de 2428 (DPR 2x)
- Fonte da legenda: `.src` class (`.65rem`, `var(--muted)`)

---

### 2. Alocação — Barras Empilhadas

#### 2.1 Barra Horizontal (Por Classe de Ativo)

| Aspecto | Valor |
|---------|-------|
| **Layout** | `display: flex; height: 32px;` |
| **Segmentos** | 5 divs (Equity, IPCA+ 2040, IPCA+ 2029, Renda+ 2065, Crypto) |
| **Cor Equity** | `#3b82f6` (blue-500) |
| **Cor IPCA+ 2040** | `#22c55e` (green-500) |
| **Cor IPCA+ 2029** | `#06b6d4` (cyan-500) |
| **Cor Renda+ 2065** | `#f97316` (orange-500) |
| **Cor Crypto** | `#eab308` (yellow-500) |
| **Border radius** | `6px` |
| **Transição** | `width .3s` |
| **Label inline** | `.58rem`, white, centered com `transform: translate(-50%, -50%)` |

**Estrutura**:
```html
<div id="stackedAllocBar" style="height:32px;display:flex;border-radius:6px;overflow:hidden;width:100%">
  <div title="Equity: 88.2%" style="width:88.15%;background:#3b82f6;transition:width .3s;...">
    <span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:.58rem;font-weight:700;color:white;">88%</span>
  </div>
  <!-- ... outros segmentos -->
</div>
```

#### 2.2 Legendas (Abaixo da barra)

- **Display**: `flex; gap: 10px; flex-wrap: wrap;`
- **Font size**: `.65rem`
- **Indicador de cor**: Quadrado `10px × 10px`, `border-radius: 2px`

#### 2.3 Intra-Equity — Pesos vs Alvo (Progress Bars)

| Aspecto | Valor |
|---------|-------|
| **Número de linhas** | 3 (SWRD, AVGS, AVEM) |
| **Height** | 14px |
| **Espaço entre linhas** | 8px |
| **Cor SWRD** | `#3b82f6` |
| **Cor AVGS** | `#8b5cf6` (violet-500) |
| **Cor AVEM** | `#06b6d4` (cyan-500) |
| **Alvo (linha vertical)** | 2px width, branca, `z-index: 2` |
| **Opacity bar** | `.8` |
| **Background bar** | `var(--card2)` |

**Estrutura**:
```html
<div style="display:flex;justify-content:space-between;font-size:.68rem;margin-bottom:2px">
  <span style="font-weight:700;color:#3b82f6">SWRD</span>
  <span style="color:#ef4444">40.6% atual · 50% alvo · <strong>-9.4pp</strong></span>
</div>
<div style="position:relative;height:14px;background:var(--card2);border-radius:4px;overflow:visible">
  <div style="position:absolute;left:0;top:0;height:100%;width:40.64%;background:#3b82f6;border-radius:4px;opacity:.8"></div>
  <div style="position:absolute;top:-3px;width:2px;height:20px;background:var(--text);border-radius:1px;left:50.00%;z-index:2" title="Alvo: 50%"></div>
</div>
```

**Observações**:
- Alvo renderizado como linha vertical que ultrapassa a barra (`overflow:visible`)
- Desvio de alvo em vermelho se negativo (`#ef4444`), amarelo se positivo (`#eab308`)

---

### 3. Composição por Região — ETFs da Carteira

#### 3.1 Tabela "Por Região" (SWRD/AVGS)

| Aspecto | Valor |
|---------|-------|
| **Table ID** | `etfRegionTable` |
| **Colunas** | ETF, EUA, Europa, Japão, Out.DM, Outros |
| **Font size** | `.72rem` (header), `.75rem` (body), `.6rem` (subtitle) |
| **Header** | `text-transform: uppercase; letter-spacing: .5px; color: var(--muted);` |
| **Background alternado** | `var(--card2)` para primeira linha (SWRD) |
| **Números alinhados** | `text-align: right;` |
| **Cores por coluna** | |
| **EUA** | `#3b82f6` (blue) |
| **Europa** | `#22c55e` (green) |
| **Japão** | `#94a3b8` (slate-400) |
| **Out.DM** | `#94a3b8` (slate-400) |
| **Outros** | `var(--muted)` (acizentado) |
| **Padding** | `5px 10px` (td), `6px 10px` (th) |
| **Zebra striping** | 1ª linha com background, resto sem |

#### 3.2 Tabela "VEM — Por Região" (AVEM)

- **Mesma estrutura**, colunas específicas: China, India, Taiwan, Out.EM
- **Cores**: China/Out.EM = `#22c55e` (verde), India/Taiwan = `#94a3b8` (cinza)
- **Font size**: `.72rem` body, `.6rem` subtitle

**Observação**: Ambas as tabelas usam `border-collapse: collapse` e `width: 100%`

---

### 4. Exposição Fatorial — ETFs

| Aspecto | Valor |
|---------|-------|
| **Table ID** | `etfFactorTable` |
| **Colunas** | ETF, Market (blue), Value (orange), Size (purple), Quality (green) |
| **Font size** | `.72rem` (ETF), `.75rem` (números) |
| **Header colors** | |
| **Market** | `#3b82f6` |
| **Value** | `#f97316` (orange) |
| **Size** | `#a855f7` (purple) |
| **Quality** | `#22c55e` (green) |
| **Background alternado** | `var(--card2)` para SWRD e AVEM |
| **Valores ausentes** | `—` (dash), cor `var(--muted)` |

**Estrutura**:
```html
<table style="width:100%;border-collapse:collapse">
  <thead><tr>
    <th style="padding:6px 10px;...">ETF</th>
    <th style="color:#3b82f6">Market</th>
    <th style="color:#f97316">Value</th>
    <!-- ... -->
  </tr></thead>
  <tbody>
    <tr style="background:var(--card2)">
      <td><strong>SWRD</strong><br><span style="font-size:.6rem;...">MSCI World</span></td>
      <!-- ... dados -->
    </tr>
  </tbody>
</table>
```

---

### 5. Posições — ETFs Internacionais (IBKR)

#### Layout

| Aspecto | Valor |
|---------|-------|
| **Table ID** | `posTable` |
| **Wrapper** | `overflow-x: auto;` (mobile-friendly) |
| **Colunas** | Ativo, Bucket, Status, PM (USD), Preço, Ganho %, Valor USD, Valor BRL |
| **Font size** | `.7rem` a `.75rem` |
| **Coluna hide-mobile** | PM (USD) — oculta em `480px` |

#### Estrutura de Linha

```html
<tr>
  <td>
    <strong>SWRD</strong>
    <span class="badge-acc">ACC</span>  <!-- badge de acumulação -->
  </td>
  <td><span style="color:#3b82f6;font-size:.7rem">SWRD</span></td>
  <td><span class="badge badge-alvo">alvo</span></td>  <!-- status badge -->
  <td class="num hide-mobile">$32.88</td>
  <td class="num">$48.28</td>
  <td class="num pos">+46.9%</td>  <!-- classe "pos" = cor verde -->
  <td class="num pv">$255.5k</td>
  <td class="num pv">R$1278k</td>
</tr>
```

#### Badges e Classes

| Badge | Tipo | Cor | Uso |
|-------|------|-----|-----|
| `badge-acc` | Acumulação | Default (texto) | ACC (acumulação de dividendos) |
| `badge-alvo` | Status | Default | Posição em alvo |
| `badge-trans` | Status | Default | Transição (rebalanceamento) |
| `.num` | Classe | Right-aligned | Números (preços, quantidades) |
| `.pos` | Classe | Verde | Ganho positivo (%) |
| `.pv` | Classe | Privacy/Monospace | Valores que podem ser ocultados em privacy mode |

#### Rodapé

```html
<div style="margin-top:10px;font-size:.75rem;display:flex;gap:16px;flex-wrap:wrap">
  <span>Total USD: <strong class="pv" id="totalUsd">$631k</strong></span>
  <span>Total BRL: <strong class="pv" id="totalBrl">R$3156k</strong></span>
</div>
```

---

### 6. Base de Custo e Alocação — Equity por Bucket

| Aspecto | Valor |
|---------|-------|
| **Table ID** | `custoBaseTable` |
| **Colunas** | Bucket, Valor USD, Custo USD, Ganho %, Peso equity, Meta equity, Δ (delta) |
| **Font size** | `.82rem` (padrão), `.6rem` (subtitle) |
| **Linhas** | 3 buckets (SWRD, AVGS, AVEM) + 1 total |
| **Cores de bucket** | |
| **SWRD** | `#3b82f6` |
| **AVGS** | `#8b5cf6` |
| **AVEM** | `#06b6d4` |
| **Header style** | `text-align:left; font-weight:600;` |
| **Números** | `text-align:right;` |
| **Border bottom** | `1px solid var(--border)` (entre linhas) |
| **Total row** | `font-weight: 600;` |
| **Delta negativo** | `color: #ef4444` (red) |
| **Delta positivo** | `color: #eab308` (yellow) |

**Observações**:
- Total row tem border-top `1px solid var(--border)` em vez de alternado
- Ganho % em verde (`#22c55e`)
- Custo em `var(--muted)` (cinzento)

---

## Padrões de Design Aplicados

### CSS Classes Reutilizáveis

| Classe | Aplicação | Propriedades |
|--------|-----------|-------------|
| `.section` | Wrapper de seção | `tab-hidden` (oculta fora da aba) |
| `.chart-box` | Container de gráfico padrão | `height: 240px; position: relative;` |
| `.chart-box-sm` | Container pequeno | `height: 180px;` |
| `.chart-box-lg` | Container grande | `height: 320px;` |
| `.src` | Fonte/footnote | `font-size: .6rem; color: var(--muted);` |
| `.num` | Números em tabelas | `text-align: right;` |
| `.pv` | Privacy value | (classe tag para data.json) |
| `.badge` | Badge de status | `padding: 1px 6px; border-radius: 9999px; font-size: .65rem;` |
| `.badge-alvo` | Status "alvo" | Default styling |
| `.badge-trans` | Status "transição" | Default styling |
| `.collapsible` | Seção expansível | Via JS `_toggleBlock()` |

### Cores CSS Variables

```css
--blue-500: #3b82f6      /* SWRD, Equity, Market */
--green-500: #22c55e     /* IPCA+ 2040, ganhos positivos */
--cyan-500: #06b6d4      /* IPCA+ 2029, AVEM */
--orange-500: #f97316    /* Renda+ 2065, Value factor */
--yellow-500: #eab308    /* Crypto, delta positivo */
--purple-500: #a855f7    /* Size factor, AVGS */
--slate-400: #94a3b8     /* Japão, Out.DM, neutro */
--red-500: #ef4444       /* Delta negativo, perdas */
--card2: rgb(var(--card2-rgb)) /* Background alternado */
--muted: rgba(71,85,105,.7)    /* Texto secundário */
--border: rgba(71,85,105,.25)  /* Linhas de tabela */
```

### Tipografia

| Contexto | Font Size | Font Weight | Notes |
|----------|-----------|-------------|-------|
| Header (h2) | Default | 700 | Section titles |
| Table header | .65rem | 600 | `text-transform: uppercase; letter-spacing: .5px;` |
| Table body (padrão) | .72–.75rem | 400 | Monospace data (via data.json) |
| Table body (numérico) | .75rem | 400 | Right-aligned |
| Labels | .68rem | 400–600 | Flex labels ao lado de progresso |
| Fonte/Footnote | .6rem | 400 | `color: var(--muted)` |
| Badge | .65rem | 600 | `text-transform: uppercase;` |
| Inline label (gráfico) | .58rem | 700 | Centrado, cor branca |

### Spacing Padrões

| Elemento | Margin | Padding | Gap |
|----------|--------|---------|-----|
| Section | Herdado | — | — |
| H2 | Default | — | — |
| Stacked bar | `margin-bottom: 8px` | — | — |
| Legend | `margin-top: 6px` | — | `gap: 10px` |
| Table header | — | `6px 10px` | — |
| Table body | — | `5–7px 8px` | — |
| Progress row | `margin-bottom: 4px` | — | — |
| Progress entre linhas | — | — | `gap: 8px` |
| Chart caption | `margin-top: 6px` | `6px 10px` | — |

---

## Responsividade

### Media Query: 480px (Mobile)

```css
@media(max-width:480px) {
  table { font-size: .7rem; }
  th, td { padding: 4px 3px; }
  .chart-box { height: 200px; }
  .hide-mobile { display: none; }
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}
```

### Overflow em Mobile

- **Tables**: Envolvidas em `div` com `overflow-x: auto;`
- **Stacked bars**: Full-width responsivo (flex)
- **Gráficos**: Canvas redimensionado via CSS (height reduzido)

---

## Estrutura de Dados (Data Binding)

### Classes com Dados Dinâmicos

| ID/Class | Fonte | Tipo |
|----------|-------|------|
| `#posTable tbody` | data.json → positions | HTML table rows |
| `#etfRegionTable` | etf_composition.json | Manual HTML |
| `#etfFactorTable` | etf_composition.json | Manual HTML |
| `#custoBaseTable tbody` | data.json → buckets | HTML table rows |
| `#stackedAllocBar` | data.json → allocation | Inline width %, colors |
| `#stackedEquityBar` | data.json → equity weights | Progress bars |
| `.pv` | data.json | Privacy masking via JS |
| `#geoDonut` | Chart.js API (data-driven) | Canvas |

### Privacy Mode

- **Classe `.pv`**: Valores sensíveis (patrimônio, preços BRL)
- **Masking**: Via `privacyMode` JS flag
- **Transformação**: `••••` (4 pontos) em vez de ocultar

---

## Observações Finais

### Consistência

✓ Cores de asset class usadas uniformemente (SWRD=blue, AVGS=purple, AVEM=cyan)
✓ Font sizes escalonadas (headers > body > labels > footnotes)
✓ Padding/gap consistentes em tabelas (6px 10px header, 5px 10px body)
✓ Badges com padrão visual (padding, border-radius, uppercase)

### Gaps Detectados

- **Zebra striping**: Aplicado inconsistentemente (algumas tabelas sim, outras não)
- **Sticky headers**: Não há em nenhuma tabela — scroll em mobile pode perder contexto
- **Monospace numbers**: Não usa `font-variant-numeric: tabular-nums` — alinhamento pode variar
- **Focus states**: Nenhum `:focus` ou `:hover` em elementos de tabela

### Recomendações de Melhoria (Futuro)

1. **Sticky table headers** em `.table-wrapper { position: sticky; top: 0; }` para readabilidade em scroll mobile
2. **Monospace numeral alignment**: `font-family: 'Courier New', monospace; font-variant-numeric: tabular-nums;`
3. **Zebra striping** com `tbody tr:nth-child(odd) { background: var(--card2); }`
4. **Contrast check**: Alguns grays (`#94a3b8`) podem estar abaixo de WCAG AA em backgrounds claros
5. **Focus visible** em badges/buttons para acessibilidade

---

## Checklist de Componentes da ABA-2-CARTEIRA

- [x] Exposição Geográfica (donut chart, `.chart-box-sm`, 180px)
- [x] Alocação barra horizontal (stacked bar, 32px, 5 cores)
- [x] Intra-equity progress bars (3 linhas, alvo visual)
- [x] Composição por Região ETFs (2 tables, grid layout)
- [x] Exposição Fatorial (factor table, 4 fatores)
- [x] Posições IBKR (8 colunas, overflow-x mobile)
- [x] Base de Custo (3 buckets + total, delta colors)
- [x] Footers com totais e fontes

---

**Audit Data**: 2026-04-15 | **HTML Version**: v2.76 | **Dev-reviewed**: Yes
