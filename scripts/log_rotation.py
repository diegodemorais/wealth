#!/usr/bin/env python3
"""log_rotation.py — Trunca logs >1MB e limpa arquivos /tmp/wealth* com >7 dias."""
import os
import time
from pathlib import Path

LOGS_DIR = Path(__file__).parent.parent / "logs"
MAX_SIZE = 1 * 1024 * 1024  # 1MB
MAX_AGE_SECONDS = 7 * 24 * 3600

def rotate_logs():
    for log_file in LOGS_DIR.glob("*.log"):
        if log_file.stat().st_size > MAX_SIZE:
            log_file.write_text("")
            print(f"Truncated {log_file.name} (was >{MAX_SIZE // 1024}KB)")

def clean_tmp():
    now = time.time()
    for f in Path("/tmp").glob("wealth*"):
        if now - f.stat().st_mtime > MAX_AGE_SECONDS:
            f.unlink(missing_ok=True)
            print(f"Removed {f}")

if __name__ == "__main__":
    rotate_logs()
    clean_tmp()
    print("Log rotation complete.")
