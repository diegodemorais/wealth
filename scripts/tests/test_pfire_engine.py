#!/usr/bin/env python3
"""
test_pfire_engine.py — Validação de PFireEngine

Testes IDÊNTICOS em Python e TypeScript:
- Mesmo request → mesmo resultado
- Mesma seed → reproducibilidade
- Invariantes garantidas

Se Python e TypeScript divergem > 1pp, alguma versão está errada.
"""

import sys
from pathlib import Path

# Adicionar scripts/ ao path
_scripts = Path(__file__).parent.parent
sys.path.insert(0, str(_scripts))

import pytest
from pfire_engine import PFireEngine, PFireRequest, PFireResult


class TestPFireEngineUnit:
    """Testes unitários — valida que motor funciona corretamente."""

    def test_calculate_base_scenario(self):
        """Cenário base: P(FIRE) deve estar próximo a 86.3% (usa PREMISSAS base)."""
        # Request com values dummy — PFireEngine ignora e usa PREMISSAS globais
        request = PFireRequest(
            scenario="base",
            patrimonio_atual=1.0,  # Dummy (ignorado)
            meta_fire=1.0,  # Dummy (ignorado)
            aporte_mensal=1.0,  # Dummy (ignorado)
            idade_atual=1,  # Dummy (ignorado)
            idade_fire=2,  # Dummy (ignorado)
            retorno_anual=0.01,  # Dummy (ignorado)
            volatilidade_anual=0.01,  # Dummy (ignorado)
            meses=1,  # Dummy (ignorado)
            n_simulacoes=10_000,
            seed=42,
        )

        result = PFireEngine.calculate(request)

        # Validações
        assert isinstance(result, PFireResult)
        assert result.canonical.is_canonical, "Resultado deve ser canônico"
        assert result.canonical.source == "mc"
        assert 0 <= result.canonical.decimal <= 1
        assert 0 <= result.canonical.percentage <= 100

        # P(FIRE) baseline esperado: ~86.3% (PREMISSAS globais)
        assert 85 <= result.canonical.percentage <= 88, \
            f"P(FIRE) inesperado: {result.canonical.percentage}%"

        print(f"✓ Base scenario: {result.canonical.pct_str}")

    def test_calculate_aspiracional_scenario(self):
        """Cenário aspiracional: +1% retorno → P(FIRE) sobe vs base."""
        # Aplicar delta de +1% retorno
        request = PFireRequest(
            scenario="aspiracional",
            patrimonio_atual=1.0,  # Dummy
            meta_fire=1.0,  # Dummy
            aporte_mensal=1.0,  # Dummy
            idade_atual=1,  # Dummy
            idade_fire=2,  # Dummy
            retorno_anual=0.01,  # Dummy
            volatilidade_anual=0.01,  # Dummy
            meses=1,  # Dummy
            n_simulacoes=10_000,
            seed=42,
        )

        result = PFireEngine.calculate(request)

        assert result.canonical.is_canonical
        # Aspiracional aplica +1% ao retorno base
        # Esperado: ~92% (significativamente acima de base 86.3%)
        assert 90 <= result.canonical.percentage <= 95
        print(f"✓ Aspiracional scenario: {result.canonical.pct_str}")

    def test_calculate_stress_scenario(self):
        """Cenário stress: -2% retorno, +5% vol → P(FIRE) cai vs base."""
        # Aplicar delta de -2% retorno + 5% volatilidade
        request = PFireRequest(
            scenario="stress",
            patrimonio_atual=1.0,  # Dummy
            meta_fire=1.0,  # Dummy
            aporte_mensal=1.0,  # Dummy
            idade_atual=1,  # Dummy
            idade_fire=2,  # Dummy
            retorno_anual=0.01,  # Dummy
            volatilidade_anual=0.01,  # Dummy
            meses=1,  # Dummy
            n_simulacoes=10_000,
            seed=42,
        )

        result = PFireEngine.calculate(request)

        assert result.canonical.is_canonical
        # Stress aplica -2% ao retorno e +5% à volatilidade
        # Esperado: ~44% (muito abaixo de base 86.3% devido ao impacto combinado)
        assert 40 <= result.canonical.percentage <= 50
        print(f"✓ Stress scenario: {result.canonical.pct_str}")

    def test_reproducibility_same_seed(self):
        """Mesma seed → mesmo resultado (reproducibilidade)."""
        request = PFireRequest(
            scenario="base",
            patrimonio_atual=1_000_000,
            meta_fire=8_333_333,
            aporte_mensal=25_000,
            idade_atual=39,
            idade_fire=53,
            retorno_anual=0.0485,
            volatilidade_anual=0.168,
            meses=14 * 12,
            n_simulacoes=5_000,  # Menor N para teste rápido
            seed=42,
        )

        result1 = PFireEngine.calculate(request)
        result2 = PFireEngine.calculate(request)

        # DEVE ser idêntico (mesma seed)
        assert result1.canonical.percentage == result2.canonical.percentage
        assert result1.canonical.decimal == result2.canonical.decimal
        print(f"✓ Reproducibility: {result1.canonical.pct_str} == {result2.canonical.pct_str}")

    def test_reproducibility_different_seed(self):
        """Seed diferente → resultados próximos mas não iguais (MC variance)."""
        request_42 = PFireRequest(
            scenario="base",
            patrimonio_atual=1_000_000,
            meta_fire=8_333_333,
            aporte_mensal=25_000,
            idade_atual=39,
            idade_fire=53,
            retorno_anual=0.0485,
            volatilidade_anual=0.168,
            meses=14 * 12,
            n_simulacoes=5_000,
            seed=42,
        )

        request_123 = PFireRequest(
            scenario="base",
            patrimonio_atual=1_000_000,
            meta_fire=8_333_333,
            aporte_mensal=25_000,
            idade_atual=39,
            idade_fire=53,
            retorno_anual=0.0485,
            volatilidade_anual=0.168,
            meses=14 * 12,
            n_simulacoes=5_000,
            seed=123,
        )

        result1 = PFireEngine.calculate(request_42)
        result2 = PFireEngine.calculate(request_123)

        # Diferentes seeds → resultados DIFERENTES (MC variance)
        # Mas ainda bem próximos (SE ~1pp para N=5k)
        diff = abs(result1.canonical.percentage - result2.canonical.percentage)
        assert diff > 0, "Seeds diferentes devem produzir resultados diferentes"
        assert diff < 3, f"Diferença entre seeds deve ser pequena, got {diff}pp"
        print(f"✓ Different seeds: {result1.canonical.pct_str} vs {result2.canonical.pct_str} (diff: {diff:.1f}pp)")


