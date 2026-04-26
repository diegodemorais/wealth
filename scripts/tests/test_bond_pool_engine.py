#!/usr/bin/env python3
"""
Test suite for BondPoolEngine.

Tests validate:
- Input validation (BondPoolRequest.__post_init__)
- Output validation (BondPoolResult.__post_init__)
- Pre-FIRE accumulation logic
- Post-FIRE depletion logic
- Profile-dependent calculations
- Edge cases
"""

import pytest
from datetime import datetime

from bond_pool_engine import BondPoolEngine, BondPoolRequest, BondPoolResult


@pytest.fixture
def valid_pre_fire_request():
    """Create a valid BondPoolRequest for pre-FIRE testing."""
    return BondPoolRequest(
        pool_2040_inicial=20_000,
        pool_2050_inicial=10_000,
        taxa_2040=0.0710,
        taxa_2050=0.0685,
        aporte_ipca_mensal=10_000,
        ano_aporte_fim=2028,
        ano_atual=2026,
        ano_fire=2040,
    )


@pytest.fixture
def valid_post_fire_request_with_profiles():
    """Create a valid BondPoolRequest with profiles for post-FIRE testing."""
    return BondPoolRequest(
        pool_2040_inicial=20_000,
        pool_2050_inicial=10_000,
        taxa_2040=0.0710,
        taxa_2050=0.0685,
        perfis_cfg={
            "diego": {
                "custo_vida_base": 250_000,
                "inss_katia_anual": 0,
                "tem_conjuge": False,
            },
            "casal": {
                "custo_vida_base": 300_000,
                "inss_katia_anual": 48_000,
                "tem_conjuge": True,
            },
        },
        r_real_post_fire=0.05,
        anos_projecao_pos_fire=20,
        fire_year_override=2040,
    )


class TestBondPoolRequestValidation:
    """Test input validation for BondPoolRequest."""

    def test_valid_pre_fire_request(self, valid_pre_fire_request):
        """Valid request should pass validation."""
        assert valid_pre_fire_request.pool_2040_inicial == 20_000
        assert valid_pre_fire_request.taxa_2040 == 0.0710

    def test_invalid_pool_2040_negative(self, valid_pre_fire_request):
        """Pool cannot be negative."""
        with pytest.raises(ValueError, match="pool_2040_inicial must be >= 0"):
            BondPoolRequest(
                pool_2040_inicial=-1000,
                pool_2050_inicial=valid_pre_fire_request.pool_2050_inicial,
                taxa_2040=valid_pre_fire_request.taxa_2040,
                taxa_2050=valid_pre_fire_request.taxa_2050,
            )

    def test_invalid_taxa_zero(self, valid_pre_fire_request):
        """Taxa must be > 0."""
        with pytest.raises(ValueError, match="taxa_2040 must be > 0"):
            BondPoolRequest(
                pool_2040_inicial=valid_pre_fire_request.pool_2040_inicial,
                pool_2050_inicial=valid_pre_fire_request.pool_2050_inicial,
                taxa_2040=0.0,
                taxa_2050=valid_pre_fire_request.taxa_2050,
            )

    def test_invalid_r_real_negative(self, valid_pre_fire_request):
        """r_real_post_fire must be > 0."""
        with pytest.raises(ValueError, match="r_real_post_fire must be > 0"):
            BondPoolRequest(
                pool_2040_inicial=valid_pre_fire_request.pool_2040_inicial,
                pool_2050_inicial=valid_pre_fire_request.pool_2050_inicial,
                taxa_2040=valid_pre_fire_request.taxa_2040,
                taxa_2050=valid_pre_fire_request.taxa_2050,
                r_real_post_fire=0.0,
            )

    def test_invalid_anos_projecao_zero(self, valid_pre_fire_request):
        """anos_projecao_pos_fire must be >= 1."""
        with pytest.raises(ValueError, match="anos_projecao_pos_fire must be >= 1"):
            BondPoolRequest(
                pool_2040_inicial=valid_pre_fire_request.pool_2040_inicial,
                pool_2050_inicial=valid_pre_fire_request.pool_2050_inicial,
                taxa_2040=valid_pre_fire_request.taxa_2040,
                taxa_2050=valid_pre_fire_request.taxa_2050,
                anos_projecao_pos_fire=0,
            )


