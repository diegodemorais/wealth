# Spending Analysis — Análise de Gastos Pessoais

Você é o Head conduzindo a análise de gastos pessoais de Diego com suporte do Bookkeeper e FIRE.

## Quando usar

- Diego fez upload de um novo CSV de gastos (All-Accounts export)
- Diego pede revisão dos gastos ou "/spending-analysis"

## Passo 1 — Rodar o script

Execute o script Python que processa o CSV completo:

```bash
python3 scripts/spending_analysis.py
```

O script detecta automaticamente o CSV mais recente em `analysis/`. Se quiser especificar um arquivo:

```bash
python3 scripts/spending_analysis.py analysis/All-Accounts_XXXXX.csv
```

## Passo 2 — Apresentar findings ao Diego

Com base no output do script, apresente no formato:

```
## Spending Analysis — {período}

### Headline
{1 frase: gasto dentro/fora do range, vs baseline e vs modelo FIRE}

### Totais
| Métrica | Valor | vs Baseline | vs Modelo FIRE |
|---------|-------|-------------|----------------|
| Mensal avg | R$X | ▲/▼ X% | dentro/fora |
| Anualizado | R$X | ▲/▼ X% | buffer R$X |
| Hipoteca total | R$X/mês | — | até 2051 |

### Essenciais vs Opcionais
{tabela mensal compacta}

### Anomalias do período
{lista das transações > R$500 em opcionais}

### Aportes detectados
{total excluído da análise}

### Flags
{apenas os flags que o script emitiu — 🔴 🟡 🟢}
```

## Passo 3 — Análise comportamental (se novo CSV)

Acione o agente Behavioral se:
- Opcionais subiram > 20% vs baseline
- Nova categoria com gasto relevante apareceu
- Flags 🔴 ou múltiplos 🟡

## Passo 4 — Atualizar baseline (apenas se novo período)

Se o CSV cobre um período NOVO (meses não incluídos no baseline anterior `HD-gastos-pessoais-2026`):

1. Apresentar os novos números ao Diego
2. Perguntar: "Quer atualizar o baseline no HD-gastos-pessoais-2026 e na memória do Bookkeeper?"
3. Aguardar confirmação antes de editar qualquer arquivo (L-24)

Se confirmar:
- Atualizar `agentes/issues/HD-gastos-pessoais-2026.md` com os novos dados
- Atualizar `BASELINE` dict em `scripts/spending_analysis.py` (monthly_avg, annual, period)
- Commitar

## Regras

- **Nunca editar arquivos antes de Diego confirmar** (L-24)
- O script já exclui investimentos (Short-term/Long-term Goals) automaticamente
- O script já trata o split da hipoteca (principal + juros separados)
- Amortização do principal (~R$1.484/mês) é cash out real — inclui no total
- "Gasto C Credito" do Bradesco = cartão Bradesco separado (não double-count com Nubank)
- Fev+Mar podem ter desencaixe de datas no CSV histórico — analisar combinados se necessário

## Contexto importante

- **Baseline atual:** R$19.421/mês = R$233.053/ano (ago/2025–mar/2026, 8 meses)
- **Modelo FIRE:** R$250.000/ano (carteira.md)
- **Buffer:** R$13.347/ano — insuficiente para absorver casamento + filho
- **Hipoteca:** R$4.146/mês (termina fev/2051, age 64)
- **Issue pendente:** `FR-spending-modelo-familia` — rodar MC com R$300k antes do casamento
- **Neusa Aparecida:** seguro mensal ~R$500 (picos = ajuste anual ou parcela extra)
- **Soraia:** faxineira R$600/mês (Housing & Utilities)
