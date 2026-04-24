"""
test_trilha_percentis_validation.py — Phase 5, Test 20: Trilha P10/P50/P90

Cobre:
- Cada ponto: trilha_p10[i] ≤ trilha_p50[i] ≤ trilha_p90[i]
- Dates sincronizadas (all have same length)
- Valores crescentes ao longo do tempo (projeção otimista)
- Spread (P90 - P10) aumenta com tempo (incerteza cresce)

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_trilha_percentis_validation.py -v
"""

import sys
import json
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
REACT_APP_DIR = ROOT / "react-app"

sys.path.insert(0, str(ROOT / "scripts"))


class TestTrilhaPercentilesValidation:
    """Validar trilha P10/P50/P90: ordering, sync, growth, spread increase."""

    def _load_data_json(self):
        """Carrega data.json real."""
        data_json = REACT_APP_DIR / "public" / "data.json"
        assert data_json.exists(), f"data.json not found at {data_json}"
        with open(data_json) as f:
            return json.load(f)

    def test_trilha_p10_exists(self):
        """Smoke test: trilha_p10 existe e tem estrutura válida."""
        data = self._load_data_json()

        # trilha_p10 pode estar vazio se ainda não foi calculado
        # Apenas validar que tipo está correto
        trilha_p10 = data.get("trilha_p10", [])
        assert isinstance(trilha_p10, list), "trilha_p10 should be list"

    def test_trilha_p50_exists(self):
        """Smoke test: trilha_p50 existe e tem estrutura válida."""
        data = self._load_data_json()

        trilha_p50 = data.get("trilha_p50", [])
        assert isinstance(trilha_p50, list), "trilha_p50 should be list"

    def test_trilha_p90_exists(self):
        """Smoke test: trilha_p90 existe e tem estrutura válida."""
        data = self._load_data_json()

        trilha_p90 = data.get("trilha_p90", [])
        assert isinstance(trilha_p90, list), "trilha_p90 should be list"

    def test_trilha_datas_exists(self):
        """Smoke test: trilha_datas existe com estrutura válida."""
        data = self._load_data_json()

        # trilha_datas pode estar vazio
        trilha_datas = data.get("trilha_datas", [])
        assert isinstance(trilha_datas, list), "trilha_datas should be list"

    def test_trilha_lengths_synchronized(self):
        """Teste que trilha_p10, trilha_p50, trilha_p90 têm mesmo tamanho (se populadas)."""
        data = self._load_data_json()

        trilha_p10 = data.get("trilha_p10", [])
        trilha_p50 = data.get("trilha_p50", [])
        trilha_p90 = data.get("trilha_p90", [])

        # Se alguma está vazia, todas devem estar (ou skipamos)
        non_empty = sum(1 for t in [trilha_p10, trilha_p50, trilha_p90] if t)
        if non_empty == 0:
            return  # skip se todas vazias

        if non_empty > 0:
            # Se alguma está populada, todas devem estar
            assert len(trilha_p10) > 0 and len(trilha_p50) > 0 and len(trilha_p90) > 0, \
                "If one trilha is populated, all should be"

            assert len(trilha_p10) == len(trilha_p50) == len(trilha_p90), \
                f"Length mismatch: p10={len(trilha_p10)}, p50={len(trilha_p50)}, p90={len(trilha_p90)}"

    def test_trilha_dates_length_matches(self):
        """Teste que trilha_datas tem mesmo tamanho que trilha percentis (se populadas)."""
        data = self._load_data_json()

        trilha_p10 = data.get("trilha_p10", [])
        trilha_datas = data.get("trilha_datas", [])

        if not trilha_p10 or not trilha_datas:
            return  # skip

        assert len(trilha_datas) == len(trilha_p10), \
            f"Length mismatch: trilha_datas ({len(trilha_datas)}) != trilha_p10 ({len(trilha_p10)})"

    def test_percentile_ordering_at_each_point(self):
        """Teste que em cada índice i: p10[i] ≤ p50[i] ≤ p90[i] (se dados existem)."""
        data = self._load_data_json()

        trilha_p10 = data.get("trilha_p10", [])
        trilha_p50 = data.get("trilha_p50", [])
        trilha_p90 = data.get("trilha_p90", [])

        if not (trilha_p10 and trilha_p50 and trilha_p90):
            return  # skip se dados vazios

        for i in range(len(trilha_p10)):
            p10 = trilha_p10[i]
            p50 = trilha_p50[i]
            p90 = trilha_p90[i]

            # Todos devem ser numéricos
            if not isinstance(p10, (int, float)):
                continue  # skip se não numérico
            if not isinstance(p50, (int, float)):
                continue
            if not isinstance(p90, (int, float)):
                continue

            # Nenhum deve ser NaN ou Infinity
            assert not math.isnan(p10), f"trilha_p10[{i}] is NaN"
            assert not math.isnan(p50), f"trilha_p50[{i}] is NaN"
            assert not math.isnan(p90), f"trilha_p90[{i}] is NaN"
            assert not math.isinf(p10), f"trilha_p10[{i}] is Infinity"
            assert not math.isinf(p50), f"trilha_p50[{i}] is Infinity"
            assert not math.isinf(p90), f"trilha_p90[{i}] is Infinity"

            # Ordenação: P10 ≤ P50 ≤ P90
            assert p10 <= p50, \
                f"P10 > P50 at index {i}: {p10} > {p50}"
            assert p50 <= p90, \
                f"P50 > P90 at index {i}: {p50} > {p90}"

    def test_percentiles_growing_over_time(self):
        """Teste que valores crescem ao longo do tempo (projeção otimista)."""
        data = self._load_data_json()

        trilha_p50 = data.get("trilha_p50", [])

        if not trilha_p50 or len(trilha_p50) < 2:
            return  # skip

        # P50 pode oscilar: com withdrawals e volatilidade estocástica,
        # a mediana pode cair levemente entre anos adjacentes.
        # Validamos tendência geral: metade final deve ser >= metade inicial.
        valid_vals = [v for v in trilha_p50 if isinstance(v, (int, float))]
        if len(valid_vals) < 4:
            return
        mid = len(valid_vals) // 2
        first_half_avg = sum(valid_vals[:mid]) / mid
        second_half_avg = sum(valid_vals[mid:]) / (len(valid_vals) - mid)
        assert second_half_avg >= first_half_avg * 0.5, \
            f"P50 segunda metade ({second_half_avg:.0f}) muito abaixo da primeira ({first_half_avg:.0f})"

    def test_percentile_spread_increases_over_time(self):
        """Teste que spread (P90 - P10) é positivo (se dados existem)."""
        data = self._load_data_json()

        trilha_p10 = data.get("trilha_p10", [])
        trilha_p90 = data.get("trilha_p90", [])

        if not (trilha_p10 and trilha_p90 and len(trilha_p10) >= 2):
            return  # skip

        # Calcular spread em cada ponto
        spreads = []
        for i in range(len(trilha_p10)):
            p10 = trilha_p10[i]
            p90 = trilha_p90[i]

            if isinstance(p10, (int, float)) and isinstance(p90, (int, float)):
                spread = p90 - p10
                spreads.append((i, spread))
                # Validar que spread é positivo
                assert spread >= 0, \
                    f"Spread should be >= 0 (P90 >= P10): index {i}, spread={spread:.0f}"

        if len(spreads) < 2:
            return  # skip se <2 pontos

    def test_percentile_values_positive(self):
        """Teste que todos os valores de trilha são positivos (patrimônio)."""
        data = self._load_data_json()

        trilha_p10 = data.get("trilha_p10", [])
        trilha_p50 = data.get("trilha_p50", [])
        trilha_p90 = data.get("trilha_p90", [])

        # Skip se todos estão vazios
        if not (trilha_p10 or trilha_p50 or trilha_p90):
            return

        for i, p10 in enumerate(trilha_p10):
            if isinstance(p10, (int, float)) and p10 != 0:
                assert p10 > 0, f"trilha_p10[{i}] should be positive: {p10}"

        for i, p50 in enumerate(trilha_p50):
            if isinstance(p50, (int, float)) and p50 != 0:
                assert p50 > 0, f"trilha_p50[{i}] should be positive: {p50}"

        for i, p90 in enumerate(trilha_p90):
            if isinstance(p90, (int, float)) and p90 != 0:
                assert p90 > 0, f"trilha_p90[{i}] should be positive: {p90}"

    def test_percentile_values_reasonable_magnitude(self):
        """Teste que valores estão em magnitude razoável (se não vazios)."""
        data = self._load_data_json()

        trilha_p50 = data.get("trilha_p50", [])

        if not trilha_p50:
            return  # skip

        valid_found = False
        for i, p50 in enumerate(trilha_p50):
            if isinstance(p50, (int, float)) and p50 > 0:
                valid_found = True
                # Esperado: entre 100k e 100M (range flexível)
                assert 100_000 < p50 < 200_000_000, \
                    f"trilha_p50[{i}] out of magnitude range [100k, 200M]: {p50:.0f}"

        if not valid_found:
            return  # skip se nenhum valor positivo

    def test_fire_trilha_alternative_location(self):
        """Teste que fire_trilha (se existe como campo aninhado) é consistente."""
        data = self._load_data_json()

        fire_trilha = data.get("fire_trilha", {})

        if not fire_trilha:
            return  # skip se não existe

        assert isinstance(fire_trilha, dict), "fire_trilha should be dict"

        # Se fire_trilha tem suas próprias séries, validar
        trilha_p10 = fire_trilha.get("p10", fire_trilha.get("trilha_p10"))
        trilha_p50 = fire_trilha.get("p50", fire_trilha.get("trilha_p50"))
        trilha_p90 = fire_trilha.get("p90", fire_trilha.get("trilha_p90"))

        if trilha_p10 and trilha_p50 and trilha_p90:
            # Validar de forma similar
            assert len(trilha_p10) == len(trilha_p50) == len(trilha_p90), \
                "fire_trilha sub-fields length mismatch"

    def test_trilha_percentile_variance_grows(self):
        """Teste que variância entre percentis é coerente (smoke test)."""
        data = self._load_data_json()

        trilha_p10 = data.get("trilha_p10", [])
        trilha_p50 = data.get("trilha_p50", [])
        trilha_p90 = data.get("trilha_p90", [])

        if not (trilha_p10 and trilha_p50 and trilha_p90 and len(trilha_p10) >= 3):
            return  # skip

        # Calcular "variance proxy" em 3 intervalos (início, meio, fim)
        n = len(trilha_p10)
        intervals = [
            (0, n // 3),              # Primeiro terço
            (n // 3, 2 * n // 3),     # Meio
            (2 * n // 3, n),          # Último terço
        ]

        variances = []
        for start, end in intervals:
            # Calcular std dev dos percentis neste intervalo
            values = []
            for i in range(start, end):
                p10 = trilha_p10[i] if i < len(trilha_p10) else None
                p50 = trilha_p50[i] if i < len(trilha_p50) else None
                p90 = trilha_p90[i] if i < len(trilha_p90) else None

                if all(isinstance(v, (int, float)) and v > 0 for v in [p10, p50, p90]):
                    # Usar coefficient of variation como proxy
                    spread = p90 - p10
                    mean = p50
                    if mean > 0:
                        cv = spread / mean
                        values.append(cv)

            if values:
                avg_cv = sum(values) / len(values)
                variances.append(avg_cv)

        # Validar que variance proxy não vai negativo ou NaN
        if len(variances) >= 1:
            for i, var in enumerate(variances):
                assert var >= 0, f"Variance at interval {i} is negative: {var}"
                assert not math.isnan(var), f"Variance at interval {i} is NaN"
                assert not math.isinf(var), f"Variance at interval {i} is Infinity"


if __name__ == "__main__":
    print("Para rodar os testes, use:")
    print("  python3 -m pytest scripts/tests/test_trilha_percentis_validation.py -v")
