#!/usr/bin/env python3
"""
Architect P4: Auto-Fix Suggestion Engine

Gera sugestões de refatoração automática para violations detectadas.
- Analisa cada violation
- Sugere constante name, categoria, pattern
- Avalia risco (LOW/MEDIUM/HIGH)
- Recomenda ação (auto-fix, review, manual)
"""

import json
import re
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Tuple
from enum import Enum
from pathlib import Path


class RiskLevel(Enum):
    """Níveis de risco para sugestões"""
    LOW = "LOW"           # Exact string match, sem ambiguidade
    MEDIUM = "MEDIUM"     # Numeric, precisa contexto
    HIGH = "HIGH"         # Ambíguo, review manual necessário


class ViolationType(Enum):
    """Tipos de violação"""
    DUPLICATE_STRING = "duplicate_string"
    NUMERIC_LITERAL = "numeric_literal"
    INLINE_CALCULATION = "inline_calculation"
    NUMERIC_TS = "numeric_ts"


@dataclass
class Suggestion:
    """Sugestão de refatoração para uma violation"""
    violation_id: str
    violation_type: str
    value: str                    # Valor hardcoded (ex: "SWRD.L", 200, 0.5)
    file_path: str
    line_numbers: List[int]

    # Sugestão
    constant_name: str            # Nome proposto (ex: TICKER_SWRD_LSE)
    category: str                 # Categoria (TICKER_, COLUMN_, DATE_FORMAT_)
    config_section: str           # Seção em config.py
    pattern: str                  # Pattern para replace (ex: '"SWRD.L"')
    replacement: str              # O que substituir (ex: 'TICKER_SWRD_LSE')

    # Análise
    risk_level: RiskLevel
    reason: str                   # Por que esse risco?
    affected_count: int           # Quantas linhas afetadas
    requires_import: bool = True  # Precisa adicionar import?
    can_auto_apply: bool = True   # Pode aplicar automaticamente?

    estimated_time_min: float = 2.0
    notes: str = ""


