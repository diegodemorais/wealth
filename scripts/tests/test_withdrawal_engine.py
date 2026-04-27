#!/usr/bin/env python3
"""
Test suite for WithdrawalEngine.

Tests validate:
- Input validation (WithdrawalRequest.__post_init__)
- Output validation (WithdrawalResult.__post_init__)
- All 6 withdrawal strategies
- Strategy behavior and edge cases
- State management (WithdrawalCtx)
"""

import pytest
from datetime import datetime

from withdrawal_engine import (
    WithdrawalEngine, WithdrawalRequest, WithdrawalResult, WithdrawalCtx,
    GASTO_PISO,
)


@pytest.fixture
def base_ctx():
    """Create base withdrawal context."""
    return WithdrawalCtx(
        swr_inicial=0.03,
        anos_total=37,
        retorno_ano=0.04,
        ipca_anual=0.04,
    )


@pytest.fixture
def base_request(base_ctx):
    """Create base withdrawal request."""
    return WithdrawalRequest(
        strategy="constant",
        gasto_smile=250_000,
        patrimonio_atual=10_000_000,
        patrimonio_pico=10_000_000,
        ano=5,
        ctx=base_ctx,
    )


class TestWithdrawalRequestValidation:
    """Test input validation for WithdrawalRequest."""

    def test_valid_constant_request(self, base_request):
        """Valid request should pass validation."""
        assert base_request.strategy == "constant"
        assert base_request.gasto_smile == 250_000

    def test_all_strategies_valid(self, base_ctx):
        """All 6 strategies should be valid."""
        strategies = ["guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"]
        for strategy in strategies:
            req = WithdrawalRequest(
                strategy=strategy,
                gasto_smile=250_000,
                patrimonio_atual=10_000_000,
                patrimonio_pico=10_000_000,
                ano=5,
                ctx=base_ctx,
            )
            assert req.strategy == strategy

    def test_invalid_strategy(self, base_ctx):
        """Invalid strategy should raise ValueError."""
        with pytest.raises(ValueError, match="strategy must be valid"):
            WithdrawalRequest(
                strategy="invalid_strategy",
                gasto_smile=250_000,
                patrimonio_atual=10_000_000,
                patrimonio_pico=10_000_000,
                ano=5,
                ctx=base_ctx,
            )

    def test_invalid_gasto_smile_zero(self, base_ctx):
        """Gasto smile must be > 0."""
        with pytest.raises(ValueError, match="gasto_smile must be > 0"):
            WithdrawalRequest(
                strategy="constant",
                gasto_smile=0,
                patrimonio_atual=10_000_000,
                patrimonio_pico=10_000_000,
                ano=5,
                ctx=base_ctx,
            )

    def test_invalid_patrimonio_negative(self, base_ctx):
        """Patrimonio must be >= 0."""
        with pytest.raises(ValueError, match="patrimonio_atual must be >= 0"):
            WithdrawalRequest(
                strategy="constant",
                gasto_smile=250_000,
                patrimonio_atual=-1000,
                patrimonio_pico=10_000_000,
                ano=5,
                ctx=base_ctx,
            )


class TestWithdrawalResultValidation:
    """Test output validation for WithdrawalResult."""

    def test_valid_result(self, base_request):
        """Valid result should pass validation."""
        result = WithdrawalEngine.calculate(base_request)
        assert result.source == "withdrawal_engine"
        assert result.gasto_anual > 0

    def test_invalid_negative_gasto(self):
        """Gasto cannot be negative."""
        with pytest.raises(ValueError, match="gasto_anual must be >= 0"):
            WithdrawalResult(
                strategy="constant",
                gasto_anual=-100,
                nota="test",
            )

    def test_invalid_strategy_type(self):
        """Strategy must be valid type."""
        with pytest.raises(ValueError, match="strategy must be valid"):
            WithdrawalResult(
                strategy="invalid",
                gasto_anual=250_000,
                nota="test",
            )


class TestWithdrawalEngineConstant:
    """Test constant-dollar withdrawal strategy."""

    def test_constant_equals_gasto_smile(self, base_ctx):
        """Constant strategy should return exact gasto_smile."""
        request = WithdrawalRequest(
            strategy="constant",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=5,
            ctx=base_ctx,
        )
        result = WithdrawalEngine.calculate(request)
        assert result.gasto_anual == 250_000

    def test_constant_ignores_market_performance(self, base_ctx):
        """Constant strategy should be unchanged by portfolio value."""
        for patrimonio in [5_000_000, 10_000_000, 20_000_000]:
            request = WithdrawalRequest(
                strategy="constant",
                gasto_smile=250_000,
                patrimonio_atual=patrimonio,
                patrimonio_pico=patrimonio,
                ano=5,
                ctx=base_ctx,
            )
            result = WithdrawalEngine.calculate(request)
            assert result.gasto_anual == 250_000


