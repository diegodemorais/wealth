#!/usr/bin/env python3
"""
test_donuts_builder.py — Testa buildDonuts para verificar se está causando erro
"""

import subprocess
import json
import tempfile
from pathlib import Path

ROOT = Path(__file__).parent.parent

print("\n" + "="*80)
print("🧪 TESTANDO buildDonuts (primeira função da aba carteira)")
print("="*80 + "\n")

# Ler dados
data = json.loads((ROOT / "dashboard/data.json").read_text(encoding="utf-8"))

# Ler builder
builder_code = (ROOT / "dashboard/js/04-charts-portfolio.mjs").read_text(encoding="utf-8")

# Extrair função buildDonuts
import re
match = re.search(
    r'export function buildDonuts\(\)\s*\{(.*?)\n\}\n\n// ──',
    builder_code,
    re.DOTALL
)

if not match:
    print("❌ Não consegui extrair buildDonuts")
    exit(1)

func_body = match.group(1)

# Script Node para testar
node_script = f"""
const Chart = {{}}; // Mock Chart

const window = {{
    DATA: {json.dumps(data)},
    CAMBIO: {data['cambio']},
    totalEquityUsd: {sum(p['qty'] * p['price'] for p in data['posicoes'].values())},
    cryptoBrl: {data['hodl11']['valor'] + data.get('cryptoLegado', 3000)},
    Chart: Chart,
    charts: {{}},
    checkMinPoints: () => false,
}};

const mockElements = {{}};
const mockCanvases = {{}};

window.document = {{
    getElementById: function(id) {{
        if (!mockElements[id]) {{
            if (id.includes('Chart')) {{
                mockCanvases[id] = {{ getContext: () => ({{}} ) }};
                mockElements[id] = mockCanvases[id];
            }} else {{
                mockElements[id] = {{ innerHTML: '', style: {{}} }};
            }}
        }}
        return mockElements[id];
    }},
    querySelector: function() {{ return null; }},
    querySelectorAll: function() {{ return []; }},
}};

function buildDonuts() {{
    const DATA = window.DATA;
    const totalEquityUsd = window.totalEquityUsd;
    const CAMBIO = window.CAMBIO;
    const cryptoBrl = window.cryptoBrl;
    const checkMinPoints = window.checkMinPoints;
    const Chart = window.Chart;
    const charts = window.charts;
    const document = window.document;

    {func_body}
}}

try {{
    buildDonuts();
    console.log('✅ buildDonuts executado sem erros');
    process.exit(0);
}} catch(e) {{
    console.log('❌ ERRO em buildDonuts:');
    console.log('Message:', e.message);
    console.log('Stack:', e.stack);
    console.log('');
    console.log('Variáveis globais esperadas:');
    ['DATA', 'totalEquityUsd', 'CAMBIO', 'cryptoBrl', 'Chart', 'charts', 'checkMinPoints'].forEach(v => {{
        console.log(`  ${{v}}: ${{typeof window[v]}}`);
    }});
    process.exit(1);
}}
"""

# Escrever script temporário
with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
    f.write(node_script)
    script_path = f.name

try:
    result = subprocess.run(
        ['node', script_path],
        capture_output=True,
        text=True,
        timeout=10
    )

    print("Resultado:")
    print(result.stdout)
    if result.stderr:
        print("Stderr:", result.stderr)

    if result.returncode == 0:
        print("\n✅ buildDonuts funciona corretamente")
    else:
        print("\n❌ buildDonuts tem erro — isso está bloqueando buildStackedAlloc!")

except FileNotFoundError:
    print("⚠️  Node.js não instalado")
finally:
    Path(script_path).unlink(missing_ok=True)
