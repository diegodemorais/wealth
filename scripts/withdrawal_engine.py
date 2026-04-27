#!/usr/bin/env python3
"""
withdrawal_engine.py — Centralized Withdrawal Strategy Engine.

Single source of truth for all withdrawal strategies (6 methods).

Pattern: Guaranteed Invariant (based on centralization model)
  - Input validation: WithdrawalRequest.__post_init__
  - Calculation: WithdrawalEngine.calculate()
  - Output validation: WithdrawalResult.__post_init__
  - Prohibition: grep catches strategy logic outside this module

Strategies:
  1. guardrails: Drawdown-based guardrails (current primary)
  2. constant: Constant-dollar spending (spending smile only)
  3. pct_portfolio: Fixed % of patrimonio (SWR initial)
  4. vpw: Variable Percentage Withdrawal (PMT actuarial)
  5. guyton_klinger: GK decision rules (2006)
  6. gk_hybrid: GK + guardrails cap

References:
  - fire_montecarlo.py: STRATEGY_FNS, withdrawal_* functions, WithdrawalCtx
  - FR-withdrawal-engine (Advocate, 2026-04-07)
"""

from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).parent.parent

import sys as _sys
_sys.path.insert(0, str(ROOT / "scripts"))
from config import GASTO_PISO
from guardrail_engine import GuardrailEngine


# Strategy constants
GASTO_TETO_PCT      = 400_000  # Percent-of-portfolio teto
GASTO_TETO_VPW      = 500_000  # VPW teto
GASTO_TETO_GK_CAP   = 350_000  # GK híbrido teto
VPW_REAL_RATE        = 0.035   # VPW real rate
GK_PRESERVATION_MULT = 1.20    # GK Capital Preservation threshold
GK_PROSPERITY_MULT   = 0.80    # GK Prosperity threshold
GK_CUT_FACTOR        = 0.90    # GK cut factor
GK_RAISE_FACTOR      = 1.10    # GK raise factor
GK_MAX_AGE           = 85      # GK age limit


@dataclass
class WithdrawalCtx:
    """State shared across withdrawal years within a single simulation."""
    swr_inicial: float = 0.035
    anos_total: int = 37
    retorno_ano: float = 0.0
    ipca_anual: float = 0.04
    gasto_prev_gk: float = 0.0
    swr_inicial_gk: float = 0.0
    _gk_initialized: bool = False

    def init_gk(self, gasto_smile: float):
        """Lazy-init Guyton-Klinger state on first withdrawal year."""
        if not self._gk_initialized:
            self.gasto_prev_gk = gasto_smile
            self.swr_inicial_gk = self.swr_inicial
            self._gk_initialized = True


@dataclass
class WithdrawalRequest:
    """Input validation for withdrawal calculations."""

    strategy: Literal["guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"]
    gasto_smile: float  # Base spending from spending smile model
    patrimonio_atual: float  # Current portfolio value
    patrimonio_pico: float  # Peak portfolio value (for drawdown)
    ano: int  # Current year of simulation (0-37)
    ctx: WithdrawalCtx  # Withdrawal context (state across years)

    # Optional: guardrail configuration for drawdown strategy
    guardrails_config: list | None = None

    def __post_init__(self):
        """Validate request constraints."""
        if self.strategy not in ("guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"):
            raise ValueError(f"strategy must be valid withdrawal strategy, got {self.strategy}")
        if self.gasto_smile <= 0:
            raise ValueError(f"gasto_smile must be > 0, got {self.gasto_smile}")
        if self.patrimonio_atual < 0:
            raise ValueError(f"patrimonio_atual must be >= 0, got {self.patrimonio_atual}")
        if self.patrimonio_pico < 0:
            raise ValueError(f"patrimonio_pico must be >= 0, got {self.patrimonio_pico}")
        if self.ano < 0:
            raise ValueError(f"ano must be >= 0, got {self.ano}")
        if self.ctx is None:
            raise ValueError("ctx (WithdrawalCtx) is required")


@dataclass
class WithdrawalResult:
    """Output with guaranteed invariants."""

    strategy: Literal["guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"]
    gasto_anual: float  # Annual withdrawal amount
    nota: str  # Human-readable explanation

    # Metadata
    source: Literal["withdrawal_engine"] = "withdrawal_engine"
    _generated: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%dT%H:%M:%S"))

    def __post_init__(self):
        """Validate result invariants."""
        if self.gasto_anual < 0:
            raise ValueError(f"gasto_anual must be >= 0, got {self.gasto_anual}")
        if self.strategy not in ("guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"):
            raise ValueError(f"strategy must be valid, got {self.strategy}")
        if self.source != "withdrawal_engine":
            raise ValueError(f"source must be 'withdrawal_engine', got {self.source}")


