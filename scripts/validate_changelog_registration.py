#!/usr/bin/env python3
"""
validate_changelog_registration.py — Pre-commit hook

Valida que TODAS as alterações em dashboard (react-app/, scripts/)
estejam registradas na tabela "Done" do agentes/issues/README.md

Bloqueia commit se houver files não registrados (exceto excluídos, temporários, etc).

Uso:
  python3 scripts/validate_changelog_registration.py

Configurar no pre-commit:
  .git/hooks/pre-commit:
    #!/bin/sh
    exec python3 scripts/validate_changelog_registration.py
"""

import subprocess
import re
from pathlib import Path

# Diretórios que devem ser rastreados no changelog
TRACKED_DIRS = [
    "react-app/src/",
    "react-app/tests/",
    "scripts/",
]

# Extensões de arquivo a validar
TRACKED_EXTENSIONS = [
    ".tsx", ".ts", ".jsx", ".js",  # React/TypeScript
    ".py",                          # Python
    ".css", ".scss",               # Styles
    ".md",                         # Docs
]

# Padrões a IGNORAR (não requerem changelog)
IGNORE_PATTERNS = [
    r"\.git/",
    r"node_modules/",
    r"__pycache__/",
    r"\.venv/",
    r"\.env",
    r"\.env\.local",
    r"\.DS_Store",
    r"package-lock\.json",
    r"yarn\.lock",
    r"\.pyc$",
    r"\.next/",
    r"build/",
    r"dist/",
    r"coverage/",
    r"\.pytest_cache/",
    r"^\.husky/",  # Git hooks
    r"^\.git/",
    r"README\.md$",  # README itself can be committed without changelog entry
]

def get_staged_files() -> list[str]:
    """Get list of files staged for commit."""
    try:
        result = subprocess.run(
            ["git", "diff", "--cached", "--name-only"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip().split("\n") if result.stdout.strip() else []
    except subprocess.CalledProcessError as e:
        print(f"❌ Error getting staged files: {e}")
        return []


def should_track_file(filepath: str) -> bool:
    """Check if file should be tracked in changelog."""
    # Check if in tracked directory
    is_tracked_dir = any(filepath.startswith(d) for d in TRACKED_DIRS)
    if not is_tracked_dir:
        return False

    # Check extension
    has_tracked_ext = any(filepath.endswith(ext) for ext in TRACKED_EXTENSIONS)
    if not has_tracked_ext:
        return False

    # Check ignore patterns
    for pattern in IGNORE_PATTERNS:
        if re.search(pattern, filepath):
            return False

    return True


def get_changelog_entries() -> set[str]:
    """Extract all file paths from README.md Done table."""
    readme_path = Path(__file__).parent.parent / "agentes" / "issues" / "README.md"

    if not readme_path.exists():
        return set()

    content = readme_path.read_text(encoding="utf-8")

    # Find all markdown links in format [text](path) in the Done section
    # Extract from section after "### Done — Últimos Componentes Alterados"
    done_section_start = content.find("### Done — Últimos Componentes Alterados")
    if done_section_start == -1:
        return set()

    # Get content until next section
    next_section = content.find("\n### ", done_section_start + 1)
    if next_section == -1:
        done_section = content[done_section_start:]
    else:
        done_section = content[done_section_start:next_section]

    # Extract all URLs from markdown links
    # Pattern: [text](path#optional-anchor)
    link_pattern = r"\]\(([^)]+?(?:#[^)]*)?)\)"
    matches = re.findall(link_pattern, done_section)

    entries = set()
    for match in matches:
        # Remove anchor if present
        filepath = match.split("#")[0]
        # Remove GitHub prefix if present
        if filepath.startswith("https://github.com/"):
            filepath = filepath.replace("https://github.com/diegodemorais/wealth/blob/main/", "")
        entries.add(filepath)

    return entries


def normalize_path(filepath: str) -> str:
    """Normalize path for comparison."""
    return filepath.strip().replace("\\", "/")


def main():
    print("🔍 Validando alterações no changelog...")

    staged_files = get_staged_files()
    if not staged_files:
        print("✅ Nenhuma alteração staged.")
        return 0

    # Filter files that should be tracked
    files_to_track = [f for f in staged_files if should_track_file(f)]

    if not files_to_track:
        print("✅ Nenhuma alteração em arquivos rastreados (dashboard/scripts).")
        return 0

    # Get current changelog entries
    changelog_entries = get_changelog_entries()

    # Check if all tracked files are in changelog
    unregistered = []
    for filepath in files_to_track:
        normalized = normalize_path(filepath)
        found = any(
            normalized in entry or entry in normalized
            for entry in changelog_entries
        )
        if not found:
            unregistered.append(filepath)

    if unregistered:
        print("\n❌ ERRO: Alterações não registradas no changelog!")
        print(f"\n   {len(unregistered)} arquivo(s) não estão na tabela 'Done' do README.md:\n")
        for filepath in unregistered:
            print(f"   - {filepath}")

        print("\n📝 AÇÃO REQUERIDA:")
        print("   1. Abra: agentes/issues/README.md")
        print("   2. Vá para: ### Done — Últimos Componentes Alterados")
        print("   3. Adicione 1 linha por arquivo alterado:")
        print("      | ISSUE-ID | Component | 2026-04-27 | Descrição breve | [path](link) |")
        print("   4. Commit novamente\n")

        return 1

    print(f"✅ Todos os {len(files_to_track)} arquivo(s) estão registrados no changelog.")
    return 0


if __name__ == "__main__":
    exit(main())
