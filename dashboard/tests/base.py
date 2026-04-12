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
