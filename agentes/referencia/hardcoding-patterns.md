# Hardcoding Patterns — What to Avoid

**Document Version**: P2 (Advanced Detection)  
**Last Updated**: 2026-04-27  
**Owner**: Architect  
**Reference**: `scripts/detect_hardcoding.py`, `.architectignore`

---

## Overview

Hardcoding values, calculations, and strings directly in code instead of centralizing them creates:

- **Maintenance burden** — changing a value requires updating multiple places
- **Inconsistency risk** — different code paths use different values
- **Testing difficulty** — hardcoded values can't be mocked or parameterized
- **Audit trail loss** — no single source of truth for financial constants

This guide teaches **what to avoid** and **how to refactor**.

---

## 1. Numeric Literals in Code

### ❌ BAD Examples

```python
# Hardcoded portfolio constants
def calculate_allocation():
    equity_pct = 0.79
    bonds_pct = 0.15
    crypto_pct = 0.06
    return equity_pct, bonds_pct, crypto_pct

# Hardcoded financial thresholds
def apply_guardrail(portfolio_value, peak_value):
    if portfolio_value < peak_value * 0.85:  # Hardcoded 85% threshold
        return "GUARDRAIL_BREACHED"
    return "OK"

# Hardcoded inflation expectations
def project_expenses():
    annual_increase = 0.15  # 15% hardcoded
    return annual_increase

# Hardcoded tax rates
def calculate_tax_liability(gains):
    tax_rate = 0.15  # Should come from config
    return gains * tax_rate
```

**Why this is bad:**
- Portfolio allocation (79/15/6) should come from `carteira.md` + `config.py`
- Guardrail threshold (85%) is a financial policy parameter
- Inflation (15%) is a long-term assumption that changes yearly
- Tax rate (15%) varies by jurisdiction and income type

### ✅ GOOD Examples

```python
# ✅ Import from centralized config
from config import (
    EQUITY_ALLOCATION,
    BONDS_ALLOCATION,
    CRYPTO_ALLOCATION,
    GUARDRAIL_THRESHOLD,
    IPCA_LONGO_ESTIMATE,
    TAX_RATE_FOREIGN_GAINS
)

def calculate_allocation():
    return EQUITY_ALLOCATION, BONDS_ALLOCATION, CRYPTO_ALLOCATION

def apply_guardrail(portfolio_value, peak_value):
    if portfolio_value < peak_value * GUARDRAIL_THRESHOLD:
        return "GUARDRAIL_BREACHED"
    return "OK"

def project_expenses():
    return IPCA_LONGO_ESTIMATE

def calculate_tax_liability(gains):
    return gains * TAX_RATE_FOREIGN_GAINS
```

**How this is better:**
- All constants defined in `scripts/config.py` (loaded from `carteira_params.json`)
- Changes to assumptions only require updating config
- Easy to A/B test different scenarios
- Clear audit trail of what values are used

---

## 2. Calculation Logic (SWR, Tax, Guardrails)

Financial calculations should NEVER be inline. They belong in **engines**.

### ❌ BAD Examples

```python
# ❌ SWR calculation inline
def simulate_year(portfolio_value, year):
    withdrawal = portfolio_value * 0.03  # 3% SWR hardcoded
    return withdrawal

# ❌ Tax calculation inline
def calculate_ir_debt(gains):
    ir = (gains - 20000) * 0.15  # Calculation hardcoded
    return ir

# ❌ Drawdown calculation inline
def check_drawdown(current, peak):
    dd = (current - peak) / peak * -1
    if dd > 0.35:  # 35% max drawdown hardcoded
        trigger_alert()

# ❌ Rebalancing logic inline
def rebalance(equities, bonds):
    if equities > 0.82:  # Hardcoded threshold
        sell_pct = equities - 0.79  # Hardcoded target
        return sell_pct
    return 0
```

### ✅ GOOD Examples — Use Engines

