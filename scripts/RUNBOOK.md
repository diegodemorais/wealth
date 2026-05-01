# Runbook — Pipeline de Dados da Carteira de Diego Morais

> **Maintainer:** Dev  
> **Criado em:** 2026-05-01 (XX-system-audit)  
> **Atualizar em:** mudança estrutural de script, novo step no pipeline, novo fallback.

---

## 1. Execução Padrão (diária)

Venv: `~/claude/finance-tools/.venv/bin/python3`

### Pre-requisitos opcionais (rodar antes se dados IBKR estão desatualizados)

```bash
# Sync posições IBKR (Flex Query — precisa de token IBKR)
python3 scripts/ibkr_sync.py --cambio <ptax_hoje>

# Parse carteira.md → carteira_params.json → config.py
python3 scripts/parse_carteira.py

# Check-in mensal com shadows A/B/C (rodar ao final de cada mês)
python3 scripts/checkin_mensal.py
```

### Reconstruct snapshots (quando desatualizados ou após mudança de parâmetros)

```bash
# Snapshots de FIRE (fire_matrix, fire_trilha, drawdown_history, bond_pool_runway, etc.)
# Lento: ~60s para fire_matrix com --n-sim 1000
python3 scripts/reconstruct_fire_data.py

# Histórico de retornos (retornos_mensais.json, rolling_metrics.json)
# Precisa de historico_carteira.csv atualizado
python3 scripts/reconstruct_history.py

# Factor snapshot (factor_snapshot.json) — Ken French + OLS por ETF
python3 scripts/reconstruct_factor.py

# Macro snapshot (macro_snapshot.json) — plano_status, wellness
python3 scripts/reconstruct_macro.py

# IR diferido atualizado (tax_snapshot.json)
python3 scripts/reconstruct_tax.py

# PnL realizado (realized_pnl.json)
python3 scripts/reconstruct_realized_pnl.py
```

### Pipeline principal

```bash
# Execução completa (busca preços live via yfinance)
python3 scripts/generate_data.py

# Sem busca de preços (usa estado do dashboard_state.json — mais rápido)
python3 scripts/generate_data.py --skip-prices
```

---

## 2. DAG do Pipeline (Ordem Canônica)

```
carteira.md
    └── parse_carteira.py                 → dados/carteira_params.json → config.py

ibkr_sync.py (ou lotes.json manual)      → dados/ibkr/lotes.json
fetch_historico_sheets.py                 → dados/historico_carteira.csv (fonte primária)
checkin_mensal.py                         → state.shadows.{periodo} (mensal)

[Reconstruct snapshots — podem rodar em paralelo]
reconstruct_fire_data.py                  → dados/fire_matrix.json
                                          → dados/fire_trilha.json
                                          → dados/fire_swr_percentis.json
                                          → dados/fire_aporte_sensitivity.json
                                          → dados/drawdown_history.json
                                          → dados/bond_pool_runway.json
                                          → dados/lumpy_events.json
                                          → dados/etf_composition.json
reconstruct_history.py                    → dados/retornos_mensais.json
                                          → dados/rolling_metrics.json
reconstruct_factor.py                     → dados/factor_snapshot.json
reconstruct_macro.py                      → dados/macro_snapshot.json
reconstruct_tax.py                        → dados/tax_snapshot.json
reconstruct_realized_pnl.py               → dados/react-app/public/data/realized_pnl.json
spending_analysis.py                      → dados/spending_summary.json
                                          → state.spending.scenarios (TODO: não implementado)

[Pipeline principal]
generate_data.py
    ├── Lê: config.py, dashboard_state.json, todos os JSONs acima
    ├── Importa (Python direto):
    │   ├── fire_montecarlo.py         → P(FIRE), P(quality), trajetórias MC, tornado
    │   ├── pfire_engine.py            → PFireEngine (P(FIRE) canônico)
    │   ├── tax_engine.py              → IR diferido Lei 14.754/2023
    │   ├── bond_pool_engine.py        → Bond pool gap e runway
    │   ├── guardrail_engine.py        → Guardrails de retirada
    │   ├── swr_engine.py              → SWR engine
    │   ├── risk_metrics.py            → Métricas de risco, semáforos
    │   └── pfire_transformer.py       → Canonicalização de P(FIRE)
    ├── Subprocess:
    │   ├── reconstruct_fire_data.py   → (se fire_matrix ausente ou stale)
    │   ├── fire_montecarlo.py --tornado → (análise sensibilidade)
    │   ├── backtest_portfolio.py      → (séries de backtest)
    │   ├── backtest_portfolio.py --r7 → (backtest R7)
    │   └── reconstruct_realized_pnl.py → (PnL realizado)
    ├── yfinance: preços ETFs, HODL11, USD/BRL
    └── Escreve: react-app/public/data.json
```

