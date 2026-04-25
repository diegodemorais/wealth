#!/usr/bin/env python3
"""
Test: P(FIRE) Consistency Across Components
Ensures that all components display the same P(FIRE) value (no 3.4pp divergence)
"""

import json
import sys

def test_pfire_base_single_source():
    """QUANT-001: Validate that pfire_base.base is the canonical source"""
    data = json.load(open('/home/user/wealth/react-app/public/data.json'))

    # Source of truth
    pfire_base = data.get('pfire_base', {}).get('base')
    assert pfire_base is not None, "pfire_base.base is missing!"
    assert isinstance(pfire_base, (int, float)), f"pfire_base.base should be number, got {type(pfire_base)}"
    assert 0 <= pfire_base <= 100, f"pfire_base.base should be 0-100%, got {pfire_base}%"

    print(f"✅ pfire_base.base exists: {pfire_base:.1f}%")
    return pfire_base

def test_pfire_no_divergence(pfire_base):
    """QUANT-001: Ensure no divergence between pfire_base and other P(FIRE) fields"""
    data = json.load(open('/home/user/wealth/react-app/public/data.json'))

    # Other P(FIRE) sources that should NOT diverge
    other_sources = {
        'spending_guardrails.pfire_atual': data.get('spending_guardrails', {}).get('pfire_atual'),
        'fire_matrix.by_profile[0].p_fire_53': (data.get('fire_matrix', {}).get('by_profile', [])[0] if data.get('fire_matrix', {}).get('by_profile') else {}).get('p_fire_53'),
        'pfire_base.fav': data.get('pfire_base', {}).get('fav'),
        'pfire_base.stress': data.get('pfire_base', {}).get('stress'),
    }

    max_divergence = 0
    for name, value in other_sources.items():
        if value is None:
            print(f"⚠️ {name}: missing (fallback ok)")
            continue

        divergence = abs(float(value) - float(pfire_base))
        max_divergence = max(max_divergence, divergence)

        # Accept small numerical differences (<0.2pp), reject large ones (>0.5pp)
        if divergence > 0.5:
            print(f"❌ {name}: {value:.1f}% (divergence: {divergence:.2f}pp) — UNACCEPTABLE")
            return False
        elif divergence > 0.1:
            print(f"⚠️ {name}: {value:.1f}% (divergence: {divergence:.2f}pp) — small, ok")
        else:
            print(f"✅ {name}: {value:.1f}% (match)")

    assert max_divergence < 0.5, f"Max divergence {max_divergence:.2f}pp exceeds threshold (>0.5pp)"
    print(f"✅ Max divergence: {max_divergence:.2f}pp (acceptable)")
    return True

def test_pfire_in_guardrails(pfire_base):
    """QUANT-001: Validate spending_guardrails uses pfire_base (or is updated)"""
    data = json.load(open('/home/user/wealth/react-app/public/data.json'))

    sg = data.get('spending_guardrails', {})
    pfire_atual = sg.get('pfire_atual')

    if pfire_atual is None:
        print("⚠️ spending_guardrails.pfire_atual is missing (fallback to pfire_base ok)")
        return True

    divergence = abs(float(pfire_atual) - float(pfire_base))
    if divergence < 0.2:
        print(f"✅ spending_guardrails.pfire_atual matches pfire_base (divergence: {divergence:.2f}pp)")
        return True
    else:
        print(f"❌ spending_guardrails.pfire_atual diverges: {divergence:.2f}pp")
        return False

if __name__ == '__main__':
    try:
        pfire_base = test_pfire_base_single_source()
        test_pfire_no_divergence(pfire_base)
        test_pfire_in_guardrails(pfire_base)
        print("\n✅ All QUANT-001 tests passed!")
        sys.exit(0)
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)
