# Testing Strategy

## Fast Path: Pre-Commit (Local Development)
```bash
npm run test:pre-commit
```
**What:** React app code logic only  
**When:** Every commit  
**Time:** ~15-20s  
**Validates:**
- React components render correctly
- Data.json is valid

---

## Medium Path: React Full Test Suite
```bash
cd react-app && npm test
```
**What:** All React unit/integration tests  
**When:** Before pushing feature branch  
**Time:** ~15s  
**Validates:**
- Component logic
- Hooks behavior
- Data wiring
- Privacy mode
- Routing configuration

---

## Full Path: Integration Tests (Data Pipeline)
```bash
npm run test:integration
```
**What:** Data generation + Python validation  
**When:** Before major releases or when data schemas change  
**Time:** ~60-120s (depends on external APIs)  
**Requirements:**
- Python 3.10+
- Dependencies: `pip install python-bcb investiny yfinance`
- Network access (yfinance, etc)

**Validates:**
- ETF composition consistency
- FIRE probability calculations
- Drawdown history
- Bond pool runway
- SWR percentiles
- Factor loadings

---

## Python Tests Only (After Manual Data Generation)
```bash
npm run test:python
```
**What:** Python tests only  
**When:** After manually running `generate_data.py`  
**Time:** ~30-40s  
**Use case:** Validating data pipeline without full npm integration

---

## Summary Table

| Command | Scope | Time | When |
|---------|-------|------|------|
| `npm run test:pre-commit` | React only | 15-20s | Every commit |
| `cd react-app && npm test` | React all | 15s | Before push |
| `npm run test:integration` | React + Data | 60-120s | Before release |
| `npm run test:python` | Data only | 30-40s | After generate_data.py |

