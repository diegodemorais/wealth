# HD-ARCHITECT-P2 — Advanced Hardcoding Detection

**Status**: 🟦 Em Andamento  
**Dono**: Architect  
**Prioridade**: 🔵 Alta  
**Parent Issue**: HD-ARCHITECT (P0 ✅ | P1 ✅ | P2 ⏳)

---

## Objetivo

Expandir detecção de hardcoding além `* 100` / `/ 100`.

**Padrões a detectar:**
1. Valores numéricos fora de `config.py` (0.50, 15, 3.0, etc)
2. Cálculos inline (SWR, Tax, guardrail logic)
3. Strings duplicadas (tickers, nomes de blocos)
4. Constantes mágicas em código

**Técnica**: AST parsing + grep avançado + static analysis

---

## P2.1: Implementar Hardcoding Detector (Python)

**O que fazer:**

Criar script `scripts/detect_hardcoding.py` que:

### 1. Detecta Valores Numéricos em Código

```python
# ❌ Proibido
equity_weight = 0.50  # Deveria estar em config.py
ipca_target = 15  # Deveria estar em config.py
bond_allocation = 0.15

# ✅ Correto
from config import EQUITY_WEIGHTS, IPCA_LONGO_PCT
equity_weight = EQUITY_WEIGHTS["SWRD"]
bond_allocation = IPCA_LONGO_PCT
```

**Implementação**:
- AST parsing para detectar literal assignments
- Grep para constantes mágicas
- Whitelist: test files, version strings, loop counters

### 2. Detecta Cálculos Inline

```python
# ❌ Proibido
swr = 0.03 * patrimonio  # SWR calculation — use swr_engine
ir = gains * 0.15  # Tax calculation — use tax_engine
guardrail = if portfolio < pico * 0.85  # Guardrail logic — use guardrail_engine

# ✅ Correto
from swr_engine import SWREngine
swr = swr_engine.calculate(patrimonio)
```

**Implementação**:
- Detect patterns: `* patrimonio`, `* gains`, `* portfolio`
- Grep for financial keywords (swr, tax, guardrail, drawdown)
- Match against engine responsibilities

### 3. Detecta Strings Duplicadas

```python
# ❌ Proibido
if etf == "SWRD":
    ...
if etf == "SWRD":  # Duplicada!
    ...

# ✅ Correto
TICKER_SWRD = "SWRD"  # Em config.py
if etf == TICKER_SWRD:
```

**Implementação**:
- Detect string literals repeated >2x
- Suggest centralization in config.py

---

## P2.2: Integrar em Pre-Commit (Advanced)

**O que fazer:**

Expandir `.git/hooks/pre-commit` com:

```bash
# ──── ARCHITECT: Advanced Hardcoding Detection ────
echo "🔬 Architect: Running advanced hardcoding detection..."
python3 scripts/detect_hardcoding.py --staged
if [ $? -ne 0 ]; then
    echo "❌ ARCHITECT: Hardcoding detected. Use --report for details."
    echo "   Suggested: python3 scripts/detect_hardcoding.py --report"
    exit 1
fi
echo "✅ Architect: No hardcoding violations found"
```

**Features**:
- `--staged` (para pre-commit)
- `--report` (detailed output)
- `--fix` (auto-suggest corrections)
- Configurable whitelist

---

## P2.3: Criar Whitelist & Configuration

**O que fazer:**

Criar `.architectignore` (similar a `.gitignore`):

```
# Test files (allowed numeric literals)
**/test_*.py
**/tests/**/*.py
**/*.spec.ts
**/*.test.ts

# Version strings
**/version.py
**/package.json

# Documentation
**/*.md
**/*.txt

# Loop counters and temporary vars
for i in range(*)
for _ in range(*)

# Comments and docstrings
^#
^"""
^'''
```

**Features**:
- Patterns to ignore (tests, docs, comments)
- Configurable thresholds (how many occurrences = violation?)
- Per-project overrides

---

## P2.4: Documentar Hardcoding Patterns

**O que fazer:**

Criar `agentes/referencia/hardcoding-patterns.md`:

```markdown
# Hardcoding Patterns — What to Avoid

## 1. Numeric Literals in Code

### ❌ BAD
```python
equity_pct = 0.79
ipca_long = 0.15
swr_floor = 0.02
```

### ✅ GOOD
```python
from config import EQUITY_PCT, IPCA_LONGO_PCT, SWR_FLOOR
equity_pct = EQUITY_PCT
ipca_long = IPCA_LONGO_PCT
swr_floor = SWR_FLOOR
```

## 2. Calculation Logic

### ❌ BAD
```python
swr = 0.03 * portfolio
ir = (sales_price - cost) * 0.15
max_dd = pico * -0.35
```

### ✅ GOOD
```python
from swr_engine import SWREngine
swr = swr_engine.calculate(portfolio)

from tax_engine import TaxEngine
ir = tax_engine.calculate_ir(sales_price, cost)

from guardrail_engine import GuardrailEngine
max_dd = guardrail_engine.calculate_max_drawdown(pico)
```

## 3. String Literals

### ❌ BAD
```python
if etf == "SWRD":
    weight = 0.50
if etf == "SWRD":  # Duplicate!
    return True
```

### ✅ GOOD
```python
# In config.py
TICKER_SWRD = "SWRD"
WEIGHT_SWRD = 0.50

# In code
if etf == TICKER_SWRD:
    weight = WEIGHT_SWRD
```
```

---

## Deliverables Expected

**P2.1 (Script)**:
- ✅ `scripts/detect_hardcoding.py` (300-400 lines)
- ✅ AST parsing + grep rules
- ✅ Whitelist support
- ✅ `--staged`, `--report`, `--fix` flags

**P2.2 (Hook Integration)**:
- ✅ `.git/hooks/pre-commit` updated
- ✅ Advanced detection section added
- ✅ Graceful error handling

**P2.3 (Configuration)**:
- ✅ `.architectignore` created
- ✅ Configurable rules
- ✅ Per-project overrides

**P2.4 (Documentation)**:
- ✅ `agentes/referencia/hardcoding-patterns.md` (300+ lines)
- ✅ Examples + anti-patterns
- ✅ How to refactor hardcoded code

---

## Definition of Done

- [ ] `detect_hardcoding.py` created and tested
- [ ] Pre-commit hook updated with advanced rules
- [ ] `.architectignore` configuration ready
- [ ] Documentation complete with examples
- [ ] Tested on existing codebase (no false positives)
- [ ] Committed to main
- [ ] Ready for integration in next PR

---

## Timeline

- **P2.1 (Script)**: 45 min
- **P2.2 (Hook)**: 15 min
- **P2.3 (Config)**: 10 min
- **P2.4 (Docs)**: 30 min

**Total**: ~2 hours

---

**Created**: 2026-04-27  
**Parent**: HD-ARCHITECT  
**Status**: 🟦 Em Andamento (executing now)
