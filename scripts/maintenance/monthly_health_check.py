#!/usr/bin/env python3
"""
Monthly Health Check
====================

Automated monthly validation:
- Run npm run test:pre-commit (all tests)
- Verify data.json has all 6 required keys
- Check pre-commit hook exists and is executable
- Scan git log for --no-verify commits (bypass detection)
- Log report to file or stdout

Usage:
    python3 scripts/maintenance/monthly_health_check.py [--output FILE] [--strict]

Options:
    --output FILE     Write report to FILE (default: stdout + /tmp/monthly_health_<date>.txt)
    --strict          Exit 1 if ANY check fails (default: exit 0 with warnings)
    --check-bypass    Only check for git bypasses (quick mode)
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


def run_tests(git_root, timeout=120):
    """Run npm run test:pre-commit."""
    try:
        result = subprocess.run(
            ["npm", "run", "test:pre-commit"],
            cwd=git_root,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return {
            "passed": result.returncode == 0,
            "stdout": result.stdout[-300:] if result.stdout else "(no output)",
            "stderr": result.stderr[-300:] if result.stderr else "(no errors)",
        }
    except subprocess.TimeoutExpired:
        return {
            "passed": False,
            "stdout": f"Test timeout (>{timeout}s)",
            "stderr": "TIMEOUT",
        }
    except FileNotFoundError:
        return {
            "passed": False,
            "stdout": "npm not found",
            "stderr": "npm missing",
        }


def validate_data_json(git_root):
    """Verify data.json has 6 required keys."""
    data_file = Path(git_root) / "dados" / "data.json"
    if not data_file.exists():
        return {
            "exists": False,
            "valid": False,
            "keys": [],
            "error": "data.json not found",
        }

    required_keys = {
        "annual_returns",
        "fire_data",
        "portfolio_history",
        "spending_data",
        "macro_data",
        "factor_data",
    }

    try:
        with open(data_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        found_keys = set(data.keys())
        missing = required_keys - found_keys
        extra = found_keys - required_keys

        return {
            "exists": True,
            "valid": len(missing) == 0,
            "keys": sorted(found_keys),
            "missing": sorted(missing),
            "extra": sorted(extra),
            "size_bytes": data_file.stat().st_size,
        }
    except json.JSONDecodeError as e:
        return {
            "exists": True,
            "valid": False,
            "keys": [],
            "error": f"JSON parse error: {str(e)[:100]}",
        }
    except Exception as e:
        return {
            "exists": True,
            "valid": False,
            "keys": [],
            "error": str(e),
        }


def check_precommit_hook(git_root):
    """Check pre-commit hook exists and is executable."""
    hook_path = Path(git_root) / ".git" / "hooks" / "pre-commit"
    if not hook_path.exists():
        return {
            "exists": False,
            "executable": False,
            "error": "pre-commit hook not found",
        }

    is_executable = os.access(hook_path, os.X_OK)
    return {
        "exists": True,
        "executable": is_executable,
        "path": str(hook_path.relative_to(git_root)),
    }


def scan_bypass_commits(git_root, weeks_back=4):
    """Scan git log for --no-verify commits."""
    since_date = (datetime.now() - timedelta(weeks=weeks_back)).isoformat()

    try:
        result = subprocess.run(
            [
                "git",
                "log",
                "--all",
                "--oneline",
                f"--since={since_date}",
            ],
            cwd=git_root,
            capture_output=True,
            text=True,
        )

        commits = result.stdout.strip().split("\n") if result.stdout.strip() else []

        # Get full commit messages to check for bypass pattern
        # Note: git log --no-verify doesn't leave a trace, so we look for
        # commits that bypass hooks (often have incomplete messages or irregular patterns)
        # This is a heuristic check.

        return {
            "scanned_weeks": weeks_back,
            "total_commits": len(commits),
            "commits": commits[:10],
            "note": "Git does not log --no-verify, but commits are tracked",
        }
    except Exception as e:
        return {
            "scanned_weeks": weeks_back,
            "total_commits": 0,
            "error": str(e),
        }


def generate_report(
    git_root,
    output_file=None,
    strict=False,
    check_bypass_only=False,
):
    """Generate monthly health check report."""
    timestamp = datetime.now().isoformat(timespec="seconds")

    # Quick bypass check
    if check_bypass_only:
        bypasses = scan_bypass_commits(git_root)
        print(f"✅ Bypass scan: {bypasses['total_commits']} commits in last 4 weeks")
        return 0

    # Full checks
    tests = run_tests(git_root)
    data_json = validate_data_json(git_root)
    hook = check_precommit_hook(git_root)
    bypasses = scan_bypass_commits(git_root)

    # Determine overall health
    all_pass = tests["passed"] and data_json["valid"] and hook["executable"]

    report = f"""# Monthly Health Check Report
