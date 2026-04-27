"""
config.py — Constantes compartilhadas entre scripts.

Fonte única de verdade: agentes/contexto/carteira.md (seção "Parâmetros para Scripts")
→ parse_carteira.py gera dados/carteira_params.json
→ este arquivo lê de lá via _load_params()

Regra: decisões financeiras vivem em carteira.md.
       Código estrutural (BUCKET_MAP, TICKERS_YF, etc.) fica aqui.
       Ao mudar qualquer valor em carteira.md, rodar: python scripts/parse_carteira.py
"""

import json as _json
import pathlib as _pathlib

# ─── LOADER (fonte: dados/carteira_params.json gerado de carteira.md) ────────

def _load_params() -> dict:
    """Lê dados/carteira_params.json. Retorna {} se não existir (usa fallback abaixo)."""
    p = _pathlib.Path(__file__).parent.parent / "dados" / "carteira_params.json"
    if p.exists():
        return _json.loads(p.read_text(encoding="utf-8"))
    return {}

_P = _load_params()


# ─── ALOCAÇÃO ESTRATÉGICA ────────────────────────────────────────────────────

EQUITY_PCT       = _P.get("equity_pct",       0.79)
IPCA_LONGO_PCT   = _P.get("ipca_longo_pct",   0.15)
IPCA_CURTO_PCT   = _P.get("ipca_curto_pct",   0.03)
CRIPTO_PCT       = _P.get("cripto_pct",       0.03)
RENDA_PLUS_PCT   = _P.get("renda_plus_pct",   0.03)

EQUITY_WEIGHTS = {
    "SWRD": _P.get("equity_weight_swrd", 0.50),
    "AVGS": _P.get("equity_weight_avgs", 0.30),
    "AVEM": _P.get("equity_weight_avem", 0.20),
}

# Pesos no portfolio TOTAL (derivados)
PESOS_TARGET = {
    "SWRD":   EQUITY_PCT * EQUITY_WEIGHTS["SWRD"],
    "AVGS":   EQUITY_PCT * EQUITY_WEIGHTS["AVGS"],
    "AVEM":   EQUITY_PCT * EQUITY_WEIGHTS["AVEM"],
    "IPCA":   IPCA_LONGO_PCT,
    "HODL11": CRIPTO_PCT,
}


# ─── BUCKET MAP (estrutural — muda só com entrada de novo ETF) ───────────────

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


# ─── TICKERS YAHOO FINANCE (estrutural) ─────────────────────────────────────

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


# ─── PISOS E GATILHOS OPERACIONAIS ───────────────────────────────────────────

PISO_TAXA_IPCA_LONGO    = _P.get("piso_taxa_ipca_longo",    6.0)
PISO_TAXA_RENDA_PLUS    = _P.get("piso_taxa_renda_plus",    6.5)
PISO_VENDA_RENDA_PLUS   = _P.get("piso_venda_renda_plus",   6.0)
RENDA_PLUS_ANO_VENC     = _P.get("renda_plus_ano_venc",     2065)
RENDA_PLUS_TAXA_DEFAULT = _P.get("renda_plus_taxa_default", 7.08)

HODL11_PISO_PCT = _P.get("hodl11_piso_pct", 1.5)
HODL11_ALVO_PCT = _P.get("hodl11_alvo_pct", 3.0)
HODL11_TETO_PCT = _P.get("hodl11_teto_pct", 5.0)

FACTOR_UNDERPERF_THRESHOLD = _P.get("factor_underperf_threshold_pp", -5)
TLH_GATILHO               = _P.get("tlh_gatilho",                    0.05)

# Crypto legado (BTC+ETH+BNB+ADA+dust — Binance spot+earn)
# Fonte primária: dashboard_state.json "crypto_legado_brl" (atualizado por broker_analysis.py --broker binance)
# Fallback: valor abaixo (Binance statement 23/03/2026: $778 USD × 5.07 = R$3,944)
CRYPTO_LEGADO_BRL = 3_944


