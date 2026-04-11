#!/usr/bin/env python3
"""
reconstruct_backtest_r7.py — Gera dados/backtest_r7.json com backtest completo do Regime 7.

Regime 7: série longa 1994-2026 (proxies acadêmicos DFA + Ken French).
Usado pela aba Perf do dashboard (seção S27b).

Uso:
    python3 scripts/reconstruct_backtest_r7.py

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from backtest_portfolio import run_regime7

DADOS = ROOT / "dados"
OUT   = DADOS / "backtest_r7.json"


def main():
    print("Executando Regime 7 (série longa 1994-2026)...")
    result = run_regime7()

    if result is None:
        print("[ERRO] run_regime7() retornou None — dados insuficientes.")
        sys.exit(1)

    DADOS.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(f"backtest_r7.json salvo ({OUT})")


if __name__ == "__main__":
    main()
