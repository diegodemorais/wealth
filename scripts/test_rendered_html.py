#!/usr/bin/env python3
"""
test_rendered_html.py — Verifica o HTML renderizado para ver se elementos
stackedAllocBar, stackedAllocLegend, stackedEquityBar foram populados
"""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent

print("\n" + "="*80)
print("🔍 VERIFICANDO HTML RENDERIZADO — Elementos Populados")
print("="*80 + "\n")

# Ler index.html
index_file = ROOT / "dashboard/index.html"
html = index_file.read_text(encoding="utf-8")

# Procurar pelos elementos
elements_to_check = [
    ("stackedAllocBar", "Barra alocação por classe"),
    ("stackedAllocLegend", "Legenda com percentuais"),
    ("stackedEquityBar", "Intra-equity comparativo"),
]

print("🔍 Procurando por elementos no HTML gerado:\n")

for elem_id, desc in elements_to_check:
    # Procurar pelo elemento e seu conteúdo
    pattern = f'id="{elem_id}"'
    if pattern in html:
        # Extrair uma amostra do conteúdo
        start = html.find(pattern)
        end = html.find('</div>', start) + 6
        sample = html[start:min(end, start+200)]

        # Verificar se tem conteúdo HTML (não é vazio)
        if f'id="{elem_id}"' in sample:
            # Procurar por innerHTML dentro das próximas 500 chars
            snippet = html[start:start+500]
            has_content = 'style=' in snippet or 'innerHTML=' in snippet or 'span' in snippet

            if has_content:
                print(f"✅ {elem_id:25} {desc}")
                print(f"   Snippet: {snippet[:100]}...")
            else:
                print(f"⚠️  {elem_id:25} {desc} — ELEMENTO VAZIO")
                print(f"   HTML: {snippet[:100]}...")
    else:
        print(f"❌ {elem_id:25} {desc} — NÃO ENCONTRADO")

# Verificar se buildStackedAlloc está sendo chamada no init
print("\n" + "="*80)
print("🔌 Verificando se buildStackedAlloc está na sequência de init:\n")

if "buildStackedAlloc" in html:
    print("✅ buildStackedAlloc está no HTML")

    # Encontrar contexto
    idx = html.find("buildStackedAlloc")
    context = html[max(0, idx-100):min(len(html), idx+200)]
    print(f"   Contexto: ...{context}...")
else:
    print("❌ buildStackedAlloc não está no HTML!")

# Verificar se há erros de console no HTML
print("\n" + "="*80)
print("🛠️  Verificando por erros de inicialização:\n")

if "[chart-init ERROR]" in html:
    print("⚠️  Há erros de inicialização de charts!")
    # Extrair ocorrências
    for line in html.split("\n"):
        if "[chart-init ERROR]" in line:
            print(f"   {line[:120]}...")
else:
    print("✅ Sem erros de inicialização detectados")

# Verificar se o DATA está injetado
print("\n" + "="*80)
print("📊 Verificando se DATA está injetado:\n")

if "window.DATA = " in html:
    print("✅ DATA está injetado")
    # Achar onde começa
    idx = html.find("window.DATA = ")
    snippet = html[idx:idx+100]
    print(f"   {snippet}...")
else:
    print("❌ DATA NÃO está injetado!")

# Verificar tamanho do HTML
print("\n" + "="*80)
print(f"📏 Tamanho do HTML: {len(html):,} bytes ({len(html.splitlines()):,} linhas)\n")
