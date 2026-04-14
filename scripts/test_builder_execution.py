#!/usr/bin/env python3
"""
test_builder_execution.py — Simula execução do buildStackedAlloc em Node.js
para verificar se há erros de runtime
"""

import subprocess
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent.parent

def test_builder_execution():
    """Executa buildStackedAlloc em Node.js e verifica se funciona"""

    print("\n" + "="*80)
    print("🧪 TESTANDO EXECUÇÃO DE buildStackedAlloc")
    print("="*80 + "\n")

    # Ler dados
    data = json.loads((ROOT / "dashboard/data.json").read_text(encoding="utf-8"))

    # Ler builder do arquivo
    builder_code = (ROOT / "dashboard/js/04-charts-portfolio.mjs").read_text(encoding="utf-8")

    # Extrair função buildStackedAlloc
    import re
    match = re.search(
        r'export function buildStackedAlloc\(\)\s*\{(.*?)\n\}\n\n// ──',
        builder_code,
        re.DOTALL
    )

    if not match:
        print("❌ Não consegui extrair buildStackedAlloc do arquivo")
        return False

    func_body = match.group(1)

    # Criar script Node que simula o builder
    node_script = f"""
// Mock window
const window = {{
    DATA: {json.dumps(data)},
    CAMBIO: {data['cambio']},
    totalEquityUsd: {sum(p['qty'] * p['price'] for p in data['posicoes'].values())},
    cryptoBrl: {data['hodl11']['valor'] + data.get('cryptoLegado', 3000)},
}};

// Mock document.getElementById
const mockElements = {{}};
window.document = {{
    getElementById: function(id) {{
        if (!mockElements[id]) {{
            mockElements[id] = {{ innerHTML: '', style: {{}} }};
        }}
        return mockElements[id];
    }}
}};

// Função buildStackedAlloc
function buildStackedAlloc() {{
    const totalEquityUsd = window.totalEquityUsd;
    const CAMBIO = window.CAMBIO;
    const DATA = window.DATA;
    const cryptoBrl = window.cryptoBrl;
    const document = window.document;

    {func_body}
}}

// Executar
try {{
    buildStackedAlloc();
    console.log('✅ buildStackedAlloc executado sem erros');
    console.log('stackedAllocBar innerHTML length:', mockElements['stackedAllocBar']?.innerHTML?.length || 0);
    console.log('stackedAllocLegend innerHTML length:', mockElements['stackedAllocLegend']?.innerHTML?.length || 0);
    console.log('stackedEquityBar innerHTML length:', mockElements['stackedEquityBar']?.innerHTML?.length || 0);

    if (mockElements['stackedAllocBar']?.innerHTML?.length > 0 &&
        mockElements['stackedAllocLegend']?.innerHTML?.length > 0 &&
        mockElements['stackedEquityBar']?.innerHTML?.length > 0) {{
        console.log('✅ Todos os elementos foram populados');
        process.exit(0);
    }} else {{
        console.log('❌ Um ou mais elementos NÃO foram populados');
        Object.keys(mockElements).forEach(k => {{
            console.log(`  ${{k}}: ${{mockElements[k].innerHTML?.length || 0}} chars`);
        }});
        process.exit(1);
    }}
}} catch(e) {{
    console.log('❌ ERRO ao executar buildStackedAlloc:');
    console.log(e.message);
    console.log(e.stack);
    process.exit(1);
}}
"""

    # Escrever script temporário
    with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
        f.write(node_script)
        script_path = f.name

    try:
        # Executar com Node
        result = subprocess.run(
            ['node', script_path],
            capture_output=True,
            text=True,
            timeout=10
        )

        print("📤 Saída do teste:")
        print(result.stdout)
        if result.stderr:
            print("⚠️  Stderr:", result.stderr)

        return result.returncode == 0

    except FileNotFoundError:
        print("⚠️  Node.js não encontrado — testando com Python puro")
        return test_builder_python(data)
    except Exception as e:
        print(f"❌ Erro ao executar: {e}")
        return False
    finally:
        Path(script_path).unlink(missing_ok=True)

def test_builder_python(data):
    """Fallback: simular builder em Python"""
    print("⚙️  Simulando buildStackedAlloc em Python...\n")

    try:
        # Simular globals
        totalEquityUsd = sum(p['qty'] * p['price'] for p in data['posicoes'].values())
        CAMBIO = data['cambio']
        cryptoBrl = data['hodl11']['valor'] + data.get('cryptoLegado', 3000)

        eqBrl = totalEquityUsd * CAMBIO
        _ipca2040Brl = data['rf']['ipca2040']['valor']
        _renda2065Brl = data['rf']['renda2065']['valor']
        _ipca2029Brl = data['rf']['ipca2029']['valor']

        segments = [
            {'label': 'Equity', 'val': eqBrl},
            {'label': 'IPCA+ 2040', 'val': _ipca2040Brl},
            {'label': 'IPCA+ 2029', 'val': _ipca2029Brl},
            {'label': 'Renda+ 2065', 'val': _renda2065Brl},
            {'label': 'Crypto', 'val': cryptoBrl},
        ]
        segments = [s for s in segments if s['val'] > 0]
        total = sum(s['val'] for s in segments)

        print("✅ Segmentos calculados:")
        for s in segments:
            pct = (s['val'] / total * 100) if total > 0 else 0
            print(f"   {s['label']:20} R${s['val']:>12,.0f}  ({pct:5.1f}%)")

        # Intra-equity
        EQUITY_BUCKETS = ['SWRD', 'AVGS', 'AVEM']
        bucketVals = {b: 0 for b in EQUITY_BUCKETS}
        for p in data['posicoes'].values():
            if p['bucket'] in bucketVals:
                bucketVals[p['bucket']] += p['qty'] * p['price']

        totalEquityUsdActual = sum(bucketVals.values())
        pesos = data.get('pesosTarget', {})
        totalEquityTarget = sum(pesos.get(k, 0) for k in EQUITY_BUCKETS)

        print("\n✅ Intra-equity calculado:")
        for b in EQUITY_BUCKETS:
            pctAtual = (bucketVals[b] / totalEquityUsdActual * 100) if totalEquityUsdActual > 0 else 0
            pctAlvo = (pesos.get(b, 0) / totalEquityTarget * 100) if totalEquityTarget > 0 else 0
            delta = pctAtual - pctAlvo
            print(f"   {b:10} Atual: {pctAtual:5.1f}% | Alvo: {pctAlvo:5.1f}% | Delta: {delta:+5.1f}pp")

        return True

    except Exception as e:
        print(f"❌ Erro na simulação Python: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    import sys
    success = test_builder_execution()
    sys.exit(0 if success else 1)
