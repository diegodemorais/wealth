#!/usr/bin/env python3
"""
pfire_transformer.py — Centralizado: transforma p_sucesso (0-1) → forma canônica.

Fonte única de transformação para P(FIRE) em Python. Todas as camadas de
geração (fire_montecarlo.py, generate_data.py) DEVEM passar por esta função.

Regra obrigatória: Nenhum × 100 ou ÷ 100 é permitido fora desta função.
Validação: tests/pfire-canonicalization.test.py (QA enforcement).
"""

import math
from dataclasses import dataclass
from typing import Literal


@dataclass
class CanonicalPFire:
    """Forma canônica unificada para P(FIRE)."""
    decimal: float  # 0-1, ex: 0.864
    percentage: float  # 0-100, ex: 86.4
    source: Literal['mc', 'heuristic', 'fallback']
    is_canonical: bool = True

    @property
    def pct_str(self) -> str:
        """String formatada para display, ex: "86.4%"."""
        if not self.is_canonical:
            return f"{self.percentage:.1f}% (não-canônico)"
        return f"{self.percentage:.1f}%"

    def to_json(self) -> dict:
        """Serializa para JSON com rastreabilidade."""
        return {
            "pct": self.percentage,
            "decimal": self.decimal,
            "source": self.source,
            "is_canonical": self.is_canonical,
        }


def canonicalize_pfire(
    p_sucesso: float,
    source: Literal['mc', 'heuristic', 'fallback'] = 'mc'
) -> CanonicalPFire:
    """
    Transforma p_sucesso (0-1) → forma canônica.

    GARANTIA: Esta é a ÚNICA função autorizada para fazer conversão × 100.

    Args:
        p_sucesso: Fração decimal 0-1 de fire_montecarlo.py
        source: 'mc' = Monte Carlo real
                'heuristic' = Deduzido (ex: +4pp para fav)
                'fallback' = Constante stale (ex: 82.2% fallback)

    Returns:
        CanonicalPFire com decimal, percentage, source, is_canonical

    Raises:
        ValueError: Se p_sucesso está fora de [0, 1]
    """
    if not isinstance(p_sucesso, (int, float)):
        raise TypeError(f"p_sucesso must be number, got {type(p_sucesso)}")

    if math.isnan(p_sucesso) or math.isinf(p_sucesso):
        raise ValueError(f"p_sucesso cannot be NaN or Inf, got {p_sucesso}")

    if not (0 <= p_sucesso <= 1):
        raise ValueError(
            f"p_sucesso must be in [0, 1], got {p_sucesso}. "
            f"If you have a percentage (0-100), divide by 100 first."
        )

    # Conversão autorizada × 100 (AQUI APENAS)
    percentage = round(p_sucesso * 100, 1)

    return CanonicalPFire(
        decimal=p_sucesso,
        percentage=percentage,
        source=source,
        is_canonical=(source == 'mc')
    )


def apply_pfire_delta(
    base_pfire: CanonicalPFire,
    delta_pct: float,
    reason: str = ""
) -> CanonicalPFire:
    """
    Aplica delta (ex: +2.05pp para fav) mantendo rastreabilidade.

    Args:
        base_pfire: CanonicalPFire base (ex: 86.4%)
        delta_pct: Delta em pontos percentuais (ex: +2.05 para fav)
        reason: Por que este delta (ex: "fav = base + delta_fav")

    Returns:
        Nova CanonicalPFire com delta aplicado, source='heuristic' se delta vem de base
    """
    if not base_pfire.is_canonical:
        raise ValueError(
            f"Cannot apply delta to non-canonical source ({base_pfire.source}). "
            f"Base must be 'mc' before applying deltas."
        )

    new_percentage = base_pfire.percentage + delta_pct
    new_decimal = new_percentage / 100

    # Clamp to [0, 100]
    new_decimal = max(0, min(1, new_decimal))
    new_percentage = round(new_decimal * 100, 1)

    return CanonicalPFire(
        decimal=new_decimal,
        percentage=new_percentage,
        source='heuristic',  # Deltas são sempre heurísticos
        is_canonical=False
    )


def validate_pfire_consistency(
    p1: CanonicalPFire,
    p2: CanonicalPFire,
    tolerance_pct: float = 1.0
) -> tuple[bool, str]:
    """
    Valida consistência entre dois P(FIRE).

    Usado para verificar se MC de monte carlo.py ==
    valor parseado em generate_data.py (dentro de tolerância).

    Args:
        p1, p2: Dois valores de P(FIRE)
        tolerance_pct: Tolerância em pontos percentuais (padrão 1.0pp)

    Returns:
        (is_consistent: bool, message: str)
    """
    diff = abs(p1.percentage - p2.percentage)
    consistent = diff <= tolerance_pct

    msg = f"P(FIRE) diff: {diff:.1f}pp (tolerance: {tolerance_pct}pp)"
    if not consistent:
        msg += f" — INCONSISTENT: {p1.percentage}% vs {p2.percentage}%"

    return consistent, msg


if __name__ == "__main__":
    # Exemplo de uso
    p_sucesso_from_mc = 0.864
    pfire = canonicalize_pfire(p_sucesso_from_mc, source='mc')

    print(f"Base P(FIRE): {pfire.pct_str}")
    print(f"JSON: {pfire.to_json()}")

    # Aplicar delta para cenário fav
    delta_fav = 2.05  # pp
    pfire_fav = apply_pfire_delta(pfire, delta_fav, "fav = base + delta")
    print(f"Fav P(FIRE): {pfire_fav.pct_str} (source={pfire_fav.source})")
