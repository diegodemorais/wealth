#!/usr/bin/env python3
"""
IBKR Posições Sync — Intelligent Fallback Chain

Busca posições em ordem de preferência:
1. IBKR Flex Query API (real-time, se disponível)
2. Fallback: dados/ibkr/lotes.json (histórico local)
3. Fallback: dados/posicoes_cache.json (último cached)
4. Empty: {} (sem dados disponível)

Se Flex Query suceder, faz APPEND em lotes.json (novos aportes)
Se falhar, usa histórico existente (sem perder dados)

Uso:
    python3 scripts/ibkr_posicoes_sync.py                    # Auto-sync com fallback
    python3 scripts/ibkr_posicoes_sync.py --flex-only        # Só Flex (erro se falhar)
    python3 scripts/ibkr_posicoes_sync.py --cached           # Só usar cached (offline)
"""

import json
import argparse
import sys
from pathlib import Path
from typing import Dict, Optional, Tuple
from datetime import datetime


class IBKRPosicoesSyncr:
    """Sincroniza posições IBKR com fallback intelligent"""

    def __init__(self, verbose=True):
        self.verbose = verbose
        self.root = Path(__file__).parent.parent
        self.lotes_path = self.root / "dados" / "ibkr" / "lotes.json"
        self.cache_path = self.root / "dados" / "posicoes_cache.json"

    def log(self, msg: str):
        """Log com verbosity control"""
        if self.verbose:
            print(msg)

    # ─────────────────────────────────────────────────────────────────────
    # Layer 1: IBKR Flex Query (Real-time)
    # ─────────────────────────────────────────────────────────────────────

    def fetch_flex_trades(self) -> Optional[Dict]:
        """
        Busca trades do IBKR Flex Query API
        Requer: token em IBKR_FLEX_TOKEN env var

        Returns:
            Dict com lotes por ticker ou None se falhar
        """
        import os
        token = os.getenv("IBKR_FLEX_TOKEN")

        if not token:
            self.log("  ⚠️ IBKR_FLEX_TOKEN não configurado (pulando Flex Query)")
            return None

        try:
            self.log("  ▶ Buscando trades via IBKR Flex Query...")

            # Importar dinamicamente para não quebrar se ibkr_sync não existir
            sys.path.insert(0, str(self.root / "scripts"))
            from ibkr_sync import fetch_flex_trades_impl

            trades = fetch_flex_trades_impl(token)

            if not trades:
                self.log("  ⚠️ Flex Query retornou vazio")
                return None

            self.log(f"  ✅ Flex Query: {len(trades)} trades carregados")
            return self._parse_trades_to_lotes(trades)

        except Exception as e:
            self.log(f"  ⚠️ Flex Query falhou: {e}")
            return None

    def _parse_trades_to_lotes(self, trades: list) -> Dict:
        """Converte trades IBKR em estrutura de lotes"""
        from collections import defaultdict

        lotes_by_ticker = defaultdict(list)

        for trade in trades:
            ticker = trade.get("symbol", "").upper()
            if not ticker:
                continue

            qty = float(trade.get("quantity", 0))
            if qty <= 0:
                continue

            date = trade.get("tradeDate", trade.get("date", ""))
            price = float(trade.get("tradePrice", 0))

            lote = {
                "data": date,
                "qty": qty,
                "custo_por_share": price,
            }

            lotes_by_ticker[ticker].append(lote)

        # Estrutura final
        resultado = {}
        for ticker, lotes in lotes_by_ticker.items():
            resultado[ticker] = {
                "status": self._infer_status(ticker),
                "lotes": lotes,
                "ultima_atualizacao": datetime.now().isoformat(),
            }

        return resultado

    def _infer_status(self, ticker: str) -> str:
        """Inferir status (alvo/transitório/legado) baseado no ticker"""
        alvo = {"SWRD", "AVGS", "AVEM"}
        transitorio = {"EIMI", "AVES", "AVUV", "AVDV", "DGS", "USSC"}
        legado = {"IWVL", "JPGL", "COIN"}

        if ticker in alvo:
            return "alvo"
        elif ticker in transitorio:
            return "transitório"
        elif ticker in legado:
            return "legado"
        else:
            return "outro"

    # ─────────────────────────────────────────────────────────────────────
    # Layer 2: Local Lotes File (Historical)
    # ─────────────────────────────────────────────────────────────────────

    def load_local_lotes(self) -> Optional[Dict]:
        """Carrega lotes.json existente (histórico)"""
        if not self.lotes_path.exists():
            self.log(f"  ⚠️ {self.lotes_path} não existe")
            return None

        try:
            with open(self.lotes_path) as f:
                lotes = json.load(f)
            self.log(f"  ✅ Lotes locais: {len(lotes)} tickers")
            return lotes
        except Exception as e:
            self.log(f"  ⚠️ Erro lendo lotes.json: {e}")
            return None

    # ─────────────────────────────────────────────────────────────────────
    # Layer 3: Cache File (Fallback)
    # ─────────────────────────────────────────────────────────────────────

    def load_cache(self) -> Optional[Dict]:
        """Carrega posicoes_cache.json (último snapshot)"""
        if not self.cache_path.exists():
            self.log(f"  ⚠️ {self.cache_path} não existe")
            return None

        try:
            with open(self.cache_path) as f:
                cache = json.load(f)
            self.log(f"  ✅ Cache: {len(cache)} tickers")
            return cache
        except Exception as e:
            self.log(f"  ⚠️ Erro lendo cache: {e}")
            return None

    # ─────────────────────────────────────────────────────────────────────
    # Layer Merge: Combinar com inteligência
    # ─────────────────────────────────────────────────────────────────────

    def merge_lotes(self, flex_new: Dict, local_old: Dict) -> Dict:
        """
        Merge Flex Query (novo) com Local (velho)

        Estratégia:
        - Se ticker em flex_new: usa flex_new (mais atualizado)
        - Se ticker só em local_old: mantém local_old (não perdeu dado)
        - Se ticker em ambos: append lotes novos, deduplica por data
        """

        if not local_old:
            self.log("  ▶ Nenhum dado local, usando Flex como base")
            return flex_new

        merged = dict(local_old)  # Começa com local

        for ticker, flex_data in flex_new.items():
            if ticker not in merged:
                # Novo ticker
                merged[ticker] = flex_data
                self.log(f"    ✓ Novo ticker: {ticker}")
            else:
                # Ticker existe em ambos — merge lotes
                flex_lotes = flex_data.get("lotes", [])
                local_lotes = merged[ticker].get("lotes", [])

                # Deduplica por data + qty + custo
                existing_keys = {(l["data"], l["qty"], l["custo_por_share"]) for l in local_lotes}

                new_lotes = []
                for lote in flex_lotes:
                    key = (lote["data"], lote["qty"], lote["custo_por_share"])
                    if key not in existing_keys:
                        new_lotes.append(lote)
                        existing_keys.add(key)

                if new_lotes:
                    merged[ticker]["lotes"].extend(new_lotes)
                    self.log(f"    ✓ {ticker}: +{len(new_lotes)} novos lotes")
                else:
                    self.log(f"    ~ {ticker}: sem novos lotes")

                # Atualizar status se necessário
                merged[ticker]["status"] = flex_data.get("status", merged[ticker].get("status"))

        return merged

    # ─────────────────────────────────────────────────────────────────────
    # Main: Orchestrate Fallback Chain
    # ─────────────────────────────────────────────────────────────────────

    def sync_with_fallback(self,
                          flex_only: bool = False,
                          cached_only: bool = False) -> Tuple[Dict, str]:
        """
        Sincroniza posições com fallback intelligent

        Returns:
            (posicoes_dict, source_description)
        """

        source = "unknown"
        resultado = {}

        self.log("🔄 IBKR Posições Sync (intelligent fallback)")

        if cached_only:
            self.log("📋 Modo: Cached only (offline)")
            resultado = self.load_cache() or {}
            source = "cache"

        elif flex_only:
            self.log("🌐 Modo: Flex only (error if fails)")
            flex = self.fetch_flex_trades()
            if not flex:
                self.log("❌ Flex Query fallhou e --flex-only ativado")
                return {}, "flex-failed"
            resultado = flex
            source = "flex-only"

        else:
            # Fallback chain padrão
            self.log("⛓️  Modo: Fallback chain")

            # Tentar Flex primeiro
            flex = self.fetch_flex_trades()
            local = self.load_local_lotes()

            if flex and local:
                # Merge: flex + local
                resultado = self.merge_lotes(flex, local)
                source = "flex+local-merged"
                self.log(f"  ✓ Merged: {len(resultado)} tickers")

            elif flex:
                # Só Flex funcionou
                resultado = flex
                source = "flex-only"
                self.log(f"  ✓ Flex: {len(resultado)} tickers")

            elif local:
                # Flex falhou, usar local
                resultado = local
                source = "local"
                self.log(f"  ✓ Local: {len(resultado)} tickers")

            else:
                # Tudo falhou, tentar cache
                resultado = self.load_cache() or {}
                source = "cache" if resultado else "empty"

        return resultado, source

    def save_lotes(self, lotes: Dict) -> bool:
        """Salva lotes.json com backup"""
        try:
            # Criar backup
            if self.lotes_path.exists():
                backup = self.lotes_path.with_suffix(".json.bak")
                self.lotes_path.rename(backup)
                self.log(f"  💾 Backup: {backup}")

            # Salvar novo
            self.lotes_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.lotes_path, "w") as f:
                json.dump(lotes, f, indent=2)

            self.log(f"  ✅ Salvo: {self.lotes_path}")
            return True
        except Exception as e:
            self.log(f"  ❌ Erro salvando lotes: {e}")
            return False

    def save_cache(self, lotes: Dict) -> bool:
        """Salva cache de posições atuais (agregado)"""
        try:
            # Converter lotes → posicoes (aggregated)
            posicoes = {}
            for ticker, data in lotes.items():
                lotes_list = data.get("lotes", [])
                if not lotes_list:
                    continue

                total_qty = sum(l.get("qty", 0) for l in lotes_list)
                total_cost = sum(l.get("qty", 0) * l.get("custo_por_share", 0) for l in lotes_list)

                if total_qty > 0:
                    posicoes[ticker] = {
                        "qty": total_qty,
                        "avg_cost": round(total_cost / total_qty, 4),
                        "status": data.get("status"),
                        "num_lotes": len(lotes_list),
                    }

            self.cache_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.cache_path, "w") as f:
                json.dump(posicoes, f, indent=2)

            self.log(f"  ✅ Cache: {self.cache_path}")
            return True
        except Exception as e:
            self.log(f"  ❌ Erro salvando cache: {e}")
            return False


