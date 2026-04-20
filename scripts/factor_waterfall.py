"""
factor_waterfall.py
Decompõe E[R] por fator para cada ETF
Premissas FF6 long-run (Fama-French 6-factor):
  Market premium: 5.0% gross → 4.5% pós-haircut
  Value (HML): 4.0% gross → 1.68% pós-haircut
  Size (SMB): 2.0% gross → 0.84% pós-haircut
  Quality (CMA/QMJ): 3.5% gross → 1.47% pós-haircut
  Momentum: 7.7% gross → 3.23% pós-haircut
  Haircut: 58% (McLean & Pontiff 2016 post-publication)

Loadings por ETF (estimados via literatura):
  SWRD: market=1.0, value=0.0, size=0.0, quality=0.05, momentum=0.0
  AVGS: market=1.0, value=0.35, size=0.30, quality=0.20, momentum=0.0
    (AVGS proxy: w_EUA=0.15 × AVUV + 0.85 × AVDV, DFA estimates)
  AVEM: market=1.0, value=0.40, size=0.25, quality=0.15, momentum=0.0
"""

import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent

HAIRCUT = 0.58

PREMIUMS_GROSS = {
    "market":   5.0,
    "value":    4.0,
    "size":     2.0,
    "quality":  3.5,
    "momentum": 7.7,
}

LOADINGS = {
    "SWRD": {"market": 1.0, "value": 0.00, "size": 0.00, "quality": 0.05, "momentum": 0.00},
    "AVGS": {"market": 1.0, "value": 0.35, "size": 0.30, "quality": 0.20, "momentum": 0.00},
    "AVEM": {"market": 1.0, "value": 0.40, "size": 0.25, "quality": 0.15, "momentum": 0.00},
}

PORTFOLIO_WEIGHTS = {"SWRD": 0.50, "AVGS": 0.30, "AVEM": 0.20}


def compute():
    etf_breakdown = {}
    for ticker, loadings in LOADINGS.items():
        steps = []
        total_gross = 0.0
        total_net = 0.0
        for factor, loading in loadings.items():
            if loading == 0:
                continue
            gross = PREMIUMS_GROSS[factor] * loading
            net = gross * (1 - HAIRCUT)
            total_gross += gross
            total_net += net
            steps.append({
                "factor": factor,
                "loading": loading,
                "premium_gross_pct": round(gross, 3),
                "premium_net_pct": round(net, 3),
            })
        etf_breakdown[ticker] = {
            "steps": steps,
            "total_gross_pct": round(total_gross, 3),
            "total_net_pct": round(total_net, 3),
        }

    # Portfolio weighted average
    port_gross = sum(PORTFOLIO_WEIGHTS[t] * etf_breakdown[t]["total_gross_pct"] for t in LOADINGS)
    port_net = sum(PORTFOLIO_WEIGHTS[t] * etf_breakdown[t]["total_net_pct"] for t in LOADINGS)

    return {
        "_generated": datetime.now().isoformat(),
        "_source": "factor_waterfall.py",
        "haircut_pct": HAIRCUT,
        "premiums_gross": PREMIUMS_GROSS,
        "portfolio_weights": PORTFOLIO_WEIGHTS,
        "etf_breakdown": etf_breakdown,
        "portfolio_weighted": {
            "total_gross_pct": round(port_gross, 3),
            "total_net_pct": round(port_net, 3),
        },
    }


if __name__ == "__main__":
    out = compute()
    out_path = ROOT / "dados" / "factor_waterfall.json"
    out_path.parent.mkdir(exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(out, f, indent=2)
    print(f"factor_waterfall.json gerado: portfolio net {out['portfolio_weighted']['total_net_pct']}%")