class TestBondPoolResultValidation:
    """Test output validation for BondPoolResult."""

    def test_valid_result(self, valid_pre_fire_request):
        """Valid result should pass validation."""
        result = BondPoolEngine.calculate(valid_pre_fire_request)
        assert result.source == "bond_pool_engine"
        assert len(result.pool_total_brl) == 15  # 2026-2040

    def test_invalid_pool_negative(self):
        """Pool values cannot be negative."""
        with pytest.raises(ValueError, match="pool_total_brl.*negative"):
            BondPoolResult(
                anos_pre_fire=[2026],
                pool_td2040_brl=[-1000.0],
                pool_td2050_brl=[500.0],
                pool_total_brl=[-500.0],
                alvo_pool_pct=0.15,
                alvo_pool_brl_2040=1_000_000.0,
                runway_por_perfil={},
            )

    def test_invalid_pool_sum(self):
        """Pool totals must equal td2040 + td2050."""
        with pytest.raises(ValueError, match="pool_total_brl.*!="):
            BondPoolResult(
                anos_pre_fire=[2026],
                pool_td2040_brl=[10_000.0],
                pool_td2050_brl=[5_000.0],
                pool_total_brl=[20_000.0],  # Should be 15,000
                alvo_pool_pct=0.15,
                alvo_pool_brl_2040=1_000_000.0,
                runway_por_perfil={},
            )

    def test_invalid_series_length_mismatch(self):
        """All pool series must have same length."""
        with pytest.raises(ValueError, match="Pool series must have same length"):
            BondPoolResult(
                anos_pre_fire=[2026, 2027],
                pool_td2040_brl=[10_000.0],
                pool_td2050_brl=[5_000.0, 5_500.0],
                pool_total_brl=[15_000.0, 15_500.0],
                alvo_pool_pct=0.15,
                alvo_pool_brl_2040=1_000_000.0,
                runway_por_perfil={},
            )

    def test_invalid_runway_structure(self):
        """Runway per perfil must have valid runway_anos."""
        with pytest.raises(ValueError, match="missing or invalid runway_anos"):
            BondPoolResult(
                anos_pre_fire=[2026],
                pool_td2040_brl=[10_000.0],
                pool_td2050_brl=[5_000.0],
                pool_total_brl=[15_000.0],
                alvo_pool_pct=0.15,
                alvo_pool_brl_2040=1_000_000.0,
                runway_por_perfil={"diego": {}},  # Missing runway_anos
            )


class TestBondPoolEnginePreFire:
    """Test pre-FIRE accumulation logic."""

    def test_pre_fire_basic_accumulation(self, valid_pre_fire_request):
        """Pool should grow with taxa + aporte."""
        pool_2040, pool_2050, pool_total = BondPoolEngine.calculate_pre_fire(valid_pre_fire_request)

        assert len(pool_2040) == 15
        assert pool_2040[0] == 20_000  # Initial value
        assert pool_2040[-1] > pool_2040[0]  # Should grow

    def test_pre_fire_allocation_80_20(self, valid_pre_fire_request):
        """Aporte should split 80% to 2040, 20% to 2050."""
        # In year 2026, with aporte_ipca_mensal=10k (annual=120k)
        # 2040 gets 80% = 96k, 2050 gets 20% = 24k
        pool_2040, pool_2050, pool_total = BondPoolEngine.calculate_pre_fire(valid_pre_fire_request)

        # 2027 value = (20000 * 1.0710) + (120000 * 0.8) ≈ 117,420
        expected_2040_2027 = round(20_000 * 1.0710 + 120_000 * 0.8, 0)
        assert pool_2040[1] == expected_2040_2027

    def test_pre_fire_aporte_stops(self, valid_pre_fire_request):
        """Aporte should stop after ano_aporte_fim."""
        pool_2040, pool_2050, pool_total = BondPoolEngine.calculate_pre_fire(valid_pre_fire_request)

        # Growth rate should change after 2028 (from growth+aporte to growth only)
        growth_rate_2028 = (pool_2040[2] - pool_2040[1]) / pool_2040[1]  # 2028 is index 2
        growth_rate_2029 = (pool_2040[3] - pool_2040[2]) / pool_2040[2]  # 2029 is index 3
        # 2029 should be pure taxa (7.1%), 2028 has aporte
        assert growth_rate_2029 < growth_rate_2028

    def test_pre_fire_no_aporte(self, valid_pre_fire_request):
        """Zero aporte should only grow by taxa."""
        valid_pre_fire_request.aporte_ipca_mensal = 0
        pool_2040, pool_2050, pool_total = BondPoolEngine.calculate_pre_fire(valid_pre_fire_request)

        # Should grow only by taxa
        expected_2027 = round(20_000 * 1.0710, 0)
        assert pool_2040[1] == expected_2027

    def test_pre_fire_pool_total_sum(self, valid_pre_fire_request):
        """Total pool must equal 2040 + 2050 at all times."""
        pool_2040, pool_2050, pool_total = BondPoolEngine.calculate_pre_fire(valid_pre_fire_request)

        for i, (a, b, total) in enumerate(zip(pool_2040, pool_2050, pool_total)):
            assert total == a + b, f"Index {i}: {total} != {a} + {b}"


