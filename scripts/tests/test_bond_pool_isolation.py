"""
test_bond_pool_isolation.py — Testes para bond pool isolation no MC FIRE.

FR-mc-bond-pool-isolation 2026-04-29.

Cobre:
- compute_bond_pool_status: cálculo correto de completion_pct e enabled
- Estado atual: ~24% completo → isolation NÃO habilitada
- Parâmetro bond_pool_isolation passado para simular_trajetoria / compute_p_quality
- Isolation eleva P(quality) vs proxy (guardrails não disparam no pool phase)
"""
import sys
from pathlib import Path

import pytest
import numpy as np

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from fire_montecarlo import (
    compute_bond_pool_status,
    compute_p_quality,
    simular_trajetoria,
    PREMISSAS,
)


# ─── compute_bond_pool_status ───────────────────────────────────────────────

class TestComputeBondPoolStatus:

    def test_below_threshold_not_enabled(self):
        status = compute_bond_pool_status(3_472_335, 0.15, 124_675, 0.80)
        assert not status["enabled"]
        assert status["underestimation_warning"] is True
        assert status["completion_pct"] < 80.0

    def test_at_threshold_enabled(self):
        target = 3_472_335 * 0.15          # ~R$520k
        at_threshold = target * 0.80       # ~R$416k
        status = compute_bond_pool_status(3_472_335, 0.15, at_threshold, 0.80)
        assert status["enabled"]
        assert not status["underestimation_warning"]

    def test_above_threshold_enabled(self):
        target = 3_472_335 * 0.15
        above = target * 1.0               # 100% > 80%
        status = compute_bond_pool_status(3_472_335, 0.15, above, 0.80)
        assert status["enabled"]

    def test_completion_pct_correct(self):
        status = compute_bond_pool_status(3_472_335, 0.15, 124_675, 0.80)
        expected = 124_675 / (3_472_335 * 0.15) * 100
        assert abs(status["completion_pct"] - expected) < 0.2

    def test_zero_patrimonio_does_not_crash(self):
        """Patrimônio zero: sem crash, completion_pct = 0 (target_brl = 0 → guarda)."""
        status = compute_bond_pool_status(0, 0.15, 0, 0.80)
        assert status["completion_pct"] == 0.0
        # Quando target_brl=0 e threshold_brl=0, 0 >= 0 = True (edge case matemático aceito)

    def test_target_brl_correct(self):
        pat = 5_000_000.0
        status = compute_bond_pool_status(pat, 0.15, 300_000, 0.80)
        assert status["target_brl"] == round(pat * 0.15, 0)

    def test_threshold_brl_correct(self):
        pat = 5_000_000.0
        target = pat * 0.15   # 750_000
        status = compute_bond_pool_status(pat, 0.15, 300_000, 0.80)
        assert status["threshold_brl"] == round(target * 0.80, 0)

    def test_threshold_pct_field(self):
        status = compute_bond_pool_status(3_472_335, 0.15, 124_675, 0.80)
        assert status["threshold_pct"] == 80.0


# ─── PREMISSAS state atual ──────────────────────────────────────────────────

class TestCurrentBondPoolState:

    def test_premissas_has_bond_pool_status(self):
        assert "bond_pool_status" in PREMISSAS
        s = PREMISSAS["bond_pool_status"]
        assert "enabled" in s
        assert "completion_pct" in s
        assert "target_brl" in s
        assert "underestimation_warning" in s

    def test_current_state_not_enabled(self):
        """Estado atual: ~24% completo → isolation NÃO habilitada."""
        assert PREMISSAS["bond_pool_isolation"] is False

    def test_current_completion_below_threshold(self):
        """Posição ~R$124k vs target ~R$520k = ~24% < 80%."""
        pct = PREMISSAS["bond_pool_status"]["completion_pct"]
        assert pct < 80.0, f"Completion {pct}% deveria ser < 80%"

    def test_underestimation_warning_active(self):
        assert PREMISSAS["bond_pool_status"]["underestimation_warning"] is True

    def test_ipca_longo_atual_brl_positive(self):
        assert PREMISSAS["ipca_longo_atual_brl"] > 0

    def test_bond_pool_isolation_threshold_is_08(self):
        assert PREMISSAS["bond_pool_isolation_threshold"] == 0.80


# ─── Simulação com bond_pool_isolation ────────────────────────────────────────

class TestBondPoolIsolationInSimulation:
    """Testa que bond pool isolation altera corretamente vol e guardrails."""

    def test_isolation_increases_p_quality_vs_proxy(self):
        """Com isolation, P(quality) deve ser >= proxy (guardrails nunca disparam no pool phase)."""
        p = dict(PREMISSAS)
        p["idade_fire_alvo"] = 53
        p["anos_simulacao"] = 90 - 53

        p_proxy = compute_p_quality(p, n_sim=1000, seed=42, bond_pool_isolation=False)
        p_isolation = compute_p_quality(p, n_sim=1000, seed=42, bond_pool_isolation=True)

        assert p_isolation >= p_proxy, (
            f"Isolation {p_isolation:.3f} should be >= proxy {p_proxy:.3f}"
        )

    def test_pool_phase_no_guardrail_cut(self):
        """Com isolation, simular_trajetoria deve retornar gastos sem crash."""
        rng = np.random.default_rng(42)
        pat_ini = 10_000_000.0  # suficiente para não zerar
        sobreviveu, _, _, gastos = simular_trajetoria(
            pat_ini, 37, 0.0485, 0.168, 5, rng,
            escala_custo_vida=1.0,
            anos_bond_pool=7,
            vol_bond_pool=0.133,
            bond_pool_isolation=True,
            track_spending=True,
        )
        assert gastos is not None
        assert len(gastos) > 0

    def test_proxy_isolation_same_when_no_pool(self):
        """Sem bond pool (anos_bond_pool=0), proxy e isolation produzem mesmo resultado."""
        p = dict(PREMISSAS)
        p["anos_bond_pool"] = 0
        p["idade_fire_alvo"] = 53
        p["anos_simulacao"] = 90 - 53

        p_proxy = compute_p_quality(p, n_sim=500, seed=42, bond_pool_isolation=False)
        p_isolation = compute_p_quality(p, n_sim=500, seed=42, bond_pool_isolation=True)
        # Sem bond pool phase, ambos devem ser iguais (mesmo caminho de código)
        assert abs(p_proxy - p_isolation) < 0.01, (
            f"Com anos_bond_pool=0, proxy ({p_proxy:.3f}) e isolation ({p_isolation:.3f}) devem ser iguais"
        )
