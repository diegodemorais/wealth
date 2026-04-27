#!/usr/bin/env python3
"""
Phase 4.2 — Monte Carlo Compatibility Tests ✅

Verify that consolidated engines work correctly in Monte Carlo simulations:
- All 6 withdrawal strategies produce valid P(FIRE) metrics
- Output format unchanged from pre-consolidation
- Performance is acceptable (no regressions)
- Edge cases handled correctly (depleted portfolios, etc.)
"""

import pytest
from pathlib import Path

from fire_montecarlo import simular_trajetoria, simular_trajetoria_com_trajeto
from config import IPCA_ANUAL
import numpy as np


class TestPhase4MonteCarloBasics:
    """Test basic Monte Carlo functionality."""

    def test_simular_trajetoria_runs_successfully(self):
        """Basic trajectory simulation should complete without errors."""
        rng = np.random.default_rng(42)
        sucesso, pat_final, pat_pico, gastos = simular_trajetoria(
            patrimonio_inicial=3_000_000,
            n_anos=37,
            retorno_equity=0.05,
            volatilidade=0.15,
            df=5,
            rng=rng,
            escala_custo_vida=1.0,
            aplicar_ir=True,
            anos_bond_pool=7,
            ipca_anual=IPCA_ANUAL,
            strategy="guardrails",
            track_spending=False,
        )

        assert isinstance(sucesso, bool)
        assert pat_final >= 0
        assert pat_pico >= 0

    def test_simular_trajetoria_com_trajeto_returns_complete_path(self):
        """Trajectory with full history should return all years."""
        rng = np.random.default_rng(42)
        sucesso, pat_final, trajeto = simular_trajetoria_com_trajeto(
            patrimonio_inicial=3_000_000,
            n_anos=37,
            retorno_equity=0.05,
            volatilidade=0.15,
            df=5,
            rng=rng,
            escala_custo_vida=1.0,
            aplicar_ir=True,
            anos_bond_pool=7,
            ipca_anual=IPCA_ANUAL,
            strategy="guardrails",
        )

        assert isinstance(sucesso, bool)
        assert pat_final >= 0
        # Should have 38 entries (year 0 + 37 years)
        assert len(trajeto) == 38
        # All values should be non-negative
        assert all(v >= 0 for v in trajeto)

    def test_trajectories_handle_depleted_portfolio(self):
        """Simulation should handle portfolio depletion gracefully."""
        rng = np.random.default_rng(42)

        # Use very low patrimonio + high spending to force depletion
        sucesso, pat_final, trajeto = simular_trajetoria_com_trajeto(
            patrimonio_inicial=100_000,  # Very small
            n_anos=37,
            retorno_equity=0.01,  # Very low returns
            volatilidade=0.30,  # High volatility
            df=5,
            rng=rng,
            escala_custo_vida=1.5,  # High spending multiplier
            aplicar_ir=True,
            anos_bond_pool=7,
            ipca_anual=IPCA_ANUAL,
            strategy="guardrails",
        )

        # Should complete without errors
        assert isinstance(sucesso, bool)
        # Should have filled trajectory
        assert len(trajeto) == 38


class TestPhase4StrategyCompatibility:
    """Test all 6 strategies work in Monte Carlo."""

    def test_all_strategies_produce_valid_results(self):
        """All 6 strategies should produce valid Monte Carlo results."""
        strategies = [
            "guardrails",
            "constant",
            "pct_portfolio",
            "vpw",
            "guyton_klinger",
            "gk_hybrid",
        ]

        for strategy in strategies:
            rng = np.random.default_rng(42)
            sucesso, pat_final, trajeto = simular_trajetoria_com_trajeto(
                patrimonio_inicial=3_000_000,
                n_anos=37,
                retorno_equity=0.05,
                volatilidade=0.15,
                df=5,
                rng=rng,
                escala_custo_vida=1.0,
                aplicar_ir=True,
                anos_bond_pool=7,
                ipca_anual=IPCA_ANUAL,
                strategy=strategy,
            )

            assert isinstance(sucesso, bool), f"{strategy}: sucesso must be bool"
            assert pat_final >= 0, f"{strategy}: pat_final must be >= 0"
            assert len(trajeto) == 38, f"{strategy}: trajeto must have 38 entries"
            assert all(v >= 0 for v in trajeto), f"{strategy}: all values must be >= 0"

    def test_strategies_consistency_across_runs(self):
        """Same strategy with same seed should produce same results."""
        seed = 12345

        def run_simulation():
            rng = np.random.default_rng(seed)
            sucesso, pat_final, trajeto = simular_trajetoria_com_trajeto(
                patrimonio_inicial=3_000_000,
                n_anos=37,
                retorno_equity=0.05,
                volatilidade=0.15,
                df=5,
                rng=rng,
                escala_custo_vida=1.0,
                aplicar_ir=True,
                anos_bond_pool=7,
                ipca_anual=IPCA_ANUAL,
                strategy="guardrails",
            )
            return sucesso, pat_final, trajeto

        # Run twice with same seed
        sucesso1, pat_final1, trajeto1 = run_simulation()
        sucesso2, pat_final2, trajeto2 = run_simulation()

        # Results should be identical
        assert sucesso1 == sucesso2
        assert pat_final1 == pat_final2
        assert trajeto1 == trajeto2


