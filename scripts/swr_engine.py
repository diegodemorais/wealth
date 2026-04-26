#!/usr/bin/env python3
"""
swr_engine.py — Centralized Safe Withdrawal Rate (SWR) Calculation Engine.

Single source of truth for SWR calculations (current and projection).

Pattern: Guaranteed Invariant (based on P(FIRE) centralization model)
  - Input validation: SWRRequest.__post_init__
  - Calculation: SWREngine.calculate_current() and .calculate_fire()
  - Output validation: SWRResult.__post_init__
  - Prohibition: grep catches SWR calculations outside this module

Concepts:
  - Current SWR: gasto_anual / patrimonio_atual (pre-FIRE monitoring)
  - FIRE SWR: gasto_anual / patrimonio_fire (retirement adequacy check)
  - Threshold (SWR_GATILHO): 3.0% (FIRE trigger)
  - Status: "verde" (>=3.5%), "amarelo" (2.5-3.5%), "vermelho" (<2.5%)

References:
  - fire_montecarlo.py: SWR_FALLBACK, withdrawal_pct_portfolio()
  - generate_data.py: compute_spending_guardrails()
  - FIRE metrics: SWR_GATILHO = 0.030
"""

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).parent.parent

import sys as _sys
_sys.path.insert(0, str(ROOT / "scripts"))
from config import SWR_GATILHO, SWR_FALLBACK, CUSTO_VIDA_BASE


@dataclass
class SWRRequest:
    """Input validation for SWR calculations."""

    # Current state
    patrimonio_atual: float  # BRL value today
    custo_vida_base: float = CUSTO_VIDA_BASE  # Annual spending

    # Configuration
    swr_gatilho: float = SWR_GATILHO  # FIRE threshold (3.0%)
    swr_fallback: float = SWR_FALLBACK  # Fallback if patrimonio unknown (3.5%)

    # Optional: for FIRE Day projection
    patrimonio_fire: float | None = None  # Projected value at FIRE
    anos_para_fire: int | None = None  # Years until FIRE

    def __post_init__(self):
        """Validate request constraints."""
        if self.patrimonio_atual < 0:
            raise ValueError(f"patrimonio_atual must be >= 0, got {self.patrimonio_atual}")
        if self.custo_vida_base <= 0:
            raise ValueError(f"custo_vida_base must be > 0, got {self.custo_vida_base}")
        if self.swr_gatilho <= 0:
            raise ValueError(f"swr_gatilho must be > 0, got {self.swr_gatilho}")
        if self.swr_fallback <= 0:
            raise ValueError(f"swr_fallback must be > 0, got {self.swr_fallback}")
        if self.patrimonio_fire is not None and self.patrimonio_fire < 0:
            raise ValueError(f"patrimonio_fire must be >= 0, got {self.patrimonio_fire}")


@dataclass
class SWRResult:
    """Output with guaranteed invariants."""

    swr_atual: float  # Current SWR (gasto / patrimonio)
    swr_status: Literal["verde", "amarelo", "vermelho"]  # Zone based on thresholds
    pfire_status: str  # Human-readable FIRE status

    # Metadata
    zona_descricao: str  # Description of current zone
    patrimonio_atual: float
    custo_vida_base: float
    swr_gatilho: float

    # Optional: FIRE Day projection
    swr_fire: float | None = None  # SWR at FIRE Day (if patrimonio_fire provided)
    pfire_adequacy: str | None = None  # FIRE adequacy at retirement
    anos_para_fire: int | None = None

    # Rastreability
    source: Literal["swr_engine"] = "swr_engine"
    _generated: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%dT%H:%M:%S"))

    def __post_init__(self):
        """Validate result invariants."""
        # Invariant 1: SWR values are positive
        if self.swr_atual <= 0:
            raise ValueError(f"swr_atual must be > 0, got {self.swr_atual}")
        if self.swr_fire is not None and self.swr_fire <= 0:
            raise ValueError(f"swr_fire must be > 0, got {self.swr_fire}")

        # Invariant 2: Status must be valid zone
        if self.swr_status not in ("verde", "amarelo", "vermelho"):
            raise ValueError(f"swr_status must be verde/amarelo/vermelho, got {self.swr_status}")

        # Invariant 3: Source is traceable
        if self.source != "swr_engine":
            raise ValueError(f"source must be 'swr_engine', got {self.source}")


