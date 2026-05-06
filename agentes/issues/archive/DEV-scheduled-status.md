# DEV-scheduled-status — Dashboard: Status das Rotinas Agendadas

| Campo | Valor |
|-------|-------|
| **Status** | Doing |
| **Dono** | Dev |
| **Prioridade** | 🟠 Média |
| **Aberta** | 2026-05-06 |

---

## Contexto

7 LaunchAgents ativos (`io.fdte.*`) rodam scripts de integridade seg-sex. Hoje o resultado fica só em `logs/*.log` — Diego não tem visibilidade no dashboard. Issue implementa visibilidade completa.

---

## Arquitetura

### 1. `scripts/scheduled_reporter.py` (novo)

Roda após todos os jobs diários (LaunchAgent seg-sex 7h25). Lê `logs/*.log`, extrai status de cada job, escreve `react-app/public/scheduled_status.json`.

**Mapa de jobs a monitorar:**

| job_key | log_file | schedule_label |
|---------|----------|----------------|
| `pipeline-daily` | `pipeline_daily.log` | seg–sex 7h00 |
| `validate-data` | `validate_data.log` | seg–sex 7h05 |
| `check-gatilhos` | `check_gatilhos.log` | seg–sex 7h10 |
| `integration-health` | `integration_health.log` | sex 7h15 |
| `log-rotation` | `log_rotation.log` | sex 7h20 |
| `patrimonio-check` | `patrimonio_check.log` | seg 9h07 |
| `tlh-monitor` | `tlh_monitor.log` | seg 9h15 |

**Lógica de status por job:**
- Lê últimas 20 linhas do log
- Extrai timestamp da última linha com timestamp (formato `YYYY-MM-DD` ou ISO)
- `status: "ok"` — log tem entrada hoje ou último dia útil esperado, sem linha com `ERROR`/`exit 1`/`Traceback`
- `status: "error"` — log contém `ERROR`, `Traceback`, `exit code 1`, ou `ALARME` (para check-gatilhos)
- `status: "stale"` — último run há >2 dias úteis sem justificativa (ex: integration-health só roda sex)
- `status: "no_log"` — arquivo não existe ainda
- `last_run_iso` — timestamp ISO do último run detectado (ou null)
- `last_line` — última linha relevante do log (resumo, truncado a 120 chars)
- `alert_count` — número de ALARMEs/alertas detectados (0 se nenhum)

**Output `react-app/public/scheduled_status.json`:**
```json
{
  "_meta": { "generated": "2026-05-06T07:25:00", "reporter_version": "1" },
  "jobs": [
    {
      "key": "pipeline-daily",
      "label": "Pipeline diário",
      "schedule": "seg–sex 7h00",
      "status": "ok",
      "last_run_iso": "2026-05-06T07:00:42",
      "last_line": "data.json gerado com sucesso (478KB)",
      "alert_count": 0
    }
  ],
  "summary": {
    "total": 7,
    "ok": 6,
    "error": 0,
    "stale": 1,
    "no_log": 0
  }
}
```

### 2. LaunchAgent `io.fdte.scheduled-reporter.plist`

`~/Library/LaunchAgents/io.fdte.scheduled-reporter.plist`  
seg–sex 7h25, `scheduled_reporter.py`, log em `logs/scheduled_reporter.log`.

### 3. Componente React: `<ScheduledStatus />`

**Localização no dashboard:** após o componente `<ChangelogSection />` (ou equivalente) na aba que o contém. Usar o mesmo padrão de `<CollapsibleSection>` já existente — colapsado por default.

**Dados:** busca `/scheduled_status.json` via `fetch` no client (não via `data.json` — arquivo independente). Hook `useScheduledStatus()` em `react-app/src/hooks/`.

**Layout do bloco (aberto):**

```
┌─ Rotinas Agendadas ────────────────────────── [▼ 7 jobs / 6 ✅ 1 ⚠️] ─┐
│ pipeline-daily      seg–sex 7h00   ✅  hoje 7h00                        │
│ validate-data       seg–sex 7h05   ✅  hoje 7h05                        │
│ check-gatilhos      seg–sex 7h10   ✅  hoje 7h10   2 ALARMEs            │
│ patrimonio-check    seg 9h07       ✅  seg 9h07                         │
│ tlh-monitor         seg 9h15       ✅  seg 9h15    1 oportunidade        │
│ integration-health  sex 7h15       ✅  sex 7h15                         │
│ log-rotation        sex 7h20       ✅  sex 7h20                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- Status badge: `✅` ok, `⚠️` stale, `🔴` error, `—` no_log
- `last_run_iso` formatado como "hoje HH:mm", "ontem HH:mm", ou "DD/MM HH:mm"
- `alert_count > 0`: mostrar em badge laranja ao lado
- Privacy mode: não há valores monetários neste componente — sem mascaramento necessário

**Header colapsado mostra resumo:** `7 jobs · 6 ✅ · 1 ⚠️` ou `Todos OK` se summary.error=0 e summary.stale=0.

### 4. DiagnosticBanner na NOW page

Se `summary.error > 0` ou `summary.stale > 0`, exibir `<DiagnosticBanner>` na NOW page (já existente, reusar padrão):

- `error`: `🔴 Rotina com falha: {job.label} — {job.last_line}. Ver logs/.`
- `stale`: `⚠️ Rotina sem execução: {job.label} (último run: {data})`
- Múltiplos: mostrar o mais grave primeiro, "e mais N"

Se `summary.error=0 AND summary.stale=0`: sem banner (não poluir o estado normal).

---

## Critério de Done

- [ ] `scripts/scheduled_reporter.py` implementado e testado localmente
- [ ] LaunchAgent `io.fdte.scheduled-reporter` carregado e ativo
- [ ] `react-app/public/scheduled_status.json` gerado corretamente
- [ ] `useScheduledStatus()` hook implementado
- [ ] `<ScheduledStatus />` componente após Changelog — colapsado por default
- [ ] DiagnosticBanner na NOW page quando error ou stale
- [ ] Privacy mode: componente não vaza valores monetários
- [ ] Testes: vitest para hook + componente, Playwright para smoke
- [ ] Release gate verde
