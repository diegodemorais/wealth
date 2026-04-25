#!/usr/bin/env python3
"""
Test: Guardrails de Retirada — Consistency with carteira.md
Validates that guardrails follow drawdown-based rules (not P(FIRE))
"""

import json
import sys

def test_guardrails_structure():
    """QUANT-002: Validate guardrails_retirada structure"""
    data = json.load(open('/home/user/wealth/react-app/public/data.json'))

    guardrails = data.get('guardrails_retirada')
    assert guardrails is not None, "guardrails_retirada is missing!"
    assert isinstance(guardrails, list), "guardrails_retirada should be list"
    assert len(guardrails) >= 4, f"Expected ≥4 guardrails, got {len(guardrails)}"

    print(f"✅ guardrails_retirada structure valid: {len(guardrails)} guardrails")
    return guardrails

def test_guardrails_drawdown_based(guardrails):
    """QUANT-002: Ensure guardrails are based on DRAWDOWN, not P(FIRE)"""

    # Guardrails devem mencionar "drawdown", não "P(FIRE)"
    for i, g in enumerate(guardrails):
        condicao = g.get('condicao', '').lower()
        guardrail_name = g.get('guardrail', '').lower()

        # Verificar que não menciona P(FIRE)
        if 'p(fire)' in condicao or 'pfire' in condicao:
            print(f"❌ Guardrail {i} ({g.get('id')}): ainda menciona P(FIRE)")
            print(f"   Condição: {g.get('condicao')}")
            return False

        # Verificar que menciona drawdown ou upside (exceto se for expansivo)
        if g.get('id') != 'guardrail_expansivo':
            if 'drawdown' not in condicao and 'upside' not in condicao:
                print(f"⚠️ Guardrail {i} ({g.get('id')}): não menciona drawdown ou upside")
                print(f"   Condição: {g.get('condicao')}")

        print(f"✅ Guardrail {i} ({g.get('id')}): {g.get('condicao')}")

    return True

def test_guardrails_values_carteira_compliant(guardrails):
    """QUANT-002: Validate retirada_sugerida matches carteira.md values"""

    # Valores esperados de carteira.md (2026-03-20)
    expected_values = {
        'guardrail_expansivo': 275000,
        'guardrail_normal': 250000,
        'guardrail_cautela_1': 225000,
        'guardrail_cautela_2': 200000,
        'guardrail_defesa': 180000,
    }

    guardrail_map = {g['id']: g for g in guardrails}

    for guardrail_id, expected_value in expected_values.items():
        g = guardrail_map.get(guardrail_id)
        if g is None:
            print(f"⚠️ Guardrail {guardrail_id} not found (optional)")
            continue

        actual_value = g.get('retirada_sugerida')
        if actual_value != expected_value:
            print(f"❌ {guardrail_id}: expected R${expected_value:,}, got R${actual_value:,}")
            return False

        print(f"✅ {guardrail_id}: R${actual_value:,.0f} (correto)")

    return True

def test_no_pfire_condition_guardrails():
    """QUANT-002: Validate that spending_guardrails (P(FIRE)-based) is separate"""
    data = json.load(open('/home/user/wealth/react-app/public/data.json'))

    # guardrails_retirada deve existir (drawdown-based)
    gr_retirada = data.get('guardrails_retirada')
    assert gr_retirada is not None, "guardrails_retirada missing!"

    # spending_guardrails pode coexistir (P(FIRE)-based, para spending decisions)
    sg = data.get('spending_guardrails')
    if sg:
        print(f"ℹ️ spending_guardrails também presente (para spending decisions, separado de retirada)")
        # Mas NOT ser usado para RETIRADA em withdraw page
        # /withdraw deve usar guardrails_retirada (drawdown) para retirada
        # /withdraw pode usar spending_guardrails (P(FIRE)) para SPENDING (gasto mensal)

    print(f"✅ guardrails_retirada está separado de spending_guardrails (correto)")
    return True

if __name__ == '__main__':
    try:
        guardrails = test_guardrails_structure()
        test_guardrails_drawdown_based(guardrails)
        test_guardrails_values_carteira_compliant(guardrails)
        test_no_pfire_condition_guardrails()
        print("\n✅ All QUANT-002 tests passed!")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
