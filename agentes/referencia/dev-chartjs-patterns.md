# Dev — Chart.js 4 Patterns & Armadilhas

Referência técnica para o agente `dev`. Cada padrão aqui custou horas de debug real.
Origem: DEV-charts-render-2026-04-13 (B2/B3/B4/B7).

---

## 1. Dataset renderer quebrado para valores BRL grandes

**Sintoma:** linha renderiza próxima a R$0 mesmo com dados corretos (ex: trilha_brl com máximo em R$14.4M) e escala Y correta.

**Causa:** bug ou comportamento não-documentado do Chart.js 4.4.7 com valores numéricos muito grandes.

**Fix padrão (afterDraw canvas API):**

```js
// Dataset vazio — só para aparecer na legenda
datasets: [
  { label: 'Projeção', data: [], borderColor: '...', borderDash: [6,3] },
  { label: 'Realizado', data: [], borderColor: '...' },
  // Meta (valor constante): funciona com renderer normal
  { label: 'Meta', data: Array(dates.length).fill(meta), borderColor: '...', pointRadius: 0 },
]

// Plugin afterDraw desenha as linhas problemáticas via canvas API
const plugin = {
  id: 'myDraw',
  afterDraw(chart) {
    const { ctx: c, scales, chartArea } = chart;
    if (!scales.y || !scales.x || !chartArea) return;
    c.save();

    c.beginPath();
    let started = false;
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      if (v == null || !isFinite(v)) { started = false; continue; }
      const xPx = scales.x.getPixelForValue(i);  // índice numérico
      const yPx = scales.y.getPixelForValue(v);   // valor real (BRL)
      if (!started) { c.moveTo(xPx, yPx); started = true; }
      else { c.lineTo(xPx, yPx); }
    }
    c.stroke();
    c.restore();
  }
};
```

**Quando usar:** qualquer linha cujos valores são BRL raw (não em milhões) com magnitude > R$1M.

**Quando NÃO usar:** linhas de valor constante (ex: meta horizontal) — dataset normal funciona.

---

## 2. `getPixelForIndex` removido no Chart.js 4

**Sintoma:** `TypeError: x.getPixelForIndex is not a function` — silencioso, derruba o gráfico inteiro.

**Fix:**

```js
// ERRADO (Chart.js 3)
const xPos = x.getPixelForIndex(idx);

// CORRETO (Chart.js 4)
const xPos = x.getPixelForValue(idx);  // para escala categórica com índice numérico
```

**Onde procurar:** qualquer plugin `afterDraw` que posiciona elementos verticais (linha "hoje", anotações, etc).

---

## 3. Canvas com `offsetWidth === 0` — aba escondida ou seção colapsável

**Sintoma:** gráfico não carrega. Nenhum erro — a função retornou sem renderizar.

**Causa:** canvas dentro de `.tab-hidden` (aba inativa) ou `.collapsible` fechado tem `offsetWidth === 0`. Chart.js não renderiza com dimensão zero.

**Fix obrigatório em TODO builder:**

```js
function buildMeuGrafico() {
  const el = document.getElementById('meuChart');
  if (!el) return;
  // SEMPRE a primeira coisa após verificar existência do elemento:
  if (el.offsetWidth === 0) { setTimeout(buildMeuGrafico, 300); return; }
  // ... resto da função
}
```

**Por que 300ms:** mobile tem layout mais lento que desktop. Double-RAF (~32ms) não é suficiente em devices lentos. 300ms cobre a vasta maioria dos casos sem impacto perceptível.

**Seções colapsáveis:** `_toggleBlock` já chama o builder via `_chartBuilders` ao abrir. O setTimeout retry é necessário para o caso de o builder ter sido chamado antes do layout estabilizar.

---

## 4. Escala Y para dados BRL raw

Sempre calcular `_yMax` dinamicamente — nunca hardcodar:

```js
const _allPos = [...series1, ...series2].filter(v => v != null && isFinite(v) && v > 0);
const _dataMax = _allPos.length ? Math.max(..._allPos) : metaValue;
const _yMax = Math.max(
  Math.min(_dataMax * 1.1, metaValue * 1.5),  // cap em 1.5× meta
  metaValue * 1.1                               // sempre mostra meta com folga
);
```

Tick formatter:
```js
ticks: { callback: v => 'R$' + (v / 1e6).toFixed(1) + 'M' }
```

---

## 5. Destroy antes de recriar

Sempre destruir instância existente antes de recriar — evita canvas leak:

```js
const _ex = Chart.getChart(el);
if (_ex) _ex.destroy();
if (charts.myChart) { try { charts.myChart.destroy(); } catch (_e) {} charts.myChart = null; }
```

---

## 6. Debug mobile — Eruda

Botão `_` no header do dashboard abre o Eruda (console JS completo no browser mobile).
Já integrado — não precisa adicionar. Usar para ver erros silenciosos no celular antes de gastar horas no desktop.

---

## Checklist antes de commitar um novo chart

- [ ] `if (el.offsetWidth === 0) { setTimeout(buildFn, 300); return; }` no início
- [ ] Destroy de instância existente antes de `new Chart(...)`
- [ ] Nenhum `getPixelForIndex` — usar `getPixelForValue`
- [ ] Dados BRL raw em linhas críticas → afterDraw canvas API
- [ ] Escala Y dinâmica com `_yMax` calculado dos dados
- [ ] Tick formatter em milhões (`R$X.XM`)
- [ ] `responsive: true`, `maintainAspectRatio: false`, `animation: false`
