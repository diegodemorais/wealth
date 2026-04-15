#!/usr/bin/env python3
"""
capture_with_server.py — Captura screenshots rodando um servidor HTTP local
"""

import http.server
import socketserver
import threading
import time
import subprocess
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
PORT = 8765

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

def start_server():
    """Inicia servidor HTTP em thread."""
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🌐 Servidor rodando em http://localhost:{PORT}")
        httpd.serve_forever()

def capture_screenshots():
    """Captura screenshots de cada aba."""
    import json
    from datetime import datetime

    SCREENSHOT_DIR = ROOT / "dashboard" / "audit-screenshots"
    ARCHIVE_DIR = SCREENSHOT_DIR / datetime.now().strftime("%Y%m%d_%H%M%S")
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    tabs = ["now", "portfolio", "performance", "fire", "withdraw", "backtest", "macro"]

    print(f"📸 Capturando screenshots...")
    print(f"📁 Diretório: {ARCHIVE_DIR}\n")

    for i, tab in enumerate(tabs, 1):
        print(f"  [{i}/{len(tabs)}] Capturando '{tab}'... ", end="", flush=True)

        # URL com hash para navegação
        url = f"http://localhost:{PORT}/index.html"

        # Arquivo de saída
        output_file = ARCHIVE_DIR / f"{i:02d}-{tab}-tab.pdf"

        # wkhtmltopdf com delay para JS carregar
        result = subprocess.run(
            [
                "wkhtmltopdf",
                "--quiet",
                "--javascript-delay", "3000",
                "--window-status", "Ready",
                "--dpi", "96",
                "--disable-smart-shrinking",
                url,
                str(output_file)
            ],
            capture_output=True,
            timeout=30
        )

        if result.returncode == 0 and output_file.exists():
            size_kb = output_file.stat().st_size / 1024
            print(f"✅ ({size_kb:.1f}KB)")
        else:
            print(f"❌ Erro: {result.stderr.decode()[:100]}")

    print(f"\n✅ Screenshots salvos em: {ARCHIVE_DIR}")

    # Lista versões anteriores
    versions = sorted([d for d in SCREENSHOT_DIR.iterdir() if d.is_dir()])
    if len(versions) > 1:
        print(f"\n📂 Versões anteriores:")
        for v in versions[-3:]:
            print(f"   - {v.name}")

    return ARCHIVE_DIR

if __name__ == "__main__":
    # Inicie servidor em thread
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Aguarde servidor iniciar
    time.sleep(1)

    try:
        screenshot_dir = capture_screenshots()
        print(f"\n💾 Próximo passo: comparar com versão anterior")
        print(f"   diff {screenshot_dir.parent}/*/01-now-tab.pdf")
    except KeyboardInterrupt:
        print("\n⚠️  Interrompido pelo usuário")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)