# ─── FIRE CENÁRIOS ───────────────────────────────────────────────────────────

HORIZONTE_VIDA              = _P.get("horizonte_vida",              90)
PATRIMONIO_GATILHO          = _P.get("patrimonio_gatilho",          8_333_333)
SWR_GATILHO                 = _P.get("swr_gatilho",                 0.030)
SWR_FALLBACK                = _P.get("swr_fallback",                0.035)

IDADE_CENARIO_BASE          = _P.get("idade_cenario_base",          53)
APORTE_CENARIO_BASE         = _P.get("aporte_cenario_base",         25_000)

IDADE_CENARIO_ASPIRACIONAL  = _P.get("idade_cenario_aspiracional",  49)
APORTE_CENARIO_ASPIRACIONAL = _P.get("aporte_cenario_aspiracional", 30_000)

CUSTO_VIDA_BASE        = _P.get("custo_vida_base",   250_000)
CUSTO_VIDA_BASE_CASADO = _P.get("custo_vida_casado", 270_000)
CUSTO_VIDA_BASE_FILHO  = _P.get("custo_vida_filho",  300_000)

RENDA_ESTIMADA      = _P.get("renda_estimada",      45_000)
IDADE_ATUAL         = _P.get("idade_atual",         39)
ANO_NASCIMENTO      = _P.get("ano_nascimento",      1987)
BOND_TENT_META_ANOS = _P.get("bond_tent_anos",      7)

# Patrimônio holístico
TERRENO_BRL              = _P.get("terreno_brl",              150_000)
TEM_CONJUGE              = _P.get("tem_conjuge",              False)
NOME_CONJUGE             = _P.get("nome_conjuge",             "Katia")
INSS_KATIA_ANUAL         = _P.get("inss_katia_anual",         93_600)
INSS_KATIA_INICIO_ANO    = _P.get("inss_katia_inicio_ano",    2049)
RETORNO_RF_REAL_BOND_POOL= _P.get("retorno_rf_real_bond_pool",0.06)
PGBL_KATIA_SALDO_FIRE    = _P.get("pgbl_katia_saldo_fire",    490_000)
GASTO_KATIA_SOLO         = _P.get("gasto_katia_solo",         160_000)

# Premissas MC (exportadas para fire_montecarlo.py importar)
RETORNO_EQUITY_BASE  = _P.get("retorno_equity_base",  0.0485)
RETORNO_IPCA_PLUS    = _P.get("retorno_ipca_plus",    0.0600)
# Retornos por ETF (USD real, premissa base — tabela carteira.md §150-153)
RETORNO_SWRD_USD_REAL = _P.get("retorno_swrd_usd_real", 0.037)
RETORNO_AVGS_USD_REAL = _P.get("retorno_avgs_usd_real", 0.050)
RETORNO_AVEM_USD_REAL = _P.get("retorno_avem_usd_real", 0.050)
VOLATILIDADE_EQUITY  = _P.get("volatilidade_equity",  0.168)
DEP_BRL_BASE         = _P.get("dep_brl_base",         0.005)
DEP_BRL_FAVORAVEL    = _P.get("dep_brl_favoravel",    0.015)
DEP_BRL_STRESS       = _P.get("dep_brl_stress",       0.000)
ADJ_FAVORAVEL        = _P.get("adj_favoravel",        +0.010)
ADJ_STRESS           = _P.get("adj_stress",           -0.005)
IPCA_ANUAL           = _P.get("ipca_anual",           0.04)
INSS_ANUAL           = _P.get("inss_anual",           18_000)
INSS_INICIO_ANO_POS_FIRE = _P.get("inss_inicio_ano_pos_fire", 12)
FIRE_P_THRESHOLD     = _P.get("p_threshold",          85.0)

