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

# ETFs UCITS ACC — diferimento fiscal (Lei 14.754/2023, art. 2-3)
_ETFS_ACC = {"SWRD", "AVGS", "AVEM", "AVUV", "AVDV", "USSC", "EIMI", "AVES", "DGS", "IWVL"}
IR_ALIQUOTA = 0.15


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


def _fetch_ptax_series() -> dict:
    """Busca série PTAX ask BRL/USD de 2021-01-01 até hoje via python-bcb.
    Retorna dict {date_str: float} ou {} em caso de falha."""
    try:
        from bcb import currency
        end   = date.today()
        start = date(2021, 1, 1)
        df = currency.get(["USD"], start=str(start), end=str(end))
        if df is None or df.empty:
            return {}
        series = {}
        for idx, row in df.iterrows():
            d   = idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx)[:10]
            val = float(row.iloc[0]) if hasattr(row, "iloc") else float(row)
            series[d] = val
        print(f"    → PTAX BCB: {len(series)} dias ({min(series)} → {max(series)})")
        return series
    except Exception as e:
        print(f"    ⚠️ PTAX series fetch failed: {e}")
        return {}


def _lookup_ptax(dt_str: str, ptax_series: dict, fallback_cambio: float) -> float:
    """Retorna PTAX da data ou do último dia útil anterior (até 10 dias)."""
    try:
        d = datetime.strptime(dt_str, "%Y-%m-%d").date()
    except ValueError:
        return fallback_cambio
    for offset in range(11):
        key = (d - timedelta(days=offset)).strftime("%Y-%m-%d")
        if key in ptax_series:
            return ptax_series[key]
    return fallback_cambio


def compute_tax_diferido(posicoes: dict, cambio_atual: float, ptax_series: dict, ptax_source: str) -> dict | None:
    """Calcula IR diferido sobre ganhos não realizados de ETFs UCITS."""
    if not LOTES_PATH.exists():
        print("  ⚠️ lotes.json não encontrado — IR diferido não calculado")
        return None

    lotes_data = json.loads(LOTES_PATH.read_text())

    ir_total   = 0.0
    ir_por_etf = {}

    for ticker, info in lotes_data.items():
        if info.get("total_qty", 0) <= 0:
            continue
        if ticker not in _ETFS_ACC:
            continue

        preco_atual = None
        if ticker in posicoes:
            preco_atual = posicoes[ticker].get("price")
        if preco_atual is None or preco_atual <= 0:
            continue

        custo_total_brl = 0.0
        valor_total_brl = 0.0
        ganho_total_usd = 0.0
        ptax_soma       = 0.0
        ptax_peso       = 0.0

        for lot in info.get("lotes", []):
            qty = lot.get("qty", 0)
            if qty <= 0:
                continue
            custo_usd   = lot["custo_por_share"]
            data_compra = lot["data"]

            ptax_compra = _lookup_ptax(data_compra, ptax_series, cambio_atual)

            custo_brl       = qty * custo_usd * ptax_compra
            valor_brl       = qty * preco_atual * cambio_atual
            ganho_usd_lot   = qty * (preco_atual - custo_usd)

            custo_total_brl += custo_brl
            valor_total_brl += valor_brl
            ganho_total_usd += ganho_usd_lot

            peso       = qty * custo_usd
            ptax_soma += ptax_compra * peso
            ptax_peso += peso

        ganho_brl = valor_total_brl - custo_total_brl
        ir_etf    = IR_ALIQUOTA * max(0.0, ganho_brl)
        ir_total += ir_etf

        ptax_compra_medio = (ptax_soma / ptax_peso) if ptax_peso > 0 else cambio_atual

        ir_por_etf[ticker] = {
            "ganho_usd":          round(ganho_total_usd, 2),
            "ptax_compra_medio":  round(ptax_compra_medio, 4),
            "ptax_atual":         round(cambio_atual, 4),
            "custo_total_brl":    round(custo_total_brl, 2),
            "valor_atual_brl":    round(valor_total_brl, 2),
            "ganho_brl":          round(ganho_brl, 2),
            "ir_estimado":        round(ir_etf, 2),
        }

    badges = {ticker: "ACC — diferimento fiscal" for ticker in ir_por_etf}

    return {
        "ir_diferido_total_brl": round(ir_total, 2),
        "ir_por_etf":            ir_por_etf,
        "regime":                (
            "ACC UCITS — diferimento fiscal "
            "(Lei 14.754/2023, art. 2-3: 15% flat sobre ganho nominal em BRL na alienação)"
        ),
        "badges":                badges,
        "ptax_source":           ptax_source,
        "ptax_atual":            round(cambio_atual, 4),
    }


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
            cambio_atual = 5.70
            print(f"  ⚠️ câmbio não encontrado — usando fallback hardcoded {cambio_atual}")

    print("  ▶ buscando série PTAX ...")
    ptax_series = _fetch_ptax_series()
    ptax_source = "BCB PTAX ask" if ptax_series else "fallback (câmbio atual)"
    if not ptax_series:
        print(f"  ⚠️ PTAX série indisponível — usando câmbio atual R${cambio_atual} como fallback")

    print("  ▶ calculando IR diferido ...")
    tax_data = compute_tax_diferido(posicoes, cambio_atual, ptax_series, ptax_source)

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
    print(f"\n✅ {OUT.relative_to(ROOT)}")
    print(f"   IR diferido: R${tax_data['ir_diferido_total_brl']:,.0f} sobre {n_etfs} ETFs ({ptax_source})")


if __name__ == "__main__":
    main()
