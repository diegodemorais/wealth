#!/bin/bash
# Quick Dashboard Test Suite — wrapper para release_gate.sh
#
# Histórico: este script consolidava 7 checks (TS, build, Playwright local/semantic,
# pipeline E2E, vitest). DEV-release-gate-checklist (2026-05-01) extraiu a lógica
# para `scripts/release_gate.sh` e adicionou checks 7+8 (sanity numérico e
# anti-cliff). Mantemos este alias para compatibilidade com fluxos existentes.
#
# Uso:
#   ./scripts/quick_dashboard_test.sh              # release gate completo
#   ./scripts/quick_dashboard_test.sh --no-render  # sem Playwright (debug)
#
# Para o gate completo direto: ./scripts/release_gate.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$SCRIPT_DIR/release_gate.sh" "$@"
