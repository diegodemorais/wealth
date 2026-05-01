#!/usr/bin/env python3
"""
reconstruct_shadows.py — Agrega retornos mensais de shadow portfolios em períodos trimestrais.

Lê agentes/metricas/shadow-portfolio.md (tabela markdown com histórico mensal).
Agrega por trimestre usando TWR (produto de (1+r) para cada mês do trimestre).
Persiste em dados/dashboard_state.json via update_dashboard_state("shadows", {...}).

Uso:
    python3 scripts/reconstruct_shadows.py

Chaves produzidas em state.shadows:
    q1_2026, q2_2026, ... — formato {delta_a, delta_b, delta_c, periodo, atual, target}

(XX-system-audit Item 4)
"""

import re
import sys
from pathlib import Path
from datetime import date

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from config import update_dashboard_state, load_dashboard_state


# Mapeamento "Período" da tabela → (ano, trimestre)
_QUARTER_LABELS = {
    "q1": ["jan", "fev", "mar"],
    "q2": ["abr", "mai", "jun"],
    "q3": ["jul", "ago", "set"],
    "q4": ["out", "nov", "dez"],
}

_MONTH_MAP = {
    "jan": 1, "fev": 2, "mar": 3,
    "abr": 4, "mai": 5, "jun": 6,
    "jul": 7, "ago": 8, "set": 9,
    "out": 10, "nov": 11, "dez": 12,
}


def _parse_pct(s: str) -> float | None:
    """Converte '−1.42%' ou '+3.15pp' → float percentual. Retorna None se não parseable."""
    if not s:
        return None
    # Strip markdown bold/italic and other decorators
    s = s.strip().replace("**", "").replace("*", "").replace("≈", "").replace("~", "")
    s = s.strip()
    if s in ("—", "-", "n/d", ""):
        return None
    # Normalize unicode minus and pp/% suffixes
    s = s.replace("−", "-").replace("pp", "").replace("%", "").replace(",", ".").strip()
    try:
        return float(s)
    except ValueError:
        return None