---

## 3. Classificação dos Scripts

### CORE — Chamados por generate_data.py (obrigatórios para data.json)

| Script | Como chamado | Output |
|--------|-------------|--------|
| `fire_montecarlo.py` | import Python direto | P(FIRE), trajetórias, guardrails, tornado |
| `pfire_engine.py` | import Python direto | P(FIRE) canônico |
| `pfire_transformer.py` | import Python direto | Canonicalização |
| `tax_engine.py` | import Python direto | IR diferido ETFs |
| `bond_pool_engine.py` | import Python direto | Bond pool gap/runway |
| `guardrail_engine.py` | import Python direto | Guardrails retirada |
| `swr_engine.py` | import Python direto | SWR engine |
| `risk_metrics.py` | import Python direto | Métricas de risco, semáforos |
| `config.py` | import Python direto | Constantes canônicas |
| `reconstruct_fire_data.py` | subprocess (condicional) | JSONs de FIRE |
| `backtest_portfolio.py` | subprocess | Séries de backtest |
| `reconstruct_realized_pnl.py` | subprocess (condicional) | PnL realizado |

### AUXILIAR — Chamados pelo CORE ou pré-requisitos do pipeline

| Script | Chamado por | Output |
|--------|------------|--------|
| `parse_carteira.py` | Manual pré-pipeline | `carteira_params.json` → `config.py` |
| `reconstruct_history.py` | Manual pré-pipeline | `retornos_mensais.json`, `rolling_metrics.json` |
| `reconstruct_factor.py` | Manual pré-pipeline | `factor_snapshot.json` |
| `reconstruct_macro.py` | Manual pré-pipeline | `macro_snapshot.json` |
| `reconstruct_tax.py` | Manual pré-pipeline | `tax_snapshot.json` |
| `fx_utils.py` | generate_data (attribution) | PTAX, decomposição retorno |
| `ibkr_lotes.py` | Manual pré-pipeline | `lotes.json` |
| `ibkr_sync.py` | Manual pré-pipeline | Posições IBKR |
| `market_data.py` | CLI standalone | Dados de mercado em tempo real |
| `spending_analysis.py` | generate_data (spending_breakdown) | `spending_summary.json` |
| `fetch_historico_sheets.py` | Pré-reconstruct_history | `historico_carteira.csv` |
| `withdrawal_engine.py` | fire_montecarlo.py | Estratégias de retirada |

### STANDALONE — CLIs usados por Diego diretamente (não no pipeline diário)

| Script | Propósito |
|--------|-----------|
| `checkin_mensal.py` | Shadow A/B/C + scorecard mensal |
| `portfolio_analytics.py` | TWR, fronteira eficiente, stress test |
| `multi_llm_query.py` | Decisões >5% portfolio (obrigatório CLAUDE.md) |
| `market_data.py` | Dados macro/ETFs/fatores em tempo real |
| `factor_regression.py` | Regressão Fama-French 5-factor |
| `resampled_frontier.py` | Michaud Resampled Frontier |
| `spending_analysis.py` | Análise de gastos (CSV Actual Budget) |
| `brfiresim.py` | Historical cycle simulation (BR) |
| `btc_indicators.py` | Indicadores BTC |
| `tlh_monitor.py` | Monitor TLH |

