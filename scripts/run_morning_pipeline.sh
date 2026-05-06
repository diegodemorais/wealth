#!/bin/bash
# run_morning_pipeline.sh — Cadeia matinal de integridade (seg-sex 7h00)
# Dependências causais: steps 1-3 bloqueantes; step 4 (gatilhos) informativo.
# Cada script escreve no seu próprio log; este script escreve o resumo de orquestração.

VENV="/Users/diegodemorais/claude/finance-tools/.venv/bin/python3"
ROOT="/Users/diegodemorais/claude/code/wealth"
LOGS="$ROOT/logs"
SUMMARY="$LOGS/morning_pipeline.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" | tee -a "$SUMMARY"; }

log "=== Morning Pipeline START ==="

# Step 1: Pipeline completo — dados frescos
log "Step 1/4: generate_data.py"
if "$VENV" "$ROOT/scripts/generate_data.py" >> "$LOGS/pipeline_daily.log" 2>&1; then
    log "Step 1 OK"
else
    log "Step 1 FAILED — chain aborted"
    exit 1
fi

# Step 2: Validação estrutural do data.json
log "Step 2/4: validate_data.py"
if "$VENV" "$ROOT/scripts/validate_data.py" >> "$LOGS/validate_data.log" 2>&1; then
    log "Step 2 OK"
else
    log "Step 2 FAILED — chain aborted"
    exit 1
fi

# Step 3: Sanidade de ranges e anti-cliff
log "Step 3/4: release_gate_sanity.py"
if "$VENV" "$ROOT/scripts/release_gate_sanity.py" >> "$LOGS/release_gate_sanity.log" 2>&1; then
    log "Step 3 OK"
else
    log "Step 3 FAILED — chain aborted"
    exit 1
fi

# Step 4: Gatilhos da carteira — informativo, não bloqueia a cadeia
log "Step 4/4: check_gatilhos.py --alarme"
"$VENV" "$ROOT/scripts/check_gatilhos.py" --alarme >> "$LOGS/check_gatilhos.log" 2>&1 || true
log "Step 4 done"

log "=== Morning Pipeline DONE ==="
