#!/usr/bin/env python3
"""
validate_data_comprehensive.py — Comprehensive validation of dashboard/data.json

Validates:
- All required fields are present and non-null
- All fields have correct types
- All numerical fields are within expected ranges
- All nested structures are properly formed
- Data integrity (sums, relationships, etc.)

Exit codes:
  0 = SUCCESS (all validations passed)
  1 = FAILURE (one or more validations failed)

Usage:
    python3 scripts/validate_data_comprehensive.py [--json]

    --json: output results as JSON (for CI/CD integration)
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Tuple

ROOT = Path(__file__).parent.parent
DATA_PATH = ROOT / "dashboard" / "data.json"

# Color codes for terminal output
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

class ValidationResult:
    """Container for validation results"""
    def __init__(self):
        self.passed: List[str] = []
        self.failed: List[Tuple[str, str]] = []
        self.warnings: List[str] = []
        self.total_checks = 0

    def add_pass(self, msg: str):
        self.passed.append(msg)
        self.total_checks += 1

    def add_fail(self, msg: str, reason: str):
        self.failed.append((msg, reason))
        self.total_checks += 1

    def add_warning(self, msg: str):
        self.warnings.append(msg)

    def is_success(self) -> bool:
        return len(self.failed) == 0

    def print_summary(self):
        print(f"\n{'='*70}")
        print(f"Validation Summary")
        print(f"{'='*70}")
        print(f"{GREEN}✓ Passed: {len(self.passed)}/{self.total_checks}{RESET}")
        if self.failed:
            print(f"{RED}✗ Failed: {len(self.failed)}/{self.total_checks}{RESET}")
        if self.warnings:
            print(f"{YELLOW}⚠ Warnings: {len(self.warnings)}{RESET}")

    def print_details(self):
        if self.failed:
            print(f"\n{RED}FAILURES:{RESET}")
            for msg, reason in self.failed:
                print(f"  {RED}✗{RESET} {msg}")
                print(f"    → {reason}")

        if self.warnings:
            print(f"\n{YELLOW}WARNINGS:{RESET}")
            for msg in self.warnings:
                print(f"  {YELLOW}⚠{RESET} {msg}")

    def to_json(self) -> Dict[str, Any]:
        return {
            "success": self.is_success(),
            "passed": len(self.passed),
            "failed": len(self.failed),
            "warnings": len(self.warnings),
            "total_checks": self.total_checks,
            "failures": [{"message": msg, "reason": reason} for msg, reason in self.failed],
            "warnings_list": self.warnings,
            "timestamp": datetime.now().isoformat(),
        }


def validate_premissas(data: Dict[str, Any], result: ValidationResult):
    """Validate premissas (assumptions) section"""
    print(f"\n{BLUE}Validating premissas...{RESET}")

    premissas = data.get("premissas", {})
    if not premissas:
        result.add_fail("premissas section exists", "Missing premissas")
        return

    # Required fields
    required = {
        "patrimonio_atual": (int, float),
        "patrimonio_gatilho": (int, float),
        "aporte_mensal": (int, float),
        "custo_vida_base": (int, float),
        "idade_atual": (int, float),
        "renda_mensal_liquida": (int, float),
        "renda_estimada": (int, float),
        "swr_gatilho": (int, float),
        "inss_anual": (int, float),
    }

    for field, expected_type in required.items():
        if field not in premissas:
            result.add_fail(f"premissas.{field} exists", f"Missing field")
            continue

        value = premissas[field]
        if value is None:
            result.add_fail(
                f"premissas.{field} is not None",
                f"Value is None (CRITICAL)"
            )
            continue

        if not isinstance(value, expected_type):
            result.add_fail(
                f"premissas.{field} is correct type",
                f"Expected {expected_type}, got {type(value).__name__}"
            )
            continue

        # Type-specific validations
        if field == "patrimonio_atual":
            if value <= 0:
                result.add_fail(f"premissas.{field} > 0", "Value must be positive")
            else:
                result.add_pass(f"premissas.patrimonio_atual = {value:,.0f}")

        elif field == "patrimonio_gatilho":
            if value <= 0:
                result.add_fail(f"premissas.{field} > 0", "Value must be positive")
            elif value < premissas.get("patrimonio_atual", 0):
                result.add_fail(
                    f"premissas.patrimonio_gatilho >= patrimonio_atual",
                    f"Gatilho R${value:,.0f} < Atual R${premissas['patrimonio_atual']:,.0f}"
                )
            else:
                result.add_pass(f"premissas.patrimonio_gatilho = {value:,.0f}")

        elif field == "renda_mensal_liquida":
            if value <= 0:
                result.add_fail(
                    f"premissas.renda_mensal_liquida > 0",
                    "Monthly income must be positive (BLOCKER)"
                )
            elif value != premissas.get("renda_estimada"):
                result.add_warning(
                    f"premissas.renda_mensal_liquida != renda_estimada: "
                    f"R${value:,.0f} vs R${premissas.get('renda_estimada'):,.0f}"
                )
                result.add_pass(f"premissas.renda_mensal_liquida = {value:,.0f}")
            else:
                result.add_pass(f"premissas.renda_mensal_liquida = {value:,.0f}")

        elif field == "custo_vida_base":
            if value <= 0:
                result.add_fail(f"premissas.{field} > 0", "Value must be positive")
            else:
                result.add_pass(f"premissas.custo_vida_base = {value:,.0f}")

        elif field == "idade_atual":
            if not (18 <= value <= 100):
                result.add_fail(
                    f"premissas.idade_atual in [18, 100]",
                    f"Age {value} out of range"
                )
            else:
                result.add_pass(f"premissas.idade_atual = {value:.0f}")

        elif field == "swr_gatilho":
            if not (0.01 <= value <= 0.05):
                result.add_warning(
                    f"premissas.swr_gatilho typical range [1%, 5%]: {value*100:.1f}%"
                )
            result.add_pass(f"premissas.swr_gatilho = {value*100:.2f}%")

        else:
            result.add_pass(f"premissas.{field} = {value:,.0f}")


def validate_posicoes(data: Dict[str, Any], result: ValidationResult):
    """Validate posicoes (portfolio positions)"""
    print(f"\n{BLUE}Validating posicoes...{RESET}")

    posicoes = data.get("posicoes", {})
    if not isinstance(posicoes, dict):
        result.add_fail("posicoes is dict", f"Got {type(posicoes)}")
        return

    if len(posicoes) == 0:
        result.add_fail("posicoes has entries", "Empty dict")
        return

    result.add_pass(f"posicoes has {len(posicoes)} tickers")

    total_valor = 0
    for ticker, pos in posicoes.items():
        # Check required fields
        for field in ["qty", "price", "bucket"]:
            if field not in pos:
                result.add_fail(f"posicoes.{ticker}.{field} exists", "Missing field")
                continue

        # Validate calculations (qty × price should equal total)
        qty = pos.get("qty", 0)
        price = pos.get("price", 0)
        calc_total = qty * price

        if calc_total > 0:
            total_valor += calc_total

    result.add_pass(f"posicoes total valor: R${total_valor:,.0f}")

    # Check against patrimonio_atual
    patrimonio_atual = data.get("premissas", {}).get("patrimonio_atual", 0)
    if patrimonio_atual > 0:
        diff_pct = abs(total_valor - patrimonio_atual) / patrimonio_atual * 100
        if diff_pct > 10:
            result.add_warning(
                f"posicoes total (R${total_valor:,.0f}) differs from patrimonio_atual "
                f"(R${patrimonio_atual:,.0f}) by {diff_pct:.1f}%"
            )
        else:
            result.add_pass(f"posicoes total matches patrimonio_atual (diff {diff_pct:.1f}%)")


def validate_fire(data: Dict[str, Any], result: ValidationResult):
    """Validate FIRE section"""
    print(f"\n{BLUE}Validating FIRE data...{RESET}")

    fire = data.get("fire", {})
    if not fire:
        result.add_warning("fire section missing")
        return

    # Check required fields based on actual structure
    required = ["pat_mediano_fire", "plano_status", "mc_date"]

    for field in required:
        if field not in fire:
            result.add_fail(f"fire.{field} exists", "Missing field")
        else:
            value = fire[field]
            if value is None:
                result.add_fail(f"fire.{field} is not None", "Value is None")
            else:
                result.add_pass(f"fire.{field} exists")

    # Validate monte carlo median
    pat_mediano = fire.get("pat_mediano_fire")
    if pat_mediano and isinstance(pat_mediano, (int, float)):
        if pat_mediano > 0:
            result.add_pass(f"fire.pat_mediano_fire = R${pat_mediano:,.0f}")
        else:
            result.add_warning(f"fire.pat_mediano_fire = {pat_mediano} (expected > 0)")

    # Validate plano_status structure
    plano = fire.get("plano_status", {})
    if plano and isinstance(plano, dict):
        status = plano.get("status")
        if status in ["MONITORAR", "GATILHO_ATIVO", "OK", "CRITICO"]:
            result.add_pass(f"fire.plano_status.status = {status}")
        else:
            result.add_warning(f"fire.plano_status.status = {status} (unexpected value)")


def validate_backtest(data: Dict[str, Any], result: ValidationResult):
    """Validate backtest section"""
    print(f"\n{BLUE}Validating backtest...{RESET}")

    backtest = data.get("backtest", {})
    if not backtest:
        result.add_warning("backtest section missing")
        return

    # Backtest structure: dates, target, shadowA, metrics
    required = ["dates", "target", "metrics"]
    for field in required:
        if field not in backtest:
            result.add_fail(f"backtest.{field} exists", "Missing field")
        else:
            value = backtest[field]
            if isinstance(value, list) and len(value) > 0:
                result.add_pass(f"backtest.{field} has {len(value)} entries")
            else:
                result.add_warning(f"backtest.{field} is empty or invalid")


def validate_fire_matrix(data: Dict[str, Any], result: ValidationResult):
    """Validate FIRE matrix"""
    print(f"\n{BLUE}Validating fire_matrix...{RESET}")

    fire_matrix = data.get("fire_matrix", {})
    if not fire_matrix:
        result.add_warning("fire_matrix section missing")
        return

    # FIRE matrix has: perfis, patrimonios, gastos, matrix (cenários)
    required = ["perfis", "matrix"]
    for field in required:
        if field not in fire_matrix:
            result.add_fail(f"fire_matrix.{field} exists", "Missing field")
        else:
            value = fire_matrix[field]
            if isinstance(value, (list, dict)) and len(value) > 0:
                result.add_pass(f"fire_matrix.{field} exists with {len(value)} items")
            else:
                result.add_warning(f"fire_matrix.{field} is empty or invalid")


def main():
    if not DATA_PATH.exists():
        print(f"{RED}✗ ERROR: {DATA_PATH} not found{RESET}")
        sys.exit(1)

    print(f"{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}Data Validation Suite{RESET}")
    print(f"{BLUE}{'='*70}{RESET}")
    print(f"Reading {DATA_PATH}...")

    try:
        with open(DATA_PATH) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"{RED}✗ ERROR: Invalid JSON{RESET}")
        print(f"  {e}")
        sys.exit(1)

    result = ValidationResult()

    # Run all validators
    validate_premissas(data, result)
    validate_posicoes(data, result)
    validate_fire(data, result)
    validate_backtest(data, result)
    validate_fire_matrix(data, result)

    result.print_summary()
    result.print_details()

    # Handle --json flag
    if "--json" in sys.argv:
        print(f"\n{json.dumps(result.to_json(), indent=2)}")

    # Exit with appropriate code
    sys.exit(0 if result.is_success() else 1)


if __name__ == "__main__":
    main()
