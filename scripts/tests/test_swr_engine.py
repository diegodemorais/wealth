#!/usr/bin/env python3
"""
Test suite for SWREngine.

Tests validate:
- Input validation (SWRRequest.__post_init__)
- Output validation (SWRResult.__post_init__)
- Current SWR calculation and status zones
- FIRE Day SWR projection
- Edge cases
"""

import pytest
from datetime import datetime

from swr_engine import SWREngine, SWRRequest, SWRResult


@pytest.fixture
def valid_pre_fire_request():
    """Create valid pre-FIRE SWR request."""
    return SWRRequest(
        patrimonio_atual=3_000_000,
        custo_vida_base=250_000,
        swr_gatilho=0.030,
        swr_fallback=0.035,
    )


@pytest.fixture
def valid_fire_request():
    """Create valid FIRE projection request."""
    return SWRRequest(
        patrimonio_atual=3_000_000,
        custo_vida_base=250_000,
        swr_gatilho=0.030,
        swr_fallback=0.035,
        patrimonio_fire=11_500_000,
        anos_para_fire=14,
    )


class TestSWRRequestValidation:
    """Test input validation for SWRRequest."""

    def test_valid_pre_fire_request(self, valid_pre_fire_request):
        """Valid request should pass validation."""
        assert valid_pre_fire_request.patrimonio_atual == 3_000_000
        assert valid_pre_fire_request.custo_vida_base == 250_000

    def test_invalid_patrimonio_negative(self, valid_pre_fire_request):
        """Patrimonio must be >= 0."""
        with pytest.raises(ValueError, match="patrimonio_atual must be >= 0"):
            SWRRequest(
                patrimonio_atual=-1000,
                custo_vida_base=valid_pre_fire_request.custo_vida_base,
            )

    def test_invalid_custo_vida_zero(self, valid_pre_fire_request):
        """Custo vida must be > 0."""
        with pytest.raises(ValueError, match="custo_vida_base must be > 0"):
            SWRRequest(
                patrimonio_atual=valid_pre_fire_request.patrimonio_atual,
                custo_vida_base=0,
            )

    def test_invalid_swr_gatilho_zero(self, valid_pre_fire_request):
        """SWR gatilho must be > 0."""
        with pytest.raises(ValueError, match="swr_gatilho must be > 0"):
            SWRRequest(
                patrimonio_atual=valid_pre_fire_request.patrimonio_atual,
                custo_vida_base=valid_pre_fire_request.custo_vida_base,
                swr_gatilho=0.0,
            )


class TestSWRResultValidation:
    """Test output validation for SWRResult."""

    def test_valid_verde_result(self, valid_pre_fire_request):
        """Valid verde result should pass validation."""
        result = SWREngine.calculate_current(valid_pre_fire_request)
        assert result.source == "swr_engine"
        assert result.swr_status in ("verde", "amarelo", "vermelho")

    def test_invalid_negative_swr(self):
        """SWR cannot be negative."""
        with pytest.raises(ValueError, match="swr_atual must be > 0"):
            SWRResult(
                swr_atual=-0.01,
                swr_status="verde",
                pfire_status="test",
                zona_descricao="test",
                patrimonio_atual=1_000_000,
                custo_vida_base=250_000,
                swr_gatilho=0.030,
            )

    def test_invalid_status_zone(self):
        """Status must be valid zone (verde/amarelo/vermelho)."""
        with pytest.raises(ValueError, match="verde/amarelo/vermelho"):
            SWRResult(
                swr_atual=0.02,
                swr_status="invalid",  # Not a valid zone
                pfire_status="test",
                zona_descricao="test",
                patrimonio_atual=1_000_000,
                custo_vida_base=250_000,
                swr_gatilho=0.030,
            )