### TESTE — Scripts de teste e validação

| Script | Propósito |
|--------|-----------|
| `scripts/tests/*.py` | 34 arquivos de teste pytest |
| `validate_data.py` | Validação básica de data.json (CI) |
| `validate_schema.py` | Validação spec.json ↔ data.json |
| `validators.py` | Framework de validação (importado por data_pipeline_engine) |
| `snapshot_schemas.py` | Schemas de snapshots (importado por data_pipeline_engine) |
| `ci_check_carteira_params.py` | CI pre-check carteira_params.json |
| `detect_hardcoding.py` | Detecta constantes hardcoded fora de config.py |

### UTILITÁRIOS — Ferramentas de manutenção (não no pipeline diário)

| Script | Propósito |
|--------|-----------|
| `pipeline_archive.py` | Arquiva snapshots >7 dias |
| `snapshot_archive.py` | Archive/replay de snapshots |
| `sync_spec.py` | Sync spec.json com componentes React |
| `data_pipeline_engine.py` | Orquestrador centralizado (arquitetura futura) |
| `parse_nubank_operations.py` | Parseia extratos Nubank |
| `binance_analysis.py` | Valoriza posições Binance |
| `check_gatilhos.py` | Monitor de gatilhos |

### ARQUIVO — Scripts arquivados (não usar)

Ver `scripts/archive/README.md` para lista completa e critério de restauração.

---

## 4. Quando um Step Falha

### yfinance indisponível

**Impacto:** Preços de ETFs e câmbio USD/BRL não atualizados.

**O que acontece:** 
- `get_posicoes_precos()` captura `Exception` e loga `⚠️ yfinance: <erro>`
- Câmbio usa `CAMBIO_FALLBACK` de `config.py` (valor hardcoded da última atualização manual)
- Assertion `assert cambio > 0` ainda passa (fallback é positivo)
- Pipeline **continua**, mas patrimônio em BRL fica estimado

**O que fazer:**
```bash
# Opção 1: rodar sem preços (usa estado do dashboard_state.json)
python3 scripts/generate_data.py --skip-prices

# Opção 2: verificar se yfinance está acessível
python3 -c "import yfinance as yf; print(yf.download('SWRD.L', period='1d'))"

# Opção 3: atualizar CAMBIO_FALLBACK em config.py com PTAX atual
python3 scripts/market_data.py --macro-br | python3 -m json.tool | grep ptax
```

### IBKR Flex não responde

**Impacto:** Posições IBKR não atualizadas (lotes.json stale).

**O que acontece:**
- `ibkr_sync.py` falha — lotes.json fica com data antiga
- `generate_data.py` usa `lotes.json` existente — dados de posições são stale

**O que fazer:**
```bash
# Verificar mtime de lotes.json
ls -la dados/ibkr/lotes.json

# Re-rodar ibkr_sync quando IBKR Flex disponível
python3 scripts/ibkr_sync.py --cambio <ptax>

# Alternativa: atualizar lotes.json manualmente via ibkr_lotes.py
python3 scripts/ibkr_lotes.py --flex
```

### fire_montecarlo lento / timeout

**Impacto:** P(FIRE) pode usar valores do `dashboard_state.json` (stale).

**O que acontece:**
- Monte Carlo via import Python direto — sem timeout explícito
- Se falhar, `get_pfire_tornado()` usa fallback do `state.fire.pfire_base`
- `fire_montecarlo.py --tornado` via subprocess: se falhar, usa tornado do state

**O que fazer:**
```bash
# Rodar fire_montecarlo separadamente para pré-popular o state
python3 scripts/fire_montecarlo.py --anos 11

# Verificar state
python3 -c "import json; s=json.load(open('dados/dashboard_state.json')); print(s.get('fire', {}).get('pfire_base'))"
```

### reconstruct_fire_data.py ausente/falha

**Impacto:** `drawdown_history.json`, `fire_matrix.json`, `fire_trilha.json` ficam stale.