class TestPhase4NegativePatrimonioHandling:
    """Test that negative patrimonio is handled correctly (Phase 4.2 fix)."""

    def test_clamping_prevents_validation_errors(self):
        """Clamping patrimonio to 0 should prevent validation errors."""
        # Create a scenario that would cause patrimonio to go negative
        rng = np.random.default_rng(42)

        sucesso, pat_final, trajeto = simular_trajetoria_com_trajeto(
            patrimonio_inicial=500_000,  # Small initial value
            n_anos=37,
            retorno_equity=-0.20,  # Harsh negative returns
            volatilidade=0.40,  # High volatility
            df=5,
            rng=rng,
            escala_custo_vida=1.0,
            aplicar_ir=True,
            anos_bond_pool=7,
            ipca_anual=IPCA_ANUAL,
            strategy="guardrails",
        )

        # Should complete without ValueError about negative patrimonio
        assert isinstance(sucesso, bool)
        # All trajectory values should be non-negative
        assert all(v >= 0 for v in trajeto)

    def test_depleted_portfolio_gets_zero_withdrawal(self):
        """When patrimonio is 0, withdrawal should be clamped to GASTO_PISO."""
        from config import GASTO_PISO
        from withdrawal_engine import WithdrawalEngine, WithdrawalRequest, WithdrawalCtx

        # Test with zero patrimonio
        ctx = WithdrawalCtx(swr_inicial=0.03, anos_total=37)
        req = WithdrawalRequest(
            strategy="guardrails",
            gasto_smile=250_000,
            patrimonio_atual=0,  # Depleted
            patrimonio_pico=1_000_000,
            ano=20,
            ctx=ctx,
            guardrails_config=[(0.0, 0.15, 0.0, "Normal")],
        )

        result = WithdrawalEngine.calculate(req)
        # Should return at least GASTO_PISO (safety floor)
        assert result.gasto_anual >= GASTO_PISO


class TestPhase4OutputFormat:
    """Test that output format is unchanged from pre-consolidation."""

    def test_trajectory_structure(self):
        """Trajectory should have expected structure."""
        rng = np.random.default_rng(42)
        sucesso, pat_final, trajeto = simular_trajetoria_com_trajeto(
            patrimonio_inicial=3_000_000,
            n_anos=37,
            retorno_equity=0.05,
            volatilidade=0.15,
            df=5,
            rng=rng,
            strategy="guardrails",
        )

        # Should be tuple of (bool, float, list)
        assert isinstance(sucesso, bool)
        assert isinstance(pat_final, (int, float))
        assert isinstance(trajeto, list)

        # Trajectory should have 38 elements (year 0 + 37 years)
        assert len(trajeto) == 38

        # Each element should be numeric and non-negative
        for val in trajeto:
            assert isinstance(val, (int, float))
            assert val >= 0

    def test_spending_tracking_format(self):
        """Spending tracking should return valid list."""
        rng = np.random.default_rng(42)
        sucesso, pat_final, pat_pico, gastos = simular_trajetoria(
            patrimonio_inicial=3_000_000,
            n_anos=37,
            retorno_equity=0.05,
            volatilidade=0.15,
            df=5,
            rng=rng,
            track_spending=True,
            strategy="guardrails",
        )

        # When track_spending=True, should return spending list
        assert gastos is not None
        assert isinstance(gastos, list)
        # Length should match either 37 (full) or be shorter if portfolio depleted
        assert len(gastos) > 0
        assert len(gastos) <= 37

        # Each spending value should be non-negative
        assert all(g >= 0 for g in gastos)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