class TestWithdrawalEnginePercentPortfolio:
    """Test percent-of-portfolio withdrawal strategy."""

    def test_pct_portfolio_calculation(self, base_ctx):
        """Percent-of-portfolio should be patrimonio × swr_inicial."""
        request = WithdrawalRequest(
            strategy="pct_portfolio",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=5,
            ctx=base_ctx,
        )
        result = WithdrawalEngine.calculate(request)
        # 10M × 0.03 = 300k
        assert result.gasto_anual == 300_000

    def test_pct_portfolio_responsive_to_market(self, base_ctx):
        """Percent-of-portfolio should change with patrimonio."""
        for patrimonio, min_expected in [(5_000_000, 150_000), (10_000_000, 300_000), (15_000_000, 450_000)]:
            request = WithdrawalRequest(
                strategy="pct_portfolio",
                gasto_smile=250_000,
                patrimonio_atual=patrimonio,
                patrimonio_pico=patrimonio,
                ano=5,
                ctx=WithdrawalCtx(swr_inicial=0.03),  # Fresh context each time
            )
            result = WithdrawalEngine.calculate(request)
            # Should be at least the calculated value (or GASTO_PISO floor if lower)
            assert result.gasto_anual >= min(min_expected, GASTO_PISO)

    def test_pct_portfolio_respects_ceiling(self, base_ctx):
        """Percent-of-portfolio should be capped at GASTO_TETO_PCT."""
        # Create context with high SWR to exceed ceiling
        ctx = WithdrawalCtx(swr_inicial=0.05, anos_total=37)  # 5%
        request = WithdrawalRequest(
            strategy="pct_portfolio",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=5,
            ctx=ctx,
        )
        result = WithdrawalEngine.calculate(request)
        # 10M × 0.05 = 500k, capped at 400k
        assert result.gasto_anual == 400_000


class TestWithdrawalEngineVPW:
    """Test Variable Percentage Withdrawal strategy."""

    def test_vpw_calculation(self, base_ctx):
        """VPW should calculate sustainable rate."""
        request = WithdrawalRequest(
            strategy="vpw",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=0,  # Year 0 of 37
            ctx=base_ctx,
        )
        result = WithdrawalEngine.calculate(request)
        assert result.gasto_anual > 0
        # VPW year 0 with 37 years remaining should be reasonable
        assert result.gasto_anual < 10_000_000

    def test_vpw_increases_over_time(self, base_ctx):
        """VPW percentage should increase as years elapse (fewer years remaining)."""
        gastos = []
        for ano in [0, 10, 20, 30]:
            request = WithdrawalRequest(
                strategy="vpw",
                gasto_smile=250_000,
                patrimonio_atual=10_000_000,
                patrimonio_pico=10_000_000,
                ano=ano,
                ctx=base_ctx,
            )
            result = WithdrawalEngine.calculate(request)
            gastos.append(result.gasto_anual)
        # Gastos should increase as years progress (fewer remaining)
        assert gastos[0] < gastos[-1]

    def test_vpw_respects_ceiling(self, base_ctx):
        """VPW should be capped at GASTO_TETO_VPW."""
        request = WithdrawalRequest(
            strategy="vpw",
            gasto_smile=250_000,
            patrimonio_atual=50_000_000,  # Very large
            patrimonio_pico=50_000_000,
            ano=30,  # Near end
            ctx=base_ctx,
        )
        result = WithdrawalEngine.calculate(request)
        # Should not exceed ceiling
        assert result.gasto_anual <= 500_000


class TestWithdrawalEngineGuardrails:
    """Test drawdown-based guardrails strategy."""

    def test_guardrails_no_drawdown(self, base_ctx):
        """No drawdown should not adjust spending."""
        request = WithdrawalRequest(
            strategy="guardrails",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,  # At peak
            ano=5,
            ctx=base_ctx,
            guardrails_config=[(0, 0.15, 0.0, "Normal")],
        )
        result = WithdrawalEngine.calculate(request)
        assert result.gasto_anual == 250_000

    def test_guardrails_with_drawdown(self, base_ctx):
        """Drawdown should reduce spending."""
        request = WithdrawalRequest(
            strategy="guardrails",
            gasto_smile=250_000,
            patrimonio_atual=8_500_000,  # 15% drawdown from 10M
            patrimonio_pico=10_000_000,
            ano=5,
            ctx=base_ctx,
            guardrails_config=[
                (0.0, 0.10, 0.0, "Normal"),
                (0.10, 0.20, 0.10, "10% cut"),  # 10% drawdown = 10% cut
            ],
        )
        result = WithdrawalEngine.calculate(request)
        # Should apply 10% cut: 250k × 0.9 = 225k
        assert result.gasto_anual == 225_000


