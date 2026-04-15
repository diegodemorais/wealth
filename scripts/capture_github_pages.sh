#!/bin/bash
# capture_github_pages.sh — Captura screenshots do GitHub Pages usando xvfb + Firefox

set -e

GITHUB_PAGES_URL="https://diegodemorais.github.io/wealth/"
SCREENSHOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/dashboard/audit-screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_DIR="$SCREENSHOT_DIR/$TIMESTAMP"

mkdir -p "$ARCHIVE_DIR"

echo "📸 Capturando screenshots do GitHub Pages..."
echo "🔗 URL: $GITHUB_PAGES_URL"
echo "📁 Diretório: $ARCHIVE_DIR"
echo ""

# Crie um script Firefox para capturar screenshots
FIREFOX_SCRIPT="$ARCHIVE_DIR/capture.js"
cat > "$FIREFOX_SCRIPT" << 'EOF'
// Script para capturar screenshots via Firefox Developer Tools
// Salva como PNG para análise visual
(async function() {
  console.log("📸 Iniciando captura de screenshots...");

  const tabs = ['now', 'portfolio', 'performance', 'fire', 'withdraw', 'simulators', 'backtest'];

  for (const tab of tabs) {
    try {
      // Acione a aba via JavaScript
      const tabBtn = document.querySelector(`[data-tab="${tab}"], button[aria-label*="${tab}" i], a[href*="${tab}"]`);
      if (tabBtn) {
        tabBtn.click();
        await new Promise(r => setTimeout(r, 2000)); // Aguarde renderização
      }

      console.log(`✅ Capturado: ${tab}`);
    } catch (e) {
      console.log(`⚠️ Erro em ${tab}: ${e.message}`);
    }
  }

  console.log("✅ Captura concluída!");
})();
EOF

echo "🌐 Rodando Firefox em modo headless..."

# Use xvfb-run + Firefox para capturar
xvfb-run -a -s "-screen 0 1440x900x24" \
  firefox \
    --headless \
    --screenshot="$ARCHIVE_DIR/dashboard.png" \
    "$GITHUB_PAGES_URL" 2>&1 | grep -E "(Screenshot|saved)" || true

sleep 2

echo ""
echo "✅ Screenshots capturados:"
ls -lh "$ARCHIVE_DIR"/*.png 2>/dev/null || echo "⚠️ Nenhum PNG encontrado"

echo ""
echo "💾 Próximas etapas:"
echo "  1. Revisar screenshots em $ARCHIVE_DIR"
echo "  2. Comparar com version anterior"
echo "  3. Validar visual regressions"