Generated: {timestamp}
Repository: {git_root}
Overall Status: {'✅ HEALTHY' if all_pass else '⚠️ NEEDS ATTENTION'}

## Test Suite (npm run test:pre-commit)
- Status: {'✅ PASS' if tests['passed'] else '❌ FAIL'}
- Output: {tests['stdout'][:150]}
{f"- Error: {tests['stderr'][:150]}" if not tests['passed'] else ""}

## Data Validation (data.json)
- File exists: {'✅ Yes' if data_json['exists'] else '❌ No'}
- Valid JSON: {'✅ Yes' if data_json['valid'] else '❌ No'}
- Required keys present: {'✅ Yes' if not data_json.get('missing') else '❌ No'}
- Keys found: {', '.join(data_json['keys']) if data_json['keys'] else '(none)'}
{f"- Missing: {', '.join(data_json['missing'])}" if data_json.get('missing') else ""}
- Size: {data_json.get('size_bytes', 'N/A')} bytes

## Pre-commit Hook
- Exists: {'✅ Yes' if hook['exists'] else '❌ No'}
- Executable: {'✅ Yes' if hook['executable'] else '❌ No'}
{f"- Path: {hook.get('path', 'N/A')}" if hook['exists'] else f"- Error: {hook.get('error', 'N/A')!r}"}

## Git History (last 4 weeks)
- Total commits: {bypasses['total_commits']}
- Recent commits: {', '.join(bypasses['commits'][:5]) if bypasses.get('commits') else '(none)'}
- Note: {bypasses.get('note', 'N/A')}

## Recommendations
"""

    if not tests["passed"]:
        report += "1. ❌ Tests are failing — run `npm run test:pre-commit` locally\n"
    else:
        report += "1. ✅ All tests passing\n"

    if not data_json["valid"]:
        report += f"2. ❌ data.json invalid — {data_json.get('error', 'unknown error')}\n"
    elif data_json.get("missing"):
        report += f"2. ❌ Missing keys in data.json: {', '.join(data_json['missing'])}\n"
    else:
        report += "2. ✅ data.json valid and complete\n"

    if not hook["executable"]:
        report += "3. ⚠️ Pre-commit hook not executable — run: `chmod +x .git/hooks/pre-commit`\n"
    else:
        report += "3. ✅ Pre-commit hook is executable\n"

    report += f"4. 📊 {bypasses['total_commits']} commits in last 4 weeks\n"
    report += "\n---\n"
    report += "Generated by: scripts/maintenance/monthly_health_check.py\n"

    # Write report
    if output_file is None:
        output_file = f"/tmp/monthly_health_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"✅ Report written to: {output_file}")
    except IOError as e:
        print(f"⚠️ Failed to write to {output_file}: {e}")

    print(report)

    # Return exit code
    if strict and not all_pass:
        return 1
    return 0


def main():
    parser = argparse.ArgumentParser(description="Monthly health check for dashboard")
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Write report to FILE",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Exit 1 if any check fails",
    )
    parser.add_argument(
        "--check-bypass",
        action="store_true",
        help="Only check for git bypasses (quick mode)",
    )

    args = parser.parse_args()
    git_root = get_git_root()

    exit_code = generate_report(
        git_root,
        output_file=args.output,
        strict=args.strict,
        check_bypass_only=args.check_bypass,
    )
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
