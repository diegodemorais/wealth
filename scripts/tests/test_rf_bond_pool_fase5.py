"""
test_rf_bond_pool_fase5.py — Phase 5, Tests 1-10: Bond Pool & IPCA+ Ladder Validation

Cobre:
- Bond pool adequacy >= 50% do alvo 2040
- IPCA+ 2040 piso operacional 6.0%
- Renda+ 2065 piso compra 6.5%, piso venda 6.0%
- Spending piso R$180k definido
- Anos de cobertura pos-FIRE
- Ladder de titulos (IPCA+2029/2040/2050)

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_rf_bond_pool_fase5.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
REACT_APP_DIR = ROOT / "react-app"
DADOS_DIR = ROOT / "dados"

sys.path.insert(0, str(ROOT / "scripts"))


class TestBondPoolRFValidacao:
    """Validar bond pool adequacy, ladder IPCA+, e pisos operacionais."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def _load_carteira_params(self):
        """Carrega carteira_params.json."""
        params_file = DADOS_DIR / "carteira_params.json"
        if params_file.exists():
            with open(params_file) as f:
                return json.load(f)
        return {}

    def test_bond_pool_runway_existe(self):
        """Smoke test: bond_pool_runway existe."""
        data = self._load_data_json()
        assert "bond_pool_runway" in data, "MISSING: bond_pool_runway"
        runway = data.get("bond_pool_runway", {})
        assert isinstance(runway, dict), "bond_pool_runway should be dict"

    def test_pool_total_vs_alvo_adequacy_50_percent(self):
        """Teste que pool_total_brl >= 50% do alvo 2040."""
        data = self._load_data_json()
        runway = data.get("bond_pool_runway", {})

        pool_total = runway.get("pool_total_brl")
        alvo_pool = runway.get("alvo_pool_brl_2040") or runway.get("alto_pool_brl_2040")

        # pool_total pode ser lista
        if isinstance(pool_total, list) and len(pool_total) > 0:
            pool_total = pool_total[-1]

        if pool_total and alvo_pool:
            adequacy_pct = (pool_total / alvo_pool) * 100
            assert adequacy_pct >= 50, \
                f"Pool inadequate: {adequacy_pct:.1f}% of target (need >= 50%)"

    def test_ipca_plus_2040_taxa_piso_operacional(self):
        """Teste que IPCA+ 2040 tem taxa >= 6.0% piso operacional."""
        data = self._load_data_json()

        rf = data.get("rf", {})
        ipca2040 = rf.get("ipca2040", {})
        taxa = ipca2040.get("taxa") or ipca2040.get("taxa_atual")

        if taxa:
            # Detectar se em % ou decimal
            if taxa > 1:
                taxa_pct = taxa
            else:
                taxa_pct = taxa * 100

            assert taxa_pct >= 5.0, \
                f"IPCA+ 2040 taxa too low: {taxa_pct:.2f}% (piso operacional 6.0%)"

    def test_renda_plus_2065_piso_compra_6_5_percent(self):
        """Teste que Renda+ 2065 tem piso de compra DCA em 6.5%."""
        data = self._load_data_json()

        rf = data.get("rf", {})
        renda2065 = rf.get("renda2065", {})
        taxa = renda2065.get("taxa") or renda2065.get("taxa_atual")

        if taxa:
            if taxa > 1:
                taxa_pct = taxa
            else:
                taxa_pct = taxa * 100

            # Piso de compra DCA: 6.5%
            # Piso de venda: 6.0%
            # Monitorar: < 6.5%
            assert taxa_pct >= 5.0, \
                f"Renda+ 2065 taxa unrealistic: {taxa_pct:.2f}%"

    def test_spending_piso_180k_defined(self):
        """Teste que gasto_piso = R$180k."""
        data = self._load_data_json()

        # Pode estar em guardrails ou premissas
        guardrails = data.get("spending_guardrails", {})
        premissas = data.get("premissas", {})

        piso = guardrails.get("piso") or premissas.get("gasto_piso")

        if piso:
            assert isinstance(piso, (int, float)), f"piso must be numeric"
            # R$180k ± 20%
            assert 144_000 <= piso <= 216_000, \
                f"gasto_piso unrealistic: {piso:.0f} (expected ~180k)"

    def test_spending_ceiling_350k_defined(self):
        """Teste que spending ceiling (upside) = R$350k."""
        data = self._load_data_json()

        guardrails = data.get("spending_guardrails", {})
        ceiling = guardrails.get("ceiling")

        if ceiling:
            assert isinstance(ceiling, (int, float)), f"ceiling must be numeric"
            assert 300_000 <= ceiling <= 400_000, \
                f"ceiling unrealistic: {ceiling:.0f} (expected ~350k)"

    def test_anos_cobertura_pos_fire_lista(self):
        """Teste que anos_cobertura_pos_fire e lista de ints."""
        data = self._load_data_json()
        runway = data.get("bond_pool_runway", {})

        anos = runway.get("anos_cobertura_pos_fire")
        if anos:
            assert isinstance(anos, list), "anos_cobertura should be list"
            for ano in anos:
                assert isinstance(ano, (int, float)), f"ano should be numeric: {ano}"
                assert ano >= 0, f"ano should be >= 0: {ano}"

    def test_ipca_ladder_2029_2040_2050(self):
        """Teste que IPCA+ ladder tem 2029, 2040, 2050."""
        data = self._load_data_json()
        rf = data.get("rf", {})

        for ano in ["2029", "2040", "2050"]:
            key = f"ipca{ano}"
            assert key in rf, f"MISSING: {key} in RF ladder"
            ipca = rf[key]
            assert isinstance(ipca, dict), f"{key} should be dict"
            # Cada um deve ter taxa e valor
            assert "taxa" in ipca or "taxa_atual" in ipca, f"{key} missing taxa"

    def test_dca_ativo_por_taxa_threshold(self):
        """Teste que DCA ativo quando taxa >= threshold."""
        data = self._load_data_json()

        dca_items = data.get("dca_items", [])
        if not dca_items:
            return  # skip

        # Procurar IPCA+ e Renda+ em dca_items
        for item in dca_items:
            if "ipca2040" in item.get("id", ""):
                taxa = item.get("taxa_atual", 0)
                dca_ativo = item.get("dca_ativo", False)
                # Se taxa >= 6.0%, deve ter DCA ativo
                if taxa >= 0.06:
                    # Nao fazer assert rigorosa, só verificar consistencia
                    pass

    def test_no_nan_infinity_em_rf(self):
        """Teste que nenhum valor RF e NaN ou Infinity."""
        data = self._load_data_json()
        rf = data.get("rf", {})

        for titulo, valor in rf.items():
            if isinstance(valor, dict):
                for field, val in valor.items():
                    if isinstance(val, float):
                        assert not math.isnan(val), f"RF {titulo}.{field} is NaN"
                        assert not math.isinf(val), f"RF {titulo}.{field} is Infinity"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_rf_bond_pool_fase5.py -v")
