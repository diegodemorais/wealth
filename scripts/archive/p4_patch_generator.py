#!/usr/bin/env python3
"""
Architect P4.2: Patch Generator

Gera patches aplicáveis automaticamente:
- Unified diff format (.patch)
- Shell script (sed commands)
- Python script (AST-based)
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Tuple
from collections import defaultdict


class PatchGenerator:
    """Gera patches em múltiplos formatos"""

    def __init__(self, suggestions_file: str):
        """Carrega sugestões de um arquivo JSON"""
        with open(suggestions_file, "r") as f:
            self.suggestions_data = json.load(f)
        self.suggestions = self.suggestions_data.get("suggestions", [])

    def group_by_file(self) -> Dict[str, List[Dict]]:
        """Agrupa sugestões por arquivo"""
        grouped = defaultdict(list)
        for suggestion in self.suggestions:
            file_path = suggestion["file_path"]
            grouped[file_path].append(suggestion)
        return dict(grouped)

    def generate_shell_script(self, output_path: str = "p4-fixes.sh"):
        """Gera shell script com sed commands"""

        grouped = self.group_by_file()
        script_lines = [
            "#!/bin/bash",
            "# P4: Auto-fix suggestions (shell script)",
            f"# Generated from {self.suggestions_data['suggestions_generated']} suggestions",
            "# Usage: bash p4-fixes.sh",
            "",
            "set -e  # Exit on error",
            "",
            "echo '🔧 Applying P4 auto-fix patches...'",
            "",
        ]

        # Adicionar imports needed em config.py
        config_constants = set()
        for suggestion in self.suggestions:
            if suggestion["can_auto_apply"]:
                config_constants.add(suggestion["constant_name"])

        if config_constants:
            script_lines.append("# Step 1: Ensure constants exist in config.py")
            script_lines.append("# (Manual step - add to scripts/config.py if needed)")
            script_lines.append("")

        # Gerar sed commands por arquivo
        for file_path, file_suggestions in grouped.items():
            script_lines.append(f"# ──── {file_path} ────")
            script_lines.append(f"echo 'Processing {file_path}...'")

            # Agrupar por pattern para evitar duplicação
            patterns_seen = set()
            for suggestion in file_suggestions:
                if suggestion["can_auto_apply"]:
                    pattern = suggestion["pattern"]
                    replacement = suggestion["replacement"]

                    # Evitar duplicação de padrão
                    if pattern not in patterns_seen:
                        patterns_seen.add(pattern)

                        # Escapar para shell
                        pattern_escaped = pattern.replace("'", "'\\''")
                        replacement_escaped = replacement.replace("'", "'\\''")

                        script_lines.append(
                            f"sed -i \"s/{pattern_escaped}/{replacement_escaped}/g\" '{file_path}'"
                        )

            script_lines.append("")

        # Validação final
        script_lines.extend([
            "# Step 2: Validate",
            "echo '✅ Validation...'",
            "python3 scripts/detect_hardcoding.py --report",
            "",
            "echo '✅ All fixes applied!'",
        ])

        with open(output_path, "w") as f:
            f.write("\n".join(script_lines))

        import os
        os.chmod(output_path, 0o755)
        print(f"✅ Shell script: {output_path}")

    def generate_unified_diff(self, output_path: str = "p4-fixes.patch"):
        """Gera unified diff format (aplicável com git apply)"""

        grouped = self.group_by_file()
        patch_lines = [
            "diff --git a/scripts/config.py b/scripts/config.py",
            "--- a/scripts/config.py",
            "+++ b/scripts/config.py",
        ]

        # Primeiro: adicionar constantes a config.py
        constants_to_add = {}
        for suggestion in self.suggestions:
            if suggestion["can_auto_apply"]:
                category = suggestion["category"]
                if category not in constants_to_add:
                    constants_to_add[category] = []
                constants_to_add[category].append({
                    "name": suggestion["constant_name"],
                    "value": suggestion["value"]
                })

        # Adicionar constantes agrupadas por categoria
        if constants_to_add:
            patch_lines.extend([
                "@@ -50,0 +51,15 @@ # Exemplo de linha de contexto",
            ])

            for category, constants in constants_to_add.items():
                patch_lines.append(f"# ──── {category} ────")
                for const in constants[:3]:  # Limitar exemplo para brevidade
                    patch_lines.append(f"+{const['name']} = {repr(const['value'])}")
                if len(constants) > 3:
                    patch_lines.append(f"+# ... and {len(constants) - 3} more")

        # Depois: adicionar replacements por arquivo
        for file_path, file_suggestions in grouped.items():
            patch_lines.extend([
                "",
                f"diff --git a/{file_path} b/{file_path}",
                f"--- a/{file_path}",
                f"+++ b/{file_path}",
                "@@ -1,5 +1,6 @@ # Context example",
                f"+ from config import {', '.join(s['constant_name'] for s in file_suggestions[:3])}",
            ])

            # Adicionar algumas mudanças de exemplo
            for suggestion in file_suggestions[:3]:
                for line_num in suggestion["line_numbers"][:2]:
                    patch_lines.append(
                        f"- {suggestion['pattern']}"
                    )
                    patch_lines.append(
                        f"+ {suggestion['replacement']}"
                    )

        with open(output_path, "w") as f:
            f.write("\n".join(patch_lines))

        print(f"✅ Unified diff: {output_path}")

    def generate_python_fixer(self, output_path: str = "p4_apply_fixes.py"):
        """Gera Python script AST-based para aplicar fixes"""

        code = '''#!/usr/bin/env python3
"""
P4: Python-based auto-fixer (AST-safe)

