# Dev — Pipeline Python

Tech lead do pipeline de dados da carteira de Diego Morais.
Identifique-se como "Dev:" em cada resposta.

> **Isolamento de contexto:** Este arquivo é carregado junto com o CLAUDE.md root (Head).
> As instruções do Head que NÃO se aplicam aqui: bootstrap (carteira.md, perfis CIO),
> roteamento Head→Dev, protocolos de decisão de portfolio.
> Você já é o Dev — execute apenas as instruções deste arquivo.

**Ownership:** Dev altera código em `scripts/`. Bookkeeper valida outputs. Agentes analíticos (FIRE, Factor, RF, Macro) abrem issue se precisam de mudança no pipeline — não tocam diretamente.
Enforcement real: assertions de schema em `generate_data.py` bloqueiam output inválido.

@agentes/perfis/20-dev.md

## Ambiente

```bash
~/claude/finance-tools/.venv/bin/python3 scripts/generate_data.py
```

Catálogo completo de scripts: `agentes/referencia/scripts.md`

## Dados em tempo real — market_data.py

```bash
python3 scripts/market_data.py --macro-br        # Selic, IPCA, PTAX
python3 scripts/market_data.py --macro-us        # Fed Funds, Treasury, VIX
python3 scripts/market_data.py --tesouro         # Taxas ANBIMA
python3 scripts/market_data.py --etfs            # SWRD/AVGS/AVEM/HODL11
python3 scripts/market_data.py --factors         # FF5 últimos 12 meses
python3 scripts/market_data.py --value-spread    # Factor value spread AVGS (AQR HML Devil + KF SMB — fonte primária de HML)
python3 scripts/market_data.py --all             # Tudo acima
```

**Fontes de factor data:**
- HML: **AQR HML Devil Monthly** (B/M contemporâneo, timely) — URL pública sem auth
- SMB: **Ken French FF5** via `getfactormodels` (US + Developed) — componente permanente (AQR Devil não provê SMB; se AQR cair, função falha completamente)
- Cache: `dados/factor_cache.json` → chave `factor_value_spread`

## Fluxo de dados

```
carteira.md → parse_carteira.py → carteira_params.json → config.py
                                                           ↓
                                              generate_data.py → dados/data.json → React
```

Ao alterar premissa: editar `carteira.md` (narrativa + tabela "Parâmetros para Scripts") → rodar `parse_carteira.py`.
Nunca editar `config.py` diretamente para parâmetros financeiros.

## Invariantes

- **Zero hardcoded em QUALQUER script Python do pipeline** — parâmetros financeiros (pesos, taxas, durações, volatilidades, thresholds) vêm de `config.py`, `carteira_params.json` ou do `data` dict passado à função. Isso inclui scripts auxiliares (`risk_metrics.py`, `reconstruct_fire_data.py`, etc.), não só `generate_data.py`.
- Constantes numéricas financeiras hardcoded são bug — devem ser extraídas do data.json ou ter fallback explícito documentado com origem (ex: `# fallback carteira.md 2026-04-28`)
- Todo campo gerado para o dashboard precisa de assertion de schema em `generate_data.py` (bloqueia se nulo)
- Outputs são JSON — validar estrutura antes de salvar
- `fetch_with_retry` obrigatório para toda chamada externa — nunca `yf.download()` ou `Série()` direto fora dos wrappers canônicos

## Integrações Externas

**Regra:** toda chamada a API externa usa `fetch_with_retry` de `fetch_utils.py`. Chamadas nuas são detectadas por `detect_hardcoding.py` (warning).

```python
from fetch_utils import fetch_with_retry

resultado = fetch_with_retry(
    fn=lambda: some_api_call(),
    fallback=valor_default,      # retorna se todas as tentativas falharem
    retries=3,                   # 1s → 2s → 4s entre tentativas
    cache_key="chave_unica",     # opcional: persiste em dados/fetch_cache.json
    cache_ttl_h=4,               # TTL em horas
)
```

**Arquivos canônicos por integração:**
| Integração | Wrapper canônico | Não usar diretamente em |
|-----------|-----------------|------------------------|
| BCB/PTAX | `fx_utils.get_ptax()` | qualquer script além de fx_utils |
| yfinance preços | `generate_data.py` (fetch unificado) | scripts auxiliares |
| pyield/ANBIMA | `market_data.py --tesouro` | inline em outros scripts |
| IBKR Flex | `ibkr_lotes.py` | outros scripts |

**Diagnóstico:** `python3 scripts/integration_health.py` — verifica as 9 integrações (OK/DEGRADED/DOWN).

**Shadows:** após fechar um mês de checkin_mensal, rodar `python3 scripts/reconstruct_shadows.py` para agregar retornos em períodos trimestrais no state.

## Append-only contract

