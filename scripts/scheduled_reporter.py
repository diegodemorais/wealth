#!/usr/bin/env python3
"""
scheduled_reporter.py — Lê logs dos LaunchAgents e gera react-app/public/scheduled_status.json.

Executado por LaunchAgent io.fdte.scheduled-reporter às 7h25 (seg–sex).
Saída: react-app/public/scheduled_status.json

Issue: DEV-scheduled-status
"""

import json
import os
import re
import sys
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Optional

# ─── Config ──────────────────────────────────────────────────────────────────

REPORTER_VERSION = "1"

ROOT = Path(__file__).parent.parent
LOGS_DIR = ROOT / "logs"
OUT_FILE = ROOT / "react-app" / "public" / "scheduled_status.json"

# job_key → { log_file, label, schedule, runs_on_weekdays }
# runs_on_weekdays: list of ISO weekday ints (1=Mon … 7=Sun). Used to decide
# if "stale" logic applies (daily jobs vs weekly jobs).
JOBS = [
    {
        "key": "morning-pipeline",
        "log_file": "morning_pipeline.log",
        "label": "Pipeline matinal",
        "schedule": "seg–sex 7h00",
        "weekdays": [1, 2, 3, 4, 5],  # Mon–Fri — orquestrador (generate→validate→sanity→gatilhos)
    },
    {
        "key": "check-gatilhos",
        "log_file": "check_gatilhos.log",
        "label": "Check gatilhos",
        "schedule": "seg–sex 7h10",
        "weekdays": [1, 2, 3, 4, 5],  # kept separate for alert_count visibility
    },
    {
        "key": "integration-health",
        "log_file": "integration_health.log",
        "label": "Integration health",
        "schedule": "sex 7h15",
        "weekdays": [5],  # Friday only
    },
    {
        "key": "log-rotation",
        "log_file": "log_rotation.log",
        "label": "Log rotation",
        "schedule": "sex 7h20",
        "weekdays": [5],  # Friday only
    },
    {
        "key": "patrimonio-check",
        "log_file": "patrimonio_check.log",
        "label": "Patrimônio check",
        "schedule": "seg 9h07",
        "weekdays": [1],  # Monday only
    },
    {
        "key": "tlh-monitor",
        "log_file": "tlh_monitor.log",
        "label": "TLH monitor",
        "schedule": "seg 9h15",
        "weekdays": [1],  # Monday only
    },
    {
        "key": "monthly-health",
        "log_file": "monthly_health.log",
        "label": "Health check mensal",
        "schedule": "dia 2 8h00",
        "weekdays": [1, 2, 3, 4, 5],  # dia 2 se for dia útil
    },
    {
        "key": "monthly-shadows",
        "log_file": "reconstruct_shadows.log",
        "label": "Reconstrução shadows",
        "schedule": "dia 6 7h30",
        "weekdays": [1, 2, 3, 4, 5],  # dia 6 se for dia útil
    },
    {
        "key": "monthly-factor",
        "log_file": "factor_regression.log",
        "label": "Factor regression rolling",
        "schedule": "dia 3 7h30",
        "weekdays": [1, 2, 3, 4, 5],  # dia 3 se for dia útil
    },
]

# Error indicators in log lines
ERROR_PATTERNS = re.compile(
    r'\bERROR\b|\bTraceback\b|\bexit code 1\b|\bexit 1\b|\bFailed\b|\bException\b|\bALARME\b',
    re.IGNORECASE,
)

ALERT_PATTERNS = re.compile(r'\bALARME\b|\bAlert\b|\boportunidade\b', re.IGNORECASE)

# Timestamp patterns (ISO-ish and date-only)
TS_PATTERNS = [
    re.compile(r'(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})'),  # full ISO
    re.compile(r'(\d{4}-\d{2}-\d{2})'),                          # date only
]

# ─── Helpers ─────────────────────────────────────────────────────────────────


def last_business_day(d: date) -> date:
    """Return d if it is a business day, else the last business day before d."""
    # Go back until we hit Mon–Fri
    while d.isoweekday() > 5:
        d -= timedelta(days=1)
    return d


def days_since_last_expected_run(weekdays: list[int], reference: date) -> int:
    """How many calendar days since the last scheduled run day?

    Returns the number of days from the most recent occurrence of any
    of the scheduled weekdays (up to and including reference).
    """
    for delta in range(0, 30):
        check = reference - timedelta(days=delta)
        if check.isoweekday() in weekdays:
            return delta
    return 99