class TestSWREngineCurrent:
    """Test current SWR calculation."""

    def test_current_swr_calculation(self, valid_pre_fire_request):
        """SWR = custo_vida / patrimonio."""
        result = SWREngine.calculate_current(valid_pre_fire_request)
        # 250k / 3M = 0.0833 (8.33%)
        expected_swr = round(250_000 / 3_000_000, 4)
        assert result.swr_atual == expected_swr

    def test_verde_zone_high_swr(self, valid_pre_fire_request):
        """SWR ≥ 3.5% should be verde."""
        # Need patrimonio where 250k / patrimonio >= 0.035
        # patrimonio <= 250k / 0.035 = 7.14M
        request = SWRRequest(
            patrimonio_atual=5_000_000,  # SWR = 5%
            custo_vida_base=250_000,
        )
        result = SWREngine.calculate_current(request)
        assert result.swr_status == "verde"

    def test_amarelo_zone_safe_swr(self, valid_pre_fire_request):
        """SWR 2.5-3.5% should be amarelo."""
        # Need patrimonio where 0.025 <= 250k / patrimonio < 0.035
        # 7.14M < patrimonio <= 10M
        request = SWRRequest(
            patrimonio_atual=9_000_000,  # SWR = 2.78%
            custo_vida_base=250_000,
        )
        result = SWREngine.calculate_current(request)
        assert result.swr_status == "amarelo"

    def test_vermelho_zone_low_swr(self, valid_pre_fire_request):
        """SWR < 2.5% should be vermelho."""
        # Need patrimonio where 250k / patrimonio < 0.025
        # patrimonio > 10M
        request = SWRRequest(
            patrimonio_atual=15_000_000,  # SWR = 1.67%
            custo_vida_base=250_000,
        )
        result = SWREngine.calculate_current(request)
        assert result.swr_status == "vermelho"

    def test_zero_patrimonio_uses_fallback(self):
        """Zero patrimonio should use swr_fallback."""
        request = SWRRequest(
            patrimonio_atual=0,  # Unknown
            custo_vida_base=250_000,
            swr_fallback=0.035,
        )
        result = SWREngine.calculate_current(request)
        assert result.swr_atual == 0.035  # Fallback value


class TestSWREngineFire:
    """Test FIRE Day SWR projection."""

    def test_fire_swr_calculation(self, valid_fire_request):
        """FIRE SWR = custo_vida / patrimonio_fire."""
        result = SWREngine.calculate_fire(valid_fire_request)
        # 250k / 11.5M = 0.0217 (2.17%)
        expected_swr = round(250_000 / 11_500_000, 4)
        assert result.swr_fire == expected_swr

    def test_fire_adequate_below_gatilho(self, valid_fire_request):
        """SWR ≤ 3.0% at FIRE should be verde (adequate)."""
        # 250k / 11.5M = 2.17% < 3.0%
        result = SWREngine.calculate_fire(valid_fire_request)
        assert result.swr_status == "verde"
        assert "Adequado" in result.pfire_adequacy

    def test_fire_marginal_above_gatilho(self):
        """SWR between 3.0-3.5% at FIRE should be amarelo (marginal)."""
        # Need patrimonio where 250k / patrimonio is between 0.03-0.035
        # 7.14M < patrimonio <= 8.33M
        request = SWRRequest(
            patrimonio_atual=1_000_000,
            custo_vida_base=250_000,
            patrimonio_fire=8_000_000,  # SWR = 3.125%
            anos_para_fire=14,
        )
        result = SWREngine.calculate_fire(request)
        assert result.swr_status == "amarelo"
        assert "Marginal" in result.pfire_adequacy

    def test_fire_inadequate_above_3_5(self):
        """SWR > 3.5% at FIRE should be vermelho (inadequate)."""
        # Need patrimonio < 7.14M
        request = SWRRequest(
            patrimonio_atual=1_000_000,
            custo_vida_base=250_000,
            patrimonio_fire=5_000_000,  # SWR = 5%
            anos_para_fire=14,
        )
        result = SWREngine.calculate_fire(request)
        assert result.swr_status == "vermelho"
        assert "Inadequado" in result.pfire_adequacy

    def test_fire_requires_patrimonio_fire(self, valid_pre_fire_request):
        """calculate_fire should raise if patrimonio_fire missing."""
        with pytest.raises(ValueError, match="patrimonio_fire required"):
            SWREngine.calculate_fire(valid_pre_fire_request)


class TestSWREngineComprehensive:
    """Test comprehensive SWR analysis."""

    def test_complete_analysis(self, valid_pre_fire_request):
        """Complete analysis includes current and metadata."""
        result = SWREngine.calculate_current(valid_pre_fire_request)
        assert result._generated is not None
        # Verify timestamp format
        datetime.fromisoformat(result._generated)

    def test_pfire_status_message(self, valid_pre_fire_request):
        """Result should have human-readable FIRE status."""
        result = SWREngine.calculate_current(valid_pre_fire_request)
        assert "SWR atual:" in result.pfire_status
        assert "Gatilho FIRE:" in result.pfire_status

    def test_zona_descricao_matches_status(self, valid_pre_fire_request):
        """Zona description should match status."""
        result = SWREngine.calculate_current(valid_pre_fire_request)
        if result.swr_status == "verde":
            assert "≥3.5%" in result.zona_descricao
        elif result.swr_status == "amarelo":
            assert "2.5–3.5%" in result.zona_descricao
        else:  # vermelho
            assert "<2.5%" in result.zona_descricao


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
