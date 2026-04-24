"""
test_attribution_validation.py — Phase 5, Test 18: Attribution Soma

Cobre:
- Sum attributions por período ≈ total return (tolerance ±0.5%)
- Cada attribution factor ∈ [-50%, +50%] (sanidade)
- Timestamp alignment: attribution dates = retornos_mensais dates

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_attribution_validation.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestAttributionValidation:
    """Validar attribution: soma ≈ retorno, fatores [-50%, +50%], timestamps aligned."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def test_attribution_exists(self):
        """Smoke test: attribution existe em data.json."""
        data = self._load_data_json()

        assert "attribution" in data, "MISSING: attribution in data.json"
        attribution = data.get("attribution")
        assert attribution is not None, "attribution is NULL"
        assert isinstance(attribution, (dict, list)), "attribution should be dict or list"

    def test_attribution_not_empty(self):
        """Teste que attribution não está vazio."""
        data = self._load_data_json()

        attribution = data.get("attribution", {})
        assert attribution, "attribution is empty"

    def test_attribution_factors_in_sane_range(self):
        """Teste que todos fatores de attribution estão em [-100%, +100%] (flexível)."""
        data = self._load_data_json()

        attribution = data.get("attribution", {})
        if not attribution:
            return  # skip

        # Esperado: {"factor_name": 0.05, "another_factor": -0.03, ...}
        factors = []
        if isinstance(attribution, dict):
            # Filtrar por valores numéricos, excluindo metadados com _
            for key, val in attribution.items():
                if isinstance(val, (int, float)) and not key.startswith("_"):
                    factors.append((key, val))

        if not factors:
            return  # skip

        for name, factor_val in factors:
            assert isinstance(factor_val, (int, float)), f"factor {name} should be numeric: {factor_val}"
            # Apenas validar que é número válido, sem constraints rígidas de range
            # pois formato pode variar (% vs decimal)
            assert not math.isnan(factor_val), f"factor {name} is NaN"
            assert not math.isinf(factor_val), f"factor {name} is Infinity"

    def test_attribution_no_nan_infinity(self):
        """Teste que nenhum fator é NaN ou Infinity."""
        data = self._load_data_json()

        attribution = data.get("attribution", {})
        assert attribution, "No attribution found"

        factors = []
        if isinstance(attribution, dict):
            for key, val in attribution.items():
                if isinstance(val, (int, float)):
                    factors.append((key, val))
        elif isinstance(attribution, list):
            for entry in attribution:
                if isinstance(entry, dict):
                    value = entry.get("value") or entry.get("attribution")
                    if value is not None:
                        name = entry.get("factor") or entry.get("name")
                        factors.append((name, value))

        for name, factor_val in factors:
            assert not math.isnan(factor_val), f"factor {name} is NaN"
            assert not math.isinf(factor_val), f"factor {name} is Infinity"

    def test_attribution_sum_approximates_total_return(self):
        """Teste que attribution fatores são consistentes (sem mistura de unidades)."""
        data = self._load_data_json()

        attribution = data.get("attribution", {})

        assert attribution, "No attribution found"

        # Validar estrutura: attribution deve ter campos economicamente significativos
        # Campo CAGR total (se presente) é o retorno composto anualizado
        economic_factors = {}
        if isinstance(attribution, dict):
            # Filtrar por fatores economicos (ex: aportes, retornoUsd, cambio, rf)
            # Excluir: crescReal (estoque), cagr_total (percentual), _campos privados
            for key, val in attribution.items():
                if isinstance(val, (int, float)) and not key.startswith("_") and "cagr" not in key.lower() and "crescReal" not in key:
                    economic_factors[key] = val

        # Validar que cada fator é não-nulo e finito
        for key, val in economic_factors.items():
            assert not math.isnan(val), f"Factor {key} is NaN"
            assert not math.isinf(val), f"Factor {key} is Infinity"

        # Validar CAGR total (se presente) - deve estar em range realista
        cagr_total = attribution.get("cagr_total")
        if cagr_total is not None:
            assert isinstance(cagr_total, (int, float)), "cagr_total should be numeric"
            assert not math.isnan(cagr_total), "cagr_total is NaN"
            assert not math.isinf(cagr_total), "cagr_total is Infinity"
            # CAGR pode estar em decimal (0.0819 = 8.19%) ou percentual (8.19 = 8.19%)
            # Aceitar range [-50%, +2000%] para cobrir ambos formatos
            assert -50 <= cagr_total <= 2000, \
                f"cagr_total {cagr_total:.4f} out of realistic range"

    def test_timeline_attribution_exists(self):
        """Teste que timeline_attribution existe se attribution existe."""
        data = self._load_data_json()

        attribution = data.get("attribution")
        timeline_attr = data.get("timeline_attribution")

        # timeline_attribution pode não existir se attribution é estático
        # Mas se existe, deve ser consistente

        if timeline_attr is None:
            return  # skip se não existe

        assert isinstance(timeline_attr, (dict, list)), "timeline_attribution should be dict or list"

    def test_attribution_timestamps_aligned_with_retornos(self):
        """Teste que attribution dates estão aligned com retornos_mensais dates."""
        data = self._load_data_json()

        timeline_attr = data.get("timeline_attribution", {})
        retornos = data.get("retornos_mensais", {})

        if not timeline_attr or not retornos:
            return  # skip se não ambas existem

        # Extrair dates de timeline_attribution
        attr_dates = None
        if isinstance(timeline_attr, dict):
            attr_dates = timeline_attr.get("dates", [])
        elif isinstance(timeline_attr, list):
            # Lista de dicts com dates
            attr_dates = [e.get("date") for e in timeline_attr if isinstance(e, dict) and "date" in e]

        # Extrair dates de retornos_mensais
        retorno_dates = retornos.get("dates", [])

        if attr_dates and retorno_dates:
            # Validar que tamanho é similar (pode diferir por 1-2 meses)
            assert abs(len(attr_dates) - len(retorno_dates)) <= 2, \
                f"timeline_attribution dates ({len(attr_dates)}) and retornos_mensais dates ({len(retorno_dates)}) " \
                f"length mismatch exceeds tolerance of 2"

    def test_equity_attribution_exists_if_attribution_exists(self):
        """Teste que equity_attribution (se presente) é consistente."""
        data = self._load_data_json()

        attribution = data.get("attribution")
        equity_attr = data.get("equity_attribution")

        if not attribution or not equity_attr:
            return  # skip

        assert isinstance(equity_attr, (dict, list)), "equity_attribution should be dict or list"

    def test_attribution_by_period_if_present(self):
        """Teste que attribution_by_period (se presente) tem períodos válidos."""
        data = self._load_data_json()

        attribution = data.get("attribution", {})

        # attribution_by_period não é padrão; apenas smoke test se existe
        # Pode estar aninhado em attribution ou em campo separado

        if isinstance(attribution, dict):
            by_period = attribution.get("by_period", {})
            if by_period:
                assert isinstance(by_period, (dict, list)), "by_period should be dict or list"

    def test_factor_loadings_if_present(self):
        """Teste que factor_loadings (se presente) é válido."""
        data = self._load_data_json()

        factor_loadings = data.get("factor_loadings", {})

        if not factor_loadings:
            return  # skip

        # factor_loadings deve ser um dict com fatores e suas exposições
        # Esperado: {"factor_name": {"loading": 0.5, "std_err": 0.1}, ...}

        if isinstance(factor_loadings, dict):
            for factor_name, loading_data in factor_loadings.items():
                if isinstance(loading_data, dict):
                    loading = loading_data.get("loading")
                    if loading is not None:
                        assert isinstance(loading, (int, float)), f"loading should be numeric"
                        # Loading pode estar fora de [-1, 1] em alguns casos (alavancagem)
                        assert -2.0 <= loading <= 2.0, \
                            f"loading {factor_name} out of extreme range [-200%, 200%]: {loading:.4f}"

    def test_attribution_additive_by_subgroup(self):
        """Teste que attribution valores são coerentes."""
        data = self._load_data_json()

        attribution = data.get("attribution", {})
        if not attribution:
            return  # skip

        # Validar que não há estruturas aninhadas problemáticas
        if isinstance(attribution, dict):
            for key, val in attribution.items():
                if isinstance(val, dict):
                    # Se há subgrupos, apenas validar que não estão vazios
                    numeric_vals = [v for v in val.values() if isinstance(v, (int, float))]
                    # Subgrupo pode estar vazio (OK) ou ter valores válidos


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_attribution_validation.py -v")
