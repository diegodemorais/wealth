#!/usr/bin/env python3
"""
test_stacked_alloc.py — Validador específico para buildStackedAlloc
Testa se os elementos stackedAllocBar e stackedEquityBar estão sendo populados
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent

def test_stacked_alloc():
    """Valida dados necessários para buildStackedAlloc renderizar"""

    data_file = ROOT / "dashboard/data.json"
    data = json.loads(data_file.read_text(encoding="utf-8"))

    print("\n" + "="*80)
    print("🔍 VALIDANDO buildStackedAlloc — Dados Necessários")
    print("="*80 + "\n")

    errors = []
    warnings = []

    # 1. Verificar posições
    print("📋 Verificando POSIÇÕES (DATA.posicoes)...")
    posicoes = data.get("posicoes", {})
    if not posicoes:
        errors.append("posicoes vazio ou não existe")
    else:
        print(f"   ✅ {len(posicoes)} posições encontradas")

        # Verificar buckets
        buckets = {}
        total_usd = 0
        for k, p in posicoes.items():
            bucket = p.get("bucket")
            qty = p.get("qty", 0)
            price = p.get("price", 0)
            val = qty * price
            total_usd += val

            if bucket not in buckets:
                buckets[bucket] = 0
            buckets[bucket] += val

            if val > 0:
                print(f"      {k:10} {bucket:10} ${val:,.0f} USD")

        print(f"\n   Total por bucket:")
        for b, v in buckets.items():
            print(f"      {b:10} ${v:,.0f} USD")
        print(f"      TOTAL:    ${total_usd:,.0f} USD")

    # 2. Verificar RF
    print("\n💰 Verificando RF (DATA.rf)...")
    rf = data.get("rf", {})
    if not rf:
        errors.append("rf vazio ou não existe")
    else:
        rf_total = 0
        for key, val_dict in rf.items():
            if isinstance(val_dict, dict):
                v = val_dict.get("valor", 0)
                if v > 0:
                    print(f"   {key:20} R${v:,.0f}")
                    rf_total += v
        print(f"   TOTAL RF:         R${rf_total:,.0f}")

    # 3. Verificar Crypto
    print("\n🪙 Verificando CRYPTO (DATA.hodl11 + DATA.cryptoLegado)...")
    hodl11_val = data.get("hodl11", {}).get("valor", 0)
    crypto_legado = data.get("cryptoLegado", 3000)
    crypto_total = hodl11_val + crypto_legado
    print(f"   hodl11:         R${hodl11_val:,.0f}")
    print(f"   cryptoLegado:   R${crypto_legado:,.0f}")
    print(f"   TOTAL CRYPTO:   R${crypto_total:,.0f}")

    # 4. Verificar CAMBIO
    print("\n💹 Verificando CAMBIO...")
    cambio = data.get("cambio", 5.2)
    print(f"   CAMBIO: {cambio}")
    if cambio <= 0:
        errors.append(f"CAMBIO inválido: {cambio}")

    # 5. Verificar pesosTarget para intra-equity
    print("\n🎯 Verificando PESOS TARGET (DATA.pesosTarget)...")
    pesos = data.get("pesosTarget", {})
    if not pesos:
        warnings.append("pesosTarget vazio — intra-equity não renderizará")
    else:
        total_pct = 0
        for k, v in pesos.items():
            print(f"   {k:10} {v:6.1f}%")
            total_pct += v
        print(f"   TOTAL:     {total_pct:6.1f}%")

    # 6. Validar HTML template
    print("\n🔧 Verificando elementos HTML no template...")
    template = (ROOT / "dashboard/template.html").read_text(encoding="utf-8")

    required_elements = [
        ("stackedAllocBar", "Barra alocação por classe"),
        ("stackedAllocLegend", "Legenda alocação"),
        ("stackedEquityBar", "Intra-equity bars"),
    ]

    for elem_id, desc in required_elements:
        if f'id="{elem_id}"' in template:
            print(f"   ✅ {elem_id:25} {desc}")
        else:
            errors.append(f"Elemento {elem_id} não existe no template")

    # 7. Validar bootstrap expõe variáveis
    print("\n🔌 Verificando exposição de variáveis no bootstrap...")
    bootstrap = (ROOT / "dashboard/js/bootstrap.mjs").read_text(encoding="utf-8")

    required_vars = ["totalEquityUsd", "cryptoBrl", "CAMBIO"]
    for var in required_vars:
        if var in bootstrap:
            print(f"   ✅ {var}")
        else:
            errors.append(f"Variável {var} não exposta no bootstrap")

    # RESULTADO
    print("\n" + "="*80)
    if errors:
        print(f"❌ ERROS ENCONTRADOS ({len(errors)}):")
        for err in errors:
            print(f"   • {err}")
        return False
    elif warnings:
        print(f"⚠️  AVISOS ({len(warnings)}):")
        for warn in warnings:
            print(f"   • {warn}")
        print(f"\n✅ Sem erros críticos — teste continua")
        return True
    else:
        print(f"✅ TODOS OS DADOS ESTÃO CORRETOS")
        return True

if __name__ == '__main__':
    import sys
    success = test_stacked_alloc()
    sys.exit(0 if success else 1)
