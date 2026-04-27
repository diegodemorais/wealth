#!/usr/bin/env python3
"""
tax_engine.py — Centralized Tax Calculation Engine (Lei 14.754/2023).

Single source of truth for IR diferido calculations on UCITS ACC ETFs.
All tax calculations must go through TaxEngine.calculate() — not inline.

Pattern: Guaranteed Invariant (based on P(FIRE) centralization model)
  - Input validation: TaxRequest.__post_init__
  - Calculation: TaxEngine.calculate()
  - Output validation: TaxResult.__post_init__
  - Prohibition: grep catches attempts to use compute_tax_diferido outside this module

References:
  - Lei 14.754/2023, art. 2-3: 15% flat alíquota sobre ganho nominal em BRL
  - LOTES_PATH: dados/ibkr/lotes.json (FIFO from ibkr_lotes.py)
  - PTAX source: python-bcb currency.get("USD")
"""

import json
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).parent.parent

# ETFs UCITS ACC — diferimento fiscal (Lei 14.754/2023, art. 2-3)
ETFS_ACC = {"SWRD", "AVGS", "AVEM", "AVUV", "AVDV", "USSC", "EIMI", "AVES", "DGS", "IWVL"}

import sys as _sys
_sys.path.insert(0, str(ROOT / "scripts"))
from config import IR_ALIQUOTA, US_ESTATE_TAX_EXEMPTION_USD, US_ESTATE_TAX_RATE


@dataclass
class TaxRequest:
    """Input validation for tax calculation."""

    posicoes: dict  # {ticker: {"price": float}}
    cambio_atual: float
    ptax_series: dict = field(default_factory=dict)  # {date_str: float}
    ptax_source: str = "fallback"
    lotes_path: Path = field(default_factory=lambda: ROOT / "dados" / "ibkr" / "lotes.json")

    def __post_init__(self):
        """Validate request constraints."""
        if not isinstance(self.posicoes, dict):
            raise ValueError("posicoes must be dict")
        if self.cambio_atual <= 0:
            raise ValueError(f"cambio_atual must be > 0, got {self.cambio_atual}")
        if not isinstance(self.ptax_series, dict):
            raise ValueError("ptax_series must be dict")
        if not self.ptax_source:
            raise ValueError("ptax_source must not be empty")


@dataclass
class TaxResult:
    """Output with guaranteed invariants."""

    ir_diferido_total_brl: float
    ir_por_etf: dict  # {ticker: {"ganho_usd", "ptax_compra_medio", "custo_total_brl", ...}}
    regime: str  # Always Lei 14.754/2023
    badges: dict  # {ticker: "ACC — diferimento fiscal"}
    ptax_source: str  # "BCB PTAX ask" or "fallback"
    ptax_atual: float
    _generated: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%dT%H:%M:%S"))
    source: Literal["lei14754"] = "lei14754"  # Rastreability

    def __post_init__(self):
        """Validate result invariants."""
        # Invariant 1: All values are non-negative
        if self.ir_diferido_total_brl < 0:
            raise ValueError(f"ir_diferido_total_brl cannot be negative, got {self.ir_diferido_total_brl}")
        if self.ptax_atual <= 0:
            raise ValueError(f"ptax_atual must be > 0, got {self.ptax_atual}")

        # Invariant 2: Total IR >= sum of individual ETF IRs (within floating point tolerance)
        total_etf_ir = sum(info.get("ir_estimado", 0) for info in self.ir_por_etf.values())
        if not (self.ir_diferido_total_brl >= total_etf_ir - 1e-6):
            raise ValueError(
                f"ir_diferido_total_brl ({self.ir_diferido_total_brl}) < sum of ETF IRs ({total_etf_ir})"
            )

        # Invariant 3: Source is traceable
        if self.source != "lei14754":
            raise ValueError(f"source must be 'lei14754', got {self.source}")

        # Invariant 4: Regime is always Lei 14.754
        if "Lei 14.754" not in self.regime:
            raise ValueError("regime must reference Lei 14.754/2023")


def _fetch_ptax_series() -> dict:
    """Fetch PTAX ask BRL/USD series from python-bcb.
    Returns dict {date_str: float} or {} on failure.
    """
    try:
        from bcb import currency
        end = date.today()
        start = date(2021, 1, 1)
        df = currency.get(["USD"], start=str(start), end=str(end))
        if df is None or df.empty:
            return {}
        series = {}
        for idx, row in df.iterrows():
            d = idx.strftime(DATE_FORMAT_YMD) if hasattr(idx, "strftime") else str(idx)[:10]
            val = float(row.iloc[0]) if hasattr(row, "iloc") else float(row)
            series[d] = val
        return series
    except Exception:
        return {}


