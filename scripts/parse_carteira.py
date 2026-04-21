"""
parse_carteira.py — Extrai tabela "Parâmetros para Scripts" de carteira.md
e gera dados/carteira_params.json.

Rodar sempre que carteira.md mudar: python scripts/parse_carteira.py
Também chamado automaticamente por generate_data.py no início do pipeline.
"""
import re
import json
import pathlib

ROOT = pathlib.Path(__file__).parent.parent


def parse() -> dict:
    """Lê seção '## Parâmetros para Scripts' de carteira.md e retorna dict tipado."""
    carteira_path = ROOT / "agentes" / "contexto" / "carteira.md"
    content = carteira_path.read_text(encoding="utf-8")

    # Encontra seção ## Parâmetros para Scripts até o próximo ## ou fim do arquivo
    section_match = re.search(
        r"## Parâmetros para Scripts\n(.*?)(?=\n## |\Z)",
        content,
        re.DOTALL,
    )
    if not section_match:
        raise ValueError(
            "Seção '## Parâmetros para Scripts' não encontrada em carteira.md. "
            "Adicione a tabela antes de rodar este script."
        )

    params: dict = {}
    for line in section_match.group(1).splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        parts = [p.strip() for p in stripped.strip("|").split("|")]
        if len(parts) < 2:
            continue
        key = parts[0]
        raw = parts[1]

        # Ignorar cabeçalho e separador
        if not key or key in ("Chave",) or key.startswith("-"):
            continue

        # Converter tipo automaticamente
        params[key] = _coerce(raw)

    if not params:
        raise ValueError(
            "Tabela '## Parâmetros para Scripts' está vazia em carteira.md."
        )

    return params


def _coerce(raw: str):
    """Converte string para int, float, bool ou string."""
    low = raw.lower()
    if low == "true":
        return True
    if low == "false":
        return False
    # Tentar int (sem ponto decimal)
    if re.match(r"^-?\d+$", raw):
        return int(raw)
    # Tentar float
    try:
        return float(raw)
    except ValueError:
        return raw


if __name__ == "__main__":
    params = parse()
    out = ROOT / "dados" / "carteira_params.json"
    out.write_text(json.dumps(params, indent=2, ensure_ascii=False) + "\n")
    print(f"✓ carteira_params.json gerado ({len(params)} parâmetros)")
    # Mostrar resumo
    for k, v in params.items():
        print(f"  {k}: {v!r}")
