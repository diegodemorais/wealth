#!/usr/bin/env python3
"""
Architect P2/P4: Advanced Hardcoding Detection + Auto-Fix Suggestions

Detecta padrões de hardcoding além * 100 / / 100:
1. Valores numéricos fora de config.py
2. Cálculos inline (SWR, Tax, guardrail logic)
3. Strings duplicadas (tickers, nomes de blocos)
4. Constantes mágicas em código

P4: generate_suggestions() → risco + nome de constante + seção de config + patch inline
"""

import ast
import argparse
import json
import sys
import os
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Set, Tuple, Optional
from collections import defaultdict
import subprocess

# ────────────────────────────────────────────────────────────────
# Data Classes
# ────────────────────────────────────────────────────────────────

@dataclass
class Violation:
    """Representa uma violação de hardcoding"""
    file: str
    line_num: int
    violation_type: str  # "numeric_literal", "inline_calc", "duplicate_string"
    pattern: str
    content: str
    severity: str = "error"  # "error", "warning"

    def __str__(self):
        symbol = "❌" if self.severity == "error" else "⚠️"
        return f"{symbol} {self.file}:{self.line_num} [{self.violation_type}] {self.pattern}"


@dataclass
class Suggestion:
    """Sugestão de refatoração para uma Violation"""
    violation: Violation
    constant_name: str
    category: str          # TICKER_, COLUMN_, DATE_FORMAT_, CALC_, etc.
    config_section: str    # scripts/config.py ou react-app/src/config/constants.ts
    import_line: str       # 'from config import X' ou 'import { X } from "@/config/constants"'
    replacement: str       # trecho original → constante
    risk: str              # LOW / MEDIUM / HIGH
    risk_reason: str
    estimated_time_min: float

    def to_dict(self) -> dict:
        return {
            "file": self.violation.file,
            "line": self.violation.line_num,
            "type": self.violation.violation_type,
            "value": self.violation.pattern,
            "constant_name": self.constant_name,
            "category": self.category,
            "config_section": self.config_section,
            "import_line": self.import_line,
            "replacement": self.replacement,
            "risk": self.risk,
            "risk_reason": self.risk_reason,
            "estimated_time_min": self.estimated_time_min,
        }


# ────────────────────────────────────────────────────────────────
# Whitelist Parser
# ────────────────────────────────────────────────────────────────