**O que acontece:**
- generate_data.py detecta ausência e tenta rodar `reconstruct_fire_data.py` via subprocess
- Se subprocess falha também: usa JSON existente (stale) ou `{}` empty
- Snapshot validator avisa se >48h ou bloqueia se >168h (crítico: fire_matrix, fire_trilha, fire_swr_percentis)

**O que fazer:**
```bash
python3 scripts/reconstruct_fire_data.py
# Lento (~60s para fire_matrix)
# Para regenerar só um step:
python3 scripts/reconstruct_fire_data.py --only drawdown_history
```

### reconstruct_history.py / retornos_mensais.json ausente

**Impacto:** Retornos mensais, rolling Sharpe, decomposição de retorno ficam sem dados.

**O que acontece:**
- `generate_data.py` tenta ler `dados/retornos_mensais.json`; se ausente, cai para CSV fallback
- `retorno_decomposicao` e `correlation_stress` usam cache fallback (`dados/retorno_decomposicao_cache.json`)

**O que fazer:**
```bash
# Garantir que historico_carteira.csv está atualizado primeiro
python3 scripts/fetch_historico_sheets.py  # ou copiar manualmente

# Rodar reconstruct_history
python3 scripts/reconstruct_history.py
```

### pyield/ANBIMA indisponível (taxas NTN-B)

**Impacto:** `ntnb_history` e taxas RF não atualizadas.

**O que acontece:**
- `build_ntnb_history()` falha silenciosamente — usa cache JSON existente
- `read_holdings_taxas()` lê `holdings.md` diretamente — não depende de pyield

**O que fazer:**
```bash
# Verificar se pyield está acessível
python3 -c "from pyield import ntnb; print('pyield OK')"

# Holdings.md sempre é a fonte primária para taxas RF
# Garantir que holdings.md está atualizado
```

### python-bcb/BCB indisponível (Selic, IPCA, PTAX)

**Impacto:** Dados macro BR (Selic, IPCA, Focus) não atualizados.

**O que acontece:**
- `market_data.py --macro-br` e `fx_utils.py` falham
- `generate_data.py` usa `macro_snapshot.json` existente (stale) ou valores hardcoded

**O que fazer:**
```bash
# Usar snapshot existente (se <48h)
ls -la dados/macro_snapshot.json

# Reconstruir quando BCB disponível
python3 scripts/reconstruct_macro.py
```

---

## 5. Gaps Estruturais Conhecidos

### shadows — não calculados automaticamente

**Problema:** `state.shadows` é populado por `checkin_mensal.py`, mas:
1. O campo `state.shadows` armazena o período mais recente (ex: "Abr/2026")
2. `generate_data.py` tenta ler `state.shadows.q1_2026` — chave que nunca é populada (o checkin usa label de mês, não de trimestre)
3. O resultado: `shadows.delta_vwra`, `delta_ipca`, `delta_shadow_c` = `null` no dashboard

**Workaround:** Rodar `checkin_mensal.py` ao final de cada mês. O dashboard mostra dados do mês, não do trimestre.

**Fix futuro:** Criar `scripts/reconstruct_shadows.py` que agrega retornos mensais em períodos trimestrais/anuais e persiste `state.shadows.{periodo}` com chaves padronizadas.

### spendingSensibilidade — não há script que popula state.spending.scenarios

**Problema:** `spendingSensibilidade` lê `state.spending.scenarios`, mas nenhum script do pipeline escreve este campo. O estado fica sempre vazio `[]`.

**O que deveria conter:** Cenários com labels (R$250k, R$270k, R$300k) e P(FIRE) correspondente para cada nível de gasto.

**Workaround:** Não há — o componente mostra vazio.

**Fix futuro:** Implementar no `generate_data.py` ou `fire_montecarlo.py` o cálculo de P(FIRE) para 3 níveis de gasto e persistir em `state.spending.scenarios`. Estimativa: ~3 chamadas adicionais ao PFireEngine.

