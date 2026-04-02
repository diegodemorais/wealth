# AQR Data Sets — Factor Returns Complementares

Voce e o agente factor buscando dados do AQR Data Library para complementar o Ken French. AQR publica gratuitamente fatores que French não cobre: QMJ (Quality), BAB (Betting Against Beta), momentum internacional e time-series momentum.

## Por que AQR complementa Ken French

| Fator | Ken French | AQR |
|-------|-----------|-----|
| Mkt-RF, SMB, HML, RMW, CMA | ✓ | — |
| QMJ (Quality Minus Junk) | ✗ | ✓ — relevante para AVGS (quality tilt) |
| BAB (Betting Against Beta) | ✗ | ✓ — low-volatility premium |
| Momentum internacional | Parcial (US longo) | ✓ — Global, Developed, EM |
| Time-Series Momentum (TSMOM) | ✗ | ✓ — trend following |
| Value (HML Devil) | Parcial | ✓ — versão com P/B mais recente |

## Datasets Disponíveis

Todos em: `https://aqr.com/insights/datasets`

### Prioritários para a carteira de Diego

| Dataset | URL de download | Relevância |
|---------|----------------|-----------|
| Quality Minus Junk (QMJ) | WebSearch: `site:aqr.com "Quality Minus Junk" dataset download` | AVGS tem quality tilt (RMW) — validar premium |
| Betting Against Beta (BAB) | WebSearch: `site:aqr.com "Betting Against Beta" dataset` | Entender low-vol premium vs market |
| Momentum (International) | WebSearch: `site:aqr.com momentum "international" dataset` | Complementa MOM do French para ex-US |
| Time-Series Momentum (TSMOM) | WebSearch: `site:aqr.com "Time Series Momentum" dataset` | Base teórica para trend-following |

### Como acessar

AQR não tem API direta — datasets são Excel/CSV para download. Usar WebFetch ou WebSearch para localizar a página de cada dataset e extrair o link de download.

```
WebFetch: https://aqr.com/insights/datasets
```

Página lista todos os datasets com links de download. Navegar até o dataset desejado e fazer download do Excel/CSV.

## Como Executar

### Passo 1: Localizar dataset

```
WebFetch: https://aqr.com/insights/datasets
```

Identificar o dataset relevante na página. Se WebFetch não retornar o conteúdo completo:
```
WebSearch: site:aqr.com "datasets" "{nome_do_fator}" download Excel
```

### Passo 2: Baixar e parsear

```bash
curl -L "{URL_do_excel_ou_csv}" -o /tmp/aqr_{fator}.xlsx
```

Parsear com Python:
```python
import pandas as pd
df = pd.read_excel('/tmp/aqr_{fator}.xlsx', sheet_name=None)
# AQR geralmente tem aba 'Monthly' e 'Annual'
# Verificar estrutura antes de processar
```

### Passo 3: Calcular estatísticas (mesma metodologia do /ken-french)

- Retorno anualizado por janela (full / pós-2000 / pós-2010 / pós-2015)
- Volatilidade e Sharpe
- Correlação com fatores French correspondentes

### Passo 4: Comparar com premissas da carteira

Premissa atual AVGS: ~5.0% USD (factor premium com haircut 58%).
QMJ premium histórico deve confirmar ou questionar o quality tilt embutido no AVGS.

---

## Formato do Relatório

```
## AQR Data Sets — {fatores} — {data}

### Retornos Anualizados (% USD)

| Fator | Full History | Pós-2000 | Pós-2010 | Pós-2015 |
|-------|-------------|----------|----------|----------|
| QMJ Global | X.X% | X.X% | X.X% | X.X% |
| BAB Global | X.X% | X.X% | X.X% | X.X% |
| MOM Internacional | X.X% | X.X% | X.X% | X.X% |

### Correlação com Fatores French (full history)

| AQR | Correlação com French | Interpretação |
|-----|----------------------|---------------|
| QMJ | r = X.XX vs RMW | QMJ ≈ RMW ou adiciona algo? |
| BAB | r = X.XX vs SMB | — |

### Impacto para a Carteira

| Conclusão | Premissa afetada | Status |
|-----------|-----------------|--------|
| QMJ premium: X.X% histórico | AVGS quality tilt | ✓ Confirma / ⚠️ Questiona |

### Fonte
AQR Data Library — aqr.com/insights/datasets
Dados até: {mês/ano do último dado}
```

## Regras

- Sempre checar data do último dado — AQR atualiza irregularmente (alguns datasets com lag de 1-2 anos)
- Usar em conjunto com `/ken-french` — não substituir, complementar
- Correlação QMJ vs RMW: se alta (r > 0.8), qualidade já está embutida no French — não adiciona
- Não confundir com estratégias AQR de hedge fund — datasets são fatores acadêmicos, não produtos

## Frequência Recomendada

- **Semestral**: junto com `/ken-french` e `/literature-review`
- **Ao calibrar premissa AVGS**: QMJ premium empírico valida o quality tilt
- **Ao debater BAB vs market**: se Advocate questionar low-vol premium
