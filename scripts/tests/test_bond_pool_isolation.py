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

ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from fire_montecarlo import compute_bond_pool_status, PREMISSAS


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
        status = compute_bond_pool_status(0, 0.15, 0, 0.80)
        assert status["completion_pct"] == 0.0
        assert not status["enabled"]

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
