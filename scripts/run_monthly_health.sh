#!/bin/bash
# run_monthly_health.sh — Health check mensal (dia 2 de cada mês, 8h00)
# Verifica: npm tests, validate_data.py, git status, integration health

VENV="/Users/diegodemorais/claude/finance-tools/.venv/bin/python3"
ROOT="/Users/diegodemorais/claude/code/wealth"
LOGS="$ROOT/logs"
LOG="$LOGS/monthly_health.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" | tee -a "$LOG"; }

log "=== Monthly Health Check START ($(date '+%Y-%m')) ==="

# 1. Validate data.json
log "Step 1/3: validate_data.py"
if "$VENV" "$ROOT/scripts/validate_data.py" >> "$LOG" 2>&1; then
    log "Step 1 OK"
else
    log "Step 1 FAILED"
fi

# 2. npm test (vitest)
log "Step 2/3: vitest"
cd "$ROOT/react-app" && npm run test -- --run >> "$LOG" 2>&1
if [ $? -eq 0 ]; then
    log "Step 2 OK"
else
    log "Step 2 FAILED — testes vitest com falha"
fi

# 3. Git status — uncommitted changes inesperados
log "Step 3/3: git status"
UNCOMMITTED=$(git -C "$ROOT" status --porcelain | grep -v '^\?' | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -eq 0 ]; then
    log "Step 3 OK — working tree clean"
else
    log "Step 3 WARN — $UNCOMMITTED arquivo(s) com mudança não commitada"
    git -C "$ROOT" status --short >> "$LOG" 2>&1
fi

log "=== Monthly Health Check DONE ==="
