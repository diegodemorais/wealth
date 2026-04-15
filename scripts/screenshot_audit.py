#!/usr/bin/env python3
"""
screenshot_audit.py — Captura e compara screenshots do dashboard usando html2canvas

Uso:
    python3 scripts/screenshot_audit.py
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
DASHBOARD_HTML = ROOT / "index.html"
SCREENSHOT_DIR = ROOT / "dashboard" / "audit-screenshots"
ARCHIVE_DIR = SCREENSHOT_DIR / datetime.now().strftime("%Y-%m-%d_%H-%M-%S")

# Criar diretório
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

# Criar HTML auxiliar que captura screenshots via html2canvas
CAPTURE_HTML = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <style>
        body {{ margin: 0; padding: 10px; background: #f5f5f5; }}
        iframe {{ width: 100%; height: 900px; border: 1px solid #ccc; margin: 20px 0; }}
        button {{ padding: 10px 20px; margin: 5px; cursor: pointer; }}
    </style>
</head>
<body>
    <h1>📸 Dashboard Screenshot Audit</h1>
    <p>Capturando screenshots de cada aba...</p>
    <div id="status"></div>

    <iframe id="dashboard" src="file://{str(DASHBOARD_HTML)}"></iframe>

    <script>
        const tabs = ['now', 'portfolio', 'performance', 'fire', 'withdraw', 'backtest', 'macro'];
        const statusDiv = document.getElementById('status');
        const iframe = document.getElementById('dashboard');

        async function captureTab(tabName) {{
            try {{
                const iframeContent = iframe.contentDocument || iframe.contentWindow.document;

                // Clique na aba
                const tabBtn = iframeContent.querySelector(`[data-tab="{tabName}"]`) ||
                              iframeContent.querySelector(`button:contains("{tabName}")`);
                if (tabBtn) tabBtn.click();

                // Aguarde renderização
                await new Promise(r => setTimeout(r, 1500));

                // Capture a aba
                const canvas = await html2canvas(iframeContent.body, {{
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                }});

                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `${{tabName}}.png`;
                link.click();

                statusDiv.innerHTML += `<p>✅ Capturado: ${{tabName}}</p>`;
            }} catch (err) {{
                statusDiv.innerHTML += `<p>❌ Erro em ${{tabName}}: ${{err.message}}</p>`;
            }}
        }}

        (async () => {{
            for (const tab of tabs) {{
                await captureTab(tab);
            }}
            statusDiv.innerHTML += '<p>✅ Concluído!</p>';
        }})();
    </script>
</body>
</html>
"""

print("📸 Screenshot Audit — Dashboard")
print(f"Diretório: {ARCHIVE_DIR}")
print("\n⚠️  Abordagem: html2canvas (renderização no navegador)")
print("Para screenshots completos, use:")
print("  - wkhtmltopdf (instale com: apt-get install wkhtmltopdf)")
print("  - Playwright (instale com: pip install playwright && playwright install)")
print("\nAlternativa rápida: use /dashboard-pdf skill para gerar PDF com screenshots")