```python
# ✅ SWR calculation via engine
from swr_engine import SWREngine
swr_engine = SWREngine(config=config)
withdrawal = swr_engine.calculate_withdrawal(portfolio_value, year)

# ✅ Tax calculation via engine
from tax_engine import TaxEngine
tax_engine = TaxEngine(jurisdiction="BR", config=config)
ir = tax_engine.calculate_ir_debt(gains)

# ✅ Drawdown check via engine
from guardrail_engine import GuardrailEngine
guardrail = GuardrailEngine(config=config)
if guardrail.check_max_drawdown_breach(current, peak):
    trigger_alert()

# ✅ Rebalancing via engine
from rebalancing_engine import RebalancingEngine
rebalancer = RebalancingEngine(config=config)
rebalance_action = rebalancer.suggest_rebalance(equities, bonds)
```

**Why engines matter:**
- **Testability** — engine logic is isolated and unit-testable
- **Configurability** — engines respect config parameters
- **Consistency** — same calculation used everywhere
- **Auditability** — you can trace where a number came from

---

## 3. String Literals & Tickers

Strings that repeat multiple times should be constants.

### ❌ BAD Examples

```python
# ❌ Ticker strings hardcoded everywhere
def fetch_price(etf):
    if etf == "SWRD":  # First occurrence
        return fetch_us_etf(etf)
    elif etf == "VWRA":
        return fetch_asia_etf(etf)

def get_allocation(etf):
    if etf == "SWRD":  # Second occurrence — DUPLICATE
        return 0.50
    elif etf == "VWRA":  # Second occurrence — DUPLICATE
        return 0.30

def validate_holding(etf):
    if etf == "SWRD":  # Third occurrence — DUPLICATE
        return True
    return False

# ❌ Message strings hardcoded
def log_rebalance():
    print("Portfolio rebalanced to target")  # Hardcoded message
    return "Portfolio rebalanced to target"  # Duplicated in return

def log_alert(reason):
    if reason == "guardrail":
        return "Guardrail breached, consider rebalancing"  # Hardcoded
    return "Guardrail breached, consider rebalancing"  # Duplicated elsewhere
```

**Problem:** If you need to rename "SWRD" → "SWRD2", you'd need to find and replace in 5+ places, risking typos.

### ✅ GOOD Examples

```python
# ✅ Define constants in config.py
TICKER_SWRD = "SWRD"
TICKER_VWRA = "VWRA"
TICKER_AVGS = "AVGS"

WEIGHT_SWRD = 0.50
WEIGHT_VWRA = 0.30
WEIGHT_AVGS = 0.20

# Message constants
MSG_REBALANCE_SUCCESS = "Portfolio rebalanced to target"
MSG_GUARDRAIL_BREACHED = "Guardrail breached, consider rebalancing"

# ✅ Use constants in code
def fetch_price(etf):
    if etf == TICKER_SWRD:
        return fetch_us_etf(etf)
    elif etf == TICKER_VWRA:
        return fetch_asia_etf(etf)

def get_allocation(etf):
    if etf == TICKER_SWRD:
        return WEIGHT_SWRD
    elif etf == TICKER_VWRA:
        return WEIGHT_VWRA

def log_rebalance():
    print(MSG_REBALANCE_SUCCESS)
    return MSG_REBALANCE_SUCCESS

def log_alert(reason):
    if reason == "guardrail":
        return MSG_GUARDRAIL_BREACHED
```

**Benefits:**
- Rename or swap tickers in one place
- Consistent messaging across application
- Type-safe (IDE autocomplete)
- Easy to test with mock tickers

---

## 4. Magic Numbers in TypeScript/React

React components often hardcode numeric values (UI dimensions, thresholds, timeouts).

### ❌ BAD Examples

```typescript
// ❌ Hardcoded UI constants
export function PortfolioChart() {
  const maxValue = 6.5;  // Why 6.5?
  const chartHeight = 400;  // Hardcoded
  const padding = 20;  // Hardcoded
  
  return (
    <div style={{ height: `${400}px` }}>  // Hardcoded again!
      <Chart height={400} max={6.5} />
    </div>
  );
}

// ❌ Hardcoded financial thresholds in UI
export function GuardrailIndicator({ drawdown }) {
  const warningThreshold = 0.25;  // When to show warning?
  const dangerThreshold = 0.35;   // When to show danger?
  
  if (drawdown < warningThreshold) return <StatusOK />;
  if (drawdown < dangerThreshold) return <StatusWarning />;
  return <StatusDanger />;
}

// ❌ Hardcoded timeouts
export function DataRefresher() {
  const refreshInterval = 300000;  // 5 minutes — but how long?
  
  useEffect(() => {
    const timer = setInterval(fetchData, 300000);  // Duplicated!
    return () => clearInterval(timer);
  }, []);
}
```

