#!/usr/bin/env python3
"""
CI Pre-check: Garante que carteira_params.json existe e é fresher que carteira.md

Se carteira.md foi alterado após última geração de carteira_params.json,
força regeneração.

Uso:
    python scripts/ci_check_carteira_params.py
    # Exit 0 se OK, Exit 1 se precisa regenerar

Integração em CI:
    - .github/workflows/ci.yml: call script antes de generate_data.py
    - Se exit 1: rodar `python scripts/parse_carteira.py` e commitar
"""

import sys
import json
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
CARTEIRA_MD = ROOT / "agentes" / "contexto" / "carteira.md"
CARTEIRA_PARAMS_JSON = ROOT / "dados" / "carteira_params.json"

def check_freshness():
    """Verifica se carteira_params.json é fresher que carteira.md"""

    if not CARTEIRA_MD.exists():
        print("❌ agentes/contexto/carteira.md não encontrado")
        return False

    if not CARTEIRA_PARAMS_JSON.exists():
        print("❌ dados/carteira_params.json não encontrado")
        print("   Ação: python scripts/parse_carteira.py")
        return False

    carteira_mtime = CARTEIRA_MD.stat().st_mtime
    params_mtime = CARTEIRA_PARAMS_JSON.stat().st_mtime

    carteira_time = datetime.fromtimestamp(carteira_mtime).isoformat()
    params_time = datetime.fromtimestamp(params_mtime).isoformat()

    if carteira_mtime > params_mtime:
        print(f"⚠️  carteira.md foi alterado após última geração")
        print(f"   carteira.md: {carteira_time}")
        print(f"   params.json: {params_time}")
        print(f"   Ação: python scripts/parse_carteira.py")
        return False

    # Validar que JSON é válido
    try:
        data = json.loads(CARTEIRA_PARAMS_JSON.read_text())
        n_params = len(data)
        print(f"✅ carteira_params.json fresher (n={n_params} params)")
        print(f"   carteira.md: {carteira_time}")
        print(f"   params.json: {params_time}")
        return True
    except Exception as e:
        print(f"❌ carteira_params.json inválido: {e}")
        return False

if __name__ == "__main__":
    ok = check_freshness()
    sys.exit(0 if ok else 1)