class SuggestionEngine:
    """Motor que gera sugestões de refatoração"""

    # Mapeamento de categorias para violações
    CATEGORY_PATTERNS = {
        "TICKER_": ["SWRD", "VWRA", "AVGS", "AVEM", "JPGL"],
        "COLUMN_": ["Close", "High", "Low", "Open", "Volume", "Delta", "Return"],
        "DATE_FORMAT_": ["%Y", "%m", "%d", "%Y-%m", "%Y-%m-%d", "%H:%M"],
    }

    def __init__(self):
        self.suggestions: List[Suggestion] = []
        self.config_constants = self._load_existing_constants()

    def _load_existing_constants(self) -> Set[str]:
        """Carrega constantes já existentes em config.py"""
        try:
            with open("scripts/config.py", "r") as f:
                content = f.read()
                # Regex para pegar nomes de constantes
                constants = re.findall(r'^([A-Z_]+)\s*=', content, re.MULTILINE)
                return set(constants)
        except FileNotFoundError:
            return set()

    def suggest_constant_name(self, violation_type: str, value: str, context: str = "") -> str:
        """Sugere nome de constante baseado no tipo e valor"""

        if violation_type == "duplicate_string":
            # Tickers
            if any(ticker in str(value) for ticker in self.CATEGORY_PATTERNS["TICKER_"]):
                base = str(value).replace(".L", "").upper()
                return f"TICKER_{base}_LSE"

            # Colunas de dataframe
            if str(value) in self.CATEGORY_PATTERNS["COLUMN_"]:
                return f"COLUMN_{str(value).upper().replace(' ', '_').replace('(', '').replace(')', '')}"

            # Formatos de data
            if "%" in str(value):
                format_name = str(value).replace("%", "").replace("-", "").upper()
                return f"DATE_FORMAT_{format_name}"

            # Genérico
            return f"CONST_{str(value).upper()[:20]}"

        elif violation_type == "numeric_literal":
            # Baseado em contexto (se disponível)
            if "window" in context.lower():
                return "SMA_VOLATILITY_WINDOW"
            elif "threshold" in context.lower():
                return "THRESHOLD_VALUE"
            elif "percent" in context.lower() or "%" in context:
                return "PERCENTAGE_VALUE"

            return f"NUMERIC_CONST_{str(value).replace('.', '_')}"

        return "AUTO_CONSTANT"

    def assess_risk(self, violation_type: str, value: str, affected_count: int) -> Tuple[RiskLevel, str]:
        """Avalia risco de uma sugestão"""

        if violation_type == "duplicate_string":
            # Strings duplicadas = LOW risk (exact literal)
            return RiskLevel.LOW, f"Exact string match, {affected_count} occurrences"

        elif violation_type == "numeric_literal":
            if affected_count > 5:
                return RiskLevel.MEDIUM, f"High frequency ({affected_count}x), verify context"
            elif affected_count == 1:
                return RiskLevel.HIGH, "Single occurrence, unclear context"
            else:
                return RiskLevel.MEDIUM, f"Moderate frequency ({affected_count}x)"

        elif violation_type == "inline_calculation":
            return RiskLevel.HIGH, "Inline calculation, needs business logic review"

        return RiskLevel.MEDIUM, "Unknown violation type"

    def generate_pattern_and_replacement(self, violation_type: str, value: str,
                                        constant_name: str) -> Tuple[str, str]:
        """Gera padrão de busca e replacement"""

        if violation_type == "duplicate_string":
            # Quote string literais
            if '"' in str(value):
                pattern = f'"{value}"'
            else:
                pattern = f"'{value}'"
            replacement = constant_name

        elif violation_type == "numeric_literal":
            # Número puro
            pattern = f"\\b{re.escape(str(value))}\\b"
            replacement = constant_name

        else:
            pattern = str(value)
            replacement = constant_name

        return pattern, replacement

    def generate_suggestion(self, violation_id: str, violation_type: str, value: str,
                          file_path: str, line_numbers: List[int],
                          context: str = "") -> Optional[Suggestion]:
        """Gera uma sugestão completa para uma violation"""

        affected_count = len(line_numbers)

        # Sugerir nome
        constant_name = self.suggest_constant_name(violation_type, value, context)

        # Verificar se já existe
        if constant_name in self.config_constants:
            constant_name = f"{constant_name}_ALIAS"  # Ajustar se conflitar

        # Avaliar risco
        risk_level, reason = self.assess_risk(violation_type, value, affected_count)

        # Gerar pattern e replacement
        pattern, replacement = self.generate_pattern_and_replacement(
            violation_type, value, constant_name
        )

        # Determinar categoria
        category = self._determine_category(constant_name)

        # Criar sugestão
        suggestion = Suggestion(
            violation_id=violation_id,
            violation_type=violation_type,
            value=value,
            file_path=file_path,
            line_numbers=line_numbers,
            constant_name=constant_name,
            category=category,
            config_section=f"scripts/config.py",
            pattern=pattern,
            replacement=replacement,
            risk_level=risk_level,
            reason=reason,
            affected_count=affected_count,
            can_auto_apply=(risk_level == RiskLevel.LOW),
        )

        return suggestion

    def _determine_category(self, constant_name: str) -> str:
        """Determina categoria baseada no nome"""
        for category, patterns in self.CATEGORY_PATTERNS.items():
            if constant_name.startswith(category):
                return category
        return "GENERIC"

    def generate_all_suggestions(self, violations: List[Dict]) -> Dict:
        """Gera sugestões para todas as violations"""

        suggestions = []
        unable_to_suggest = []

        for idx, violation in enumerate(violations, 1):
            try:
                suggestion = self.generate_suggestion(
                    violation_id=f"V{idx:03d}",
                    violation_type=violation.get("type", "unknown"),
                    value=violation.get("value", ""),
                    file_path=violation.get("file", ""),
                    line_numbers=violation.get("lines", []),
                    context=violation.get("context", "")
                )

                if suggestion:
                    suggestions.append(suggestion)
            except Exception as e:
                unable_to_suggest.append({
                    "violation": violation,
                    "error": str(e)
                })

        # Análise de risco
        low_risk = sum(1 for s in suggestions if s.risk_level == RiskLevel.LOW)
        medium_risk = sum(1 for s in suggestions if s.risk_level == RiskLevel.MEDIUM)
        high_risk = sum(1 for s in suggestions if s.risk_level == RiskLevel.HIGH)

        total_time = sum(s.estimated_time_min for s in suggestions)

        return {
            "violations_analyzed": len(violations),
            "suggestions_generated": len(suggestions),
            "unable_to_suggest": len(unable_to_suggest),
            "suggestions": [asdict(s) for s in suggestions],
            "summary": {
                "low_risk": low_risk,
                "medium_risk": medium_risk,
                "high_risk": high_risk,
                "total_estimated_time_hours": round(total_time / 60, 1),
            },
            "unable_to_suggest_list": unable_to_suggest
        }

    def save_suggestions_json(self, suggestions_data: Dict, output_path: str):
        """Salva sugestões em JSON"""
        with open(output_path, "w") as f:
            json.dump(suggestions_data, f, indent=2, default=str)
        print(f"✅ Saved suggestions to {output_path}")

    def generate_summary_report(self, suggestions_data: Dict) -> str:
        """Gera relatório textual das sugestões"""

        summary = suggestions_data["summary"]
        report = f"""
╔════════════════════════════════════════════╗
║  P4 AUTO-FIX SUGGESTION REPORT             ║
╚════════════════════════════════════════════╝

Violations Analyzed:     {suggestions_data['violations_analyzed']}
Suggestions Generated:   {suggestions_data['suggestions_generated']}
Unable to Suggest:       {suggestions_data['unable_to_suggest']}

RISK BREAKDOWN:
  🟢 LOW risk       {summary['low_risk']} (auto-fixable)
  🟡 MEDIUM risk    {summary['medium_risk']} (needs review)
  🔴 HIGH risk      {summary['high_risk']} (manual only)

ESTIMATED EFFORT:
  Total time:       {summary['total_estimated_time_hours']} hours
  Avg per fix:      ~{round(60 * summary["total_estimated_time_hours"] / suggestions_data["suggestions_generated"], 1) if suggestions_data["suggestions_generated"] > 0 else 0} minutes

NEXT STEPS:
  1. Review suggestions: p4-suggestions-2026-04-27.json
  2. For LOW risk: python3 scripts/p4_apply_fixes.py --auto
  3. For MEDIUM/HIGH: python3 scripts/p4_apply_fixes.py --interactive
  4. Validate: python3 scripts/detect_hardcoding.py --report
"""
        return report


def main():
    """CLI para sugestão engine"""
    parser = argparse.ArgumentParser(
        description="P4: Generate auto-fix suggestions for hardcoding violations"
    )
    parser.add_argument("--violations-file", default="/tmp/violations.json",
                       help="JSON file with detected violations")
    parser.add_argument("--output", default="p4-suggestions-2026-04-27.json",
                       help="Output file for suggestions")
    parser.add_argument("--report", action="store_true",
                       help="Print summary report")

    args = parser.parse_args()

    # Load violations
    try:
        with open(args.violations_file, "r") as f:
            violations = json.load(f)
    except FileNotFoundError:
        print(f"❌ Violations file not found: {args.violations_file}")
        return 1

    # Generate suggestions
    engine = SuggestionEngine()
    suggestions_data = engine.generate_all_suggestions(violations)

    # Save output
    engine.save_suggestions_json(suggestions_data, args.output)

    # Print report
    if args.report:
        report = engine.generate_summary_report(suggestions_data)
        print(report)

    return 0


if __name__ == "__main__":
    exit(main())