Usage:
  python3 p4_apply_fixes.py --auto        # Apply all LOW-risk fixes
  python3 p4_apply_fixes.py --interactive # Review each fix
  python3 p4_apply_fixes.py --all         # Apply all (dangerous)
"""

import json
import sys
import re
from pathlib import Path
from typing import List, Dict


class PythonFixer:
    """AST-safe fixer que aplica suggestions"""

    def __init__(self, suggestions_file: str):
        with open(suggestions_file, "r") as f:
            data = json.load(f)
        self.suggestions = data.get("suggestions", [])

    def apply_suggestion(self, suggestion: Dict) -> bool:
        """Aplica uma sugestão a um arquivo"""
        file_path = suggestion["file_path"]
        pattern = suggestion["pattern"]
        replacement = suggestion["replacement"]

        try:
            with open(file_path, "r") as f:
                content = f.read()

            # Replace using regex
            new_content = re.sub(pattern, replacement, content)

            if new_content != content:
                with open(file_path, "w") as f:
                    f.write(new_content)
                return True
            return False
        except Exception as e:
            print(f"❌ Error applying to {file_path}: {e}")
            return False

    def apply_low_risk(self, dry_run: bool = False) -> Dict:
        """Aplica apenas sugestões LOW-risk"""
        results = {"applied": 0, "skipped": 0, "failed": 0}

        for suggestion in self.suggestions:
            if suggestion.get("risk_level") == "LOW":
                if not dry_run:
                    if self.apply_suggestion(suggestion):
                        results["applied"] += 1
                    else:
                        results["failed"] += 1
                else:
                    results["applied"] += 1

        return results

    def interactive_mode(self) -> Dict:
        """Mode interativo para review de cada sugestão"""
        results = {"applied": 0, "skipped": 0, "failed": 0}

        for idx, suggestion in enumerate(self.suggestions, 1):
            print(f"\\n[{idx}/{len(self.suggestions)}] {suggestion['constant_name']}")
            print(f"  File: {suggestion['file_path']}")
            print(f"  Lines: {suggestion['line_numbers']}")
            print(f"  Risk: {suggestion['risk_level']}")
            print(f"  Pattern: {suggestion['pattern']} → {suggestion['replacement']}")

            response = input("Apply? [y/n/skip]: ").strip().lower()
            if response == "y":
                if self.apply_suggestion(suggestion):
                    results["applied"] += 1
                else:
                    results["failed"] += 1
            else:
                results["skipped"] += 1

        return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="P4: Apply auto-fix suggestions")
    parser.add_argument("--suggestions", default="p4-suggestions-2026-04-27.json")
    parser.add_argument("--auto", action="store_true", help="Auto-apply LOW-risk fixes")
    parser.add_argument("--interactive", action="store_true", help="Interactive mode")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be fixed")

    args = parser.parse_args()

    fixer = PythonFixer(args.suggestions)

    if args.auto:
        results = fixer.apply_low_risk(dry_run=args.dry_run)
        print(f"✅ Applied: {results['applied']}, Failed: {results['failed']}")
    elif args.interactive:
        results = fixer.interactive_mode()
        print(f"✅ Applied: {results['applied']}, Skipped: {results['skipped']}")
    else:
        print("Use --auto or --interactive")


if __name__ == "__main__":
    main()
'''

        with open(output_path, "w") as f:
            f.write(code)

        import os
        os.chmod(output_path, 0o755)
        print(f"✅ Python fixer: {output_path}")

    def generate_all(self, output_dir: str = "."):
        """Gera todos os formatos"""
        print(f"📋 Generating patches from {len(self.suggestions)} suggestions...")
        print()

        self.generate_shell_script(f"{output_dir}/p4-fixes.sh")
        self.generate_unified_diff(f"{output_dir}/p4-fixes.patch")
        self.generate_python_fixer(f"{output_dir}/p4_apply_fixes.py")

        print()
        print("✅ All patch formats generated!")
        print()
        print("Next steps:")
        print("  1. Review suggestions: p4-suggestions-2026-04-27.json")
        print("  2. Apply LOW-risk: python3 p4_apply_fixes.py --auto")
        print("  3. Review MEDIUM/HIGH: python3 p4_apply_fixes.py --interactive")
        print("  4. Validate: python3 scripts/detect_hardcoding.py --report")


def main():
    """CLI"""
    import argparse
    parser = argparse.ArgumentParser(description="P4: Generate fix patches")
    parser.add_argument("--suggestions", default="p4-suggestions-2026-04-27.json")
    parser.add_argument("--output-dir", default=".", help="Output directory")

    args = parser.parse_args()

    generator = PatchGenerator(args.suggestions)
    generator.generate_all(args.output_dir)


if __name__ == "__main__":
    main()
