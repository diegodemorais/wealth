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
1. **Próximas Ações** (TOPO, antes dos KPIs): painel com (a) próximo aporte sugerido (bucket mais subpeso + valor), (b) gatilhos ativos (ex: "IPCA+ DCA ativo — taxa 7.20% > piso 6.0%"), (c) drift alerts (buckets com delta > 5pp). Background amarelo/destaque. Torna o dashboard decisional, não só informativo.
2. **KPI cards**: patrimônio, P(FIRE), **crescimento patrimonial** (NÃO "CAGR" — inclui aportes), delta A
3. **KPI FIRE**: anos p/ FIRE, progresso % gatilho (`patrimonio_atual / 13.4M`), SWR implícita (`250000 / patrimonio_atual`), TWR estimado
4. **Timeline patrimônio** (do CSV, todos os meses sem gaps)
5. **Donut alocação + donut geográfico** (extrair `doughnutOpts()` helper — não repetir config 3x)
6. **P(FIRE) + tornado** (marcar "⚠️ Estimativa" se não veio do `--tornado`)
7. **Delta bar** (**incluir IPCA+ longo**) + progress bars
8. **Glide path stacked area** (**soma = 100% por ano; pós-FIRE = rising equity até 94% aos 60+ conforme carteira.md**)
9. **FIRE buckets donut**
10. **Tabela posições** (com var semanal se disponível)
11. **Calculadora de aporte** (JS interativa, preços nos defaults)
12. **Shadows** (**incluir Shadow C**)
13. **Bollinger Bands** (MA5 ± 2σ)
14. **TLH monitor**
15. **RF + crypto cards**

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

- **O dashboard é OUTPUT gerado — nunca editar o HTML diretamente.** Correções e melhorias vão nesta skill. O HTML é sobrescrito a cada `/dashboard`.
- **Crescimento patrimonial ≠ retorno de investimento.** NUNCA apresentar como "CAGR" ou "retorno" sem disclaimer "(inclui aportes ~R$300k/ano)". TWR estimado separado.
- **Dados do DATA object, não inline.** Cada valor aparece 1 vez no JS. HTML referencia via Chart.js ou `textContent`. CAGR no DATA deve ser igual ao KPI exibido.
- **doughnutOpts() helper.** Configs de doughnut chart extraídas em função reutilizável.
- **Bollinger = MA5 ± 2σ.** Não MA20.
- **Glide path soma 100% em cada ano.** Pós-FIRE = rising equity até 94% aos 60+ (Pfau-Kitces + carteira.md). Assertion no JS.
- **Shadow C obrigatório.** Benchmark justo para avaliar tilt fatorial.
- **IPCA+ longo no delta bar.** Maior gap da carteira, não pode ser invisível.
- **Staleness banner.** Se HTML > 7 dias, mostrar alerta vermelho no header.
- **Progresso FIRE** = `patrimonio_total / 13_400_000`. Computar, não hardcodar.
- **Sem HTML duplicado.** O arquivo final deve ter 1 `<html>`, 1 `<script>`, 1 `<footer>`. Validar antes de salvar.
- **DATA.date = data real da geração.** Usar `date.today()` no header e no JS. Devem ser iguais.

## Backlog de melhorias (sugeridas pelo time, implementar quando oportuno)

- **Performance attribution**: decompor crescimento em câmbio vs equity vs aportes (Advocate)
- **Spending gauge**: custo de vida R$250k vs patrimônio, sensibilidade R$250k/270k/300k (FIRE)
- **Projeção patrimônio**: fan chart P10/P50/P90 até 2040 (FIRE)
- **Guardrails visuais**: tabela de cortes por nível de drawdown (FIRE)
- **Mobile**: tabela posições compacta para 375px, charts com altura responsiva (Advocate)
