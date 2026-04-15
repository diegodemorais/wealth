#!/bin/bash
# Capturar screenshots de cada aba usando as rotas diretas do Next.js

set -e

BASE_URL="https://diegodemorais.github.io/wealth"
SCREENSHOT_DIR="/home/user/wealth/react-app/audit-screenshots"
mkdir -p "$SCREENSHOT_DIR"

echo "📸 Capturando screenshots de cada aba do GitHub Pages..."
echo ""

# Array de abas com suas rotas
declare -a TABS=(
  "01-now-tab.png:/"
  "02-portfolio-tab.png:/portfolio"
  "03-performance-tab.png:/performance"
  "04-fire-tab.png:/fire"
  "05-withdraw-tab.png:/withdraw"
  "06-simuladores-tab.png:/simulators"
  "07-backtest-tab.png:/backtest"
)

COUNT=0
for entry in "${TABS[@]}"; do
  IFS=':' read -r filename route <<< "$entry"
  COUNT=$((COUNT + 1))

  url="${BASE_URL}${route}"
  output_file="$SCREENSHOT_DIR/$filename"
  pdf_file="/tmp/${filename%.png}.pdf"

  echo -n "  [$COUNT/7] Capturando $filename ($route)... "

  # Capture com wkhtmltopdf com delay para JavaScript carregar
  if wkhtmltopdf \
    --enable-local-file-access \
    --javascript-delay 4000 \
    --window-status "Ready" \
    --dpi 96 \
    --page-size "A4" \
    --disable-smart-shrinking \
    "$url" "$pdf_file" 2>/dev/null; then

    # Converter PDF para PNG
    if pdftoppm "$pdf_file" "/tmp/${filename%.png}" -png -singlefile 2>/dev/null; then
      if mv "/tmp/$filename" "$output_file" 2>/dev/null; then
        size_kb=$(du -h "$output_file" | cut -f1)
        echo "✅ ($size_kb)"
        rm -f "$pdf_file"
      else
        echo "❌ Move failed"
      fi
    else
      echo "❌ PNG conversion failed"
    fi
  else
    echo "❌ PDF generation failed"
  fi
done

echo ""
echo "✅ Screenshots capturados:"
ls -lh "$SCREENSHOT_DIR"/*.png 2>/dev/null | awk '{printf "   %s (%s)\n", $9, $5}'

echo ""
echo "📊 Total de arquivos:"
find "$SCREENSHOT_DIR" -name "*.png" | wc -l