### fire.p_quality_aspiracional — sempre null

**Problema:** `fire_montecarlo.py --by_profile` não calcula P(quality) para o cenário aspiracional.

**Workaround:** Dashboard mostra "—" no card de qualidade de vida aspiracional.

**Fix futuro:** Adicionar `--aspiracional` flag ao `--by_profile` run ou calcular inline em generate_data.py.

### fire.pat_mediano_fire50 — chave stale

**Problema:** MC escreve `pat_mediano_aspiracional`, mas generate_data.py lê `pat_mediano_fire50` — chave inexistente.

**Impacto:** `fire.pat_mediano_fire50` sempre null.

**Fix:** Atualizar generate_data.py para ler `pat_mediano_aspiracional` (já há fix parcial em aspiracional_scenario).

---

## 6. Consultas Externas — Fontes e TTLs

| Fonte | Script | Cache | TTL | Fallback |
|-------|--------|-------|-----|----------|
| yfinance (ETFs, USD/BRL) | generate_data.py inline | Nenhum (fetch live) | — | `CAMBIO_FALLBACK` em config.py |
| yfinance (factor rolling) | generate_data.py | `dados/factor_cache.json` | Sem TTL explícito | State existente |
| pyield ANBIMA | generate_data.py, reconstruct_fire_data | `dados/ntnb_history_cache.json` | Sem TTL explícito | Cache existente |
| python-bcb (Selic, IPCA) | market_data.py, fx_utils.py | Nenhum | — | Valores hardcoded em config.py |
| IBKR Flex | ibkr_sync.py, ibkr_lotes.py | `dados/ibkr/lotes.json` | Manual | lotes.json existente |
| Ken French (FF5) | market_data.py, factor_regression | `dados/factor_cache.json` | Sem TTL explícito | Cache existente |
| AQR HML Devil | market_data.py | `dados/factor_cache.json` | Sem TTL explícito | getfactormodels SMB |
| fredapi (Fed Funds, VIX) | market_data.py | Nenhum | — | `FED_FUNDS_SNAPSHOT` em config.py |

**Padrão atual:** Cada fonte tem seu próprio try/except com fallback ad-hoc. Não há wrapper unificado com retry exponencial. Ver Seção 7 para padrão recomendado.

---

## 7. Padrão de Retry para Consultas Externas

O pipeline **não tem** wrapper unificado de retry. Cada consulta externa usa try/except ad-hoc.

**Status:** Gap documentado. Implementação futura recomendada:

```python
# TODO XX-system-audit: implementar fetch_with_retry unificado
def fetch_with_retry(fn, fallback=None, retries=3, cache_key=None, cache_ttl_h=4):
    """
    Tenta fn() com retry exponencial.
    Cache em dados/fetch_cache.json se cache_key fornecido.
    
    Padrão: 1s → 2s → 4s entre tentativas.
    """
    import time
    for attempt in range(retries):
        try:
            result = fn()
            if cache_key:
                _write_cache(cache_key, result, ttl_h=cache_ttl_h)
            return result
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
            else:
                if cache_key:
                    cached = _read_cache(cache_key, ttl_h=cache_ttl_h * 24)  # stale OK
                    if cached:
                        return cached
                if fallback is not None:
                    return fallback
                raise
```

**Prioridade:** MÉDIO — o pipeline atual é funcional; retry adiciona resiliência mas não é bloqueador.

---

## 8. Validação Pós-Pipeline

```bash
# Validação básica de data.json
python3 scripts/validate_data.py

# Validação de contrato spec.json ↔ data.json
python3 scripts/validate_schema.py

# Suite completa de testes
python3 -m pytest scripts/tests/ -x -q
```

---

## 9. Observabilidade do Output

O `generate_data.py` usa os seguintes padrões de log:

