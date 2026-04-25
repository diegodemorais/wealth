"""
test_mc_liquido.py — Smoke test: run_canonical_mc_with_ir_discount

Cobre:
- Função executa sem erros com IR diferido de referência (R$133k)
- patrimonio_liquido = patrimonio_bruto - ir_diferido (exato)
- pfire_liquido < pfire_bruto (IR diferido reduz P(FIRE))
- delta_pp negativo e dentro da faixa esperada (-1pp a -8pp)
- Schema completo: todos os campos obrigatórios presentes
- Reprodutibilidade: seed=42 idêntico em duas chamadas

Rodada:
    cd /home/user/wealth
    python3 -m pytest scripts/tests/test_mc_liquido.py -v
"""

import sys
import math
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
sys.path.insert(0, str(ROOT / "scripts"))


REQUIRED_FIELDS = {
    "patrimonio_bruto",
    "ir_diferido",
    "patrimonio_liquido",
    "pfire_bruto",
    "pfire_liquido",
    "delta_pp",
    "pat_mediana_fire_bruto",
    "pat_mediana_fire_liquido",
    "n_sim",
    "seed",
    "cenario",
    "metodologia",
    "_generated",
}

# IR diferido de referência (tax_snapshot.json, 2026-04-22)
IR_DIFERIDO_REF = 133_075.41

# Tolerância numérica para floating point
EPS = 1.0  # R$1 — tolerância para arredondamento BRL


class TestMCLiquido:
    """Testa run_canonical_mc_with_ir_discount com n_sim=500 (smoke, rápido)."""

    def _get_result(self, ir_diferido=IR_DIFERIDO_REF, n_sim=500, seed=42):
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "fire_mc", ROOT / "scripts" / "fire_montecarlo.py"
        )
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod.run_canonical_mc_with_ir_discount(
            ir_diferido=ir_diferido, n_sim=n_sim, seed=seed
        )

    def test_executa_sem_erro(self):
        """Smoke: função retorna sem exceção."""
        result = self._get_result()
        assert result is not None

    def test_schema_completo(self):
        """Todos os campos obrigatórios presentes no resultado."""
        result = self._get_result()
        missing = REQUIRED_FIELDS - set(result.keys())
        assert not missing, f"Campos ausentes: {missing}"

    def test_patrimonio_liquido_formula(self):
        """patrimonio_liquido = patrimonio_bruto - ir_diferido (dentro de R$1 de tolerância)."""
        result = self._get_result()
        esperado = result["patrimonio_bruto"] - result["ir_diferido"]
        assert abs(result["patrimonio_liquido"] - esperado) <= EPS, (
            f"patrimonio_liquido={result['patrimonio_liquido']:.2f} != "
            f"patrimonio_bruto({result['patrimonio_bruto']:.2f}) - "
            f"ir_diferido({result['ir_diferido']:.2f}) = {esperado:.2f}"
        )

    def test_ir_diferido_passado_corretamente(self):
        """ir_diferido no resultado bate com o valor passado."""
        result = self._get_result(ir_diferido=IR_DIFERIDO_REF)
        assert abs(result["ir_diferido"] - IR_DIFERIDO_REF) <= EPS

    def test_pfire_liquido_menor_que_bruto(self):
        """Descontar IR diferido deve reduzir P(FIRE): pfire_liquido <= pfire_bruto."""
        result = self._get_result()
        assert result["pfire_liquido"] <= result["pfire_bruto"], (
            f"Esperado pfire_liquido({result['pfire_liquido']}) <= "
            f"pfire_bruto({result['pfire_bruto']})"
        )

    def test_delta_pp_negativo_ou_zero(self):
        """delta_pp deve ser <= 0 (IR diferido reduz patrimônio inicial)."""
        result = self._get_result()
        assert result["delta_pp"] <= 0, f"delta_pp={result['delta_pp']} > 0"

    def test_delta_pp_faixa_plausivel(self):
        """delta_pp com IR diferido R$133k deve estar entre -8pp e -0.5pp.

        Faixa derivada: patrimônio R$3.47M, IR diferido R$133k = 3.8% do patrimônio.
        P(FIRE) é função convexa do patrimônio inicial; delta moderado esperado.
        """
        result = self._get_result()
        assert -8.0 <= result["delta_pp"] <= -0.5, (
            f"delta_pp={result['delta_pp']} fora da faixa plausível [-8pp, -0.5pp]. "
            "Verificar se patrimônio ou IR diferido estão corretos."
        )

    def test_pfire_valores_em_range_valido(self):
        """P(FIRE) bruto e líquido devem estar em [0, 100]."""
        result = self._get_result()
        for key in ("pfire_bruto", "pfire_liquido"):
            assert 0.0 <= result[key] <= 100.0, f"{key}={result[key]} fora de [0,100]"

    def test_sem_nan_ou_inf(self):
        """Nenhum campo numérico deve ser NaN ou infinito."""
        result = self._get_result()
        numeric_fields = [
            "patrimonio_bruto", "ir_diferido", "patrimonio_liquido",
            "pfire_bruto", "pfire_liquido", "delta_pp",
            "pat_mediana_fire_bruto", "pat_mediana_fire_liquido",
        ]
        for field in numeric_fields:
            val = result[field]
            assert not math.isnan(val), f"{field} é NaN"
            assert not math.isinf(val), f"{field} é Inf"

    def test_cenario_e_base(self):
        """cenario deve ser 'base' (MC canônico padrão)."""
        result = self._get_result()
        assert result["cenario"] == "base"

    def test_n_sim_seed_preservados(self):
        """n_sim e seed no resultado devem bater com os passados."""
        result = self._get_result(n_sim=500, seed=42)
        assert result["n_sim"] == 500
        assert result["seed"] == 42

    def test_metodologia_menciona_lei(self):
        """Campo metodologia deve referenciar Lei 14.754/2023."""
        result = self._get_result()
        assert "14.754" in result["metodologia"], (
            "metodologia não menciona Lei 14.754/2023"
        )

    def test_reproducibilidade(self):
        """Dois runs com mesmo seed devem produzir resultados idênticos."""
        r1 = self._get_result(n_sim=200, seed=99)
        r2 = self._get_result(n_sim=200, seed=99)
        assert r1["pfire_bruto"]   == r2["pfire_bruto"],   "pfire_bruto não reproduzível"
        assert r1["pfire_liquido"] == r2["pfire_liquido"], "pfire_liquido não reproduzível"
        assert r1["delta_pp"]      == r2["delta_pp"],      "delta_pp não reproduzível"

    def test_pat_mediana_liquido_menor_que_bruto(self):
        """Patrimônio mediano no FIRE Day líquido <= bruto (parte do impacto)."""
        result = self._get_result()
        assert result["pat_mediana_fire_liquido"] <= result["pat_mediana_fire_bruto"], (
            "pat_mediana_fire_liquido deveria ser <= pat_mediana_fire_bruto"
        )

    def test_ir_diferido_zero_nao_altera_pfire(self):
        """Com ir_diferido=0, pfire_liquido deve ser idêntico a pfire_bruto."""
        result = self._get_result(ir_diferido=0.0)
        assert result["delta_pp"] == 0.0, (
            f"Com ir_diferido=0, delta_pp deveria ser 0, mas é {result['delta_pp']}"
        )
        assert result["patrimonio_liquido"] == result["patrimonio_bruto"]
