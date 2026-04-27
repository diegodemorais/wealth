#!/usr/bin/env python3
"""
reconstruct_tax.py — Calcula IR diferido sobre ETFs UCITS ACC (Lei 14.754/2023).

Lógica:
  - Para cada ETF UCITS ACC com posição > 0:
      custo_brl = qty * custo_usd * ptax_compra   (PTAX do dia da compra via BCB)
      valor_brl = qty * preco_atual_usd * ptax_atual
      ganho_brl = valor_brl - custo_brl
      ir        = 15% * max(0, ganho_brl)

Fontes:
  - Lotes:    dados/ibkr/lotes.json
  - Preços:   dashboard_state.json → posicoes[ticker].price
  - Câmbio:   dashboard_state.json → patrimonio.cambio
  - PTAX:     python-bcb série USD (2021-01-01 → hoje)

Output: dados/tax_snapshot.json

Fallback: se BCB falha, usa câmbio atual como PTAX de compra (conservador).

Uso:
    python3 scripts/reconstruct_tax.py
"""

import json
from datetime import date, datetime, timedelta
from pathlib import Path

ROOT       = Path(__file__).parent.parent
OUT        = ROOT / "dados" / "tax_snapshot.json"
LOTES_PATH = ROOT / "dados" / "ibkr" / "lotes.json"
STATE_PATH = ROOT / "dados" / "dashboard_state.json"

import sys as _sys
_sys.path.insert(0, str(ROOT / "scripts"))
from config import IR_ALIQUOTA
from tax_engine import TaxEngine, TaxRequest


def _load_state() -> dict:
    try:
        return json.loads(STATE_PATH.read_text())
    except Exception:
        return {}


def _load_cache() -> dict:
    try:
        return json.loads(OUT.read_text())
    except Exception:
        return {}


# Tax calculation now centralized in TaxEngine
# Remove _fetch_ptax_series(), _lookup_ptax(), compute_tax_diferido()
# All tax logic moved to scripts/tax_engine.py


def main():
    print("reconstruct_tax.py — tax snapshot (IR diferido Lei 14.754/2023)")

    state      = _load_state()
    cache      = _load_cache()

    # Posições e câmbio do state (já atualizado por get_posicoes_precos)
    posicoes   = state.get("posicoes", {})
    cambio_atual = state.get("patrimonio", {}).get("cambio")

    if cambio_atual is None or cambio_atual <= 0:
        # Fallback: tentar config.py
        try:
            import sys
            sys.path.insert(0, str(ROOT / "scripts"))
            from config import CAMBIO_FALLBACK
            cambio_atual = CAMBIO_FALLBACK
            print(f"  ⚠️ câmbio não encontrado no state — usando CAMBIO_FALLBACK {cambio_atual}")
        except Exception:
            from config import CAMBIO_EMERGENCY
            cambio_atual = CAMBIO_EMERGENCY
            print(f"  ⚠️ câmbio não encontrado — usando CAMBIO_EMERGENCY {cambio_atual}")

    print("  ▶ calculando IR diferido via TaxEngine (Lei 14.754/2023) ...")
    try:
        tax_request = TaxRequest(posicoes=posicoes, cambio_atual=cambio_atual)
        tax_result = TaxEngine.calculate(tax_request)
        # Convert TaxResult dataclass to dict (compatible with existing code)
        tax_data = {
            "ir_diferido_total_brl": tax_result.ir_diferido_total_brl,
            "ir_por_etf": tax_result.ir_por_etf,
            "regime": tax_result.regime,
            "badges": tax_result.badges,
            "ptax_source": tax_result.ptax_source,
            "ptax_atual": tax_result.ptax_atual,
        }
    except ValueError as e:
        print(f"  ⚠️ TaxEngine error: {e}")
        tax_data = None

    if tax_data is None:
        # Preservar cache anterior se existir
        cached = cache.get("ir_diferido_total_brl")
        if cached is not None:
            print(f"  ⚠️ cálculo falhou — preservando cache (IR: R${cached:,.0f})")
            return
        print("  ⚠️ cálculo falhou e sem cache anterior")
        return

    snapshot = {
        "_generated": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        **tax_data,
    }

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(snapshot, indent=2))

    n_etfs = len(tax_data["ir_por_etf"])
    ptax_source = tax_data.get("ptax_source", "unknown")
    print(f"\n✅ {OUT.relative_to(ROOT)}")
    print(f"   IR diferido: R${tax_data['ir_diferido_total_brl']:,.0f} sobre {n_etfs} ETFs ({ptax_source})")


if __name__ == "__main__":
    main()
