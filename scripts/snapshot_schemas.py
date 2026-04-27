"""
Snapshot Schema Definitions — Guarantee structure and type safety.

Each snapshot follows this pattern:
{
    "_schema_version": "1.0",
    "_generated": "ISO-8601 timestamp",
    "_window_id": "Tie to parent pipeline generation window",
    "_source": {
        "script": "module:function at line N",
        "cache_used": boolean,
        ...
    },
    ... (domain-specific fields)
}
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Optional
from enum import Enum


class SchemaVersion(str, Enum):
    """Snapshot schema versions for backward compatibility."""
    MACRO = "1.0"
    FACTOR = "1.0"
    TAX = "1.0"
    HISTORY = "1.0"
    FIRE = "1.0"


@dataclass
class SnapshotMetadata:
    """Common metadata for all snapshots."""
    schema_version: str
    generated: str  # ISO-8601 timestamp
    window_id: str  # Links to parent pipeline run
    source: Dict[str, Any] = field(default_factory=dict)  # Audit trail

    def to_dict(self) -> Dict[str, Any]:
        """Convert to JSON-serializable dict."""
        return {
            "_schema_version": self.schema_version,
            "_generated": self.generated,
            "_window_id": self.window_id,
            "_source": self.source,
        }

    @classmethod
    def create(
        cls,
        schema_version: str,
        window_id: str,
        script: str,
        cache_used: bool = False,
        data_version: Optional[str] = None,
    ) -> "SnapshotMetadata":
        """Factory to create standard metadata."""
        return cls(
            schema_version=schema_version,
            generated=datetime.utcnow().isoformat() + "Z",
            window_id=window_id,
            source={
                "script": script,
                "cache_used": cache_used,
                "data_version": data_version or "current",
            },
        )


@dataclass
class MacroSnapshot:
    """Macro economic data: PTAX, Selic, IPCA, Focus inflation forecast."""
    metadata: SnapshotMetadata
    ptax: Optional[float] = None  # BRL/USD rate
    ptax_date: Optional[str] = None  # Date of PTAX quote
    selic_rate: Optional[float] = None  # Current Selic %
    selic_date: Optional[str] = None  # Date of last decision
    ipca_12m: Optional[float] = None  # IPCA last 12 months %
    ipca_date: Optional[str] = None  # Date of last IPCA reading
    focus_inflation: Optional[float] = None  # Market expectation for next 12m
    focus_date: Optional[str] = None  # Date of Focus survey

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to JSON."""
        result = self.metadata.to_dict()
        result.update({
            "ptax": self.ptax,
            "ptax_date": self.ptax_date,
            "selic_rate": self.selic_rate,
            "selic_date": self.selic_date,
            "ipca_12m": self.ipca_12m,
            "ipca_date": self.ipca_date,
            "focus_inflation": self.focus_inflation,
            "focus_date": self.focus_date,
        })
        return result


@dataclass
class FactorSnapshot:
    """Factor returns: Fama-French 5 + Momentum monthly data."""
    metadata: SnapshotMetadata
    ff5_monthly: Optional[Dict[str, float]] = None  # {date: return_pct}
    ff5_latest_date: Optional[str] = None
    mom_monthly: Optional[Dict[str, float]] = None  # {date: return_pct}
    mom_latest_date: Optional[str] = None
    factor_loadings: Optional[Dict[str, float]] = None  # {smb: 0.5, hml: 0.3, ...}

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to JSON."""
        result = self.metadata.to_dict()
        result.update({
            "ff5_monthly": self.ff5_monthly or {},
            "ff5_latest_date": self.ff5_latest_date,
            "mom_monthly": self.mom_monthly or {},
            "mom_latest_date": self.mom_latest_date,
            "factor_loadings": self.factor_loadings or {},
        })
        return result


@dataclass
class TaxSnapshot:
    """Tax calculations: IR diferido by ETF, DARF data."""
    metadata: SnapshotMetadata
    ir_diferido_total: Optional[float] = None  # Total deferred IR in BRL
    ir_by_etf: Optional[Dict[str, float]] = None  # {SWRD: 5000, AVGS: 3000, ...}
    realized_gains: Optional[Dict[str, float]] = None  # {SWRD: 10000, ...}
    realized_losses: Optional[Dict[str, float]] = None  # Tax-loss harvesting
    darf_code: Optional[str] = None  # "6015" for capital gains

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to JSON."""
        result = self.metadata.to_dict()
        result.update({
            "ir_diferido_total": self.ir_diferido_total or 0,
            "ir_by_etf": self.ir_by_etf or {},
            "realized_gains": self.realized_gains or {},
            "realized_losses": self.realized_losses or {},
            "darf_code": self.darf_code,
        })
        return result


@dataclass
class HistorySnapshot:
    """Portfolio history: TWR and monthly returns."""
    metadata: SnapshotMetadata
    monthly_twr: Optional[Dict[str, float]] = None  # {2020-01: 0.023, ...}
    annual_twr: Optional[Dict[str, float]] = None  # {2020: 0.095, ...}
    dates: Optional[list] = None  # [2020-01-31, 2020-02-29, ...]
    latest_date: Optional[str] = None  # Most recent month

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to JSON."""
        result = self.metadata.to_dict()
        result.update({
            "monthly_twr": self.monthly_twr or {},
            "annual_twr": self.annual_twr or {},
            "dates": self.dates or [],
            "latest_date": self.latest_date,
        })
        return result


@dataclass
class FireSnapshot:
    """Fire simulations: Monte Carlo results, guardrails, bond pool."""
    metadata: SnapshotMetadata
    # Monte Carlo results (from fire_montecarlo.py)
    pfire_base: Optional[float] = None  # P(FIRE) base scenario
    pfire_aspirational: Optional[float] = None  # P(FIRE) higher spending
    pfire_stress: Optional[float] = None  # P(FIRE) lower returns
    # Guardrails
    guardrail_bands: Optional[Dict[str, Any]] = None  # Zone definitions
    # Bond pool
    bond_pool_target_2040: Optional[float] = None  # Target BRL
    bond_pool_current: Optional[float] = None  # Current BRL
    # Other
    patrimonio_p50: Optional[float] = None  # Median final wealth
    patrimonio_p10: Optional[float] = None  # 10th percentile
    patrimonio_p90: Optional[float] = None  # 90th percentile

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to JSON."""
        result = self.metadata.to_dict()
        result.update({
            "pfire_base": self.pfire_base,
            "pfire_aspirational": self.pfire_aspirational,
            "pfire_stress": self.pfire_stress,
            "guardrail_bands": self.guardrail_bands or {},
            "bond_pool_target_2040": self.bond_pool_target_2040,
            "bond_pool_current": self.bond_pool_current,
            "patrimonio_p50": self.patrimonio_p50,
            "patrimonio_p10": self.patrimonio_p10,
            "patrimonio_p90": self.patrimonio_p90,
        })
        return result


# Schema registry for validation
SNAPSHOT_SCHEMAS = {
    "macro_snapshot": MacroSnapshot,
    "factor_snapshot": FactorSnapshot,
    "tax_snapshot": TaxSnapshot,
    "history_snapshot": HistorySnapshot,
    "fire_snapshot": FireSnapshot,
}

EXPECTED_SCHEMA_VERSIONS = {
    "macro_snapshot": SchemaVersion.MACRO.value,
    "factor_snapshot": SchemaVersion.FACTOR.value,
    "tax_snapshot": SchemaVersion.TAX.value,
    "history_snapshot": SchemaVersion.HISTORY.value,
    "fire_snapshot": SchemaVersion.FIRE.value,
}