| Símbolo | Significado |
|---------|-------------|
| `📊 generate_data.py — iniciando` | Início do pipeline |
| `  ▶ <step>` | Step iniciando |
| `  ✓ <field>: <valor>` | Campo computado com sucesso |
| `  ✅ <caminho>` | Output final escrito com sucesso |
| `  ⚠️ <aviso>` | Aviso — pipeline continua com fallback |
| `  ⚠️ ATENÇÃO: câmbio é FALLBACK` | Câmbio não é live — patrimônio estimado |
| `  ✗ Erro ao salvar <arquivo>` | Erro ao salvar arquivo intermediário |
| `❌ SNAPSHOT CRÍTICO EXPIRADO` | Snapshot >168h — pipeline bloqueado |
| `❌ ASSERTION FAILED` | Assertion de schema — pipeline bloqueado |
| `❌ SPEC CONTRACT` | Campo obrigatório null — pipeline bloqueado |

**TODO (Fase 2.3 XX-system-audit):** Padronizar para `🔴 CRÍTICO:`, `🟡 DEGRADADO:`, `✅ OK:`, `⊘ PULADO:` nos warnings de campos opcionais. Impacto: ~80 linhas de print em generate_data.py. Prioridade BAIXA pois o padrão atual é legível.

---

## 10. Integrações Externas — Inventário Completo (Fase 5 XX-system-audit)

### 10.1 Mapa de Integrações

| Integração | Biblioteca | Scripts que chamam diretamente | Abstração canônica | TTL cache |
|-----------|-----------|-------------------------------|-------------------|----------|
| **yfinance** | `yfinance` | `generate_data.py` (6x), `reconstruct_factor.py` (3x), `reconstruct_history.py` (3x), `reconstruct_macro.py`, `checkin_mensal.py`, `backtest_portfolio.py`, `brfiresim.py`, `portfolio_analytics.py`, `tlh_monitor.py`, `binance_analysis.py`, `factor_regression.py`, `resampled_frontier.py` | Nenhuma — chamadas diretas espalhadas | 4h (sem TTL explícito no pipeline) |
| **pyield/ANBIMA** | `pyield` | `market_data.py`, `generate_data.py` (build_ntnb_history), `reconstruct_history.py` | `market_data.py --tesouro` (parcial) | 24h |
| **python-bcb** | `python-bcb` | `fx_utils.py`, `market_data.py`, `reconstruct_macro.py`, `generate_data.py`, `tax_engine.py`, `checkin_mensal.py`, `ibkr_lotes.py` | `fx_utils.py` (canônico para PTAX/Selic/IPCA) | 6h |
| **FRED CSV** | `urllib` | `generate_data.py`, `reconstruct_macro.py` | Nenhuma — inline em 2 scripts | 24h |
| **fredapi** | `fredapi` | `market_data.py` | `market_data.py --macro-us` | 24h |
| **IBKR Flex** | `ibflex` | `ibkr_lotes.py` | `ibkr_lotes.py` + `ibkr_sync.py` | 168h (manual) |
| **Binance API** | `urllib` direto | `btc_indicators.py` | Nenhuma — `binance_analysis.py` usa yfinance para preços | 4h |
| **Google Sheets** | `urllib` (CSV público) | `fetch_historico_sheets.py` | `fetch_historico_sheets.py` | 48h |
| **Ken French** | `getfactormodels`, `urllib+zip` | `market_data.py`, `reconstruct_factor.py`, `backtest_portfolio.py` | `reconstruct_factor.py` (parcial) | 72h |

### 10.2 Avaliação: Retry / Timeout / Cache / Fallback

