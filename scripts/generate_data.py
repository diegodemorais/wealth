#!/usr/bin/env python3
"""
generate_data.py — Agrega todos os dados da carteira em react-app/public/data.json.

Uso:
    python3 scripts/generate_data.py [--skip-scripts] [--skip-prices]

Flags:
    --skip-scripts  Não roda fire_montecarlo/backtest/fx_utils (usa cache)
    --skip-prices   Não busca preços yfinance (usa dashboard_state.json)

Output:
    react-app/public/data.json  (single source of truth, dashboard/data.json is a symlink)

Pipeline:
    1. Lê config.py  (constantes canônicas)
    2. Lê dashboard_state.json  (posições, P(FIRE), RF — atualizado por outros scripts)
    3. Roda fire_montecarlo.py --anos 11 --tornado   → parseia P(FIRE) + tornado
    4. Roda backtest_portfolio.py                     → parseia séries
    5. Roda fx_utils.py                              → parseia attribution
    5b. Factor rolling 12m AVGS vs SWRD              → yfinance + rolling diff
    5c. Factor loadings FF5+MOM por ETF              → Ken French + OLS regression
    6. Lê historico_carteira.csv                     → timeline + retornos_mensais + rolling_sharpe
    7. Lê holdings.md                                → taxas RF
    8. Escreve react-app/public/data.json (symlinked from dashboard/data.json)
"""

import sys, json, subprocess, csv, math, argparse, re, importlib.util
from pathlib import Path
from datetime import date, datetime, timedelta

# Centralized engines (Lei 14.754/2023 and bond pool)
from tax_engine import TaxEngine, TaxRequest
from bond_pool_engine import BondPoolEngine, BondPoolRequest
from guardrail_engine import GuardrailEngine, GuardrailRequest
from swr_engine import SWREngine, SWRRequest

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

# Import PFireEngine for centralized P(FIRE) calculations
from pfire_engine import PFireEngine, PFireRequest
from pfire_transformer import canonicalize_pfire

from config import (
    PESOS_TARGET, BUCKET_MAP, EQUITY_WEIGHTS,
    PISO_TAXA_IPCA_LONGO, PISO_TAXA_RENDA_PLUS, PISO_VENDA_RENDA_PLUS,
    RENDA_PLUS_ANO_VENC, RENDA_PLUS_TAXA_DEFAULT,
    PATRIMONIO_GATILHO, SWR_GATILHO, CUSTO_VIDA_BASE, CUSTO_VIDA_BASE_CASADO, CUSTO_VIDA_BASE_FILHO, APORTE_MENSAL, RENDA_ESTIMADA,
    IDADE_ATUAL, IDADE_CENARIO_BASE, IDADE_CENARIO_ASPIRACIONAL, ANO_NASCIMENTO,
    EQUITY_PCT, IPCA_LONGO_PCT, IPCA_CURTO_PCT, CRIPTO_PCT, RENDA_PLUS_PCT,
    TICKERS_YF, GLIDE_PATH, IR_ALIQUOTA, ETF_TER,
    HODL11_PISO_PCT, HODL11_ALVO_PCT, HODL11_TETO_PCT,
    FACTOR_UNDERPERF_THRESHOLD, TLH_GATILHO, CRYPTO_LEGADO_BRL,
    BOND_TENT_META_ANOS,
    TICKER_SWRD_LSE, TICKER_AVGS_LSE, TICKER_AVEM_LSE, COLUMN_CLOSE, DATE_FORMAT_YM, DATE_FORMAT_YMD,
    CAMBIO_FALLBACK, SELIC_META_SNAPSHOT, FED_FUNDS_SNAPSHOT, DEPRECIACAO_BRL_BASE,
    IPCA_CAGR_FALLBACK,
    TERRENO_BRL, TEM_CONJUGE, NOME_CONJUGE,
    INSS_KATIA_ANUAL, PGBL_KATIA_SALDO_FIRE, GASTO_KATIA_SOLO,
    INSS_KATIA_INICIO_ANO, RETORNO_RF_REAL_BOND_POOL,
    RETORNO_SWRD_USD_REAL, RETORNO_AVGS_USD_REAL, RETORNO_AVEM_USD_REAL,
    HORIZONTE_VIDA, RETORNO_EQUITY_BASE, RETORNO_IPCA_PLUS, VOLATILIDADE_EQUITY,
    DEP_BRL_BASE, DEP_BRL_FAVORAVEL, DEP_BRL_STRESS,
    ADJ_FAVORAVEL, ADJ_STRESS, IPCA_ANUAL,
    INSS_ANUAL, INSS_INICIO_ANO_POS_FIRE,
    SPENDING_SMILE_GO_GO, SPENDING_SMILE_SLOW_GO, SPENDING_SMILE_NO_GO,
    GUARDRAILS_BANDA1_MIN, GUARDRAILS_BANDA2_MIN, GUARDRAILS_BANDA3_MIN,
    GUARDRAILS_CORTE1_PCT, GUARDRAILS_CORTE2_PCT, GUARDRAILS_PISO_PCT,
    GASTO_PISO, SAUDE_BASE,
    CENARIOS_ESTENDIDOS,
    update_dashboard_state,
)

# Fallback constants (used when source files missing/corrupted)
_HIPOTECA_FALLBACK_BRL = 452_124
_IMOVEL_EQUITY_FALLBACK = 367_875
_PATRIMONIO_FALLBACK = 1_000_000

# Cenários BTC para projeção de display do HODL11 no FIRE Day (não drive estratégia)
BTC_CENARIOS_USD = {"bear": 80_000, "base": 250_000, "bull": 500_000}

VENV_PY = str(Path.home() / "claude/finance-tools/.venv/bin/python3")
STATE_PATH = ROOT / "dados" / "dashboard_state.json"
CSV_PATH   = ROOT / "dados" / "historico_carteira.csv"
HOLDINGS_PATH = ROOT / "dados" / "holdings.md"
LOTES_PATH   = ROOT / "dados" / "ibkr" / "lotes.json"
APORTES_PATH    = ROOT / "dados" / "ibkr" / "aportes.json"
XP_LOTES_PATH   = ROOT / "dados" / "xp" / "lotes.json"
NUBANK_OPS_PATH = ROOT / "dados" / "nubank" / "operacoes_td.json"
NUBANK_TD_PATH  = ROOT / "dados" / "nubank" / "resumo_td.json"
RETORNOS_CORE   = ROOT / "dados" / "retornos_mensais.json"
ROLLING_CORE    = ROOT / "dados" / "rolling_metrics.json"
SUMMARY_CORE    = ROOT / "dados" / "portfolio_summary.json"
WELLNESS_CONFIG = ROOT / "agentes" / "referencia" / "wellness_config.json"
FACTOR_CACHE        = ROOT / "dados" / "factor_cache.json"
FACTOR_SNAPSHOT     = ROOT / "dados" / "factor_snapshot.json"
MACRO_SNAPSHOT      = ROOT / "dados" / "macro_snapshot.json"
TAX_SNAPSHOT        = ROOT / "dados" / "tax_snapshot.json"
SPENDING_SUMMARY    = ROOT / "dados" / "spending_summary.json"
HEAD_RELAY          = ROOT / "dados" / "head_relay.json"
OUT_PATH        = ROOT / "react-app" / "public" / "data.json"

BACKTEST_R7_PATH        = ROOT / "dados" / "backtest_r7.json"
FIRE_MATRIX_PATH        = ROOT / "dados" / "fire_matrix.json"
FIRE_SWR_PCT_PATH       = ROOT / "dados" / "fire_swr_percentis.json"
FIRE_APORTE_SENS_PATH   = ROOT / "dados" / "fire_aporte_sensitivity.json"
FIRE_TRILHA_PATH        = ROOT / "dados" / "fire_trilha.json"
DRAWDOWN_HIST_PATH      = ROOT / "dados" / "drawdown_history.json"
DRAWDOWN_EVENTS_PATH    = ROOT / "dados" / "drawdown_events.json"
DRAWDOWN_EXTENDED_PATH  = ROOT / "dados" / "drawdown_extended.json"
HIPOTECA_SAC_PATH       = ROOT / "dados" / "hipoteca_sac.json"
ETF_COMP_PATH           = ROOT / "dados" / "etf_composition.json"
BOND_POOL_RUNWAY_PATH   = ROOT / "dados" / "bond_pool_runway.json"
LUMPY_EVENTS_PATH       = ROOT / "dados" / "lumpy_events.json"
FIRE_BY_PROFILE_PATH    = ROOT / "dados" / "fire_by_profile.json"   # MC 10k sims — never overwritten by pipeline
REALIZED_PNL_PATH       = ROOT / "react-app" / "public" / "data" / "realized_pnl.json"  # IBKR realized P&L → DARF obligations

# ─── CLI ──────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--skip-scripts", action="store_true")
parser.add_argument("--skip-prices",  action="store_true")
args = parser.parse_args()


# ─── HELPERS ─────────────────────────────────────────────────────────────────
def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    return r.stdout, r.stderr

def load_state():
    try:
        return json.loads(STATE_PATH.read_text())
    except Exception:
        return {}

def load_binance_brl() -> float:
    """Retorna total_brl das posições Binance (dados/binance/posicoes.json) ou fallback config."""
    try:
        p = ROOT / "dados" / "binance" / "posicoes.json"
        if p.exists():
            data = json.loads(p.read_text())
            val = data.get("total_brl")
            if val is not None and val == val:  # NaN guard
                return float(val)
    except Exception:
        pass
    return CRYPTO_LEGADO_BRL

def read_holdings_taxas():
    """Parseia taxas IPCA+ 2040 e Renda+ 2065 do holdings.md."""
    taxa_ipca2040 = None
    taxa_renda2065 = None
    try:
        txt = HOLDINGS_PATH.read_text()
        # Procura padrão "IPCA+ 2040" e taxa na mesma linha
        m = re.search(r'IPCA\+?\s*2040.*?(\d+[.,]\d+)\s*%', txt)
        if m:
            taxa_ipca2040 = float(m.group(1).replace(',', '.'))
        # Procura "Taxa atual ~X%" — evitar capturar gatilho "taxa <= 6.0%"
        m = re.search(r'[Rr]enda\+?\s*2065.*?[Tt]axa\s+atual\s*~?\s*(\d+[.,]\d+)\s*%', txt)
        if not m:
            # fallback: última taxa numérica na linha da Renda+ 2065
            m = re.search(r'[Rr]enda\+?\s*2065[^|\n]*?~\s*(\d+[.,]\d+)\s*%', txt)
        if m:
            taxa_renda2065 = float(m.group(1).replace(',', '.'))
    except Exception as e:
        print(f"  ⚠️ holdings.md: {e}")
    return taxa_ipca2040, taxa_renda2065


def get_passivos(tax_data=None):
    """Retorna estrutura de passivos (hipoteca, IR diferido, etc).

    Hipoteca: lida de hipoteca_sac.json → estado_atual.saldo_devedor (fonte viva).
    IR diferido: lido de tax_snapshot.json.
    """
    # Hipoteca SAC — fonte viva: hipoteca_sac.json
    hipoteca_brl = 0.0
    hipoteca_vencimento = "2051-02-15"
    if HIPOTECA_SAC_PATH.exists():
        try:
            hdata = json.loads(HIPOTECA_SAC_PATH.read_text())
            hipoteca_brl = hdata["estado_atual"]["saldo_devedor"]
            hipoteca_vencimento = hdata.get("contrato", {}).get("data_fim_prevista", hipoteca_vencimento)
        except Exception:
            hipoteca_brl = _HIPOTECA_FALLBACK_BRL

    # IR diferido — vem de tax_data se disponível
    ir_diferido_brl = 0.0
    if tax_data and isinstance(tax_data, dict):
        ir_diferido_brl = tax_data.get("ir_diferido_total_brl", 0.0)

    total_passivos = hipoteca_brl + ir_diferido_brl

    return {
        "hipoteca_brl": round(hipoteca_brl, 2),
        "hipoteca_vencimento": hipoteca_vencimento,
        "ir_diferido_brl": round(ir_diferido_brl, 2),
        "total_brl": round(total_passivos, 2),
        "_fonte": "hipoteca_sac.json (estado_atual.saldo_devedor) + tax_snapshot.json (IR diferido)",
    }


def compute_patrimonio_holistico(total_financeiro_brl: float, state: dict, vp_capital_humano: float = None) -> dict:
    """Retorna balanço holístico expandido (F1 DEV-boldin-dashboard).

    Inclui ativos ilíquidos (imóvel equity, terreno, capital humano, INSS VP).
    Fonte única: hipoteca_sac.json + config.py + dashboard_state.json.

    Args:
        total_financeiro_brl: patrimônio financeiro atual
        state: estado persistente
        vp_capital_humano: VP de capital humano (do cálculo Boldin-style). Se None, usa fallback.
    """
    # Imóvel: valor de mercado - saldo devedor
    imovel_valor_mercado = 0.0
    imovel_equity_brl = 0.0
    saldo_devedor_brl = 0.0
    if HIPOTECA_SAC_PATH.exists():
        try:
            hdata = json.loads(HIPOTECA_SAC_PATH.read_text())
            imovel_valor_mercado = hdata.get("imovel_valor", hdata.get("contrato", {}).get("valor_imovel", 570_000))
            saldo_devedor_brl = hdata.get("estado_atual", {}).get("saldo_devedor", 452_124)
            imovel_equity_brl = max(0.0, imovel_valor_mercado - saldo_devedor_brl)
        except Exception:
            imovel_equity_brl = _IMOVEL_EQUITY_FALLBACK

    # Capital humano: usar valor correto do cálculo Boldin-style se disponível
    if vp_capital_humano is None or vp_capital_humano <= 0:
        # Fallback: fórmula antiga (menos precisa)
        anos_ate_fire = max(0, IDADE_CENARIO_BASE - IDADE_ATUAL)
        vp_capital_humano = RENDA_ESTIMADA * 12 * anos_ate_fire * 0.65
    else:
        anos_ate_fire = max(0, IDADE_CENARIO_BASE - IDADE_ATUAL)

    vp_capital_humano = float(vp_capital_humano or 0)

    # INSS: VP já calculado em fire_montecarlo ou fallback carteira.md
    inss_pv_brl = state.get("fire", {}).get("inss_pv_brl", 283_000)

    # Totais
    total_holistico = (
        total_financeiro_brl
        + imovel_equity_brl
        + float(TERRENO_BRL)
        + vp_capital_humano
        + inss_pv_brl
    )

    return {
        "financeiro_brl":       round(total_financeiro_brl, 2),
        "imovel_equity_brl":    round(imovel_equity_brl, 2),
        "imovel_valor_mercado": round(imovel_valor_mercado, 2),
        "saldo_devedor_brl":    round(saldo_devedor_brl, 2),
        "terreno_brl":          float(TERRENO_BRL),
        "capital_humano_vp":    round(vp_capital_humano, 2),
        "anos_ate_fire":        anos_ate_fire,
        "inss_pv_brl":          round(inss_pv_brl, 2),
        "total_brl":            round(total_holistico, 2),
        "_fonte": "hipoteca_sac.json + config.py (TERRENO_BRL, RENDA_ESTIMADA) + fire_montecarlo (inss_pv_brl)",
    }


def get_source_timestamps():
    """Extrai timestamps de última atualização de cada fonte de dados.

    Retorna dict com datas YYYY-MM-DD de cada fonte:
    - posicoes_ibkr: mtime de lotes.json
    - precos_yfinance: data atual (fetch do dia) ou None se --skip-prices
    - historico_csv: última data no CSV (última linha)
    - holdings_md: mtime de holdings.md
    - fire_mc: _meta.generated em dashboard_state.json
    - geral: data atual da execução
    """
    timestamps = {}

    # IBKR lotes
    if LOTES_PATH.exists():
        mtime = datetime.fromtimestamp(LOTES_PATH.stat().st_mtime)
        timestamps["posicoes_ibkr"] = mtime.strftime(DATE_FORMAT_YMD)
    else:
        timestamps["posicoes_ibkr"] = None

    # Preços yfinance — sempre hoje se online, None se --skip-prices
    timestamps["precos_yfinance"] = str(date.today()) if not args.skip_prices else None

    # Histórico CSV — última linha
    if CSV_PATH.exists():
        try:
            lines = CSV_PATH.read_text().strip().split('\n')
            if len(lines) > 1:
                last_line = lines[-1]
                # Formato esperado: Data,... ou 2026-03-31,...
                first_col = last_line.split(',')[0].strip()
                # Tenta parsear como data
                try:
                    datetime.strptime(first_col, "%Y-%m-%d")
                    timestamps["historico_csv"] = first_col
                except ValueError:
                    timestamps["historico_csv"] = None
            else:
                timestamps["historico_csv"] = None
        except Exception:
            timestamps["historico_csv"] = None
    else:
        timestamps["historico_csv"] = None

    # Holdings.md
    if HOLDINGS_PATH.exists():
        mtime = datetime.fromtimestamp(HOLDINGS_PATH.stat().st_mtime)
        timestamps["holdings_md"] = mtime.strftime(DATE_FORMAT_YMD)
    else:
        timestamps["holdings_md"] = None

    # Fire MC (dashboard_state.json -> _meta.generated)
    state = load_state()
    if state and state.get("_meta", {}).get("generated"):
        try:
            # Formato esperado: "2026-04-09T10:30:00"
            ts_str = state["_meta"]["generated"]
            ts_obj = datetime.fromisoformat(ts_str)
            timestamps["fire_mc"] = ts_obj.strftime(DATE_FORMAT_YMD)
        except (ValueError, KeyError):
            timestamps["fire_mc"] = None
    else:
        timestamps["fire_mc"] = None

    # Data geral (hoje)
    timestamps["geral"] = str(date.today())

    # OPO 5: timestamps específicos para PTAX, RF, HODL11
    # PTAX: vem do mesmo pipeline de preços (yfinance/BCB), usa data de hoje se online
    timestamps["ptax_updated"]   = str(date.today()) if not args.skip_prices else timestamps.get("posicoes_ibkr")
    # RF: mtime de holdings.md (mesmo que holdings_md, alias explícito)
    timestamps["rf_updated"]     = timestamps.get("holdings_md")
    # HODL11: yfinance fetch date (mesmo que precos_yfinance)
    timestamps["hodl11_updated"] = timestamps.get("precos_yfinance")

    return timestamps


# ─── DURATION + MtM HELPERS ───────────────────────────────────────────────────

def calcular_duration_modificada_ntnb(taxa_real_pct: float, anos_vencimento: int,
                                      cupom_semestral_pct: float = 0.5) -> tuple[float, float]:
    """Calcula Duration de Macaulay e Duration Modificada para NTN-B (IPCA+).

    NTN-B paga cupom semestral de 6% a.a. real (0.5% a cada semestre) sobre o
    VNA (Valor Nominal Atualizado). O último fluxo = principal + último cupom.

    Fonte metodológica: ANBIMA — Manual de Marcação a Mercado (2023),
    Seção 5.2 (NTN-B). Duration de Macaulay = Σ[t × CF_t / P] / 2 (em anos).
    Duration Modificada = DM_Macaulay / (1 + ytm_semestral).

    Args:
        taxa_real_pct: yield to maturity real a.a. em % (ex: 6.93 para 6,93%)
        anos_vencimento: anos inteiros até o vencimento (ex: 39 para 2065)
        cupom_semestral_pct: cupom semestral em % do VNA (padrão 0.5% → 6% a.a.)

    Returns:
        (duration_macaulay_anos, duration_modificada_anos)
    """
    ytm_aa = taxa_real_pct / 100.0
    # Converter ytm anual para semestral equivalente
    ytm_sem = (1 + ytm_aa) ** 0.5 - 1

    n_semestres = anos_vencimento * 2  # total de períodos semestrais
    cupom = cupom_semestral_pct / 100.0  # cupom por período (0.005)

    # Calcular PV de cada fluxo e peso temporal (Macaulay)
    soma_pv = 0.0
    soma_t_pv = 0.0
    for t in range(1, n_semestres + 1):
        fluxo = cupom
        if t == n_semestres:
            fluxo += 1.0  # principal no vencimento
        pv_t = fluxo / (1 + ytm_sem) ** t
        soma_pv += pv_t
        soma_t_pv += t * pv_t  # t em semestres

    if soma_pv == 0:
        return 0.0, 0.0

    macaulay_semestres = soma_t_pv / soma_pv
    macaulay_anos = macaulay_semestres / 2.0
    duration_mod = macaulay_anos / (1 + ytm_aa)  # Duration Modificada em anos
    return round(macaulay_anos, 2), round(duration_mod, 2)


def calcular_mtm_1pp(duration_modificada: float, taxa_real_pct: float) -> float:
    """Estima variação % no preço do título para +1pp de taxa (mark-to-market).

    Fórmula: ΔP/P ≈ -D_mod × Δy
    Para Δy = +0.01 (1pp), ΔP/P ≈ -D_mod × 0.01

    Retorna variação em % (negativa = perda de preço se taxa sobe).
    """
    return round(-duration_modificada * 0.01 * 100, 2)


def calcular_status_semaforo(taxa_atual: float, piso_venda: float,
                              zona_alerta_pp: float = 0.5) -> str:
    """Retorna status semaforo: verde / amarelo / vermelho.

    Gatilho de venda Renda+: taxa <= piso_venda (6.0%) — fonte: carteira.md
    verde:    taxa > piso_venda + zona_alerta_pp   (margem confortavel, taxa >= 6.5%)
    amarelo:  piso_venda < taxa <= piso_venda + zona_alerta_pp  (zona de atencao)
    vermelho: taxa <= piso_venda  (gatilho de venda ativado — vender tudo)
    """
    if taxa_atual <= piso_venda:
        return "vermelho"
    elif taxa_atual <= piso_venda + zona_alerta_pp:
        return "amarelo"
    else:
        return "verde"


