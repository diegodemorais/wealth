# Mapa de Propagação de Aportes — Cascata de Atualização

**Data**: 2026-04-13  
**Propósito**: Guia determinístico para garantir que TODA mudança de aporte se propague corretamente através do dashboard.

---

## 1. Entradas de Dados (Fonte de Verdade)

### 1.1 Aportes Equity (USD via IBKR)
- **Fonte primária**: `dados/ibkr/aportes.json` (total_usd)
  - Exemplo: `"total_usd": 391043` (acumulado desde inception)
  - Atualizado por: `analysis/ibkr_analysis.py` (processa Flex Query)
  
- **Campo dependente**: `dados/dashboard_state.json`
  - Path: `equity_attribution.total_aportado_usd`
  - Cascata: → `equity_brl` (conversão por câmbio)

### 1.2 Aportes RF (BRL via XP/Nubank)
- **Fonte primária**: `dados/historico_carteira.csv` (coluna `rf_brl`)
  - Exemplo (2026-04-28): `rf_brl = 274227.74`
  - Representa: posição acumulada ao final do mês
  - **IMPORTANTE**: Não é "aporte do mês", é "saldo RF ao fim do mês"

- **Campo dependente**: `dados/dashboard_state.json`
  - Paths: `rf.ipca2029.valor_brl`, `rf.ipca2040.valor_brl`, `rf.ipca2050.valor_brl`, `rf.renda2065.valor_brl`
  - Cascata: soma dos instrumentos = total RF

### 1.3 Aportes Cripto (BTC via Binance)
- **Fonte primária**: `dados/binance/` (saldo atual, preço BTC-USD)
  - Exemplo: `hodl11.qty × hodl11.preco_brl`
  - Atualizado por: manual sync ou API Binance

- **Campo dependente**: `dados/dashboard_state.json`
  - Path: `hodl11.valor_brl = qty × preco_brl`
  - Cascata: → crypto_brl total

---

## 2. Transformação de Dados (`scripts/generate_data.py`)

### 2.1 Leitura de Entrada
```
historico_carteira.csv
  ↓
Linha atual (última) extrai:
  - aporte_brl (deposito mensal)
  - aporte_usd (deposito IBKR mensal)
  - rf_brl (saldo RF acumulado)
  - equity_brl (saldo equity BRL)
  - patrimonio_brl (total acumulado)
```

### 2.2 Geração de Blocos Dependentes de Aporte

| Bloco | Campo | Dependência | Lógica |
|-------|-------|------------|--------|
| **premissas_vs_realizado** | `aporte_mensal.realizado_brl` | historico_carteira.csv | Linha atual: `aporte_brl` |
| **dca_status** | `{ipca2040, ipca2050, renda_plus}.gap_alvo_pp` | dashboard_state.json + premissas | `% alvo - % atual` |
| **patrimonio_total** | `total_brl` | dashboard_state (soma rf + equity + risco) | `rfBrl + equityBrl + cryptoBrl + cambio` |
| **kpi_alocacao_atual** | `equity_pct`, `rf_pct`, `risco_pct` | patrimonio_total | `(segment_brl / total_brl) * 100` |
| **patrimonio_evolucao** | linhas histórico | historico_carteira.csv | Cada linha = mês |
| **fire_matrix** | P(FIRE), patrimonio_mediano | fire_montecarlo.py + aporte_mensal | Entrada: aporte_mensal atual |
| **premissas** | `aporte_mensal` | spec.json (constante) | Valor esperado esperado mensal |
| **wellness** | `savings_rate` | aporte_mensal / renda estimada | Taxa de acumulação |

---

## 3. Arquivos a Atualizar Quando Há Novo Aporte

### 3.1 Aporte Equity (novo aporte USD em IBKR)

**Quando**: Aporte recebido e processado em IBKR

**Etapas**:
1. ✅ `analysis/ibkr_analysis.py` lê Flex Query → `dados/ibkr/aportes.json` atualizado
2. ✅ `dados/dashboard_state.json` → atualizar:
   - `patrimonio.equity_usd` (novo total)
   - `patrimonio.equity_brl = equity_usd × cambio`
   - `equity_attribution.total_aportado_usd` (novo total)
3. ✅ `dados/historico_carteira.csv` → adicionar linha nova ao final:
   - `aporte_usd` = novo valor do mês
   - `equity_usd` = novo total IBKR
4. ✅ Rodar `scripts/generate_data.py`:
   - Relê CSV → atualiza `data.json` com `premissas_vs_realizado.aporte_mensal.realizado_usd`
   - Recalcula `patrimonio_total`, `kpi_alocacao_atual`, `patrimonio_evolucao`