# Spending Smile (fonte: FR-spending-smile 2026-03-27)
SPENDING_SMILE_GO_GO   = _P.get("spending_smile_go_go",   242_000)
SPENDING_SMILE_SLOW_GO = _P.get("spending_smile_slow_go", 200_000)
SPENDING_SMILE_NO_GO   = _P.get("spending_smile_no_go",   187_000)

# Guardrails (fonte: §Guardrails aprovados 2026-03-20)
GUARDRAILS_BANDA1_MIN = _P.get("guardrails_banda1_min", 0.15)
GUARDRAILS_BANDA2_MIN = _P.get("guardrails_banda2_min", 0.25)
GUARDRAILS_BANDA3_MIN = _P.get("guardrails_banda3_min", 0.35)
GUARDRAILS_CORTE1_PCT = _P.get("guardrails_corte1_pct", 0.10)
GUARDRAILS_CORTE2_PCT = _P.get("guardrails_corte2_pct", 0.20)
GUARDRAILS_PISO_PCT   = _P.get("guardrails_piso_pct",   0.28)
GASTO_PISO            = _P.get("gasto_piso",             180_000)
SAUDE_BASE            = _P.get("saude_base",              24_000)

# Renda Fixa — Tesouro IPCA+ (snapshot — atualizar em carteira.md quando taxa mudar)
IPCA_PLUS_TAXA_ANUAL = _P.get("ipca_plus_taxa_anual", 0.0716)
IPCA_PLUS_CUSTODIA   = _P.get("ipca_plus_custodia",   0.0020)

# Legacy (mantém compatibilidade)
APORTE_MENSAL = APORTE_CENARIO_BASE


# ─── FALLBACKS MACRO (snapshot — atualizar quando taxas mudarem) ─────────────

CAMBIO_FALLBACK      = _P.get("cambio_fallback",      5.07)
IPCA_CAGR_FALLBACK   = _P.get("ipca_cagr_fallback",   6.14)
SELIC_META_SNAPSHOT  = _P.get("selic_meta_snapshot",  14.75)
FED_FUNDS_SNAPSHOT   = _P.get("fed_funds_snapshot",   3.64)
DEPRECIACAO_BRL_BASE = _P.get("depreciacao_brl_base", 0.5)


# ─── GLIDE PATH (tabela de alocação por idade — estrutural) ─────────────────
# Valores espelham "Tabela de Alocacao por Idade" em carteira.md.
# Atualizar carteira.md E aqui quando a tabela mudar.

GLIDE_PATH = {
    "idades":     [39, 40, 50, 60, 70],
    "equity":     [79, 79, 79, 94, 94],
    "ipca_longo": [15, 15, 15,  0,  0],
    "ipca_curto": [ 0,  0,  3,  3,  3],
    "hodl11":     [ 3,  3,  3,  3,  3],
    "renda_plus": [ 3,  3,  0,  0,  0],
}


# ─── TER POR ETF (dado factual dos factsheets) ───────────────────────────────

ETF_TER = {
    "SWRD":    0.12,
    "AVGS":    0.39,
    "AVEM":    0.35,
    "JPGL":    0.19,
    "HODL11":  0.70,
    "RENDA":   0.00,
    "IPCA":    0.00,
}


# ─── TRIBUTAÇÃO (Lei 14.754/2023) ────────────────────────────────────────────

IR_ALIQUOTA = 0.15


# ─── SHADOW PORTFOLIOS ───────────────────────────────────────────────────────

PESOS_SHADOW_C = {
    "VWRA":  EQUITY_PCT,
    "IPCA":  IPCA_LONGO_PCT,
    "BTC":   CRIPTO_PCT,
    "RENDA": RENDA_PLUS_PCT,
}


# ─── ETF COMPOSITION (dado factual dos factsheets — atualizar anual) ─────────

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
        "regiao_primaria": "Global Developed Markets",
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


# ─── MACRO REGRAS (engine de status do plano) ────────────────────────────────

