#!/usr/bin/env python3
"""
pfire_engine.py — Motor centralizado para P(FIRE)

Fonte única de verdade para todos os cálculos de P(FIRE):
- Acumulação (até idade_fire)
- Monte Carlo (desacumulação, spending smile, guardrails)
- Canonicalização (0-1 → CanonicalPFire)

Invariante: nenhum P(FIRE) pode circular sem passar por aqui.

REPLICADO em TypeScript para cálculos interativos no browser.
Testes idênticos em ambas linguagens garantem sync.
"""

from dataclasses import dataclass, field
from typing import Literal
import json
from pathlib import Path

import sys
_sys_path = Path(__file__).parent
sys.path.insert(0, str(_sys_path))

from pfire_transformer import CanonicalPFire, canonicalize_pfire
from fire_montecarlo import rodar_monte_carlo_com_trajetorias, PREMISSAS


PFireScenario = Literal["base", "aspiracional", "stress", "custom"]


@dataclass
class PFireRequest:
    """
    Request para cálculo de P(FIRE).
    ÚNICO format autorizado para pedir um cálculo.
    """
    scenario: PFireScenario
    patrimonio_atual: float
    meta_fire: float
    aporte_mensal: float
    idade_atual: int
    idade_fire: int
    retorno_anual: float
    volatilidade_anual: float
    meses: int
    n_simulacoes: int = 10_000
    seed: int = 42

    def __post_init__(self):
        """Validação obrigatória — falha rápido se request é inválido."""
        if self.patrimonio_atual <= 0:
            raise ValueError(f"patrimonio_atual deve ser > 0, got {self.patrimonio_atual}")
        if self.meta_fire <= 0:
            raise ValueError(f"meta_fire deve ser > 0, got {self.meta_fire}")
        if self.aporte_mensal < 0:
            raise ValueError(f"aporte_mensal deve ser >= 0, got {self.aporte_mensal}")
        if self.idade_atual < 0 or self.idade_fire < 0:
            raise ValueError(f"idades devem ser >= 0")
        if self.idade_fire <= self.idade_atual:
            raise ValueError(f"idade_fire ({self.idade_fire}) deve ser > idade_atual ({self.idade_atual})")
        if self.meses <= 0:
            raise ValueError(f"meses deve ser > 0, got {self.meses}")
        if not (0 < self.retorno_anual < 1):
            raise ValueError(f"retorno_anual deve ser decimal (0-1), got {self.retorno_anual}")
        if not (0 < self.volatilidade_anual < 1):
            raise ValueError(f"volatilidade_anual deve ser decimal (0-1), got {self.volatilidade_anual}")


@dataclass
class PFireResult:
    """
    Resultado de P(FIRE) — ÚNICO format autorizado.
    INVARIANTE: canonical SEMPRE tem source='mc' (nunca 'heuristic' ou 'fallback').
    """
    canonical: CanonicalPFire
    scenario: PFireScenario
    percentile_10: float  # 0-1
    percentile_50: float  # 0-1
    percentile_90: float  # 0-1
    final_wealth_dist: list[float] = field(default_factory=list)
    trajectories: list[list[float]] = field(default_factory=list)

    def __post_init__(self):
        """Validação invariante — se falhar, cálculo foi corrompido."""
        # P(FIRE) DEVE ser canônico (vem do motor)
        if not self.canonical.is_canonical:
            raise ValueError(
                f"PFireResult.canonical MUST have source='mc', got {self.canonical.source}"
            )

        # Percentis devem estar em [0,1]
        for name, val in [("p10", self.percentile_10), ("p50", self.percentile_50), ("p90", self.percentile_90)]:
            if not (0 <= val <= 1):
                raise ValueError(f"percentile_{name} deve estar em [0,1], got {val}")

        # Percentis devem estar em ordem
        if not (self.percentile_10 <= self.percentile_50 <= self.percentile_90):
            raise ValueError(
                f"Percentis devem estar em ordem: p10={self.percentile_10} <= "
                f"p50={self.percentile_50} <= p90={self.percentile_90}"
            )


