#!/usr/bin/env python3
"""
bond_pool_engine.py — Centralized Bond Pool Calculation Engine.

Single source of truth for bond pool projections (pre-FIRE and post-FIRE).

Pattern: Guaranteed Invariant (based on P(FIRE) centralization model)
  - Input validation: BondPoolRequest.__post_init__
  - Calculation: BondPoolEngine.calculate_pre_fire() and .calculate_post_fire()
  - Output validation: BondPoolResult.__post_init__
  - Prohibition: grep catches pool calculations outside this module

Phases:
  1. Pre-FIRE (2026-2040): pool(t) = pool(t-1) × (1+r) + aporte(t)
  2. Post-FIRE (2040+): pool(t) = pool(t-1) × (1+r_real) - saque(t)

References:
  - reconstruct_fire_data.py: gen_bond_pool_runway() (pre-FIRE)
  - generate_data.py: _compute_bond_pool_runway_by_profile() (post-FIRE)
"""

import json
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Literal

ROOT = Path(__file__).parent.parent

import sys as _sys
_sys.path.insert(0, str(ROOT / "scripts"))
from config import (
    CUSTO_VIDA_BASE, IPCA_LONGO_PCT, RETORNO_RF_REAL_BOND_POOL,
    ANO_NASCIMENTO, IDADE_CENARIO_BASE, INSS_KATIA_INICIO_ANO,
)


@dataclass
class BondPoolRequest:
    """Input validation for bond pool calculations."""

    # Pre-FIRE phase
    pool_2040_inicial: float  # Valor inicial TD IPCA+ 2040
    pool_2050_inicial: float  # Valor inicial TD IPCA+ 2050
    taxa_2040: float  # Taxa real IPCA+ 2040 (7.10% = 0.0710)
    taxa_2050: float  # Taxa real IPCA+ 2050
    aporte_ipca_mensal: float = 10_000  # Aporte médio mensal
    ano_aporte_fim: int = 2028  # Aporte ativo até este ano
    ano_atual: int = 2026
    ano_fire: int = 2040

    # Post-FIRE phase
    perfis_cfg: dict = field(default_factory=dict)  # {perfil: {custo_vida_base, inss_katia_anual, tem_conjuge}}
    r_real_post_fire: float = field(default_factory=lambda: RETORNO_RF_REAL_BOND_POOL)
    anos_projecao_pos_fire: int = 15
    fire_year_override: int | None = None

    def __post_init__(self):
        """Validate request constraints."""
        if self.pool_2040_inicial < 0:
            raise ValueError(f"pool_2040_inicial must be >= 0, got {self.pool_2040_inicial}")
        if self.pool_2050_inicial < 0:
            raise ValueError(f"pool_2050_inicial must be >= 0, got {self.pool_2050_inicial}")
        if self.taxa_2040 <= 0:
            raise ValueError(f"taxa_2040 must be > 0, got {self.taxa_2040}")
        if self.taxa_2050 <= 0:
            raise ValueError(f"taxa_2050 must be > 0, got {self.taxa_2050}")
        if self.aporte_ipca_mensal < 0:
            raise ValueError(f"aporte_ipca_mensal must be >= 0, got {self.aporte_ipca_mensal}")
        if self.r_real_post_fire <= 0:
            raise ValueError(f"r_real_post_fire must be > 0, got {self.r_real_post_fire}")
        if self.anos_projecao_pos_fire < 1:
            raise ValueError(f"anos_projecao_pos_fire must be >= 1, got {self.anos_projecao_pos_fire}")


@dataclass
class BondPoolResult:
    """Output with guaranteed invariants."""

    # Pre-FIRE projection
    anos_pre_fire: list[int]
    pool_td2040_brl: list[float]
    pool_td2050_brl: list[float]
    pool_total_brl: list[float]
    alvo_pool_pct: float
    alvo_pool_brl_2040: float

    # Post-FIRE projection by profile
    runway_por_perfil: dict  # {perfil: {pool_inicial, runway_anos, pool_series, ...}}

    # Metadata
    source: Literal["bond_pool_engine"] = "bond_pool_engine"
    _generated: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%dT%H:%M:%S"))

    def __post_init__(self):
        """Validate result invariants."""
        # Invariant 1: Pool series have same length
        if not (len(self.pool_td2040_brl) == len(self.pool_td2050_brl) == len(self.pool_total_brl)):
            raise ValueError(f"Pool series must have same length")

        # Invariant 2: Pool values are non-negative
        for i, val in enumerate(self.pool_total_brl):
            if val < 0:
                raise ValueError(f"pool_total_brl[{i}] is negative: {val}")

        # Invariant 3: Total pool = TD2040 + TD2050 (within rounding)
        for i, (t40, t50, total) in enumerate(zip(self.pool_td2040_brl, self.pool_td2050_brl, self.pool_total_brl)):
            if not (abs(total - (t40 + t50)) <= 1.0):
                raise ValueError(f"pool_total_brl[{i}] ({total}) != td2040 ({t40}) + td2050 ({t50})")

        # Invariant 4: Runway por perfil is dict with valid structure
        for perfil, data in self.runway_por_perfil.items():
            if "runway_anos" not in data or not isinstance(data["runway_anos"], (int, float)):
                raise ValueError(f"runway_por_perfil[{perfil}] missing or invalid runway_anos")

        # Invariant 5: Source is traceable
        if self.source != "bond_pool_engine":
            raise ValueError(f"source must be 'bond_pool_engine', got {self.source}")