5. ✅ Rodar `scripts/build_dashboard.py`:
   - Injeta novo `data.json` em template.html → `dashboard/index.html`

**Blocos afetados**:
- `patrimonio-total-hero` (KPI)
- `kpi-alocacao-atual` (% equity atualiza)
- `patrimonio-evolucao-historica` (nova linha)
- `premissas-vs-realizado` (aporte_usd na coluna realizado)
- `fire-matrix` (patrimônio inicial muda)

---

### 3.2 Aporte RF (novo aporte BRL em XP/Nubank)

**Quando**: Aporte RF executado e confirmado em custódia

**Etapas**:
1. ✅ Adicionar/atualizar instrumento em `dados/dashboard_state.json`:
   ```json
   "rf": {
     "ipca2040": { "valor_brl": XXX, "taxa": Y, ... },
     "ipca2050": { "valor_brl": YYY, "taxa": Z, ... }
   }
   ```
2. ✅ Calcular novo total RF:
   ```
   rf_brl_novo = ipca2029.valor + ipca2040.valor + ipca2050.valor + renda2065.valor
   ```
3. ✅ `dados/historico_carteira.csv` → adicionar/atualizar linha:
   - `rf_brl` = novo total RF acumulado
   - `patrimonio_brl` = equity_brl + rf_brl + crypto_brl + cambio
   - `aporte_brl` = (patrimonio_brl_novo - patrimonio_brl_old) - var_marcacao
4. ✅ Rodar `scripts/generate_data.py`:
   - Recalcula `dca_status` (ipca2040, ipca2050 separados)
   - Recalcula `bond_pool_runway` (rf_brl novo)
   - Atualiza `premissas_vs_realizado.aporte_mensal.realizado_brl`
   - Atualiza `patrimonio_total`
5. ✅ Rodar `scripts/build_dashboard.py`:
   - Injeta novo `data.json` → `dashboard/index.html`

**Blocos afetados**:
- `patrimonio-total-hero` (RF aumenta)
- `kpi-alocacao-atual` (% RF atualiza)
- `dca-status-semaforo` (ipca2040 e ipca2050 gaps recalculam)
- `rf-carteira` (posições RF mostram)
- `bond-pool-composition` (contagem de anos até retire)
- `patrimonio-evolucao-historica` (nova linha)
- `premissas-vs-realizado` (aporte_brl atualizado)
- `fire-matrix` (patrimônio inicial muda)
- `wellness-score` (ipca_gap recalcula)

---

### 3.3 Aporte Cripto / HODL11 (novo aporte BTC)

**Quando**: Compra BTC executada em Binance

**Etapas**:
1. ✅ Atualizar `dados/binance/hodl11.json` ou planilha:
   - `qty` = nova quantidade
   - `avg_cost` = novo custo médio
   - `preco_brl` = preço BTC em BRL (atualizado)
2. ✅ Calcular `hodl11.valor_brl = qty × preco_brl`
3. ✅ Atualizar `dados/dashboard_state.json`:
   ```json
   "hodl11": {
     "qty": XXX,
     "preco_brl": YYY,
     "valor_brl": XXX * YYY,
     "avg_cost": ZZZ
   }
   ```
4. ✅ `dados/historico_carteira.csv` → atualizar linha (se não houver coluna crypto_brl):
   - **NOTA**: CSV atual tem `rf_brl` mas NÃO tem coluna `crypto_brl` separada
   - Se adicionar coluna: `crypto_brl` = novo valor HODL11
   - `patrimonio_brl` recalcula = equity_brl + rf_brl + crypto_brl
5. ✅ Rodar `scripts/generate_data.py`:
   - Recalcula `patrimonio_total` (crypto_brl novo)
   - Recalcula `kpi_alocacao_atual` (% risco)
6. ✅ Rodar `scripts/build_dashboard.py`

**Blocos afetados**:
- `patrimonio-total-hero` (BTC aumenta)
- `kpi-alocacao-atual` (% risco atualiza)
- `patrimonio-evolucao-historica` (nova linha)
- `hodl11-posicao` (valor BRL)
- `fire-matrix` (se alocação risco muda muito)
- `wellness-score` (alocação geo/risco)

---

## 4. Checklist de Sincronização

Quando executar novo aporte, verificar:

### Para Aportes Equity (USD):
- [ ] IBKR Flex Query processado (`ibkr_analysis.py`)
- [ ] `dashboard_state.json`: `patrimonio.equity_usd` atualizado
- [ ] `dashboard_state.json`: `patrimonio.equity_brl` recalculado
- [ ] `dashboard_state.json`: `equity_attribution.total_aportado_usd` atualizado
- [ ] `historico_carteira.csv`: nova linha com `aporte_usd`, `equity_usd`, `patrimonio_brl`
- [ ] `generate_data.py` rodado
- [ ] `build_dashboard.py` rodado
- [ ] Testar blocos: patrimonio-total-hero, kpi-alocacao-atual, patrimonio-evolucao, fire-matrix

### Para Aportes RF (BRL):
- [ ] Custódia (XP) confirmada posição
- [ ] `dashboard_state.json`: `rf.{ipca2040,ipca2050,renda2065}.valor_brl` atualizado
- [ ] `dashboard_state.json`: `rf.{ipca2040,ipca2050,renda2065}.taxa` atualizado (se houver mudança)
- [ ] `historico_carteira.csv`: nova linha com `rf_brl` (saldo acumulado), `patrimonio_brl`
- [ ] `generate_data.py` rodado:
  - `dca_status` recalculado
  - `bond_pool_runway` recalculado
  - `premissas_vs_realizado.aporte_mensal.realizado_brl` atualizado
- [ ] `build_dashboard.py` rodado
- [ ] Testar blocos: dca-status, rf-carteira, bond-pool, premissas-vs-realizado, fire-matrix

### Para Aportes Cripto (BTC):
- [ ] Binance confirmado aporte
- [ ] `dashboard_state.json`: `hodl11.qty`, `hodl11.preco_brl`, `hodl11.valor_brl`, `hodl11.avg_cost` atualizados
- [ ] `historico_carteira.csv`: nova linha com `crypto_brl` (se coluna existir), `patrimonio_brl`
- [ ] `generate_data.py` rodado
- [ ] `build_dashboard.py` rodado
- [ ] Testar blocos: patrimonio-total-hero, kpi-alocacao, hodl11-posicao

---

## 5. Ordem de Execução (Fast Path)

1. Atualizar fonte primária (CSV ou JSON de estado)
2. Rodar `scripts/generate_data.py`
3. Rodar `scripts/build_dashboard.py`
4. Testar blocos relevantes com `python scripts/test_dashboard.py --smart`
5. Git commit com mensagem descritiva (tipo: aporte)
6. Git push

---

## 6. Mapeamento de Blocos → Aportes

| Bloco | Equity | RF | BTC | Recalc em |
|-------|--------|----|----|-----------|
| patrimonio-total-hero | ✓ | ✓ | ✓ | build_dashboard.py |
| kpi-alocacao-atual | ✓ | ✓ | ✓ | generate_data.py |
| dca-status-semaforo | | ✓ | | generate_data.py |
| rf-carteira | | ✓ | | template.html (dados) |
| bond-pool-composition | | ✓ | | generate_data.py |
| patrimonio-evolucao | ✓ | ✓ | ✓ | generate_data.py |
| premissas-vs-realizado | ✓ | ✓ | | generate_data.py |
| fire-matrix | ✓ | ✓ | ✓ | fire_montecarlo.py |
| wellness-score | ✓ | ✓ | ✓ | generate_data.py |
| hodl11-posicao | | | ✓ | template.html |

---

## Notas Críticas

1. **Historico_carteira.csv é o Registro Permanente**: 
   - Cada linha = snapshot mensal de fim de mês
   - `aporte_brl` = novo capital aportado naquele mês (não incluindo retorno)
   - Se mudança intra-mês, **não adiciona nova linha**, atualiza dashboard_state.json e roda generate_data

2. **DCA Status é Casa Separada**:
   - Cada instrumento IPCA tem seu próprio `taxa`, `piso`, `gap_alvo_pp`
   - Quando novo aporte RF entra, TODOS os 3 (ipca2040, ipca2050, renda2065) precisam ser revisados
   - Gap recalcula: `gap_alvo_pp = alvo_pct - (valor_brl / patrimonio_total * 100)`

3. **Fire Matrix Sensível a Patrimônio**:
   - Aporte novo muda `patrimonio_inicial` para MC
   - MC roda com 10k trajetórias → P(FIRE) novo
   - Se aportes tiverem mudado significativamente, SEMPRE rodar `fire_montecarlo.py` antes de build

4. **Não Fazer Hardcode**:
   - Nenhum valor de aporte deve ser codificado em template.html ou build_dashboard.py
   - Tudo vem de `data.json` gerado por `generate_data.py`

5. **GIT Commits Devem Detalhar**:
   - Titulo: `aporte: rf ipca2040 R$46k + ipca2050 R$11k (2026-04-10)`
   - Body: listar todos os blocos recalculados e testes rodados

---

**Última atualização**: 2026-04-13 (mapa v1.0)
