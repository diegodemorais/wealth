# Ken French Data Library — Factor Returns Históricos

Voce e o agente factor buscando dados empíricos de retornos fatoriais diretamente da Ken French Data Library (Dartmouth/Tuck) para calibrar premissas da carteira de Diego.

## Objetivo

Puxar séries históricas de retornos fatoriais (Mkt-RF, SMB, HML, RMW, CMA, MOM) para calibrar premissas de retorno esperado dos ETFs AVGS (SCV global), AVEM (EM multi-factor) e SWRD (market). Dados gratuitos, atualizados mensalmente.

## Datasets Relevantes para a Carteira

### Global / Developed Markets (SWRD, AVGS)

| Dataset | URL do ZIP | Fatores |
|---------|-----------|---------|
| FF 3 Fatores Global | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Global_3_Factors_CSV.zip` | Mkt-RF, SMB, HML |
| FF 5 Fatores Global | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Global_5_Factors_CSV.zip` | + RMW, CMA |
| Momentum Global | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Global_Mom_Factor_CSV.zip` | MOM |
| FF 3 Fatores Developed ex-US | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_ex_US_3_Factors_CSV.zip` | Mkt-RF, SMB, HML |
| FF 5 Fatores Developed ex-US | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_ex_US_5_Factors_CSV.zip` | + RMW, CMA |

### Emerging Markets (AVEM)

| Dataset | URL do ZIP | Fatores |
|---------|-----------|---------|
| FF 3 Fatores EM | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Emerging_Markets_3_Factors_CSV.zip` | Mkt-RF, SMB, HML |
| FF 5 Fatores EM | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Emerging_Markets_5_Factors_CSV.zip` | + RMW, CMA |

### US (referência histórica longa — dados desde 1926)

| Dataset | URL do ZIP | Fatores |
|---------|-----------|---------|
| FF 3 Fatores US | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_Factors_CSV.zip` | Mkt-RF, SMB, HML |
| FF 5 Fatores US | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Research_Data_5_Factors_2x3_CSV.zip` | + RMW, CMA |
| Momentum US | `https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/F-F_Momentum_Factor_CSV.zip` | MOM |

## Como Executar

### Passo 1: Definir escopo

A partir da conversa, identificar:
- Qual fator ou ETF precisa de calibração?
- Qual janela histórica? (Full history / pós-2000 / pós-2010 / últimos 10 anos)
- Comparar com premissa atual da carteira? (ex: AVGS usa 5.0% USD multi-fator)

### Passo 2: Baixar e parsear dados

Para cada dataset necessário:

```bash
# Baixar ZIP e extrair CSV
curl -L "{URL_do_ZIP}" -o /tmp/ff_data.zip
unzip -o /tmp/ff_data.zip -d /tmp/ff_data/
```

O CSV tem formato específico: cabeçalho com descrição, depois dados mensais em formato `YYYYMM, Mkt-RF, SMB, HML, RF` (valores em % — ex: `1.23` = 1,23% no mês).

**Atenção ao parse:**
- Linhas de cabeçalho até encontrar linha com formato `YYYYMM`
- Dados anuais ficam no final do arquivo (após os mensais) — separar pelos dois blocos
- Valores são retornos em %, já líquidos do RF para fatores (exceto RF em si)

### Passo 3: Calcular estatísticas

Para cada fator e janela histórica:

```python
import pandas as pd
import numpy as np

# Após parsear o CSV em df com colunas de fatores (valores mensais em %)
df = df / 100  # converter para decimal

# Anualizados
mean_annual = df.mean() * 12
vol_annual = df.std() * np.sqrt(12)
sharpe = mean_annual / vol_annual

# Por janela
for janela in ['full', 'post_2000', 'post_2010', 'post_2015']:
    # filtrar e recalcular
```

### Passo 4: Comparar com premissas da carteira

Premissas atuais (fonte: agentes/contexto/carteira.md):
- Equity premium global (Mkt-RF): ~4.85% USD real (calibrado 2026-04-01)
- AVGS (SCV): ~5.0% USD (haircut 58% aplicado: alpha líquido ~0.16%/ano)
- AVEM (EM multi-factor): prêmio EM + factor loading

Comparar média histórica dos fatores com essas premissas. Sinalizar divergências > 1pp.

---

## Formato do Relatório

```
## Ken French Data — {fatores} — {data}

### Retornos Anualizados por Janela (% USD, geométrico)

| Fator | Full History | Pós-2000 | Pós-2010 | Pós-2015 |
|-------|-------------|----------|----------|----------|
| Mkt-RF Global | X.X% | X.X% | X.X% | X.X% |
| SMB Global | X.X% | X.X% | X.X% | X.X% |
| HML Global | X.X% | X.X% | X.X% | X.X% |
| RMW Global | X.X% | X.X% | X.X% | X.X% |
| CMA Global | X.X% | X.X% | X.X% | X.X% |

### Volatilidade e Sharpe Anualizados

| Fator | Vol (full) | Sharpe (full) | Vol (pós-2010) | Sharpe (pós-2010) |
|-------|-----------|--------------|----------------|-------------------|

### Correlações entre Fatores (full history)

| | SMB | HML | RMW | CMA | MOM |
|-|-----|-----|-----|-----|-----|
| Mkt-RF | | | | | |
| SMB | — | | | | |
...

### Comparação com Premissas da Carteira

| Componente | Premissa atual | Dados históricos (pós-2000) | Status |
|-----------|---------------|----------------------------|--------|
| Equity global (Mkt-RF) | 4.85% | X.X% | ✓ Alinhado / ⚠️ Diverge |
| AVGS — SMB+HML+RMW | ~5.0% | X.X% | ✓ / ⚠️ |
| AVEM — EM Mkt-RF | X.X% | X.X% | ✓ / ⚠️ |

### Insights

- Decay pós-publicação visível? (comparar full history vs pós-2015)
- Correlação SMB/HML alta? (implicações para AVGS)
- EM premium realizado vs esperado?

### Fonte
Ken French Data Library — mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html
Dados até: {mês/ano do último dado no CSV}
```

## Regras

- Sempre reportar a data do último dado disponível no CSV (French atualiza ~60 dias após o mês)
- Usar retorno geométrico (CAGR) para comparação com premissas de longo prazo
- Sempre mostrar múltiplas janelas — full history é enviesado por survivorship; pós-2000 é mais relevante
- Se divergência > 1pp entre premissa da carteira e dado histórico: flag explícita para o Head
- Não ajustar premissas diretamente — reportar ao Head para decisão

## Frequência Recomendada

- **Semestral**: junto com `/literature-review`
- **Ao calibrar premissas de retorno** (ex: após FI-premissas-retorno)
- **Quando Quant ou Factor precisam de dados empíricos de fatores**
- **Após paper novo sobre factor decay** citado pelo Advocate/Fact-Checker
