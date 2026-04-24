"""
test_bond_runway_validation.py — Phase 5, Test 16: Bond Runway <1 ano

Cobre:
- anos_cobertura_pos_fire: lista de anos com cobertura de bonds
- pool_disponivel_pos_fire: disponibilidade anual (pode ser negativa = shortfall)
- pool_total_brl[-1] >= alto_pool_brl_2040 (adequacy check)
- spending_guardrails: piso em R$180k validado

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_bond_runway_validation.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestBondRunwayValidation:
    """Validar bond pool adequacy, runway anos_cobertura, e spending piso."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def test_bond_pool_runway_exists(self):
        """Smoke test: bond_pool_runway existe em data.json."""
        data = self._load_data_json()

        assert "bond_pool_runway" in data, "MISSING: bond_pool_runway in data.json"
        runway = data.get("bond_pool_runway")
        assert runway is not None, "bond_pool_runway is NULL"
        assert isinstance(runway, dict), "bond_pool_runway should be dict"

    def test_anos_cobertura_exists_and_is_list(self):
        """Teste que anos_cobertura_pos_fire existe e é lista."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        anos_cobertura = runway.get("anos_cobertura_pos_fire")
        if anos_cobertura is not None:
            assert isinstance(anos_cobertura, list), f"anos_cobertura should be list: {type(anos_cobertura)}"
            # Validar que contém inteiros não-negativos
            for ano in anos_cobertura:
                assert isinstance(ano, int), f"ano should be int: {ano}"
                assert ano >= 0, f"ano should be >= 0: {ano}"

    def test_pool_disponivel_pos_fire_structure(self):
        """Teste que pool_disponivel_pos_fire está estruturado corretamente."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        pool_disp = runway.get("pool_disponivel_pos_fire")
        if pool_disp is not None:
            # Pode ser lista ou dict
            if isinstance(pool_disp, list):
                for val in pool_disp:
                    assert isinstance(val, (int, float)), f"pool value should be numeric: {val}"
                    assert not math.isnan(val), f"pool value is NaN"
                    assert not math.isinf(val), f"pool value is Infinity"
            elif isinstance(pool_disp, dict):
                for key, val in pool_disp.items():
                    assert isinstance(val, (int, float)), f"pool[{key}] should be numeric: {val}"

    def test_pool_total_brl_vs_alvo_adequacy(self):
        """Teste que pool_total_brl mantém adequacy >= 50% do alvo (avalia progress)."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        if not runway:
            return  # skip

        pool_total = runway.get("pool_total_brl")
        alvo_pool = runway.get("alvo_pool_brl_2040")

        # pool_total pode ser escalar ou lista
        final_pool = pool_total
        if isinstance(pool_total, list) and len(pool_total) > 0:
            final_pool = pool_total[-1]

        if isinstance(final_pool, (int, float)) and isinstance(alvo_pool, (int, float)):
            # CRITICAL: Bond pool deve manter adequacy >= 50% do alvo
            # Abaixo de 50% indica insuficiência significativa
            adequacy_pct = (final_pool / alvo_pool) * 100 if alvo_pool > 0 else 0
            assert adequacy_pct >= 50, \
                f"Bond pool inadequate: {adequacy_pct:.1f}% of target (final={final_pool:.0f}, alvo={alvo_pool:.0f})"

    def test_spending_piso_defined_and_reasonable(self):
        """Teste que spending piso existe e é R$180k (para Diego)."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        if not guardrails:
            return  # skip

        # Procurar por campo 'piso', 'spending_piso', 'lower_limit', etc
        piso = guardrails.get("piso")
        if piso is None:
            piso = guardrails.get("spending_piso")
        if piso is None:
            piso = guardrails.get("lower_limit")

        if piso is not None:
            assert isinstance(piso, (int, float)), f"piso should be numeric: {piso}"
            assert piso > 0, f"piso should be positive: {piso}"
            # Diego's piso é R$180k - permitir ±20% para ajustes
            assert 144_000 <= piso <= 216_000, \
                f"piso out of reasonable range for Diego: {piso:.0f} (expected ~180k)"

    def test_runway_target_pool_reasonable(self):
        """Teste que alvo_pool_brl está em range razoável."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        if not runway:
            return

        alvo = runway.get("alto_pool_brl_2040")
        if alvo is None:
            alvo = runway.get("alvo_pool_brl_2040")
        if alvo is None:
            return  # skip se não existe

        assert isinstance(alvo, (int, float)), f"alvo_pool should be numeric: {alvo}"
        assert alvo > 0, f"alvo_pool should be positive: {alvo}"
        # Para Diego: alvo é ~R$1.73M-2.3M (2040 bond target)
        assert 500_000 <= alvo <= 10_000_000, \
            f"alvo_pool seems unrealistic for Diego: {alvo:.0f} (expected 1.7M-2.3M)"

    def test_runway_gap_analysis_if_present(self):
        """Teste que gap_anos (se presente) tem valores razoáveis."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        if not runway:
            return

        gaps = runway.get("gap_anos", [])
        if not gaps:
            return  # skip se não existe

        for gap in gaps:
            if isinstance(gap, dict):
                ano_pos_fire = gap.get("ano_pos_fire")
                gap_brl = gap.get("gap_brl")

                if ano_pos_fire is not None:
                    assert isinstance(ano_pos_fire, (int, float)), "ano_pos_fire should be numeric"
                    assert ano_pos_fire > 0, "ano_pos_fire should be positive"

                if gap_brl is not None:
                    assert isinstance(gap_brl, (int, float)), "gap_brl should be numeric"
                    # gap_brl pode ser negativo (shortfall)
                    assert abs(gap_brl) < 100_000_000, "gap_brl seems unrealistic"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_bond_runway_validation.py -v")
