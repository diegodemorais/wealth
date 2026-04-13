"""
Dashboard Test Framework
Format: GIVEN/WHEN/THEN/SEVERITY
Categories: DATA | RENDER | VALUE | PRIVACY | SPEC
Severities: CRITICAL | HIGH | MEDIUM
"""

import json
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

ROOT = Path(__file__).parent.parent.parent
DATA_JSON = ROOT / "dashboard" / "data.json"
INDEX_HTML = ROOT / "dashboard" / "index.html"
SPEC_JSON = ROOT / "dashboard" / "spec.json"
BUILD_PY = ROOT / "scripts" / "build_dashboard.py"

_DATA = None
_HTML = None
_SPEC = None


def load_data() -> dict:
    global _DATA
    if _DATA is None:
        with open(DATA_JSON) as f:
            _DATA = json.load(f)
    return _DATA


def load_html() -> str:
    global _HTML
    if _HTML is None:
        with open(INDEX_HTML) as f:
            _HTML = f.read()
    return _HTML


def load_spec() -> dict:
    global _SPEC
    if _SPEC is None:
        with open(SPEC_JSON) as f:
            _SPEC = json.load(f)
    return _SPEC


def get_nested(d: dict, path: str):
    """Access nested dict value with dot notation. Returns None if missing."""
    keys = path.split(".")
    val = d
    for k in keys:
        if not isinstance(val, dict):
            return None
        val = val.get(k)
    return val


def validate_required_fields(obj: dict, required_fields: list) -> tuple:
    """
    Valida que campos required existem E têm valores não-None.

    Retorna: (is_valid, missing_keys_list, none_values_dict)
    """
    missing_keys = [k for k in required_fields if k not in obj]
    none_values = {k: obj.get(k) for k in required_fields if k in obj and obj.get(k) is None}
    is_valid = len(missing_keys) == 0 and len(none_values) == 0
    return is_valid, missing_keys, none_values


def get_provenance(field_name: str) -> dict:
    """
    Retorna provenance (origem/fórmula/entrada) de um field em data.json.

    Exemplo:
        prov = get_provenance("concentracao_brasil.brasil_pct")
        # Retorna:
        # {
        #   "source_file": "scripts/generate_data.py",
        #   "source_line": 1519,
        #   "formula": "(hodl11_brl + rf_total_brl + ...) / total_brl * 100",
        #   "input_fields": [...],
        #   "last_updated": "2026-04-13T..."
        # }
    """
    data = load_data()
    provenance_map = data.get("_provenance", {})
    return provenance_map.get(field_name, {})


def format_provenance_msg(field_name: str, value=None) -> str:
    """Formata mensagem de provenance para exibir em teste falho."""
    prov = get_provenance(field_name)
    if not prov:
        return ""

    lines = [f"  Origem: {prov.get('source_file', '?')}"]
    if prov.get('source_line'):
        lines[0] += f":{prov['source_line']}"

    if prov.get('formula'):
        lines.append(f"  Fórmula: {prov['formula']}")

    if prov.get('reason'):
        lines.append(f"  Razão: {prov['reason']}")

    if prov.get('input_fields'):
        inputs = prov['input_fields'][:3]  # Mostrar primeiros 3
        lines.append(f"  Entrada: {', '.join(inputs)}")

    return "\n".join(lines)


@dataclass
class TestResult:
    test_id: str
    category: str
    description: str
    severity: str
    passed: bool
    message: str = ""
    block_id: str = ""


class TestRegistry:
    def __init__(self):
        self.results: list[TestResult] = []

    def test(self, block_id: str, category: str, description: str, severity: str):
        """Decorator for test functions. Function must return (bool, str) -> (passed, message)."""
        def decorator(fn):
            try:
                passed, message = fn()
            except Exception as e:
                passed, message = False, f"Exception: {e}"
            test_id = f"{block_id}::{category}::{description}"
            self.results.append(TestResult(
                test_id=test_id,
                category=category,
                description=description,
                severity=severity,
                passed=passed,
                message=message,
                block_id=block_id,
            ))
            return fn
        return decorator

    def run_module(self, module_name: str) -> list[TestResult]:
        return [r for r in self.results]


# Global registry shared across all test modules
registry = TestRegistry()
