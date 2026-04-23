#!/usr/bin/env python3
"""
Quarterly Maintenance Audit
============================

Automated script that runs quarterly to:
- Scan for new components in react-app/src/components/dashboard
- Audit spec.json changes (drift detection)
- Run Phase 1 tests (config sync)
- Count @ts-ignore pragmas and alert on new ones
- Generate markdown report to /tmp/quarterly_audit_<date>.txt

Usage:
    python3 scripts/maintenance/quarterly_audit.py [--diff-weeks N]

Options:
    --diff-weeks N    Look back N weeks for spec.json changes (default: 13 for 1 quarter)
    --output FILE     Write report to FILE instead of /tmp/quarterly_audit_<date>.txt
"""

import os
import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path
import argparse


def get_git_root():
    """Get git repository root."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        print("❌ Not in a git repository")
        sys.exit(1)


def count_components(git_root):
    """Count React components in dashboard folder."""
    component_dir = Path(git_root) / "react-app" / "src" / "components" / "dashboard"
    if not component_dir.exists():
        return {"count": 0, "files": []}

    tsx_files = sorted(component_dir.glob("**/*.tsx"))
    return {
        "count": len(tsx_files),
        "files": [f.name for f in tsx_files],
    }


def audit_spec_json_drift(git_root, weeks_back=13):
    """Check for spec.json changes in the last N weeks."""
    spec_path = Path(git_root) / "agentes" / "contexto" / "spec.json"
    if not spec_path.exists():
        return {
            "exists": False,
            "commits": [],
            "drift_detected": False,
            "note": "spec.json not found",
        }

    since_date = (datetime.now() - timedelta(weeks=weeks_back)).isoformat()
    try:
        result = subprocess.run(
            [
                "git",
                "log",
                "--oneline",
                f"--since={since_date}",
                "--",
                str(spec_path.relative_to(git_root)),
            ],
            cwd=git_root,
            capture_output=True,
            text=True,
        )
        commits = result.stdout.strip().split("\n") if result.stdout.strip() else []
        return {
            "exists": True,
            "commits": commits,
            "drift_detected": len(commits) > 0,
            "note": f"{len(commits)} commits in last {weeks_back} weeks",
        }
    except Exception as e:
        return {
            "exists": True,
            "commits": [],
            "drift_detected": False,
            "error": str(e),
        }


def run_phase1_tests(git_root):
    """Run Phase 1 config sync tests."""
    try:
        result = subprocess.run(
            [
                "python3",
                "-m",
                "pytest",
                "scripts/tests/test_spec_config_sync.py",
                "-v",
            ],
            cwd=git_root,
            capture_output=True,
            text=True,
            timeout=60,
        )
        return {
            "passed": result.returncode == 0,
            "output": result.stdout[-500:] if result.stdout else "No output",
            "error": result.stderr[-500:] if result.stderr else "",
        }
    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "output": "Test timed out (>60s)",
            "error": "Timeout",
        }
    except FileNotFoundError:
        return {
            "passed": False,
            "output": "pytest not found",
            "error": "pytest missing",
        }


def count_typescript_pragmas(git_root):
    """Count @ts-ignore and @ts-expect-error pragmas."""
    react_app = Path(git_root) / "react-app" / "src"
    if not react_app.exists():
        return {"count": 0, "locations": []}

    pragmas = {}
    for tsx_file in react_app.rglob("*.tsx"):
        try:
            with open(tsx_file, "r", encoding="utf-8") as f:
                for line_num, line in enumerate(f, 1):
                    if "@ts-ignore" in line or "@ts-expect-error" in line:
                        rel_path = tsx_file.relative_to(git_root)
                        pragmas[str(rel_path)] = pragmas.get(str(rel_path), 0) + 1
        except (UnicodeDecodeError, IOError):
            pass

    return {
        "count": sum(pragmas.values()),
        "by_file": pragmas,
    }


def generate_report(
    git_root, output_file=None, weeks_back=13
):
    """Generate quarterly audit report."""
    timestamp = datetime.now().isoformat(timespec="seconds")
    if output_file is None:
        output_file = f"/tmp/quarterly_audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

    components = count_components(git_root)
    spec_drift = audit_spec_json_drift(git_root, weeks_back)
    phase1 = run_phase1_tests(git_root)
    pragmas = count_typescript_pragmas(git_root)

    report = f"""# Quarterly Maintenance Audit Report
Generated: {timestamp}
Repository: {git_root}

## Components
- Count: {components["count"]}
- Status: {'✅ OK' if components['count'] > 0 else '⚠️ No components found'}
- Recent files: {', '.join(components['files'][-5:]) if components['files'] else 'None'}

## Spec.json Drift
- Path: agentes/contexto/spec.json
- Exists: {'✅ Yes' if spec_drift['exists'] else '❌ No'}
- Drift detected (last {weeks_back} weeks): {'✅ Yes' if spec_drift['drift_detected'] else '❌ No'}
- {spec_drift['note']}
- Commits: {len(spec_drift['commits'])}
{f"  {chr(10).join(spec_drift['commits'][:5])}" if spec_drift['commits'] else "  (none)"}

## Phase 1 Tests (Config Sync)
- Status: {'✅ PASS' if phase1['passed'] else '❌ FAIL'}
- Output: {phase1['output'][:200]}
{"Error: " + phase1['error'][:200] if phase1['error'] else ""}

## TypeScript Pragmas
- Total @ts-ignore/@ts-expect-error: {pragmas['count']}
- Status: {'✅ None found' if pragmas['count'] == 0 else f'⚠️ {pragmas["count"]} pragmas in use'}
- By file: {json.dumps(pragmas['by_file'], indent=2) if pragmas['by_file'] else '(none)'}

## Recommendations
"""

    if not spec_drift["drift_detected"]:
        report += "1. ✅ Spec.json stable (no changes)\n"
    else:
        report += f"1. 🔔 Spec.json changed {len(spec_drift['commits'])} time(s) — review for config sync\n"

    if not phase1["passed"]:
        report += "2. ❌ Phase 1 tests failing — investigate config sync issues\n"
    else:
        report += "2. ✅ Phase 1 tests passing\n"

    if pragmas["count"] > 0:
        report += f"3. 🔴 {pragmas['count']} TS pragmas in use — resolve type errors\n"
    else:
        report += "3. ✅ No TypeScript pragmas\n"

    report += f"4. 📊 Component count: {components['count']} (track growth)\n"
    report += "\n---\n"
    report += "Generated by: scripts/maintenance/quarterly_audit.py\n"

    # Write report
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"✅ Report written to: {output_file}")
        print(report)
        return output_file
    except IOError as e:
        print(f"❌ Failed to write report: {e}")
        print(report)
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Quarterly maintenance audit for React dashboard"
    )
    parser.add_argument(
        "--diff-weeks",
        type=int,
        default=13,
        help="Look back N weeks for spec.json changes (default: 13)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Write report to FILE (default: /tmp/quarterly_audit_<timestamp>.txt)",
    )

    args = parser.parse_args()
    git_root = get_git_root()
    output_file = generate_report(
        git_root, output_file=args.output, weeks_back=args.diff_weeks
    )

    if output_file:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