def _find_shadow_file() -> Path | None:
    """Localiza o arquivo shadow-portfolio.md."""
    candidates = [
        ROOT / "agentes" / "metricas" / "shadow-portfolio.md",
        ROOT / "agentes" / "contexto" / "shadow-portfolio.md",
        ROOT / "dados" / "shadow-portfolio.md",
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


def _parse_table(md_path: Path) -> list[dict]:
    """
    Extrai linhas da tabela de performance mensal do markdown.

    Formato esperado:
    | Período | Atual | Target* | Shadow A (VWRA) | Shadow B (IPCA+) | Shadow C (...) | Delta A | Delta B | Delta C |

    Retorna lista de dicts com chaves: periodo, atual, target, shadow_a, shadow_b, shadow_c, delta_a, delta_b, delta_c
    """
    text = md_path.read_text(encoding="utf-8")
    rows = []
    in_table = False
    header_found = False

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            if in_table:
                break
            continue

        cols = [c.strip() for c in stripped.split("|") if c.strip()]
        if not cols:
            continue

        # Detectar header da tabela de performance
        if "Período" in cols[0] or "Periodo" in cols[0]:
            in_table = True
            header_found = True
            continue

        # Linha separadora (---|---|...)
        if in_table and all(set(c) <= set("-: ") for c in cols):
            continue

        if not in_table or not header_found:
            continue

        # Linha de dados
        if len(cols) < 7:
            continue

        periodo = cols[0]
        # Ignorar T0 e linhas sem dados úteis
        if "T0" in periodo or "---" in periodo:
            continue

        rows.append({
            "periodo": periodo,
            "atual":    _parse_pct(cols[1] if len(cols) > 1 else ""),
            "target":   _parse_pct(cols[2] if len(cols) > 2 else ""),
            "shadow_a": _parse_pct(cols[3] if len(cols) > 3 else ""),
            "shadow_b": _parse_pct(cols[4] if len(cols) > 4 else ""),
            "shadow_c": _parse_pct(cols[5] if len(cols) > 5 else ""),
            "delta_a":  _parse_pct(cols[6] if len(cols) > 6 else ""),
            "delta_b":  _parse_pct(cols[7] if len(cols) > 7 else ""),
            "delta_c":  _parse_pct(cols[8] if len(cols) > 8 else ""),
        })

    return rows


def _detect_quarter(periodo: str) -> tuple[str, int] | None:
    """
    Retorna (quarter_key, year) para um label de período.

    Exemplos:
      "Q1 2026 (Jan–Mar, aprox.)" → ("q1", 2026)
      "Abr/2026"                  → ("q2", 2026)  (mês único → trimestre ao qual pertence)
      "Jan/2026"                  → ("q1", 2026)
    """
    s = periodo.lower()
    # Tentar padrão "Q1 2026", "Q2 2026" etc.
    m = re.search(r"q([1-4])\s+(\d{4})", s)
    if m:
        return f"q{m.group(1)}", int(m.group(2))

    # Tentar mês/ano: "abr/2026", "mai/2026", etc.
    m = re.search(r"([a-záéíóúâêôãõç]+)[/\-\s](\d{4})", s)
    if m:
        mes_str = m.group(1)[:3]
        ano = int(m.group(2))
        mes_num = _MONTH_MAP.get(mes_str)
        if mes_num:
            quarter = (mes_num - 1) // 3 + 1
            return f"q{quarter}", ano

    return None


def _twr(retornos_pct: list[float]) -> float:
    """TWR de lista de retornos mensais (em %). Produto de (1 + r/100)."""
    acc = 1.0
    for r in retornos_pct:
        acc *= (1 + r / 100)
    return round((acc - 1) * 100, 4)


def _aggregate_quarters(rows: list[dict]) -> dict[str, dict]:
    """
    Agrega linhas mensais em trimestres via TWR.
    Linhas já trimestrais (label Q1/Q2/...) são usadas diretamente.

    Retorna: { "q1_2026": {delta_a, delta_b, delta_c, periodo, atual, target}, ... }
    """
    # Separar linhas que já são trimestrais (Q1/Q2/...) das mensais
    quarterly: dict[str, dict] = {}
    monthly_by_quarter: dict[str, list[dict]] = {}

    for row in rows:
        q = _detect_quarter(row["periodo"])
        if q is None:
            continue
        qkey, ano = q
        full_key = f"{qkey}_{ano}"

        # Se o label já é trimestral (ex: "Q1 2026 (Jan–Mar)")
        is_quarterly_label = bool(re.search(r"q[1-4]\s+\d{4}", row["periodo"].lower()))

        if is_quarterly_label:
            quarterly[full_key] = {
                "delta_a":  row["delta_a"],
                "delta_b":  row["delta_b"],
                "delta_c":  row["delta_c"],
                "periodo":  row["periodo"],
                "atual":    row["atual"],
                "target":   row["target"],
            }
        else:
            monthly_by_quarter.setdefault(full_key, []).append(row)

    # Agregar mensais via TWR para trimestres sem dados trimestrais diretos
    for full_key, month_rows in monthly_by_quarter.items():
        if full_key in quarterly:
            continue  # já temos dados trimestrais diretos

        def _agg_field(field: str) -> float | None:
            vals = [r[field] for r in month_rows if r[field] is not None]
            if not vals:
                return None
            return _twr(vals)

        # Delta TWR agregado
        delta_a_vals = [r["delta_a"] for r in month_rows if r["delta_a"] is not None]
        delta_b_vals = [r["delta_b"] for r in month_rows if r["delta_b"] is not None]
        delta_c_vals = [r["delta_c"] for r in month_rows if r["delta_c"] is not None]

        quarterly[full_key] = {
            "delta_a":  _twr(delta_a_vals) if delta_a_vals else None,
            "delta_b":  _twr(delta_b_vals) if delta_b_vals else None,
            "delta_c":  _twr(delta_c_vals) if delta_c_vals else None,
            "periodo":  full_key,
            "atual":    _agg_field("atual"),
            "target":   _agg_field("target"),
        }

    return quarterly


def reconstruct_shadows() -> dict[str, dict]:
    """
    Lê shadow-portfolio.md e retorna dict de quarters reconstruídos.
    Retorna {} se o arquivo não existir ou não tiver dados parseáveis.
    """
    md_path = _find_shadow_file()
    if md_path is None:
        print("  ⚠️ reconstruct_shadows: shadow-portfolio.md não encontrado — sem dados para reconstruir")
        return {}

    print(f"  ▶ reconstruct_shadows: lendo {md_path.relative_to(ROOT)}")
    rows = _parse_table(md_path)
    if not rows:
        print("  ⚠️ reconstruct_shadows: tabela de performance vazia ou não parseable — sem dados")
        return {}

    quarters = _aggregate_quarters(rows)
    print(f"  ✓ reconstruct_shadows: {len(quarters)} trimestre(s) reconstruído(s): {list(quarters.keys())}")
    return quarters


def main() -> None:
    quarters = reconstruct_shadows()
    if not quarters:
        print("  ⊘ Nada a persistir — verifique shadow-portfolio.md")
        return

    existing = load_dashboard_state().get("shadows", {})
    merged = {**existing, **quarters}
    update_dashboard_state("shadows", merged, generator="reconstruct_shadows.py")
    print(f"  ✓ shadows persistidos em dashboard_state.json: {list(quarters.keys())}")


if __name__ == "__main__":
    main()