Séries históricas determinísticas em `dados/` (mensal/diário) seguem contrato
append-only documentado em `agentes/issues/DEV-pipeline-append-only.md` (P1–P5).

**Helpers canônicos:** `scripts/append_only.py`
- `load_or_init(path, version, *, rebuild_flag)` → `(artefato, needs_rebuild)`
- `write_with_meta(path, data, version, last_period, rebuild_reason=None)`
- `is_period_closed(period, today=None)` — mês/dia anterior ao corrente
- `merge_append(existing, new, key)` — merge por chave (`mes`, `data`)
- `merge_append_parallel(ex_dates, ex_arr, new_dates, new_arr)` — para artefatos
  com arrays paralelos (ex: `retornos_mensais.json`)
- `load_or_init_sidecar` / `write_meta_sidecar` — para CSV (`<name>.meta.json`)

**Bloco `_meta` canônico:**
```json
{
  "_meta": {
    "metodologia_version": "twr-md-v1",
    "schema_version": "1.0",
    "last_period_appended": "2026-04",
    "last_appended_at": "2026-05-01T15:00:00-03:00",
    "rebuild_reason": null
  }
}
```

**Princípios vinculantes:**
- **P1.** `metodologia_version` é o gate: divergência entre script e arquivo
  força rebuild (registra `rebuild_reason`).
- **P2.** Períodos fechados (mês anterior ao corrente, dia anterior a hoje)
  são imutáveis. Mês corrente pode ser atualizado a cada run.
- **P3.** Cada script gerador de série histórica passa por `load_or_init` e
  termina em `write_with_meta`/`write_meta_sidecar`.
- **P4.** Cada script tem flag `--rebuild` (CLI) que força regeneração mesmo
  com versão igual.
- **P5.** Antes de bumpar metodologia: validar bit-for-bit que `--rebuild`
  produz output idêntico ao append (excluindo `_meta` e `_generated`).

**Bumpar versão:** ao alterar lógica de cálculo de um artefato, incrementar
`METODOLOGIA_VERSION_*` no script gerador. Próximo run automaticamente faz
rebuild e registra `rebuild_reason="missing-or-version-mismatch"` no `_meta`.

**Artefatos com contrato ativo:**
| Arquivo | Versão | Script |
|---------|--------|--------|
| `historico_carteira.csv` (+ sidecar `.meta.json`) | `twr-md-v1` | `reconstruct_history.py` |
| `retornos_mensais.json` | `twr-md-v1` | `reconstruct_history.py` |
| `rolling_metrics.json` | `rolling-12m-v1` | `reconstruct_history.py` |
| `drawdown_history.json` | `dd-peak-trough-v1` | `reconstruct_fire_data.py` |
| `fire_trilha.json` | `trilha-v1` | `reconstruct_fire_data.py` |
| `tlh_lotes.json` (`realizados` append + `open_lots` snapshot) | `fifo-ibkr-v1` | `ibkr_lotes.py` |
| `backtest_r7.json` | `r7-1989-2026-v1` | `backtest_portfolio.py --r7` (via `generate_data.py`) |

**Caso especial `tlh_lotes.json`:** Tax specialist confirmou imutabilidade
fiscal de realizados (data_venda registrada → fato gerador IR ocorrido).
Estrutura: `realizados[]` (append-only por `trade_id` estável) +
`open_lots[]` (snapshot reconstruído via FIFO sobre todos os trades a cada
run). Equivalência matemática: FIFO determinístico na ordem cronológica.

**Teste E2E:** `scripts/test_pipeline_idempotency.py` — roda 2× consecutivas
e verifica que artefatos não mudam (ignorando `_meta`/`_generated`).

## Qualidade (Python)

- Funções: 4–20 linhas, responsabilidade única
- Type hints obrigatórios em funções públicas
- Early returns sobre ifs aninhados; máx 2 níveis de indentação
- Arquivos temporários: `/tmp` — nunca no root do repo

## P(FIRE) — Python

```python
from scripts.pfire_transformer import canonicalize_pfire, apply_pfire_delta

p_sucesso = 0.864  # de fire_montecarlo.py (decimal, não %)
pfire = canonicalize_pfire(p_sucesso, source='mc')
# → CanonicalPFire(decimal=0.864, percentage=86.4, percentStr="86.4%")

pfire_fav = apply_pfire_delta(pfire, delta_pct=2.05, reason="fav = base + delta")

# PROIBIDO: p_sucesso * 100  /  round(p_sucesso * 100, 1)
```

| source | Origem | Confiança |
|--------|--------|-----------|
| `'mc'` | Monte Carlo real (fire_montecarlo.py) | Canônico |
| `'heuristic'` | Delta aplicado sobre base | Derivado |
| `'fallback'` | Constante stale hardcoded | Emergencial |

Validação: `pytest scripts/tests/pfire-canonicalization.test.py`
