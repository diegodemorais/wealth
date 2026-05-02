#!/bin/bash
# Release Gate — checklist técnico mecânico pre-push
#
# Mandato QA (perfil 22-qa.md): bloqueia push se qualquer dos 9 checks falhar.
# Origem: DEV-release-gate-checklist (2026-05-01).
#
# Uso:
#   ./scripts/release_gate.sh              # gate completo (default)
#   ./scripts/release_gate.sh --no-render  # pula Playwright (mais rápido, debug)
#
# Checks executados (em ordem, falha curta-circuita):
#   1. TypeScript (tsc --noEmit + allowlist)
#   2. Build (npm run build)
#   3. Playwright local render
#   4. Playwright semantic smoke
#   5. Pipeline E2E (spec contract)
#   6. Vitest (unit + componente)
#   7. Sanity numérico (release_gate_sanity.py — ranges plausíveis)
#   8. Anti-cliff (release_gate_sanity.py — séries de chart sem cliff vertical)
#   9. Versão dashboard bumpou (warning, não bloqueia — info)
#
# Exit:
#   0 — todos os checks verdes; safe to push
#   1 — pelo menos um falhou; NÃO commitar/pushar

set -e

# ────────────────────────────────────────────────────────────────────────────
# Setup
# ────────────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

VENV_PY="$HOME/claude/finance-tools/.venv/bin/python3"
NO_RENDER=0
for arg in "$@"; do
  case "$arg" in
    --no-render) NO_RENDER=1 ;;
  esac
done

START_TS=$(date +%s)
echo "🔒 RELEASE GATE — checklist mecânico pre-push"
echo "=============================================="
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Check 1: TypeScript
# ────────────────────────────────────────────────────────────────────────────
echo "1️⃣  TypeScript (tsc --noEmit + allowlist)..."
set +e
TSC_OUTPUT=$(cd react-app && npx tsc --noEmit 2>&1)
TSC_RAW_RESULT=$?
set -e

if [ $TSC_RAW_RESULT -ne 0 ]; then
  TSC_REAL_ERRORS=$(echo "$TSC_OUTPUT" | awk '
    BEGIN { skip = 0 }
    /^[^ \t]/ {
      if ($0 ~ /^\.next\/dev\/types\/validator\.ts/         ||
          $0 ~ /^tests\/data-validation\.test\.ts/          ||
          $0 ~ /^src\/__tests__\/asset-integrity\.test\.ts/ ||
          $0 ~ /^src\/__tests__\/benchmark-features\.test\.tsx/ ||
          $0 ~ /^src\/__tests__\/mc-canonico\.test\.ts/     ||
          $0 ~ /^src\/store\/__tests__\/dashboardStore\.test\.ts/ ||
          $0 ~ /^src\/utils\/__tests__\/dataWiring\.test\.ts/) {
        skip = 1; next
      } else {
        skip = 0
      }
    }
    skip == 0 { print }
  ' || true)

  if [ -n "$TSC_REAL_ERRORS" ]; then
    echo "❌ TypeScript errors found — fix before pushing:"
    echo "$TSC_REAL_ERRORS"
    exit 1
  fi
fi
echo "✅ TypeScript OK (src/ limpo)"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Check 2: Build
# ────────────────────────────────────────────────────────────────────────────
echo "2️⃣  Build (npm run build)..."
(cd react-app && npm run build) > /tmp/release_gate_build.log 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Build falhou:"
  cat /tmp/release_gate_build.log
  exit 1
fi
echo "✅ Build OK"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Check 3+4: Playwright (local render + semantic smoke)
# ────────────────────────────────────────────────────────────────────────────
if [ $NO_RENDER -eq 1 ]; then
  echo "3️⃣ /4️⃣  Playwright SKIPPED (--no-render)"
  echo ""
else
  echo "3️⃣  Playwright local render..."
  set +e
  (cd react-app && LOCAL_RENDER_ONLY=1 npx playwright test --project=local --reporter=line) 2>&1
  LOCAL_PW_RESULT=$?
  set -e
  if [ $LOCAL_PW_RESULT -ne 0 ]; then
    echo "❌ Playwright local render FAILED — erros JS ou hydration mismatch detectados"
    exit 1
  fi
  echo "✅ Playwright local OK"
  echo ""

  echo "4️⃣  Playwright semantic smoke..."
  set +e
  (cd react-app && SEMANTIC_ONLY=1 npx playwright test --project=semantic --reporter=line) 2>&1
  SEMANTIC_PW_RESULT=$?
  set -e
  if [ $SEMANTIC_PW_RESULT -ne 0 ]; then
    echo "❌ Playwright semantic FAILED — campos críticos mostrando '—' ou nulo"
    exit 1
  fi
  echo "✅ Playwright semantic OK"
  echo ""
fi

# ────────────────────────────────────────────────────────────────────────────
# Check 5: Pipeline E2E (spec contract)
# ────────────────────────────────────────────────────────────────────────────
echo "5️⃣  Pipeline E2E — spec contract..."
set +e
"$VENV_PY" -m pytest scripts/tests/test_pipeline_e2e.py -q 2>&1
E2E_RESULT=$?
set -e
if [ $E2E_RESULT -ne 0 ]; then
  echo "❌ Pipeline E2E FAILED — data.json tem campos obrigatórios nulos"
  exit 1
fi
echo "✅ Pipeline E2E OK"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Check 6: Vitest
# ────────────────────────────────────────────────────────────────────────────
echo "6️⃣  Vitest unit/component tests..."
set +e
(cd react-app && npm run test -- --run) 2>&1
VITEST_RESULT=$?
set -e
if [ $VITEST_RESULT -ne 0 ]; then
  echo "❌ Vitest FAILED"
  exit 1
fi
echo "✅ Vitest OK"
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Check 7+8: Sanity numérico + Anti-cliff
# ────────────────────────────────────────────────────────────────────────────
echo "7️⃣ /8️⃣  Sanity numérico + Anti-cliff..."
set +e
"$VENV_PY" "$ROOT/scripts/release_gate_sanity.py"
SANITY_RESULT=$?
set -e
if [ $SANITY_RESULT -ne 0 ]; then
  echo "❌ Sanity/anti-cliff FAILED — data.json tem valores fora do range ou cliff vertical"
  exit 1
fi
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Check 9: Versão bumpou (warning soft — não bloqueia)
# ────────────────────────────────────────────────────────────────────────────
echo "9️⃣  Versão dashboard..."
if [ -f "$ROOT/react-app/package.json" ]; then
  CURRENT_VER=$(node -p "require('$ROOT/react-app/package.json').version" 2>/dev/null || echo "?")
  # Compara com último commit
  LAST_VER=$(git show HEAD:react-app/package.json 2>/dev/null | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).version" 2>/dev/null || echo "?")
  if [ "$CURRENT_VER" = "$LAST_VER" ]; then
    echo "⚠️  Versão não bumpou ($CURRENT_VER == $LAST_VER) — auto-deploy bumpa em CI; OK se tudo já foi commitado"
  else
    echo "✅ Versão bumpou: $LAST_VER → $CURRENT_VER"
  fi
fi
echo ""

# ────────────────────────────────────────────────────────────────────────────
# Sucesso
# ────────────────────────────────────────────────────────────────────────────
END_TS=$(date +%s)
ELAPSED=$((END_TS - START_TS))
echo "================================================"
echo "✅ RELEASE GATE PASS — Safe to push (${ELAPSED}s)"
echo "================================================"
exit 0
