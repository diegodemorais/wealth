#!/usr/bin/env bash
# deploy_dashboard.sh — gera e publica dashboard em GitHub Pages
# Uso: ./scripts/deploy_dashboard.sh [--skip-scripts]
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="$HOME/claude/finance-tools/.venv/bin/python3"
DASH_REPO="$HOME/tmp/wealth-dash"
DASH_REPO_URL="https://github.com/diegodemorais/wealth-dash.git"

echo "🚀 Deploy dashboard — $(date '+%Y-%m-%d %H:%M:%S')"

# ── 1. Gerar dados ────────────────────────────────────────────
echo ""
echo "▶ generate_data.py $*"
cd "$ROOT"
$VENV scripts/generate_data.py "$@"

# ── 2. Build HTML ─────────────────────────────────────────────
echo ""
echo "▶ build_dashboard.py"
$VENV scripts/build_dashboard.py

# ── 3. Garantir repo wealth-dash clonado ─────────────────────
if [ ! -d "$DASH_REPO/.git" ]; then
  echo ""
  echo "▶ clonando wealth-dash..."
  mkdir -p "$(dirname "$DASH_REPO")"
  git clone "$DASH_REPO_URL" "$DASH_REPO"
else
  echo ""
  echo "▶ atualizando wealth-dash (pull)..."
  git -C "$DASH_REPO" pull --ff-only origin main
fi

# ── 4. Copiar index.html ──────────────────────────────────────
cp "$ROOT/dashboard/index.html" "$DASH_REPO/index.html"

# ── 5. Commit + push ─────────────────────────────────────────
cd "$DASH_REPO"
git add index.html

if git diff --cached --quiet; then
  echo ""
  echo "ℹ️  Nenhuma mudança no index.html — nada a publicar."
else
  DATE_BRT=$(TZ="America/Sao_Paulo" date '+%Y-%m-%d %H:%M')
  git commit -m "chore: atualizar dashboard $DATE_BRT"
  git push origin main
  echo ""
  echo "✅ Publicado em https://diegodemorais.github.io/wealth-dash/"
fi
