"""
config.py — Fonte de verdade para constantes compartilhadas entre scripts.

Decisões estratégicas vivem em agentes/contexto/carteira.md (humano lê).
Este arquivo é a versão máquina. Quando carteira.md mudar, atualizar aqui.

Regra: se um valor é usado por 2+ scripts, fica aqui.
Se é usado por 1 script só (parâmetro de modelo), fica no script.
"""

# ─── ALOCAÇÃO ESTRATÉGICA (fonte: carteira.md + FI-equity-redistribuicao 2026-04-01) ───

EQUITY_PCT = 0.79           # 79% equity total
IPCA_LONGO_PCT = 0.15       # 15% IPCA+ longo (TD 2040 80% + TD 2050 20%)
IPCA_CURTO_PCT = 0.03       # 3% IPCA+ curto (comprar perto dos 50)
CRIPTO_PCT = 0.03           # 3% HODL11 + spot legado
RENDA_PLUS_PCT = 0.03       # ≤3% Renda+ 2065 (tático)

# Pesos DENTRO do bloco equity (somam 1.0)
EQUITY_WEIGHTS = {
    "SWRD": 0.50,
    "AVGS": 0.30,
    "AVEM": 0.20,
}

# Pesos no portfolio TOTAL (equity_weight × EQUITY_PCT)
PESOS_TARGET = {
    "SWRD":   EQUITY_PCT * EQUITY_WEIGHTS["SWRD"],   # 0.395
    "AVGS":   EQUITY_PCT * EQUITY_WEIGHTS["AVGS"],    # 0.237
    "AVEM":   EQUITY_PCT * EQUITY_WEIGHTS["AVEM"],    # 0.158
    "IPCA":   IPCA_LONGO_PCT,                          # 0.15
    "HODL11": CRIPTO_PCT,                              # 0.03
}


# ─── BUCKET MAP (fonte: ibkr_sync.py + checkin_mensal.py — canonical) ────────

BUCKET_MAP = {
    # SWRD bucket
    "SWRD": "SWRD", "WRDUSWUSD": "SWRD", "F50A": "SWRD",
    # AVGS bucket (Desenv. small+value)
    "AVGS": "AVGS", "AVUV": "AVGS", "AVDV": "AVGS", "USSC": "AVGS", "ZPRX": "AVGS",
    # AVEM bucket (Emergentes)
    "AVEM": "AVEM", "EIMI": "AVEM", "AVES": "AVEM", "DGS": "AVEM", "EMVL": "AVEM",
    # JPGL bucket (legado, target 0%)
    "JPGL": "JPGL", "IWVL": "JPGL", "IWQU": "JPGL",
}

# Inverso: bucket → lista de tickers
BUCKET_TICKERS = {}
for _tk, _bk in BUCKET_MAP.items():
    BUCKET_TICKERS.setdefault(_bk, []).append(_tk)


# ─── TICKERS YAHOO FINANCE ──────────────────────────────────────────────────

TICKERS_YF = {
    "SWRD": "SWRD.L", "AVGS": "AVGS.L", "AVEM": "AVEM.L",
    "AVUV": "AVUV", "AVDV": "AVDV", "USSC": "USSC.L",
    "EIMI": "EIMI.L", "AVES": "AVES", "DGS": "DGS",
    "IWVL": "IWVL.L", "JPGL": "JPGL.L",
    "VWRA": "VWRA.L",
    "HODL11": "HODL11.SA",
    "BTC": "BTC-USD",
    "USD_BRL": "USDBRL=X",
}


# ─── PISOS E GATILHOS OPERACIONAIS (fonte: carteira.md + gatilhos.md) ────────

PISO_TAXA_IPCA_LONGO = 6.0    # % a.a. — abaixo disso não prioriza DCA IPCA+
PISO_TAXA_RENDA_PLUS = 6.5    # % a.a. — abaixo disso não prioriza DCA Renda+


# ─── FIRE (fonte: carteira.md + fire_montecarlo.py PREMISSAS) ────────────────

PATRIMONIO_GATILHO = 13_400_000   # R$ 2026 real — gatilho formal FIRE
SWR_GATILHO = 0.024               # 2.4% — safe withdrawal rate meta
CUSTO_VIDA_BASE = 250_000         # R$/ano — baseline FIRE
APORTE_MENSAL = 25_000            # R$/mês
RENDA_ESTIMADA = 45_000           # R$/ano — renda estimada para savings rate dashboard
IDADE_ATUAL = 39
IDADE_FIRE_ALVO = 53              # FIRE 2040
IDADE_FIRE_ASPIRACIONAL = 50      # FIRE 2037

# ─── GLIDE PATH (fonte: carteira.md — tabela alocação por idade) ─────────────
# Atualizar quando carteira.md mudar a tabela de glide path
GLIDE_PATH = {
    # Fonte: carteira.md "Tabela de Alocacao por Idade"
    # Fix F6 (HD-dashboard-v2): Renda+ 2065 é overlay tático (<=5%), NÃO é bucket
    # estratégico. Carve-out vem de equity quando Renda+ ativo.
    # Soma sem Renda+ = 100% em todas as idades.
    # Renda+ informado separadamente para contexto no tooltip.
    "idades":     [39, 40, 50, 60, 70],
    "equity":     [79, 79, 79, 94, 94],
    "ipca_longo": [15, 15, 15,  0,  0],
    "ipca_curto": [ 0,  0,  3,  3,  3],
    "hodl11":     [ 3,  3,  3,  3,  3],
    # Renda+ overlay: equity efetivo = equity - renda_plus quando ativo
    # TODO: Diego validar se carve-out vem de equity ou de ipca_longo
    "renda_plus_overlay": [5, 5, 5, 0, 0],
}


# ─── TRIBUTAÇÃO (fonte: carteira.md — Lei 14.754/2023) ───────────────────────

IR_ALIQUOTA = 0.15                # 15% flat sobre ganho de capital ETFs exterior


# ─── SHADOW PORTFOLIOS (fonte: shadow-portfolio.md) ─────────────────────────

PESOS_SHADOW_C = {
    "VWRA": EQUITY_PCT,        # 0.79
    "IPCA": IPCA_LONGO_PCT,    # 0.15
    "BTC":  CRIPTO_PCT,        # 0.03
    "RENDA": RENDA_PLUS_PCT,   # 0.03
}


# ─── DASHBOARD STATE (JSON compartilhado entre scripts e HTML) ───────────────

import json
import os
from datetime import date

DASHBOARD_STATE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                                     "dados", "dashboard_state.json")

def load_dashboard_state() -> dict:
    """Lê o dashboard_state.json atual."""
    try:
        with open(DASHBOARD_STATE_PATH) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def update_dashboard_state(section: str, data: dict, generator: str = "unknown") -> None:
    """Atualiza uma seção do dashboard_state.json sem sobrescrever as outras.
    
    Uso:
        update_dashboard_state("posicoes", {"SWRD": {...}, ...}, generator="ibkr_sync.py")
        update_dashboard_state("fire", {"pfire_base": 90.4, ...}, generator="fire_montecarlo.py")
    """
    state = load_dashboard_state()
    state[section] = data
    state["_meta"] = {
        "generated": str(date.today()),
        "last_update_section": section,
        "last_update_generator": generator,
        "version": state.get("_meta", {}).get("version", 1),
    }
    with open(DASHBOARD_STATE_PATH, "w") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)