class WithdrawalEngine:
    """Centralized withdrawal strategy engine.

    Single source of truth for all 6 withdrawal strategies.
    Handles state management and decision rules for each strategy.
    """

    @staticmethod
    def _clamp(gasto: float, teto: float = None) -> float:
        """Apply floor (GASTO_PISO) and optional ceiling."""
        if teto is not None:
            return max(GASTO_PISO, min(gasto, teto))
        return max(GASTO_PISO, gasto)

    @staticmethod
    def _guardrails(request: WithdrawalRequest) -> float:
        """Drawdown-based guardrails strategy."""
        guardrails = request.guardrails_config or []
        return GuardrailEngine.apply_drawdown_guardrail(
            base_spending=request.gasto_smile,
            patrimonio_atual=request.patrimonio_atual,
            patrimonio_pico=request.patrimonio_pico,
            guardrails_config=guardrails,
        )

    @staticmethod
    def _constant(request: WithdrawalRequest) -> float:
        """Constant-dollar strategy (spending smile only, no market adjustment)."""
        return request.gasto_smile

    @staticmethod
    def _pct_portfolio(request: WithdrawalRequest) -> float:
        """Percent-of-portfolio strategy (SWR initial applied to current patrimonio)."""
        gasto = request.patrimonio_atual * request.ctx.swr_inicial
        return WithdrawalEngine._clamp(gasto, GASTO_TETO_PCT)

    @staticmethod
    def _vpw(request: WithdrawalRequest) -> float:
        """Variable Percentage Withdrawal strategy (PMT actuarial).

        Uses VPW_REAL_RATE for sustainable withdrawal rate calculation.
        """
        anos_restantes = request.ctx.anos_total - request.ano
        if anos_restantes <= 0:
            return request.patrimonio_atual

        vpw_rate = VPW_REAL_RATE / (1 - (1 + VPW_REAL_RATE) ** (-anos_restantes))
        gasto = request.patrimonio_atual * vpw_rate
        return WithdrawalEngine._clamp(gasto, GASTO_TETO_VPW)

    @staticmethod
    def _guyton_klinger(request: WithdrawalRequest) -> float:
        """Guyton-Klinger Decision Rules strategy (2006).

        Rules:
        1. Withdrawal Rule: forgo inflation adjustment in negative return years
        2. Capital Preservation: cut if WR > 120% of initial
        3. Prosperity Rule: increase if WR < 80% of initial
        """
        ctx = request.ctx
        ctx.init_gk(request.gasto_smile)

        # Determine base spending (inflation adjustment or not)
        if ctx.retorno_ano >= 0:
            gasto = ctx.gasto_prev_gk
        else:
            gasto = ctx.gasto_prev_gk / (1 + ctx.ipca_anual)

        # Calculate current withdrawal rate
        wr_current = gasto / request.patrimonio_atual if request.patrimonio_atual > 0 else 1.0

        # Apply decision rules (but only before age limit)
        # Age limit: GK_MAX_AGE - idade_fire_alvo (ex: 85 - 53 = 32 anos)
        # This would be handled by caller setting an age threshold
        if request.ano < 32:  # Conservative: apply rules for first 32 years
            if wr_current > ctx.swr_inicial_gk * GK_PRESERVATION_MULT:
                gasto *= GK_CUT_FACTOR
            elif wr_current < ctx.swr_inicial_gk * GK_PROSPERITY_MULT:
                gasto *= GK_RAISE_FACTOR

        gasto = WithdrawalEngine._clamp(gasto)
        ctx.gasto_prev_gk = gasto
        return gasto

    @staticmethod
    def _gk_hybrid(request: WithdrawalRequest) -> float:
        """GK Hybrid strategy: Guyton-Klinger rules + guardrails cap + GASTO_PISO floor.

        Combines GK flexibility with guardrails ceiling to prevent runaway spending.
        """
        ctx = request.ctx
        ctx.init_gk(request.gasto_smile)

        # Determine base spending
        if ctx.retorno_ano >= 0:
            gasto = ctx.gasto_prev_gk
        else:
            gasto = ctx.gasto_prev_gk / (1 + ctx.ipca_anual)

        # Calculate current withdrawal rate
        wr_current = gasto / request.patrimonio_atual if request.patrimonio_atual > 0 else 1.0

        # Apply GK rules (first 32 years)
        if request.ano < 32:
            if wr_current > ctx.swr_inicial_gk * GK_PRESERVATION_MULT:
                gasto *= GK_CUT_FACTOR
            elif wr_current < ctx.swr_inicial_gk * GK_PROSPERITY_MULT:
                gasto *= GK_RAISE_FACTOR

        # Apply guardrails cap (R$350k ceiling)
        gasto = WithdrawalEngine._clamp(gasto, GASTO_TETO_GK_CAP)
        ctx.gasto_prev_gk = gasto
        return gasto

    @staticmethod
    def calculate(request: WithdrawalRequest) -> WithdrawalResult:
        """Calculate withdrawal amount for given strategy.

        Routes to appropriate strategy handler based on request.strategy.

        Args:
            request: WithdrawalRequest with strategy and parameters

        Returns:
            WithdrawalResult with calculated gasto_anual and metadata

        Raises:
            ValueError: If strategy is unknown or request validation fails
        """
        strategy_handlers = {
            "guardrails": WithdrawalEngine._guardrails,
            "constant": WithdrawalEngine._constant,
            "pct_portfolio": WithdrawalEngine._pct_portfolio,
            "vpw": WithdrawalEngine._vpw,
            "guyton_klinger": WithdrawalEngine._guyton_klinger,
            "gk_hybrid": WithdrawalEngine._gk_hybrid,
        }

        if request.strategy not in strategy_handlers:
            raise ValueError(f"Unknown strategy: {request.strategy}")

        handler = strategy_handlers[request.strategy]
        gasto_anual = handler(request)

        # Build explanation
        notes = {
            "guardrails": f"Drawdown {(1 - request.patrimonio_atual/request.patrimonio_pico)*100:.1f}% guardrail",
            "constant": "Constant spending (spending smile only)",
            "pct_portfolio": f"Percent-of-portfolio: SWR {request.ctx.swr_inicial:.2%} × R${request.patrimonio_atual/1e6:.1f}M",
            "vpw": f"VPW {VPW_REAL_RATE:.1%} real rate",
            "guyton_klinger": "GK decision rules (preservation/prosperity)",
            "gk_hybrid": "GK hybrid (rules + guardrails cap)",
        }
        nota = notes.get(request.strategy, "Unknown strategy")

        return WithdrawalResult(
            strategy=request.strategy,
            gasto_anual=gasto_anual,
            nota=nota,
        )
