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
PISO_TAXA_RENDA_PLUS = 6.5    # % a.a. — abaixo disso não aporta DCA Renda+ (piso compra)
PISO_VENDA_RENDA_PLUS = 6.0   # % a.a. — abaixo disso VENDER toda posição Renda+ 2065 (gatilho saída)
RENDA_PLUS_ANO_VENC = 2065    # vencimento nominal do título
RENDA_PLUS_TAXA_DEFAULT = 7.08  # % a.a. — fallback se taxa não encontrada (carteira.md 2026-04-01)

# HODL11 bandas (fonte: carteira.md — "Alvo 3%, piso 1,5%, teto 5%")
HODL11_PISO_PCT = 1.5
HODL11_ALVO_PCT = 3.0
HODL11_TETO_PCT = 5.0

# Factor underperformance (fonte: carteira.md — gatilho revisão AVGS)
FACTOR_UNDERPERF_THRESHOLD = -5  # pp — AVGS vs SWRD rolling 12m

# TLH
TLH_GATILHO = 0.05              # 5% — perda mínima para acionar TLH

# Crypto legado (BTC+ETH+BNB+ADA+dust — Binance spot+earn)
# Fonte primária: dashboard_state.json "crypto_legado_brl" (atualizado por broker_analysis.py --broker binance)
# Fallback: valor abaixo (Binance statement 23/03/2026: $778 USD × 5.07 = R$3,944)
CRYPTO_LEGADO_BRL = 3_944


# ─── FIRE (fonte: carteira.md + fire_montecarlo.py PREMISSAS) ────────────────

PATRIMONIO_GATILHO = 13_400_000   # R$ 2026 real — gatilho formal FIRE
SWR_GATILHO = 0.024               # 2.4% — safe withdrawal rate meta
CUSTO_VIDA_BASE = 250_000         # R$/ano — baseline FIRE
APORTE_MENSAL = 25_000            # R$/mês
RENDA_ESTIMADA = 45_000           # R$/mês (×12 = R$540k/ano) — renda estimada para savings rate dashboard
IDADE_ATUAL = 39
ANO_NASCIMENTO = 1987             # para calcular idade dinâmica
IDADE_FIRE_ALVO = 53              # FIRE 2040
IDADE_FIRE_ASPIRACIONAL = 50      # FIRE 2037
BOND_TENT_META_ANOS = 7           # anos de gastos cobertos pelo bond pool no FIRE Day

# Fallbacks macro (snapshot — atualizar quando taxas mudarem significativamente)
CAMBIO_FALLBACK = 5.07            # USD/BRL — fallback offline (atualizar via /macro-bcb). Ref: PTAX 09/04/2026
# IPCA acumulado CAGR estimado para o período Abr/2021–Mar/2026 (5 anos).
# Calculado a partir das variações mensais BCB série 433: produto composto anualizado.
# Fonte: BCB API série 433 — usado como fallback quando a API está indisponível.
# Atualizar sempre que o período de cálculo do PvR mudar.
IPCA_CAGR_FALLBACK = 6.14         # % a.a. — IPCA CAGR Abr/2021–Mar/2026 (estimativa)
SELIC_META_SNAPSHOT = 14.75       # % a.a. — Abr/2026
FED_FUNDS_SNAPSHOT = 3.64         # % — Mar/2026
DEPRECIACAO_BRL_BASE = 0.5        # % a.a. — premissa do plano FIRE (carteira.md)

# ─── GLIDE PATH (fonte: carteira.md — tabela alocação por idade) ─────────────
# Atualizar quando carteira.md mudar a tabela de glide path
GLIDE_PATH = {
    # Fonte: carteira.md "Tabela de Alocacao por Idade"
    # Renda+: valor máximo (<=5%) — posição atual pode ser menor (tático)
    "idades":     [39, 40, 50, 60, 70],
    "equity":     [79, 79, 79, 94, 94],
    "ipca_longo": [15, 15, 15,  0,  0],
    "ipca_curto": [ 0,  0,  3,  3,  3],
    "hodl11":     [ 3,  3,  3,  3,  3],
    "renda_plus": [ 5,  5,  5,  0,  0],  # <=5% nas 3 primeiras idades (tático)
}


