#!/usr/bin/env python3
"""
send_dashboard_email.py — Envia os 2 PDFs do dashboard por email via Mail.app (AppleScript).

Uso:
    python3 scripts/send_dashboard_email.py
    python3 scripts/send_dashboard_email.py --to outro@email.com

Requer: macOS Mail.app configurado com a conta de email.
"""

import argparse
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent.parent
PDF_ABERTO  = ROOT / "analysis" / "dashboard_aberto.pdf"
PDF_FECHADO = ROOT / "analysis" / "dashboard_fechado.pdf"

DEFAULT_TO = "diegodemorais@gmail.com"


def send_via_mailapp(to: str) -> None:
    hoje = date.today().strftime("%d/%m/%Y")

    for pdf in [PDF_ABERTO, PDF_FECHADO]:
        if not pdf.exists():
            print(f"❌ PDF não encontrado: {pdf}", file=sys.stderr)
            sys.exit(1)

    script = f"""
tell application "Mail"
  set theMessage to make new outgoing message with properties {{¬
    subject:"Dashboard Carteira — {hoje}", ¬
    content:"Dashboard da carteira gerado em {hoje}.\\n\\nAnexos:\\n  • dashboard_aberto.pdf — valores visíveis\\n  • dashboard_fechado.pdf — valores ocultos (modo privado)\\n\\n— Carteira Diego / wealth system", ¬
    visible:false}}
  tell theMessage
    make new to recipient with properties {{address:"{to}"}}
    make new attachment with properties {{file name:POSIX file "{PDF_ABERTO}"}}
    make new attachment with properties {{file name:POSIX file "{PDF_FECHADO}"}}
    send
  end tell
end tell
return "ok"
"""
    result = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if result.returncode != 0 or "ok" not in result.stdout:
        print(f"❌ Mail.app falhou:\n{result.stderr}", file=sys.stderr)
        sys.exit(1)
    print(f"✅ Email enviado para {to} via Mail.app")


def main():
    parser = argparse.ArgumentParser(description="Envia PDFs do dashboard por email")
    parser.add_argument("--to", default=DEFAULT_TO, help="Destinatário")
    args = parser.parse_args()

    print(f"📧 Destinatário: {args.to}")
    print(f"📎 {PDF_ABERTO.name} ({PDF_ABERTO.stat().st_size // 1024}KB)")
    print(f"📎 {PDF_FECHADO.name} ({PDF_FECHADO.stat().st_size // 1024}KB)")
    print("📤 Enviando via Mail.app...")
    send_via_mailapp(args.to)


if __name__ == "__main__":
    main()
