#!/bin/bash
# capture_screenshots.sh — Captura screenshots de cada aba do dashboard usando wkhtmltopdf

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DASHBOARD="$ROOT/index.html"
SCREENSHOT_DIR="$ROOT/dashboard/audit-screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_DIR="$SCREENSHOT_DIR/$TIMESTAMP"

# Criar diretório
mkdir -p "$ARCHIVE_DIR"

echo "📸 Capturando screenshots do dashboard..."
echo "📁 Diretório: $ARCHIVE_DIR"
echo ""

TABS=("now" "portfolio" "performance" "fire" "withdraw" "backtest" "macro")

for tab in "${TABS[@]}"; do
    echo -n "  Capturando aba '$tab'... "

    # Crie URL com parâmetro de aba
    TAB_URL="file://$DASHBOARD#tab=$tab"

    # Capture como PDF primeiro
    PDF_FILE="$ARCHIVE_DIR/${tab}-tab.pdf"
    wkhtmltopdf \
        --quiet \
        --enable-local-file-access \
        --window-status "Ready" \
        --javascript-delay 2000 \
        "$TAB_URL" \
        "$PDF_FILE" 2>/dev/null || true

    if [ -f "$PDF_FILE" ]; then
        echo "✅ PDF"
    else
        echo "⚠️  Falha em PDF, tentando apenas HTML..."
    fi
done

echo ""
echo "✅ Screenshots capturados em: $ARCHIVE_DIR"
echo ""
echo "📊 Próximas etapas:"
echo "  1. Revisar PDFs em $ARCHIVE_DIR"
echo "  2. Comparar com versão anterior: ls $SCREENSHOT_DIR"
echo "  3. Validar regressions visuais"