| Integração | Retry | Timeout | Cache explícito | Fallback |
|-----------|-------|---------|----------------|---------|
| yfinance | ❌ Nenhum | ❌ Nenhum (yfinance interno) | Parcial (`factor_cache.json`) | `CAMBIO_FALLBACK` em config.py; state existente |
| pyield/ANBIMA | Parcial (D-1, D-2 manual em `reconstruct_history.py`) | ❌ Nenhum | `ntnb_history_cache.json` (sem TTL explícito) | cache existente |
| python-bcb | ❌ Nenhum | ❌ Nenhum | Nenhum direto (usa state como fallback) | `SELIC_META_SNAPSHOT` hardcoded; `5.20` em `fx_utils.get_ptax` |
| FRED CSV | ❌ Nenhum | 5–8s (`timeout` no urlopen) | Nenhum | `FED_FUNDS_SNAPSHOT` em config.py; state existente |
| fredapi | ❌ Nenhum | ❌ Nenhum (fredapi interno) | Nenhum | state existente |
| IBKR Flex | ❌ Nenhum | ❌ Nenhum | `lotes.json` (manual) | lotes.json existente (stale) |
| Binance API | ❌ Nenhum | 5–30s (por chamada) | `binance/posicoes.json` | fallback config |
| Google Sheets | ❌ Nenhum | 15s (`fetch_csv`) | `historico_sheets.json` | sys.exit(1) se falha |
| Ken French | ❌ Nenhum | 30s (`urllib`) | `factor_cache.json` (sem TTL) | snapshot anterior |

**Gaps críticos:**
- **Google Sheets** (`fetch_historico_sheets.py`): `sys.exit(1)` em falha de fetch — bloqueia pipeline em vez de usar cache. Deveria usar `historico_sheets.json` como fallback.
- **yfinance**: 6+ locais de chamada direta em `generate_data.py` sem abstração centralizada. Cada um tem try/except ad-hoc com qualidade variável.
- **python-bcb fallback**: `fx_utils.get_ptax()` retorna `5.20` hardcoded (linha 63) sem avisar — silencioso.

### 10.3 Avaliação da Camada de Abstração

| Camada | Status | Avaliação |
|--------|--------|-----------|
| `fx_utils.py` | Boa | Abstrai PTAX/Selic/IPCA do python-bcb. Usado em 6+ scripts. Gap: fallback PTAX=5.20 silencioso |
| `market_data.py` | Parcial | CLI útil para dados em tempo real. Não é importado pelo pipeline (apenas manual) |
| `ibkr_lotes.py` | Boa | Abstrai Flex Query + CSV. Único ponto de entrada para posições IBKR |
| `ibkr_sync.py` | Boa | Wrapper de alto nível sobre ibkr_lotes.py |
| yfinance (direto) | Ruim | 20+ chamadas diretas espalhadas em 12 scripts diferentes. Sem wrapper centralizado |
| pyield (direto) | Ruim | 3 locais de chamada direta com padrões de fallback diferentes |
| FRED CSV (direto) | OK | 2 locais idênticos — redundância mínima aceitável |

### 10.4 O que Fazer Quando Cada Integração Cai

#### yfinance indisponível

```bash
# Continuar sem preços (usa state existente)
python3 scripts/generate_data.py --skip-prices

# Verificar se yfinance responde
python3 -c "import yfinance as yf; print(yf.download('SWRD.L', period='1d'))"

# Verificar saúde geral
python3 scripts/integration_health.py
```

**Impacto por seção:**
- `get_posicoes_precos`: câmbio cai para `CAMBIO_FALLBACK` (config.py) — patrimônio estimado
- `build_factor_rolling`, `compute_factor_loadings`: usam `factor_cache.json` existente
- `get_bitcoin_usd`: usa state existente
- `backtest_portfolio.py` (subprocess): falha silenciosa, usa dados do state

#### pyield/ANBIMA indisponível

```bash
# ntnb_history_cache.json é usado automaticamente
# Verificar staleness do cache
ls -la dados/ntnb_history_cache.json

# Quando ANBIMA voltar:
python3 scripts/reconstruct_fire_data.py  # regenera drawdown_history, bond_pool, etc.
```

**Impacto:** `ntnb_history`, taxas RF no dashboard ficam com dados do último cache. `read_holdings_taxas()` não depende de pyield (lê `holdings.md` diretamente) — taxas RF do portfólio continuam OK.

#### python-bcb/BCB indisponível

