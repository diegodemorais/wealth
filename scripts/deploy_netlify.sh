#!/usr/bin/env bash
# deploy_netlify.sh — Faz deploy do dashboard.html para Netlify
#
# Uso:
#   bash scripts/deploy_netlify.sh
#
# Requer: netlify CLI instalado + NETLIFY_AUTH_TOKEN no ambiente
# Site: stunning-crepe-8aa19f (wealth-diego)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."
DASHBOARD_HTML="$ROOT/analysis/dashboard.html"
DEPLOY_DIR="$(mktemp -d)"
NETLIFY_SITE_ID="stunning-crepe-8aa19f"

# Token: NETLIFY_TOKEN (settings.json) > NETLIFY_AUTH_TOKEN > .netlify_token file
if [ -n "$NETLIFY_TOKEN" ]; then
  NETLIFY_AUTH_TOKEN="$NETLIFY_TOKEN"
elif [ -z "$NETLIFY_AUTH_TOKEN" ]; then
  TOKEN_FILE="$ROOT/.netlify_token"
  if [ -f "$TOKEN_FILE" ]; then
    NETLIFY_AUTH_TOKEN="$(cat "$TOKEN_FILE")"
  else
    echo "❌ NETLIFY_TOKEN / NETLIFY_AUTH_TOKEN não definidos e .netlify_token não encontrado"
    exit 1
  fi
fi

if [ ! -f "$DASHBOARD_HTML" ]; then
  echo "❌ dashboard.html não encontrado: $DASHBOARD_HTML"
  exit 1
fi

echo "📦 Preparando deploy..."
cp "$DASHBOARD_HTML" "$DEPLOY_DIR/index.html"

echo "🚀 Deployando para Netlify (site: $NETLIFY_SITE_ID)..."
DEPLOY_OUTPUT=$(netlify deploy \
  --dir="$DEPLOY_DIR" \
  --prod \
  --auth="$NETLIFY_AUTH_TOKEN" \
  --site="$NETLIFY_SITE_ID" 2>&1)

rm -rf "$DEPLOY_DIR"

echo "$DEPLOY_OUTPUT"

# Extrair URL do output
PROD_URL=$(echo "$DEPLOY_OUTPUT" | grep "Production URL:" | awk '{print $NF}')
if [ -n "$PROD_URL" ]; then
  echo ""
  echo "✅ Dashboard online: $PROD_URL"
  echo "🔑 Senha: diego2040"
fi