# ─── TER POR ETF (Total Expense Ratio) ──────────────────────────────────────
# Fontes: factsheet oficial de cada ETF (Invesco, Avantis, Hashdex)
# 0% para títulos do Tesouro Direto (TD) — sem taxa de administração
ETF_TER = {
    "SWRD":    0.12,   # Invesco MSCI World UCITS ETF (Acc)
    "AVGS":    0.25,   # Avantis Global Small Cap Value UCITS ETF
    "AVEM":    0.25,   # Avantis Emerging Markets UCITS ETF
    "JPGL":    0.38,   # JPMorgan Global Equity Premium Income UCITS (legado, target 0%)
    "HODL11":  0.70,   # Hashdex Nasdaq Crypto Index (B3) — TER ~0.70%
    "RENDA":   0.00,   # Renda+ 2065 (Tesouro Direto) — sem TER
    "IPCA":    0.00,   # Tesouro IPCA+ (Tesouro Direto) — sem TER
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


# ─── ETF COMPOSITION (fonte: factsheets FTSE/justETF — dados target, aproximados) ───
# Regiões: participação aproximada no índice. Fatores: exposição relativa (0=none, 1=full).
# Atualizar quando factsheets forem revisados (anual).

ETF_COMPOSITION = {
    "SWRD": {
        "nome": "MSCI World",
        "descricao": "Invesco MSCI World UCITS ETF (Acc)",
        "regiao_primaria": "Developed Markets",
        "regioes": {"EUA": 0.65, "Europa": 0.22, "Japão": 0.06, "Outros DM": 0.07},
        "fatores": {"market": 1.0, "value": 0.0, "size": 0.0, "quality": 0.0},
    },
    "AVGS": {
        "nome": "Avantis Global Small Cap Value",
        "descricao": "Avantis Global Small Cap Value UCITS ETF",
        "regiao_primaria": "Developed Markets ex-US",
        "regioes": {"Europa": 0.45, "Japão": 0.25, "EUA": 0.15, "Outros": 0.15},
        "fatores": {"market": 1.0, "value": 0.7, "size": 0.8, "quality": 0.3},
    },
    "AVEM": {
        "nome": "Avantis Emerging Markets",
        "descricao": "Avantis Emerging Markets UCITS ETF",
        "regiao_primaria": "Emerging Markets",
        "regioes": {"China": 0.28, "India": 0.19, "Taiwan": 0.16, "Outros EM": 0.37},
        "fatores": {"market": 1.0, "value": 0.5, "size": 0.3, "quality": 0.2},
    },
}


# ─── MACRO REGRAS — engine de status do plano (fonte: IPS + carteira.md) ─────
# Regras mecânicas: zero interpretação subjetiva. Inputs lidos de outros JSONs.
# Ordem de prioridade: REVISAR > MONITORAR > PERMANECE (pior estado vence).

MACRO_REGRAS = {
    # Thresholds P(FIRE)
    "pfire_permanece_min": 0.85,   # P(FIRE) > 85% → PERMANECE (se demais OK)
    "pfire_monitorar_min": 0.80,   # 80–85% → MONITORAR
    # Abaixo de 80% → REVISAR

    # Thresholds drift máximo (pp = percentage points)
    "drift_permanece_max": 5.0,    # drift < 5pp → PERMANECE
    "drift_monitorar_max": 10.0,   # 5–10pp → MONITORAR
    # Acima de 10pp → REVISAR

    # Thresholds taxa IPCA+ (% a.a.)
    "ipca_taxa_monitorar_min": 5.5,  # taxa entre 5.5–6.0% → MONITORAR
    "ipca_taxa_revisar_max": 5.5,    # taxa < 5.5% → REVISAR
    # taxa >= 6.0% = normal (acima do piso)

    # Status labels
    "status_permanece": "PLANO_PERMANECE",
    "status_monitorar": "MONITORAR",
    "status_revisar": "REVISAR",
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
