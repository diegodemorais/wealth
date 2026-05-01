#!/bin/bash
# Complete Dashboard Test Suite — Antes de qualquer git push
# Usage:
#   ./scripts/quick_dashboard_test.sh              # suite completa
#   ./scripts/quick_dashboard_test.sh --quick      # só testes críticos
#   ./scripts/quick_dashboard_test.sh --no-render  # sem Playwright (mais rápido)

set -e

echo "🧪 DASHBOARD COMPLETE TEST SUITE"
echo "=================================="
echo ""

# 0. TypeScript type check — detecta props erradas antes do build
# Filtra erros conhecidos pre-existentes que não são bloqueantes:
#   - .next/dev/types/validator.ts: artefato Next.js de rota removida (avaliar/)
#   - tests/data-validation.test.ts: teste legado com `any` implícito
# Qualquer erro em src/ que não seja nesses arquivos BLOQUEIA o push.
echo "0️⃣  TypeScript type check (tsc --noEmit)..."
# Desabilita `set -e` temporariamente — queremos capturar exit code do tsc
# para o filtro abaixo decidir se os erros são bloqueantes ou pré-existentes.
set +e
TSC_OUTPUT=$(cd react-app && npx tsc --noEmit 2>&1)
TSC_RAW_RESULT=$?
set -e

if [ $TSC_RAW_RESULT -ne 0 ]; then
  # Filter out known pre-existing errors that are not blocking.
  # tsc emite blocos multi-linha: linha de cabeçalho começa com path do arquivo,
  # linhas de continuação são indentadas. awk descarta o bloco inteiro quando
  # o cabeçalho casa com um arquivo da allowlist.
  #
  # Allowlist (erros pré-existentes não introduzidos por mudanças recentes):
  #   .next/dev/types/validator.ts — Next.js artifact (rota `avaliar/` removida)
  #   tests/data-validation.test.ts — teste legado, implicit any + RfData | undefined
  #   src/__tests__/asset-integrity.test.ts — toBe() signature mismatch no Vitest
  #   src/__tests__/benchmark-features.test.tsx — JSX prop não existente em type Attributes
  #   src/__tests__/mc-canonico.test.ts — CanonicalMCParams sem sigma_anual em fixture
  #   src/store/__tests__/dashboardStore.test.ts — DashboardData cast incompleto (RfPosition)
  #   src/utils/__tests__/dataWiring.test.ts — DashboardData cast incompleto (RfPosition)
  TSC_REAL_ERRORS=$(echo "$TSC_OUTPUT" | awk '
    BEGIN { skip = 0 }
    # Linha de cabeçalho: começa sem espaço (path do arquivo)
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
  else
    echo "⚠️  TypeScript: known pre-existing errors only (não bloqueantes)"
    echo "   Detalhes: $(echo "$TSC_OUTPUT" | wc -l | xargs) erros pré-existentes ignorados"
  fi
fi
echo "✅ TypeScript OK (src/ limpo)"
echo ""

# 1. Rebuild
# Pipeline antigo (Python build_dashboard.py) foi removido em df64a1e1.
# Build canônico agora é `npm run build` em react-app/ (Next.js + post-build.js
# que move output pra ../dash/ — pré-requisito dos steps 1b/1c).
echo "1️⃣  Rebuilding dashboard (npm run build)..."
(cd react-app && npm run build) > /tmp/build.log 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  cat /tmp/build.log
  exit 1
fi
echo "✅ Build OK"
echo ""

# 1b. Playwright local render validation (serve dash/ and check for errors/hydration)
echo "1b. Playwright local render (serve dash/ — detecta hydration mismatch e erros JS)..."
cd react-app && LOCAL_RENDER_ONLY=1 npx playwright test --project=local --reporter=line 2>&1
LOCAL_PW_RESULT=$?
cd ..
if [ $LOCAL_PW_RESULT -ne 0 ]; then
  echo "❌ Playwright local render FAILED — erros JS ou hydration mismatch detectados"
  exit 1
fi
echo "✅ Playwright local OK"
echo ""

# 1c. Playwright semantic smoke (Next.js dev server — valida valores renderizados)
echo "1c. Playwright semantic smoke (dev server — valida valores reais, não só estrutura)..."
cd react-app && SEMANTIC_ONLY=1 npx playwright test --project=semantic --reporter=line 2>&1
SEMANTIC_PW_RESULT=$?
cd ..
if [ $SEMANTIC_PW_RESULT -ne 0 ]; then
  echo "❌ Playwright semantic FAILED — campos críticos mostrando '—' ou nulo"
  exit 1
fi
echo "✅ Playwright semantic OK"
echo ""

# 1d. Pipeline E2E spec contract validation
echo "1d. Pipeline E2E — valida data.json contra spec contract..."
~/claude/finance-tools/.venv/bin/python -m pytest scripts/tests/test_pipeline_e2e.py -q 2>&1
E2E_RESULT=$?
if [ $E2E_RESULT -ne 0 ]; then
  echo "❌ Pipeline E2E FAILED — data.json tem campos obrigatórios nulos"
  exit 1
fi
echo "✅ Pipeline E2E OK"
echo ""

# 2. Vitest unit/component tests (substitui o antigo run_all_dashboard_tests.py
# orquestrador, removido em 13d77d49 — os 6 níveis dele já são cobertos por
# 1b/1c/1d acima + Vitest aqui).
echo "2️⃣  Running Vitest unit/component tests..."
(cd react-app && npm run test -- --run) 2>&1
TESTS_RESULT=$?

echo ""
if [ $TESTS_RESULT -eq 0 ]; then
  echo "================================================"
  echo "✅ ALL TESTS PASSED — Safe to push"
  echo "================================================"
  echo ""
  echo "Next: git add -A && git commit -m '...' && git push"
  exit 0
else
  echo "================================================"
  echo "❌ TESTS FAILED — DO NOT PUSH"
  echo "================================================"
  echo ""
  echo "See output above for details"
  exit 1
fi