MACRO_REGRAS = {
    "pfire_permanece_min": _P.get("pfire_permanece_min", 0.85),
    "pfire_monitorar_min": _P.get("pfire_monitorar_min", 0.80),
    "drift_permanece_max": _P.get("drift_permanece_max", 5.0),
    "drift_monitorar_max": _P.get("drift_monitorar_max", 10.0),
    "ipca_taxa_monitorar_min": _P.get("ipca_taxa_monitorar_min", 5.5),
    "ipca_taxa_revisar_max":   _P.get("ipca_taxa_revisar_max",   5.5),
    # Labels (constantes de código — não são decisões financeiras)
    "status_permanece": "PLANO_PERMANECE",
    "status_monitorar": "MONITORAR",
    "status_revisar":   "REVISAR",
}


# ─── REGIME 7 — Série Longa 1989-2026 (metodologia do backtest) ──────────────

REGIME7_CONFIG = {
    "label": "Regime 7 — Série Longa 1989-2026 (proxies acadêmicos)",

    "start_full": "1994-12-01",
    "start_extended": "1989-07-01",
    "benchmark_dm_start": "1972-01-01",

    "proxy_period_end": "2019-08-31",
    "etf_real_period_start": "2019-09-01",

    "proxies": {
        "SWRD": [
            {
                "ticker": "^990100-USD-STRD",
                "start": "1972-01-01",
                "end": None,
                "label": "MSCI World NR USD (yfinance)",
                "tier": "B",
            },
        ],
        "AVGS": [
            {
                "ticker": "DFSVX",
                "weight": 0.58,
                "start": "1993-02-01",
                "end": None,
                "label": "DFA US SC Value",
                "tier": "B",
            },
            {
                "ticker": "DISVX",
                "weight": 0.42,
                "start": "1994-12-01",
                "end": None,
                "label": "DFA Intl SC Value",
                "tier": "B",
            },
        ],
        "AVEM": [
            {
                "source": "french_em",
                "start": "1989-07-01",
                "end": "1994-03-31",
                "label": "French EM Mkt-RF + RF (Emerging_5_Factors)",
                "tier": "C",
                "corr_dfemx": 0.9657,
            },
            {
                "ticker": "DFEMX",
                "start": "1994-04-01",
                "end": None,
                "label": "DFA EM Core",
                "tier": "B",
            },
        ],
        "VWRA_benchmark": [
            {
                "source": "french_em+world",
                "start": "1989-07-01",
                "end": "2008-02-28",
                "label": "MSCI World NR + French EM Mkt ponderados 90/10->88/12",
                "nota": "benchmark DM+EM sintetico pre-ACWI ETF",
            },
            {
                "ticker": "ACWI",
                "start": "2008-03-01",
                "end": None,
                "label": "iShares MSCI ACWI ETF",
                "tier": "A",
            },
        ],
    },

    "benchmark_dm_weight_start": 0.90,
    "benchmark_dm_weight_end": 0.88,
    "benchmark_em_weight_start": 0.10,
    "benchmark_em_weight_end": 0.12,

    "french_em_corr_dfemx": 0.9657,

    "french_datasets": {
        "us_5f": "F-F_Research_Data_5_Factors_2x3",
        "em_5f": "Emerging_5_Factors",
        "global_ex_us": "Global_ex_US_3_Factors",
        "rf": "F-F_Research_Data_Factors",
    },

    "rebalance_freq_padrao": "A",
    "rebalance_freq_sensitivity": "ME",

    "win_rate_windows": [120, 240],

    "factor_drought_window": 36,

    "decadas": [
        {"label": "1994-1999", "start": "1994-12-01", "end": "1999-12-31"},
        {"label": "2000-2009", "start": "2000-01-01", "end": "2009-12-31"},
        {"label": "2010-2019", "start": "2010-01-01", "end": "2019-12-31"},
        {"label": "2020-2026", "start": "2020-01-01", "end": None},
    ],
}


# ─── DASHBOARD STATE (I/O compartilhado entre scripts) ───────────────────────

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
    """Atualiza uma seção do dashboard_state.json sem sobrescrever as outras."""
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