### ✅ GOOD Examples

```typescript
// ✅ Define constants at module top
const UI_CONFIG = {
  CHART_HEIGHT: 400,
  CHART_PADDING: 20,
  CHART_MAX_VALUE: 6.5,
} as const;

const FINANCIAL_THRESHOLDS = {
  GUARDRAIL_WARNING: 0.25,
  GUARDRAIL_DANGER: 0.35,
  REBALANCE_THRESHOLD: 0.05,
} as const;

const TIMERS = {
  DATA_REFRESH_MS: 300000,  // 5 minutes
  CHART_ANIMATION_MS: 300,
} as const;

export function PortfolioChart() {
  return (
    <div style={{ height: `${UI_CONFIG.CHART_HEIGHT}px` }}>
      <Chart 
        height={UI_CONFIG.CHART_HEIGHT}
        max={UI_CONFIG.CHART_MAX_VALUE}
        padding={UI_CONFIG.CHART_PADDING}
      />
    </div>
  );
}

export function GuardrailIndicator({ drawdown }) {
  if (drawdown < FINANCIAL_THRESHOLDS.GUARDRAIL_WARNING) {
    return <StatusOK />;
  }
  if (drawdown < FINANCIAL_THRESHOLDS.GUARDRAIL_DANGER) {
    return <StatusWarning />;
  }
  return <StatusDanger />;
}

export function DataRefresher() {
  useEffect(() => {
    const timer = setInterval(fetchData, TIMERS.DATA_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);
}
```

**Benefits:**
- UI dimensions can be tweaked in one place
- Financial thresholds match backend logic
- Durations are readable (300000 ms with comment vs magic 300000)

---

## 5. How to Refactor Hardcoded Code

### Step-by-Step Refactoring Process

**1. Identify the hardcoded value**
```python
# Before
swr = portfolio * 0.03  # What is 0.03? SWR rate.
```

**2. Determine where it should live**

| Type | Location | Loaded From |
|------|----------|-------------|
| Portfolio/Financial params | `scripts/config.py` | `carteira_params.json` → `parse_carteira.py` |
| UI constants | React component (module top) | hardcoded in TS |
| Calculation logic | Engine (`swr_engine.py`) | calculation logic |
| Test fixtures | Test file (allowed) | test setup |

**3. Create constant in right location**

```python
# In scripts/config.py (loaded from carteira_params.json)
SWR_RATE = 0.03  # Annual safe withdrawal rate

# Or in React
const WITHDRAWALS = { SWR_RATE: 0.03 } as const;
```

**4. Import and use**

```python
# Before
swr = portfolio * 0.03

# After
from config import SWR_RATE
swr = portfolio * SWR_RATE
```

**5. Add to carteira.md if it's a user-facing assumption**

```markdown
| Parâmetro | Valor | Notas |
|-----------|-------|-------|
| SWR (Safe Withdrawal Rate) | 3.0% | Taxa segura anual em retiradas |
```

---

## 6. Whitelist Rules

Certain patterns are **allowed** to be hardcoded:

### ✅ Allowed Hardcoding Patterns

**Test files** — Numeric literals are expected in tests:
```python
# ✅ OK in test_*.py
def test_swr_calculation():
    assert calculate_swr(100000) == 3000  # Hardcoded expectations
```

**Loop counters** — Small integers in loops are OK:
```python
# ✅ OK
for i in range(10):  # Not a financial parameter
    process(i)

for _ in range(5):   # Throwaway
    retry()
```

**Versioning** — Version strings are allowed:
```python
# ✅ OK in version.py
__version__ = "1.2.3"
```

**Comments & documentation:**
```python
# ✅ OK (numbers in comments)
# Historical allocation was 50% / 40% / 10%
# Current: 79% / 15% / 6%
```

