# Dashboard — Gerar HTML da Carteira

Regenera `analysis/dashboard.html` — dashboard single-file com Chart.js, dark theme, responsivo.

## Fluxo

### 1. Codebase (ler em paralelo)

| Arquivo | Dados |
|---------|-------|
| `analysis/backtest_output/ibkr_lotes.json` | Qtde e custo base por ETF |
| `dados/historico_carteira.csv` | Série patrimônio mensal (timeline + CAGR) |
| `agentes/metricas/scorecard.md` | P(FIRE), shadows, TER, tornado, deltas |
| `dados/holdings.md` | RF (IPCA+ 2029/2040, Renda+ 2065) e crypto (HODL11 qtde) |

Não ler `shadow-portfolio.md` separadamente — os dados relevantes estão no scorecard.

### 2. Web (3 buscas, não 5)

| Busca | Dados |
|-------|-------|
| `"SWRD.L AVGS.L AVEM.L AVUV AVDV EIMI.L AVES DGS USSC price today"` | Preços ETFs + câmbio (geralmente nos resultados) |
| `"HODL11 cotação hoje"` + `"USD BRL câmbio hoje"` | HODL11 + câmbio (1 busca pode cobrir ambos) |
| `"USD BRL historical weekly 2026"` + `"PTAX semanal"` | PTAX últimos 3 meses (~15 pontos para Bollinger) |

Se WebSearch falhar para algum preço, ler `analysis/dashboard.html` atual e extrair o valor anterior.

### 3. Computar

Para cada ETF do lotes.json: `valor_usd = qty × preço_atual`, `ganho% = preço / avg_cost - 1`

Buckets, targets e geo breakdown: **ler de `scripts/ibkr_sync.py` (BUCKET_MAP) e `scripts/checkin_mensal.py` (PESOS_TARGET)**. Não hardcodar aqui — se mudarem lá, refletem automaticamente.

### 4. Gerar HTML

**Sobrescrever** `analysis/dashboard.html` com render completo. Estrutura obrigatória do JS:

```js
// Constantes centralizadas (NÃO duplicar valores inline)
const DATA = {
  date: '2026-04-08',
  cambio: 5.25,
  totalBrl: 3527000,
  totalEquityUsd: 608000,
  pfire: {base: 90.4, fav: 94.1, stress: 86.8},
  // ... todos os dados aqui
};
const GENERATED_AT = new Date('2026-04-08');
```

Seções (todas obrigatórias):
- KPI cards: patrimônio, P(FIRE), **crescimento patrimonial** (NÃO "CAGR" — inclui aportes), delta A
- KPI FIRE: anos p/ FIRE, progresso % gatilho, SWR implícita, TWR estimado
- Timeline patrimônio (do CSV, todos os meses sem gaps)
- Donut alocação + donut geográfico (extrair `doughnutOpts()` helper — não repetir config 3x)
- P(FIRE) + tornado (marcar "⚠️ Estimativa" se não veio do `--tornado`)
- Delta bar (**incluir IPCA+ longo**) + progress bars
- Glide path stacked area (**soma = 100% por ano; pós-FIRE = rising equity Pfau-Kitces**)
- FIRE buckets donut
- Tabela posições (com var semanal se disponível)
- Calculadora de aporte (JS interativa, preços nos defaults)
- Shadows (**incluir Shadow C**)
- Bollinger Bands (MA5 ± 2σ)
- TLH monitor
- RF + crypto cards

**Runtime assertions** (incluir no JS):
```js
// Staleness banner
if (Date.now() - GENERATED_AT > 7*86400000) {
  document.querySelector('.header').insertAdjacentHTML('beforeend',
    '<div style="background:#ef4444;color:white;padding:6px;border-radius:6px;margin-top:8px;font-size:.8rem">⚠️ Dashboard desatualizado — rodar /dashboard</div>');
}
// Glide path sum check
glideLabels.forEach((_,i) => {
  const sum = Object.values(glideData).reduce((s,d) => s+d[i], 0);
  console.assert(Math.abs(sum-100) < 0.5, `Glide path ano ${i}: soma ${sum}% ≠ 100%`);
});
```

Não commitar — Diego decide.

### 5. Output

```
Dashboard regenerado: analysis/dashboard.html
Data: DD/MM/AAAA | Patrimônio: R$ X.XXXk | Equity: $XXXk | Câmbio: R$ X.XX
P(FIRE): XX.X% | Cresc. patrimonial: XX.X% (inclui aportes) | Delta A: +X.Xpp
```

## Regras

- **Crescimento patrimonial ≠ retorno de investimento.** NUNCA apresentar como "CAGR" ou "retorno" sem disclaimer "(inclui aportes ~R$300k/ano)". TWR estimado separado.
- **Dados do DATA object, não inline.** Cada valor aparece 1 vez no JS. HTML referencia via Chart.js ou `textContent`.
- **doughnutOpts() helper.** Configs de doughnut chart extraídas em função reutilizável.
- **Bollinger = MA5 ± 2σ.** Não MA20.
- **Glide path soma 100%.** Pós-FIRE = rising equity (Pfau-Kitces). Assertion no JS.
- **Shadow C obrigatório.** Benchmark justo para avaliar tilt fatorial.
- **IPCA+ longo no delta bar.** Maior gap da carteira, não pode ser invisível.
- **Staleness banner.** Se HTML > 7 dias, mostrar alerta vermelho no header.