class TestBondPoolEnginePostFire:
    """Test post-FIRE depletion logic."""

    def test_post_fire_basic_depletion(self, valid_post_fire_request_with_profiles):
        """Pool should deplete by withdrawal less growth."""
        runway_result = BondPoolEngine.calculate_post_fire(
            valid_post_fire_request_with_profiles,
            pool_inicial=1_000_000,
        )

        assert "diego" in runway_result
        diego = runway_result["diego"]
        assert diego["pool_inicial"] == 1_000_000
        assert len(diego["pool_disponivel"]) == 20

    def test_post_fire_runway_calculation(self, valid_post_fire_request_with_profiles):
        """Runway should be calculated correctly."""
        runway_result = BondPoolEngine.calculate_post_fire(
            valid_post_fire_request_with_profiles,
            pool_inicial=1_000_000,
        )

        diego = runway_result["diego"]
        # With r_real=5%, custo=250k, pool starts at 1M
        # Year 1: 1M * 1.05 - 250k = 800k (positive)
        # Should have several years runway
        assert diego["runway_anos"] > 4

    def test_post_fire_profile_difference(self, valid_post_fire_request_with_profiles):
        """Different profiles should have different runways."""
        runway_result = BondPoolEngine.calculate_post_fire(
            valid_post_fire_request_with_profiles,
            pool_inicial=1_000_000,
        )

        diego_runway = runway_result["diego"]["runway_anos"]
        casal_runway = runway_result["casal"]["runway_anos"]

        # Casal spends more (300k vs 250k), should have shorter runway
        assert casal_runway < diego_runway

    def test_post_fire_inss_katia_recorded(self, valid_post_fire_request_with_profiles):
        """INSS Katia should be recorded in output."""
        request_with_inss = BondPoolRequest(
            pool_2040_inicial=1000,
            pool_2050_inicial=500,
            taxa_2040=0.07,
            taxa_2050=0.07,
            perfis_cfg={
                "casal_com_inss": {
                    "custo_vida_base": 300_000,
                    "inss_katia_anual": 48_000,
                    "tem_conjuge": True,
                },
            },
            r_real_post_fire=0.05,
            anos_projecao_pos_fire=20,
            fire_year_override=2040,
        )

        runway_result = BondPoolEngine.calculate_post_fire(request_with_inss, pool_inicial=1_000_000)

        # Verify INSS data is recorded
        casal = runway_result["casal_com_inss"]
        assert casal["inss_katia_anual"] == 48_000
        assert casal["custo_vida_anual"] == 300_000

    def test_post_fire_pool_crossing_zero(self, valid_post_fire_request_with_profiles):
        """Interpolate exact point where pool crosses zero."""
        # Small pool to force crossing
        runway_result = BondPoolEngine.calculate_post_fire(
            valid_post_fire_request_with_profiles,
            pool_inicial=100_000,
        )

        diego = runway_result["diego"]
        # 100k with 5% growth and 250k withdrawal → crosses zero quickly
        assert diego["runway_anos"] < 1.0

    def test_post_fire_pool_stays_positive(self, valid_post_fire_request_with_profiles):
        """Large pool should stay positive over horizon."""
        runway_result = BondPoolEngine.calculate_post_fire(
            valid_post_fire_request_with_profiles,
            pool_inicial=10_000_000,
        )

        diego = runway_result["diego"]
        # All values in pool_series should stay positive
        for val in diego["pool_disponivel"]:
            assert val > 0
        # And runway should be full horizon
        assert diego["runway_anos"] == 20


class TestBondPoolEngineIntegration:
    """Test complete end-to-end calculation."""

    def test_complete_calculation(self, valid_post_fire_request_with_profiles):
        """Complete calculation pre-FIRE + post-FIRE."""
        result = BondPoolEngine.calculate(valid_post_fire_request_with_profiles)

        assert result.source == "bond_pool_engine"
        assert len(result.anos_pre_fire) == 15
        assert len(result.pool_total_brl) == 15
        assert "diego" in result.runway_por_perfil
        assert "casal" in result.runway_por_perfil

    def test_alvo_pool_calculation(self, valid_post_fire_request_with_profiles):
        """Alvo pool should be 15% of patrimonio_p50_2040."""
        result = BondPoolEngine.calculate(
            valid_post_fire_request_with_profiles,
            patrimonio_p50_2040=10_000_000,
        )

        expected_alvo = round(10_000_000 * 0.15, 0)
        assert result.alvo_pool_brl_2040 == expected_alvo

    def test_generated_timestamp(self, valid_post_fire_request_with_profiles):
        """Result should have valid _generated timestamp."""
        result = BondPoolEngine.calculate(valid_post_fire_request_with_profiles)
        assert result._generated is not None
        # Verify it's ISO format
        datetime.fromisoformat(result._generated)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
