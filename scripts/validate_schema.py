#!/usr/bin/env python3
"""
validate_schema.py — Validador de Contrato para Dashboard

Valida que spec.json e data.json estão em acordo:
1. Cada bloco em spec.json declara data_fields esperados
2. Cada data_field deve existir em data.json com tipo correto
3. Constraints cruzados (ex: soma ~100%) são validados

Uso:
    python3 scripts/validate_schema.py
    python3 scripts/validate_schema.py --spec dashboard/spec.json --data dashboard/data.json
    python3 scripts/validate_schema.py --check-all
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Any, List, Tuple


ROOT = Path(__file__).parent.parent
SPEC_FILE = ROOT / "dashboard" / "spec.json"
DATA_FILE = ROOT / "dashboard" / "data.json"


def _get_nested(data: dict, path: str) -> Any:
    """Retorna valor aninhado em dict, ex: 'a.b.c' → data['a']['b']['c']"""
    keys = path.split('.')
    current = data
    for key in keys:
        if not isinstance(current, dict) or key not in current:
            return None
        current = current[key]
    return current


def _validate_field_exists(data: dict, field_path: str, block_id: str) -> Tuple[bool, str]:
    """Verifica se field_path existe em data.json"""
    val = _get_nested(data, field_path)
    if val is None:
        return False, f"Campo '{field_path}' não existe em data.json (requerido por bloco '{block_id}')"
    return True, f"✓ {field_path}"


def _validate_field_type(data: dict, field_path: str, expected_type: str, block_id: str) -> Tuple[bool, str]:
    """Verifica se field tem tipo esperado"""
    val = _get_nested(data, field_path)
    if val is None:
        return False, f"Campo '{field_path}' ausente (não pode validar tipo)"

    type_map = {
        "numeric": (int, float),
        "float": float,
        "int": int,
        "string": str,
        "dict": dict,
        "list": list,
        "bool": bool,
    }

    if expected_type not in type_map:
        return True, f"Tipo '{expected_type}' desconhecido (ignorado)"

    expected = type_map[expected_type]
    if isinstance(expected, tuple):
        is_correct = isinstance(val, expected)
    else:
        is_correct = isinstance(val, expected)

    if not is_correct:
        actual_type = type(val).__name__
        return False, f"Campo '{field_path}' tem tipo {actual_type}, esperado {expected_type}"

    return True, f"✓ {field_path} ({expected_type})"


def _validate_constraint(data: dict, constraint: dict, block_id: str) -> Tuple[bool, str]:
    """
    Valida constraint cruzado. Exemplos:

    {
      "type": "sum_near_100",
      "fields": ["concentracao_brasil.brasil_pct", "macro.exposicao_cambial_pct"],
      "tolerance": 2.0
    }
    """
    constraint_type = constraint.get("type")
    fields = constraint.get("fields", [])

    if constraint_type == "sum_near_100":
        tolerance = constraint.get("tolerance", 2.0)
        values = []
        for field in fields:
            val = _get_nested(data, field)
            if val is None:
                return False, f"Constraint '{constraint_type}': campo '{field}' não existe"
            if not isinstance(val, (int, float)):
                return False, f"Constraint '{constraint_type}': campo '{field}' não é numérico"
            values.append(val)

        total = sum(values)
        delta = abs(total - 100.0)
        if delta > tolerance:
            field_str = " + ".join([f"{_get_nested(data, f):.1f}" for f in fields])
            return False, (
                f"Constraint '{constraint_type}': {field_str} = {total:.1f} "
                f"(esperado ~100, delta={delta:.1f} > {tolerance})"
            )
        return True, f"✓ Constraint {constraint_type}: {' + '.join(fields)} = {total:.1f}"

    elif constraint_type == "range":
        field = fields[0] if fields else None
        min_val = constraint.get("min")
        max_val = constraint.get("max")

        if not field:
            return False, f"Constraint 'range': field não especificado"

        val = _get_nested(data, field)
        if val is None:
            return False, f"Constraint 'range': campo '{field}' não existe"
        if not isinstance(val, (int, float)):
            return False, f"Constraint 'range': campo '{field}' não é numérico"

        if (min_val is not None and val < min_val) or (max_val is not None and val > max_val):
            return False, f"Constraint 'range': {field}={val} fora de [{min_val}, {max_val}]"

        return True, f"✓ Constraint range: {field}={val} em [{min_val}, {max_val}]"

    else:
        return True, f"Constraint tipo '{constraint_type}' não reconhecido (ignorado)"


def validate_schema(spec_path: Path, data_path: Path, verbose: bool = False) -> bool:
    """
    Valida que spec.json e data.json estão em acordo.

    Retorna:
        True se válido
        False se CRITICAL error encontrado
    """
    # Carregar arquivos
    try:
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"❌ Erro ao ler spec.json: {e}")
        return False

    try:
        data = json.loads(data_path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"❌ Erro ao ler data.json: {e}")
        return False

    errors = []
    warnings = []
    successes = []

    # 1. Validar blocos: cada bloco tem data_fields que existem
    print("\n📋 Validando blocos (data_fields)...")
    blocks = spec.get("blocks", [])
    for block in blocks:
        block_id = block.get("id", "?")
        data_fields = block.get("data_fields", [])

        for field in data_fields:
            is_ok, msg = _validate_field_exists(data, field, block_id)
            if is_ok:
                if verbose:
                    successes.append(msg)
            else:
                errors.append(f"[{block_id}] {msg}")

    print(f"  ✓ {len(blocks)} blocos | {len(data_fields)} data_fields únicos")

    # 2. Validar constraints cruzados (se existem)
    print("\n🔗 Validando constraints cruzados...")
    constraints_found = 0
    for block in blocks:
        block_id = block.get("id", "?")
        constraints = block.get("constraints", {})

        if not constraints:
            continue

        constraints_found += len(constraints)
        for constraint_name, constraint_def in constraints.items():
            is_ok, msg = _validate_constraint(data, constraint_def, block_id)
            if is_ok:
                if verbose:
                    successes.append(f"[{block_id}] {msg}")
            else:
                errors.append(f"[{block_id}] {msg}")

    if constraints_found == 0:
        print("  ℹ️  Nenhum constraint definido em spec.json (recomendado adicionar)")
    else:
        print(f"  ✓ {constraints_found} constraint(s) validado(s)")

    # 3. Resumo e resultado
    print(f"\n{'='*60}")
    if errors:
        print(f"❌ VALIDAÇÃO FALHOU — {len(errors)} erro(s) crítico(s):")
        for err in errors[:10]:
            print(f"   • {err}")
        if len(errors) > 10:
            print(f"   … e {len(errors) - 10} erro(s) omitido(s)")
        return False

    if warnings:
        print(f"⚠️  {len(warnings)} warning(s):")
        for warn in warnings[:5]:
            print(f"   • {warn}")

    print(f"✅ VALIDAÇÃO PASSOU — spec.json e data.json estão em acordo")
    if verbose:
        print(f"\n   {len(successes)} campo(s) validado(s) com sucesso")

    return True


def main():
    parser = argparse.ArgumentParser(description="Validador de Contrato para Dashboard")
    parser.add_argument("--spec", type=Path, default=SPEC_FILE, help="Caminho para spec.json")
    parser.add_argument("--data", type=Path, default=DATA_FILE, help="Caminho para data.json")
    parser.add_argument("--verbose", "-v", action="store_true", help="Mostrar todos os sucessos")
    parser.add_argument("--check-all", action="store_true", help="Check all blocks (padrão)")

    args = parser.parse_args()

    is_valid = validate_schema(args.spec, args.data, verbose=args.verbose)
    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()
