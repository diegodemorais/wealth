#!/usr/bin/env python3
"""
Load current posições from dados/ibkr/lotes.json
Converts IBKR lotes (historical) → posicoes (current holdings with avg cost)
"""

import json
from pathlib import Path


def load_posicoes_from_lotes():
    """Carrega posições atuais de dados/ibkr/lotes.json"""
    
    lotes_path = Path("dados/ibkr/lotes.json")
    
    if not lotes_path.exists():
        print(f"⚠️ {lotes_path} não encontrado")
        return {}
    
    with open(lotes_path) as f:
        lotes_data = json.load(f)
    
    posicoes = {}
    
    for ticker, ticker_data in lotes_data.items():
        lotes = ticker_data.get("lotes", [])
        
        if not lotes:
            continue
        
        # Calcular qty total e avg_cost FIFO
        total_qty = 0
        total_cost = 0
        
        for lot in lotes:
            qty = lot.get("qty", 0)
            cost_per_share = lot.get("custo_por_share", 0)
            
            total_qty += qty
            total_cost += qty * cost_per_share
        
        if total_qty > 0:
            avg_cost = total_cost / total_qty
            
            posicoes[ticker] = {
                "qty": total_qty,
                "avg_cost": round(avg_cost, 4),
                "status": ticker_data.get("status", "alvo"),
                "num_lotes": len(lotes),
            }
    
    return posicoes


if __name__ == "__main__":
    posicoes = load_posicoes_from_lotes()
    
    print("✅ Posições carregadas de dados/ibkr/lotes.json:\n")
    for ticker, pos in posicoes.items():
        print(f"  {ticker}: {pos['qty']:.2f} shares @ avg ${pos['avg_cost']:.4f} ({pos['num_lotes']} lotes)")
    
    # Salvar em cache
    cache_path = Path("dados/posicoes_cache.json")
    with open(cache_path, "w") as f:
        json.dump(posicoes, f, indent=2)
    
    print(f"\n✓ Cache salvo em {cache_path}")