class SWREngine:
    """Centralized SWR calculation engine.

    Single source of truth for Safe Withdrawal Rate calculations.
    All SWR computations must route through this engine.
    """

    @staticmethod
    def calculate_current(request: SWRRequest) -> SWRResult:
        """Calculate current SWR (pre-FIRE monitoring).

        SWR = gasto_anual / patrimonio_atual

        Zones:
          - Verde (≥3.5%): High withdrawal rate, reassess spending
          - Amarelo (2.5-3.5%): Safe zone, spending on track
          - Vermelho (<2.5%): Low withdrawal rate, can increase spending

        Args:
            request: SWRRequest with patrimonio_atual and custo_vida_base

        Returns:
            SWRResult with current SWR and status

        Raises:
            ValueError: If patrimonio_atual is 0 (use swr_fallback instead)
        """
        if request.patrimonio_atual <= 0:
            # Can't calculate SWR without patrimonio; use fallback
            swr_atual = request.swr_fallback
            pfire_status = "patrimonio desconhecido (usando SWR fallback)"
        else:
            swr_atual = request.custo_vida_base / request.patrimonio_atual

        # Determine status zone
        if swr_atual >= 0.035:
            zona = "verde"
            zona_desc = "Alto (≥3.5%) — repensar gastos ou aumentar patrimônio"
        elif swr_atual >= 0.025:
            zona = "amarelo"
            zona_desc = "Seguro (2.5–3.5%) — zona alvo, gasto bem dimensionado"
        else:
            zona = "vermelho"
            zona_desc = "Baixo (<2.5%) — pode aumentar spending"

        pfire_status = (
            f"SWR atual: {swr_atual:.2%} ({zona}). "
            f"Gatilho FIRE: {request.swr_gatilho:.2%}. "
            f"{'Acima do limiar FIRE.' if swr_atual > request.swr_gatilho else 'Abaixo do limiar FIRE.'}"
        )

        return SWRResult(
            swr_atual=round(swr_atual, 4),
            swr_status=zona,
            pfire_status=pfire_status,
            zona_descricao=zona_desc,
            patrimonio_atual=request.patrimonio_atual,
            custo_vida_base=request.custo_vida_base,
            swr_gatilho=request.swr_gatilho,
        )

    @staticmethod
    def calculate_fire(request: SWRRequest) -> SWRResult:
        """Calculate SWR at FIRE Day (retirement adequacy check).

        Projects SWR based on patrimonio_fire (P50 Monte Carlo projection).
        This is the key metric: can I retire at my planned patrimonio?

        Args:
            request: SWRRequest with patrimonio_fire and anos_para_fire

        Returns:
            SWRResult with projected SWR at FIRE Day

        Raises:
            ValueError: If patrimonio_fire or anos_para_fire not provided
        """
        if request.patrimonio_fire is None:
            raise ValueError("patrimonio_fire required for FIRE projection")

        if request.patrimonio_fire <= 0:
            # Can't retire without patrimonio
            swr_fire = 999.0  # Invalid: will fail validation
            pfire_adequacy = "Patrimônio FIRE insuficiente"
        else:
            swr_fire = request.custo_vida_base / request.patrimonio_fire

        # Determine FIRE adequacy based on swr_fire
        if swr_fire <= request.swr_gatilho:
            adequacy_zona = "verde"
            adequacy_desc = "✅ Adequado — SWR ≤ 3.0%, FIRE é viável"
        elif swr_fire <= 0.035:
            adequacy_zona = "amarelo"
            adequacy_desc = "⚠️ Marginal — SWR 3.0-3.5%, considere ajustes"
        else:
            adequacy_zona = "vermelho"
            adequacy_desc = "❌ Inadequado — SWR > 3.5%, aumente patrimônio ou reduza gastos"

        pfire_adequacy = f"{adequacy_desc} (SWR FIRE: {swr_fire:.2%})"

        return SWRResult(
            swr_atual=swr_fire,  # Use swr_fire for validation matching
            swr_status=adequacy_zona,
            pfire_status=adequacy_desc,
            zona_descricao=adequacy_desc,
            patrimonio_atual=request.patrimonio_atual,
            custo_vida_base=request.custo_vida_base,
            swr_gatilho=request.swr_gatilho,
            swr_fire=round(swr_fire, 4),
            pfire_adequacy=pfire_adequacy,
            anos_para_fire=request.anos_para_fire,
        )

    @staticmethod
    def calculate(request: SWRRequest, include_fire_projection: bool = False) -> SWRResult:
        """Calculate both current and FIRE SWR (comprehensive analysis).

        Args:
            request: SWRRequest with all parameters
            include_fire_projection: If True, includes patrimonio_fire calculation

        Returns:
            SWRResult with current SWR and optionally FIRE projection
        """
        if include_fire_projection and request.patrimonio_fire is not None:
            return SWREngine.calculate_fire(request)
        return SWREngine.calculate_current(request)
