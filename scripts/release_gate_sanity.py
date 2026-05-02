#!/usr/bin/env python3
"""Release Gate — Sanity numérico + Anti-cliff.

Valida `react-app/public/data.json` contra:
  1. Lista de assertions de range plausível (P(FIRE), Selic, IPCA+, patrimônio, etc.)
  2. Anti-cliff em séries de chart (último ponto vs penúltimo: bug do drawdown -91%
     que escapou em 2026-05-01).

Uso:
    python3 scripts/release_gate_sanity.py
    python3 scripts/release_gate_sanity.py --data <path>   # validar fixture custom

Exit:
    0 — todas as assertions passaram
    1 — ao menos uma falhou (lista no stdout)

Origem: DEV-release-gate-checklist (2026-05-01).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Callable, Iterable

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DATA = ROOT / "react-app" / "public" / "data.json"


# ────────────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────────────

def get_nested(data: Any, path: str) -> Any:
    """Resolve `a.b.c` / `a.b[0].c` em estrutura aninhada. None se ausente."""
    cur: Any = data
    for token in path.split("."):
        if cur is None:
            return None
        # suporte a indexing tipo "campo[0]"
        if "[" in token and token.endswith("]"):
            name, idx_str = token.split("[", 1)
            idx = int(idx_str.rstrip("]"))
            if name:
                cur = cur.get(name) if isinstance(cur, dict) else None
            if isinstance(cur, list) and 0 <= idx < len(cur):
                cur = cur[idx]
            elif isinstance(cur, list) and idx < 0 and abs(idx) <= len(cur):
                cur = cur[idx]
            else:
                return None
        else:
            cur = cur.get(token) if isinstance(cur, dict) else None
    return cur


# ────────────────────────────────────────────────────────────────────────────
# Sanity assertions — 10 campos críticos
# ────────────────────────────────────────────────────────────────────────────

# Cada assertion: (path, predicate, label)
# Ranges escolhidos para serem "plausíveis e práticos" (não academicamente perfeitos)
# — bloqueiam erros grosseiros (negativos, fora de ordem de grandeza, NaN textual)
# sem falsos-positivos por flutuação normal.
SANITY_ASSERTIONS: list[tuple[str, Callable[[Any], bool], str]] = [
    # KPI / patrimônio
    (
        "patrimonio_holistico.financeiro_brl",
        lambda v: isinstance(v, (int, float)) and 1_000_000 < v < 50_000_000,
        "patrimônio financeiro em [R$ 1M, R$ 50M]",
    ),
    (
        "patrimonio_holistico.total_brl",
        lambda v: isinstance(v, (int, float)) and 1_000_000 < v < 100_000_000,
        "patrimônio total holístico em [R$ 1M, R$ 100M]",
    ),
    # P(FIRE) — janelas plausíveis
    (
        "pfire_base.base",
        lambda v: isinstance(v, (int, float)) and 0 <= v <= 100,
        "P(FIRE) base em [0,100]",
    ),
    (
        "pfire_base.fav",
        lambda v: isinstance(v, (int, float)) and 0 <= v <= 100,
        "P(FIRE) fav em [0,100]",
    ),
    (
        "pfire_base.stress",
        lambda v: isinstance(v, (int, float)) and 0 <= v <= 100,
        "P(FIRE) stress em [0,100]",
    ),
    # Macro Brasil
    (
        "macro.selic_meta",
        lambda v: isinstance(v, (int, float)) and 5 <= v <= 25,
        "Selic em [5,25]%",
    ),
    (
        "macro.ipca_12m",
        lambda v: isinstance(v, (int, float)) and 0 <= v <= 15,
        "IPCA 12m em [0,15]%",
    ),
    (
        "macro.cambio",
        lambda v: isinstance(v, (int, float)) and 3 <= v <= 10,
        "USD/BRL em [3, 10]",
    ),
    # Tesouro Direto — taxas reais IPCA+
    (
        "rf.ipca2040.taxa",
        lambda v: isinstance(v, (int, float)) and 3 <= v <= 12,
        "IPCA+ 2040 taxa real em [3,12]%",
    ),
    (
        "rf.renda2065.taxa",
        lambda v: isinstance(v, (int, float)) and 3 <= v <= 12,
        "Renda+ 2065 taxa real em [3,12]%",
    ),
    # Drawdown — current absoluto e max
    (
        "drawdown_history.max_drawdown",
        lambda v: isinstance(v, (int, float)) and -80 <= v <= 0,
        "max_drawdown em [-80, 0]%",
    ),
    # FIRE — SWR
    (
        "fire.swr_current",
        lambda v: isinstance(v, (int, float)) and 0 < v < 10,
        "SWR atual em (0, 10)%",
    ),
    # Sharpe — backtest target sanity
    (
        "backtest.metrics.target.sharpe",
        lambda v: isinstance(v, (int, float)) and -1 <= v <= 3,
        "Sharpe backtest target em [-1, 3]",
    ),
    # Sortino rolling — todas as observações finitas em [-10, 10]
    # Origem: bug 2026-05-02 (sortino[2024-11] = 19,259, janela sem downside).
    (
        "rolling_sharpe.sortino",
        lambda v: isinstance(v, list) and all(
            x is None or (isinstance(x, (int, float)) and -10 <= x <= 10)
            for x in v
        ),
        "rolling_sharpe.sortino: todos os valores finitos em [-10, 10] (None = janela degenerada)",
    ),
    # P(FIRE) aspiracional — fav DEVE ser > base (definição). bug 2026-05-02: idênticos (91.6).
    (
        "pfire_aspiracional",
        lambda v: (
            isinstance(v, dict)
            and v.get("base") is not None
            and v.get("fav") is not None
            and float(v["fav"]) > float(v["base"])
        ),
        "pfire_aspiracional.fav > base (cenário favorável tem premissas mais otimistas)",
    ),
    # Selic vigente — rolling_sharpe.rf_brl.taxa_anual em range plausível.
    # Origem: bug 2026-05-02 (rolling tinha 14.75 stale, Selic vigente 14.50 após Copom 29/abr).
    (
        "rolling_sharpe.rf_brl.taxa_anual",
        lambda v: isinstance(v, (int, float)) and 5 <= v <= 25,
        "rolling rf_brl.taxa_anual em [5,25]% (Selic plausível)",
    ),
]


# ────────────────────────────────────────────────────────────────────────────
# Anti-cliff
# ────────────────────────────────────────────────────────────────────────────

def assert_no_cliff(
    series: list[float] | None,
    name: str,
    *,
    max_rel_change: float = 0.5,
    max_abs_change: float = 5.0,
    min_len: int = 24,
) -> str | None:
    """Detecta cliff vertical entre os 2 últimos pontos não-nulos.

    Threshold conjunto (relativo E absoluto) evita falso-positivo em séries
    onde valores são pequenos (drawdown -2% → -3% = 50% relativo, 1pp absoluto:
    NÃO é cliff). Bug original: drawdown saltou de ~-7% para -91% em 1 mês.

    Args:
        series: array numérico (None / NaN são ignorados na busca dos 2 últimos)
        name: rótulo pra mensagem de erro
        max_rel_change: divergência relativa tolerada (0.5 = 50%)
        max_abs_change: divergência absoluta tolerada (em unidades da série)
        min_len: ignora séries muito curtas (baixa significância)

    Returns:
        None se OK, string de erro se cliff detectado.
    """
    if not isinstance(series, list) or len(series) < min_len:
        return None

    # Filtra None / NaN — mantém só os finitos
    finite = [x for x in series if isinstance(x, (int, float)) and x == x]
    if len(finite) < 2:
        return None

    last, prev = float(finite[-1]), float(finite[-2])
    abs_diff = abs(last - prev)
    rel_diff = abs_diff / abs(prev) if prev != 0 else (1.0 if last != 0 else 0.0)

    if rel_diff > max_rel_change and abs_diff > max_abs_change:
        return (
            f"❌ {name}: cliff vertical entre últimos pontos — "
            f"{prev:.3f} → {last:.3f} (Δ={abs_diff:.3f}, "
            f"{rel_diff*100:.0f}% relativo)"
        )
    return None


# Séries vigiadas — todas devem ter ≥24 pontos pra valer a checagem.
#
# NOTA sobre thresholds: séries mensais de retorno (twr_pct, twr_usd_pct)
# legitimamente oscilam com sign flip mês-a-mês — aplicar threshold
# absoluto largo (20pp) já pega cliffs catastróficos (ex: 5% → -50%) sem
# falsos positivos por volatility normal.
#
# Séries cumulativas (drawdown, acumulado, fire_trilha) são monótonas em
# escala de meses — threshold mais apertado.
ANTI_CLIFF_SERIES: list[tuple[str, dict]] = [
    # (path, kwargs específicos)
    # Drawdown: bug original (-7% → -91% = 84pp absoluto). Threshold conservador.
    ("drawdown_history.drawdown_pct", {"max_abs_change": 15.0}),
    # Cumulativo TWR: monótono em ordem de magnitude — salto >30pp é suspeito.
    ("retornos_mensais.acumulado_pct", {"max_abs_change": 30.0}),
    ("retornos_mensais.acumulado_usd_pct", {"max_abs_change": 30.0}),
    # Mensais (twr_pct/twr_usd_pct): sign-flip é normal — só pega catástrofes.
    ("retornos_mensais.twr_pct", {"max_abs_change": 20.0}),
    ("retornos_mensais.twr_usd_pct", {"max_abs_change": 25.0}),
    # Rolling Sharpe: pode mudar 1+ ponto entre janelas — threshold 1.5 absoluto.
    ("rolling_sharpe.values", {"max_abs_change": 1.5, "min_len": 24}),
    # Trilha FIRE: cumulativa, BRL — salto >5M = bug.
    ("fire_trilha.trilha_p50_brl", {"max_abs_change": 5_000_000}),
    ("fire_trilha.trilha_brl", {"max_abs_change": 5_000_000}),
]


# ────────────────────────────────────────────────────────────────────────────
# Runner
# ────────────────────────────────────────────────────────────────────────────

def run_sanity_checks(data: dict) -> list[str]:
    failures: list[str] = []
    for path, predicate, label in SANITY_ASSERTIONS:
        val = get_nested(data, path)
        if val is None:
            failures.append(f"❌ {path}: ausente ({label})")
            continue
        try:
            ok = predicate(val)
        except Exception as e:  # predicate explodiu
            failures.append(f"❌ {label}: predicate erro — {e}")
            continue
        if not ok:
            failures.append(f"❌ {label}: valor {val!r} fora do range")
    return failures


def run_cliff_checks(data: dict) -> list[str]:
    failures: list[str] = []
    for path, kwargs in ANTI_CLIFF_SERIES:
        series = get_nested(data, path)
        err = assert_no_cliff(series, path, **kwargs)
        if err:
            failures.append(err)
    return failures


def run_cross_field_checks(data: dict) -> list[str]:
    """Cross-field assertions: consistência entre campos relacionados.

    Origem: bug 2026-05-02 — rolling_sharpe.rf_brl tinha 14.75 (Selic anterior)
    enquanto macro.selic_meta já mostrava 14.50 (corte Copom 29/abr). Causa:
    rolling_metrics.json persistido sem rebuild após mudança da Selic.
    Tolerância 0.50pp (= um corte/alta típico) absorve um run defasado;
    >0.50pp indica rolling stale e exige `--rebuild`.
    """
    failures: list[str] = []

    rolling_rf = get_nested(data, "rolling_sharpe.rf_brl.taxa_anual")
    selic_meta = get_nested(data, "macro.selic_meta")
    if (
        isinstance(rolling_rf, (int, float))
        and isinstance(selic_meta, (int, float))
        and abs(rolling_rf - selic_meta) > 0.50
    ):
        failures.append(
            f"❌ rolling_sharpe.rf_brl.taxa_anual ({rolling_rf}) divergente de "
            f"macro.selic_meta ({selic_meta}) — Δ>0.50pp. "
            "Rolling pode estar stale (rebuild com --rebuild)."
        )

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Release gate sanity + anti-cliff")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA,
                        help=f"path do data.json (default: {DEFAULT_DATA})")
    parser.add_argument("--quiet", action="store_true",
                        help="só imprime falhas; sem 'OK' final")
    args = parser.parse_args()

    if not args.data.exists():
        print(f"❌ data.json não encontrado: {args.data}")
        return 1

    try:
        data = json.loads(args.data.read_text())
    except json.JSONDecodeError as e:
        print(f"❌ data.json inválido (JSON): {e}")
        return 1

    sanity_fails = run_sanity_checks(data)
    cliff_fails = run_cliff_checks(data)
    cross_fails = run_cross_field_checks(data)
    all_fails = sanity_fails + cliff_fails + cross_fails

    if all_fails:
        print("Release gate sanity: FALHOU")
        for line in all_fails:
            print(f"  {line}")
        print(
            f"\nTotal: {len(sanity_fails)} sanity + {len(cliff_fails)} cliff + "
            f"{len(cross_fails)} cross-field"
        )
        return 1

    if not args.quiet:
        n = len(SANITY_ASSERTIONS) + len(ANTI_CLIFF_SERIES) + 1
        print(f"✅ sanity numérico OK ({n} checks: "
              f"{len(SANITY_ASSERTIONS)} sanity + {len(ANTI_CLIFF_SERIES)} anti-cliff + 1 cross-field)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