class TestWithdrawalEngineGuytonKlinger:
    """Test Guyton-Klinger strategy."""

    def test_gk_initialization(self, base_ctx):
        """GK should initialize state on first year."""
        request = WithdrawalRequest(
            strategy="guyton_klinger",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=0,
            ctx=base_ctx,
        )
        result = WithdrawalEngine.calculate(request)
        assert base_ctx._gk_initialized == True
        assert base_ctx.gasto_prev_gk == 250_000

    def test_gk_positive_return_year(self):
        """GK should apply decision rules in positive return year."""
        ctx = WithdrawalCtx(swr_inicial=0.03, anos_total=37, retorno_ano=0.05)

        # First call to initialize GK state
        req1 = WithdrawalRequest(
            strategy="guyton_klinger",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=0,
            ctx=ctx,
        )
        result1 = WithdrawalEngine.calculate(req1)

        # Second year with positive return
        ctx.retorno_ano = 0.05
        req2 = WithdrawalRequest(
            strategy="guyton_klinger",
            gasto_smile=260_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=1,
            ctx=ctx,
        )
        result2 = WithdrawalEngine.calculate(req2)

        # GK should produce valid output
        assert result2.gasto_anual > 0
        assert result2.gasto_anual <= 260_000  # Never exceed gasto_smile

    def test_gk_negative_return_year(self):
        """GK should reduce spending in negative return year (no inflation adjustment)."""
        ctx = WithdrawalCtx(swr_inicial=0.03, anos_total=37, ipca_anual=0.04)

        # First call to initialize
        ctx.retorno_ano = 0.05
        req1 = WithdrawalRequest(
            strategy="guyton_klinger",
            gasto_smile=250_000,
            patrimonio_atual=10_000_000,
            patrimonio_pico=10_000_000,
            ano=0,
            ctx=ctx,
        )
        result1 = WithdrawalEngine.calculate(req1)
        gasto_year0 = result1.gasto_anual

        # Second year with negative return
        ctx.retorno_ano = -0.10
        req2 = WithdrawalRequest(
            strategy="guyton_klinger",
            gasto_smile=260_000,
            patrimonio_atual=9_000_000,
            patrimonio_pico=10_000_000,
            ano=1,
            ctx=ctx,
        )
        result2 = WithdrawalEngine.calculate(req2)

        # In negative return year, GK should reduce spending (deflate by IPCA)
        # rather than increase with inflation
        assert result2.gasto_anual < gasto_year0 * 1.04  # Less than inflation-adjusted


class TestWithdrawalEngineGKHybrid:
    """Test GK Hybrid strategy (GK + guardrails cap)."""

    def test_gk_hybrid_respects_cap(self, base_ctx):
        """GK Hybrid should cap spending at GASTO_TETO_GK_CAP (350k)."""
        ctx = WithdrawalCtx(swr_inicial=0.05, anos_total=37, retorno_ano=0.10)
        ctx.gasto_prev_gk = 400_000  # Start high
        ctx._gk_initialized = True

        request = WithdrawalRequest(
            strategy="gk_hybrid",
            gasto_smile=400_000,
            patrimonio_atual=20_000_000,
            patrimonio_pico=20_000_000,
            ano=1,
            ctx=ctx,
        )
        result = WithdrawalEngine.calculate(request)
        # Should be capped at 350k
        assert result.gasto_anual == 350_000

    def test_gk_hybrid_floor(self, base_ctx):
        """GK Hybrid should maintain floor at GASTO_PISO."""
        ctx = WithdrawalCtx(swr_inicial=0.03, anos_total=37, retorno_ano=-0.50)
        ctx.gasto_prev_gk = 100_000  # Start low
        ctx._gk_initialized = True

        request = WithdrawalRequest(
            strategy="gk_hybrid",
            gasto_smile=100_000,
            patrimonio_atual=1_000_000,
            patrimonio_pico=10_000_000,
            ano=1,
            ctx=ctx,
        )
        result = WithdrawalEngine.calculate(request)
        # Should not go below GASTO_PISO
        assert result.gasto_anual >= GASTO_PISO


class TestWithdrawalEngineIntegration:
    """Integration tests for withdrawal engine."""

    def test_all_strategies_produce_valid_output(self, base_ctx):
        """All strategies should produce valid WithdrawalResult."""
        strategies = ["guardrails", "constant", "pct_portfolio", "vpw", "guyton_klinger", "gk_hybrid"]
        for strategy in strategies:
            request = WithdrawalRequest(
                strategy=strategy,
                gasto_smile=250_000,
                patrimonio_atual=10_000_000,
                patrimonio_pico=10_000_000,
                ano=5,
                ctx=WithdrawalCtx(),
                guardrails_config=[(0, 0.15, 0.0, "Normal")],
            )
            result = WithdrawalEngine.calculate(request)
            assert isinstance(result, WithdrawalResult)
            assert result.gasto_anual > 0
            assert result.source == "withdrawal_engine"
            assert datetime.fromisoformat(result._generated)

    def test_withdrawal_sequence_simulation(self):
        """Simulate 5-year withdrawal sequence."""
        ctx = WithdrawalCtx(swr_inicial=0.03, anos_total=37)
        gastos = []

        for ano in range(5):
            ctx.retorno_ano = 0.05 if ano % 2 == 0 else -0.05
            request = WithdrawalRequest(
                strategy="guyton_klinger",
                gasto_smile=250_000,
                patrimonio_atual=10_000_000 - (ano * 250_000),
                patrimonio_pico=10_000_000,
                ano=ano,
                ctx=ctx,
            )
            result = WithdrawalEngine.calculate(request)
            gastos.append(result.gasto_anual)

        # Should have 5 withdrawals
        assert len(gastos) == 5
        # All should be positive
        assert all(g > 0 for g in gastos)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
