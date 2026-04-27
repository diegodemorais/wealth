# IBKR Data Strategy — Intelligent Fallback Chain

## Problema Original

> "Por que ter que atualizar IBKR de novo se não fiz aporte?"  
> "Por que deletaram os arquivos de lotes?"

**Resposta:**
- Lotes NUNCA foram deletados (estavam em `dados/ibkr/lotes.json`)
- Não precisa atualizar todo dia — **só quando novo aporte/venda**
- Preços (prices) atualizam automaticamente via yfinance
- Taxa de RF atualiza via holdings.md

---

## Arquitetura: 3 Camadas

### Layer 1: IBKR Lotes Históricos (Permanente)

**Arquivo**: `dados/ibkr/lotes.json`

```json
{
  "SWRD": {
    "status": "alvo",
    "lotes": [
      {"data": "2021-04-08", "qty": 61.0, "custo_por_share": 28.78},
      {"data": "2021-04-16", "qty": 610.0, "custo_por_share": 29.385},
      ...
    ]
  },
  "AVGS": { ... },
  ...
}
```

**Characteristics:**
- ✅ Imutável (custo base histórico)
- ✅ Não precisa atualizar todo dia
- ✅ Só atualizar em novo aporte/venda/TLH
- ✅ Backup automático antes de overwrite

**Current state:**
```
SWRD:  5.291 shares @ $32.88 (60 lotes)
EIMI:  2.020 shares @ $31.33 (30 lotes)
AVGS:    233 shares @ $24.93 (2 lotes)
AVDV:    948 shares @ $61.37 (41 lotes)
AVUV:    549 shares @ $81.57 (30 lotes)
+ 7 more tickers
```

---

### Layer 2: IBKR Flex Query (Real-time, Optional)

**API**: IBKR REST API (requer `IBKR_FLEX_TOKEN`)

```python
# Se disponível:
export IBKR_FLEX_TOKEN="seu_flex_query_token"
python3 scripts/ibkr_posicoes_sync.py
```

**Behavior:**
- Pull latest trades from IBKR
- **Merge** com lotes.json existente (append novos, dedup)
- Update cache
- Se falhar → fallback para Layer 1

**Example: Novo Aporte**

```
1. Você faz aporte em IBKR (100 shares SWRD @ $95)
2. Flex Query puxa: [(data: 2026-04-27, qty: 100, custo: 95)]
3. Merge: lotes.json agora tem 60 lotes antigos + 1 novo
4. Cache updated
5. generate_data.py carrega posições atualizadas
```

---

### Layer 3: Cache (Last Known State)

**File**: `dados/posicoes_cache.json`

```json
{
  "SWRD": {"qty": 5291.64, "avg_cost": 32.8795, "num_lotes": 60},
  "AVGS": {"qty": 233.43, "avg_cost": 24.9326, "num_lotes": 2},
  ...
}
```

**Purpose:**
- Last snapshot de posições (agregado)
- Fallback se lotes.json missing
- Fast lookup (não precisa de merge)

---

## Intelligent Fallback Chain

```
┌──────────────────────────────────────────────────────┐
│ generate_data.py precisa de posições                 │
└──────────────────────────────────────────────────────┘
  ↓
  ├─ Tenta: IBKR Flex Query API
  │  ├─ ✅ Sucesso → Merge com lotes.json → Update cache
  │  └─ ❌ Falha: timeout, sem token, sem internet
  │     ↓
  │     └─ Tenta: lotes.json local (histórico)
  │        ├─ ✅ Sucesso → Usa dados históricos (sempre há)
  │        └─ ❌ Falha: arquivo corrompido/deletado (raro)
  │           ↓
  │           └─ Tenta: posicoes_cache.json (last snapshot)
  │              ├─ ✅ Sucesso → Usa último estado conhecido
  │              └─ ❌ Falha: nada disponível
  │                 ↓
  │                 └─ Retorna: {} (empty, graceful)
  │
  └─ Resultado: SEMPRE tem posições (via Flex OU local OU cache OU empty)
```

---

## Usage

### Normal Mode (Intelligent Fallback)

```bash
# Try Flex, fallback to local, then cache
python3 scripts/ibkr_posicoes_sync.py

# Output:
# 📊 Resultado: local
#    Tickers: 12
#    SWRD: 5291.64 shares (60 lotes)
#    AVGS: 233.43 shares (2 lotes)
#    ... e 10 mais
#
# ✅ Salvo: dados/ibkr/lotes.json
# ✅ Cache: dados/posicoes_cache.json
```

### Flex Only (Fail Fast)

```bash
# Só Flex Query — erro se falhar
python3 scripts/ibkr_posicoes_sync.py --flex-only

# Use case: Deploy script em CI/CD, quer garantir dados fresh
```

### Offline Mode (Cache Only)

```bash
# Sem internet — usa último snapshot
python3 scripts/ibkr_posicoes_sync.py --cached

# Use case: Dev machine sem acesso a IBKR/internet
```

### Dry Run (No Save)