def _lookup_ptax(dt_str: str, ptax_series: dict, fallback_cambio: float) -> float:
    """Return PTAX for date or last business day before (up to 10 days back)."""
    try:
        d = datetime.strptime(dt_str, "%Y-%m-%d").date()
    except ValueError:
        return fallback_cambio
    for offset in range(11):
        key = (d - timedelta(days=offset)).strftime(DATE_FORMAT_YMD)
        if key in ptax_series:
            return ptax_series[key]
    return fallback_cambio


class TaxEngine:
    """Centralized tax calculation engine (Lei 14.754/2023, art. 2-3).

    Single source of truth for IR diferido on UCITS ACC ETFs.
    All tax calculations must route through this engine.
    """

    @staticmethod
    def calculate(request: TaxRequest) -> TaxResult:
        """Calculate IR diferido (deferred income tax) on unrealized gains.

        Args:
            request: TaxRequest with posicoes, cambio_atual, ptax_series

        Returns:
            TaxResult with ir_diferido_total_brl, ir_por_etf, regime, badges

        Raises:
            ValueError: If lotes.json missing or input invalid
        """
        if not request.lotes_path.exists():
            raise ValueError(f"lotes.json not found at {request.lotes_path}")

        lotes_data = json.loads(request.lotes_path.read_text())

        ir_total = 0.0
        ir_por_etf = {}

        for ticker, info in lotes_data.items():
            # Only process ACC ETFs with positions
            if info.get("total_qty", 0) <= 0 or ticker not in ETFS_ACC:
                continue

            # Get current price from posicoes
            preco_atual = None
            if ticker in request.posicoes:
                preco_atual = request.posicoes[ticker].get("price")
            if preco_atual is None or preco_atual <= 0:
                continue

            custo_total_brl = 0.0
            valor_total_brl = 0.0
            ganho_total_usd = 0.0
            ptax_soma = 0.0
            ptax_peso = 0.0

            # Process each lot (FIFO)
            for lot in info.get("lotes", []):
                qty = lot.get("qty", 0)
                if qty <= 0:
                    continue

                custo_usd = lot["custo_por_share"]
                data_compra = lot["data"]
                ptax_compra = _lookup_ptax(data_compra, request.ptax_series, request.cambio_atual)

                custo_brl = qty * custo_usd * ptax_compra
                valor_brl = qty * preco_atual * request.cambio_atual
                ganho_usd_lot = qty * (preco_atual - custo_usd)

                custo_total_brl += custo_brl
                valor_total_brl += valor_brl
                ganho_total_usd += ganho_usd_lot

                # Weighted average PTAX (by cost in USD)
                peso = qty * custo_usd
                ptax_soma += ptax_compra * peso
                ptax_peso += peso

            # Calculate tax: 15% on nominal gain in BRL
            ganho_brl = valor_total_brl - custo_total_brl
            ir_etf = IR_ALIQUOTA * max(0.0, ganho_brl)
            ir_total += ir_etf

            ptax_compra_medio = (ptax_soma / ptax_peso) if ptax_peso > 0 else request.cambio_atual

            ir_por_etf[ticker] = {
                "ganho_usd": round(ganho_total_usd, 2),
                "ptax_compra_medio": round(ptax_compra_medio, 4),
                "ptax_atual": round(request.cambio_atual, 4),
                "custo_total_brl": round(custo_total_brl, 2),
                "valor_atual_brl": round(valor_total_brl, 2),
                "ganho_brl": round(ganho_brl, 2),
                "ir_estimado": round(ir_etf, 2),
            }

        badges = {ticker: "ACC — diferimento fiscal" for ticker in ir_por_etf}

        return TaxResult(
            ir_diferido_total_brl=round(ir_total, 2),
            ir_por_etf=ir_por_etf,
            regime="ACC UCITS — diferimento fiscal (Lei 14.754/2023, art. 2-3: 15% flat sobre ganho nominal em BRL na alienação)",
            badges=badges,
            ptax_source=request.ptax_source,
            ptax_atual=round(request.cambio_atual, 4),
        )

    @staticmethod
    def calculate_us_estate_tax(us_exposure: float) -> float:
        """Calculate US Estate Tax on US-listed ETFs.

        IRS Estate Tax applies to non-US persons holding US-listed securities.
        Rule: $60,000 exemption, 40% rate on amount above threshold.

        Args:
            us_exposure: Total cost basis of US-listed ETF holdings (USD)

        Returns:
            Estate tax due (USD). Returns 0.0 if below exemption threshold.

        Reference:
            IRS: 26 USC § 2104 (Estate tax on property of nonresidents not citizens)
            Exemption: $60,000 fixed (per current law)
            Rate: 40% flat on excess
        """
        if us_exposure <= US_ESTATE_TAX_EXEMPTION_USD:
            return 0.0
        taxable_amount = us_exposure - US_ESTATE_TAX_EXEMPTION_USD
        return round(taxable_amount * US_ESTATE_TAX_RATE, 2)
