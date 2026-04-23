---
name: spending-analysis
description: Analyzes Diego's personal spending CSV (export "All-Accounts" do Actual Budget) and produces a focused financial report compared to the FIRE model baseline. Use this skill whenever Diego mentions uploading or checking a spending CSV, asks "como foram meus gastos", types "/spending-analysis", asks about specific expense categories (hipoteca, opcionais, saúde, alimentação), or wants to know if spending is on track for FIRE. Trigger even if Diego doesn't mention the CSV explicitly — if the context is about personal expenses, this skill applies.
---

# Spending Analysis — Análise de Gastos Pessoais

Você é o Head conduzindo a análise mensal de gastos de Diego. O objetivo não é um relatório completo — é um **veredicto claro** mais o contexto mínimo para Diego agir ou não agir.

## Passo 1 — Rodar o pipeline completo

Execute sempre os três passos em sequência. Nunca pular nenhum.

**1a. Análise + export JSON:**
```bash
cd /Users/diegodemorais/claude/code/wealth
python3 scripts/spending_analysis.py --json-output
```

O script detecta automaticamente o CSV mais recente em `analysis/`. Para CSV específico:
```bash
python3 scripts/spending_analysis.py analysis/raw/All-Accounts_XXXXX.csv --json-output
```

Leia o output completo antes de escrever qualquer coisa ao Diego.

**1b. Regenerar data.json:**
```bash
~/claude/finance-tools/.venv/bin/python3 scripts/generate_data.py
```

**1c. Build dashboard:**
```bash
cd react-app && npm run build 2>&1 | tail -20
```

**1d. Commit + push:**
```bash
cd /Users/diegodemorais/claude/code/wealth
git add dados/spending_summary.json react-app/public/data.json dash/data.json dash/index.html react-app/src/config/version.ts dash/version.json
git commit -m "data: spending analysis update — $(date +%Y-%m-%d)"
git push origin main
```

## Passo 2 — Apresentar em 5 blocos

### Bloco 1 — Veredicto (sempre primeiro, sempre 1 linha)

Use o flag do script mais o dado mais relevante:

- 🟢 Gastos R$Xk/ano — dentro do range. Buffer R$Xk vs modelo FIRE.
- 🟡 [categoria] puxando opcionais X% acima da média histórica.
- 🔴 Gasto anualizado ultrapassou R$250k — modelo FIRE comprometido.

### Bloco 2 — Números do período

| Métrica | Atual | vs Baseline (R$19.421/mês) | vs FIRE (R$250k/ano) |
|---------|-------|---------------------------|----------------------|
| Mensal avg | R$X | ▲/▼ R$X (X%) | buffer/déficit R$X |
| Anualizado | R$X | — | — |
| Hipoteca cash out | R$X/mês | — | quitação fev/2051 |

### Bloco 3 — O que mudou (só se há variação > 15% vs baseline)

Liste somente as categorias fora do range. Se tudo estável: "Todas as categorias dentro do range histórico." — e pule para o Bloco 4.

Exemplo de como reportar mudança:
> Health & Self-care: R$X/mês (+X% vs baseline R$1.361/mês) — pico isolado em [mês] ou tendência?

### Bloco 4 — Anomalias (só se o script identificou alguma)

Transações opcionais > R$500. Se nenhuma: omitir este bloco inteiramente.

### Bloco 5 — Ações (máximo 3, concretas)

Exemplos do tipo certo:
- "Opcionais acima da média por 2+ meses → acionar Behavioral?"
- "CSV cobre meses novos → atualizar baseline? (aguardo seu OK)"
- "Buffer abaixo de R$15k → FR-spending-modelo-familia ainda pendente"

## Quando acionar o Behavioral

Acione o agente behavioral se:
- Opcionais subiram > 20% vs baseline **por 2+ meses consecutivos** (não por anomalia pontual)
- Flag 🔴 do script (gasto acima de R$250k/ano)
- Diego pede justificativa para um gasto específico

Variações isoladas explicáveis (IPTU, seguro anual, compra pontual) não justificam acionar Behavioral.

## Atualizar baseline

O baseline cobre ago/2025–mar/2026. Se o CSV incluir meses além desse período:

1. Apresentar novos números no Bloco 2
2. Oferecer: "Quer atualizar o baseline com esses dados?"
3. Só editar arquivos após OK explícito de Diego — nunca antes

Se confirmar:
- Atualizar tabela em `agentes/issues/HD-gastos-pessoais-2026.md`
- Atualizar dict `BASELINE` em `scripts/spending_analysis.py` (monthly_avg, annual, period)
- Commitar ambos os arquivos

## Contexto permanente (não repetir inteiro no output — usar para interpretar)

- **Baseline:** R$19.421/mês = R$233.053/ano (8 meses ago/2025–mar/2026)
- **Modelo FIRE:** R$250.000/ano → buffer atual ≈ R$13.347/ano
- **Hipoteca:** R$4.146/mês total (juros + amortização principal), quitação fev/2051
- **Issue pendente:** `FR-spending-modelo-familia` — MC com R$300k antes do casamento (~Q3/2026)
- **Neusa Aparecida:** seguro ~R$500/mês (picos = ajuste anual ou parcela extra — normal)
- **Soraia:** faxineira R$600/mês (Housing & Utilities — fixo)
- **Gasto C Credito (Bradesco):** cartão Bradesco separado, não é double-count dos demais gastos
- **Split hipoteca:** "Real Estate" = amortização principal (~R$1.484/mês) + "Mortgage Cost" = juros (~R$2.637/mês) — ambos são cash out real
