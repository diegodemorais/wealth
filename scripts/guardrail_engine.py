#!/usr/bin/env python3
"""
guardrail_engine.py — Centralized Spending Guardrails Engine.

Single source of truth for spending guardrail calculations.

Pattern: Guaranteed Invariant (based on P(FIRE) centralization model)
  - Input validation: GuardrailRequest.__post_init__
  - Calculation: GuardrailEngine.calculate()
  - Output validation: GuardrailResult.__post_init__
  - Prohibition: grep catches guardrail calculations outside this module

Concepts:
  - Guardrails: Upper/Safe/Lower spending limits based on P(FIRE)
  - Drawdown: (1 - patrimonio_atual / patrimonio_pico) — market decline from peak
  - Zones: Verde (≥85%), Amarelo (75-85%), Vermelho (<75%)

References:
  - fire_montecarlo.py: aplicar_guardrail(), GUARDRAILS list
  - generate_data.py: compute_spending_guardrails()
  - Guardrails_Config: (dd_min, dd_max, corte, desc)
"""

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).parent.parent

import sys as _sys
_sys.path.insert(0, str(ROOT / "scripts"))
from config import (
    CUSTO_VIDA_BASE, GUARDRAILS_BANDA1_MIN, GUARDRAILS_BANDA2_MIN, GUARDRAILS_BANDA3_MIN,
    GUARDRAILS_CORTE1_PCT, GUARDRAILS_CORTE2_PCT, GUARDRAILS_PISO_PCT,
    GASTO_PISO,
)


@dataclass
class GuardrailRequest:
    """Input validation for guardrail calculations."""

    # P(FIRE) status
    pfire_atual: float  # Current P(FIRE) percentage (0-100)
    spending_atual: float = CUSTO_VIDA_BASE  # Current annual spending

    # Market status (for drawdown-based guardrails)
    patrimonio_atual: float = 0  # Current portfolio value (0 = skip drawdown)
    patrimonio_pico: float = 0  # Peak value from which to calculate drawdown

    # Configuration
    expansion_pct: float = 0.10  # Upper guardrail: +10%
    corte_safe_pct: float = 0.10  # Safe target: -10%
    corte_lower_pct: float = 0.20  # Lower guardrail: -20%

    def __post_init__(self):
        """Validate request constraints."""
        if not (0 <= self.pfire_atual <= 100):
            raise ValueError(f"pfire_atual must be 0-100%, got {self.pfire_atual}")
        if self.spending_atual <= 0:
            raise ValueError(f"spending_atual must be > 0, got {self.spending_atual}")
        if self.patrimonio_atual < 0:
            raise ValueError(f"patrimonio_atual must be >= 0, got {self.patrimonio_atual}")
        if self.patrimonio_pico < 0:
            raise ValueError(f"patrimonio_pico must be >= 0, got {self.patrimonio_pico}")
        if not (0 <= self.expansion_pct <= 1):
            raise ValueError(f"expansion_pct must be 0-1, got {self.expansion_pct}")
        if not (0 <= self.corte_safe_pct <= 1):
            raise ValueError(f"corte_safe_pct must be 0-1, got {self.corte_safe_pct}")
        if not (0 <= self.corte_lower_pct <= 1):
            raise ValueError(f"corte_lower_pct must be 0-1, got {self.corte_lower_pct}")


@dataclass
class GuardrailResult:
    """Output with guaranteed invariants."""

    # P(FIRE) zone
    zona: Literal["verde", "amarelo", "vermelho"]  # P(FIRE) zone
    pfire_atual: float  # Current P(FIRE)

    # Spending limits
    spending_atual: float
    upper_guardrail: float  # Expansion limit (+10%)
    safe_target: float  # Safe spending (-10%)
    lower_guardrail: float  # Emergency floor (-20%)

    # Metadata
    banda: str  # Which P(FIRE) band (Verde 85+, Amarelo 75-85, Vermelho <75)
    nota: str  # Human-readable explanation

    # Optional: Drawdown-adjusted limit
    gasto_com_drawdown: float | None = None  # Spending after drawdown guardrail

    # Rastreability
    source: Literal["guardrail_engine"] = "guardrail_engine"
    _generated: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%dT%H:%M:%S"))

    def __post_init__(self):
        """Validate result invariants."""
        # Invariant 1: All spending values are positive
        if self.spending_atual <= 0:
            raise ValueError(f"spending_atual must be > 0, got {self.spending_atual}")
        if self.upper_guardrail <= 0:
            raise ValueError(f"upper_guardrail must be > 0, got {self.upper_guardrail}")
        if self.safe_target <= 0:
            raise ValueError(f"safe_target must be > 0, got {self.safe_target}")
        if self.lower_guardrail <= 0:
            raise ValueError(f"lower_guardrail must be > 0, got {self.lower_guardrail}")

        # Invariant 2: Ordering must be upper > safe > lower
        if not (self.upper_guardrail >= self.safe_target >= self.lower_guardrail):
            raise ValueError(
                f"Guardrail ordering violated: upper ({self.upper_guardrail}) >= safe ({self.safe_target}) >= lower ({self.lower_guardrail})"
            )

        # Invariant 3: Zone must match P(FIRE)
        if self.pfire_atual >= GUARDRAILS_BANDA1_MIN:
            expected_zona = "verde"
        elif self.pfire_atual >= GUARDRAILS_BANDA2_MIN:
            expected_zona = "amarelo"
        else:
            expected_zona = "vermelho"
        if self.zona != expected_zona:
            raise ValueError(
                f"zona '{self.zona}' doesn't match P(FIRE) {self.pfire_atual:.1f}% (expected '{expected_zona}')"
            )

        # Invariant 4: Source is traceable
        if self.source != "guardrail_engine":
            raise ValueError(f"source must be 'guardrail_engine', got {self.source}")