class TestPFireEngineValidation:
    """Testes de validação — verifica que invariantes são mantidas."""

    def test_request_validation_negative_patrimonio(self):
        """Request inválido: patrimonio_atual <= 0 deve falhar."""
        with pytest.raises(ValueError, match="patrimonio_atual deve ser > 0"):
            PFireRequest(
                scenario="base",
                patrimonio_atual=-1_000_000,  # INVÁLIDO
                meta_fire=8_333_333,
                aporte_mensal=25_000,
                idade_atual=39,
                idade_fire=53,
                retorno_anual=0.0485,
                volatilidade_anual=0.168,
                meses=14 * 12,
            )

    def test_request_validation_inverted_ages(self):
        """Request inválido: idade_fire <= idade_atual deve falhar."""
        with pytest.raises(ValueError, match="idade_fire.*deve ser >"):
            PFireRequest(
                scenario="base",
                patrimonio_atual=1_000_000,
                meta_fire=8_333_333,
                aporte_mensal=25_000,
                idade_atual=53,
                idade_fire=50,  # INVÁLIDO: menor que atual
                retorno_anual=0.0485,
                volatilidade_anual=0.168,
                meses=14 * 12,
            )

    def test_result_always_canonical(self):
        """Resultado DEVE ter canonical.is_canonical == True."""
        request = PFireRequest(
            scenario="base",
            patrimonio_atual=1_000_000,
            meta_fire=8_333_333,
            aporte_mensal=25_000,
            idade_atual=39,
            idade_fire=53,
            retorno_anual=0.0485,
            volatilidade_anual=0.168,
            meses=14 * 12,
            n_simulacoes=1_000,  # Pequeno para teste rápido
            seed=42,
        )

        result = PFireEngine.calculate(request)

        assert result.canonical.is_canonical is True, "Resultado DEVE ser canônico"
        assert result.canonical.source == "mc", "Source DEVE ser 'mc'"


class TestPFireEngineCrossPlatform:
    """
    Testes de sincronização Python ↔ TypeScript.

    CRÍTICO: Se Python e TypeScript divergem > 1pp com mesma seed,
    uma das implementações está errada.
    """

    def test_baseline_seed_42_for_typescript_validation(self):
        """
        Baseline: senão o valor é usado em testes TypeScript.
        TypeScript DEVE produzir EXATAMENTE este resultado.
        """
        request = PFireRequest(
            scenario="base",
            patrimonio_atual=1_000_000,
            meta_fire=8_333_333,
            aporte_mensal=25_000,
            idade_atual=39,
            idade_fire=53,
            retorno_anual=0.0485,
            volatilidade_anual=0.168,
            meses=14 * 12,
            n_simulacoes=10_000,
            seed=42,
        )

        result = PFireEngine.calculate(request)

        # Imprimir resultado esperado para referência
        print("\n" + "=" * 60)
        print("BASELINE PARA TYPESCRIPT VALIDATION")
        print("=" * 60)
        print(f"Scenario: {request.scenario}")
        print(f"P(FIRE): {result.canonical.pct_str}")
        print(f"Decimal: {result.canonical.decimal}")
        print(f"Percentile P10: {result.percentile_10:.4f} (0-1)")
        print(f"Percentile P50: {result.percentile_50:.4f} (0-1)")
        print(f"Percentile P90: {result.percentile_90:.4f} (0-1)")
        print("=" * 60)

        # Validação: deve estar na faixa esperada
        assert 84 <= result.canonical.percentage <= 88, \
            f"Baseline P(FIRE) inesperado: {result.canonical.percentage}%"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
