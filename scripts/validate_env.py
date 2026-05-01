#!/usr/bin/env python3
"""
validate_env.py — Validador de ambiente upfront para o pipeline canônico.

Princípio (DEV-pipeline-fail-fast / P4): falhas ambientais devem ser
detectadas em <1s, ANTES de qualquer cálculo, com mensagem clara e
acionável. Imports silenciosos que retornam None são proibidos.

Uso:
    from validate_env import validate_pipeline_env, assert_optional_pkg
    validate_pipeline_env()  # primeira ação de generate_data.py

    # Em pontos opcionais (cache, fallback legítimo):
    assert_optional_pkg("getfactormodels", fn_name="get_factor_value_spread")
"""
from __future__ import annotations

import importlib
import sys
import warnings
from typing import Iterable

# Pacotes core que o pipeline EXIGE para gerar data.json válido.
# Faltar qualquer um destes => RuntimeError fatal.
_CORE_PKGS: tuple[str, ...] = (
    "yfinance",
    "pyield",
    "getfactormodels",
    "pandas",
    "numpy",
    "bcb",        # python-bcb expõe módulo "bcb"
    "fredapi",
)

_VENV_HINT = "~/claude/finance-tools/.venv/bin/python3"


def _venv_warning() -> str | None:
    """Retorna warning se Python não parece ser o venv canônico, senão None."""
    exe = sys.executable or ""
    if "finance-tools/.venv" in exe:
        return None
    return (
        f"Python executável '{exe}' não parece ser o venv canônico "
        f"({_VENV_HINT}). Pode rodar (CI), mas verifique imports core."
    )


def _missing_pkgs(pkgs: Iterable[str]) -> list[str]:
    missing: list[str] = []
    for name in pkgs:
        try:
            importlib.import_module(name)
        except ImportError:
            missing.append(name)
    return missing


def validate_pipeline_env() -> None:
    """Valida ambiente do pipeline. Levanta RuntimeError em falha fatal.

    Comportamento:
    - Se algum pacote core ausente → RuntimeError com mensagem clara (fatal).
    - Se Python não está no venv canônico → warning não-fatal (CI permitido).

    Deve ser invocado como PRIMEIRA ação de generate_data.py.
    """
    venv_warn = _venv_warning()
    if venv_warn:
        warnings.warn(venv_warn, RuntimeWarning, stacklevel=2)

    missing = _missing_pkgs(_CORE_PKGS)
    if missing:
        raise RuntimeError(
            "Pipeline requer pacotes core ausentes: "
            f"{', '.join(missing)}. "
            f"Use o venv canônico: `{_VENV_HINT} scripts/generate_data.py`. "
            "Rodar via Python do sistema gera data.json silenciosamente "
            "incompleto (DEV-pipeline-fail-fast)."
        )


def assert_optional_pkg(name: str, fn_name: str) -> None:
    """Assert que pacote opcional está disponível, senão raise com contexto.

    Substitui o anti-padrão `try: from pkg import x; except: return None`
    em pontos do pipeline onde o pacote DEVE estar presente quando a função
    é chamada (mas a função em si pode ser opt-in).

    Args:
        name: nome do módulo (ex: "getfactormodels").
        fn_name: nome da função chamadora — ajuda a localizar o erro.
    """
    try:
        importlib.import_module(name)
    except ImportError as e:
        raise RuntimeError(
            f"{fn_name}() requer pacote '{name}', que não está instalado. "
            f"Use o venv canônico: `{_VENV_HINT}` "
            "(DEV-pipeline-fail-fast)."
        ) from e


if __name__ == "__main__":
    # Modo CLI: roda validação e imprime resultado.
    try:
        validate_pipeline_env()
        print(f"OK ambiente válido — Python: {sys.executable}")
    except RuntimeError as e:
        print(f"FAIL {e}", file=sys.stderr)
        sys.exit(1)