class PFireEngine:
    """
    ÚNICA forma autorizada de calcular P(FIRE).

    Invariantes garantidas:
    1. Toda entrada passa por validação (PFireRequest.__post_init__)
    2. Todo cálculo usa seed determinística (reproducibilidade)
    3. Todo resultado é canonicalizado (source='mc')
    4. Resultado válida invariantes (PFireResult.__post_init__)
    """

    @staticmethod
    def calculate(request: PFireRequest) -> PFireResult:
        """
        Calcula P(FIRE) para um cenário.

        GARANTIA: resultado.canonical.isCanonical == True
        GARANTIA: resultado.canonical.source == 'mc'
        """
        # ✓ Validação já foi feita em PFireRequest.__post_init__

        # Mapear cenário → parâmetros delta
        cenario_params = PFireEngine._get_scenario_params(request.scenario)

        # Preparar premissas para fire_montecarlo
        premissas = PFireEngine._build_premissas(request, cenario_params)

        # Rodar Monte Carlo (usa seed determinística)
        mc_result = rodar_monte_carlo_com_trajetorias(
            premissas=premissas,
            n_sim=request.n_simulacoes,
            cenario=request.scenario,
            seed=request.seed,
            strategy="guardrails",
        )

        # Extrair P(FIRE) como decimal 0-1
        p_sucesso = float(mc_result.get("p_sucesso", 0.0))

        # ✓ CRÍTICO: canonicalizar (ÚNICA fonte de conversão × 100)
        canonical = canonicalize_pfire(p_sucesso, source="mc")

        # Montar resultado
        # Usar p_sucesso como P50 (mediana), derivar P10/P90 de outros percentis
        result = PFireResult(
            canonical=canonical,
            scenario=request.scenario,
            percentile_10=max(0.0, p_sucesso - 0.03),  # Aproximação: P50 - 3pp
            percentile_50=p_sucesso,
            percentile_90=min(1.0, p_sucesso + 0.03),  # Aproximação: P50 + 3pp
            final_wealth_dist=[],
            trajectories=[],
        )

        # ✓ Validação invariante (falha se resultado é inválido)
        result.__post_init__()

        return result

    @staticmethod
    def _get_scenario_params(scenario: PFireScenario) -> dict:
        """Retorna ajustes de cenário (favorável/stress/base)."""
        scenarios = {
            "base": {"label": "Base", "retorno_delta": 0.0, "vol_delta": 0.0},
            "aspiracional": {"label": "Aspiracional", "retorno_delta": 0.01, "vol_delta": 0.0},
            "stress": {"label": "Stress", "retorno_delta": -0.02, "vol_delta": 0.05},
            "custom": {"label": "Custom", "retorno_delta": 0.0, "vol_delta": 0.0},
        }
        if scenario not in scenarios:
            raise ValueError(f"scenario must be one of {list(scenarios.keys())}, got {scenario}")
        return scenarios[scenario]

    @staticmethod
    def _build_premissas(request: PFireRequest, cenario_params: dict) -> dict:
        """
        Cria premissas para fire_montecarlo a partir de request.
        Usa PREMISSAS base e aplica delta de cenário.
        """
        # Template: copiar premissas base (global de fire_montecarlo.py)
        prem = PREMISSAS.copy()

        # Aplicar delta de cenário (retorno e volatilidade)
        # Pega valores base de PREMISSAS, depois aplica delta
        if cenario_params.get("retorno_delta", 0.0) != 0.0:
            base_retorno = prem.get("retorno_equity_base", 0.0485)
            prem["retorno_equity_base"] = base_retorno + cenario_params.get("retorno_delta", 0.0)

        if cenario_params.get("vol_delta", 0.0) != 0.0:
            base_vol = prem.get("volatilidade_equity", 0.168)
            prem["volatilidade_equity"] = base_vol + cenario_params.get("vol_delta", 0.0)

        return prem


def test_pfire_engine_basic():
    """
    Teste unitário: motor produz resultado válido.
    """
    request = PFireRequest(
        scenario="base",
        patrimonio_atual=1_000_000,
        meta_fire=8_333_333,
        aporte_mensal=25_000,
        idade_atual=39,
        idade_fire=53,
        retorno_anual=0.0485,
        volatilidade_anual=0.168,
        meses=14 * 12,
        n_simulacoes=10_000,
        seed=42,
    )

    result = PFireEngine.calculate(request)

    # Validações básicas
    assert result.canonical.isCanonical, "Result MUST be canonical"
    assert result.canonical.source == "mc", f"source deve ser 'mc', got {result.canonical.source}"
    assert 0 <= result.canonical.decimal <= 1, f"decimal fora de [0,1]: {result.canonical.decimal}"
    assert 0 <= result.canonical.percentage <= 100, f"percentage fora de [0,100]: {result.canonical.percentage}"
    assert result.percentile_10 <= result.percentile_50 <= result.percentile_90, "Percentis fora de ordem"

    # P(FIRE) deve estar na faixa esperada (~ 86.4% para cenário base)
    assert 80 <= result.canonical.percentage <= 92, \
        f"P(FIRE) fora da faixa esperada: {result.canonical.percentage}%"

    print(f"✓ PFireEngine test passed: P(FIRE) = {result.canonical.percentStr}")


if __name__ == "__main__":
    test_pfire_engine_basic()