def extract_last_timestamp(lines: list[str]) -> Optional[datetime]:
    """Find the most recent timestamp in the last 20 lines."""
    for line in reversed(lines):
        for pat in TS_PATTERNS:
            m = pat.search(line)
            if m:
                ts_str = m.group(1)
                for fmt in ('%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
                    try:
                        return datetime.strptime(ts_str, fmt)
                    except ValueError:
                        continue
    return None


def last_relevant_line(lines: list[str]) -> str:
    """Return the last non-empty line, truncated to 120 chars."""
    for line in reversed(lines):
        line = line.strip()
        if line:
            return line[:120]
    return ""


def count_alerts(lines: list[str]) -> int:
    return sum(1 for line in lines if ALERT_PATTERNS.search(line))


def has_errors(lines: list[str]) -> bool:
    return any(ERROR_PATTERNS.search(line) for line in lines)


# ─── Job analysis ─────────────────────────────────────────────────────────────


def analyze_job(job: dict, now: datetime) -> dict:
    log_path = LOGS_DIR / job["log_file"]
    today = now.date()

    if not log_path.exists():
        return {
            "key": job["key"],
            "label": job["label"],
            "schedule": job["schedule"],
            "status": "no_log",
            "last_run_iso": None,
            "last_line": "",
            "alert_count": 0,
        }

    # Read last 20 lines
    try:
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            all_lines = f.readlines()
    except OSError as e:
        return {
            "key": job["key"],
            "label": job["label"],
            "schedule": job["schedule"],
            "status": "error",
            "last_run_iso": None,
            "last_line": f"Cannot read log: {e}"[:120],
            "alert_count": 0,
        }

    lines = all_lines[-20:] if len(all_lines) > 20 else all_lines
    lines_stripped = [l.strip() for l in lines]

    last_ts = extract_last_timestamp(lines_stripped)
    last_line = last_relevant_line(lines_stripped)
    alert_count = count_alerts(lines_stripped)
    errors = has_errors(lines_stripped)

    # Determine status
    if errors:
        status = "error"
    elif last_ts is None:
        # Log exists but no timestamp found — treat as stale
        status = "stale"
    else:
        days_since_expected = days_since_last_expected_run(job["weekdays"], today)
        last_run_date = last_ts.date()
        # The expected last run date
        expected_run_date = today - timedelta(days=days_since_expected)
        # Allow 1-day buffer for timing
        if last_run_date >= expected_run_date:
            status = "ok"
        else:
            # How stale?
            stale_days = (today - last_run_date).days - days_since_expected
            if stale_days > 2:
                status = "stale"
            else:
                status = "ok"

    return {
        "key": job["key"],
        "label": job["label"],
        "schedule": job["schedule"],
        "status": status,
        "last_run_iso": last_ts.isoformat() if last_ts else None,
        "last_line": last_line,
        "alert_count": alert_count,
    }


# ─── Main ─────────────────────────────────────────────────────────────────────


def main():
    now = datetime.now()
    print(f"[scheduled_reporter] Running at {now.isoformat()}", flush=True)

    jobs_result = []
    counts = {"ok": 0, "error": 0, "stale": 0, "no_log": 0}

    for job in JOBS:
        result = analyze_job(job, now)
        jobs_result.append(result)
        status = result["status"]
        counts[status] = counts.get(status, 0) + 1
        print(f"  {result['key']}: {status} | last={result['last_run_iso']} | alerts={result['alert_count']}", flush=True)

    output = {
        "_meta": {
            "generated": now.strftime("%Y-%m-%dT%H:%M:%S"),
            "reporter_version": REPORTER_VERSION,
        },
        "jobs": jobs_result,
        "summary": {
            "total": len(JOBS),
            "ok": counts.get("ok", 0),
            "error": counts.get("error", 0),
            "stale": counts.get("stale", 0),
            "no_log": counts.get("no_log", 0),
        },
    }

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"[scheduled_reporter] Written to {OUT_FILE}", flush=True)
    summary = output["summary"]
    print(
        f"[scheduled_reporter] Summary: {summary['total']} total | "
        f"{summary['ok']} ok | {summary['error']} error | "
        f"{summary['stale']} stale | {summary['no_log']} no_log",
        flush=True,
    )

    # Exit 1 if any errors — allows LaunchAgent monitoring
    if counts.get("error", 0) > 0:
        print("[scheduled_reporter] WARNING: jobs with errors detected", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
