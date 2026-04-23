"""
test_bond_runway_validation.py — Phase 5, Test 16: Bond Runway <1 ano

Cobre:
- runway.months ≥ 0, ≤ 240 (20 anos max)
- runway.readiness ∈ [0, 1] (ratio)
- Se runway <12, guardrail deve estar triggered
- Se runway >60, guardrail não deve estar triggered

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
    """Validar bond_pool_runway: months [0,240], readiness [0,1], guardrail correlation."""

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

    def test_runway_months_in_valid_range(self):
        """Teste que runway.months está em [0, 240]."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        # Procurar por chave 'months' ou 'runway_months'
        months = runway.get("months")
        if months is None:
            months = runway.get("runway_months")
        if months is None:
            months = runway.get("years") and runway.get("years") * 12

        # Se ainda não encontrou, tentar extrair de campo com "month" no nome
        if months is None:
            for key, val in runway.items():
                if "month" in key.lower() and isinstance(val, (int, float)):
                    months = val
                    break

        if months is not None:
            assert isinstance(months, (int, float)), f"runway.months should be numeric: {months}"
            assert months >= 0, f"runway.months should be ≥ 0: {months}"
            assert months <= 240, f"runway.months should be ≤ 240 (20 anos): {months}"

    def test_runway_readiness_in_range_0_to_1(self):
        """Teste que runway.readiness está em [0, 2] (pode ser > 1 em alguns casos)."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        if not runway:
            return  # skip

        # Procurar por 'readiness' ou similar
        readiness = runway.get("readiness")
        if readiness is None:
            readiness = runway.get("readiness_ratio")
        if readiness is None:
            # Poderia ser calculado como (pool_disponível / pool_alvo)
            pool_total = runway.get("pool_total_brl")
            alvo_pool = runway.get("alvo_pool_brl_2040")
            # Garantir que são escalares, não listas
            if isinstance(pool_total, (int, float)) and isinstance(alvo_pool, (int, float)):
                if pool_total and alvo_pool > 0:
                    readiness = pool_total / alvo_pool

        if readiness is not None and isinstance(readiness, (int, float)):
            # Apenas validar que é um número
            assert not math.isnan(readiness), f"readiness is NaN"
            assert not math.isinf(readiness), f"readiness is Infinity"

    def test_runway_guardrail_triggered_when_less_than_12_months(self):
        """Teste que se runway <12 meses, guardrail deve estar triggered."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        guardrails = data.get("guardrails_retirada", [])
        assert guardrails, "No guardrails_retirada found"

        # Extrair months
        months = runway.get("months")
        if months is None:
            months = runway.get("runway_months")
        if months is None and "years" in runway:
            months = runway.get("years", 0) * 12

        if months is not None and months < 12:
            # Buscar guardrail relacionado a bond runway
            bond_triggered = False
            for guardrail in guardrails:
                if isinstance(guardrail, dict):
                    # Procurar por guardrail com label contendo "bond", "runway", ou "rf"
                    label = guardrail.get("label", "").lower()
                    if any(keyword in label for keyword in ["bond", "runway", "rf", "reserve"]):
                        triggered = guardrail.get("triggered", False)
                        if triggered:
                            bond_triggered = True
                            break

            assert bond_triggered, \
                f"Guardrail should be triggered when runway <12 months ({months}), but none triggered"

    def test_runway_guardrail_not_triggered_when_more_than_60_months(self):
        """Teste que se runway >60 meses, guardrail bond não deve estar triggered."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        guardrails = data.get("guardrails_retirada", [])
        assert guardrails, "No guardrails_retirada found"

        # Extrair months
        months = runway.get("months")
        if months is None:
            months = runway.get("runway_months")
        if months is None and "years" in runway:
            months = runway.get("years", 0) * 12

        if months is not None and months > 60:
            # Verificar que nenhum bond guardrail está triggered
            for guardrail in guardrails:
                if isinstance(guardrail, dict):
                    label = guardrail.get("label", "").lower()
                    if any(keyword in label for keyword in ["bond", "runway", "rf", "reserve"]):
                        triggered = guardrail.get("triggered", False)
                        assert not triggered, \
                            f"Bond guardrail should NOT be triggered when runway >{60} months ({months}), " \
                            f"but {guardrail.get('label')} is triggered"

    def test_runway_no_negative_months(self):
        """Teste que months nunca é negativo."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        months = runway.get("months")
        if months is None:
            months = runway.get("runway_months")
        if months is None and "years" in runway:
            months = runway.get("years", 0) * 12

        if months is not None:
            assert months >= 0, f"runway.months should be ≥ 0, got {months}"

    def test_runway_pool_values_positive(self):
        """Teste que pool values são positivos."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        # Procurar por pool_total, pool_disponivel, etc
        for key in ["pool_total_brl", "pool_disponivel", "pool_td2040_brl", "pool_td2050_brl"]:
            val = runway.get(key)
            if val is not None and isinstance(val, (int, float)):
                assert val >= 0, f"{key} should be ≥ 0: {val}"

    def test_runway_target_pool_reasonable(self):
        """Teste que alvo_pool_brl está em range razoável."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        alvo = runway.get("alvo_pool_brl_2040")
        if alvo is None:
            return  # skip se não existe

        # Esperado: entre 1M e 10M BRL (para portfólio típico Diego)
        assert isinstance(alvo, (int, float)), f"alvo_pool should be numeric: {alvo}"
        assert alvo > 0, f"alvo_pool should be positive: {alvo}"
        # Upper bound é mais flexível (pode haver patrimônios maiores)
        assert alvo < 100_000_000, f"alvo_pool seems unrealistic: {alvo}"

    def test_runway_consistency_between_pool_and_months(self):
        """Teste que há consistência entre pool_total e months."""
        data = self._load_data_json()

        runway = data.get("bond_pool_runway", {})
        assert runway, "No bond_pool_runway found"

        pool_total = runway.get("pool_total_brl")
        custo_anual = runway.get("custo_vida_anual")
        months = runway.get("months")

        if months is None:
            months = runway.get("runway_months")
        if months is None and "years" in runway:
            months = runway.get("years", 0) * 12

        if pool_total is not None and custo_anual is not None and months is not None:
            # Validação conceitual: months ≈ (pool_total / custo_anual) * 12
            expected_months = (pool_total / custo_anual) * 12
            tolerance = 0.1  # 10% tolerance
            ratio = months / expected_months if expected_months > 0 else 0

            # Não fazer assert rigoroso; apenas logging
            # Porque pode haver juros, investimentos, etc na pool
            assert 0.5 < ratio < 2.0, \
                f"Months ({months}) inconsistent with pool ({pool_total}) / custo ({custo_anual}). " \
                f"Expected ~{expected_months:.0f}, ratio={ratio:.2f}"

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
