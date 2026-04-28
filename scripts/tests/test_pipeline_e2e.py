"""
test_pipeline_e2e.py — Valida output do pipeline contra spec contract.

Testa que data.json existe, é JSON válido, e passa o spec contract completo
(todos os campos obrigatórios de spec.json são não-nulos).

Rodada:
    cd /Users/diegodemorais/claude/code/wealth
    python -m pytest scripts/tests/test_pipeline_e2e.py -v
ou via:
    ./scripts/quick_dashboard_test.sh
"""

import json
import pathlib

ROOT = pathlib.Path(__file__).parent.parent.parent  # wealth/
DATA_JSON_PATH = ROOT / "react-app" / "public" / "data.json"
SPEC_JSON_PATH = ROOT / "dashboard" / "spec.json"


def _resolve(obj: dict, path: str):
    cur = obj
    for part in path.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
        if cur is None:
            return None
    return cur


class TestPipelineE2E:
    def test_data_json_exists(self):
        assert DATA_JSON_PATH.exists(), f"data.json não encontrado: {DATA_JSON_PATH}"

    def test_data_json_is_valid(self):
        content = DATA_JSON_PATH.read_text()
        data = json.loads(content)
        assert isinstance(data, dict), "data.json deve ser um objeto JSON"

    def test_data_json_has_generated_timestamp(self):
        data = json.loads(DATA_JSON_PATH.read_text())
        generated = data.get("_generated") or data.get("_generated_brt")
        assert generated is not None, "data.json deve ter campo _generated"
        assert len(generated) >= 10, "_generated deve ser um timestamp ISO"

    def test_spec_contract_all_required_fields(self):
        """Todos os campos obrigatórios do spec.json devem ser não-nulos em data.json."""
        data = json.loads(DATA_JSON_PATH.read_text())
        spec = json.loads(SPEC_JSON_PATH.read_text())

        errors: list[str] = []
        for block in spec.get("blocks", []):
            if block.get("optional", False):
                continue
            for field in block.get("data_fields", []):
                if _resolve(data, field) is None:
                    errors.append(f"[{block['tab']:12s}] {block['label'][:40]:40s} → {field}")

        assert not errors, (
            f"\n❌ SPEC CONTRACT: {len(errors)} campo(s) obrigatório(s) nulo(s):\n"
            + "\n".join(f"  {e}" for e in errors)
        )

    def test_spec_contract_coverage(self):
        """Ao menos 90% dos campos devem estar presentes (sanidade geral)."""
        data = json.loads(DATA_JSON_PATH.read_text())
        spec = json.loads(SPEC_JSON_PATH.read_text())

        total, ok = 0, 0
        for block in spec.get("blocks", []):
            for field in block.get("data_fields", []):
                total += 1
                if _resolve(data, field) is not None:
                    ok += 1

        coverage = ok / total if total > 0 else 0
        assert coverage >= 0.90, (
            f"Cobertura do spec: {ok}/{total} ({coverage:.0%}) — esperado ≥90%"
        )

    def test_critical_financial_fields(self):
        """Campos críticos para exibição financeira não podem ser nulos."""
        data = json.loads(DATA_JSON_PATH.read_text())

        critical = [
            ("premissas.patrimonio_atual", "patrimônio atual"),
            ("premissas.custo_vida_base", "custo de vida base"),
            ("pfire_base.base", "P(FIRE) base"),
            ("drift", "drift ETFs"),
        ]

        for field_path, label in critical:
            val = _resolve(data, field_path)
            assert val is not None, f"Campo crítico nulo: {label} ({field_path})"