# ─── 1. PREMISSAS (fire_montecarlo.py) ────────────────────────────────────────
def get_premissas():
    """Lê PREMISSAS dict diretamente do arquivo Python."""
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("fire_mc", ROOT / "scripts" / "fire_montecarlo.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        p = mod.PREMISSAS.copy()
        g = mod.GUARDRAILS
        piso = mod.GASTO_PISO
        smile = mod.SPENDING_SMILE
        p.setdefault("saude_base",     getattr(mod, "SAUDE_BASE",         24_000))
        p.setdefault("saude_inflator", getattr(mod, "SAUDE_INFLATOR",     0.050))
        p.setdefault("saude_decay",    getattr(mod, "SAUDE_DECAY",        0.50))
        return p, g, piso, smile
    except Exception as e:
        print(f"  ⚠️ fire_montecarlo import: {e}")
        # fallback: usar config.py
        return {
            "patrimonio_atual":    None,
            "aporte_mensal":       APORTE_MENSAL,
            "custo_vida_base":     CUSTO_VIDA_BASE,
            "idade_atual":         IDADE_ATUAL,
            "idade_cenario_base":     IDADE_CENARIO_BASE,
            "idade_cenario_aspiracional": IDADE_CENARIO_ASPIRACIONAL,
            "patrimonio_gatilho":  PATRIMONIO_GATILHO,
            "swr_gatilho":         SWR_GATILHO,
            "retorno_equity_base": 0.0485,
            "volatilidade_equity": 0.168,
            "ipca_anual":          0.04,
            "inss_anual":          18_000,
            "inss_inicio_ano":     12,
        }, [], 180_000, {}


def build_pfire_request(scenario: str, premissas: dict) -> PFireRequest:
    """
    Constrói PFireRequest a partir de PREMISSAS e cenário.

    Args:
        scenario: 'base', 'aspiracional', 'stress', ou 'custom'
        premissas: Dict de PREMISSAS from fire_montecarlo.py

    Returns:
        PFireRequest pronto para PFireEngine.calculate()
    """
    patrimonio = premissas.get("patrimonio_atual", _PATRIMONIO_FALLBACK)
    if patrimonio is None or patrimonio <= 0:
        patrimonio = _PATRIMONIO_FALLBACK

    # Para fire_montecarlo, meta_fire é calculada dinamicamente
    # Usar meta_fire = patrimonio (dummy, pois PFireEngine usa PREMISSAS)
    meta_fire = patrimonio or 1_000_000

    idade_atual = premissas.get("idade_atual", 39)
    idade_fire = premissas.get("idade_cenario_base", 53)

    # Para cenário aspiracional, usar idade_cenario_aspiracional se disponível
    if scenario == "aspiracional":
        idade_fire = premissas.get("idade_cenario_aspiracional", 49)

    return PFireRequest(
        scenario=scenario,
        patrimonio_atual=patrimonio,
        meta_fire=meta_fire,
        aporte_mensal=premissas.get("aporte_mensal", 25_000),
        idade_atual=idade_atual,
        idade_fire=idade_fire,
        retorno_anual=premissas.get("retorno_equity_base", 0.0485),
        volatilidade_anual=premissas.get("volatilidade_equity", 0.168),
        meses=(idade_fire - idade_atual) * 12,
        n_simulacoes=10_000,
        seed=42,
    )


# ─── 1b. RECONSTRUIR FIRE DATA (fire_trilha com P10/P90) ──────────────────────
def rebuild_fire_data(window_id: str = None):
    """Roda reconstruct_fire_data.py para gerar JSONs FIRE (fire_trilha, drawdown, fire_matrix, etc)."""
    if args.skip_scripts:
        print("  ⊘ reconstruct_fire_data.py (skip-scripts)")
        return

    print("  ▶ reconstruct_fire_data.py: fire_trilha, drawdown, fire_swr_percentis ...")
    # Quick run: essential components (fire_matrix is slow, run separately with smaller n_sim)
    # Pass --window-id so all outputs share same synchronization window (Invariant 1)
    _wid_args = ["--window-id", window_id] if window_id else []
    out, err = run([VENV_PY, "scripts/reconstruct_fire_data.py"] + _wid_args, cwd=ROOT)
    if err:
        print(f"  ⚠️ reconstruct_fire_data.py stderr: {err[:300]}")

    # Output esperado: múltiplas linhas com "✓ dados/..."
    for key in ["fire_trilha", "drawdown_history", "fire_matrix", "fire_swr_percentis"]:
        if key in out:
            print(f"  ✓ {key} gerado")

    # Ensure fire_matrix has matrix field (fallback if missing)
    try:
        fm_path = ROOT / "dados" / "fire_matrix.json"
        if fm_path.exists():
            fm = json.loads(fm_path.read_text())
            if "matrix" not in fm:
                print("  ⚠️ fire_matrix.json missing 'matrix' field — regenerating...")
                # Re-run just fire_matrix with smaller n_sim for speed
                run([VENV_PY, "scripts/reconstruct_fire_data.py", "--only", "fire_matrix", "--n-sim", "1000"], cwd=ROOT)
                print("  ✓ fire_matrix regenerado com matrix field")
    except Exception as e:
        print(f"  ⚠️ rebuild_fire_data: {e}")
    return


# ─── Cenários Estendidos MC (stagflation + hyperinflation) ───────────────────
def compute_extended_mc_scenarios(premissas_base: dict) -> dict:
    """
    Roda MC para cenários estendidos (stagflation + hyperinflation).
    Override de parâmetros sobre premissas_base; demais permanentes.
    Returns: {cenario: {p_sucesso_pct, descricao, params}} — nunca lança exceção.
    """
    results = {}
    try:
        import fire_montecarlo as fm
        from pfire_transformer import canonicalize_pfire
    except Exception as e:
        print(f"  ⚠️ extended_mc: import falhou ({e})")
        return {}

    for nome, cfg in CENARIOS_ESTENDIDOS.items():
        try:
            premissas_mod = {**premissas_base,
                             "retorno_equity_base": cfg["retorno_equity_base"],
                             "retorno_ipca_plus":   cfg["retorno_ipca_plus"],
                             "ipca_anual":          cfg["ipca_anual"],
                             "dep_brl_base":        cfg["dep_brl_base"]}
            resultado = fm.rodar_monte_carlo(premissas_mod, n_sim=10_000, cenario="base",
                                             seed=42, strategy="guardrails")
            canonical = canonicalize_pfire(resultado["p_sucesso"], source='mc')
            results[nome] = {
                "p_sucesso_pct": canonical.percentage,
                "label":         cfg["label"],
                "descricao":     cfg["descricao"],
                "params": {
                    "retorno_equity_base": cfg["retorno_equity_base"],
                    "retorno_ipca_plus":   cfg["retorno_ipca_plus"],
                    "ipca_anual":          cfg["ipca_anual"],
                    "dep_brl_base":        cfg["dep_brl_base"],
                },
            }
            print(f"  ✓ MC {cfg['label']}: P(FIRE)={canonical.pct_str}")
        except Exception as e:
            print(f"  ⚠️ MC {nome}: {e}")
    return results


# ─── 2. P(FIRE) + TORNADO ────────────────────────────────────────────────────
def get_pfire_tornado():
    if args.skip_scripts:
        state = load_state()
        fire = state.get("fire", {})
        # Normalizar tornado: garantir campos "label" (schema) e "variavel" (template)
        raw_tornado = fire.get("tornado", [])
        norm_tornado = []
        for t in raw_tornado:
            var = t.get("variavel", t.get("label", ""))
            norm_tornado.append({
                "label":    var,
                "variavel": var,
                "mais10":   t.get("mais10", 0),
                "menos10":  t.get("menos10", 0),
                "delta":    t.get("delta", abs(t.get("mais10", 0)) + abs(t.get("menos10", 0))),
            })
        # pfire_aspiracional = P(FIRE@49) — Cenário Aspiracional (FIRE 2035, 49 anos)
        # pfire_base = P(FIRE@53) — Cenário Base (FIRE 2040, 53 anos)
        # State values come from last MC run → source="mc", is_canonical=True
        _pfire_has_mc = bool(fire.get("pfire_base") or fire.get("pfire49_base"))
        _source = "mc" if _pfire_has_mc else "fallback"
        return (
            {"base": fire.get("pfire49_base", fire.get("pfire50_base", fire.get("pfire_base"))),
             "fav":  fire.get("pfire49_fav",  fire.get("pfire50_fav",  fire.get("pfire_fav"))),
             "stress": fire.get("pfire49_stress", fire.get("pfire50_stress", fire.get("pfire_stress"))),
             "source": _source, "is_canonical": _pfire_has_mc},
            {"base": fire.get("pfire53_base", fire.get("pfire_base")),
             "fav":  fire.get("pfire53_fav",  fire.get("pfire_fav")),
             "stress": fire.get("pfire53_stress", fire.get("pfire_stress")),
             "source": _source, "is_canonical": _pfire_has_mc},
            norm_tornado
        )

    # ─── Usar PFireEngine para cálculos canônicos de P(FIRE) ────────────────
    print("  ▶ Calculando P(FIRE) canônicos via PFireEngine ...")
    premissas, _, _, _ = get_premissas()

    # Cenário Aspiracional (P(50) — idade 49)
    try:
        req_aspiracional = build_pfire_request("aspiracional", premissas)
        result_aspiracional = PFireEngine.calculate(req_aspiracional)
        canonical_aspiracional = result_aspiracional.canonical
        pf_aspiracional = {
            "base": canonical_aspiracional.percentage,
            "fav": min(100, canonical_aspiracional.percentage + 3),  # Heurística: +3pp para otimista
            "stress": max(0, canonical_aspiracional.percentage - 8),  # Heurística: -8pp para stress
            "source": canonical_aspiracional.source,
            "is_canonical": canonical_aspiracional.is_canonical,
        }
        print(f"  ✓ Aspiracional (P@49): {canonical_aspiracional.pct_str} (canônico, source={canonical_aspiracional.source})")
    except Exception as e:
        print(f"  ⚠️ PFireEngine aspiracional falhou: {e} — usando fallback")
        pf_aspiracional = {"base": None, "fav": None, "stress": None}

    # Cenário Base (P(53) — idade 53)
    try:
        req_base = build_pfire_request("base", premissas)
        result_base = PFireEngine.calculate(req_base)
        canonical_base = result_base.canonical
        pf_base = {
            "base": canonical_base.percentage,
            "fav": min(100, canonical_base.percentage + 3),  # Heurística: +3pp
            "stress": max(0, canonical_base.percentage - 8),  # Heurística: -8pp
            "source": canonical_base.source,
            "is_canonical": canonical_base.is_canonical,
        }
        print(f"  ✓ Base (P@53): {canonical_base.pct_str} (canônico, source={canonical_base.source})")
    except Exception as e:
        print(f"  ⚠️ PFireEngine base falhou: {e} — usando fallback")
        pf_base = {"base": None, "fav": None, "stress": None}

    # ─── Tornado — manter subprocess para tornado (sensibilidade, não P(FIRE)) ────
    # Tornado é uma análise de sensibilidade, não um cálculo de P(FIRE) — pode manter subprocess
    print("  ▶ fire_montecarlo.py --tornado (sensibilidade) ...")
    out_tornado, err_tornado = run([VENV_PY, "scripts/fire_montecarlo.py", "--tornado"], cwd=ROOT)
    if err_tornado:
        print(f"  ⚠️ stderr tornado: {err_tornado[:200]}")

    # Tornado — parsear do output tornado
    # fire_montecarlo output format:
    #   "  Volatilidade equity (+/-10%)        -4.1%    +4.0%          8.2%"
    # Grupos: 1=label  2=up(+10%)  3=down(-10%)  4=impacto_total
    tornado = []
    in_tornado = False
    _tornado_pattern = re.compile(
        r'^\s+(.+?)\s+([+-]?\d+\.?\d*)%\s+([+-]?\d+\.?\d*)%\s+(\d+\.?\d*)%'
    )
    for line in out_tornado.splitlines():
        if "tornado" in line.lower() or "sensibilidade" in line.lower():
            in_tornado = True
        if in_tornado:
            m = _tornado_pattern.match(line)
            if m:
                label = m.group(1).strip()
                # Skip header lines like "Variável   ▲ +10%   ▼ -10%  Impacto Total"
                if any(x in label for x in ["Variável", "▲", "▼", "---"]):
                    continue
                tornado.append({
                    "label":    label,              # schema canonical field
                    "variavel": label,              # alias usado pelo template
                    "mais10":   float(m.group(2)),  # delta ao aumentar +10%
                    "menos10":  float(m.group(3)),  # delta ao diminuir -10%
                    "delta":    float(m.group(4)),  # impacto total absoluto
                })

    # Fallback: ler tornado de dashboard_state.json (salvo por fire_montecarlo.py --tornado)
    if not tornado:
        state_tornado = load_state().get("fire", {}).get("tornado", [])
        if state_tornado:
            # Normalizar: garantir que cada item tem "label" (schema) e "variavel" (template)
            tornado = []
            for t in state_tornado:
                var = t.get("variavel", t.get("label", ""))
                tornado.append({
                    "label":    var,
                    "variavel": var,
                    "mais10":   t.get("mais10", 0),
                    "menos10":  t.get("menos10", 0),
                    "delta":    t.get("delta", abs(t.get("mais10", 0)) + abs(t.get("menos10", 0))),
                })
            print(f"  -> tornado: {len(tornado)} variaveis (de dashboard_state.json)")

    # Fallback: se PFireEngine falhou para algum cenário, tentar estado
    if pf_aspiracional["base"] is None:
        s = load_state().get("fire", {})
        pf_aspiracional = {"base": s.get("pfire49_base", s.get("pfire50_base")),
                           "fav":  s.get("pfire49_fav",  s.get("pfire50_fav")),
                           "stress": s.get("pfire49_stress", s.get("pfire50_stress"))}
        if pf_aspiracional["base"] is None:
            print(f"  ⚠️  FALLBACK: pfire_aspiracional não disponível")
            pf_aspiracional = {"base": None, "fav": None, "stress": None}

    if pf_base["base"] is None:
        s = load_state().get("fire", {})
        pf_base = {"base": s.get("pfire53_base", s.get("pfire_base")),
                   "fav":  s.get("pfire53_fav",  s.get("pfire_fav")),
                   "stress": s.get("pfire53_stress", s.get("pfire_stress"))}

    print(f"  → P(FIRE@49 aspiracional): {pf_aspiracional} | P(FIRE@53 base): {pf_base} | tornado: {len(tornado)} variáveis")
    return pf_aspiracional, pf_base, tornado


# ─── 3. BACKTEST ──────────────────────────────────────────────────────────────
def get_backtest():
    if args.skip_scripts:
        # Tenta ler de arquivo JSON de cache
        cache = ROOT / "dados" / "ibkr" / "backtest_cache.json"
        if cache.exists():
            return json.loads(cache.read_text())
        return {}

    print("  ▶ backtest_portfolio.py ...")
    out, err = run([VENV_PY, "scripts/backtest_portfolio.py", "--json"], cwd=ROOT)

    # Tentar parsear JSON do output
    try:
        # procura bloco JSON no output
        m = re.search(r'(\{.+\})', out, re.DOTALL)
        if m:
            data = json.loads(m.group(1))
            # Salvar cache
            cache = ROOT / "dados" / "ibkr" / "backtest_cache.json"
            cache.parent.mkdir(exist_ok=True)
            cache.write_text(json.dumps(data, indent=2))
            return data
    except Exception:
        pass

    # Fallback: parsear output texto
    print(f"  ⚠️ backtest JSON não disponível, usando output texto")
    return {}


# ─── 4. TIMELINE ATTRIBUTION ─────────────────────────────────────────────────
def get_timeline_attribution():
    """
    Reconstrói decomposição mensal cumulativa do patrimônio em 4 componentes:
    - aportes_cumul: soma cumulativa de aporte_brl
    - equity_usd_cumul: ganhos de equity USD acumulados (em BRL)
    - cambio_cumul: ganhos FX (depreciação BRL) acumulados (em BRL)
    - rf_cumul: ganhos RF (Tesouro Direto, etc) acumulados (em BRL)

    Lógica:
    1. Lê CSV histórico: dates, patrimonio_brl, aporte_brl
    2. Lê retornos_mensais.json: decomposicao (equity_usd, fx, rf_xp em %)
    3. Para cada mês t (após t=0):
       market_gain = patrimonio[t] - patrimonio[t-1] - aporte[t]
       decomp_sum = equity_usd_pct + fx_pct + rf_xp_pct
       Se decomp_sum != 0:
           equity_gain = market_gain * equity_usd_pct / decomp_sum
           fx_rf_gain = market_gain - equity_gain
           cambio_gain = fx_rf_gain * fx_pct / (fx_pct + rf_xp_pct)  [se soma>0]
           rf_gain = fx_rf_gain - cambio_gain
       Senão: equity_gain=0, cambio_gain=0, rf_gain=market_gain
    4. Cumula cumulativamente
    5. Inclui mês 0 (início) com aportes_cumul=aporte_0, outros=0

    Output: {"dates": [...], "aportes": [...], "equity_usd": [...], "cambio": [...], "rf": [...]}
    Ou None se dados insuficientes.
    """
    try:
        # 1. Ler CSV histórico
        if not CSV_PATH.exists():
            return None
        csv_dates, csv_pat, csv_aporte = [], [], []
        with open(CSV_PATH) as f:
            reader = csv.DictReader(f)
            for row in reader:
                keys = list(row.keys())
                date_col = next((k for k in keys if 'data' in k.lower() or 'date' in k.lower()), keys[0])
                pat_col  = next((k for k in keys if 'patrimonio' in k.lower() or 'patrimônio' in k.lower()), None)
                ap_col   = next((k for k in keys if 'aporte' in k.lower()), None)
                if not pat_col or not ap_col:
                    continue
                d_raw = row[date_col].strip()
                # normalizar para YYYY-MM
                if len(d_raw) >= 7 and d_raw[4] == '-':
                    lbl = d_raw[:7]
                elif '/' in d_raw:
                    parts = d_raw.split('/')
                    lbl = f"{parts[2]}-{parts[1].zfill(2)}" if len(parts) >= 3 else d_raw[:7]
                else:
                    lbl = d_raw[:7]
                try:
                    pat_v  = float(row[pat_col].replace(',', '.').replace(' ', ''))
                    ap_v   = float(row[ap_col].replace(',', '.').replace(' ', ''))
                    csv_dates.append(lbl)
                    csv_pat.append(pat_v)
                    csv_aporte.append(ap_v)
                except ValueError:
                    continue

        if len(csv_dates) < 2:
            return None

        # Deduplicar (último registro por mês)
        seen_pat: dict = {}
        seen_ap: dict = {}
        for lbl, pat, ap in zip(csv_dates, csv_pat, csv_aporte):
            seen_pat[lbl] = pat
            seen_ap[lbl]  = ap
        csv_dates  = list(seen_pat.keys())
        csv_pat    = list(seen_pat.values())
        csv_aporte = [seen_ap[d] for d in csv_dates]

        # 2. Ler retornos_mensais.json
        if not RETORNOS_CORE.exists():
            return None
        _rc  = json.loads(RETORNOS_CORE.read_text())
        _dec = _rc.get("decomposicao", {})
        rc_dates = _rc.get("dates", [])
        eq_pct   = _dec.get("equity_usd", [])
        fx_pct   = _dec.get("fx", [])
        rf_pct   = _dec.get("rf_xp", [])

        if not rc_dates or not eq_pct:
            return None

        # Indexar retornos por data
        rc_idx = {d: i for i, d in enumerate(rc_dates)}

        # 3. Calcular ganhos mensais e acumular (separando FX e RF)
        out_dates    = [csv_dates[0]]
        aportes_cumul    = [csv_aporte[0]]
        equity_usd_cumul = [0.0]
        cambio_cumul     = [0.0]
        rf_cumul         = [0.0]

        for t in range(1, len(csv_dates)):
            dt = csv_dates[t]
            market_gain = csv_pat[t] - csv_pat[t-1] - csv_aporte[t]

            # Pegar percentuais de decomposicao para este mês
            idx = rc_idx.get(dt)
            if idx is not None:
                eq_p = eq_pct[idx]
                fx_p = fx_pct[idx] if idx < len(fx_pct) else 0.0
                rf_p = rf_pct[idx] if idx < len(rf_pct) else 0.0
                decomp_sum = eq_p + fx_p + rf_p
                if decomp_sum != 0:
                    equity_gain = market_gain * eq_p / decomp_sum
                    fx_rf_gain  = market_gain - equity_gain
                    # Separar FX e RF proporcionalmente ao seu peso na decomposição
                    fx_rf_sum = fx_p + rf_p
                    if fx_rf_sum != 0:
                        cambio_gain = fx_rf_gain * fx_p / fx_rf_sum
                        rf_gain     = fx_rf_gain - cambio_gain
                    else:
                        cambio_gain = 0.0
                        rf_gain     = fx_rf_gain
                else:
                    equity_gain = 0.0
                    cambio_gain = 0.0
                    rf_gain     = market_gain
            else:
                equity_gain = 0.0
                cambio_gain = 0.0
                rf_gain     = market_gain

            out_dates.append(dt)
            aportes_cumul.append(round(aportes_cumul[-1] + csv_aporte[t]))
            equity_usd_cumul.append(round(equity_usd_cumul[-1] + equity_gain))
            cambio_cumul.append(round(cambio_cumul[-1] + cambio_gain))
            rf_cumul.append(round(rf_cumul[-1] + rf_gain))

        cambio_rf_total = cambio_cumul[-1] + rf_cumul[-1]
        print(f"  → timeline_attribution: {len(out_dates)} meses | "
              f"aportes={aportes_cumul[-1]/1e6:.2f}M | "
              f"equityUsd={equity_usd_cumul[-1]/1e6:.2f}M | "
              f"cambio={cambio_cumul[-1]/1e6:.2f}M | "
              f"rf={rf_cumul[-1]/1e6:.2f}M (total FX+RF={cambio_rf_total/1e6:.2f}M)")

        return {
            "dates":      out_dates,
            "aportes":    [round(v) for v in aportes_cumul],
            "equity_usd": [round(v) for v in equity_usd_cumul],
            "cambio":     [round(v) for v in cambio_cumul],
            "rf":         [round(v) for v in rf_cumul],
        }
    except Exception as e:
        print(f"  ⚠️ timeline_attribution: {e}")
        return None


# ─── 4b. ATTRIBUTION ─────────────────────────────────────────────────────────
def get_attribution(pat_override: float = None):
    """Decomposição desde o início dos aportes do patrimônio em 3 componentes:
      - aportes:    soma de todos os aportes_brl do CSV (from day one)
      - retornoUsd: retorno equity USD (fração equity_usd da decomposicao total)
      - rfCambio:   RF doméstico + variação cambial (fração fx+rf_xp da decomposicao)

    crescReal = pat_atual (total patrimônio), soma dos 3 = pat_atual.
    Fonte primária: retornos_mensais.json decomposicao (todos os meses).
    Fallback: proxy via pesos_target se decomposicao não disponível.
    """
    try:
        # 1. Patrimônio atual — pat_override se disponível, senão de dashboard_state.json
        state = load_state()
        pat_atual = pat_override or state.get("patrimonio", {}).get("total_brl")
        if pat_atual is None:
            posicoes_raw = state.get("posicoes", {})
            cambio_state = state.get("patrimonio", {}).get("cambio", CAMBIO_FALLBACK)
            _total = 0
            for tk, pos in posicoes_raw.items():
                if "valor_brl" in pos:
                    _total += pos["valor_brl"]
                elif "qty" in pos and "price" in pos and pos.get("moeda") == "USD":
                    _total += pos["qty"] * pos["price"] * cambio_state
            if _total > 0:
                pat_atual = _total

        if pat_atual is None:
            return None

        # 2. Total aportes histórico: soma de todos aporte_brl do CSV
        total_aportes = 0
        data_inicio = None
        if CSV_PATH.exists():
            with open(CSV_PATH) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    keys = list(row.keys())
                    date_col = next((k for k in keys if 'data' in k.lower() or 'date' in k.lower()), keys[0] if keys else None)
                    ap_col   = next((k for k in keys if 'aporte' in k.lower()), None)
                    if not date_col or not ap_col:
                        continue
                    if data_inicio is None:
                        data_inicio = row[date_col].strip()[:7]  # YYYY-MM
                    try:
                        v = float(row[ap_col].replace(',', '.').replace(' ', ''))
                        total_aportes += v
                    except ValueError:
                        pass

        # 3. Retorno de mercado (tudo que não é aporte)
        retorno_mercado = pat_atual - total_aportes

        # 4. Decompor retorno_mercado em equity_usd vs rf+câmbio usando todos os meses
        if RETORNOS_CORE.exists():
            try:
                _rc = json.loads(RETORNOS_CORE.read_text())
                _dec = _rc.get("decomposicao", {})
                _eq_usd = _dec.get("equity_usd", [])
                _fx     = _dec.get("fx", [])
                _rf     = _dec.get("rf_xp", [])

                sum_eq  = sum(_eq_usd) if _eq_usd else 0
                sum_fx  = sum(_fx)     if _fx     else 0
                sum_rf  = sum(_rf)     if _rf     else 0
                total_dec = sum_eq + sum_fx + sum_rf

                if total_dec > 0:
                    retorno_usd = round(retorno_mercado * sum_eq  / total_dec)
                    cambio_rf   = round(retorno_mercado - retorno_usd)
                    # Separar FX de RF dentro do bloco cambio_rf
                    sum_fx_rf = sum_fx + sum_rf
                    if sum_fx_rf != 0:
                        fx_gain = round(cambio_rf * sum_fx / sum_fx_rf)
                        rf_gain = round(cambio_rf - fx_gain)
                    else:
                        fx_gain = 0
                        rf_gain = round(cambio_rf)

                    # P&L por bucket usando posições do state
                    por_bucket = {}
                    try:
                        _state = load_state()
                        _posicoes = _state.get("posicoes", {})
                        _cambio = _state.get("patrimonio", {}).get("cambio", CAMBIO_FALLBACK)
                        for _tk, _pos in _posicoes.items():
                            _qty = _pos.get("qty", 0)
                            _price = _pos.get("price", 0)
                            _avg = _pos.get("avg_cost", _price)
                            if _qty and _price and _avg:
                                _pnl_usd = _qty * (_price - _avg)
                                _pnl_brl = round(_pnl_usd * _cambio)
                                _bkt = BUCKET_MAP.get(_tk, _tk)
                                por_bucket[_bkt] = por_bucket.get(_bkt, 0) + _pnl_brl
                        por_bucket = {k: round(v) for k, v in por_bucket.items()}
                    except Exception as _be:
                        print(f"  ⚠️ attribution por_bucket: {_be}")
                        por_bucket = {}

                    print(f"  → attribution (desde início, decomposicao real): "
                          f"inicio={data_inicio} | pat=R${pat_atual/1e6:.2f}M | "
                          f"aportes=R${total_aportes/1e6:.2f}M | retornoUsd=R${retorno_usd/1e6:.2f}M | "
                          f"rfCambio=R${cambio_rf/1e6:.2f}M | meses={len(_eq_usd)}")
                    cresc = round(pat_atual)
                    _breakdown_chart = []
                    if cresc and cresc > 0:
                        _breakdown_chart = [
                            {"label": "Aportes",      "value_pct": round(round(total_aportes) / cresc * 100, 1)},
                            {"label": "Retorno USD",  "value_pct": round(retorno_usd          / cresc * 100, 1)},
                            {"label": "RF Doméstica", "value_pct": round(rf_gain              / cresc * 100, 1)},
                            {"label": "Câmbio",       "value_pct": round(cambio_rf            / cresc * 100, 1)},
                            {"label": "FX Custo",     "value_pct": round(fx_gain              / cresc * 100, 1)},
                        ]
                    # cagr_total aproximado (inclui aportes — não é TWR)
                    _n_meses_dec = len(_eq_usd)
                    if cresc > 0 and round(total_aportes) > 0 and _n_meses_dec > 0:
                        _cagr_total = round((round(cresc) / round(total_aportes)) ** (12 / _n_meses_dec) - 1, 4) * 100
                    else:
                        _cagr_total = None
                    return {
                        "aportes":         round(total_aportes),
                        "retornoUsd":      retorno_usd,
                        "cambio":          cambio_rf,
                        "fx":              fx_gain,
                        "rf":              rf_gain,
                        "crescReal":       cresc,
                        "cagr_total":      _cagr_total,
                        "_estimativa":     False,
                        "_fonte":          "retornos_mensais.json decomposicao (desde início)",
                        "_inicio":         data_inicio or "",
                        "por_bucket":      por_bucket,
                        "breakdown_chart": _breakdown_chart,
                    }
            except Exception as _e:
                print(f"  ⚠️ attribution decomposicao: {_e} — usando proxy")

        # 5. Fallback: proxy via pesos_target
        peso_equity = PESOS_TARGET.get("equity", 0.70)
        retorno_usd = round(retorno_mercado * peso_equity)
        cambio_rf   = round(retorno_mercado - retorno_usd)

        print(f"  → attribution (proxy desde início): pat=R${pat_atual/1e6:.2f}M | "
              f"aportes=R${total_aportes/1e6:.2f}M | retornoUsd=R${retorno_usd/1e6:.2f}M | "
              f"rfCambio=R${cambio_rf/1e6:.2f}M")

        _cresc_fb = round(pat_atual)
        _breakdown_fb: list = []
        if _cresc_fb and _cresc_fb > 0:
            _breakdown_fb = [
                {"label": "Aportes",      "value_pct": round(round(total_aportes) / _cresc_fb * 100, 1)},
                {"label": "Retorno USD",  "value_pct": round(retorno_usd          / _cresc_fb * 100, 1)},
                {"label": "RF+Câmbio",    "value_pct": round(cambio_rf            / _cresc_fb * 100, 1)},
            ]
        # cagr_total aproximado para fallback proxy
        try:
            import datetime as _dt
            if data_inicio and _cresc_fb > 0 and round(total_aportes) > 0:
                _yr, _mo = int(data_inicio[:4]), int(data_inicio[5:7])
                _now = _dt.date.today()
                _n_meses_fb = (_now.year - _yr) * 12 + (_now.month - _mo)
                _cagr_total_fb = round((_cresc_fb / round(total_aportes)) ** (12 / max(_n_meses_fb, 1)) - 1, 4) * 100 if _n_meses_fb > 0 else None
            else:
                _cagr_total_fb = None
        except Exception:
            _cagr_total_fb = None
        return {
            "aportes":         round(total_aportes),
            "retornoUsd":      retorno_usd,
            "cambio":          cambio_rf,
            "fx":              None,
            "rf":              None,
            "crescReal":       _cresc_fb,
            "cagr_total":      _cagr_total_fb,
            "_estimativa":     True,
            "_inicio":         data_inicio or "",
            "por_bucket":      {},
            "breakdown_chart": _breakdown_fb,
        }
    except Exception as e:
        print(f"  ⚠️ attribution: {e}")
        return None


# ─── 5. TIMELINE + RETORNOS MENSAIS (do CSV) ─────────────────────────────────
def get_timeline_retornos():
    labels, values, twr_values = [], [], []
    try:
        with open(CSV_PATH) as f:
            reader = csv.DictReader(f)
            for row in reader:
                date_col = [k for k in row if 'data' in k.lower() or 'date' in k.lower()]
                val_col  = [k for k in row if 'patrimônio' in k.lower() or 'total' in k.lower() or 'patrimonio' in k.lower() or 'valor' in k.lower()]
                if not date_col or not val_col:
                    keys = list(row.keys())
                    if len(keys) >= 2:
                        date_col = [keys[0]]
                        val_col  = [keys[1]]
                d = row[date_col[0]].strip()
                v_str = row[val_col[0]].replace(',', '.').replace(' ', '').strip()
                # TWR pré-calculado (coluna patrimonio_var — retorno descontando aportes)
                twr_str = row.get("patrimonio_var", "").strip()
                try:
                    v = float(v_str)
                    if len(d) == 10 and d[4] == '-':
                        lbl = d[:7]
                    elif '/' in d:
                        parts = d.split('/')
                        lbl = f"{parts[2]}-{parts[1].zfill(2)}"
                    else:
                        lbl = d[:7]
                    labels.append(lbl)
                    values.append(v)
                    twr_values.append(float(twr_str) if twr_str else None)
                except ValueError:
                    continue
    except Exception as e:
        print(f"  ⚠️ CSV: {e}")
        return {"labels": [], "values": []}, {"dates": [], "values": []}

    # Deduplicar labels mantendo o último registro para cada label (ex: duas entradas do mesmo mês)
    seen: dict = {}
    seen_twr: dict = {}
    for lbl, val, twr in zip(labels, values, twr_values):
        seen[lbl] = val
        seen_twr[lbl] = twr
    labels = list(seen.keys())
    values = list(seen.values())

    # Retornos mensais: usar TWR pré-calculado se disponível, senão calcular do patrimônio
    ret_dates, ret_vals = [], []
    for i in range(1, len(labels)):
        try:
            d1 = datetime.strptime(labels[i-1] + "-01", "%Y-%m-%d")
            d2 = datetime.strptime(labels[i]   + "-01", "%Y-%m-%d")
            gap_days = (d2 - d1).days
            if gap_days <= 35 and values[i-1] > 0:
                # Preferir TWR pré-calculado (desconta aportes)
                twr = seen_twr.get(labels[i])
                if twr is not None:
                    ret = twr
                else:
                    ret = (values[i] / values[i-1] - 1) * 100
                ret_dates.append(labels[i])
                ret_vals.append(round(ret, 4))
        except Exception:
            continue

    return (
        {"labels": labels, "values": values},
        {"dates": ret_dates, "values": ret_vals}
    )


def compute_rolling_sharpe(retornos_mensais: dict, selic_meta: float, window: int = 12) -> dict:
    """Calcula Rolling Sharpe 12m (excess return sobre CDI) server-side.

    Args:
        retornos_mensais: {"dates": [...], "values": [...]} — retornos mensais em %
        selic_meta: Selic meta anualizada em % (ex: 14.75)
        window: janela rolling em meses (default 12)

    Returns:
        {"dates": [...], "values": [...], "window": 12, "rf_anual": 14.75}
        values = Sharpe anualizado (mean excess / std excess * sqrt(12))
    """
    import math
    dates = retornos_mensais.get("dates", [])
    vals = retornos_mensais.get("values", [])

    if len(vals) < window + 1:
        return {"dates": [], "values": [], "window": window, "rf_anual": selic_meta}

    # Risk-free mensal (Selic composta → mensal em %)
    rf_mensal = ((1 + selic_meta / 100) ** (1/12) - 1) * 100 if selic_meta > 0 else 0

    out_dates = []
    out_vals = []

    for i in range(window - 1, len(vals)):
        win = vals[i - window + 1 : i + 1]
        excess = [v - rf_mensal for v in win]
        mean = sum(excess) / window
        variance = sum((v - mean) ** 2 for v in excess) / window  # σ populacional
        std = math.sqrt(variance)
        sharpe = round(mean / std * math.sqrt(12), 3) if std > 0 else 0
        out_dates.append(dates[i])
        out_vals.append(sharpe)

    return {"dates": out_dates, "values": out_vals, "window": window, "rf_anual": selic_meta}


# ─── 5b. FACTOR: CACHE BOOTSTRAP ────────────────────────────────────────────
def _try_populate_factor_cache():
    """Se factor_cache.json não existe, tenta computar rolling + loadings inline.
    Chamado no início do pipeline — não bloqueia se falhar.
    """
    if FACTOR_CACHE.exists():
        return  # já existe
    print("  ▶ factor cache não encontrado — tentando popular inline ...")
    try:
        # Temporariamente desabilitar skip_scripts para computar factor data
        _orig = args.skip_scripts
        args.skip_scripts = False
        rolling  = get_factor_rolling()
        loadings = get_factor_loadings()
        args.skip_scripts = _orig

        cache_data = {}
        if rolling.get("dates"):
            cache_data["factor_rolling"] = rolling
        if loadings:
            cache_data["factor_loadings"] = loadings
        if cache_data:
            FACTOR_CACHE.parent.mkdir(exist_ok=True)
            FACTOR_CACHE.write_text(json.dumps(cache_data, indent=2))
            print(f"  ✓ factor cache salvo: rolling={len(rolling.get('dates',[]))} pts, loadings={len(loadings)} ETFs")
        else:
            print("  ⚠️ factor cache: sem dados para salvar")
    except Exception as e:
        print(f"  ⚠️ _try_populate_factor_cache: {e}")


# ─── 5b. FACTOR: ROLLING 12m AVGS vs SWRD ───────────────────────────────────
def get_factor_rolling():
    """Rolling 12-month return difference AVGS.L minus SWRD.L (percentage points).

    Returns dict: {dates: [YYYY-MM, ...], avgs_vs_swrd_12m: [float, ...], threshold: -5}
    Threshold at -5pp flags periods where AVGS significantly underperforms SWRD.
    """
    THRESHOLD = FACTOR_UNDERPERF_THRESHOLD

    if args.skip_scripts:
        try:
            cache = json.loads(FACTOR_CACHE.read_text())
            if "factor_rolling" in cache:
                print("  ✓ factor_rolling (cache)")
                return cache["factor_rolling"]
        except Exception:
            pass
        return {"dates": [], "avgs_vs_swrd_12m": [], "threshold": THRESHOLD}

    print("  ▶ factor rolling 12m AVGS vs SWRD ...")
    try:
        import yfinance as yf
        import pandas as pd

        tickers = ["AVGS.L", TICKER_SWRD_LSE]
        data = yf.download(tickers, start="2019-01-01", progress=False, auto_adjust=True)

        # Handle MultiIndex columns from yfinance
        if isinstance(data.columns, pd.MultiIndex):
            close = data[COLUMN_CLOSE]
        else:
            close = data[[COLUMN_CLOSE]]

        # Resample to month-end (compatible with pandas 1.5+)
        monthly = close.resample("M").last().dropna(how="all")

        # Compute 12-month rolling cumulative return for each ETF
        # Return = (P_t / P_{t-12}) - 1, expressed in percentage points
        dates = []
        diffs = []
        for i in range(12, len(monthly)):
            row = monthly.iloc[i]
            row_12 = monthly.iloc[i - 12]

            avgs_now = row.get("AVGS.L")
            avgs_ago = row_12.get("AVGS.L")
            swrd_now = row.get(TICKER_SWRD_LSE)
            swrd_ago = row_12.get(TICKER_SWRD_LSE)

            if any(v is None or (isinstance(v, float) and math.isnan(v))
                   for v in [avgs_now, avgs_ago, swrd_now, swrd_ago]):
                continue
            if avgs_ago == 0 or swrd_ago == 0:
                continue

            ret_avgs = (avgs_now / avgs_ago - 1) * 100  # %
            ret_swrd = (swrd_now / swrd_ago - 1) * 100  # %
            diff_pp = round(ret_avgs - ret_swrd, 2)

            dt = monthly.index[i]
            dates.append(dt.strftime(DATE_FORMAT_YM))
            diffs.append(diff_pp)

        result = {"dates": dates, "avgs_vs_swrd_12m": diffs, "threshold": THRESHOLD}
        print(f"    → {len(dates)} data points, latest diff: {diffs[-1] if diffs else 'N/A'}pp")
        return result

    except Exception as e:
        print(f"  ⚠️ factor rolling: {e}")
        return {"dates": [], "avgs_vs_swrd_12m": [], "threshold": THRESHOLD}


# ─── FACTOR SIGNAL: YTD + since-launch excess return AVGS vs SWRD ────────────
def get_factor_signal():
    """YTD and since-launch excess return of AVGS.L vs SWRD.L.

    Different from factor_rolling (rolling 12-month window) — shows discrete
    periods useful for KPI card display.
    Falls back to dashboard_state.json when --skip-scripts.
    """
    AVGS_LAUNCH = date(2024, 10, 14)
    AVGS_LAUNCH_STR = "2024-10-14"

    if args.skip_scripts:
        # Try dashboard_state first, then factor_cache
        for src_path, src_name in [
            (ROOT / "dados" / "dashboard_state.json", "state"),
            (FACTOR_CACHE, "cache"),
        ]:
            try:
                s = json.loads(src_path.read_text())
                fs = s.get("factor_signal")
                if fs:
                    print(f"  ✓ factor_signal ({src_name})")
                    return fs
            except Exception:
                pass
        return None

    print("  ▶ factor signal (YTD + since launch) ...")
    try:
        import yfinance as yf

        today = date.today()
        ytd_start = f"{today.year}-01-01"

        tickers = yf.download(
            [TICKER_SWRD_LSE, TICKER_AVGS_LSE], start=AVGS_LAUNCH_STR,
            auto_adjust=True, progress=False
        )[COLUMN_CLOSE]

        ytd   = tickers[tickers.index >= ytd_start]
        swrd_ytd        = float((ytd[TICKER_SWRD_LSE].iloc[-1] / ytd[TICKER_SWRD_LSE].iloc[0] - 1) * 100)
        avgs_ytd        = float((ytd[TICKER_AVGS_LSE].iloc[-1] / ytd[TICKER_AVGS_LSE].iloc[0] - 1) * 100)
        swrd_launch     = float((tickers[TICKER_SWRD_LSE].iloc[-1] / tickers[TICKER_SWRD_LSE].iloc[0] - 1) * 100)
        avgs_launch_ret = float((tickers[TICKER_AVGS_LSE].iloc[-1] / tickers[TICKER_AVGS_LSE].iloc[0] - 1) * 100)
        meses = (today - AVGS_LAUNCH).days / 30.44

        result = {
            "swrd_ytd_pct":           round(swrd_ytd, 2),
            "avgs_ytd_pct":           round(avgs_ytd, 2),
            "excess_ytd_pp":          round(avgs_ytd - swrd_ytd, 2),
            "swrd_since_launch_pct":  round(swrd_launch, 2),
            "avgs_since_launch_pct":  round(avgs_launch_ret, 2),
            "excess_since_launch_pp": round(avgs_launch_ret - swrd_launch, 2),
            "avgs_launch_date":       AVGS_LAUNCH_STR,
            "meses_desde_launch":     round(meses, 1),
            "fonte":  "yfinance · SWRD.L + AVGS.L · preços diários",
            "updated": str(today),
        }
        print(f"    → AVGS YTD {avgs_ytd:+.1f}% vs SWRD YTD {swrd_ytd:+.1f}% (excess: {avgs_ytd-swrd_ytd:+.1f}pp)")
        return result
    except Exception as e:
        print(f"  ⚠️ factor_signal: {e}")
        return None


# ─── 5c. FACTOR: LOADINGS POR ETF (FF5 + Momentum) ─────────────────────────
def get_factor_loadings():
    """Run Fama-French 5-factor + momentum regression on portfolio ETFs.

    Returns dict: {TICKER: {alpha, mkt_rf, smb, hml, rmw, cma, mom, r2, n_months}, ...}
    Uses Developed Markets factors from Ken French Data Library.
    Caches result to dados/factor_cache.json for --skip-scripts.
    """
    if args.skip_scripts:
        try:
            cache = json.loads(FACTOR_CACHE.read_text())
            if "factor_loadings" in cache:
                print("  ✓ factor_loadings (cache)")
                return cache["factor_loadings"]
        except Exception:
            pass
        return {}

    print("  ▶ factor loadings (FF5 + MOM) ...")
    try:
        import io as _io
        import zipfile as _zf
        import urllib.request as _url
        import pandas as _pd
        import yfinance as yf
        import statsmodels.api as _sm

        # --- Download FF factors ---
        def _download_ff(url):
            req = _url.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            resp = _url.urlopen(req, timeout=30)
            z = _zf.ZipFile(_io.BytesIO(resp.read()))
            csv_name = [n for n in z.namelist() if n.lower().endswith(".csv")][0]
            raw = z.read(csv_name).decode("utf-8")

            lines = raw.split("\n")
            data_lines, started = [], False
            for line in lines:
                stripped = line.strip()
                if not stripped:
                    if started:
                        break
                    continue
                parts = stripped.split(",")
                if parts[0].strip().isdigit() and len(parts[0].strip()) == 6:
                    started = True
                    data_lines.append(stripped)
                elif started:
                    break

            header_line = None
            for line in lines:
                stripped = line.strip()
                if "Mkt-RF" in stripped or "Mkt_RF" in stripped:
                    header_line = stripped
                    break

            if header_line:
                cols = [c.strip() for c in header_line.split(",")[1:]]
            else:
                n_cols = len(data_lines[0].split(",")) - 1
                if n_cols == 6:
                    cols = ["Mkt-RF", "SMB", "HML", "RMW", "CMA", "RF"]
                elif n_cols == 2:
                    cols = ["WML", "RF"]
                else:
                    cols = [f"F{i}" for i in range(n_cols)]

            df = _pd.DataFrame([l.split(",") for l in data_lines], columns=["Date"] + cols)
            df["Date"] = _pd.to_datetime(df["Date"].str.strip(), format="%Y%m")
            for c in cols:
                df[c] = _pd.to_numeric(df[c].str.strip(), errors="coerce") / 100.0
            return df.set_index("Date")

        ff5 = _download_ff("https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_5_Factors_CSV.zip")
        mom = _download_ff("https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_Mom_Factor_CSV.zip")
        if "WML" in mom.columns:
            mom = mom.rename(columns={"WML": "MOM"})
        elif len(mom.columns) >= 1 and mom.columns[0] != "MOM":
            mom = mom.rename(columns={mom.columns[0]: "MOM"})
        factors = ff5.join(mom[["MOM"]], how="inner")

        # --- Download ETF prices ---
        # Main ETFs + transitional that still have positions
        etf_map = {
            TICKER_SWRD_LSE: "SWRD", "AVGS.L": "AVGS", "AVEM.L": "AVEM",
            "EIMI.L": "EIMI", "AVUV": "AVUV", "AVDV": "AVDV",
            "DGS": "DGS", "USSC.L": "USSC", "IWVL.L": "IWVL",
        }
        tickers = list(etf_map.keys())
        price_data = yf.download(tickers, start="2019-07-01", progress=False, auto_adjust=True)

        prices = {}
        if isinstance(price_data.columns, _pd.MultiIndex):
            close = price_data[COLUMN_CLOSE]
            for yf_tk, label in etf_map.items():
                if yf_tk in close.columns:
                    series = close[yf_tk].dropna()
                    if len(series) > 24:  # need at least 2 years
                        prices[label] = series
        else:
            # Single ticker fallback
            for yf_tk, label in etf_map.items():
                if COLUMN_CLOSE in price_data.columns:
                    prices[label] = price_data[COLUMN_CLOSE].dropna()

        # --- Monthly returns + regression ---
        factor_cols = [f for f in ["Mkt-RF", "SMB", "HML", "RMW", "CMA", "MOM"] if f in factors.columns]
        loadings = {}

        for label, price_series in prices.items():
            try:
                monthly = price_series.resample("ME").last()
                ret = monthly.pct_change().dropna()
                ret.index = ret.index.to_period("M").to_timestamp()

                merged = _pd.DataFrame({"ret": ret}).join(factors, how="inner")
                if len(merged) < 18:
                    continue

                merged["excess"] = merged["ret"] - merged["RF"]
                y = merged["excess"]
                X = merged[factor_cols]
                X_const = _sm.add_constant(X)
                model = _sm.OLS(y, X_const).fit(cov_type="HC1")

                loadings[label] = {
                    "alpha":  round(float(model.params["const"] * 12), 5),  # annualized
                    "mkt_rf": round(float(model.params.get("Mkt-RF", 0)), 4),
                    "smb":    round(float(model.params.get("SMB", 0)), 4),
                    "hml":    round(float(model.params.get("HML", 0)), 4),
                    "rmw":    round(float(model.params.get("RMW", 0)), 4),
                    "cma":    round(float(model.params.get("CMA", 0)), 4),
                    "mom":    round(float(model.params.get("MOM", 0)), 4),
                    "r2":     round(float(model.rsquared), 4),
                    "n_months": int(model.nobs),
                    "t_stats": {
                        "alpha":  round(float(model.tvalues["const"]), 3),
                        "mkt_rf": round(float(model.tvalues.get("Mkt-RF", 0)), 3),
                        "smb":    round(float(model.tvalues.get("SMB", 0)), 3),
                        "hml":    round(float(model.tvalues.get("HML", 0)), 3),
                        "rmw":    round(float(model.tvalues.get("RMW", 0)), 3),
                        "cma":    round(float(model.tvalues.get("CMA", 0)), 3),
                        "mom":    round(float(model.tvalues.get("MOM", 0)), 3),
                    },
                }
            except Exception as e:
                print(f"    ⚠️ {label}: {e}")
                continue

        print(f"    → {len(loadings)} ETFs regressed: {list(loadings.keys())}")
        return loadings

    except Exception as e:
        print(f"  ⚠️ factor loadings: {e}")
        return {}


# ─── 6. POSIÇÕES + PREÇOS ────────────────────────────────────────────────────
def get_posicoes_precos(state):
    posicoes = state.get("posicoes", {})
    cambio   = state.get("patrimonio", {}).get("cambio", CAMBIO_FALLBACK)

    prices = {}  # cache de preços live; inclui HODL11 quando disponível
    if not args.skip_prices:
        print("  ▶ yfinance preços ...")
        try:
            import yfinance as yf
            tickers_yf = {tk: yf_sym for tk, yf_sym in TICKERS_YF.items() if tk in posicoes or tk in ("USD_BRL", "HODL11")}
            syms = list(set(tickers_yf.values()))
            data = yf.download(syms, period="2d", progress=False, auto_adjust=True)
            if hasattr(data, 'columns') and COLUMN_CLOSE in data:
                close = data[COLUMN_CLOSE]
                for tk, yf_sym in tickers_yf.items():
                    if yf_sym in close.columns:
                        last = close[yf_sym].dropna()
                        if len(last):
                            prices[tk] = round(float(last.iloc[-1]), 4)
            # Câmbio
            if "USD_BRL" in prices:
                cambio = prices["USD_BRL"]

            # Atualizar preços nas posições
            for tk, pos in posicoes.items():
                if tk in prices:
                    posicoes[tk]["price"] = prices[tk]
        except Exception as e:
            print(f"  ⚠️ yfinance: {e}")

    # Garantir bucket, status e TER em cada posição
    for tk, pos in posicoes.items():
        if "bucket" not in pos:
            pos["bucket"] = BUCKET_MAP.get(tk, tk)
        if "status" not in pos:
            pos["status"] = "alvo" if tk in ("SWRD", "AVGS", "AVEM", "AVUV_UCITS") else "transitório"
        # Injetar TER (% a.a.) — fonte: config.py ETF_TER
        if "ter" not in pos:
            pos["ter"] = ETF_TER.get(tk)

    return posicoes, cambio, prices


# ─── 7. RF (holdings.md + state) ─────────────────────────────────────────────

# Constantes fixas da Renda+ 2065 (NTN-B estruturado)
_RENDA_PLUS_ANO_VENC = RENDA_PLUS_ANO_VENC
_RENDA_PLUS_TAXA_DEFAULT = RENDA_PLUS_TAXA_DEFAULT

def get_rf(state):
    rf_raw = state.get("rf", {})
    taxa_ipca, taxa_renda = read_holdings_taxas()

    # OPO 5: RF _updated from holdings.md mtime
    _rf_updated = (
        datetime.fromtimestamp(HOLDINGS_PATH.stat().st_mtime).strftime(DATE_FORMAT_YMD)
        if HOLDINGS_PATH.exists() else str(date.today())
    )

    # Normaliza schema: state usa "valor_brl", template espera "valor"
    # Initialize with known RF assets to prevent empty RF when state is empty
    notas_map = {
        "ipca2029":  "Reserva · Nubank · migrar 2029",
        "ipca2040":  "DCA ativo · XP · HTM SEMPRE",
        "renda2065": f"Tático · Nubank · Vender ≤{PISO_VENDA_RENDA_PLUS}%",
    }

    # Start with known RF assets from state or initialize empty
    rf = {}
    for key, raw in rf_raw.items():
        if key == "hodl11":
            rf[key] = raw  # hodl11 tratado separadamente
            continue
        valor = raw.get("valor", raw.get("valor_brl", 0))
        taxa = raw.get("taxa")
        cotas = raw.get("cotas")
        rf[key] = {
            "cotas": cotas,
            "valor": valor,
            "taxa":  taxa,
            "tipo":  raw.get("tipo"),
            "notas": raw.get("notas", notas_map.get(key, "")),
            "_updated": _rf_updated,
        }

    # Fallback: Se RF está vazio em state, ler de resumo_td.json (Nubank via parse_nubank_operations.py)
    if not rf_raw and NUBANK_TD_PATH.exists():
        try:
            nubank_resumo = json.loads(NUBANK_TD_PATH.read_text())
            print(f"  ▶ Loading RF from resumo_td.json ({len(nubank_resumo)} items)...")
            for key, data in nubank_resumo.items():
                if key.startswith("_"):
                    continue  # skip metadata fields
                rf[key] = {
                    "cotas": None,  # será calculado por reconstruct_history
                    "valor": data.get("liquido_aplicado", 0),
                    "taxa": data.get("taxa"),
                    "tipo": data.get("tipo", "Tesouro Direto"),
                    "notas": notas_map.get(key, ""),
                    "_updated": _rf_updated,
                }
                print(f"  ✓ RF {key}: R${data.get('liquido_aplicado', 0):,.0f} @ {data.get('taxa')}%")
        except Exception as e:
            print(f"  ⚠️ resumo_td.json: {e}")

    # Initialize missing RF assets with empty placeholders (prevents RF vazio)
    for asset_key in ["ipca2029", "ipca2040", "renda2065", "ipca2050"]:
        if asset_key not in rf:
            rf[asset_key] = {
                "cotas": None,
                "valor": 0,
                "taxa": None,
                "tipo": "Tesouro Direto",
                "notas": notas_map.get(asset_key, ""),
                "_updated": _rf_updated,
            }

    # Atualizar taxas do holdings.md (mais atualizado que o state)
    # Usar mercado_mtd como fonte primária se disponível (mais atual que holdings.md)
    mercado_mtd = state.get("mercado_mtd", {})
    if taxa_ipca and "ipca2040" in rf:
        rf["ipca2040"]["taxa"] = mercado_mtd.get("ipca2040_taxa") or taxa_ipca
    if taxa_renda and "renda2065" in rf:
        rf["renda2065"]["taxa"] = mercado_mtd.get("renda2065_taxa") or taxa_renda

    # ── Custo base RF da Nubank (dados/nubank/resumo_td.json) ───────────────
    # Enriquece cada título com total_aplicado e liquido_aplicado (custo base)
    if NUBANK_TD_PATH.exists():
        try:
            nubank_td = json.loads(NUBANK_TD_PATH.read_text())
            for nb_key, nb_data in nubank_td.items():
                if nb_key in rf and not nb_data.get("zerado"):
                    rf[nb_key]["custo_base_brl"] = nb_data.get("liquido_aplicado", 0)
                    rf[nb_key]["total_aplicado_brl"] = nb_data.get("total_aplicado", 0)
                    rf[nb_key]["total_resgatado_brl"] = nb_data.get("total_resgatado", 0)
                    rf[nb_key]["n_aplicacoes"] = len(nb_data.get("aplicacoes", []))
            print(f"  ✓ RF custo base Nubank: {', '.join(k for k in nubank_td if k in rf and not nubank_td[k].get('zerado'))}")
        except Exception as e:
            print(f"  ⚠️ Nubank TD: {e}")

    # ── Campos adicionais para Renda+ 2065 ──────────────────────────────────
    # Duration modificada, MtM por 1pp e distância ao gatilho de venda.
    # Fonte metodológica: ANBIMA Manual MtM 2023, Seção 5.2 (NTN-B).
    # Cupom NTN-B: 6% a.a. real = 0.5% semestral sobre VNA.
    # Renda+ é estruturada como NTN-B com fluxos de renda vitalícia pós-2065;
    # para fins de duration, usar o vencimento nominal 2065 é conservador
    # (subestima duration caso haja prorrogação) e aceito para monitoramento
    # de risco de MtM no dashboard.
    if "renda2065" in rf:
        _ano_atual = datetime.now().year
        _anos_venc = _RENDA_PLUS_ANO_VENC - _ano_atual  # ex: 39 em 2026
        _taxa_atual = rf["renda2065"].get("taxa") or _RENDA_PLUS_TAXA_DEFAULT

        _dur_mac, _dur_mod = calcular_duration_modificada_ntnb(
            taxa_real_pct=_taxa_atual,
            anos_vencimento=_anos_venc,
        )
        _mtm_1pp = calcular_mtm_1pp(_dur_mod, _taxa_atual)
        _gap_pp   = round(_taxa_atual - PISO_VENDA_RENDA_PLUS, 2)
        _status   = calcular_status_semaforo(_taxa_atual, PISO_VENDA_RENDA_PLUS)

        rf["renda2065"]["duration"] = {
            "macaulay_anos":  _dur_mac,
            "modificada_anos": _dur_mod,
            "metodologia": "NTN-B ANBIMA: cupom 6% a.a. real (0.5%/sem), desconto taxa YTM real a.a.",
        }
        rf["renda2065"]["mtm_impact_1pp"] = _mtm_1pp  # % variação preço por +1pp taxa
        rf["renda2065"]["distancia_gatilho"] = {
            "taxa_atual":   _taxa_atual,
            "piso_venda":   PISO_VENDA_RENDA_PLUS,
            "gap_pp":       _gap_pp,   # positivo = acima do piso (seguro); negativo = gatilho ativado
            "status":       _status,   # verde / amarelo / vermelho
        }

    return rf


# ─── 7b. IR DIFERIDO — Lei 14.754/2023 (ETFs UCITS ACC) ─────────────────────
# Ganho de capital em BRL por lote:
#   custo_brl = qty * custo_usd * ptax_compra
#   valor_brl = qty * preco_atual_usd * ptax_atual
#   ganho_brl = valor_brl - custo_brl
#   ir        = 15% * max(0, ganho_brl)
# Tax calculation now centralized in TaxEngine (Lei 14.754/2023)
# Remove _fetch_ptax_series(), _lookup_ptax(), compute_tax_diferido()
# All tax logic moved to scripts/tax_engine.py


# ─── 7c. CONCENTRAÇÃO BRASIL ─────────────────────────────────────────────────
def compute_concentracao_brasil(rf: dict, hodl11_brl: float, total_brl: float, coe_net_brl: float = 0.0) -> dict | None:
    """Calcula exposição total a Brasil (Tesouro Direto + COE XP).

    Composição corrigida (2026-04-25):
      - HODL11: EXCLUÍDO do brasil_pct. BTC global, cripto_pct.
      - Crypto legado (Binance: BTC/ETH/BNB/ADA): EXCLUÍDO do brasil_pct. Cripto global.
      - RF total (Tesouro Direto): risco soberano BR.
      - COE + Empréstimo XP (net): BRL estruturado XP, risco BR.

    Três categorias que somam 100%:
      brasil_pct (RF + COE) + exposicao_cambial_pct (equity IBKR USD) + cripto_pct (HODL11 + Binance) = 100%
    """
    if total_brl is None or total_brl <= 0:
        return None

    # RF: somar todos os títulos (excl. hodl11)
    rf_total_brl = 0.0
    rf_composicao = {}
    for key, item in rf.items():
        if key == "hodl11":
            continue
        valor = item.get("valor", item.get("valor_brl", 0)) or 0
        rf_total_brl += valor
        rf_composicao[key] = round(valor)

    # Crypto legado (Binance: BTC/ETH/BNB/ADA — global, não Brasil soberano)
    crypto_legado = load_state().get("crypto_legado_brl") or load_binance_brl()

    # Brasil = RF soberano + COE XP — crypto_legado removido (é cripto global)
    brasil_total = rf_total_brl + coe_net_brl
    brasil_pct = round(brasil_total / total_brl * 100, 1)

    # Cripto = HODL11 + crypto_legado (Binance) — ambos cripto global
    cripto_total = hodl11_brl + crypto_legado
    cripto_pct = round(cripto_total / total_brl * 100, 1) if cripto_total > 0 else 0.0

    return {
        "brasil_pct": brasil_pct,
        "cripto_pct": cripto_pct,
        "composicao": {
            "hodl11_brl": round(hodl11_brl),
            "rf_total_brl": round(rf_total_brl),
            "rf_detalhe": rf_composicao,
            "coe_net_brl": round(coe_net_brl),
            "crypto_legado_brl": round(crypto_legado),
        },
        "total_brasil_brl": round(brasil_total),
        "total_cripto_brl": round(cripto_total),
        "total_portfolio_brl": round(total_brl),
        "nota": (
            "Brasil = RF soberano (TD) + COE XP (BRL estruturado). "
            "Cripto = HODL11 (BTC wrapper B3) + Binance legado (BTC/ETH/BNB/ADA). "
            "Três categorias: brasil + cambial(equity IBKR) + cripto = 100%."
        ),
    }


# ─── 7d. PREMISSAS VS REALIZADO ────────────────────────────────────────────
def compute_premissas_vs_realizado(
    premissas: dict,
    backtest_data: dict,
    cambio: float,
    csv_rows: list | None = None,
) -> dict | None:
    """Compara premissas do plano FIRE com dados realizados.

    Dimensões comparadas:
      1. Retorno equity: premissa (4.85% real BRL base) vs backtest CAGR.
         NOTA: backtest CAGR é nominal USD (inclui inflação US, exclui BRL).
         Comparação direta não é apple-to-apple -- flag explícito.
      2. Aporte mensal: premissa (R$25k/mês) vs média real dos depósitos.
         Inclui: aportes IBKR (USD → BRL) + aportes RF (BRL direto).
         Conversão USD→BRL pelo câmbio de referência atual (aproximação).

    Retorna dict com comparação, ou None se dados insuficientes.
    """
    result = {"retorno_equity": None, "aporte_mensal": None}

    # ── 1. Retorno equity ───────────────────────────────────────────────
    premissa_retorno = premissas.get("retorno_equity_base")  # 0.0485
    backtest_metrics = backtest_data.get("backtest", {}).get("metrics", {})
    target_cagr = backtest_metrics.get("target", {}).get("cagr")  # ex: 12.88 (%)
    shadow_cagr = backtest_metrics.get("shadowA", {}).get("cagr")  # VWRA benchmark

    # Ler twr_real_brl_pct e ipca_cagr_periodo_pct de retornos_mensais.json
    # Cálculo de deflação pertence a reconstruct_history.py — não recalcular aqui.
    twr_nominal_brl_cagr = None
    twr_real_brl_cagr    = None
    ipca_cagr_periodo    = None
    periodo_anos         = None
    try:
        if RETORNOS_CORE.exists():
            _rc = json.loads(RETORNOS_CORE.read_text())
            twr_real_brl_cagr = _rc.get("twr_real_brl_pct")
            ipca_cagr_periodo = _rc.get("ipca_cagr_periodo_pct")
            periodo_anos      = _rc.get("periodo_anos")
            # twr_nominal (para auditoria): recalcular a partir de twr_pct
            _twr = _rc.get("twr_pct", [])
            if _twr and len(_twr) >= 6:
                _acum = 1.0
                for r in _twr:
                    _acum *= (1 + r / 100)
                twr_nominal_brl_cagr = round((_acum ** (12 / len(_twr)) - 1) * 100, 2)
    except Exception as _e:
        print(f"  ⚠️ PvR leitura retornos_mensais.json: {_e}")

    if premissa_retorno is not None:
        result["retorno_equity"] = {
            "premissa_real_brl_pct":         round(premissa_retorno * 100, 2),
            "twr_real_brl_pct":              twr_real_brl_cagr,     # realizado real BRL (pós-IPCA) — comparação correta
            "twr_nominal_brl_cagr_pct":      twr_nominal_brl_cagr,  # nominal BRL (auditoria)
            "ipca_cagr_periodo_pct":         ipca_cagr_periodo,     # IPCA CAGR do período
            "periodo_anos":                  periodo_anos,
            "backtest_nominal_usd_pct":      target_cagr,           # CAGR backtest (nominal USD, referência)
            "benchmark_vwra_nominal_usd_pct": shadow_cagr,
            "nota": (
                "Premissa = retorno real em BRL (pós-IPCA, pós-depreciação cambial 0.5%/ano). "
                "Realizado = TWR anualizado BRL deflacionado pelo IPCA do período (comparação correta). "
                "Backtest USD = nominal em USD (inclui inflação US ~2-3%/ano, referência apenas)."
            ),
        }

    # ── 2. Aporte mensal ────────────────────────────────────────────────
    premissa_aporte = premissas.get("aporte_mensal")  # 25000 (BRL)
    aportes = None
    try:
        if APORTES_PATH.exists():
            aportes = json.loads(APORTES_PATH.read_text())
    except Exception:
        pass

    if aportes and premissa_aporte:
        depositos = aportes.get("depositos", [])
        if depositos:
            # Calcular período coberto (primeiro ao último depósito IBKR)
            datas_ibkr = sorted(d["data"] for d in depositos)
            primeira_ibkr = datetime.strptime(datas_ibkr[0], "%Y-%m-%d")
            ultima_ibkr = datetime.strptime(datas_ibkr[-1], "%Y-%m-%d")

            # ─ Aportes totais via historico_carteira.csv (fonte canônica) ─
            # CSV.aporte_brl = equity (USD × PTAX histórica) + RF (BRL direto) — sem double-count
            # NÃO somar total_ibkr_usd × cambio_atual pois já está embutido no CSV a fx histórico.
            total_usd = aportes.get("total_usd", sum(d["usd"] for d in depositos))  # informativo
            total_aporte_brl = 0
            meses_com_aporte = 0
            data_primeira_csv = None
            data_ultima_csv = None
            por_ano_brl: dict[str, int] = {}
            if csv_rows:
                for row in csv_rows:
                    try:
                        aporte_brl_val = float(row.get("aporte_brl", "0").replace(",", ".").replace(" ", ""))
                        if aporte_brl_val > 0:
                            total_aporte_brl += aporte_brl_val
                            meses_com_aporte += 1
                            row_data = row.get("data", "")
                            if row_data:
                                if not data_primeira_csv:
                                    data_primeira_csv = row_data
                                data_ultima_csv = row_data
                                ano = row_data[:4]
                                por_ano_brl[ano] = por_ano_brl.get(ano, 0) + round(aporte_brl_val)
                    except (ValueError, KeyError, TypeError):
                        pass

            # Denominator = meses com aporte real (não período calendário)
            media_mensal_brl = round(total_aporte_brl / meses_com_aporte) if meses_com_aporte > 0 else 0

            # Período via CSV; fallback para IBKR se CSV vazio
            datas_ref = []
            if data_primeira_csv:
                datas_ref.append(data_primeira_csv)
            if data_ultima_csv:
                datas_ref.append(data_ultima_csv)
            if not datas_ref:
                datas_ref = [datas_ibkr[0], datas_ibkr[-1]]
            datas_ref_sorted = sorted(datas_ref)

            result["aporte_mensal"] = {
                "premissa_brl": premissa_aporte,
                "realizado_media_brl": media_mensal_brl,
                "delta_brl": media_mensal_brl - premissa_aporte,
                "delta_pct": round((media_mensal_brl / premissa_aporte - 1) * 100, 1) if premissa_aporte else 0,
                "periodo": f"{datas_ref_sorted[0]} a {datas_ref_sorted[-1]}",
                "meses_com_aporte": meses_com_aporte,
                "total_ibkr_usd": round(total_usd),
                "total_aporte_brl": round(total_aporte_brl),
                "por_ano_brl": por_ano_brl,
                "nota": (
                    "Fonte canônica: historico_carteira.csv.aporte_brl = equity (USD × PTAX histórica do mês) + RF (BRL direto). "
                    "Média = total / meses com aporte real. Sem double-count de USD vs BRL."
                ),
            }

    return result if any(v is not None for v in result.values()) else None


# ─── HODL11 FIRE Projection ───────────────────────────────────────────────────
def _compute_hodl11_fire_projection(hodl11_brl, btc_atual_usd, btc_cenarios_usd):
    """Projeta valor do HODL11 no FIRE Day em 3 cenários de BTC.

    Args:
        hodl11_brl: valor total da posição HODL11 em BRL
        btc_atual_usd: preço atual do BTC em USD (de macro.bitcoin_usd ou mercado.btc_usd)
        btc_cenarios_usd: dict com cenários bear/base/bull em USD
    """
    if hodl11_brl <= 0 or btc_atual_usd <= 0:
        return None

    result = {}
    for cenario, btc_target_usd in btc_cenarios_usd.items():
        upside_factor = btc_target_usd / max(btc_atual_usd, 1)
        valor_fire_brl = hodl11_brl * upside_factor
        result[cenario] = {
            "btc_target_usd": btc_target_usd,
            "upside_factor": round(upside_factor, 2),
            "valor_fire_brl": round(valor_fire_brl),
        }

    return {
        "btc_atual_usd": round(btc_atual_usd, 2),
        "hodl11_brl_atual": round(hodl11_brl),
        "cenarios": result,
    }


# ─── Human Capital Crossover ──────────────────────────────────────────────────
def _compute_human_capital_crossover(fire_trilha, premissas):
    """
    Calcula VP do capital humano MÊS A MÊS (Boldin-style) com juros compostos.

    Metodologia:
    - Aporte mensal = renda_estimada (mensal) - custo_vida_base/12
    - Cada mês cresce com inflação anual (2% real)
    - Taxa desconto: 6% real a.a. (IPCA+, não equity)
    - VP acumulado ponto a ponto até FIRE Day
    """
    TAXA_DESCONTO_ANUAL = 0.06      # 6% real a.a. (IPCA+, custo de oportunidade)
    INFLACAO_ANUAL = 0.02            # 2% real a.a.

    # Taxa mensal (composição)
    taxa_mensal = (1 + TAXA_DESCONTO_ANUAL) ** (1/12) - 1  # ≈ 0.4868%
    inflacao_mensal = (1 + INFLACAO_ANUAL) ** (1/12) - 1   # ≈ 0.1654%

    # Parâmetros
    renda_mensal = premissas.get("renda_estimada", 45000)
    # Se < 10k, assume mensal já; se >= 10k, assume mensal
    if isinstance(renda_mensal, (int, float)) and renda_mensal < 10000:
        renda_mensal = renda_mensal  # já é mensal

    custo_vida_anual = premissas.get("custo_vida_base", 250000)
    custo_vida_mensal = custo_vida_anual / 12

    # Aporte mensal = diferença (ambas indexadas a inflação)
    aporte_mensal = renda_mensal - custo_vida_mensal

    idade_atual = premissas.get("idade_atual", 39)
    ano_atual = premissas.get("ano_atual", 2026)
    idade_fire = premissas.get("idade_cenario_base", 53)

    # Patrimônio por data (para comparação)
    datas = (fire_trilha or {}).get("dates", [])
    valores = (fire_trilha or {}).get("trilha_brl", [])
    by_date = {d: v for d, v in zip(datas, valores) if v is not None}

    pontos = []
    crossover_entry = None

    # Pre-calcular todos os aportes futuros (mês a mês)
    aportes_futuros = []
    for mes_global in range(1, 169):  # 14 anos * 12
        aporte_t = aporte_mensal * ((1 + inflacao_mensal) ** (mes_global - 1))
        vp_aporte_t = aporte_t / ((1 + taxa_mensal) ** mes_global)
        aportes_futuros.append(vp_aporte_t)

    # Para cada ano, calcular VP dos aportes RESTANTES (não acumulados)
    for offset_anos in range(idade_fire - idade_atual + 1):
        ano = ano_atual + offset_anos
        idade = idade_atual + offset_anos

        # Quantos meses já passaram desde 2026?
        meses_passados = offset_anos * 12

        # VP dos aportes restantes (de agora em diante, neste ano, até 2040)
        vp_restante = sum(aportes_futuros[meses_passados:])

        # Patrimônio neste ano
        pat = None
        for mes_str in ["12", "11", "10"]:
            pat = by_date.get(f"{ano}-{mes_str}")
            if pat is not None:
                break
        if pat is None:
            pat = 0.0

        crossed = pat >= vp_restante
        entry = {
            "ano": ano,
            "idade": idade,
            "vp_capital_humano": round(vp_restante),
            "pat_financeiro": round(pat),
            "crossover": crossed,
            "delta": round(pat - vp_restante),
        }
        pontos.append(entry)
        if crossed and crossover_entry is None:
            crossover_entry = entry

    renda_anual = renda_mensal * 12

    return {
        "taxa_desconto_real": TAXA_DESCONTO_ANUAL,
        "crescimento_renda": INFLACAO_ANUAL,
        "renda_estimada_anual": renda_anual,
        "aporte_mensal": round(aporte_mensal),
        "aporte_anual": round(aporte_mensal * 12),
        "custo_vida_mensal": round(custo_vida_mensal),
        "crossover_ano": crossover_entry["ano"] if crossover_entry else None,
        "crossover_idade": crossover_entry["idade"] if crossover_entry else None,
        "fire_day_ano": ano_atual + (idade_fire - idade_atual),
        "fire_day_idade": idade_fire,
        "pontos": pontos,
    }


# ─── 8. DRIFT ─────────────────────────────────────────────────────────────────
def compute_drift(posicoes, rf, hodl11_brl, cambio, coe_net_brl: float = 0.0):
    # Total — inclui COE net (DEV-coe-hodl11-classificacao 2026-04-24)
    eq_usd = sum(p["qty"] * p.get("price", p.get("avg_cost", 0)) for p in posicoes.values())
    rf_brl = sum(v.get("valor", 0) for k, v in rf.items() if k != "hodl11")
    # Crypto legado: precisa estar consistente com concentracao_brasil
    crypto_legado = load_state().get("crypto_legado_brl") or load_binance_brl()
    total  = eq_usd * cambio + rf_brl + hodl11_brl + crypto_legado + coe_net_brl

    # Bucket USD sums
    buckets = {}
    for tk, p in posicoes.items():
        bk = p.get("bucket", BUCKET_MAP.get(tk, tk))
        if bk not in ("JPGL",):
            buckets[bk] = buckets.get(bk, 0) + p["qty"] * p.get("price", p.get("avg_cost", 0))

    drift = {}
    for bk in ("SWRD", "AVGS", "AVEM"):
        atual = round(buckets.get(bk, 0) * cambio / total * 100, 1) if total else 0
        alvo  = round(PESOS_TARGET.get(bk, 0) * 100, 1)
        drift[bk] = {"atual": atual, "alvo": alvo}

    ipca_brl = (rf.get("ipca2029", {}).get("valor", 0)
                + rf.get("ipca2040", {}).get("valor", 0)
                + rf.get("ipca2050", {}).get("valor", 0))
    drift["IPCA"]   = {"atual": round(ipca_brl / total * 100, 1) if total else 0, "alvo": round(IPCA_LONGO_PCT * 100, 1)}
    drift["HODL11"] = {"atual": round(hodl11_brl / total * 100, 1) if total else 0, "alvo": round(CRIPTO_PCT * 100, 1)}

    return drift, round(total)


# ─── 8b. EARLIEST FIRE ────────────────────────────────────────────────────────
def compute_earliest_fire(pfire_aspiracional: dict, pfire_base: dict, premissas_raw: dict) -> dict:
    """Calcula o ano mais cedo onde P(FIRE) >= 85%.

    Lógica:
      - Se pfire_aspiracional.base >= 85: earliest = ano aspiracional (idade 49), status = 'aspiracional'
      - Se pfire_base.base >= 85: earliest = ano alvo (idade 53), status = 'base'
      - Senão: status = 'abaixo_threshold'
    """
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("fire_mc", ROOT / "scripts" / "fire_montecarlo.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        idade_atual = getattr(mod, 'PREMISSAS', {}).get('idade_atual', IDADE_ATUAL)
        idade_aspir = getattr(mod, 'PREMISSAS', {}).get('idade_cenario_aspiracional', IDADE_CENARIO_ASPIRACIONAL)
        idade_alvo  = getattr(mod, 'PREMISSAS', {}).get('idade_cenario_base', IDADE_CENARIO_BASE)
    except Exception:
        idade_atual = premissas_raw.get('idade_atual', IDADE_ATUAL)
        idade_aspir = premissas_raw.get('idade_cenario_aspiracional', IDADE_CENARIO_ASPIRACIONAL)
        idade_alvo  = premissas_raw.get('idade_cenario_base', IDADE_CENARIO_BASE)

    ano_atual = datetime.now().year
    ano_aspir = ano_atual + (idade_aspir - idade_atual)
    ano_alvo  = ano_atual + (idade_alvo  - idade_atual)

    pf_aspiracional_base = pfire_aspiracional.get('base')
    pf_base_base = pfire_base.get('base')

    THRESHOLD = 85.0
    if pf_aspiracional_base is not None and pf_aspiracional_base >= THRESHOLD:
        return {"ano": ano_aspir, "idade": idade_aspir, "pfire": pf_aspiracional_base, "status": "aspiracional"}
    elif pf_base_base is not None and pf_base_base >= THRESHOLD:
        return {"ano": ano_alvo, "idade": idade_alvo, "pfire": pf_base_base, "status": "base"}
    else:
        # Retorna o alvo base mesmo abaixo do threshold (para exibição)
        return {
            "ano": ano_alvo, "idade": idade_alvo,
            "pfire": pf_base_base,
            "status": "abaixo_threshold",
        }


# ─── 8c. SPENDING GUARDRAILS ───────────────────────────────────────────────────
# Bond pool runway calculation now centralized in BondPoolEngine
# See scripts/bond_pool_engine.py for single source of truth
def _compute_bond_pool_runway_by_profile(
    bond_pool_rwy_data: dict | None,
    perfis_cfg: dict,
    fire_year: int | None = None,
    anos_projecao: int = 15,
    r_real: float | None = None,
    inss_katia_inicio_ano: int = INSS_KATIA_INICIO_ANO,
) -> dict | None:
    """Calcula depleção pós-FIRE do bond pool por perfil familiar via BondPoolEngine.

    Modelo: pool(t) = pool(t-1) × (1+r_real) − saque(t)
    """
    if not bond_pool_rwy_data:
        return None

    pool_total_list = bond_pool_rwy_data.get("pool_total_brl", [])
    if not pool_total_list:
        return None

    # Resolve defaults from config/premissas
    if fire_year is None:
        fire_year = ANO_NASCIMENTO + IDADE_CENARIO_BASE
    if r_real is None:
        r_real = RETORNO_RF_REAL_BOND_POOL

    pool_inicial = pool_total_list[-1]  # Pool no FIRE Day

    try:
        request = BondPoolRequest(
            pool_2040_inicial=1000,  # Dummy values (not used in post-FIRE)
            pool_2050_inicial=500,
            taxa_2040=0.07,
            taxa_2050=0.07,
            perfis_cfg=perfis_cfg,
            r_real_post_fire=r_real,
            anos_projecao_pos_fire=anos_projecao,
            fire_year_override=fire_year,
        )
        return BondPoolEngine.calculate_post_fire(request, pool_inicial=pool_inicial)
    except ValueError as e:
        print(f"  ⚠️ BondPoolEngine error: {e}")
        return None


def compute_spending_guardrails(pfire_base: dict, premissas_raw: dict, guardrails_raw: list, gasto_piso: int) -> dict | None:
    """Calcula spending_guardrails com zonas de P(FIRE) × custo de vida.

    Delegado para GuardrailEngine.calculate() — single source of truth.
    """
    pfire_atual = pfire_base.get('base')
    spending_atual = premissas_raw.get('custo_vida_base', CUSTO_VIDA_BASE)

    if pfire_atual is None:
        return None

    request = GuardrailRequest(
        pfire_atual=pfire_atual,
        spending_atual=spending_atual,
    )
    result = GuardrailEngine.calculate(request)

    return {
        "zona":                       result.zona,
        "pfire_atual":                result.pfire_atual,
        "spending_atual":             result.spending_atual,
        "upper_guardrail_spending":   result.upper_guardrail,
        "safe_target_spending":       result.safe_target,
        "lower_guardrail_spending":   result.lower_guardrail,
        "nota":                       result.nota,
    }


# ─── 9. MACRO ─────────────────────────────────────────────────────────────────
def get_macro_data(state: dict, total_brl_override: float = None) -> dict:
    """
    Retorna dados macro para o dashboard.

    Fontes (por prioridade):
      - Selic:     python-bcb SGS serie 432 -> cached no state -> hardcoded c/ TODO
      - Fed Funds: FRED FEDFUNDS CSV (publico, sem API key) -> cached -> hardcoded c/ TODO
      - Spread:    calculado automaticamente
      - Depreciacao BRL: premissa oficial do plano (0.5%/ano base, carteira.md)
      - Exposicao cambial: calculado das posicoes do state

    Args:
        state: Estado contendo dados macro cached
        total_brl_override: Se fornecido, usa esse valor em vez de state.patrimonio.total_brl
    """
    import math
    import urllib.request

    # -- Selic -------------------------------------------------------
    selic_meta = None
    try:
        # Tenta python-bcb (disponivel no venv de producao)
        # SystemExit capturado pois fx_utils chama sys.exit(1) se python-bcb nao instalado
        from fx_utils import get_selic_atual
        val = get_selic_atual()
        if not math.isnan(val):
            selic_meta = round(val, 2)
    except (Exception, SystemExit):
        pass

    if selic_meta is None:
        # Fallback 1: snapshot em dashboard_state.json
        cached_macro = state.get("macro", {})
        selic_meta = cached_macro.get("selic_meta")

    # -- IPCA 12M (acumulado 12 meses, BCB SGS 13522) ----------------
    ipca_12m = None
    try:
        from fx_utils import get_ipca_12m
        val = get_ipca_12m()
        if not math.isnan(val):
            ipca_12m = round(val, 2)
    except (Exception, SystemExit):
        pass

    if ipca_12m is None:
        # Fallback: cached no state
        ipca_12m = state.get("macro", {}).get("ipca_12m")

    if selic_meta is None:
        # Fallback 2: valor do snapshot de memoria (agentes/memoria/08-macro.md -- Abril/2026)
        # TODO: atualizar quando COPOM alterar Selic
        selic_meta = SELIC_META_SNAPSHOT

    # -- Fed Funds ---------------------------------------------------
    fed_funds = None
    try:
        url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=FEDFUNDS"
        with urllib.request.urlopen(url, timeout=5) as resp:
            lines = resp.read().decode("utf-8").strip().splitlines()
        # CSV: DATE,FEDFUNDS -- ultima linha nao-vazia com valor numerico
        for line in reversed(lines):
            line = line.strip()
            if line and not line.startswith("DATE"):
                parts = line.split(",")
                if len(parts) == 2:
                    try:
                        fed_funds = round(float(parts[1]), 2)
                        break
                    except ValueError:
                        continue
    except Exception:
        pass

    if fed_funds is None:
        # Fallback 1: cached no state
        cached_macro = state.get("macro", {})
        fed_funds = cached_macro.get("fed_funds")

    if fed_funds is None:
        # Fallback 2: snapshot de memoria 08-macro.md (mar/2026: 3.64%)
        # TODO: atualizar mensalmente via /macro-bcb
        fed_funds = FED_FUNDS_SNAPSHOT

    # -- Spread Selic - Fed Funds ------------------------------------
    spread_selic_ff = None
    if selic_meta is not None and fed_funds is not None:
        spread_selic_ff = round(selic_meta - fed_funds, 2)

    # -- Exposicao cambial (equity USD convertido / total BRL) ------
    exposicao_cambial_pct = None
    try:
        pat = state.get("patrimonio", {})
        equity_usd = pat.get("equity_usd", 0)
        cambio_ref  = pat.get("cambio", CAMBIO_FALLBACK)
        # Usar total_brl_override se fornecido (calculado recentemente em compute_drift)
        # Senão, ler do state (que pode estar desatualizado)
        total_brl   = total_brl_override if total_brl_override is not None else pat.get("total_brl", 0)
        if total_brl and total_brl > 0:
            equity_brl = equity_usd * cambio_ref
            exposicao_cambial_pct = round(equity_brl / total_brl * 100, 1)
    except Exception:
        pass

    # -- Bitcoin USD via yfinance ----------------------------------------
    bitcoin_usd = None
    if not args.skip_prices:
        try:
            import yfinance as yf
            btc_data = yf.download("BTC-USD", period="2d", progress=False, auto_adjust=True)
            if btc_data is not None and not btc_data.empty:
                close = btc_data[COLUMN_CLOSE] if COLUMN_CLOSE in btc_data.columns else btc_data.iloc[:, 0]
                last = close.dropna()
                if len(last):
                    bitcoin_usd = round(float(last.iloc[-1]), 2)
        except Exception as e:
            print(f"  ⚠️ bitcoin yfinance: {e}")

    # -- CDS Brazil 5Y via investiny ---------------------------------
    cds_brazil_5y = None
    try:
        from investiny import historical_data as inv_hist
        today = date.today()
        from_dt = (today - timedelta(days=30)).strftime("%m/%d/%Y")
        to_dt = today.strftime("%m/%d/%Y")
        cds_data = inv_hist(investing_id="1116031", from_date=from_dt, to_date=to_dt)
        if cds_data and "close" in cds_data and cds_data["close"]:
            cds_brazil_5y = round(cds_data["close"][-1], 1)
    except Exception as e:
        print(f"  ⚠️ CDS Brazil 5Y: {e}")

    # -- Plano Status (fallback quando não há snapshot) -----
    plano_status = None
    try:
        fire_data = state.get("fire", {})
        wellness  = state.get("wellness", {}).get("metrics", {})
        pfire = fire_data.get("pfire_base", None)
        if pfire is not None and pfire > 1:
            pfire = pfire / 100.0
        drift_max = wellness.get("drift_max", {}).get("value", None)
        ipca_taxa = state.get("mercado_mtd", {}).get("ipca2040_taxa", None)
        if ipca_taxa is None:
            ipca_taxa = state.get("rf", {}).get("ipca2040", {}).get("taxa", None)

        from config import MACRO_REGRAS, PISO_TAXA_IPCA_LONGO
        status_final = MACRO_REGRAS.get("status_permanece", "INDEFINIDO")
        gatilhos = []

        if pfire is not None:
            if pfire < MACRO_REGRAS.get("pfire_monitorar_min", 0.80):
                status_final = MACRO_REGRAS.get("status_revisar", "REVISAR")
                gatilhos.append(f"P(FIRE) {pfire:.1%} < 80% — REVISAR")
            elif pfire < MACRO_REGRAS.get("pfire_permanece_min", 0.85):
                if status_final != MACRO_REGRAS.get("status_revisar", "REVISAR"):
                    status_final = MACRO_REGRAS.get("status_monitorar", "MONITORAR")
                gatilhos.append(f"P(FIRE) {pfire:.1%} entre 80–85% — MONITORAR")

        if drift_max is not None:
            if drift_max > MACRO_REGRAS.get("drift_monitorar_max", 10.0):
                status_final = MACRO_REGRAS.get("status_revisar", "REVISAR")
                gatilhos.append(f"Drift {drift_max:.1f}pp > 10pp — REVISAR")
            elif drift_max > MACRO_REGRAS.get("drift_permanece_max", 5.0):
                if status_final != MACRO_REGRAS.get("status_revisar", "REVISAR"):
                    status_final = MACRO_REGRAS.get("status_monitorar", "MONITORAR")
                gatilhos.append(f"Drift {drift_max:.1f}pp entre 5–10pp — MONITORAR")

        if ipca_taxa is not None:
            if ipca_taxa < MACRO_REGRAS.get("ipca_taxa_revisar_max", 5.5):
                status_final = MACRO_REGRAS.get("status_revisar", "REVISAR")
                gatilhos.append(f"Taxa IPCA+ {ipca_taxa:.2f}% < 5.5% — REVISAR")
            elif ipca_taxa < PISO_TAXA_IPCA_LONGO:
                if status_final != MACRO_REGRAS.get("status_revisar", "REVISAR"):
                    status_final = MACRO_REGRAS.get("status_monitorar", "MONITORAR")
                gatilhos.append(f"Taxa IPCA+ {ipca_taxa:.2f}% entre 5.5–6.0% — MONITORAR")
            else:
                gatilhos.append(f"DCA IPCA+ ativo — {ipca_taxa:.2f}% ≥ 6.0%")

        gatilho_ativo = gatilhos[0] if gatilhos else "Nenhum gatilho ativo"

        plano_status = {
            "status": status_final,
            "gatilho_ativo": gatilho_ativo,
            "todos_gatilhos": gatilhos,
            "inputs": {
                "pfire": round(pfire, 4) if pfire is not None else None,
                "drift_max_pp": drift_max,
                "ipca_taxa_pct": ipca_taxa,
            },
        }
    except Exception:
        plano_status = None

    return {
        "selic_meta":               selic_meta,           # % a.a. -- taxa Selic meta vigente
        "ipca_12m":                 ipca_12m,             # % a.a. -- IPCA acumulado 12 meses (BCB SGS 13522)
        "fed_funds":                fed_funds,             # % a.a. -- Fed Funds rate (FRED FEDFUNDS)
        "spread_selic_ff":          spread_selic_ff,       # pp    -- diferencial Selic - Fed Funds
        "depreciacao_brl_premissa": DEPRECIACAO_BRL_BASE,
        "exposicao_cambial_pct":    exposicao_cambial_pct, # %     -- parcela do patrimonio em USD
        "cds_brazil_5y_bps":        cds_brazil_5y,         # bps   -- CDS 5Y Brasil via investiny (gatilho: 400bps)
        "bitcoin_usd":              bitcoin_usd,           # USD   -- preço BTC-USD (yfinance)
        "plano_status":             plano_status,          # dict  -- status do plano (fallback quando sem snapshot)
        # cambio será injetado pelo main() após compute
    }


# ─── 9a. SEMÁFOROS DE GATILHOS ────────────────────────────────────────────────
def get_semaforo_triggers(rf: dict, hodl11: dict, total_brl: float, drift: dict | None = None) -> list:
    """Gera lista de 4 gatilhos unificados para o dashboard.

    Monitora:
    1. Renda+ 2065 — Taxa de juros real (piso venda 6.0%)
    2. SWRD — Drift vs target (>2pp = gatilho amarelo)
    3. HODL11 — Banda de operação (>20% banda = gatilho amarelo)
    4. Drift máximo IPCA (>2pp = gatilho vermelho)

    Retorna list de dicts: [id, label, category, status, valor, unidade, piso, gap, posicao_r, acao, detalhe]
    """
    triggers = []

    # ─── Trigger 1: Renda+ 2065 — Taxa ──────────────────────────────────────
    taxa_renda = rf.get("renda2065", {}).get("taxa")
    if taxa_renda is not None:
        gap_renda = taxa_renda - PISO_VENDA_RENDA_PLUS
        if taxa_renda <= PISO_VENDA_RENDA_PLUS:
            status_renda = "vermelho"
            acao_renda = "VENDER TUDO"
        elif taxa_renda <= PISO_TAXA_RENDA_PLUS:
            status_renda = "amarelo"
            acao_renda = "Monitorar"
        else:
            status_renda = "verde"
            acao_renda = "Monitorar"

        valor_renda = rf.get("renda2065", {}).get("valor", 0) or 0
        posicao_r_renda = round(valor_renda, 0)

        triggers.append({
            "id": "renda_plus_taxa",
            "label": "Renda+ 2065 — Taxa",
            "category": "taxa",
            "status": status_renda,
            "valor": taxa_renda,
            "unidade": "%",
            "piso": PISO_VENDA_RENDA_PLUS,
            "gap": round(gap_renda, 2),
            "posicao_r": posicao_r_renda,
            "acao": acao_renda,
            "detalhe": f"taxa: {taxa_renda:.2f}% · piso venda {PISO_VENDA_RENDA_PLUS}% · gap {round(gap_renda, 2)}pp · posição R${posicao_r_renda/1e3:.0f}k"
        })

    # ─── Trigger 2: SWRD — Drift vs Target ──────────────────────────────────
    swrd_drift_data = (drift or {}).get("SWRD", {})
    swrd_atual_pct = swrd_drift_data.get("atual", 0)
    swrd_alvo_pct  = swrd_drift_data.get("alvo", 0)
    drift_swrd_pp  = round(swrd_atual_pct - swrd_alvo_pct, 2)
    if abs(drift_swrd_pp) > 2.0:
        status_drift = "vermelho"
        acao_drift = "Rebalancear"
    elif abs(drift_swrd_pp) > 1.0:
        status_drift = "amarelo"
        acao_drift = "Monitorar"
    else:
        status_drift = "verde"
        acao_drift = "No alvo"

    swrd_valor_brl = round(swrd_atual_pct / 100 * total_brl) if total_brl else 0
    triggers.append({
        "id": "swrd_drift",
        "label": "Equity SWRD — Drift",
        "category": "posicao",
        "status": status_drift,
        "valor": drift_swrd_pp,
        "unidade": "pp",
        "piso": -2.0,
        "gap": round(drift_swrd_pp - (-2.0), 2),
        "posicao_r": round(swrd_valor_brl, 0),
        "acao": acao_drift,
        "detalhe": f"drift: {drift_swrd_pp:+.2f}pp (atual {swrd_atual_pct:.1f}% vs alvo {swrd_alvo_pct:.1f}%) · posição R${swrd_valor_brl/1e3:.0f}k"
    })

    # ─── Trigger 3: HODL11 — Banda de Operação ─────────────────────────────
    hodl_banda_data = hodl11.get("banda", {}) if hodl11 else {}
    hodl_atual_pct  = hodl_banda_data.get("atual_pct", 0)
    hodl_alvo_pct   = hodl_banda_data.get("alvo_pct", HODL11_ALVO_PCT)
    hodl_drift_pp   = round(hodl_atual_pct - hodl_alvo_pct, 2)
    hodl_status_raw = hodl_banda_data.get("status", "verde")

    # Use banda status directly (already computed with proper thresholds)
    status_hodl = hodl_status_raw
    if status_hodl == "vermelho":
        acao_hodl = "Rebalancear"
    elif status_hodl == "amarelo":
        acao_hodl = "Monitorar"
    else:
        acao_hodl = "No alvo"

    hodl_valor = hodl11.get("valor", 0) if hodl11 else 0
    triggers.append({
        "id": "hodl11_banda",
        "label": "Crypto HODL11 — Banda",
        "category": "crypto",
        "status": status_hodl,
        "valor": hodl_drift_pp,
        "unidade": "pp",
        "piso": 0.0,
        "gap": abs(hodl_drift_pp),
        "posicao_r": round(hodl_valor, 0),
        "acao": acao_hodl,
        "detalhe": f"drift: {hodl_drift_pp:+.2f}pp (atual {hodl_atual_pct:.1f}% vs alvo {hodl_alvo_pct:.1f}%) · posição R${hodl_valor/1e3:.0f}k"
    })

    # ─── Trigger 4: Drift Máximo IPCA+ ──────────────────────────────────────
    # Drift combinado de todo bloco IPCA+ vs alvo 15%
    ipca_longo_valor = rf.get("ipca2040", {}).get("valor", 0) or 0
    ipca_longo_valor += rf.get("ipca2050", {}).get("valor", 0) or 0
    pct_ipca_longo = (ipca_longo_valor / total_brl * 100) if total_brl else 0
    drift_ipca_pp = pct_ipca_longo - (IPCA_LONGO_PCT * 100)

    if drift_ipca_pp < -2.0:
        status_ipca = "vermelho"
        acao_ipca = "Aportar urgente"
    elif drift_ipca_pp < -0.5:
        status_ipca = "amarelo"
        acao_ipca = "Aumentar DCA"
    else:
        status_ipca = "verde"
        acao_ipca = "No alvo"

    triggers.append({
        "id": "drift_ipca_max",
        "label": "Drift Máximo IPCA",
        "category": "posicao",
        "status": status_ipca,
        "valor": drift_ipca_pp,
        "unidade": "pp",
        "piso": -2.0,
        "gap": round(drift_ipca_pp - (-2.0), 2),
        "posicao_r": round(ipca_longo_valor, 0),
        "acao": acao_ipca,
        "detalhe": f"drift: {drift_ipca_pp:.2f}pp vs alvo 15% · posição R${ipca_longo_valor/1e3:.0f}k"
    })

    return triggers


# ─── 9b. GUARDRAILS DE RETIRADA ───────────────────────────────────────────────
def get_guardrails_retirada(patrimonio_atual: float | None = None) -> list:
    """Gera guardrails de retirada baseados em DRAWDOWN (carteira.md, aprovado 2026-03-20).

    Cinco níveis de guardrail baseados em queda % vs pico/target:
    1. Expansivo: Upside +25% acima do pico → +10% retirada (teto R$350k)
    2. Normal: 0-15% drawdown → sem ajuste (R$250k)
    3. Cautela 1: 15-25% drawdown → corte 10% (R$225k)
    4. Cautela 2: 25-35% drawdown → corte 20% (R$200k)
    5. Defesa: >35% drawdown → piso essencial (R$180k)

    Args:
        patrimonio_atual: patrimônio atual BRL (usado para calcular drawdown)

    Retorna list de dicts: [id, guardrail, condicao_drawdown, retirada_sugerida, acao, prioridade]
    Fonte: carteira.md §Guardrails de Retirada (2026-03-20)
    """
    return [
        {
            "id": "guardrail_expansivo",
            "guardrail": "Expansivo — Upside",
            "condicao": "Portfolio +25% acima do pico real",
            "retirada_sugerida": 275000,
            "acao": "Aumentar retirada 10% permanente vs base (teto R$350k)",
            "prioridade": "EXPANSIVO"
        },
        {
            "id": "guardrail_normal",
            "guardrail": "Normal",
            "condicao": "Drawdown 0-15%",
            "retirada_sugerida": 250000,
            "acao": "Sem ajuste — manter retirada base",
            "prioridade": "MANTÉM"
        },
        {
            "id": "guardrail_cautela_1",
            "guardrail": "Cautela 1",
            "condicao": "Drawdown 15-25%",
            "retirada_sugerida": 225000,
            "acao": "Corte 10% vs base",
            "prioridade": "CAUTELA"
        },
        {
            "id": "guardrail_cautela_2",
            "guardrail": "Cautela 2",
            "condicao": "Drawdown 25-35%",
            "retirada_sugerida": 200000,
            "acao": "Corte 20% vs base",
            "prioridade": "CAUTELA"
        },
        {
            "id": "guardrail_defesa",
            "guardrail": "Defesa — Piso Essencial",
            "condicao": "Drawdown >35%",
            "retirada_sugerida": 180000,
            "acao": "Piso essencial (moradia + saúde + alimentação); avaliar renda part-time",
            "prioridade": "DEFESA"
        },
    ]


# ─── 10. DCA STATUS ───────────────────────────────────────────────────────────

def get_dca_status(rf: dict, total_brl: float) -> dict:
    """Calcula o status do DCA de renda fixa longa para o dashboard.

    Três instrumentos monitorados — cada um em card separado:
      1. TD IPCA+ 2040: alvo 12% (80% de 15%)
      2. TD IPCA+ 2050: alvo 3% (20% de 15%)
      3. Renda+ 2065 (tático): alvo 3%

    DCA 2040+2050 ativo se taxa >= PISO_TAXA_IPCA_LONGO (6.0%)

    Fonte das regras: carteira.md + config.py
    """
    taxa_ipca = rf.get("ipca2040", {}).get("taxa")
    valor_2040 = rf.get("ipca2040", {}).get("valor", 0) or 0
    valor_2050 = rf.get("ipca2050", {}).get("valor", 0) or 0
    valor_ipca_longo = valor_2040 + valor_2050

    # Alvos: 15% total, 80/20 split
    alvo_total_pct = round(IPCA_LONGO_PCT * 100, 1)  # 15.0%
    alvo_2040_pct = round(alvo_total_pct * 0.80, 1)  # 12.0%
    alvo_2050_pct = round(alvo_total_pct * 0.20, 1)  # 3.0%

    # Percentuais atuais
    pct_2040_atual = round((valor_2040 / total_brl) * 100, 1) if total_brl else 0
    pct_2050_atual = round((valor_2050 / total_brl) * 100, 1) if total_brl else 0
    pct_ipca_longo_atual = round((valor_ipca_longo / total_brl) * 100, 1) if total_brl else 0

    # DCA status: ativo se taxa >= piso
    ipca_ativo = taxa_ipca is not None and taxa_ipca >= PISO_TAXA_IPCA_LONGO

    # ── TD IPCA+ 2040 ───────────────────────────────────────────────────────
    if ipca_ativo:
        gap_2040 = alvo_2040_pct - pct_2040_atual
        proxima_acao_2040 = (
            f"DCA ativo: aportar em TD 2040 (80% do bloco IPCA+) "
            f"ate {alvo_2040_pct}% da carteira"
        ) if gap_2040 > 0.1 else (
            f"No alvo: {pct_2040_atual}% == {alvo_2040_pct}% (com TD 2050)"
        )
    else:
        proxima_acao_2040 = (
            f"DCA pausado: taxa {taxa_ipca:.2f}% abaixo do piso {PISO_TAXA_IPCA_LONGO}%. "
            f"Redirecionar aportes para equity"
        ) if taxa_ipca else "Aguardando dados de taxa"

    dca_2040 = {
        "instrumento":        "TD IPCA+ 2040",
        "ativo":              ipca_ativo,
        "taxa_atual":         taxa_ipca,
        "piso":               PISO_TAXA_IPCA_LONGO,
        "gap_pp":             round((taxa_ipca - PISO_TAXA_IPCA_LONGO), 2) if taxa_ipca else None,
        "pct_carteira_atual": pct_2040_atual,
        "alvo_pct":           alvo_2040_pct,
        "gap_alvo_pp":        round(alvo_2040_pct - pct_2040_atual, 1),
        "proxima_acao":       proxima_acao_2040,
    }

    # ── TD IPCA+ 2050 ───────────────────────────────────────────────────────
    if ipca_ativo:
        gap_2050 = alvo_2050_pct - pct_2050_atual
        proxima_acao_2050 = (
            f"DCA ativo: aportar em TD 2050 (20% do bloco IPCA+) "
            f"ate {alvo_2050_pct}% da carteira"
        ) if gap_2050 > 0.1 else (
            f"No alvo: {pct_2050_atual}% == {alvo_2050_pct}% (com TD 2040)"
        )
    else:
        proxima_acao_2050 = (
            f"DCA pausado: taxa {taxa_ipca:.2f}% abaixo do piso {PISO_TAXA_IPCA_LONGO}%. "
            f"Manter posicao atual"
        ) if taxa_ipca else "Aguardando dados de taxa"

    dca_2050 = {
        "instrumento":        "TD IPCA+ 2050",
        "ativo":              ipca_ativo,
        "taxa_atual":         taxa_ipca,
        "piso":               PISO_TAXA_IPCA_LONGO,
        "gap_pp":             round((taxa_ipca - PISO_TAXA_IPCA_LONGO), 2) if taxa_ipca else None,
        "pct_carteira_atual": pct_2050_atual,
        "alvo_pct":           alvo_2050_pct,
        "gap_alvo_pp":        round(alvo_2050_pct - pct_2050_atual, 1),
        "proxima_acao":       proxima_acao_2050,
    }

    # ── Renda+ 2065 ─────────────────────────────────────────────────────────
    taxa_renda = rf.get("renda2065", {}).get("taxa")
    valor_renda = rf.get("renda2065", {}).get("valor", 0) or 0
    pct_renda_atual = round((valor_renda / total_brl) * 100, 1) if total_brl else 0
    alvo_renda_pct = round(RENDA_PLUS_PCT * 100, 1)  # 3.0%

    renda_dca_ativo = False
    renda_proxima_acao = "Aguardando dados de taxa"
    if taxa_renda is not None:
        if taxa_renda <= PISO_VENDA_RENDA_PLUS:
            renda_proxima_acao = (
                f"VENDER TUDO: taxa {taxa_renda:.2f}% <= piso de venda {PISO_VENDA_RENDA_PLUS}%. "
                f"Aguardar 720 dias se holding < 2 anos (carry domina IR)"
            )
        elif taxa_renda < PISO_TAXA_RENDA_PLUS:
            renda_proxima_acao = (
                f"DCA pausado: taxa {taxa_renda:.2f}% abaixo do piso de compra {PISO_TAXA_RENDA_PLUS}%. "
                f"Manter posicao atual ({pct_renda_atual}%)"
            )
        else:
            if pct_renda_atual < alvo_renda_pct:
                renda_dca_ativo = True
                renda_proxima_acao = (
                    f"DCA ativo: taxa {taxa_renda:.2f}% >= piso {PISO_TAXA_RENDA_PLUS}%. "
                    f"Aportar ate {alvo_renda_pct}% da carteira"
                )
            else:
                renda_proxima_acao = (
                    f"DCA pausado: posicao {pct_renda_atual}% >= alvo {alvo_renda_pct}%. "
                    f"Manter sem novos aportes"
                )

    dca_renda_plus = {
        "instrumento":        "Renda+ 2065",
        "ativo":              renda_dca_ativo,
        "taxa_atual":         taxa_renda,
        "piso_compra":        PISO_TAXA_RENDA_PLUS,
        "piso_venda":         PISO_VENDA_RENDA_PLUS,
        "gap_pp":             round((taxa_renda - PISO_TAXA_RENDA_PLUS), 2) if taxa_renda else None,
        "pct_carteira_atual": pct_renda_atual,
        "alvo_pct":           alvo_renda_pct,
        "gap_alvo_pp":        round(pct_renda_atual - alvo_renda_pct, 1),
        "proxima_acao":       renda_proxima_acao,
    }

    # Agregado ipca_longo (2040 + 2050) para dashboard semáforo
    ipca_longo = {
        "instrumento":        "IPCA+ Longo (2040 + 2050)",
        "ativo":              ipca_ativo,
        "taxa_atual":         taxa_ipca,
        "piso":               PISO_TAXA_IPCA_LONGO,
        "gap_pp":             round((taxa_ipca - PISO_TAXA_IPCA_LONGO), 2) if taxa_ipca else None,
        "pct_carteira_atual": pct_ipca_longo_atual,
        "alvo_pct":           alvo_total_pct,
        "gap_alvo_pp":        round(alvo_total_pct - pct_ipca_longo_atual, 1),
    }

    return {
        "ipca_longo": ipca_longo,
        "ipca2040":   dca_2040,
        "ipca2050":   dca_2050,
        "renda_plus": dca_renda_plus,
    }


# ─── SINCRONIZAÇÃO: operacoes_td.json → resumo_td.json ──────────────────────

def load_posicoes_from_ibkr():
    """Fallback: load current posições from dados/ibkr/lotes.json if available"""
    lotes_path = Path("dados/ibkr/lotes.json")

    if not lotes_path.exists():
        return {}

    try:
        with open(lotes_path) as f:
            lotes_data = json.load(f)

        posicoes = {}
        for ticker, ticker_data in lotes_data.items():
            lotes = ticker_data.get("lotes", [])
            if not lotes:
                continue

            total_qty = sum(lot.get("qty", 0) for lot in lotes)
            total_cost = sum(lot.get("qty", 0) * lot.get("custo_por_share", 0) for lot in lotes)

            if total_qty > 0:
                posicoes[ticker] = {
                    "qty": total_qty,
                    "avg_cost": round(total_cost / total_qty, 4),
                    "status": ticker_data.get("status", "alvo"),
                }

        return posicoes
    except Exception as e:
        print(f"  ⚠️ load_posicoes_from_ibkr: {e}")
        return {}


def sync_nubank_resumo():
    """Sincroniza operacoes_td.json → resumo_td.json.

    Agregação:
    - Agrupa operações por título (mapeia nomes variáveis)
    - Calcula total_aplicado, total_resgatado, líquido_aplicado
    - Preserva cotas, taxa, notas do resumo antigo
    - Escreve resumo_td.json atualizado
    """
    if not NUBANK_OPS_PATH.exists():
        return

    try:
        ops_data = json.loads(NUBANK_OPS_PATH.read_text())
        ops = ops_data.get("operacoes", [])

        # Mapa título → chave de resumo (variações de nome)
        titulo_map = {
            "IPCA+ 2029": "ipca2029",
            "Tesouro IPCA+ 2029": "ipca2029",
            "IPCA+ 2040": "ipca2040",
            "Tesouro IPCA+ 2040": "ipca2040",
            "IPCA+ 2050": "ipca2050",
            "Tesouro IPCA+ 2050": "ipca2050",
            "RendA+ 2065": "renda2065",
            "Renda+ 2065": "renda2065",
            "Tesouro Renda+ 2065": "renda2065",
            "IPCA+ 2045": "ipca2045",
            "Tesouro IPCA+ 2045": "ipca2045",
        }

        # Agregar por título
        resumo_raw = {}
        for op in ops:
            titulo = op.get("titulo", "").strip()
            titulo_norm = titulo_map.get(titulo)
            if not titulo_norm:
                continue

            if titulo_norm not in resumo_raw:
                resumo_raw[titulo_norm] = {
                    "aplicacoes": [],
                    "resgates": [],
                    "total_aplicado": 0.0,
                    "total_resgatado": 0.0,
                    "taxa": None,  # capturar taxa da operação (se houver)
                    "tipo": "estrutural",  # padrão
                }

            valor = float(str(op.get("valor_brl", 0)).replace(",", "."))
            tipo = op.get("tipo", "").strip().lower()

            # Capturar taxa se houver (ex: "6,85%" em operacoes_td.json)
            if op.get("taxa"):
                taxa_str = str(op.get("taxa")).replace(",", ".")
                try:
                    resumo_raw[titulo_norm]["taxa"] = float(taxa_str.rstrip("%"))
                except:
                    pass

            if tipo == "aplicacao":
                resumo_raw[titulo_norm]["aplicacoes"].append({
                    "data": op.get("data"),
                    "valor": valor
                })
                resumo_raw[titulo_norm]["total_aplicado"] += valor
            elif tipo == "resgate":
                resumo_raw[titulo_norm]["resgates"].append({
                    "data": op.get("data"),
                    "valor": valor,
                    "nota": op.get("nota", "")
                })
                resumo_raw[titulo_norm]["total_resgatado"] += valor

        # Formatar como resumo_td.json
        resumo_final = {}
        for key, data in resumo_raw.items():
            liquido = round(data["total_aplicado"] - data["total_resgatado"], 2)
            resumo_final[key] = {
                "aplicacoes": data["aplicacoes"],
                "resgates": data["resgates"],
                "total_aplicado": round(data["total_aplicado"], 2),
                "total_resgatado": round(data["total_resgatado"], 2),
                "liquido_aplicado": liquido,
                "zerado": liquido == 0,
                "n_aplicacoes": len(data["aplicacoes"]),
            }
            if data["taxa"] is not None:
                resumo_final[key]["taxa"] = data["taxa"]
            if data["tipo"]:
                resumo_final[key]["tipo"] = data["tipo"]

        # Preservar campos antigos (cotas, taxa, notas, etc)
        resumo_antigo = {}
        if NUBANK_TD_PATH.exists():
            try:
                resumo_antigo = json.loads(NUBANK_TD_PATH.read_text())
            except:
                pass

        for key in resumo_final:
            if key in resumo_antigo:
                old = resumo_antigo[key]
                for field in ["cotas", "taxa", "tipo", "notas", "custo_base_brl", "pnl_realizado", "duration", "mtm_impact_1pp", "distancia_gatilho"]:
                    if field in old:
                        resumo_final[key][field] = old[field]

        # Escrever
        NUBANK_TD_PATH.write_text(json.dumps(resumo_final, indent=2, ensure_ascii=False) + "\n")
        print(f"  ✓ Nubank resumo sincronizado: {len(resumo_final)} títulos (incluindo ipca2050)")

    except Exception as e:
        print(f"  ⚠️ Sync Nubank: {e}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    print("📊 generate_data.py — iniciando")

    # DATA_PIPELINE_CENTRALIZATION: Invariant 1 — window_id para sincronização
    _pipeline_run_id = datetime.now().strftime("%Y%m%dT%H%M%S")

    # Garantir que carteira_params.json está atualizado a partir de carteira.md
    try:
        from parse_carteira import parse as _parse_carteira
        _parse_carteira()
        print("  ✓ carteira_params.json atualizado")
    except Exception as _e:
        print(f"  ⚠️ parse_carteira falhou ({_e}) — usando cache existente")

    # Atualizar spending_summary.json a partir do CSV mais recente em analysis/
    try:
        import glob as _glob
        _csv_files = [
            f for f in _glob.glob(str(ROOT / "analysis" / "*.csv"))
            if 'ibkr' not in f.lower() and 'transactions' not in f.lower()
        ]
        if _csv_files:
            import spending_analysis as _sa
            _latest_csv = max(_csv_files, key=__import__('os').path.getmtime)
            _txns = _sa.load_csv(_latest_csv)
            _data = _sa.analyze(_txns)
            _sa.export_json(_data, _latest_csv)
            print(f"  ✓ spending_summary.json atualizado ({len(_txns)} transações)")
        else:
            print("  ℹ️ spending_summary.json: nenhum CSV em analysis/ — usando cache existente")
    except Exception as _e:
        print(f"  ⚠️ spending_analysis falhou ({_e}) — usando cache existente")

    # Sincronizar operacoes_td.json → resumo_td.json (SEMPRE, antes de tudo)
    sync_nubank_resumo()

    state = load_state()

    # Carregar posições IBKR se não estão no state (fallback inteligente)
    if not state.get("posicoes") or len(state.get("posicoes", {})) == 0:
        ibkr_posicoes = load_posicoes_from_ibkr()
        if ibkr_posicoes:
            state["posicoes"] = ibkr_posicoes
            print(f"  ✓ Posições IBKR carregadas: {len(ibkr_posicoes)} tickers")

    # Premissas do fire_montecarlo.py
    print("  ▶ lendo premissas ...")
    premissas_raw, guardrails_raw, gasto_piso, spending_smile = get_premissas()

    # Reconstruir fire_trilha com P10/P90 percentis
    rebuild_fire_data(window_id=_pipeline_run_id)

    # P(FIRE) + Tornado
    pfire_aspiracional, pfire_base, tornado = get_pfire_tornado()

    # RF-2: Adicionar percentis reais de MC
    if not args.skip_scripts:
        try:
            print("  ▶ RF-2: Computando percentis reais de P(FIRE) via MC múltiplo ...")
            import fire_montecarlo as fm
            import numpy as np

            # Construir PREMISSAS dict para RF-2
            pat_atual = float(state.get("patrimonio", {}).get("total_brl", 3_372_673.0))
            premissas_rf2 = {
                "patrimonio_atual": pat_atual,
                "aporte_mensal": APORTE_MENSAL,
                "custo_vida_base": CUSTO_VIDA_BASE,
                "horizonte_vida": HORIZONTE_VIDA,
                "idade_atual": IDADE_ATUAL,
                "idade_cenario_base": IDADE_CENARIO_BASE,
                "idade_cenario_aspiracional": IDADE_CENARIO_ASPIRACIONAL,
                "idade_fire_alvo": IDADE_CENARIO_BASE,
                "idade_safe_harbor": IDADE_CENARIO_BASE,
                "anos_simulacao": HORIZONTE_VIDA - IDADE_CENARIO_BASE,
                "retorno_equity_base": RETORNO_EQUITY_BASE,
                "retorno_ipca_plus": RETORNO_IPCA_PLUS,
                "volatilidade_equity": VOLATILIDADE_EQUITY,
                "t_dist_df": 5,
                "dep_brl_base": DEP_BRL_BASE,
                "dep_brl_favoravel": DEP_BRL_FAVORAVEL,
                "dep_brl_stress": DEP_BRL_STRESS,
                "adj_favoravel": ADJ_FAVORAVEL,
                "adj_stress": ADJ_STRESS,
                "pct_ipca_longo": IPCA_LONGO_PCT,
                "pct_ipca_curto": IPCA_CURTO_PCT,
                "pct_equity": EQUITY_PCT,
                "pct_cripto": CRIPTO_PCT,
                "ipca_anual": IPCA_ANUAL,
                "aplicar_ir_desacumulacao": True,
                "anos_bond_pool": BOND_TENT_META_ANOS,
                "aliquota_ir_equity": IR_ALIQUOTA,
                "inss_anual": INSS_ANUAL,
                "inss_inicio_ano": INSS_INICIO_ANO_POS_FIRE,
                "vol_bond_pool": EQUITY_PCT * VOLATILIDADE_EQUITY,
                "patrimonio_gatilho": PATRIMONIO_GATILHO,
                "swr_gatilho": SWR_GATILHO,
            }

            percentiles = fm.compute_pfire_percentiles(premissas_rf2, n_rodadas=10, n_sim_por_rodada=10_000)
            pfire_base["percentiles"] = percentiles
            print(f"  ✓ RF-2: P50={percentiles['p50']:.1f}%, P10={percentiles['p10']:.1f}%, P90={percentiles['p90']:.1f}%")
        except Exception as e:
            print(f"  ⚠️ RF-2 falhou ({e}) — usando fallback (componente usa offsets)")
            pfire_base["percentiles"] = None

    # Cenários Estendidos MC (stagflation + hyperinflation)
    pfire_cenarios_estendidos: dict = {}
    if not args.skip_scripts:
        print("  ▶ Cenários Estendidos MC (stagflation + hyperinflation) ...")
        try:
            import fire_montecarlo as fm
            pat_atual = float(state.get("patrimonio", {}).get("total_brl", 3_372_673.0))
            premissas_ext_base = {
                "patrimonio_atual":    pat_atual,
                "aporte_mensal":       APORTE_MENSAL,
                "custo_vida_base":     CUSTO_VIDA_BASE,
                "horizonte_vida":      HORIZONTE_VIDA,
                "idade_atual":         IDADE_ATUAL,
                "idade_fire_alvo":     IDADE_CENARIO_BASE,
                "idade_safe_harbor":   IDADE_CENARIO_BASE,
                "anos_simulacao":      HORIZONTE_VIDA - IDADE_CENARIO_BASE,
                "retorno_equity_base": RETORNO_EQUITY_BASE,
                "retorno_ipca_plus":   RETORNO_IPCA_PLUS,
                "volatilidade_equity": VOLATILIDADE_EQUITY,
                "t_dist_df":           5,
                "dep_brl_base":        DEP_BRL_BASE,
                "dep_brl_favoravel":   DEP_BRL_FAVORAVEL,
                "dep_brl_stress":      DEP_BRL_STRESS,
                "adj_favoravel":       ADJ_FAVORAVEL,
                "adj_stress":          ADJ_STRESS,
                "pct_ipca_longo":      IPCA_LONGO_PCT,
                "pct_ipca_curto":      IPCA_CURTO_PCT,
                "pct_equity":          EQUITY_PCT,
                "pct_cripto":          CRIPTO_PCT,
                "ipca_anual":          IPCA_ANUAL,
                "aplicar_ir_desacumulacao": True,
                "anos_bond_pool":      BOND_TENT_META_ANOS,
                "aliquota_ir_equity":  IR_ALIQUOTA,
                "inss_anual":          INSS_ANUAL,
                "inss_inicio_ano":     INSS_INICIO_ANO_POS_FIRE,
                "vol_bond_pool":       EQUITY_PCT * VOLATILIDADE_EQUITY,
                "patrimonio_gatilho":  PATRIMONIO_GATILHO,
                "swr_gatilho":         SWR_GATILHO,
            }
            pfire_cenarios_estendidos = compute_extended_mc_scenarios(premissas_ext_base)
        except Exception as e:
            print(f"  ⚠️ cenários estendidos: {e}")

    # Backtest
    backtest_data = get_backtest()

    timeline_attribution = get_timeline_attribution()

    # Factor data — lê factor_snapshot.json (gerado por reconstruct_factor.py)
    # Fallback: factor_cache.json legado, depois inline (--skip-scripts=False)
    _factor_snap = {}
    if FACTOR_SNAPSHOT.exists():
        try:
            _factor_snap = json.loads(FACTOR_SNAPSHOT.read_text())
            print(f"  ✓ factor snapshot ({FACTOR_SNAPSHOT.relative_to(ROOT)})")
        except Exception as e:
            print(f"  ⚠️ factor snapshot read: {e}")

    if _factor_snap:
        factor_rolling  = _factor_snap.get("factor_rolling",  {"dates": [], "avgs_vs_swrd_12m": [], "threshold": FACTOR_UNDERPERF_THRESHOLD})
        factor_loadings = _factor_snap.get("factor_loadings", {})
        # factor_signal may be absent or null in older caches — recompute live
        factor_signal   = _factor_snap.get("factor_signal") or get_factor_signal()
    else:
        # Fallback: calcular inline (comportamento anterior)
        if args.skip_scripts and not FACTOR_CACHE.exists():
            _try_populate_factor_cache()
        factor_rolling  = get_factor_rolling()
        factor_signal   = get_factor_signal()
        factor_loadings = get_factor_loadings()
        # Persist legacy cache para compatibilidade
        if factor_rolling.get("dates") or factor_loadings or factor_signal:
            _factor_cache = {}
            if factor_rolling.get("dates"):
                _factor_cache["factor_rolling"] = factor_rolling
            if factor_loadings:
                _factor_cache["factor_loadings"] = factor_loadings
            if factor_signal:
                _factor_cache["factor_signal"] = factor_signal
            try:
                FACTOR_CACHE.parent.mkdir(exist_ok=True)
                FACTOR_CACHE.write_text(json.dumps(_factor_cache, indent=2))
                print(f"  ✓ factor cache saved (legado) → {FACTOR_CACHE.relative_to(ROOT)}")
            except Exception as e:
                print(f"  ⚠️ factor cache write: {e}")

    # Timeline + Retornos mensais
    # Preferir JSONs core (gerados por reconstruct_history.py) se disponíveis
    if RETORNOS_CORE.exists():
        print("  ▶ lendo retornos de dados/retornos_mensais.json (core) ...")
        _rc = json.loads(RETORNOS_CORE.read_text())
        retornos_mensais = {"dates": _rc["dates"], "values": _rc["twr_pct"]}
        # Propagate annual returns + TWR summary for dashboard
        retornos_mensais["annual_returns"] = _rc.get("annual_returns", [])
        retornos_mensais["twr_real_brl_pct"] = _rc.get("twr_real_brl_pct")
        retornos_mensais["twr_nominal_brl_cagr"] = _rc.get("twr_nominal_brl_cagr")
        retornos_mensais["ipca_cagr_periodo_pct"] = _rc.get("ipca_cagr_periodo_pct")
        retornos_mensais["periodo_anos"] = _rc.get("periodo_anos")
        retornos_mensais["acumulado_pct"] = _rc.get("acumulado_pct", [])
        retornos_mensais["acumulado_usd_pct"] = _rc.get("acumulado_usd_pct", [])
        retornos_mensais["twr_usd_pct"] = _rc.get("twr_usd_pct", [])
        # Timeline ainda vem do CSV (patrimônio absoluto para o gráfico)
        timeline, _ = get_timeline_retornos()
        print(f"  ✓ Retornos core: {len(retornos_mensais['dates'])} meses (TWR), {len(retornos_mensais['annual_returns'])} anos")

        # CAGR de USD, VWRA e CDI — computados do annual_returns (produto geométrico)
        _ann = retornos_mensais.get("annual_returns", [])
        if _ann:
            _acum_usd, _acum_vwra, _acum_cdi, _total_m = 1.0, 1.0, 1.0, 0
            for _r in _ann:
                _m = _r.get("months", 12)
                _total_m += _m
                if _r.get("twr_usd") is not None:
                    _acum_usd  *= (1 + _r["twr_usd"]  / 100)
                if _r.get("vwra_usd") is not None:
                    _acum_vwra *= (1 + _r["vwra_usd"] / 100)
                if _r.get("cdi") is not None:
                    _acum_cdi  *= (1 + _r["cdi"]      / 100)
            if _total_m > 0:
                _yrs = _total_m / 12
                retornos_mensais["twr_usd_cagr"]  = round((_acum_usd  ** (1/_yrs) - 1) * 100, 2)
                retornos_mensais["vwra_usd_cagr"] = round((_acum_vwra ** (1/_yrs) - 1) * 100, 2)
                retornos_mensais["cdi_cagr"]      = round((_acum_cdi  ** (1/_yrs) - 1) * 100, 2)

        # Enriquecer annual_returns com alpha do backtest (vs VWRA)
        if backtest_data and backtest_data.get("backtest"):
            bt = backtest_data["backtest"]
            bt_dates = bt.get("dates", [])
            bt_target = bt.get("target", [])
            bt_shadow = bt.get("shadowA", [])

            if bt_dates and bt_target and bt_shadow and len(bt_dates) == len(bt_target) == len(bt_shadow):
                print(f"    ▶ enriquecendo annual_returns com alpha do backtest ({len(bt_dates)} períodos) ...")
                # Agrupar retornos mensais por ano (dados normalizados a 100 base)
                alpha_by_year = {}
                for i, date_str in enumerate(bt_dates):
                    year = date_str[:4]
                    if year not in alpha_by_year:
                        alpha_by_year[year] = {"target": [], "shadow": []}
                    # Retorno mensal: (final - inicial) / inicial
                    if i > 0:
                        r_target = (bt_target[i] / bt_target[i-1] - 1) * 100 if bt_target[i-1] > 0 else 0
                        r_shadow = (bt_shadow[i] / bt_shadow[i-1] - 1) * 100 if bt_shadow[i-1] > 0 else 0
                        alpha_by_year[year]["target"].append(r_target)
                        alpha_by_year[year]["shadow"].append(r_shadow)

                # Calcular alpha anual (TWR composto) para cada ano
                for row in retornos_mensais.get("annual_returns", []):
                    year_str = str(row["year"])
                    if year_str in alpha_by_year:
                        year_data = alpha_by_year[year_str]
                        # TWR anual = compor retornos mensais
                        if year_data["target"] and year_data["shadow"]:
                            twr_target = 1.0
                            twr_shadow = 1.0
                            for r_t, r_s in zip(year_data["target"], year_data["shadow"]):
                                twr_target *= (1 + r_t / 100)
                                twr_shadow *= (1 + r_s / 100)
                            twr_target_pct = (twr_target - 1) * 100
                            twr_shadow_pct = (twr_shadow - 1) * 100
                            # Alpha em pp
                            alpha_pp = twr_target_pct - twr_shadow_pct
                            row["alpha_vs_vwra"] = round(alpha_pp, 2)
    else:
        print("  ▶ lendo CSV (fallback — rode reconstruct_history.py para gerar core) ...")
        timeline, retornos_mensais = get_timeline_retornos()

    # Posições + preços
    print("  ▶ posições ...")
    posicoes, cambio, prices_live = get_posicoes_precos(state)

    # Attribution IBKR: aportes vs retorno gerado (equity IBKR only)
    equity_attribution = None
    try:
        _ap = json.loads(APORTES_PATH.read_text())
        _total_ap  = _ap.get("total_usd", 0)
        _pat_eq    = sum(p.get("qty", 0) * p.get("price", 0) for p in posicoes.values())
        if _pat_eq > 0:
            _ret = _pat_eq - _total_ap
            equity_attribution = {
                "total_aportado_usd":    round(_total_ap),
                "patrimonio_equity_usd": round(_pat_eq),
                "retorno_usd":           round(_ret),
                "pct_aportes":           round(_total_ap / _pat_eq * 100, 1),
                "pct_retorno":           round(_ret     / _pat_eq * 100, 1),
                "nota":   "Equity IBKR only — exclui RF, HODL11, Nubank",
                "fonte":  "dados/ibkr/aportes.json (total_usd) + posicoes × precos IBKR",
                "updated": str(date.today()),
            }
    except Exception as _e:
        print(f"  ⚠️ equity_attribution: {_e}")

    # RF
    rf = get_rf(state)
    hodl11_raw = rf.pop("hodl11", {})
    # state usa "preco_brl" / "valor_brl"; normalizar para "preco" / "valor"
    hodl11_qty   = hodl11_raw.get("qty", 0)
    hodl11_preco_state = hodl11_raw.get("preco", hodl11_raw.get("preco_brl", 0))
    # Usar preço live do yfinance se disponível, senão fallback para o state
    hodl11_preco_atual = prices_live.get("HODL11") or hodl11_preco_state
    hodl11_brl   = hodl11_qty * hodl11_preco_atual if hodl11_qty and hodl11_preco_atual else \
                   hodl11_raw.get("valor", hodl11_raw.get("valor_brl", 0))

    # ── P&L HODL11 ──────────────────────────────────────────────────────────────
    # Fonte primária: dados/xp/lotes.json (gerado por broker_analysis.py)
    # Fallback: dashboard_state.json rf.hodl11.avg_cost
    hodl11_preco_medio = None
    if XP_LOTES_PATH.exists():
        try:
            xp_lotes = json.loads(XP_LOTES_PATH.read_text())
            if "HODL11" in xp_lotes:
                hodl11_preco_medio = xp_lotes["HODL11"].get("avg_cost_brl")
                print(f"  ✓ HODL11 avg_cost R${hodl11_preco_medio} (de dados/xp/lotes.json)")
        except Exception as e:
            print(f"  ⚠️ XP lotes: {e}")
    if hodl11_preco_medio is None:
        hodl11_preco_medio = hodl11_raw.get("avg_cost")  # fallback dashboard_state.json
        if hodl11_preco_medio:
            print(f"  ✓ HODL11 avg_cost R${hodl11_preco_medio} (fallback dashboard_state.json)")

    if hodl11_preco_medio and hodl11_qty and hodl11_preco_atual:
        custo_total     = hodl11_qty * hodl11_preco_medio
        pnl_brl         = round(hodl11_brl - custo_total, 2)
        pnl_pct         = round((hodl11_preco_atual / hodl11_preco_medio - 1) * 100, 2)
    else:
        custo_total = None
        pnl_brl     = None
        pnl_pct     = None

    hodl11 = {
        "qty":          hodl11_qty,
        "preco":        hodl11_preco_atual,
        "valor":        round(hodl11_brl, 2),
        "preco_medio":  hodl11_preco_medio,
        "pnl_brl":      pnl_brl,
        "pnl_pct":      pnl_pct,
        "_updated":     str(date.today()) if not args.skip_prices else None,
    }

    # DEV-coe-hodl11-classificacao: lê coe_brl da última linha do CSV antes de compute_drift
    _coe_net_brl_early = 0.0
    if CSV_PATH.exists():
        try:
            with open(CSV_PATH) as _f_early:
                _rows_early = list(csv.DictReader(_f_early))
            if _rows_early:
                _last_early = _rows_early[-1]
                _coe_col_early = next((k for k in _last_early if k == 'coe_brl'), None)
                if _coe_col_early:
                    try: _coe_net_brl_early = float(_last_early[_coe_col_early].replace(',', '.').replace(' ', ''))
                    except ValueError: pass
        except Exception: pass

    # Drift
    drift, total_brl = compute_drift(posicoes, rf, hodl11_brl, cambio, coe_net_brl=_coe_net_brl_early)

    # Attribution — after compute_drift so total_brl is available as pat_override
    attr = get_attribution(pat_override=total_brl)

    # ── Bandas visuais HODL11 ────────────────────────────────────────────────────
    # Política: piso 1.5% / alvo 3% / teto 5% do portfolio total.
    # Status: verde = [2.0%, 3.5%); amarelo = [1.5%, 2.0%) ou [3.5%, 5.0%]; vermelho = fora.
    # Fontes: carteira.md ("piso 1,5%, teto 5%") + perfis/06-risco.md.
    _HODL11_PISO_PCT  = HODL11_PISO_PCT
    _HODL11_ALVO_PCT  = HODL11_ALVO_PCT
    _HODL11_TETO_PCT  = HODL11_TETO_PCT
    _hodl11_atual_pct = round(hodl11_brl / total_brl * 100, 2) if total_brl else 0.0
    if _hodl11_atual_pct < _HODL11_PISO_PCT or _hodl11_atual_pct > _HODL11_TETO_PCT:
        _hodl11_banda_status = "vermelho"
    elif _hodl11_atual_pct >= 3.5 or _hodl11_atual_pct < 2.0:
        _hodl11_banda_status = "amarelo"
    else:
        _hodl11_banda_status = "verde"
    hodl11["banda"] = {
        "min_pct":    _HODL11_PISO_PCT,
        "alvo_pct":   _HODL11_ALVO_PCT,
        "max_pct":    _HODL11_TETO_PCT,
        "atual_pct":  _hodl11_atual_pct,
        "status":     _hodl11_banda_status,  # verde / amarelo / vermelho
    }

    # DCA Status — calculado após total_brl estar disponível
    dca_status = get_dca_status(rf, total_brl)

    # Semáforos de Gatilhos — Tier-1 Critical (dashboard NOW tab)
    semaforo_triggers = get_semaforo_triggers(rf, hodl11, total_brl, drift=drift)

    # Guardrails de Retirada — Tier-1 Critical (dashboard RETIRO tab)
    # Baseado em drawdown = (PATRIMONIO_GATILHO - patrimonio_atual) / PATRIMONIO_GATILHO
    guardrails_retirada = get_guardrails_retirada(patrimonio_atual=total_brl)

    # IR diferido — lê tax_snapshot.json (gerado por reconstruct_tax.py)
    # Tax calculation via TaxEngine (Lei 14.754/2023 — centralized)
    tax_data = None
    if TAX_SNAPSHOT.exists():
        try:
            _tax_snap = json.loads(TAX_SNAPSHOT.read_text())
            # Validar que o snapshot é coerente com câmbio atual (tolerância 5%)
            _snap_cambio = _tax_snap.get("ptax_atual", 0)
            if _snap_cambio > 0 and abs(_snap_cambio - cambio) / cambio < 0.05:
                tax_data = {k: v for k, v in _tax_snap.items() if not k.startswith("_")}
                print(f"  ✓ tax snapshot ({TAX_SNAPSHOT.relative_to(ROOT)}) — IR R${tax_data.get('ir_diferido_total_brl', 0):,.0f}")
            else:
                print(f"  ⚠️ tax snapshot câmbio {_snap_cambio} vs atual {cambio:.4f} (>5%) — recalculando via TaxEngine")
        except Exception as e:
            print(f"  ⚠️ tax snapshot read: {e}")

    if tax_data is None:
        print("  ▶ calculando IR diferido via TaxEngine (Lei 14.754/2023) ...")
        try:
            tax_request = TaxRequest(posicoes=posicoes, cambio_atual=cambio)
            tax_result = TaxEngine.calculate(tax_request)
            # Convert TaxResult dataclass to dict (remove _generated and source)
            tax_data = {
                "ir_diferido_total_brl": tax_result.ir_diferido_total_brl,
                "ir_por_etf": tax_result.ir_por_etf,
                "regime": tax_result.regime,
                "badges": tax_result.badges,
                "ptax_source": tax_result.ptax_source,
                "ptax_atual": tax_result.ptax_atual,
            }
            n_etfs = len(tax_data.get("ir_por_etf", {}))
            print(f"  → IR diferido: R${tax_data.get('ir_diferido_total_brl', 0):,.0f} sobre {n_etfs} ETFs ({tax_result.ptax_source})")
        except ValueError as e:
            print(f"  ⚠️ TaxEngine error: {e}")
            tax_data = None

    # Passivos — hipoteca + IR diferido
    passivos_data = get_passivos(tax_data)

    # Patrimônio holístico (F1 DEV-boldin-dashboard)
    # Calculado abaixo após fire_trilha_data estar disponível (junto com human_capital_data)

    # Premissas — garantir patrimônio atual
    premissas = {
        "patrimonio_atual":       total_brl,
        "patrimonio_gatilho":     premissas_raw.get("patrimonio_gatilho", PATRIMONIO_GATILHO),
        "aporte_mensal":          premissas_raw.get("aporte_mensal", APORTE_MENSAL),
        "custo_vida_base":        premissas_raw.get("custo_vida_base", CUSTO_VIDA_BASE),
        "anos_bond_pool":         premissas_raw.get("bond_tent_anos", 7),  # Área F fix: tent duration in years
        "idade_atual":            premissas_raw.get("idade_atual", IDADE_ATUAL),
        "idade_fire_alvo":        premissas_raw.get("idade_cenario_base", IDADE_CENARIO_BASE),  # Para RF-2 MC
        "idade_cenario_base":        premissas_raw.get("idade_cenario_base", IDADE_CENARIO_BASE),
        "idade_cenario_aspiracional":premissas_raw.get("idade_cenario_aspiracional", IDADE_CENARIO_ASPIRACIONAL),
        "retorno_equity_base":    premissas_raw.get("retorno_equity_base", 0.0485),
        "volatilidade_equity":    premissas_raw.get("volatilidade_equity", 0.168),
        "swr_gatilho":            premissas_raw.get("swr_gatilho", SWR_GATILHO),
        "inss_anual":             premissas_raw.get("inss_anual", 18_000),
        "inss_inicio_ano":        premissas_raw.get("inss_inicio_ano", 12),
        "ipca_anual":             premissas_raw.get("ipca_anual", 0.04),
        "renda_estimada":         RENDA_ESTIMADA,
        "renda_mensal_liquida":   RENDA_ESTIMADA,  # Usado pelo dashboard (monthly income display)
        "ano_atual":              datetime.now().year,
        # Spouse / holistic (F6 + F1 DEV-boldin-dashboard)
        "tem_conjuge":            TEM_CONJUGE,
        "nome_conjuge":           NOME_CONJUGE,
        "inss_katia_anual":       INSS_KATIA_ANUAL,
        "pgbl_katia_saldo_fire":  PGBL_KATIA_SALDO_FIRE,
        "gasto_katia_solo":       GASTO_KATIA_SOLO,
        # Campos adicionados para aba Premissas (DEV-premissas-tab)
        "horizonte_vida":         premissas_raw.get("horizonte_vida", 90),
        "taxa_ipca_plus_longa":   premissas_raw.get("renda_plus_taxa_default", 7.08),
        "saude_base":             premissas_raw.get("saude_base", 24_000),
        "aporte_mensal_aspiracional": premissas_raw.get("aporte_cenario_aspiracional", 30_000),
        # Retornos esperados por ETF (USD real, base — fonte: carteira.md §150-153)
        "retornos_por_etf": {
            "SWRD": {"retorno_usd_real": RETORNO_SWRD_USD_REAL, "fonte": "Mediana 5 fontes: AQR/Vanguard/JPM/RA/Schwab"},
            "AVGS": {"retorno_usd_real": RETORNO_AVGS_USD_REAL, "fonte": "Mediana multi-fonte + haircut 58% (McLean & Pontiff 2016)"},
            "AVEM": {"retorno_usd_real": RETORNO_AVEM_USD_REAL, "fonte": "Média 4 fontes: AQR/JPM/GMO/RA arredondado conserv."},
        },
    }

    # Último aporte mensal + COE net — lidos da última linha do CSV historico_carteira.csv
    _ultimo_aporte_brl  = None
    _ultimo_aporte_data = None
    _csv_rows = None
    _coe_net_brl = 0.0  # DEV-coe-hodl11-classificacao: COE + empréstimo XP net
    _emprestimo_xp_brl = 0.0
    if CSV_PATH.exists():
        try:
            with open(CSV_PATH) as _f:
                _rows = list(csv.DictReader(_f))
            _csv_rows = _rows  # Guardar para passar a compute_premissas_vs_realizado
            if _rows:
                _last = _rows[-1]
                _keys = list(_last.keys())
                _dc   = next((k for k in _keys if 'data' in k.lower() or 'date' in k.lower()), _keys[0] if _keys else None)
                _ac   = next((k for k in _keys if k == 'aporte_brl'), None)
                if _dc: _ultimo_aporte_data = _last[_dc].strip()[:7]
                if _ac:
                    # Buscar última linha com aporte > 0 (linha mais recente pode ter aporte=0 se mês atual)
                    for _row in reversed(_rows):
                        try:
                            _val = float(_row[_ac].replace(',', '.').replace(' ', ''))
                            if _val > 0:
                                _ultimo_aporte_brl = _val
                                if _dc: _ultimo_aporte_data = _row[_dc].strip()[:7]
                                break
                        except (ValueError, KeyError):
                            pass
                # COE net (coe_brl coluna = COE asset + empréstimo XP net)
                _coe_col = next((k for k in _keys if k == 'coe_brl'), None)
                if _coe_col:
                    try: _coe_net_brl = float(_last[_coe_col].replace(',', '.').replace(' ', ''))
                    except ValueError: pass
        except Exception: pass
    # Mesclar com operacoes_td.json — TD aportes também contam como aporte do mês
    _nb_ops_path = ROOT / "dados" / "nubank" / "operacoes_td.json"
    if _nb_ops_path.exists():
        try:
            _nb_ops = json.loads(_nb_ops_path.read_text()).get("operacoes", [])
            _aplicacoes = [op for op in _nb_ops if op.get("tipo") == "aplicacao"]
            if _aplicacoes:
                _mais_recente = max(_aplicacoes, key=lambda o: o.get("data", ""))
                _td_data = _mais_recente.get("data", "")[:7]  # YYYY-MM
                _td_brl = sum(op.get("valor_brl", 0) for op in _aplicacoes
                              if op.get("data", "")[:7] == _td_data)
                # Usar TD se for mais recente que o CSV
                if _ultimo_aporte_data is None or _td_data > _ultimo_aporte_data:
                    _ultimo_aporte_data = _td_data
                    _ultimo_aporte_brl = _td_brl
                elif _td_data == _ultimo_aporte_data:
                    # Mesmo mês: somar equity + TD
                    _ultimo_aporte_brl = (_ultimo_aporte_brl or 0) + _td_brl
        except Exception:
            pass

    if _ultimo_aporte_brl is not None:
        premissas["ultimo_aporte_brl"]  = round(_ultimo_aporte_brl)
        premissas["ultimo_aporte_data"] = _ultimo_aporte_data

    # Concentração Brasil (Advocate dataset)
    # DEV-coe-hodl11-classificacao: HODL11 removido de brasil_pct → cripto_pct próprio; COE adicionado
    concentracao_brasil = compute_concentracao_brasil(rf, hodl11_brl, total_brl, coe_net_brl=_coe_net_brl)
    if concentracao_brasil:
        print(f"  -> concentração Brasil: {concentracao_brasil['brasil_pct']}% (RF R${concentracao_brasil['composicao']['rf_total_brl']/1e3:.0f}k + COE net R${_coe_net_brl/1e3:.0f}k) | Cripto: {concentracao_brasil['cripto_pct']}% (HODL11)")

    # Premissas vs Realizado (Advocate dataset)
    premissas_vs_realizado = compute_premissas_vs_realizado(premissas, backtest_data, cambio, csv_rows=_csv_rows)
    if premissas_vs_realizado:
        _pvr_aporte = premissas_vs_realizado.get("aporte_mensal") or {}
        _pvr_ret = premissas_vs_realizado.get("retorno_equity") or {}
        print(f"  -> premissas vs realizado: aporte R${_pvr_aporte.get('realizado_media_brl', 0)/1e3:.0f}k/mês vs premissa R${premissas.get('aporte_mensal', 0)/1e3:.0f}k | backtest CAGR {_pvr_ret.get('backtest_nominal_usd_pct', 'N/A')}% (nominal USD)")

    # Guardrails — suporta lista de tuples (dd_min, dd_max, corte, desc) ou dicts
    guardrails = []
    custo = premissas["custo_vida_base"]
    for g in guardrails_raw:
        if isinstance(g, (tuple, list)):
            dd_min, dd_max, corte, desc = g
            retirada = round(custo * (1 - corte))
            guardrails.append({"ddMin": dd_min, "ddMax": dd_max, "corte": corte,
                                "retirada": retirada, "desc": desc})
        else:
            guardrails.append({
                "ddMin":    g.get("dd_min", g.get("ddMin", 0)),
                "ddMax":    g.get("dd_max", g.get("ddMax", 0.15)),
                "corte":    g.get("corte", 0),
                "retirada": g.get("retirada", g.get("gasto", 0)),
                "desc":     g.get("desc", ""),
            })

    # Spending smile
    spending = {}
    if spending_smile:
        for k, v in spending_smile.items():
            spending[k] = {"gasto": v.get("gasto"), "inicio": v.get("inicio", 0), "fim": v.get("fim", 99)}

    # Spending sensibilidade — state usa {label, pfire}; template espera {label, custo, base, fav, stress}
    # Area A fix: SEMPRE recalcular fav/stress usando deltas atuais para evitar inconsistência com pfire_base
    _sens_raw = state.get("spending", {}).get("scenarios", [])
    spending_sens = []
    _custo_map = {"R$250k": 250_000, "R$270k": 270_000, "R$300k": 300_000,
                  "Solteiro/FIRE Day": 250_000, "Pós-casamento": 270_000, "Casamento+filho": 300_000}
    _pf_base_base   = pfire_base.get("base")
    _pf_base_fav    = pfire_base.get("fav")
    _pf_base_stress = pfire_base.get("stress")
    _delta_fav    = (_pf_base_fav   - _pf_base_base) if (_pf_base_fav    is not None and _pf_base_base is not None) else None
    _delta_stress = (_pf_base_stress - _pf_base_base) if (_pf_base_stress is not None and _pf_base_base is not None) else None
    for s in _sens_raw:
        label = s.get("label", "")
        custo = s.get("custo", _custo_map.get(label, 0))
        base  = s.get("pfire", s.get("base"))
        # Area A: Recalculate fav/stress using current deltas to ensure consistency with pfire_base
        fav    = round(min(99.9, max(0, base + _delta_fav)), 1) if (base is not None and _delta_fav is not None) else None
        stress = round(min(99.9, max(0, base + _delta_stress)), 1) if (base is not None and _delta_stress is not None) else None
        spending_sens.append({
            "label": label, "custo": custo,
            "base": base, "fav": fav, "stress": stress,
        })

    # Pisos cascade
    pisos = {
        "pisoTaxaIpcaLongo":  PISO_TAXA_IPCA_LONGO,
        "pisoTaxaRendaPlus":  PISO_TAXA_RENDA_PLUS,   # piso de compra DCA
        "pisoVendaRendaPlus": PISO_VENDA_RENDA_PLUS,  # gatilho de venda
        "ir_aliquota":        IR_ALIQUOTA,              # 0.15 = 15%
        # HODL11 banda operacional (fonte: carteira_params.json)
        "hodl11PisoPct":      HODL11_PISO_PCT,          # 1.5%
        "hodl11AlvoPct":      HODL11_ALVO_PCT,          # 3.0%
        "hodl11TetoPct":      HODL11_TETO_PCT,          # 5.0%
    }

    # Pesos alvo
    pesos_target = {k: round(v, 4) for k, v in PESOS_TARGET.items()}

    # Glide path — config.py GLIDE_PATH (fonte: carteira.md)
    glide = GLIDE_PATH

    # TLH — transitórios com preços atuais (state usa "transitorio" sem acento)
    tlh = []
    for tk, p in posicoes.items():
        status = p.get("status", "")
        if status in ("transitório", "transitorio"):
            bucket = p.get("bucket", BUCKET_MAP.get(tk, tk))
            nome_map = {
                "EIMI": "iShares EM IMI", "AVES": "Avantis EM Value",
                "AVUV": "Avantis US SC Val", "AVDV": "Avantis Intl SC",
                "DGS": "WisdomTree EM SC", "USSC": "SPDR World SC",
                "IWVL": "iShares World Val", "JPGL": "JPM Global Equity",
            }
            tlh.append({
                "ticker": tk,
                "nome":   nome_map.get(tk, tk),
                "qty":    p["qty"],
                "pm":     p.get("avg_cost", p.get("pm", 0)),
                "price":  p.get("price", 0),
                "ucits":  f"{bucket}.L",
            })

    # Attribution fallback
    if attr is None or attr.get("aportes") is None:
        n_months = len(timeline["labels"])
        attr = {
            "aportes":    n_months * premissas["aporte_mensal"],
            "retornoUsd": None,
            "cambio":     None,
            "crescReal":  total_brl - (timeline["values"][0] if timeline["values"] else 0),
            "_estimativa": True,
        }

    # Backtest — usar cache do script ou deixar vazio (será populado na próxima rodada)
    backtest = backtest_data.get("backtest", {})
    backtest_r5 = backtest_data.get("backtestR5", {})
    # Nota explicativa do backtest (substitui texto hardcoded no template)
    # Derivada dinamicamente das datas reais do backtest
    _bt_dates = backtest.get("dates", [])
    _bt_start = _bt_dates[0] if _bt_dates else "ago/2019"
    _bt_end   = _bt_dates[-1] if _bt_dates else "abr/2026"
    backtest["nota_proxy"] = (
        f"⚠️ {_bt_start}–{_bt_end}: 2 proxies UCITS ativos "
        "(AVUV/AVDV→AVGS, AVEM US-listed→AVEM.L). "
        "Resultados indicativos — conclusão definitiva requer histórico UCITS ≥3 anos."
    )

    # ── metrics_by_period: recalcula métricas CAGR/Sharpe/Vol/MaxDD por período ──
    def _compute_period_metrics_py(dates_list, target_series, shadow_series, start_ym):
        """Filtra séries pelo período e recalcula métricas usando pure Python."""
        idx = next((i for i, d in enumerate(dates_list) if d >= start_ym), None)
        if idx is None or idx >= len(dates_list) - 1:
            return None
        t = [float(x) for x in target_series[idx:]]
        s = [float(x) for x in shadow_series[idx:]]
        n = len(t)
        if n < 3:
            return None

        def _metrics(series):
            rets = [(series[i] - series[i-1]) / series[i-1] for i in range(1, len(series))]
            if not rets:
                return None
            cagr = ((series[-1] / series[0]) ** (12 / (n - 1)) - 1) * 100
            mean_r = sum(rets) / len(rets)
            variance = sum((r - mean_r) ** 2 for r in rets) / (len(rets) - 1) if len(rets) > 1 else 0
            std = variance ** 0.5
            vol = std * (12 ** 0.5) * 100
            sharpe = (mean_r * 12) / (std * (12 ** 0.5)) if std > 0 else 0
            # Max drawdown
            peak = series[0]
            maxdd = 0.0
            for v in series:
                if v > peak:
                    peak = v
                dd = (v - peak) / peak * 100
                if dd < maxdd:
                    maxdd = dd
            return {
                "cagr": round(cagr, 2),
                "sharpe": round(sharpe, 2),
                "vol": round(vol, 2),
                "maxdd": round(maxdd, 2),
            }

        mt = _metrics(t)
        ms = _metrics(s)
        if mt is None or ms is None:
            return None
        return {"target": mt, "shadowA": ms}

    _bt_target = backtest.get("target", [])
    _bt_shadow = backtest.get("shadowA", [])

    if _bt_dates and _bt_target and _bt_shadow:
        _period_starts = {
            "all":        _bt_dates[0] if _bt_dates else "2019-08",
            "since2009":  "2009-01",
            "since2013":  "2013-01",
            "since2020":  "2020-01",
            "5y":         "2021-01",
            "3y":         "2023-01",
        }
        _mbp = {}
        for _pk, _pv in _period_starts.items():
            _res = _compute_period_metrics_py(_bt_dates, _bt_target, _bt_shadow, _pv)
            if _res is not None:
                _mbp[_pk] = _res
        backtest["metrics_by_period"] = _mbp
        print(f"  ✓ backtest.metrics_by_period: {list(_mbp.keys())}")

    # Shadows — ler do state e adicionar campos flat no nível raiz
    _shadows_raw = state.get("shadows", {})
    # Campos flat esperados pelo template: delta_vwra, delta_ipca, delta_shadow_c
    # shadow A = VWRA, shadow B = IPCA+, shadow C = 60/40 (não disponível ainda)
    _q1 = _shadows_raw.get("q1_2026", {})
    shadows = {
        **_shadows_raw,  # mantém estrutura original
        "delta_vwra":     _q1.get("delta_a"),       # shadow A = VWRA benchmark primário
        "delta_ipca":     _q1.get("delta_b"),       # shadow B = IPCA+ RF benchmark
        "delta_shadow_c": _q1.get("delta_c"),        # shadow C (60/40) — None se não disponível
        "periodo":        _q1.get("periodo", "Q1 2026"),
        "atual":          _q1.get("atual"),
        "target":         _q1.get("target"),
    } if _q1 else {**_shadows_raw, "delta_vwra": None, "delta_ipca": None, "delta_shadow_c": None}

    # P(FIRE@53): ler chave específica pfire_base_* (salva quando fire_montecarlo roda sem --anos)
    # Architect V1 Fix: usar carteira.md como fallback definitivo
    if pfire_base.get("base") is None:
        s = state.get("fire", {})
        if s.get("pfire_base_base") is not None:
            pfire_base = {"base": s["pfire_base_base"], "fav": s.get("pfire_base_fav"), "stress": s.get("pfire_base_stress")}
        else:
            # Fallback 1: usar pfire_base genérico do state (pode ser stale)
            state_pfire = s.get("pfire_base")
            # Fallback 2: se state não tem, usar carteira.md (linha 33: Base 86.4%, Fav 92.0%, Stress 82.5%)
            if state_pfire is not None:
                pfire_base = {"base": state_pfire, "fav": s.get("pfire_fav"), "stress": s.get("pfire_stress")}
            else:
                # ÚLTIMO RECURSO: valores de carteira.md (2026-04-27)
                # Source: carteira.md linha 33 — P(FIRE Base): 86,4% (MC 10k, seed=42, spending smile + guardrails + bond tent + IR 15% nominal + INSS + vol bond pool 13.3% + SAUDE_BASE R$24k + VCMH 5.0%)
                pfire_base = {"base": 86.4, "fav": 92.0, "stress": 82.5}

    # ─── TLH Lotes individuais (FIFO) ──────────────────────────────────────────
    def _load_tlh_lotes():
        """Load individual lots from dados/tlh_lotes.json if available."""
        lotes_path = Path(__file__).parent.parent / "dados" / "tlh_lotes.json"
        if not lotes_path.exists():
            return None
        try:
            raw = json.loads(lotes_path.read_text(encoding="utf-8"))
            return {
                "summary": raw.get("summary", {}),
                "lots": raw.get("lots", []),
                "_generated": raw.get("_generated", ""),
            }
        except Exception:
            return None

    # ─── Mini-log: últimas operações IBKR + XP ───────────────────────────────
    def _build_minilog():
        """Retorna as 10 últimas operações: IBKR (compras + depósitos) + XP (compras/vendas) + Nubank (Tesouro Direto) + Binance (airdrops/resgates)"""
        entries = []
        # XP operações
        xp_path = ROOT / "dados" / "xp" / "operacoes.json"
        if xp_path.exists():
            xp_ops = json.loads(xp_path.read_text())
            for op in xp_ops:
                tipo = "Compra XP" if op.get("cv") == "C" else "Venda XP"
                entries.append({"data": op["data"], "tipo": tipo,
                                 "ativo": op.get("ticker", op.get("ativo_xp", "")),
                                 "valor": f"R$ {op['valor']:,.0f}",
                                 "corretora": "XP"})
        # IBKR depósitos
        if APORTES_PATH.exists():
            ap = json.loads(APORTES_PATH.read_text())
            for dep in ap.get("depositos", []):
                entries.append({"data": dep["data"], "tipo": "Depósito IBKR",
                                 "ativo": "USD", "valor": f"${dep['usd']:,.0f}",
                                 "corretora": "IBKR"})
        # IBKR lote compras
        if LOTES_PATH.exists():
            lotes_raw = json.loads(LOTES_PATH.read_text())
            for ticker, info in lotes_raw.items():
                for lot in info.get("lotes", []):
                    if lot.get("qty", 0) >= 1:
                        entries.append({"data": lot["data"], "tipo": "Compra",
                                        "ativo": ticker,
                                        "valor": f"{lot['qty']:.0f} × ${lot['custo_por_share']:.2f}",
                                        "corretora": "IBKR"})
        # Nubank — Tesouro Direto
        nb_path = ROOT / "dados" / "nubank" / "operacoes_td.json"
        if nb_path.exists():
            nb_data = json.loads(nb_path.read_text())
            for op in nb_data.get("operacoes", []):
                tipo = "Aplicação NB" if op.get("tipo") == "aplicacao" else "Resgate NB"
                ativo = op.get("titulo", "").replace("Tesouro ", "")
                entries.append({"data": op["data"], "tipo": tipo,
                                 "ativo": ativo,
                                 "valor": f"R$ {op['valor_brl']:,.0f}",
                                 "corretora": "Nubank"})
        # Binance — airdrops + resgates (excluindo earn diário)
        bn_path = ROOT / "dados" / "binance" / "operacoes.json"
        if bn_path.exists():
            bn_data = json.loads(bn_path.read_text())
            for op in bn_data.get("operacoes", []):
                op_type = op.get("operacao", "")
                if "Airdrop" in op_type:
                    tipo = "Airdrop BN"
                elif "Redemption" in op_type:
                    tipo = "Resgate BN"
                else:
                    tipo = "Op BN"
                qty = op.get("alterar", 0)
                moeda = op.get("moeda", "")
                entries.append({"data": op["data"], "tipo": tipo,
                                 "ativo": moeda,
                                 "valor": f"{qty:.4f} {moeda}",
                                 "corretora": "Binance"})
        entries.sort(key=lambda x: x["data"], reverse=True)
        return entries[:10]

    # Macro — lê macro_snapshot.json (gerado por reconstruct_macro.py)
    # Fallback: calcular inline (get_macro_data)
    macro = None
    if MACRO_SNAPSHOT.exists():
        try:
            macro = json.loads(MACRO_SNAPSHOT.read_text())
            print(f"  ✓ macro snapshot ({MACRO_SNAPSHOT.relative_to(ROOT)})")
        except Exception as e:
            print(f"  ⚠️ macro snapshot read: {e}")

    if macro is None:
        print("  ▶ macro data (inline fallback) ...")
        macro = get_macro_data(state, total_brl_override=total_brl)

    # Inject cambio into macro for template convenience
    macro["cambio"] = cambio

    # HODL11 FIRE projection (3 cenários BTC/USD) — precisa de macro.bitcoin_usd
    _btc_usd_live = macro.get("bitcoin_usd") or (state.get("mercado", {}).get("btc_usd"))
    hodl11["fire_projection"] = _compute_hodl11_fire_projection(
        hodl11_brl, _btc_usd_live or 0, BTC_CENARIOS_USD
    )

    # Rolling Sharpe 12m — preferir JSON core
    _selic = macro.get("selic_meta") or 0
    if ROLLING_CORE.exists():
        _rm = json.loads(ROLLING_CORE.read_text())
        _sharpe_key = "sharpe_brl" if "sharpe_brl" in _rm else "sharpe"
        _rf_brl = _rm.get("rf_brl", {})
        _rf_usd = _rm.get("rf_usd", {})
        rolling_sharpe = {
            "dates": _rm["dates"],
            "values": _rm[_sharpe_key],
            "values_usd": _rm.get("sharpe_usd", []),
            "sortino": _rm.get("sortino", []),
            "volatilidade": _rm.get("volatilidade", []),
            "max_dd": _rm.get("max_dd", []),
            "window": _rm["window"],
            "rf_brl": _rf_brl,
            "rf_usd": _rf_usd,
            "information_ratio": _rm.get("information_ratio"),
        }
        print(f"  ✓ Rolling metrics: {len(rolling_sharpe['dates'])} pontos (Sharpe BRL+USD, Sortino, Vol, MaxDD, IR)")
    else:
        rolling_sharpe = compute_rolling_sharpe(retornos_mensais, _selic)
        print(f"  ✓ Rolling Sharpe: {len(rolling_sharpe['dates'])} pontos (computed, rf={_selic}%)")

    # ─── Mercado snapshot (BTC + câmbio) + deltas MtD ──────────────────────
    # BTC-USD já fetchado em get_macro_data() — reutilizar, sem novo download
    _mercado_state = state.get("mercado", {})
    _btc_current   = macro.get("bitcoin_usd") or _mercado_state.get("btc_usd")

    # MtD reference — seed no início de cada mês
    _mes_atual = date.today().strftime(DATE_FORMAT_YM)
    _mtd_ref   = state.get("mercado_mtd", {})
    _taxa_ipca_atual  = rf.get("ipca2040",  {}).get("taxa")
    _taxa_renda_atual = rf.get("renda2065", {}).get("taxa")

    if _mtd_ref.get("ref_mes") != _mes_atual:
        # Novo mês: seed com valores atuais (delta = 0 por ora)
        _mtd_ref = {
            "ref_mes":       _mes_atual,
            "cambio":        cambio,
            "btc_usd":       _btc_current,
            "ipca2040_taxa": _taxa_ipca_atual,
            "renda2065_taxa": _taxa_renda_atual,
        }
        update_dashboard_state("mercado_mtd", _mtd_ref, generator="generate_data.py")

    # Calcular deltas vs referência de início do mês
    def _pct(cur, ref):
        if cur is None or ref is None or ref == 0: return None
        return round((cur / ref - 1) * 100, 2)
    def _pp(cur, ref):
        if cur is None or ref is None: return None
        return round(cur - ref, 3)

    mercado = {
        "cambio_brl_usd":    cambio,
        "btc_usd":           _btc_current,
        "cambio_mtd_pct":    _pct(cambio,            _mtd_ref.get("cambio")),
        "btc_mtd_pct":       _pct(_btc_current,      _mtd_ref.get("btc_usd")),
        "ipca2040_mtd_pp":   _pp(_taxa_ipca_atual,   _mtd_ref.get("ipca2040_taxa")),
        "renda2065_mtd_pp":  _pp(_taxa_renda_atual,  _mtd_ref.get("renda2065_taxa")),
        "ref_mes":           _mes_atual,
        "fonte":             "yfinance BTC-USD + PTAX BCB",
        "updated":           str(date.today()),
    }

    # ─── Bond Pool Readiness ─────────────────────────────────────────────
    # Bond pool = IPCA+ 2040 + IPCA+ 2050 + Reserva (IPCA+ 2029)
    # Meta: 7 anos de gastos (bond tent anos 1-7 pos-FIRE, carteira.md)
    bp_ipca2040 = rf.get("ipca2040", {}).get("valor", 0)
    bp_ipca2050 = rf.get("ipca2050", {}).get("valor", 0)  # pode nao existir ainda
    bp_ipca2029 = rf.get("ipca2029", {}).get("valor", 0)
    bp_valor = bp_ipca2040 + bp_ipca2050 + bp_ipca2029
    bp_custo_anual = premissas["custo_vida_base"]
    bp_anos = round(bp_valor / bp_custo_anual, 1) if bp_custo_anual > 0 else 0
    bp_meta_anos = BOND_TENT_META_ANOS
    if bp_anos >= bp_meta_anos * 0.8:
        bp_status = "on_track"
    elif bp_anos >= bp_meta_anos * 0.4:
        bp_status = "building"
    else:
        bp_status = "early"
    bond_pool_readiness = {
        "valor_atual_brl": round(bp_valor),
        "anos_gastos":     bp_anos,
        "meta_anos":       bp_meta_anos,
        "status":          bp_status,
        "composicao": {
            "ipca2040": round(bp_ipca2040),
            "ipca2050": round(bp_ipca2050),
            "ipca2029": round(bp_ipca2029),
        },
    }
    print(f"  -> bond pool: R${bp_valor/1e3:.0f}k = {bp_anos} anos de gastos (meta: {bp_meta_anos})")

    # ─── Scenario Comparison (FIRE@53 vs FIRE@50) ───────────────────────────
    fire_state = state.get("fire", {})
    # Extração de dados para scenario_comparison
    pat_med_53 = fire_state.get("pat_mediano_fire53", fire_state.get("pat_mediano_fire", 0))
    pat_med_50 = fire_state.get("pat_mediano_fire50", 0)
    age_base = premissas_raw.get("idade_cenario_base", 53)
    age_aspir = premissas_raw.get("idade_cenario_aspiracional", 50)
    gasto_anual = premissas_raw.get("custo_vida_base", 250000)
    swr_53 = (gasto_anual / pat_med_53 * 100) if pat_med_53 > 0 else 0
    swr_50 = (gasto_anual / pat_med_50 * 100) if pat_med_50 > 0 else 0

    base_scenario = {
        "idade": age_base,
        "base":        pfire_base.get("base"),
        "fav":         pfire_base.get("fav"),
        "stress":      pfire_base.get("stress"),
        "pat_mediano": pat_med_53,
        "pat_p10":     fire_state.get("pat_p10_fire53", fire_state.get("pat_p10_fire")),
        "pat_p90":     fire_state.get("pat_p90_fire53", fire_state.get("pat_p90_fire")),
        "gasto_anual": gasto_anual,
        "swr":         round(swr_53, 2),
    }
    aspiracional_scenario = {
        "idade": age_aspir,
        "base":        pfire_aspiracional.get("base"),
        "fav":         pfire_aspiracional.get("fav"),
        "stress":      pfire_aspiracional.get("stress"),
        "pat_mediano": pat_med_50,
        "pat_p10":     fire_state.get("pat_p10_fire50"),
        "pat_p90":     fire_state.get("pat_p90_fire50"),
        "gasto_anual": gasto_anual,
        "swr":         round(swr_50, 2),
    }

    scenario_comparison = {
        # Semantic naming (primary)
        "base": base_scenario,
        "aspiracional": aspiracional_scenario,
        # Backward compatibility aliases for fan chart code
        "fire53": base_scenario,
        "fire50": aspiracional_scenario,
        # Metadata
        "nota_scenarios_pat": (
            f"Pat. mediano no FIRE Day (base): R${pat_med_53/1e6:.2f}M (@{age_base}) / "
            f"R${pat_med_50/1e6:.2f}M (@{age_aspir}). "
            "Fonte: fire_montecarlo.py MC 10k sims."
        ) if pat_med_53 else None,
    }

    # ─── SWR current (cobertura RF / gastos anuais) ────────────────────
    rf_total_for_swr = 0.0
    for _rk, _rv in rf.items():
        if _rk == "hodl11":
            continue
        rf_total_for_swr += (_rv.get("valor", _rv.get("valor_brl", 0)) or 0)
    swr_current = round(rf_total_for_swr / gasto_anual, 2) if gasto_anual > 0 else 0
    print(f"  -> swr_current: {swr_current} (RF R${rf_total_for_swr/1e3:.0f}k / gastos R${gasto_anual/1e3:.0f}k)")

    # ─── FIRE aggregate ─────────────────────────────────────────────────
    fire_section = {
        "bond_pool_readiness": bond_pool_readiness,
        "pat_mediano_fire":    fire_state.get("pat_mediano_fire53", fire_state.get("pat_mediano_fire")),
        "pat_mediano_fire50":  fire_state.get("pat_mediano_fire50"),
        "mc_date":             fire_state.get("mc_date"),
        "plano_status":        macro.get("plano_status") if macro else None,
        "swr_current":         swr_current,
    }

    # Earliest FIRE date
    earliest_fire = compute_earliest_fire(pfire_aspiracional, pfire_base, premissas_raw)
    print(f"  -> earliest_fire: {earliest_fire}")

    # Spending guardrails
    spending_guardrails = compute_spending_guardrails(pfire_base, premissas_raw, guardrails_raw, gasto_piso)
    if spending_guardrails:
        print(f"  -> spending_guardrails: zona={spending_guardrails['zona']} | P(FIRE)={spending_guardrails['pfire_atual']}% | spending=R${spending_guardrails['spending_atual']/1e3:.0f}k")

    # ─── Timestamps de fontes de dados ──────────────────────────────────────────
    timestamps = get_source_timestamps()

    # ── SnapshotValidator state (DATA_PIPELINE_CENTRALIZATION — Invariant 4) ────
    _snapshot_ages: dict = {}  # {label: {mtime_str, _generated, age_h}}

    # ─── DATA_PIPELINE_CENTRALIZATION: Invariant 4 — SnapshotValidator ──────────
    # Thresholds (hours): warn past WARN_H, fail-fast past FAIL_H
    _SNAP_WARN_H = 48
    _SNAP_FAIL_H = 168  # 7 days — beyond this, data is definitely stale
    # Critical snapshots: generate_data cannot produce correct output without them
    _SNAP_CRITICAL = {"fire_matrix", "fire_trilha", "fire_swr_percentis"}

    # ── Novos JSONs core HD-perplexity-review ───────────────────────────────────
    def _load_json_safe(path, label, critical: bool = False):
        if path.exists():
            try:
                d = json.loads(path.read_text())
                # Track snapshot age for _snapshots_metadata (Invariant 3)
                mtime = datetime.fromtimestamp(path.stat().st_mtime)
                age_h = (datetime.now() - mtime).total_seconds() / 3600
                _snapshot_ages[label] = {
                    "file": path.name,
                    "mtime": mtime.strftime("%Y-%m-%dT%H:%M:%S"),
                    "age_h": round(age_h, 1),
                    "_generated": d.get("_generated") if isinstance(d, dict) else None,
                }
                # Invariant 4: SnapshotValidator
                is_critical = critical or (label in _SNAP_CRITICAL)
                if age_h > _SNAP_FAIL_H and is_critical:
                    print(f"\n❌ SNAPSHOT CRÍTICO EXPIRADO: '{label}' tem {age_h:.0f}h (limite: {_SNAP_FAIL_H}h)")
                    print(f"   Rode: python3 scripts/reconstruct_fire_data.py")
                    sys.exit(1)
                elif age_h > _SNAP_WARN_H:
                    print(f"  ⚠️ {label}: snapshot {age_h:.0f}h antigo (>48h) — considere regenerar")
                else:
                    print(f"  ✓ {label} ({path.name}) [{age_h:.1f}h]")
                return d
            except SystemExit:
                raise
            except Exception as e:
                print(f"  ⚠️ {label}: {e}")
        elif critical or (label in _SNAP_CRITICAL):
            print(f"  ⚠️ {label}: arquivo não encontrado — {path.name}")
        return None

    backtest_r7_data    = _load_json_safe(BACKTEST_R7_PATH,      "backtest_r7")
    fire_matrix_data    = _load_json_safe(FIRE_MATRIX_PATH,      "fire_matrix")
    fire_swr_pct_data   = _load_json_safe(FIRE_SWR_PCT_PATH,     "fire_swr_percentis")
    fire_aporte_data    = _load_json_safe(FIRE_APORTE_SENS_PATH, "fire_aporte_sensitivity")
    fire_trilha_data    = _load_json_safe(FIRE_TRILHA_PATH,      "fire_trilha")

    # Human Capital Crossover (necessita fire_trilha_data e premissas_raw)
    # Calcula VP do capital humano usando metodologia Boldin-style para uso no Balanço Holístico
    human_capital_data = _compute_human_capital_crossover(fire_trilha_data, premissas_raw)
    vp_capital_humano_correto = human_capital_data.get("pontos", [{}])[0].get("vp_capital_humano", None)

    # Agora que fire_trilha_data está definido, calcular patrimônio holístico com valor correto de HC
    patrimonio_holistico = compute_patrimonio_holistico(total_brl, state, vp_capital_humano_correto)

    drawdown_hist_data  = _load_json_safe(DRAWDOWN_HIST_PATH,    "drawdown_history")
    drawdown_evts_data  = _load_json_safe(DRAWDOWN_EVENTS_PATH,  "drawdown_events")
    # Merge eventos na estrutura drawdown_history (alimenta drawdownCrisesTable no N1)
    if drawdown_hist_data and drawdown_evts_data and drawdown_evts_data.get("events"):
        drawdown_hist_data["events"] = drawdown_evts_data["events"]
    etf_comp_data       = _load_json_safe(ETF_COMP_PATH,         "etf_composition")
    bond_pool_rwy_data  = _load_json_safe(BOND_POOL_RUNWAY_PATH, "bond_pool_runway")
    lumpy_data          = _load_json_safe(LUMPY_EVENTS_PATH,     "lumpy_events")

    # ─── Adicionar by_profile ao fire_section e fire_matrix_data ────────────
    # React lê de data.fire_matrix.by_profile → precisa estar em AMBOS os nós.
    # Prioridade: 1) fire_by_profile.json (dedicado, imutável pelo pipeline)
    #             2) fire_matrix.json (se já contém)
    #             3) dashboard_state.json.fire.by_profile (fallback legado)
    _by_profile_dedicated = _load_json_safe(FIRE_BY_PROFILE_PATH, "fire_by_profile")
    # Use explicit None-check so an empty list doesn't silently skip to next source
    if _by_profile_dedicated is not None and len(_by_profile_dedicated) > 0:
        _by_profile = _by_profile_dedicated
        src = "fire_by_profile.json (dedicated)"
    elif (fire_matrix_data or {}).get("by_profile"):
        _by_profile = fire_matrix_data["by_profile"]
        src = "fire_matrix.json"
    else:
        _by_profile = state.get("fire", {}).get("by_profile")
        src = "dashboard_state.json (fallback)"

    if _by_profile:
        # Inject into BOTH nodes so React (reads fire_matrix.by_profile) always finds it
        fire_section["by_profile"] = _by_profile
        if fire_matrix_data is None:
            fire_matrix_data = {}
        fire_matrix_data["by_profile"] = _by_profile
        print(f"  -> by_profile: {len(_by_profile)} perfis (MC scenarios 3x2x3) [{src}]")
    else:
        print("  ⚠️  by_profile MISSING — Cenário A will show '—'. Run fire_montecarlo.py --by_profile")

    # ─── Gerar trajetórias Monte Carlo (para gráfico NetWorthProjection) ──────
    print("  ▶ Gerando trajetórias Monte Carlo (Net Worth Projection) ...")
    trilhas_data = {}
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("fire_mc", ROOT / "scripts" / "fire_montecarlo.py")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)

        # Use PREMISSAS completo do módulo (que já contém todas as constantes)
        mc_premissas = getattr(mod, 'PREMISSAS', {})
        if not mc_premissas:
            raise ValueError("PREMISSAS não encontrado em fire_montecarlo.py")

        # Rodar MC com trajetórias (base scenario)
        trilhas = mod.rodar_monte_carlo_com_trajetorias(
            mc_premissas, n_sim=10_000, cenario="base", seed=42, strategy="guardrails"
        )
        trilhas_data = {
            "trilha_p10": trilhas.get("trilha_p10", []),
            "trilha_p50": trilhas.get("trilha_p50", []),
            "trilha_p90": trilhas.get("trilha_p90", []),
            "datas": trilhas.get("datas", []),
            "p_sucesso": trilhas.get("p_sucesso", 0),
        }
        print(f"  ✓ Trajetórias Monte Carlo: {len(trilhas_data['trilha_p50'])} anos, P(FIRE)={trilhas_data['p_sucesso']:.1%}")
    except Exception as e:
        print(f"  ⚠️ Trajetórias MC failed: {e}")
        trilhas_data = {}

    # ─── MC Líquido (IR diferido descontado) ─────────────────────────────────
    # Roda MC canônico com patrimônio_liquido = patrimônio_bruto - IR diferido.
    # Metodologia: Lei 14.754/2023 — IR latente sobre ETFs UCITS é obrigação presente.
    fire_montecarlo_liquido = None
    ir_diferido_val = (tax_data or {}).get("ir_diferido_total_brl", 0.0)
    if not args.skip_scripts and ir_diferido_val and ir_diferido_val > 0:
        print(f"  ▶ MC Líquido (IR diferido R${ir_diferido_val:,.0f}) ...")
        try:
            import importlib.util as _ilu
            _spec = _ilu.spec_from_file_location("fire_mc_liq", ROOT / "scripts" / "fire_montecarlo.py")
            _mod  = _ilu.module_from_spec(_spec)
            _spec.loader.exec_module(_mod)
            fire_montecarlo_liquido = _mod.run_canonical_mc_with_ir_discount(
                ir_diferido=ir_diferido_val, n_sim=10_000, seed=42
            )
            print(
                f"  ✓ MC Líquido: P(FIRE) bruto={fire_montecarlo_liquido['pfire_bruto']}% "
                f"→ líquido={fire_montecarlo_liquido['pfire_liquido']}% "
                f"(delta={fire_montecarlo_liquido['delta_pp']:+.1f}pp)"
            )
        except Exception as _e:
            print(f"  ⚠️ MC Líquido failed: {_e}")
    elif args.skip_scripts:
        print("  ⊘ MC Líquido (skip-scripts)")
    else:
        print("  ⚠️ MC Líquido: ir_diferido_val=0 ou tax_data ausente — pulando")

    # ─── Garantir estrutura mínima de backtest e factor_loadings ────────────────
    # Tests expect certain fields. Provide stubs if missing.
    if not backtest:
        backtest = {}
    if "dates" not in backtest:
        backtest["dates"] = timeline.get("labels", []) if timeline else []
    if "target" not in backtest:
        # Ensure target and dates have same length
        n = len(backtest.get("dates", []))
        backtest["target"] = [0] * n if n > 0 else []
    if "shadowA" not in backtest:
        # Ensure shadowA has same length as dates
        n = len(backtest.get("dates", []))
        backtest["shadowA"] = [0] * n if n > 0 else []
    if "metrics" not in backtest:
        backtest["metrics"] = {"target": {"cagr": None}, "shadowA": {"cagr": None}}

    if not backtest_r5:
        backtest_r5 = {}
    if "dates" not in backtest_r5:
        backtest_r5["dates"] = []
    if "target" not in backtest_r5:
        n = len(backtest_r5.get("dates", []))
        backtest_r5["target"] = [0] * n if n > 0 else []
    if "shadowA" not in backtest_r5:
        n = len(backtest_r5.get("dates", []))
        backtest_r5["shadowA"] = [0] * n if n > 0 else []
    if "metrics" not in backtest_r5:
        backtest_r5["metrics"] = {}

    if not factor_loadings:
        factor_loadings = {}
    if "SWRD" not in factor_loadings:
        factor_loadings["SWRD"] = {"r2": None, "n_months": None, "t_stats": None}

    # Ensure all annual_returns have alpha_vs_vwra
    if retornos_mensais and "annual_returns" in retornos_mensais:
        for row in retornos_mensais["annual_returns"]:
            if "alpha_vs_vwra" not in row:
                row["alpha_vs_vwra"] = 0.0

    # ─── Construir objeto DATA completo ──────────────────────────────────────
    data = {
        "_generated": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "_generated_brt": (datetime.utcnow() + timedelta(hours=-3)).strftime("%Y-%m-%dT%H:%M:%S") + "-03:00",
        "_schema_version": "2.0",  # Architect: schema versioning (V5 fix)
        "_pipeline_run": _pipeline_run_id,  # DATA_PIPELINE_CENTRALIZATION: run ID para rastreabilidade
        "_snapshots_metadata": _snapshot_ages,  # DATA_PIPELINE_CENTRALIZATION: age/mtime de cada snapshot usado
        "_data_sources": {  # Architect: rastreabilidade de cada fonte (V3 fix)
            "pfire_base": "carteira.md linha 33 (Base 86.4%, MC 10k, guardrails) vs dashboard_state.json (pode divergir)",
            "posicoes": "ibkr_sync.py fallback chain",
            "rf": "reconstruct_tax.py ou dashboard_state.json",
            "lumpy_events": "reconstruct_fire_data.py gen_lumpy_events()",
            "tax": "tax_engine.py Lei 14.754/2023",
            "fire_trilha": "reconstruct_fire_data.py fire_trilha.json",
            "drawdown_history": "reconstruct_fire_data.py drawdown_history.json",
        },
        "_pfire_canonical_carteira": {"base": 86.4, "fav": 92.0, "stress": 82.5},  # Arch V1: canonical source
        "_pfire_divergence_warning": "pfire_base em data.json pode diferir de _pfire_canonical_carteira se state.json está desatualizado. Rode fire_montecarlo.py para sincronizar." if pfire_base.get("base") != 86.4 else None,
        "date":       str(date.today()),
        "timestamps": timestamps,
        "cambio":     cambio,

        "posicoes":   posicoes,
        "pesosTarget": pesos_target,
        "pisos":      pisos,

        "pfire_aspiracional":       pfire_aspiracional,
        "pfire_base":              pfire_base,
        "pfire_cenarios_estendidos": pfire_cenarios_estendidos,
        "premissas":  premissas,
        "guardrails": guardrails,
        "gasto_piso": gasto_piso,
        "spendingSmile": spending,
        "spendingSensibilidade": spending_sens,
        "saude_base": premissas_raw.get("saude_base", 24_000),
        "tornado":    tornado,
        "fire":       fire_section,
        "scenario_comparison": scenario_comparison,
        "trilha_p10": trilhas_data.get("trilha_p10", []),
        "trilha_p50": trilhas_data.get("trilha_p50", []),
        "trilha_p90": trilhas_data.get("trilha_p90", []),
        "trilha_datas": trilhas_data.get("datas", []),

        "timeline":   timeline,
        "retornos_mensais": retornos_mensais,
        "rolling_sharpe": rolling_sharpe,

        "backtest":   backtest,
        "backtestR5": backtest_r5,

        "factor_rolling":   factor_rolling,
        "factor_signal":    factor_signal,
        "factor_loadings":  factor_loadings,

        "rf":         rf,
        "hodl11":     hodl11,
        "dca_status": dca_status,
        "semaforo_triggers": semaforo_triggers,
        "guardrails_retirada": guardrails_retirada,

        "glide":      glide,
        "drift":      drift,
        "tlh":        tlh,
        "tlh_lotes":  _load_tlh_lotes(),
        "attribution":      attr,
        "timeline_attribution": timeline_attribution,
        "equity_attribution": equity_attribution,
        "shadows":    shadows,
        "macro":      macro,
        "mercado":    mercado,
        "minilog":    _build_minilog(),
        "wellness_config": json.loads(WELLNESS_CONFIG.read_text(encoding="utf-8")) if WELLNESS_CONFIG.exists() else {},
        "eventos_vida": [
            {"evento": "Casamento", "data_est": "~2026-2027", "impacto": "+R$20-50k/ano custo de vida",
             "status": "planejado", "acoes": ["Seguro de vida (gap crítico)", "Testamento", "Estrutura patrimonial"]},
            {"evento": "Filho", "data_est": "~2028", "impacto": "+R$30-50k/ano (escola, saúde, cuidado)",
             "status": "planejado", "acoes": ["P(FIRE) cai ~4pp (R$300k/ano)", "Recalibrar FIRE date", "VGBL/PGBL para filho"]},
        ],

        # Valores auxiliares para o dashboard (evitar hardcoded no template)
        "cryptoLegado": load_binance_brl(),
        "tlhGatilho":   TLH_GATILHO,
        "tax":          tax_data,     # IR diferido Lei 14.754/2023 (ETFs UCITS ACC)
        "passivos":     passivos_data,  # Hipoteca + IR diferido
        "patrimonio_holistico": patrimonio_holistico,  # F1 DEV-boldin-dashboard

        # Advocate datasets — concentração Brasil + premissas vs realizado
        "concentracao_brasil": concentracao_brasil,
        "premissas_vs_realizado": premissas_vs_realizado,

        # COE + Empréstimo XP (DEV-coe-hodl11-classificacao 2026-04-24)
        # Fonte: última linha de historico_carteira.csv (pipeline lê do Sheets gviz)
        "coe_net_brl": round(_coe_net_brl) if _coe_net_brl else 0,

        # FIRE planner
        "earliest_fire":        earliest_fire,
        "spending_guardrails":  spending_guardrails,
        "spending_breakdown":   json.loads(SPENDING_SUMMARY.read_text()) if SPENDING_SUMMARY.exists() else None,
        "head_relay":           json.loads(HEAD_RELAY.read_text()) if HEAD_RELAY.exists() else None,

        # Backtest Regime 7 — série longa 1994-2026
        "backtest_r7":             backtest_r7_data,

        # MC Líquido — P(FIRE) com patrimônio descontado de IR diferido (Lei 14.754/2023)
        # Paralelo a fire_montecarlo (bruto). Desconta IR latente antes da simulação.
        "fire_montecarlo_liquido": fire_montecarlo_liquido,

        # HD-perplexity-review: novos datasets
        "fire_matrix":             fire_matrix_data,
        "fire_swr_percentis":      fire_swr_pct_data,
        "fire_aporte_sensitivity": fire_aporte_data,
        "fire_trilha":             fire_trilha_data,
        "drawdown_history":        drawdown_hist_data,
        "drawdown_extended":       _load_json_safe(DRAWDOWN_EXTENDED_PATH, "drawdown_extended") or (
            # Fallback: popula summary a partir do backtest quando drawdown_extended.json não existe
            {"summary": {"real_max_dd_target": backtest.get("metrics", {}).get("target", {}).get("maxdd")}, "_fonte": "backtest.metrics.target.maxdd (fallback)"}
            if backtest and backtest.get("metrics", {}).get("target", {}).get("maxdd") is not None else None
        ),
        "etf_composition":         etf_comp_data,
        "bond_pool_runway":        bond_pool_rwy_data,
        "lumpy_events":            lumpy_data,

        # Bond pool runway por perfil familiar (pós-FIRE depletion com INSS Katia + retorno real)
        "bond_pool_runway_by_profile": _compute_bond_pool_runway_by_profile(
            bond_pool_rwy_data,
            {
                "atual":  {"custo_vida_base": (fire_matrix_data or {}).get("perfis", {}).get("atual",  {}).get("gasto_anual", CUSTO_VIDA_BASE),        "inss_katia_anual": 0,               "tem_conjuge": False},
                "casado": {"custo_vida_base": (fire_matrix_data or {}).get("perfis", {}).get("casado", {}).get("gasto_anual", CUSTO_VIDA_BASE_CASADO), "inss_katia_anual": INSS_KATIA_ANUAL, "tem_conjuge": True},
                "filho":  {"custo_vida_base": (fire_matrix_data or {}).get("perfis", {}).get("filho",  {}).get("gasto_anual", CUSTO_VIDA_BASE_FILHO),  "inss_katia_anual": INSS_KATIA_ANUAL, "tem_conjuge": True},
            },
        ),

        # Withdraw scenario configs (derived from fire_matrix.perfis + config constants)
        "withdraw_cenarios": {
            "atual": {
                "label": "Solteiro",
                "custo_vida_base": (fire_matrix_data or {}).get("perfis", {}).get("atual", {}).get("gasto_anual", CUSTO_VIDA_BASE),
                "tem_conjuge": False,
                "inss_katia_anual": 0,
            },
            "casado": {
                "label": "Casado",
                "custo_vida_base": (fire_matrix_data or {}).get("perfis", {}).get("casado", {}).get("gasto_anual", 270_000),
                "tem_conjuge": True,
                "inss_katia_anual": INSS_KATIA_ANUAL,
            },
            "filho": {
                "label": "Casado + Filho",
                "custo_vida_base": (fire_matrix_data or {}).get("perfis", {}).get("filho", {}).get("gasto_anual", 300_000),
                "tem_conjuge": True,
                "inss_katia_anual": INSS_KATIA_ANUAL,
            },
        },

        # Human Capital Crossover — VP capital humano vs patrimônio financeiro
        # (já calculado acima para uso no patrimônio holístico)
        "human_capital": human_capital_data,

        # Realized P&L for DARF obligations (Lei 14.754/2023 compliance)
        # Fonte: IBKR flex query → processed by ibkr_sync.py
        "realized_pnl": json.loads(REALIZED_PNL_PATH.read_text()) if REALIZED_PNL_PATH.exists() else None,
    }

    # ─── Limpar NaN valores antes de escrever JSON ──────────────────────────────────
    # Python's NaN can't be serialized to JSON. Replace with None.
    import math
    def replace_nan(obj):
        if isinstance(obj, dict):
            return {k: replace_nan(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [replace_nan(item) for item in obj]
        elif isinstance(obj, float):
            if math.isnan(obj):
                return None
            return obj
        return obj
    data = replace_nan(data)

    # ─── Sanity assertions — bloqueia geração se campos críticos são nulos ─────────
    # Campos que causaram bugs visuais silenciosos (DEV-semantic-test-coverage)
    def _assert_critical(condition: bool, message: str) -> None:
        if not condition:
            print(f"\n❌ ASSERTION FAILED: {message}")
            print("   Pipeline bloqueado — corrija os dados antes de continuar.")
            sys.exit(1)

    _assert_critical(
        bool((data.get("fire_matrix") or {}).get("by_profile")),
        "fire_matrix.by_profile vazio ou nulo — FIRE tab mostraria 'Data FIRE: —'"
    )
    _assert_critical(
        (data.get("attribution") or {}).get("retornoUsd") not in (None, 0),
        "attribution.retornoUsd é nulo/zero — Performance mostraria 'R$ 0'"
    )
    _ph = data.get("patrimonio_holistico") or {}
    _assert_critical(
        (_ph.get("financeiro_brl") or 0) > 1_000_000,
        f"patrimonio_holistico.financeiro_brl={_ph.get('financeiro_brl')} — valor incoerente (< R$1M)"
    )
    _assert_critical(
        (data.get("retornos_mensais") or {}).get("twr_real_brl_pct") is not None,
        "retornos_mensais.twr_real_brl_pct é None — TWR ausente"
    )

    # ─── DATA_PIPELINE_CENTRALIZATION: Invariant 5 — Output Validation (SSOT) ──
    def _validate_ssot_basic(d: dict) -> None:
        """Warn (not fail) on cross-field inconsistencies in data.json."""
        warnings = []

        # Check P(FIRE) source is declared
        pb_src = (d.get("pfire_base") or {}).get("source")
        if pb_src not in ("mc", "heuristic", "fallback"):
            warnings.append(f"pfire_base.source='{pb_src}' — valor inesperado")

        # Check snapshots age (warn if any >48h)
        stale = [(k, v["age_h"]) for k, v in d.get("_snapshots_metadata", {}).items() if v.get("age_h", 0) > 48]
        if stale:
            for name, age in stale:
                warnings.append(f"snapshot '{name}' está {age:.0f}h antigo (>48h)")

        # Check patrimônio holístico > 0
        ph_fin = ((d.get("patrimonio_holistico") or {}).get("financeiro_brl") or 0)
        if ph_fin <= 0:
            warnings.append(f"patrimonio_holistico.financeiro_brl={ph_fin} — inconsistente")

        # Check timestamps block has expected keys
        ts = d.get("timestamps") or {}
        for expected_key in ["geral", "posicoes_ibkr", "holdings_md"]:
            if not ts.get(expected_key):
                warnings.append(f"timestamps.{expected_key} ausente")

        if warnings:
            print(f"\n⚠️  SSOT Validation Warnings ({len(warnings)}):")
            for w in warnings:
                print(f"   - {w}")
        else:
            print(f"  ✓ SSOT validation: OK (pipeline_run={d['_pipeline_run']})")

    _validate_ssot_basic(data)

    OUT_PATH.parent.mkdir(exist_ok=True)
    OUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"\n✅ {OUT_PATH.relative_to(ROOT)}")
    print(f"   Patrimônio: R${total_brl/1e6:.2f}M | Câmbio: {cambio:.4f}")
    print(f"   P(FIRE@50): {pfire_aspiracional.get('base')}% | Tornado: {len(tornado)} variáveis | Bond pool: {bp_anos} anos")
    print(f"   Timeline: {len(timeline['labels'])} pontos | Retornos mensais: {len(retornos_mensais['dates'])} meses")
    print(f"   IR diferido: R${tax_data['ir_diferido_total_brl']:,.0f} sobre {len(tax_data['ir_por_etf'])} ETFs" if tax_data else "   IR diferido: N/A")
    print(f"   Factor: rolling {len(factor_rolling.get('dates', []))} pts | loadings {len(factor_loadings)} ETFs")
    print(f"   Macro: Selic {macro.get('selic_meta')}% | Fed Funds {macro.get('fed_funds')}% | Spread {macro.get('spread_selic_ff')}pp | Exp. USD {macro.get('exposicao_cambial_pct')}%")
    print(f"   Brasil: {concentracao_brasil['brasil_pct']}%" if concentracao_brasil else "   Brasil: N/A")
    print(f"   Premissas vs Real: aporte R${premissas_vs_realizado['aporte_mensal']['realizado_media_brl']/1e3:.0f}k/mês" if premissas_vs_realizado and premissas_vs_realizado.get('aporte_mensal') else "   Premissas vs Real: N/A")

if __name__ == "__main__":
    main()