```bash
# Ver dados sem atualizar arquivos
python3 scripts/ibkr_posicoes_sync.py --no-save
```

---

## Integration with generate_data.py

**Quando executar:**
```bash
# 1. Update posições from IBKR (optional, se novo aporte)
python3 scripts/ibkr_posicoes_sync.py

# 2. Generate data.json (usa posições do step 1)
python3 scripts/generate_data.py

# 3. Deploy (GitHub Pages ou dashboard)
npm run build && git push
```

**Automation (CI/CD Schedule):**

```yaml
# .github/workflows/daily-data.yml
on:
  schedule:
    - cron: "0 9 * * *"  # Daily at 09:00 UTC

jobs:
  sync-and-generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: python3 scripts/ibkr_posicoes_sync.py
        env:
          IBKR_FLEX_TOKEN: ${{ secrets.IBKR_FLEX_TOKEN }}
      
      - run: python3 scripts/generate_data.py
      
      - run: npm run build
        working-directory: react-app
      
      - name: Deploy
        run: |
          git config user.name "Bot"
          git config user.email "bot@example.com"
          git add react-app/public/data.json
          git commit -m "data: daily update" || true
          git push
```

---

## When to Update lotes.json?

### ✅ DO UPDATE

- **Novo aporte**: 100 shares SWRD @ $95
- **Venda**: Liquidar 50 shares AVGS
- **TLH**: Sell 1 share AVUV, buy VWRA (tax-loss harvest)
- **Consolidação**: Transfer IBKR → XP (move qty)

### ❌ DON'T UPDATE

- Preços mudaram → yfinance atualiza automático
- Cupom de dividendo → não afeta qty (DRIP)
- Split de ação → raro em ETFs, manual se ocorrer
- Taxa RF subiu → holdings.md atualiza isso

---

## File Locations & Responsibilities

| File | Responsibility | Update Frequency | Format |
|------|-----------------|-------------------|---------|
| `dados/ibkr/lotes.json` | IBKR holdings (historical cost base) | On aporte/venda | Nested dict: ticker → {status, lotes[]} |
| `dados/ibkr/aportes.json` | Historical aportes (for tracking) | Manual (historical) | List of {data, amount, source} |
| `dados/posicoes_cache.json` | Current holdings (aggregated) | Auto (sync_with_fallback) | Dict: ticker → {qty, avg_cost, num_lotes} |
| `holdings.md` | RF positions + taxas | Manual (when taxa changes) | Markdown table |
| `data.json` (final) | Dashboard source of truth | Generate_data.py | Merged: IBKR + RF + Monte Carlo + market data |

---

## Merge Logic (Flex + Local)

When both Flex Query and lotes.json exist:

```python
# Deduplicate by (data, qty, custo_por_share)
# Strategy: Keep all historical, append only new

def merge_lotes(flex_new, local_old):
    merged = dict(local_old)
    
    for ticker in flex_new:
        flex_lotes = flex_new[ticker]["lotes"]
        local_lotes = merged[ticker]["lotes"]
        
        # Find new lotes (not in local)
        new_lotes = [
            lot for lot in flex_lotes
            if lot not in local_lotes
        ]
        
        # Append only new
        merged[ticker]["lotes"].extend(new_lotes)
    
    return merged
```

**Result:** Never lose data, always append, deduplicate by exact match.

---

## Error Handling

### Scenario 1: IBKR Flex Token Missing

```
$ IBKR_FLEX_TOKEN not set
❌ Flex Query skipped
✅ Fallback to lotes.json (has 9 tickers)
✅ Sync complete
```

### Scenario 2: Internet Down

```
$ Network unreachable
❌ Flex Query timeout
✅ Fallback to lotes.json
✅ Sync complete
```

### Scenario 3: lotes.json Corrupted

```
$ JSON parse error
❌ lotes.json unusable
⚠️ Fallback to posicoes_cache.json
✅ Sync complete (with last known state)
```

### Scenario 4: All Fallbacks Fail

```
$ No IBKR data available
❌ Flex failed
❌ lotes.json missing
❌ Cache missing
⚠️ Returning empty dict {}
⚠️ generate_data.py continues (graceful degradation)
```

---

## Changelog

### 2026-04-27

- ✅ Created `ibkr_posicoes_sync.py` with intelligent fallback
- ✅ Verified `dados/ibkr/lotes.json` has 12 tickers, 1.165 lines
- ✅ Implemented merge logic (Flex + Local dedup)
- ✅ Auto-backup on save
- ✅ Cache layer for offline usage

### Future

- [ ] Schedule sync in CI/CD (daily at 09:00 UTC)
- [ ] Monitor Flex Query error rates
- [ ] Auto-alert on lotes.json conflicts
- [ ] Dashboard widget: "Last IBKR sync: 2h ago"

---

## Reference

- **Script**: `scripts/ibkr_posicoes_sync.py` (389 lines)
- **Data**: `dados/ibkr/lotes.json` (23.5 KB, 12 tickers)
- **Cache**: `dados/posicoes_cache.json` (updated auto)
- **Integration**: See `generate_data.py` main() function