```bash
# fx_utils.get_ptax() retorna 5.20 como fallback (SILENCIOSO — checar logs)
# Verificar se fallback foi ativado nos logs do pipeline:
#   "⚠️ ATENÇÃO: câmbio=... é FALLBACK"

# Reconstruir quando BCB voltar:
python3 scripts/reconstruct_macro.py
python3 scripts/generate_data.py
```

**Impacto:** PTAX fallback = 5.20 (pode divergir do mercado). Selic usa `SELIC_META_SNAPSHOT` de config.py.

#### FRED (Fed Funds) indisponível

```bash
# Fallback automático: state.macro.fed_funds → FED_FUNDS_SNAPSHOT (config.py)
# Sem ação necessária — impacto cosmético (macro card)

# Verificar se FRED CSV está acessível:
curl -s "https://fred.stlouisfed.org/graph/fredgraph.csv?id=FEDFUNDS" | tail -3
```

#### IBKR Flex indisponível

```bash
# Verificar staleness de lotes.json
ls -la dados/ibkr/lotes.json

# Quando IBKR Flex voltar:
python3 scripts/ibkr_sync.py --cambio <ptax_hoje>

# Alternativa manual: editar dados/ibkr/lotes.json via ibkr_lotes.py --csv
python3 scripts/ibkr_lotes.py  # usa CSV exportado do IBKR
```

**Impacto:** posições IBKR ficam stale. Pipeline continua com lotes.json anterior — IR diferido, retornos históricos ficam desatualizados.

#### Binance API indisponível

```bash
# btc_indicators.py falha silenciosamente (standalone — não está no pipeline diário)
# binance_analysis.py usa yfinance para preços (não a API pública da Binance)
# Impacto: mínimo — crypto legado Binance não atualiza
ls -la dados/binance/posicoes.json
```

#### Google Sheets indisponível

```bash
# ATENÇÃO: fetch_historico_sheets.py faz sys.exit(1) se fetch falha
# → NÃO rodar fetch_historico_sheets.py se Sheets estiver inacessível
# → reconstruct_history.py usa historico_sheets.json existente como fallback

# Verificar se cache está OK:
ls -la dados/historico_sheets.json
python3 -c "import json; d=json.load(open('dados/historico_sheets.json')); print(len(d.get('snapshots',[])), 'snapshots')"
```

**Impacto:** `reconstruct_history.py` falha se `historico_sheets.json` não existir — COE XP não calculado.

#### Ken French (FF5) indisponível

```bash
# factor_snapshot.json é usado automaticamente como fallback
ls -la dados/factor_snapshot.json

# Quando Ken French voltar:
python3 scripts/reconstruct_factor.py
```

**Impacto:** `factor_rolling`, `factor_loadings` ficam stale. Dashboard mostra dados do último snapshot.

### 10.5 Estrutura Recomendada de Integrações

**Status atual:** cada integração tem fallback ad-hoc, qualidade variável, sem retry exponencial, sem TTL explícito.

**Recomendações por prioridade:**

**P1 — Fix imediato:**
- `fetch_historico_sheets.py`: substituir `sys.exit(1)` por fallback para `historico_sheets.json` existente
- `fx_utils.get_ptax()` linha 63: logar aviso quando fallback=5.20 é ativado

**P2 — Médio prazo:**
- Implementar `fetch_with_retry()` em `fx_utils.py` (template já documentado na Seção 7)
- Centralizar chamadas yfinance em wrapper único com: try/except padronizado, log consistente, fallback para cache
- Adicionar TTL explícito em `ntnb_history_cache.json` e `factor_cache.json`

**P3 — Baixa prioridade:**
- `market_data.py` como importável pelo pipeline (hoje é só CLI)
- Mock de integrações para testes unitários

**Script de diagnóstico:** `integration_health.py` (implementado em XX-system-audit Fase 5)

```bash
# Verificar todas as integrações
python3 scripts/integration_health.py

# Output JSON para automação
python3 scripts/integration_health.py --json

# Ver ações corretivas
python3 scripts/integration_health.py --fix

# Verificar integração específica
python3 scripts/integration_health.py --integration yfinance
```