def main():
    parser = argparse.ArgumentParser(
        description="IBKR Posições Sync com intelligent fallback"
    )
    parser.add_argument("--flex-only", action="store_true",
                       help="Só Flex Query (erro se falhar)")
    parser.add_argument("--cached", action="store_true",
                       help="Só cache (offline mode)")
    parser.add_argument("--no-save", action="store_true",
                       help="Não salvar em lotes.json")
    parser.add_argument("--quiet", action="store_true",
                       help="Sem logs")

    args = parser.parse_args()

    syncer = IBKRPosicoesSyncr(verbose=not args.quiet)

    # Sincronizar
    lotes, source = syncer.sync_with_fallback(
        flex_only=args.flex_only,
        cached_only=args.cached
    )

    if not lotes:
        print("❌ Nenhuma posição carregada")
        return 1

    print(f"\n📊 Resultado: {source}")
    print(f"   Tickers: {len(lotes)}")

    # Mostrar summary
    for ticker in sorted(lotes.keys())[:5]:
        data = lotes[ticker]
        lotes_list = data.get("lotes", [])
        total_qty = sum(l.get("qty", 0) for l in lotes_list)
        print(f"   {ticker}: {total_qty:.2f} shares ({len(lotes_list)} lotes)")

    if len(lotes) > 5:
        print(f"   ... e {len(lotes) - 5} mais")

    # Salvar
    if not args.no_save:
        syncer.save_lotes(lotes)
        syncer.save_cache(lotes)

    return 0


if __name__ == "__main__":
    exit(main())