**Data constants (IDs, UUIDs, URLs):**
```python
# ✅ OK
API_V1_ENDPOINT = "https://api.example.com/v1"
USER_ID_PLACEHOLDER = "00000000-0000-0000-0000-000000000000"
```

---

## 7. Detection & Enforcement

### Running the Hardcoding Detector

```bash
# Scan entire codebase
python3 scripts/detect_hardcoding.py --report

# Scan only staged files (pre-commit)
python3 scripts/detect_hardcoding.py --staged

# Scan specific file
python3 scripts/detect_hardcoding.py scripts/my_file.py
```

### Pre-Commit Integration

The `.git/hooks/pre-commit` hook automatically runs:

```bash
python3 scripts/detect_hardcoding.py --staged --whitelist .architectignore
```

If violations are found, commit is **blocked**. Fix them with:

```bash
# Option 1: Refactor (preferred)
python3 scripts/detect_hardcoding.py --report  # See what to fix
# ... refactor ...
git add *.py
git commit -m "refactor: centralize hardcoded constants"

# Option 2: Skip hook (only for emergencies)
git commit --no-verify  # ⚠️  Not recommended
```

### Configure Whitelist

Edit `.architectignore` to add files/patterns that should skip detection:

```
# Ignore specific file
my_legacy_file.py

# Ignore pattern
**/migrations/**/*.py

# Already whitelisted (don't add):
**/test_*.py
scripts/config.py
```

---

## 8. Common Refactoring Patterns

### Pattern 1: Portfolio Constants

```python
# ❌ Before
equity_target = 0.79
bond_target = 0.15
crypto_target = 0.06

# ✅ After (in config.py)
ALLOCATION = {
    "EQUITY": 0.79,
    "BONDS": 0.15,
    "CRYPTO": 0.06,
}

# Use
equity_target = ALLOCATION["EQUITY"]
```

### Pattern 2: Financial Thresholds

```python
# ❌ Before
if drawdown > 0.35:
    alert("Critical drawdown")

# ✅ After (in config.py)
GUARDRAIL_THRESHOLDS = {
    "WARNING": 0.25,
    "DANGER": 0.35,
}

if drawdown > GUARDRAIL_THRESHOLDS["DANGER"]:
    alert("Critical drawdown")
```

### Pattern 3: Calculation Engines

```python
# ❌ Before
def annual_withdrawal(portfolio):
    return portfolio * 0.03

# ✅ After (in swr_engine.py)
class SWREngine:
    def __init__(self, config):
        self.swr_rate = config.SWR_RATE
    
    def calculate_withdrawal(self, portfolio):
        return portfolio * self.swr_rate

# Use
from swr_engine import SWREngine
engine = SWREngine(config)
withdrawal = engine.calculate_withdrawal(portfolio)
```

---

## 9. FAQ

**Q: Can I hardcode a number if I only use it once?**

A: If it's a financial parameter or system threshold, **no**. Use `config.py`. If it's a UI dimension or test fixture, **yes**.

**Q: Should I extract every single number?**

A: No. Extract:
- Financial parameters (allocation, thresholds, rates)
- Values that might change
- Values used in multiple places

Keep inline:
- Loop counters (i, j, k)
- Small constants (1, 0, -1)
- Test fixtures

**Q: Where do I add new constants?**

- **Financial**: `scripts/config.py` (loaded from `carteira_params.json`)
- **UI**: React component top or `utils/constants.ts`
- **Calculation logic**: Dedicated engine (`*_engine.py`)

**Q: How do I know if detection is a false positive?**

Check `.architectignore`. If your pattern should be whitelisted, add it there. Common reasons:
- Test file (add to `.architectignore`)
- Loop counter (already whitelisted)
- Comment/docstring (already handled)

---

## 10. See Also

- `scripts/config.py` — Master list of constants
- `.architectignore` — Whitelist rules
- `scripts/detect_hardcoding.py` — Detection tool
- `agentes/contexto/carteira.md` — Financial assumptions
- `.git/hooks/pre-commit` — Pre-commit hook integration

---

**Document End**
