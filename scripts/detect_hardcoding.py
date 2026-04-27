#!/usr/bin/env python3
"""
Architect P2: Advanced Hardcoding Detection

Detecta padrões de hardcoding além * 100 / / 100:
1. Valores numéricos fora de config.py
2. Cálculos inline (SWR, Tax, guardrail logic)
3. Strings duplicadas (tickers, nomes de blocos)
4. Constantes mágicas em código

AST parsing + grep avançado + static analysis
"""

import ast
import argparse
import sys
import os
import re
from pathlib import Path
from dataclasses import dataclass
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
        """Carrega .architectignore se existir"""
        if not whitelist_file:
            whitelist_file = ".architectignore"

        if not os.path.exists(whitelist_file):
            return

        with open(whitelist_file, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue

                # Padrão glob (ex: **/test_*.py)
                if "*" in line:
                    self.patterns.append(self._glob_to_regex(line))
                # Padrão regex (ex: ^#)
                elif line.startswith("^"):
                    self.patterns.append(re.compile(line))
                # Arquivo exato
                else:
                    self.exact_files.add(line)

    @staticmethod
    def _glob_to_regex(pattern: str) -> re.Pattern:
        """Converte glob pattern para regex"""
        regex = pattern.replace(".", r"\.").replace("*", ".*").replace("?", ".")
        return re.compile(f"^{regex}$")

    def is_whitelisted(self, file: str, content: Optional[str] = None) -> bool:
        """Verifica se arquivo ou conteúdo está whitelisted"""
        # Arquivo exato
        if file in self.exact_files:
            return True

        # Padrões glob/regex
        for pattern in self.patterns:
            if pattern.match(file):
                return True

        return False


# ────────────────────────────────────────────────────────────────
# AST-based Detection
# ────────────────────────────────────────────────────────────────

class NumericLiteralDetector(ast.NodeVisitor):
    """Detecta atribuições de valores numéricos em código"""

    def __init__(self, file: str, lines: List[str], config_file: str = None):
        self.file = file
        self.lines = lines
        self.config_file = config_file or "scripts/config.py"
        self.violations: List[Violation] = []
        self.numeric_pattern = re.compile(r"^(0\.\d+|[1-9]\d*\.?\d*|\.?\d+)$")

    def visit_Assign(self, node: ast.Assign):
        """Visita atribuições: x = 0.50"""
        if self._is_numeric_literal(node.value):
            var_name = self._get_var_name(node.targets)
            value = self._get_literal_value(node.value)
            line_content = self.lines[node.lineno - 1] if node.lineno <= len(self.lines) else ""

            # Skip típicos falsos positivos
            if self._should_skip(var_name, value, line_content):
                self.generic_visit(node)
                return

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
        """Visita comparações: if x < 0.85"""
        if self._is_numeric_literal(node.comparators[0] if node.comparators else None):
            value = self._get_literal_value(node.comparators[0])
            line_num = node.lineno
            line_content = self.lines[line_num - 1] if line_num <= len(self.lines) else ""

            if self._should_skip(None, value, line_content):
                self.generic_visit(node)
                return

            self.violations.append(Violation(
                file=self.file,
                line_num=line_num,
                violation_type="numeric_literal",
                pattern=f"comparison with {value}",
                content=line_content.strip(),
                severity="warning"
            ))

        self.generic_visit(node)

    def _is_numeric_literal(self, node) -> bool:
        """Verifica se node é um literal numérico"""
        if node is None:
            return False
        return isinstance(node, (ast.Num, ast.Constant)) and isinstance(
            self._get_literal_value(node), (int, float)
        )

    def _get_literal_value(self, node) -> Optional[float]:
        """Extrai valor numérico de um node"""
        if isinstance(node, ast.Num):
            return node.n
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        return None

    def _get_var_name(self, targets) -> Optional[str]:
        """Extrai nome de variável de alvo de atribuição"""
        if targets and isinstance(targets[0], ast.Name):
            return targets[0].id
        return None

    def _should_skip(self, var_name: Optional[str], value: float, line_content: str) -> bool:
        """Verifica se deve ignorar esta violação"""
        # Skip loop counters
        if "range(" in line_content or "for " in line_content:
            return True

        # Skip test files
        if "test_" in self.file or "/tests/" in self.file or ".spec.ts" in self.file:
            return True

        # Skip comments
        if line_content.strip().startswith("#"):
            return True

        # Skip pequenas constantes (loop counters, índices)
        if isinstance(value, int) and value < 10:
            return True

        # Skip 1.0, 0.0, etc. (operações comuns)
        if value in (0.0, 1.0):
            return True

        return False


class InlineCalculationDetector:
    """Detecta cálculos inline (SWR, Tax, guardrails)"""

    # Padrões financeiros perigosos
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
        """Executa detecção de cálculos inline"""
        for line_num, line in enumerate(self.lines, 1):
            # Skip comments e docstrings
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

    # Strings que naturalmente se repetem e podem ser ignoradas
    SAFE_PATTERNS = [
        r'^[A-Z]{3,4}$',  # Tickers curtos (SWRD, etc)
        r'^[a-z_][a-z0-9_]*$',  # Variáveis (nome_variavel)
        r'^[a-z0-9-]+$',  # URLs, IDs (api-v1, etc)
        r'.*_usd$',  # Financial fields (price_usd, etc)
        r'.*_brl$',  # Currency fields
        r'^id$',  # Common field names
        r'^name$',
        r'^value$',
        r'^data$',
        r'^tipo$',
        r'^status$',
    ]

    DUPLICATE_THRESHOLD = 5  # Quantas repetições = violação? (aumentado)

    def __init__(self, file: str, content: str):
        self.file = file
        self.content = content
        self.lines = content.split("\n")
        self.violations: List[Violation] = []
        self.string_counts: Dict[str, List[int]] = defaultdict(list)

    def detect(self) -> List[Violation]:
        """Executa detecção de strings duplicadas"""
        # Coleta todas as strings e suas linhas
        for line_num, line in enumerate(self.lines, 1):
            if line.strip().startswith("#"):
                continue

            # Regex para strings (simples e duplas)
            strings = re.findall(r'(["\'])((?:(?=(\\?))\3.)*?)\1', line)
            for quote, string_val, _ in strings:
                if len(string_val) > 3:  # Ignorar strings muito curtas (aumentado)
                    self.string_counts[string_val].append(line_num)

        # Reporta strings que aparecem >THRESHOLD vezes
        for string_val, line_nums in self.string_counts.items():
            if len(line_nums) >= self.DUPLICATE_THRESHOLD:
                # Skip padrões seguros
                if self._is_safe_pattern(string_val):
                    continue

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
        """Verifica se string é pattern seguro para ignorar"""
        for pattern in self.SAFE_PATTERNS:
            if re.match(pattern, string_val):
                return True
        return False


# ────────────────────────────────────────────────────────────────
# Main Detector
# ────────────────────────────────────────────────────────────────

class HardcodingDetector:
    """Orquestrador principal de detecção"""

    def __init__(self, whitelist_file: Optional[str] = None):
        self.whitelist = WhitelistMatcher(whitelist_file)
        self.violations: List[Violation] = []

    def scan_files(self, file_list: Optional[List[str]] = None) -> List[Violation]:
        """Escaneia arquivos Python/TypeScript"""
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
        """Escaneia apenas arquivos em git staged area (para pre-commit)"""
        try:
            result = subprocess.run(
                ["git", "diff", "--cached", "--name-only"],
                capture_output=True,
                text=True,
                cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            )
            staged_files = [f for f in result.stdout.strip().split("\n") if f]
            return self.scan_files(staged_files)
        except Exception as e:
            print(f"⚠️  Could not get staged files: {e}", file=sys.stderr)
            return []

    def _scan_file(self, file_path: str):
        """Escaneia um arquivo individual"""
        if not os.path.exists(file_path):
            return

        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        # Python: AST + Grep
        if file_path.endswith(".py"):
            self._scan_python(file_path, content)

        # TypeScript: Grep only
        if file_path.endswith((".ts", ".tsx")):
            self._scan_typescript(file_path, content)

    def _scan_python(self, file_path: str, content: str):
        """Escaneia arquivo Python"""
        try:
            tree = ast.parse(content)
            lines = content.split("\n")

            # 1. Numeric literals
            detector = NumericLiteralDetector(file_path, lines)
            detector.visit(tree)
            self.violations.extend(detector.violations)

            # 2. Inline calculations
            calc_detector = InlineCalculationDetector(file_path, content)
            self.violations.extend(calc_detector.detect())

            # 3. String duplicates
            string_detector = StringDuplicateDetector(file_path, content)
            self.violations.extend(string_detector.detect())

        except SyntaxError:
            pass  # Skip files with syntax errors

    def _scan_typescript(self, file_path: str, content: str):
        """Escaneia arquivo TypeScript/JavaScript"""
        # Padrões similares ao Python, mas adaptados para TS
        patterns = {
            "numeric": r"const\s+\w+\s*=\s*(0\.\d+|[1-9]\d*\.\d+)",
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
                        violation_type=f"{violation_type}_ts",
                        pattern=pattern,
                        content=line.strip(),
                        severity="warning"
                    ))

    def _get_all_source_files(self) -> List[str]:
        """Retorna todos os arquivos source do projeto"""
        files = []
        for root, dirs, filenames in os.walk("."):
            # Skip comum
            dirs[:] = [d for d in dirs if d not in {".git", "node_modules", "__pycache__", ".venv"}]

            for filename in filenames:
                if filename.endswith((".py", ".ts", ".tsx")):
                    files.append(os.path.join(root, filename))

        return files

    def generate_report(self) -> str:
        """Gera relatório formatado de violações"""
        if not self.violations:
            return "✅ No hardcoding violations found!"

        # Agrupa por tipo
        by_type = defaultdict(list)
        for v in self.violations:
            by_type[v.violation_type].append(v)

        report = []
        report.append(f"🔴 Found {len(self.violations)} hardcoding violations:\n")

        for violation_type, violations in sorted(by_type.items()):
            report.append(f"## {violation_type.upper()} ({len(violations)})")
            for v in violations[:5]:  # Mostra primeiras 5
                report.append(f"{v}")
                report.append(f"   {v.content[:80]}")
            if len(violations) > 5:
                report.append(f"   ... and {len(violations) - 5} more")
            report.append("")

        return "\n".join(report)


# ────────────────────────────────────────────────────────────────
# CLI
# ────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Advanced Hardcoding Detection (Architect P2)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 detect_hardcoding.py --staged              # Pre-commit mode
  python3 detect_hardcoding.py --report              # Full report
  python3 detect_hardcoding.py scripts/config.py     # Single file
        """
    )

    parser.add_argument("--staged", action="store_true", help="Scan only staged files (git diff)")
    parser.add_argument("--report", action="store_true", help="Generate detailed report")
    parser.add_argument("--fix", action="store_true", help="Suggest fixes (future)")
    parser.add_argument("--whitelist", type=str, help="Path to .architectignore file")
    parser.add_argument("files", nargs="*", help="Files to scan (optional)")

    args = parser.parse_args()

    detector = HardcodingDetector(whitelist_file=args.whitelist)

    # Determina quais arquivos scanear
    if args.staged:
        violations = detector.scan_staged_only()
    elif args.files:
        violations = detector.scan_files(args.files)
    else:
        violations = detector.scan_files()

    # Output
    if args.report or not args.staged:
        print(detector.generate_report())
    else:
        # Pre-commit mode: compact output
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
