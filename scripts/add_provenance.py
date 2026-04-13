#!/usr/bin/env python3
"""
add_provenance.py — Adiciona rastreabilidade (_provenance) a data.json

Uso:
    python3 scripts/add_provenance.py
    python3 scripts/add_provenance.py --data dashboard/data.json --output dashboard/data.json

Cada campo rastreado inclui:
- source_file: qual script Python o calculou
- source_line: linha do script
- formula: lógica de cálculo
- input_fields: quais campos alimentam este
- last_updated: timestamp de atualização
"""

import json
import sys
from pathlib import Path
from datetime import datetime

ROOT = Path(__file__).parent.parent
DATA_FILE = ROOT / "dashboard" / "data.json"

# Mapa de provenance para campos críticos
PROVENANCE_MAP = {
    "concentracao_brasil.brasil_pct": {
        "source_file": "scripts/generate_data.py",
        "source_line": 1519,
        "formula": "(hodl11_brl + rf_total_brl + crypto_legado) / total_brl * 100",
        "input_fields": [
            "posicoes.HODL11.valor_brl",
            "rf.ipca2029.valor",
            "rf.ipca2040.valor",
            "rf.ipca2050.valor",
            "rf.renda_plus_2065.valor",
            "patrimonio.crypto_legado_brl"
        ],
        "reason": "Concentração em ativos de risco Brasil (HODL11 B3 + RF soberano BR + Crypto legacy)"
    },
    "macro.exposicao_cambial_pct": {
        "source_file": "scripts/generate_data.py",
        "source_line": 1900,
        "formula": "(equity_usd * cambio) / total_brl * 100",
        "input_fields": [
            "patrimonio.equity_usd",
            "macro.cambio",
            "patrimonio.total_brl"
        ],
        "reason": "Exposição cambial (equity USD convertido para BRL / total do portfólio)"
    },
    "concentracao_brasil.composicao.hodl11_brl": {
        "source_file": "scripts/generate_data.py",
        "source_line": 1510,
        "formula": "posicoes.HODL11.qty * posicoes.HODL11.preco",
        "input_fields": ["posicoes.HODL11.qty", "posicoes.HODL11.preco"],
        "reason": "HODL11 (BTC B3) em BRL: quantidade × preço"
    },
    "macro.cambio": {
        "source_file": "scripts/generate_data.py",
        "source_line": 1880,
        "formula": "patrimonio.cambio (from dashboard_state.json ou fallback config.CAMBIO_FALLBACK)",
        "input_fields": ["patrimonio.cambio"],
        "reason": "Taxa de câmbio BRL/USD para conversão de exposição USD"
    },
    "macro.selic_meta": {
        "source_file": "scripts/generate_data.py",
        "source_line": 1850,
        "formula": "config.SELIC_META_SNAPSHOT (snapshot de referência)",
        "input_fields": [],
        "reason": "Meta Selic vigente (snapshot em momento de execução)"
    },
    "fire.pfire_base": {
        "source_file": "scripts/fire_montecarlo.py",
        "source_line": None,
        "formula": "P(patrimônio >= gastos_esperados em 50 anos) via Monte Carlo",
        "input_fields": ["patrimonio.total_brl", "premissas.taxa_real_equity", "premissas.taxa_real_rf"],
        "reason": "Probabilidade de não quebrar (FIRE baseline)"
    }
}

def add_provenance(data: dict) -> dict:
    """Adiciona seção _provenance a data.json"""
    now = datetime.now().isoformat()
    
    provenance = {}
    for field_name, prov_meta in PROVENANCE_MAP.items():
        provenance[field_name] = {
            **prov_meta,
            "last_updated": now
        }
    
    data["_provenance"] = provenance
    return data

def main():
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"❌ Erro ao ler data.json: {e}")
        return False
    
    print(f"📝 Adicionando _provenance para {len(PROVENANCE_MAP)} campos...")
    data = add_provenance(data)
    
    try:
        DATA_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"✅ Provenance adicionado. Arquivo: {DATA_FILE}")
        return True
    except Exception as e:
        print(f"❌ Erro ao escrever data.json: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