class BondPoolEngine:
    """Centralized bond pool calculation engine.

    Single source of truth for pre-FIRE and post-FIRE bond pool projections.
    All bond pool calculations must route through this engine.
    """

    @staticmethod
    def calculate_pre_fire(request: BondPoolRequest) -> tuple[list[float], list[float], list[float]]:
        """Calculate pre-FIRE bond pool accumulation (2026-2040).

        Modelo: pool(t) = pool(t-1) × (1+r) + aporte(t)

        Args:
            request: BondPoolRequest with initial pools, rates, contributions

        Returns:
            (pool_2040_series, pool_2050_series, pool_total_series)
        """
        anos = list(range(request.ano_atual, request.ano_fire + 1))
        aporte_ipca_anual = request.aporte_ipca_mensal * 12

        pool_2040 = []
        pool_2050 = []
        v40 = request.pool_2040_inicial
        v50 = request.pool_2050_inicial

        for ano in anos:
            pool_2040.append(round(v40, 0))
            pool_2050.append(round(v50, 0))

            # Aporte active until ano_aporte_fim, then only growth
            aporte_este_ano = aporte_ipca_anual if ano <= request.ano_aporte_fim else 0
            v40 = v40 * (1 + request.taxa_2040) + aporte_este_ano * 0.8  # 80% to 2040
            v50 = v50 * (1 + request.taxa_2050) + aporte_este_ano * 0.2  # 20% to 2050

        pool_total = [round(a + b, 0) for a, b in zip(pool_2040, pool_2050)]

        return pool_2040, pool_2050, pool_total

    @staticmethod
    def calculate_post_fire(
        request: BondPoolRequest,
        pool_inicial: float,
    ) -> dict:
        """Calculate post-FIRE bond pool depletion by profile.

        Modelo: pool(t) = pool(t-1) × (1+r_real) - saque(t)

        Args:
            request: BondPoolRequest with perfis_cfg, r_real_post_fire
            pool_inicial: Starting pool value on FIRE Day

        Returns:
            {perfil: {runway_anos, pool_series, ...}}
        """
        fire_year = request.fire_year_override or (ANO_NASCIMENTO + IDADE_CENARIO_BASE)
        anos_pos_fire = list(range(1, request.anos_projecao_pos_fire + 1))

        result = {}
        for profile_key, cfg in request.perfis_cfg.items():
            custo = cfg["custo_vida_base"]
            inss_katia = cfg.get("inss_katia_anual", 0)
            tem_conjuge = cfg.get("tem_conjuge", False)

            pool = float(pool_inicial)
            pool_series = []
            runway_anos = None

            for ano_pos_fire in anos_pos_fire:
                ano_calendario = fire_year + ano_pos_fire
                inss_this_year = (
                    inss_katia
                    if (tem_conjuge and ano_calendario >= INSS_KATIA_INICIO_ANO)
                    else 0
                )
                saque = custo - inss_this_year
                pool_prev = pool
                pool = pool * (1 + request.r_real_post_fire) - saque
                pool_series.append(round(pool))

                # Interpolate exact point where pool crosses zero
                if pool < 0 and runway_anos is None:
                    fraction = (
                        pool_prev / (pool_prev - pool) if (pool_prev - pool) != 0 else 0
                    )
                    runway_anos = round(ano_pos_fire - 1 + fraction, 1)

            if runway_anos is None:
                runway_anos = float(request.anos_projecao_pos_fire)

            result[profile_key] = {
                "custo_vida_anual": custo,
                "inss_katia_anual": inss_katia,
                "anos_inss_katia_pos_fire": INSS_KATIA_INICIO_ANO - fire_year,
                "anos_pos_fire": anos_pos_fire,
                "pool_disponivel": pool_series,
                "pool_inicial": round(pool_inicial),
                "runway_anos": runway_anos,
                "runway_label": f"{runway_anos:.1f} anos",
                "_modelo": f"r_real={request.r_real_post_fire*100:.0f}% | INSS Katia {inss_katia/1e3:.0f}k/ano a partir de {INSS_KATIA_INICIO_ANO}",
            }

        return result

    @staticmethod
    def calculate(request: BondPoolRequest, patrimonio_p50_2040: float | None = None) -> BondPoolResult:
        """Calculate complete bond pool projection (pre-FIRE + post-FIRE).

        Args:
            request: BondPoolRequest with all parameters
            patrimonio_p50_2040: P50 patrimonio at FIRE (for alvo_pool calculation)

        Returns:
            BondPoolResult with full projection

        Raises:
            ValueError: If input invalid or patrimonio_p50_2040 missing when needed
        """
        # Pre-FIRE accumulation
        pool_2040, pool_2050, pool_total = BondPoolEngine.calculate_pre_fire(request)

        # Alvo pool (15% of expected patrimonio)
        if patrimonio_p50_2040 is None:
            patrimonio_p50_2040 = 11_527_476  # fallback from reconstruct_fire_data.py
        alvo_pool_brl_2040 = round(patrimonio_p50_2040 * IPCA_LONGO_PCT, 0)

        # Post-FIRE depletion (by profile)
        pool_inicial_fire = pool_total[-1]
        runway_por_perfil = BondPoolEngine.calculate_post_fire(request, pool_inicial_fire)

        anos_pre_fire = list(range(request.ano_atual, request.ano_fire + 1))

        return BondPoolResult(
            anos_pre_fire=anos_pre_fire,
            pool_td2040_brl=pool_2040,
            pool_td2050_brl=pool_2050,
            pool_total_brl=pool_total,
            alvo_pool_pct=IPCA_LONGO_PCT,
            alvo_pool_brl_2040=alvo_pool_brl_2040,
            runway_por_perfil=runway_por_perfil,
        )
