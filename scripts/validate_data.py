#!/usr/bin/env python3
"""
validate_data.py — Validar data.json antes de build/deploy

Verifica:
- JSON válido (parseable)
- Todas 6 keys críticas presentes: retornos_mensais, backtest, posicoes, premissas, rolling_sharpe, fire
- retornos_mensais tem >=12 meses
- Todos annual_returns têm alpha_vs_vwra
- Size sanity: 10KB–10MB
"""

import json
import sys
import pathlib

ROOT = pathlib.Path(__file__).parent.parent
DATA_JSON = ROOT / "react-app" / "public" / "data.json"

def validate():
    """Validar data.json. Return True se válido, False caso contrário."""
    errors = []

    # 1. Arquivo existe?
    if not DATA_JSON.exists():
        errors.append(f"ERROR: data.json not found at {DATA_JSON}")
        print("\n".join(errors))
        return False

    # 2. JSON válido?
    try:
        with open(DATA_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"ERROR: data.json is invalid JSON: {e}")
        print("\n".join(errors))
        return False

    # 3. Size sanity
    size_bytes = DATA_JSON.stat().st_size
    if size_bytes < 10 * 1024:  # < 10KB
        errors.append(f"ERROR: data.json too small ({size_bytes} bytes, expected >=10KB)")
    elif size_bytes > 10 * 1024 * 1024:  # > 10MB
        errors.append(f"ERROR: data.json too large ({size_bytes} bytes, expected <=10MB)")

    # 4. Critical top-level keys
    critical_keys = ["retornos_mensais", "backtest", "posicoes", "premissas", "rolling_sharpe", "fire"]
    for key in critical_keys:
        if key not in data:
            errors.append(f"ERROR: Missing critical key '{key}' in data.json")
        elif data[key] is None or (isinstance(data[key], (list, dict)) and len(data[key]) == 0):
            errors.append(f"ERROR: Key '{key}' is empty/null in data.json")

    # 5. retornos_mensais structure
    if "retornos_mensais" in data:
        retornos = data["retornos_mensais"]
        if isinstance(retornos, dict):
            # Expected structure: {dates, values, annual_returns, ...}
            if "dates" not in retornos or "values" not in retornos:
                errors.append(f"ERROR: retornos_mensais dict missing 'dates' or 'values'")
            elif not isinstance(retornos.get("dates"), list) or len(retornos["dates"]) < 12:
                errors.append(f"ERROR: retornos_mensais['dates'] must have >=12 entries")
        elif isinstance(retornos, list):
            if len(retornos) < 12:
                errors.append(f"ERROR: retornos_mensais has {len(retornos)} entries, need >=12")
        else:
            errors.append(f"ERROR: retornos_mensais must be dict or list, got {type(retornos)}")

    # 6. annual_returns completeness (if backtest exists)
    if "backtest" in data and isinstance(data["backtest"], dict):
        annual_returns = data["backtest"].get("annual_returns", [])
        if isinstance(annual_returns, list):
            for i, entry in enumerate(annual_returns):
                if isinstance(entry, dict):
                    if "alpha_vs_vwra" not in entry:
                        errors.append(f"ERROR: annual_returns[{i}] missing 'alpha_vs_vwra' field")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return False

    print(f"✅ data.json valid ({size_bytes} bytes, {len(critical_keys)} critical keys present)")
    return True

if __name__ == "__main__":
    if not validate():
        sys.exit(1)
    sys.exit(0)
