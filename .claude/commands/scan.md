# Scan — Radar Completo + Atualização Operacional

Voce e o Head (00) executando o ciclo completo de scans e atualização da carteira de Diego.

## O que faz

1. **Scans de inteligência** (paralelo)
2. **Reconciliação** da carteira
3. **Regeneração** de dados + dashboard
4. **Registro** em memórias
5. **Resumo executivo** consolidado
6. **Commit + push**

---

## Fase 1 — Scans (6 agentes em paralelo, background)

Lançar TODOS em paralelo:

### 1a. News 72h (agente macro, model haiku)
WebSearch para notícias das últimas 72h com impacto na carteira.
Filtro de materialidade — só reportar se: decisão de BC, dados macro divulgados, variação >3% em índice ou >10% em BTC, evento geopolítico com impacto em tarifas/EM, mudança em ETF da carteira.
Verificar status dos gatilhos: IPCA+ taxa vs piso 6.0%, Renda+ vs 6.0%/6.5%, HODL11 banda, drift, CDS Brasil.
Se nada material: "Sem eventos materiais." e encerrar.

### 1b. RR Forum (agente general-purpose)
Ler `reference_rational_reminder.md` (memória) para pegar post numbers do último scan.
Escanear as 7+ threads fixas desde o último post lido. Usar MCP Discourse.
Foco: novos ETFs, tracking differences, factor data, consensus shifts.

### 1c. ETFs Mercado (agente general-purpose)
WebSearch para preços e YTD de: SWRD, AVGS, AVEM, HODL11, VWRA, S&P 500, MSCI EM, CAPE, BTC, USD/BRL, Ouro.
Tabela consolidada.

### 1d. ETFs Candidatos (agente factor)
WebSearch para todos os ETFs monitorados e candidatos.
Ler `agentes/referencia/etf-candidatos.md` se existir para baseline.
Verificar: Avantis UCITS novos (AVWC, AVWS, AVEU), Xtrackers (All-World, ex-US, World IMI), pipeline Vanguard, managed futures UCITS.
Foco: AUM, TER, lançamentos, tracking.

### 1e. Macro Brasil (agente macro)
WebSearch para: Selic, IPCA, Focus, IPCA+ 2040/2050, Renda+ 2065, Fed Funds, câmbio, risco fiscal.
Comparar com memória `08-macro.md`.

### 1f. Research Affiliates (agente general-purpose)
WebSearch para expected returns atualizados, CAPE, publicações recentes.
Comparar com memória `reference_research_affiliates.md`.

---

## Fase 2 — Reconciliação (após scans completarem)

Lançar agente bookkeeper:
- Cruzar carteira.md vs data.json vs dados do scan
- Identificar divergências >5%
- Atualizar carteira.md com snapshot atualizado (edits cirúrgicos, só números)
- Listar execuções pendentes

---

## Fase 3 — Regeneração

Após bookkeeper atualizar carteira.md:

```bash
~/claude/finance-tools/.venv/bin/python3 scripts/ibkr_lotes.py --flex   # lotes FIFO + PTAX + IR por lote
~/claude/finance-tools/.venv/bin/python3 scripts/parse_carteira.py
~/claude/finance-tools/.venv/bin/python3 scripts/generate_data.py
cp dashboard/data.json react-app/public/data.json
cd react-app && npx next build
```

Confirmar: todas as pages válidas, versão incrementada.

---

## Fase 4 — Registrar achados

Atualizar memórias com dados novos:
- `reference_rational_reminder.md` — post numbers + resumo do scan
- `reference_research_affiliates.md` — expected returns se mudaram
- Macro scan atualiza `agentes/memoria/08-macro.md` (o agente macro faz direto)

---

## Fase 5 — Resumo Executivo

Apresentar ao Diego em formato compacto:

```
## Scan — {data}

### Veredicto
{1 linha: flag verde/amarelo/vermelho + dado mais importante}

### Mercado & ETFs
{tabela: indicador | valor | vs último scan}

### Macro Brasil
{tabela: indicador | valor}

### Research Affiliates
{tabela: asset class | expected return | delta}

### RR Forum
{bullets: lançamentos, insights, consensus}

### ETFs Candidatos
{tabela: ETF | TER | AUM | veredicto}

### Carteira Viva
{tabela: campo | antes | agora | status}

### Ações
{tabela numerada: ação | urgência}
```

---

## Fase 6 — Commit + Push

```bash
git add -A
git commit -m "chore: scan {data} — [resumo 1 linha]"
git push origin main
```

---

## Notas

- Se algum scan falhar (rate limit, MCP down): registrar como "indisponível" e continuar com os outros
- Se bookkeeper encontrar divergência crítica (>10%): pausar e perguntar a Diego antes de atualizar
- Tempo estimado: ~5 min (scans paralelos) + ~2 min (regen + build)
- Frequência sugerida: mensal, ou antes de decisão de alocação

$ARGUMENTS