class GuardrailEngine:
    """Centralized guardrails calculation engine.

    Single source of truth for spending guardrail calculations.
    Supports both P(FIRE)-based and drawdown-based adjustments.
    """

    @staticmethod
    def calculate(request: GuardrailRequest) -> GuardrailResult:
        """Calculate spending guardrails based on P(FIRE) zone.

        Guardrails:
          - Upper: current + 10% (when P(FIRE) >= 90%, can expand spending)
          - Safe: current - 10% (baseline safe target)
          - Lower: current - 20% (emergency floor)

        Zones:
          - Verde (P(FIRE) ≥ 85%): high confidence, can increase spending
          - Amarelo (P(FIRE) 75-85%): caution zone, maintain spending
          - Vermelho (P(FIRE) < 75%): crisis zone, reduce spending

        Args:
            request: GuardrailRequest with P(FIRE) and spending

        Returns:
            GuardrailResult with spending limits and zones
        """
        pfire = request.pfire_atual
        spending = request.spending_atual

        # Determine zone
        if pfire >= GUARDRAILS_BANDA1_MIN:
            zona = "verde"
            banda = f"Verde (P(FIRE) ≥ {GUARDRAILS_BANDA1_MIN}%)"
        elif pfire >= GUARDRAILS_BANDA2_MIN:
            zona = "amarelo"
            banda = f"Amarelo (P(FIRE) {GUARDRAILS_BANDA2_MIN}–{GUARDRAILS_BANDA1_MIN-1}%)"
        else:
            zona = "vermelho"
            banda = f"Vermelho (P(FIRE) < {GUARDRAILS_BANDA2_MIN}%)"

        # Calculate guardrails
        upper = round(spending * (1 + request.expansion_pct))
        safe = round(spending * (1 - request.corte_safe_pct))
        lower = round(spending * (1 - request.corte_lower_pct))

        # Build explanation
        nota = (
            f"P(FIRE@53) = {pfire:.1f}% {banda}. "
            f"Spending R${spending/1000:.0f}k/ano. "
            f"Teto de expansão R${upper/1000:.0f}k (+{request.expansion_pct*100:.0f}%) — ativado quando P(FIRE) sustentado acima de 90%. "
            f"Safe target R${safe/1000:.0f}k (−{request.corte_safe_pct*100:.0f}%). "
            f"Piso de emergência R${lower/1000:.0f}k (−{request.corte_lower_pct*100:.0f}%)."
        )

        return GuardrailResult(
            zona=zona,
            pfire_atual=pfire,
            spending_atual=spending,
            upper_guardrail=upper,
            safe_target=safe,
            lower_guardrail=lower,
            banda=banda,
            nota=nota,
        )

    @staticmethod
    def apply_drawdown_guardrail(
        base_spending: float,
        patrimonio_atual: float,
        patrimonio_pico: float,
        guardrails_config: list = None,
    ) -> float:
        """Apply drawdown-based guardrail cutoff to base spending.

        Drawdown = (1 - patrimonio_atual / patrimonio_pico)

        For each guardrail band (dd_min, dd_max, corte, desc):
          If drawdown in range, apply corte: spending *= (1 - corte)

        Args:
            base_spending: Starting spending amount
            patrimonio_atual: Current portfolio value
            patrimonio_pico: Peak portfolio value
            guardrails_config: List of (dd_min, dd_max, corte, desc) tuples
                              If None, uses GUARDRAILS from config

        Returns:
            Adjusted spending after guardrail application
        """
        if guardrails_config is None:
            from config import GUARDRAILS
            guardrails_config = GUARDRAILS

        # Calculate drawdown
        if patrimonio_pico <= 0:
            return base_spending  # No peak data, can't apply drawdown
        drawdown = max(0, 1 - (patrimonio_atual / patrimonio_pico))

        # Apply guardrail cutoff
        for dd_min, dd_max, corte, _ in guardrails_config:
            if dd_min <= drawdown < dd_max:
                adjusted = round(base_spending * (1 - corte))
                return max(adjusted, GASTO_PISO)  # Floor at GASTO_PISO

        # No matching guardrail, use GASTO_PISO as safety floor
        return max(round(base_spending), GASTO_PISO)