class WhitelistMatcher:
    """Gerencia regras de whitelist para exceções"""

    def __init__(self, whitelist_file: Optional[str] = None):
        self.patterns = []
        self.exact_files = set()
        self.load_whitelist(whitelist_file)

    def load_whitelist(self, whitelist_file: Optional[str]):
        if not whitelist_file:
            whitelist_file = ".architectignore"
        if not os.path.exists(whitelist_file):
            return
        with open(whitelist_file, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                # Strip inline comments (e.g. "scripts/foo.py  # reason")
                line = line.split("#")[0].strip()
                if not line:
                    continue
                if "*" in line:
                    self.patterns.append(self._glob_to_regex(line))
                elif line.startswith("^"):
                    self.patterns.append(re.compile(line))
                else:
                    self.exact_files.add(line)

    @staticmethod
    def _glob_to_regex(pattern: str) -> re.Pattern:
        regex = pattern.replace(".", r"\.").replace("*", ".*").replace("?", ".")
        return re.compile(f"^{regex}$")

    def is_whitelisted(self, file: str, content: Optional[str] = None) -> bool:
        # Normalize: strip leading ./ so patterns like "analysis/**" match "./analysis/foo.py"
        normalized = file.lstrip("./")
        if file in self.exact_files or normalized in self.exact_files:
            return True
        for pattern in self.patterns:
            if pattern.match(file) or pattern.match(normalized):
                return True
        return False


# ────────────────────────────────────────────────────────────────
# AST-based Detection (Python 3.8+ compatible — ast.Constant only)
# ────────────────────────────────────────────────────────────────

class NumericLiteralDetector(ast.NodeVisitor):
    """Detecta atribuições de valores numéricos em código"""

    def __init__(self, file: str, lines: List[str]):
        self.file = file
        self.lines = lines
        self.violations: List[Violation] = []

    def visit_Assign(self, node: ast.Assign):
        if self._is_numeric_literal(node.value):
            var_name = self._get_var_name(node.targets)
            value = self._get_literal_value(node.value)
            line_content = self.lines[node.lineno - 1] if node.lineno <= len(self.lines) else ""

            if not self._should_skip(var_name, value, line_content):
                self.violations.append(Violation(
                    file=self.file,
                    line_num=node.lineno,
                    violation_type="numeric_literal",
                    pattern=f"{var_name} = {value}",
                    content=line_content.strip(),
                    severity="error"
                ))
        self.generic_visit(node)

    def visit_Compare(self, node: ast.Compare):
        comparator = node.comparators[0] if node.comparators else None
        if self._is_numeric_literal(comparator):
            value = self._get_literal_value(comparator)
            line_content = self.lines[node.lineno - 1] if node.lineno <= len(self.lines) else ""
            if not self._should_skip(None, value, line_content):
                self.violations.append(Violation(
                    file=self.file,
                    line_num=node.lineno,
                    violation_type="numeric_literal",
                    pattern=f"comparison with {value}",
                    content=line_content.strip(),
                    severity="warning"
                ))
        self.generic_visit(node)

    def _is_numeric_literal(self, node) -> bool:
        if node is None:
            return False
        # ast.Num removed in Python 3.12 — use ast.Constant only
        return isinstance(node, ast.Constant) and isinstance(node.value, (int, float))

    def _get_literal_value(self, node) -> Optional[float]:
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        return None

    def _get_var_name(self, targets) -> Optional[str]:
        if targets and isinstance(targets[0], ast.Name):
            return targets[0].id
        return None

    def _should_skip(self, var_name: Optional[str], value: Optional[float], line_content: str) -> bool:
        if "range(" in line_content or "for " in line_content:
            return True
        if "test_" in self.file or "/tests/" in self.file or ".spec.ts" in self.file:
            return True
        if line_content.strip().startswith("#"):
            return True
        if isinstance(value, int) and abs(value) < 10:
            return True
        if value in (0.0, 1.0):
            return True
        # Floating-point epsilon / precision thresholds
        if isinstance(value, float) and abs(value) < 1e-4:
            return True
        # Standard ML/stats conventions
        if var_name in ("SEED", "seed", "N_BOOTSTRAP", "n_bootstrap"):
            return True
        # Standard p-value thresholds in statistical analysis
        if isinstance(value, float) and value in (0.01, 0.05, 0.1) and "pval" in line_content.lower():
            return True
        return False


class InlineCalculationDetector:
    """Detecta cálculos inline (SWR, Tax, guardrails)"""

    FINANCIAL_PATTERNS = {
        "swr": [
            r"swr\s*=\s*[\d.]+\s*\*\s*",
            r"swr\s*=.*?portfolio.*?\*",
            r"0\.[0-3]\s*\*\s*(patrimonio|portfolio)",
        ],
        "tax": [
            r"ir\s*=\s*\(.*?\)\s*\*\s*0\.\d{2}",
            r"tax\s*=\s*.*?\*\s*0\.\d{2}",
            r"ganho.*?\*\s*0\.15",
        ],
        "guardrail": [
            r"if\s+(portfolio|patrimonio)\s*<\s*pico\s*\*\s*0\.\d+",
            r"max_dd\s*=\s*pico\s*\*\s*-?0\.\d+",
            r"guardrail.*?\*\s*0\.\d+",
        ],
        "drawdown": [
            r"drawdown\s*=\s*\(.*?\)\s*/\s*pico",
            r"dd\s*=\s*.*?\*\s*0\.\d+",
        ],
    }

    def __init__(self, file: str, content: str):
        self.file = file
        self.content = content
        self.lines = content.split("\n")
        self.violations: List[Violation] = []

    def detect(self) -> List[Violation]:
        for line_num, line in enumerate(self.lines, 1):
            if line.strip().startswith("#") or line.strip().startswith('"""'):
                continue
            for calc_type, patterns in self.FINANCIAL_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        self.violations.append(Violation(
                            file=self.file,
                            line_num=line_num,
                            violation_type="inline_calculation",
                            pattern=f"{calc_type} calculation",
                            content=line.strip(),
                            severity="error"
                        ))
                        break
        return self.violations


class StringDuplicateDetector:
    """Detecta strings duplicadas que devem ser constantes"""

    SAFE_PATTERNS = [
        r'^[A-Z]{3,4}$',
        r'^[a-z_][a-z0-9_]*$',
        r'^[a-z0-9-]+$',
        r'.*_usd$',
        r'.*_brl$',
        r'^id$',
        r'^name$',
        r'^value$',
        r'^data$',
        r'^tipo$',
        r'^status$',
    ]

    DUPLICATE_THRESHOLD = 5

    def __init__(self, file: str, content: str):
        self.file = file
        self.content = content
        self.lines = content.split("\n")
        self.violations: List[Violation] = []
        self.string_counts: Dict[str, List[int]] = defaultdict(list)

    def detect(self) -> List[Violation]:
        for line_num, line in enumerate(self.lines, 1):
            if line.strip().startswith("#"):
                continue
            strings = re.findall(r'(["\'])((?:(?=(\\?))\3.)*?)\1', line)
            for quote, string_val, _ in strings:
                if len(string_val) > 3:
                    self.string_counts[string_val].append(line_num)

        for string_val, line_nums in self.string_counts.items():
            if len(line_nums) >= self.DUPLICATE_THRESHOLD:
                if not self._is_safe_pattern(string_val):
                    self.violations.append(Violation(
                        file=self.file,
                        line_num=line_nums[0],
                        violation_type="duplicate_string",
                        pattern=f'"{string_val}" (appears {len(line_nums)} times)',
                        content=f"Lines: {line_nums}",
                        severity="warning"
                    ))
        return self.violations

    def _is_safe_pattern(self, string_val: str) -> bool:
        for pattern in self.SAFE_PATTERNS:
            if re.match(pattern, string_val):
                return True
        return False


# ────────────────────────────────────────────────────────────────
# Naked Integration Detector
# ────────────────────────────────────────────────────────────────

class NakedIntegrationDetector:
    """Detecta chamadas nuas a APIs externas fora dos wrappers canônicos.

    Gera severity="warning" (não bloqueia CI) — há casos legítimos durante
    migração gradual. Ver scripts/CLAUDE.md#integrações para padrão correto.
    """

    NAKED_PATTERNS: Dict[str, List[str]] = {
        "yfinance_direct": [
            r"yf\.download\s*\(",
            r"yfinance\.download\s*\(",
            r"yf\.Ticker\s*\(",
        ],
        "bcb_direct": [
            r"Série\s*\(",
            r"bcb\.Série\s*\(",
            r"sidrapy\.",
        ],
        "requests_direct": [
            r"requests\.get\s*\(",
            r"urllib\.request\.urlopen\s*\(",
        ],
    }

    # Wrappers canônicos — não reportar chamadas nesses arquivos
    SAFE_FILES: List[str] = [
        "fetch_utils.py",
        "integration_health.py",
        "market_data.py",
    ]

    def __init__(self, file: str, content: str):
        self.file = file
        self.content = content
        self.lines = content.split("\n")
        self.violations: List[Violation] = []

    def _is_safe_file(self) -> bool:
        basename = os.path.basename(self.file)
        return basename in self.SAFE_FILES

    def detect(self) -> List[Violation]:
        if self._is_safe_file():
            return self.violations
        for line_num, line in enumerate(self.lines, 1):
            stripped = line.strip()
            if stripped.startswith("#"):
                continue
            # Strip inline comments before matching
            code_part = stripped.split("#")[0]
            # DEV-pipeline-gaps-p2 Gap 3: chamadas dentro de fetch_with_retry(...) são wrappers
            # canônicos. O padrão pode aparecer na mesma linha (lambda inline) OU em uma linha
            # posterior dentro do bloco do fetch_with_retry (max 4 linhas atrás para o `fn=`).
            if "fetch_with_retry" in code_part or "lambda" in code_part:
                continue
            # Olhar 6 linhas em ambas as direções: chamada pode estar dentro de um
            # `def _fetch()` aninhado que é passado a fetch_with_retry alguns linhas depois.
            window_start = max(0, line_num - 7)
            window_end = min(len(self.lines), line_num + 6)
            window = "\n".join(self.lines[window_start:window_end])
            if "fetch_with_retry" in window:
                continue
            for integration_type, patterns in self.NAKED_PATTERNS.items():
                for pattern in patterns:
                    if re.search(pattern, code_part):
                        self.violations.append(Violation(
                            file=self.file,
                            line_num=line_num,
                            violation_type="naked_integration",
                            pattern=f"{integration_type}: {pattern}",
                            content=(
                                f"{stripped}  "
                                f"→ Use fetch_utils.fetch_with_retry() — ver scripts/CLAUDE.md#integrações"
                            ),
                            severity="warning",
                        ))
                        # One violation per line per integration_type
                        break
        return self.violations


# ────────────────────────────────────────────────────────────────
# P4: Auto-Fix Suggestion Engine
# ────────────────────────────────────────────────────────────────

class SuggestionEngine:
    """Gera sugestões de refatoração para cada Violation (P4.1)"""

    # Heurísticas para inferir categoria e nome de constante
    TICKER_KEYWORDS = {"swrd", "avgs", "avem", "avuv", "avdv", "jpgl", "hodl", "vwra", "iwmo", "xdem"}
    CALC_KEYWORDS = {"swr", "tax", "ir", "guardrail", "drawdown", "dd", "rho", "vol", "sigma", "alpha", "beta"}
    DATE_KEYWORDS = {"date", "dt", "fmt", "format", "strftime"}
    WINDOW_KEYWORDS = {"window", "period", "lookback", "lag", "n_sim", "n_years", "horizon"}

    def generate(self, violations: List[Violation]) -> List[Suggestion]:
        suggestions = []
        for v in violations:
            s = self._suggest(v)
            if s:
                suggestions.append(s)
        return suggestions

    def _suggest(self, v: Violation) -> Optional[Suggestion]:
        content_lower = v.content.lower()
        file_is_ts = v.file.endswith((".ts", ".tsx"))

        # Inferir categoria
        category, const_name = self._infer_category(v, content_lower, file_is_ts)

        # Config section
        if file_is_ts:
            config_section = "react-app/src/config/constants.ts"
            import_line = f'import {{ {const_name} }} from "@/config/constants";'
        else:
            config_section = "scripts/config.py"
            import_line = f"from config import {const_name}"

        # Risk assessment
        risk, risk_reason, est_time = self._assess_risk(v, category)

        # Replacement hint
        replacement = self._replacement_hint(v, const_name)

        return Suggestion(
            violation=v,
            constant_name=const_name,
            category=category,
            config_section=config_section,
            import_line=import_line,
            replacement=replacement,
            risk=risk,
            risk_reason=risk_reason,
            estimated_time_min=est_time,
        )

    def _infer_category(self, v: Violation, content_lower: str, is_ts: bool) -> Tuple[str, str]:
        # Ticker detection
        for ticker in self.TICKER_KEYWORDS:
            if ticker in content_lower:
                const_name = f"TICKER_{ticker.upper()}_LSE"
                return "TICKER_", const_name

        # Calc / financial params
        for kw in self.CALC_KEYWORDS:
            if kw in content_lower:
                # Extract var name if assignment
                m = re.search(r"(?:const\s+|)(\w+)\s*=", v.content)
                var = m.group(1).upper() if m else kw.upper()
                const_name = f"CALC_{var}"
                return "CALC_", const_name

        # Window / simulation params
        for kw in self.WINDOW_KEYWORDS:
            if kw in content_lower:
                m = re.search(r"(?:const\s+|)(\w+)\s*=", v.content)
                var = m.group(1).upper() if m else kw.upper()
                const_name = f"SIM_{var}"
                return "SIM_", const_name

        # Date format
        for kw in self.DATE_KEYWORDS:
            if kw in content_lower:
                m = re.search(r"(?:const\s+|)(\w+)\s*=", v.content)
                var = m.group(1).upper() if m else "DATE_FORMAT"
                return "DATE_FORMAT_", var

        # Duplicate string → try to infer from value
        if v.violation_type == "duplicate_string":
            raw = re.search(r'"([^"]+)"', v.pattern)
            val = raw.group(1) if raw else "STRING"
            const_name = f"STR_{re.sub(r'[^A-Z0-9]', '_', val.upper())[:30]}"
            return "STRING_", const_name

        # Generic fallback
        m = re.search(r"(?:const\s+|)(\w+)\s*=", v.content)
        var = m.group(1).upper() if m else "CONSTANT"
        return "CALC_", f"CALC_{var}"

    def _assess_risk(self, v: Violation, category: str) -> Tuple[str, str, float]:
        if v.violation_type == "duplicate_string":
            return "LOW", "exact string literal — substituição direta sem ambiguidade", 2.0

        if v.violation_type == "inline_calculation":
            return "HIGH", "cálculo inline — requer análise de contexto e testes", 10.0

        if category == "TICKER_":
            return "LOW", "ticker string — padrão unambíguo, só substituição", 2.0

        if category in ("CALC_", "SIM_"):
            return "MEDIUM", "constante numérica financeira — verificar contexto antes de centralizar", 5.0

        if category == "DATE_FORMAT_":
            return "LOW", "formato de data — pattern strftime, substituição segura", 2.0

        return "MEDIUM", "contexto não determinado — revisão manual recomendada", 5.0

    def _replacement_hint(self, v: Violation, const_name: str) -> str:
        # Extract the literal value from content
        m = re.search(r"=\s*(['\"]?[\d.]+['\"]?)", v.content)
        literal = m.group(1) if m else "???"
        return f"{literal} → {const_name}"


# ────────────────────────────────────────────────────────────────
# Main Detector
# ────────────────────────────────────────────────────────────────

class HardcodingDetector:
    """Orquestrador principal de detecção"""

    def __init__(self, whitelist_file: Optional[str] = None):
        self.whitelist = WhitelistMatcher(whitelist_file)
        self.violations: List[Violation] = []

    def scan_files(self, file_list: Optional[List[str]] = None) -> List[Violation]:
        if file_list is None:
            file_list = self._get_all_source_files()
        for file_path in file_list:
            if self.whitelist.is_whitelisted(file_path):
                continue
            try:
                self._scan_file(file_path)
            except Exception as e:
                print(f"⚠️  Skipping {file_path}: {e}", file=sys.stderr)
        return self.violations

    def scan_staged_only(self) -> List[Violation]:
        try:
            result = subprocess.run(
                ["git", "diff", "--cached", "--name-only"],
                capture_output=True, text=True,
                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
            staged_files = [f for f in result.stdout.strip().split("\n") if f]
            return self.scan_files(staged_files)
        except Exception as e:
            print(f"⚠️  Could not get staged files: {e}", file=sys.stderr)
            return []

    def _scan_file(self, file_path: str):
        if not os.path.exists(file_path):
            return
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        if file_path.endswith(".py"):
            self._scan_python(file_path, content)
        if file_path.endswith((".ts", ".tsx")):
            self._scan_typescript(file_path, content)

    def _scan_python(self, file_path: str, content: str):
        try:
            tree = ast.parse(content)
            lines = content.split("\n")
            detector = NumericLiteralDetector(file_path, lines)
            detector.visit(tree)
            self.violations.extend(detector.violations)

            calc_detector = InlineCalculationDetector(file_path, content)
            self.violations.extend(calc_detector.detect())

            string_detector = StringDuplicateDetector(file_path, content)
            self.violations.extend(string_detector.detect())

            naked_detector = NakedIntegrationDetector(file_path, content)
            self.violations.extend(naked_detector.detect())
        except SyntaxError:
            pass

    def _scan_typescript(self, file_path: str, content: str):
        patterns = {
            "numeric_ts": r"const\s+\w+\s*=\s*(0\.\d+|[1-9]\d*\.\d+)",
            "inline_calc": r"(swr|tax|drawdown|guardrail)\s*=\s*.*?\*\s*0\.\d+",
        }
        for line_num, line in enumerate(content.split("\n"), 1):
            if line.strip().startswith("//") or line.strip().startswith("/*"):
                continue
            for violation_type, pattern in patterns.items():
                if re.search(pattern, line):
                    self.violations.append(Violation(
                        file=file_path,
                        line_num=line_num,
                        violation_type=violation_type,
                        pattern=pattern,
                        content=line.strip(),
                        severity="warning"
                    ))

    def _get_all_source_files(self) -> List[str]:
        files = []
        for root, dirs, filenames in os.walk("."):
            dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__", ".venv"}]
            for filename in filenames:
                if filename.endswith((".py", ".ts", ".tsx")):
                    files.append(os.path.join(root, filename))
        return files

    def generate_report(self) -> str:
        if not self.violations:
            return "✅ No hardcoding violations found!"

        by_type = defaultdict(list)
        for v in self.violations:
            by_type[v.violation_type].append(v)

        report = [f"🔴 Found {len(self.violations)} hardcoding violations:\n"]
        for violation_type, violations in sorted(by_type.items()):
            report.append(f"## {violation_type.upper()} ({len(violations)})")
            for v in violations[:5]:
                report.append(f"{v}")
                report.append(f"   {v.content[:80]}")
            if len(violations) > 5:
                report.append(f"   ... and {len(violations) - 5} more")
            report.append("")
        return "\n".join(report)


# ────────────────────────────────────────────────────────────────
# P4: --fix workflow
# ────────────────────────────────────────────────────────────────

def run_fix_generate_only(violations: List[Violation]) -> None:
    """--fix --generate-only: mostra sugestões em JSON sem alterar nada"""
    engine = SuggestionEngine()
    suggestions = engine.generate(violations)

    summary = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "total_time_min": 0.0}
    for s in suggestions:
        summary[s.risk] += 1
        summary["total_time_min"] += s.estimated_time_min

    output = {
        "violations_analyzed": len(violations),
        "suggestions_generated": len(suggestions),
        "summary": summary,
        "suggestions": [s.to_dict() for s in suggestions],
    }

    print(json.dumps(output, indent=2, ensure_ascii=False))


def run_fix_interactive(violations: List[Violation]) -> None:
    """--fix: modo interativo — revisão por violation"""
    if not violations:
        print("✅ Nenhuma violation para revisar.")
        return

    engine = SuggestionEngine()
    suggestions = engine.generate(violations)

    risk_icon = {"LOW": "🟢", "MEDIUM": "🟡", "HIGH": "🔴"}
    applied, skipped = 0, 0

    print(f"\n📋 {len(suggestions)} sugestões de refatoração:\n")

    for i, s in enumerate(suggestions, 1):
        icon = risk_icon.get(s.risk, "⚪")
        print(f"[{i}/{len(suggestions)}] {icon} {s.risk} — {s.violation.file}:{s.violation.violation_num if hasattr(s.violation, 'violation_num') else s.violation.line_num}")
        print(f"  Código:    {s.violation.content[:70]}")
        print(f"  Constante: {s.constant_name}  ({s.category})")
        print(f"  Config:    {s.config_section}")
        print(f"  Import:    {s.import_line}")
        print(f"  Troca:     {s.replacement}")
        print(f"  Motivo:    {s.risk_reason}")
        print(f"  Tempo est: {s.estimated_time_min:.0f} min")

        if s.risk == "LOW":
            print(f"  → AUTO-APPLY elegível (LOW risk)")

        try:
            choice = input("  [s]kip / [v]iew context / [Enter para próxima]: ").strip().lower()
        except (EOFError, KeyboardInterrupt):
            print("\nInterrompido.")
            break

        if choice == "v":
            print(f"\n  Contexto completo: {s.violation.content}\n")
            skipped += 1
        else:
            skipped += 1

        print()

    print(f"Revisão concluída: {applied} aplicadas, {skipped} pendentes.")
    print("💡 Aplique manualmente ou use --fix-json para exportar patches.")


# ────────────────────────────────────────────────────────────────
# CLI
# ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Advanced Hardcoding Detection + Auto-Fix Suggestions (P2/P4)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 detect_hardcoding.py --staged              # Pre-commit mode
  python3 detect_hardcoding.py --report              # Full report
  python3 detect_hardcoding.py --fix                 # Interactive fix review
  python3 detect_hardcoding.py --fix --json          # Generate suggestions JSON (no changes)
  python3 detect_hardcoding.py scripts/config.py     # Single file
        """
    )

    parser.add_argument("--staged", action="store_true", help="Scan only staged files (git diff)")
    parser.add_argument("--report", action="store_true", help="Generate detailed report")
    parser.add_argument("--fix", action="store_true", help="Suggest fixes interactively (P4)")
    parser.add_argument("--json", action="store_true", help="With --fix: output JSON only, no interaction")
    parser.add_argument("--whitelist", type=str, help="Path to .architectignore file")
    parser.add_argument("files", nargs="*", help="Files to scan (optional)")

    args = parser.parse_args()

    detector = HardcodingDetector(whitelist_file=args.whitelist)

    if args.staged:
        violations = detector.scan_staged_only()
    elif args.files:
        violations = detector.scan_files(args.files)
    else:
        violations = detector.scan_files()

    # P4 fix mode
    if args.fix:
        if args.json:
            run_fix_generate_only(violations)
        else:
            run_fix_interactive(violations)
        return

    # Standard report / pre-commit
    if args.report or not args.staged:
        print(detector.generate_report())
    else:
        if violations:
            print(f"❌ Hardcoding violations found: {len(violations)}")
            for v in violations[:3]:
                print(f"   {v}")
            sys.exit(1)
        else:
            print("✅ No hardcoding violations")
            sys.exit(0)


if __name__ == "__main__":
    main()
