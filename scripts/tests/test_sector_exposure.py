"""
test_sector_exposure.py — Validação de DEV-sector-exposure (2026-05-01).

A função compute_sector_exposure é definida inline em generate_data.py (closure),
seguindo o mesmo padrão de _compute_overlap_detection. Os testes abaixo validam:

1. Invariantes matemáticos (soma=100%, ETF subsums batem com total)
2. 11 setores GICS canônicos presentes
3. data.json gerado contém sector_exposure quando disponível
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

GICS_SECTORS = [
    'Information Technology', 'Financials', 'Health Care', 'Consumer Discretionary',
    'Industrials', 'Communication Services', 'Consumer Staples', 'Energy',
    'Materials', 'Real Estate', 'Utilities',
]


def _build_proxy():
    """Replica o cálculo proxy de generate_data.py para teste isolado."""
    from config import EQUITY_WEIGHTS

    w_swrd = EQUITY_WEIGHTS.get("SWRD", 0.50)
    w_avgs = EQUITY_WEIGHTS.get("AVGS", 0.30)
    w_avem = EQUITY_WEIGHTS.get("AVEM", 0.20)

    swrd = {'Information Technology':25.4,'Financials':16.0,'Health Care':11.2,'Consumer Discretionary':10.5,'Industrials':10.8,'Communication Services':7.6,'Consumer Staples':5.9,'Energy':3.8,'Materials':3.5,'Real Estate':2.4,'Utilities':2.9}
    avgs = {'Information Technology':10.5,'Financials':24.0,'Health Care':6.5,'Consumer Discretionary':12.5,'Industrials':19.0,'Communication Services':3.5,'Consumer Staples':4.5,'Energy':7.5,'Materials':7.0,'Real Estate':3.0,'Utilities':2.0}
    avem = {'Information Technology':14.0,'Financials':28.5,'Health Care':4.0,'Consumer Discretionary':10.0,'Industrials':7.5,'Communication Services':8.5,'Consumer Staples':5.5,'Energy':8.0,'Materials':10.5,'Real Estate':2.0,'Utilities':1.5}
    msci = {'Information Technology':24.5,'Financials':16.2,'Health Care':11.5,'Consumer Discretionary':10.7,'Industrials':11.0,'Communication Services':7.8,'Consumer Staples':6.0,'Energy':3.9,'Materials':3.6,'Real Estate':2.5,'Utilities':2.3}

    by_sector = {}
    for sec in GICS_SECTORS:
        sw = round(w_swrd * swrd[sec], 4)
        av = round(w_avgs * avgs[sec], 4)
        em = round(w_avem * avem[sec], 4)
        by_sector[sec] = {
            "total_pct": round(sw + av + em, 4),
            "swrd_pct": sw,
            "avgs_pct": av,
            "avem_pct": em,
            "msci_world_pct": msci[sec],
        }
    return by_sector


def test_proxy_distributions_sum_100():
    """Cada distribuição intra-ETF deve somar 100%."""
    swrd = {'Information Technology':25.4,'Financials':16.0,'Health Care':11.2,'Consumer Discretionary':10.5,'Industrials':10.8,'Communication Services':7.6,'Consumer Staples':5.9,'Energy':3.8,'Materials':3.5,'Real Estate':2.4,'Utilities':2.9}
    avgs = {'Information Technology':10.5,'Financials':24.0,'Health Care':6.5,'Consumer Discretionary':12.5,'Industrials':19.0,'Communication Services':3.5,'Consumer Staples':4.5,'Energy':7.5,'Materials':7.0,'Real Estate':3.0,'Utilities':2.0}
    avem = {'Information Technology':14.0,'Financials':28.5,'Health Care':4.0,'Consumer Discretionary':10.0,'Industrials':7.5,'Communication Services':8.5,'Consumer Staples':5.5,'Energy':8.0,'Materials':10.5,'Real Estate':2.0,'Utilities':1.5}
    msci = {'Information Technology':24.5,'Financials':16.2,'Health Care':11.5,'Consumer Discretionary':10.7,'Industrials':11.0,'Communication Services':7.8,'Consumer Staples':6.0,'Energy':3.9,'Materials':3.6,'Real Estate':2.5,'Utilities':2.3}
    for label, dist in [("SWRD", swrd), ("AVGS", avgs), ("AVEM", avem), ("MSCI", msci)]:
        assert abs(sum(dist.values()) - 100.0) < 0.1, f"{label} sum != 100"


def test_aggregate_sums_100_pct():
    """Soma dos 11 setores agregados = 100% do equity."""
    by_sector = _build_proxy()
    total = sum(v["total_pct"] for v in by_sector.values())
    assert abs(total - 100.0) < 0.5, f"Aggregate total = {total:.4f}"


def test_etf_components_sum_to_total():
    """Para cada setor: swrd_pct + avgs_pct + avem_pct == total_pct (±0.05)."""
    by_sector = _build_proxy()
    for sec, row in by_sector.items():
        s = row["swrd_pct"] + row["avgs_pct"] + row["avem_pct"]
        assert abs(s - row["total_pct"]) < 0.05, f"{sec}: subsum {s} != total {row['total_pct']}"


def test_eleven_gics_sectors():
    """Exatamente 11 setores GICS no output."""
    by_sector = _build_proxy()
    assert len(by_sector) == 11
    for sec in GICS_SECTORS:
        assert sec in by_sector


def test_msci_world_benchmark_present():
    """Cada setor tem benchmark MSCI World."""
    by_sector = _build_proxy()
    for sec, row in by_sector.items():
        assert "msci_world_pct" in row
        assert row["msci_world_pct"] is not None
        assert 0 <= row["msci_world_pct"] <= 100


def test_dominant_sector_is_financials():
    """No portfolio 50/30/20 (market-cap + value tilt), Financials > Tech."""
    by_sector = _build_proxy()
    rows = sorted(by_sector.items(), key=lambda kv: kv[1]["total_pct"], reverse=True)
    dominant = rows[0][0]
    # Insight chave: 50% value tilt empurra Financials acima de Tech
    assert dominant == 'Financials', f"Dominant = {dominant}"
    fin = by_sector['Financials']['total_pct']
    tech = by_sector['Information Technology']['total_pct']
    assert fin > tech, f"Fin {fin} not > Tech {tech}"


def test_sector_exposure_in_data_json_if_available():
    """Se data.json existe e tem sector_exposure, valida estrutura."""
    candidates = [
        ROOT / "dados" / "data.json",
        ROOT / "dashboard" / "data.json",
        ROOT / "react-app" / "public" / "data.json",
    ]
    found = False
    for p in candidates:
        if not p.exists():
            continue
        d = json.loads(p.read_text())
        se = d.get("sector_exposure")
        if not se:
            continue
        found = True
        assert "by_sector" in se
        assert "dominant" in se
        assert len(se["by_sector"]) == 11
        for sec, row in se["by_sector"].items():
            assert sec in GICS_SECTORS
            for key in ("total_pct", "swrd_pct", "avgs_pct", "avem_pct"):
                assert key in row, f"{p.name}/{sec} missing {key}"
        total = sum(v["total_pct"] for v in se["by_sector"].values())
        assert abs(total - 100.0) < 0.5, f"{p.name}: aggregate = {total}"
    if not found:
        pytest.skip("Nenhum data.json disponível com sector_exposure ainda")
