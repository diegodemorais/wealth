#!/usr/bin/env python3
"""
backtest_portfolio.py — Backtest de portfolio vs benchmark (VWRA)
Pergunta central: o factor tilt dos ETFs UCITS reais gerou alpha histórico?

Compara:
  - Target   : 50% SWRD + 30% AVGS + 20% AVEM (rebalanceado mensalmente, FI-equity-redistribuicao 2026-04-01)
  - Shadow A  : 100% VWRA (market cap puro)

Períodos de dados (decrescente por qualidade):
  Regime 1 — UCITS reais (Dez/2024+)         : todos os 4 ETFs alvo disponíveis
  Regime 2 — 1 proxy (Set/2024+)             : AVEM.L substituído por AVEM US-listed
  Regime 3 — 2 proxies (Jul/2019+)           : AVEM + AVGS com proxies canônicos
  Regime 4 — máx histórico ETFs (Jul/2019+)  : idem Regime 3, até hoje
  Regime 5 — proxy longo + IntlSC (Dez/2006+): ETFs US-listed + SCZ para componente Intl SC
  Regime 6 — proxy longo 21 anos (Dez/2004+) : ETFs US-listed mais antigos (IVV+VBR+EEM)
  Regime 7 — série longa 1989-2026 (proxies acadêmicos): DFSVX/DISVX/DFEMX/French EM

Proxies canônicos (agentes/referencia/proxies-canonicos.md):
  AVGS (Regimes 3/4) → AVUV 58% + AVDV 42%  (Avantis US+Intl SC Value)  ⚠️
  AVEM (Regimes 2/3/4) → AVEM (US-listed)   (mesma estratégia Avantis)  ⚠️
  SWRD (Regimes 5/6) → IVV                  (S&P 500, sem DM ex-US)     ⚠️
  AVGS (Regimes 5/6) → VBR (+SCZ no R6)     (SC Value US + Intl SC)     ⚠️
  SWRD (Regime 7) → MSCI World NR ^990100-USD-STRD                       ⚠️
  AVGS (Regime 7) → DFSVX 58% + DISVX 42% (DFA mutual funds)            ⚠️
  AVEM (Regime 7) → French EM pre-1994 + DFEMX 1994+                     ⚠️

Uso:
    python3 backtest_portfolio.py                    # regime melhor disponível
    python3 backtest_portfolio.py --regime 1         # só UCITS reais
    python3 backtest_portfolio.py --regime 4         # máximo histórico (ETFs, Jul/2019+)
    python3 backtest_portfolio.py --regime 5         # proxy longo + IntlSC 19 anos (Dez/2006+)
    python3 backtest_portfolio.py --regime 6         # proxy longo 21 anos (Dez/2004+)
    python3 backtest_portfolio.py --regime 7         # série longa 1989-2026 (proxies acadêmicos)
    python3 backtest_portfolio.py --desde 2021-01    # período customizado

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import warnings
warnings.filterwarnings("ignore")

from datetime import datetime
import yfinance as yf
import pandas as pd
import numpy as np

import sys as _sys
from pathlib import Path as _Path
_sys.path.insert(0, str(_Path(__file__).parent))
from config import EQUITY_WEIGHTS, TICKERS_YF, REGIME7_CONFIG


# ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────

PESOS_TARGET = {TICKERS_YF[k]: v for k, v in EQUITY_WEIGHTS.items()}

# Datas de inception reais (confirmadas Factor+Fact-Checker via web — 2026-03-31)
# Fonte: agentes/referencia/proxies-canonicos.md
LAUNCH = {
    "SWRD.L": "2019-02-28",
    "VWRA.L": "2019-07-23",
    "JPGL.L": "2019-07-09",
    "AVEM.L": "2024-12-09",
    "AVGS.L": "2024-09-25",
}

# Regimes: data início, tickers usados e flags de proxy
# Proxies canônicos: agentes/referencia/proxies-canonicos.md
# AVGS proxy: AVUV 58% + AVDV 42% (pesos factsheet Avantis — não otimização in-sample)
# AVEM proxy: AVEM US-listed (mesma estratégia, UCITS lançado Dez/2024)
REGIMES = {
    1: {
        "inicio": "2024-12-01",
        "label":  "Regime 1 — ETFs UCITS reais (Dez/2024+)",
        "target": {"SWRD.L": 0.50, "AVGS.L": 0.30, "AVEM.L": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": [],
    },
    2: {
        "inicio": "2024-09-01",
        "label":  "Regime 2 — 1 proxy AVEM→AVEM US (Set/2024+)",
        "target": {"SWRD.L": 0.50, "AVGS.L": 0.30, "AVEM": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": ["AVEM (US-listed) ⚠️ proxy de AVEM.L (UCITS lançado Dez/2024 — mesma estratégia Avantis)"],
    },
    3: {
        "inicio": "2019-07-01",
        "label":  "Regime 3 — 2 proxies AVGS+AVEM (Jul/2019+)",
        "target": {"SWRD.L": 0.50, "AVUV": 0.174, "AVDV": 0.126, "AVEM": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": [
            "AVUV 58% + AVDV 42% ⚠️ proxy de AVGS.L (global SC value — pesos factsheet Avantis)",
            "AVEM (US-listed) ⚠️ proxy de AVEM.L (UCITS lançado Dez/2024 — mesma estratégia Avantis)",
        ],
    },
    4: {
        "inicio": "2019-07-01",
        "label":  "Regime 4 — máximo histórico (Jul/2019+)",
        "target": {"SWRD.L": 0.50, "AVUV": 0.174, "AVDV": 0.126, "AVEM": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": [
            "AVUV 58% + AVDV 42% ⚠️ proxy de AVGS.L",
            "AVEM (US-listed) ⚠️ proxy de AVEM.L",
        ],
    },
    5: {
        "inicio": "2006-12-01",
        "label":  "Regime 5 — proxy longo + Intl SC 19 anos (Dez/2006+)",
        # Igual ao Regime 6 mas com SCZ (iShares MSCI EAFE SC, lançado Nov/2007)
        # para capturar o componente Intl SC Value do AVGS
        "target": {
            "IVV": 0.50,   # proxy SWRD.L
            "VBR": 0.174,  # proxy AVGS — US SC Value (mesmos pesos do Regime 3)
            "SCZ": 0.126,  # proxy AVGS — Intl SC (MSCI EAFE SC, sem tilt value)
            "EEM": 0.20,   # proxy AVEM.L
        },
        "shadow": {
            "IVV": 0.65,
            "EFA": 0.25,
            "EEM": 0.10,
        },
        "proxies": [
            "IVV ⚠️ proxy de SWRD.L (S&P 500 ≠ MSCI World)",
            "VBR ⚠️ proxy AVGS US-part (SC Value US only)",
            "SCZ ⚠️ proxy AVGS Intl-part (MSCI EAFE SC — sem Value tilt)",
            "EEM ⚠️ proxy de AVEM.L (MSCI EM broad)",
            "Shadow A = IVV 65% + EFA 25% + EEM 10%",
        ],
    },
    6: {
        "inicio": "2004-12-01",
        "label":  "Regime 6 — proxy longo 21 anos (Dez/2004+)",
        # Target: ETFs US-listed mais antigos como proxy da estratégia fatorial
        #   IVV  = proxy SWRD.L  (S&P 500 — ⚠️ sem DM ex-US; MSCI World ~65% US)
        #   VBR  = proxy AVGS.L  (Vanguard SC Value US — ⚠️ sem componente Intl SC)
        #   EEM  = proxy AVEM.L  (MSCI EM broad — sem SC/Value tilt)
        # Limitação: SWRD inclui ~35% DM ex-US que IVV não captura.
        #            AVGS inclui ~42% Intl SC Value que VBR não captura.
        #            Para versão mais completa com Intl SC: usar --regime 5 (Dez/2006)
        "target": {
            "IVV": 0.50,   # proxy SWRD.L
            "VBR": 0.30,   # proxy AVGS.L (US SC Value only)
            "EEM": 0.20,   # proxy AVEM.L
        },
        # Shadow A: blend que aproxima MSCI ACWI (VWRA) antes de ACWI ETF existir
        "shadow": {
            "IVV": 0.65,   # proxy VWRA — US allocation
            "EFA": 0.25,   # proxy VWRA — DM ex-US
            "EEM": 0.10,   # proxy VWRA — EM
        },
        "proxies": [
            "IVV ⚠️ proxy de SWRD.L (S&P 500 ≠ MSCI World — sem DM ex-US no Target)",
            "VBR ⚠️ proxy de AVGS.L (Vanguard SC Value US — sem Intl SC value)",
            "EEM ⚠️ proxy de AVEM.L (MSCI EM broad, sem SC/Value tilt)",
            "Shadow A = IVV 65% + EFA 25% + EEM 10% (aproxima MSCI ACWI)",
        ],
    },
}


# ─── DADOS ───────────────────────────────────────────────────────────────────

def baixar_dados(tickers: list, inicio: str, fim: str = None) -> pd.DataFrame:
    """Baixa preços de fechamento mensais (USD) para lista de tickers."""
    if fim is None:
        fim = datetime.today().strftime("%Y-%m-%d")

    import sys as _sys
    print(f"  Baixando preços ({inicio} → {fim})...", file=_sys.stderr)
    raw = yf.download(tickers, start=inicio, end=fim,
                      auto_adjust=True, progress=False)

    if isinstance(raw.columns, pd.MultiIndex):
        close = raw["Close"]
    else:
        close = raw[["Close"]].rename(columns={"Close": tickers[0]})

    # Resample para último dia útil do mês
    monthly = close.resample("ME").last().dropna(how="all")
    return monthly


def baixar_cambio(inicio: str, fim: str = None) -> pd.Series:
    """Retorna câmbio USD/BRL (fim de mês)."""
    if fim is None:
        fim = datetime.today().strftime("%Y-%m-%d")
    raw = yf.download("USDBRL=X", start=inicio, end=fim,
                      auto_adjust=True, progress=False)
    if isinstance(raw.columns, pd.MultiIndex):
        close = raw["Close"].squeeze()
    else:
        close = raw["Close"]
    return close.resample("ME").last().dropna()


# ─── SIMULAÇÃO ───────────────────────────────────────────────────────────────

def calcular_retornos_mensais(prices: pd.DataFrame, pesos: dict) -> pd.Series:
    """
    Retorno mensal da carteira rebalanceada mensalmente.
    Assume compra a preços de fechamento do mês anterior e avaliação no fechamento atual.
    """
    retornos_ativos = prices.pct_change().dropna(how="all")
    retornos_ativos = retornos_ativos[[c for c in pesos if c in retornos_ativos.columns]]

    # Reindexar pesos normalizando para 1.0 com ativos disponíveis
    def retorno_mes(row):
        disponíveis = {k: v for k, v in pesos.items() if k in row.index and not pd.isna(row[k])}
        if not disponíveis:
            return np.nan
        soma_pesos = sum(disponíveis.values())
        return sum(row[k] * v / soma_pesos for k, v in disponíveis.items())

    return retornos_ativos.apply(retorno_mes, axis=1)


def crescimento_acumulado(retornos: pd.Series) -> pd.Series:
    """Converte retornos mensais em índice de crescimento (base 100)."""
    return (1 + retornos).cumprod() * 100


# ─── MÉTRICAS ────────────────────────────────────────────────────────────────

def cagr(retornos: pd.Series) -> float:
    n_anos = len(retornos) / 12
    if n_anos <= 0:
        return np.nan
    return (1 + retornos).prod() ** (1 / n_anos) - 1


def sharpe(retornos: pd.Series, rf_mensal: float = 0.004) -> float:
    """Sharpe anualizado com RF mensal ~0.4% (proxy CDI)."""
    excesso = retornos - rf_mensal
    if excesso.std() == 0:
        return np.nan
    return (excesso.mean() / excesso.std()) * np.sqrt(12)


def sortino(retornos: pd.Series, rf_mensal: float = 0.004) -> float:
    """Sortino anualizado — penaliza só downside."""
    excesso = retornos - rf_mensal
    downside = excesso[excesso < 0]
    if len(downside) == 0 or downside.std() == 0:
        return np.nan
    return (excesso.mean() / downside.std()) * np.sqrt(12)


def vol_anual(retornos: pd.Series) -> float:
    """Volatilidade anualizada (%)."""
    return float(retornos.std() * np.sqrt(12) * 100)


def max_drawdown(retornos: pd.Series) -> float:
    cum = (1 + retornos).cumprod()
    peak = cum.cummax()
    dd = (cum - peak) / peak
    return float(dd.min())


def tabela_anual(r_target: pd.Series, r_shadow: pd.Series) -> pd.DataFrame:
    """Retorno anual de cada carteira e delta."""
    df = pd.DataFrame({"Target": r_target, "Shadow A": r_shadow})
    anual = df.groupby(df.index.year).apply(lambda x: (1 + x).prod() - 1)
    anual["Delta (pp)"] = (anual["Target"] - anual["Shadow A"]) * 100
    return anual


# ─── OUTPUT ──────────────────────────────────────────────────────────────────

def imprimir_tabela_anual(tab: pd.DataFrame, regime_label: str):
    print(f"\n{'─'*58}")
    print(f"  RETORNOS ANUAIS — {regime_label}")
    print(f"{'─'*58}")
    print(f"  {'Ano':>4}  {'Target':>8}  {'Shadow A':>9}  {'Delta (pp)':>10}  Veredito")
    print(f"  {'─'*52}")
    for ano, row in tab.iterrows():
        t = row["Target"]
        s = row["Shadow A"]
        d = row["Delta (pp)"]
        veredito = "✅ tilt ganhou" if d > 0 else ("➖ empate" if abs(d) < 0.5 else "❌ tilt perdeu")
        print(f"  {ano:>4}  {t:>+8.1%}  {s:>+9.1%}  {d:>+10.2f}  {veredito}")


def imprimir_metricas(r_target: pd.Series, r_shadow: pd.Series):
    dados = {
        "Target (fatorial)": r_target,
        "Shadow A (VWRA)":   r_shadow,
    }
    print(f"\n  {'Métrica':<22}  {'Target':>10}  {'Shadow A':>10}  {'Delta':>10}")
    print(f"  {'─'*56}")
    c_t = cagr(r_target)
    c_s = cagr(r_shadow)
    s_t = sharpe(r_target)
    s_s = sharpe(r_shadow)
    d_t = max_drawdown(r_target)
    d_s = max_drawdown(r_shadow)
    print(f"  {'CAGR':<22}  {c_t:>+10.2%}  {c_s:>+10.2%}  {(c_t-c_s)*100:>+9.2f}pp")
    print(f"  {'Sharpe (anual.)':<22}  {s_t:>10.2f}  {s_s:>10.2f}  {s_t-s_s:>+10.2f}")
    print(f"  {'Max Drawdown':<22}  {d_t:>10.1%}  {d_s:>10.1%}  {(d_t-d_s)*100:>+9.2f}pp")
    meses = len(r_target)
    print(f"  {'N meses':<22}  {meses:>10}  {meses:>10}")


def imprimir_alerta_advocate(tab: pd.DataFrame):
    """Gera alerta se delta negativo em 2+ anos consecutivos."""
    negativos = tab["Delta (pp)"] < 0
    alertas = []
    streak = 0
    for ano, neg in negativos.items():
        if neg:
            streak += 1
            if streak >= 2:
                alertas.append(f"  ⚠️  Tilt negativo em {streak} anos consecutivos (incl. {ano})")
        else:
            streak = 0
    if alertas:
        print(f"\n  🔴 ADVOCATE ALERT — Underperformance persistente:")
        for a in alertas:
            print(a)
        print(f"  → Escalar para issue formal se padrão continuar.")
    else:
        ultimos = tab.tail(3)
        delta_medio = ultimos["Delta (pp)"].mean()
        print(f"\n  ✅ Nenhum underperformance consecutivo detectado.")
        print(f"     Delta médio últimos {len(ultimos)} anos: {delta_medio:+.2f}pp")


# ─── MAIN ────────────────────────────────────────────────────────────────────

def _build_series_json(r_target: pd.Series, r_shadow: pd.Series) -> dict:
    """Constrói dict com datas, séries acumuladas e métricas para output JSON."""
    cum_t = crescimento_acumulado(r_target)
    cum_s = crescimento_acumulado(r_shadow)
    dates = [d.strftime("%Y-%m") for d in cum_t.index]
    return {
        "dates":   dates,
        "target":  [round(float(v), 2) for v in cum_t],
        "shadowA": [round(float(v), 2) for v in cum_s],
        "metrics": {
            "target": {
                "cagr":    round(cagr(r_target) * 100, 2),
                "sharpe":  round(sharpe(r_target), 2),
                "sortino": round(sortino(r_target), 2),
                "maxdd":   round(max_drawdown(r_target) * 100, 2),
                "vol":     round(vol_anual(r_target), 2),
            },
            "shadowA": {
                "cagr":    round(cagr(r_shadow) * 100, 2),
                "sharpe":  round(sharpe(r_shadow), 2),
                "sortino": round(sortino(r_shadow), 2),
                "maxdd":   round(max_drawdown(r_shadow) * 100, 2),
                "vol":     round(vol_anual(r_shadow), 2),
            },
        },
    }


def _run_regime_for_json(regime_id: int) -> tuple[dict, str]:
    """Roda um regime e retorna (series_dict, note)."""
    import warnings
    warnings.filterwarnings("ignore")
    regime = REGIMES[regime_id]
    tickers = list(set(list(regime["target"].keys()) + list(regime["shadow"].keys())))
    prices = baixar_dados(tickers, inicio=regime["inicio"])
    if prices.empty or len(prices) < 3:
        return {}, ""
    r_target = calcular_retornos_mensais(prices, regime["target"])
    r_shadow = calcular_retornos_mensais(prices, regime["shadow"])
    idx = r_target.dropna().index.intersection(r_shadow.dropna().index)
    if len(idx) < 3:
        return {}, ""
    data = _build_series_json(r_target.loc[idx], r_shadow.loc[idx])
    note = "; ".join(regime["proxies"]) if regime["proxies"] else ""
    return data, note


# ─── REGIME 7 — SÉRIE LONGA ──────────────────────────────────────────────────

def _get_rf_historica(start: str) -> pd.Series:
    """RF mensal histórica = coluna RF do F-F_Research_Data_Factors (Ken French)."""
    import pandas_datareader.data as web
    df = web.DataReader(
        REGIME7_CONFIG["french_datasets"]["rf"],
        "famafrench",
        start=start,
    )[0]
    # FF dados em %, converter para decimal
    rf = df["RF"] / 100.0
    rf.index = rf.index.to_timestamp(how="end").normalize()
    rf.index = rf.index.to_period("M").to_timestamp(how="end").normalize()
    return rf


def _get_french_em_returns(start: str) -> pd.Series:
    """Retorno total mensal do mercado EM em decimal.
    Fórmula: Mkt-RF (Emerging_5_Factors) + RF (F-F_Research_Data_Factors)
    """
    import pandas_datareader.data as web
    df_em = web.DataReader(
        REGIME7_CONFIG["french_datasets"]["em_5f"],
        "famafrench",
        start=start,
    )[0]
    df_us = web.DataReader(
        REGIME7_CONFIG["french_datasets"]["rf"],
        "famafrench",
        start=start,
    )[0]
    total_pct = df_em["Mkt-RF"] + df_us["RF"]
    total = total_pct / 100.0
    total.index = total.index.to_timestamp(how="end").normalize()
    return total


def _get_french_world_returns(start: str) -> pd.Series:
    """Retorno total mensal do mercado DM (MSCI World) via French Developed Factors."""
    import pandas_datareader.data as web
    # Usar F-F_Research_Data_5_Factors_2x3 como proxy para US market
    # Para DM ex-US usamos Global_ex_US_3_Factors
    # Mas o MSCI World total é melhor via yfinance MSCI World NR
    # Aqui retornamos via yfinance para consistência
    swrd_proxy = REGIME7_CONFIG["proxies"]["SWRD"][0]["ticker"]
    raw = yf.download(swrd_proxy, start=start, auto_adjust=True, progress=False)
    if isinstance(raw.columns, pd.MultiIndex):
        close = raw["Close"].squeeze()
    else:
        close = raw["Close"]
    monthly = close.resample("ME").last()
    ret = monthly.pct_change().dropna()
    return ret


def _download_monthly_returns(ticker: str, start: str, end: str = None) -> pd.Series:
    """Baixa série de retornos mensais para um ticker via yfinance."""
    fim = end or datetime.today().strftime("%Y-%m-%d")
    raw = yf.download(ticker, start=start, end=fim, auto_adjust=True, progress=False)
    if raw.empty:
        return pd.Series(dtype=float, name=ticker)
    if isinstance(raw.columns, pd.MultiIndex):
        close = raw["Close"].squeeze()
    else:
        close = raw["Close"]
    monthly = close.resample("ME").last()
    ret = monthly.pct_change().dropna()
    ret.name = ticker
    return ret


def _build_swrd_r7(start: str) -> tuple[pd.Series, str]:
    """Constrói série de retornos mensais do proxy SWRD para Regime 7."""
    cfg = REGIME7_CONFIG["proxies"]["SWRD"][0]
    ret = _download_monthly_returns(cfg["ticker"], start=start)
    tier = cfg["tier"]
    label = f"MSCI World NR ({cfg['ticker']}) {ret.index[0].strftime('%Y-%m')} → {ret.index[-1].strftime('%Y-%m')} [Tier {tier}]"
    return ret, label


def _build_avgs_r7(start: str) -> tuple[pd.Series, str, list]:
    """Constrói série de retornos mensais do proxy AVGS para Regime 7.
    Blend ponderado: DFSVX 58% + DISVX 42% (return splice a partir de 1994-12).
    """
    splice_log = []
    cfgs = REGIME7_CONFIG["proxies"]["AVGS"]

    series_parts = {}
    for c in cfgs:
        r = _download_monthly_returns(c["ticker"], start=start)
        series_parts[c["ticker"]] = (r, c["weight"], c)

    # Alinhar: ambos disponíveis a partir de DISVX (início mais tardio)
    dfsvx_r, w_dfsvx, c_dfsvx = series_parts["DFSVX"]
    disvx_r, w_disvx, c_disvx = series_parts["DISVX"]

    common_idx = dfsvx_r.index.intersection(disvx_r.index)
    blended = dfsvx_r.loc[common_idx] * w_dfsvx + disvx_r.loc[common_idx] * w_disvx

    # Período com só DFSVX (antes de DISVX)
    solo_idx = dfsvx_r.index.difference(disvx_r.index)
    if len(solo_idx) > 0:
        # ⚠️ conservador: usar só DFSVX com seu peso completo quando DISVX não disponível
        solo_part = dfsvx_r.loc[solo_idx]
        blended = pd.concat([solo_part, blended]).sort_index()
        splice_log.append({
            "period": f"{solo_idx[0].strftime('%Y-%m')} → {solo_idx[-1].strftime('%Y-%m')}",
            "note": "DFSVX only (DISVX nao disponivel) — peso 100% DFSVX ⚠️ conservador",
        })

    splice_log.append({
        "DFSVX_start": dfsvx_r.index[0].strftime("%Y-%m"),
        "DISVX_start": disvx_r.index[0].strftime("%Y-%m"),
        "blend_start": common_idx[0].strftime("%Y-%m"),
        "blend_end": common_idx[-1].strftime("%Y-%m"),
        "DFSVX_weight": w_dfsvx,
        "DISVX_weight": w_disvx,
    })

    tier_s = c_dfsvx["tier"]
    label = (f"DFSVX {int(w_dfsvx*100)}% + DISVX {int(w_disvx*100)}% → "
             f"{blended.index[0].strftime('%Y-%m')} → {blended.index[-1].strftime('%Y-%m')} [Tier {tier_s}]")
    blended.name = "AVGS_R7"
    return blended, label, splice_log


def _build_avem_r7(start: str) -> tuple[pd.Series, str]:
    """Constrói série de retornos mensais do proxy AVEM para Regime 7.
    Splice: French EM (1989-07→1994-03) + DFEMX (1994-04→hoje)
    """
    cfg_french = REGIME7_CONFIG["proxies"]["AVEM"][0]
    cfg_dfemx  = REGIME7_CONFIG["proxies"]["AVEM"][1]
    corr       = REGIME7_CONFIG["french_em_corr_dfemx"]

    # Parte 1: French EM
    french_end = pd.Timestamp(cfg_french["end"])
    french_start = cfg_french["start"]
    french_ret = _get_french_em_returns(start=french_start)
    french_part = french_ret[french_ret.index <= french_end]

    # Parte 2: DFEMX
    dfemx_ret = _download_monthly_returns(cfg_dfemx["ticker"], start=cfg_dfemx["start"])

    # Concatenar (return splice — sem rescaling)
    combined = pd.concat([french_part, dfemx_ret]).sort_index()
    # Remove duplicatas (se overlap)
    combined = combined[~combined.index.duplicated(keep="last")]

    tier_label = f"Tier C (corr={corr})"
    label = (
        f"French EM {french_part.index[0].strftime('%Y-%m')}→{french_part.index[-1].strftime('%Y-%m')} "
        f"[{tier_label}] + DFEMX {dfemx_ret.index[0].strftime('%Y-%m')}→{dfemx_ret.index[-1].strftime('%Y-%m')} [Tier B]"
    )
    combined.name = "AVEM_R7"
    return combined, label


def _build_benchmark_r7(start: str) -> tuple[pd.Series, str]:
    """Benchmark sintético para Regime 7:
    Pré-2008-03: MSCI World NR (peso_dm) + French EM Mkt (peso_em), ponderados
    2008-03+: ACWI ETF
    """
    cfg_acwi = REGIME7_CONFIG["proxies"]["VWRA_benchmark"][1]
    acwi_start = cfg_acwi["start"]

    # Parte ACWI (2008-03+)
    acwi_ret = _download_monthly_returns(cfg_acwi["ticker"], start=acwi_start)

    # Parte sintética pré-2008
    # DM: MSCI World NR via yfinance
    pre_end = pd.Timestamp("2008-02-28")
    world_ret = _get_french_world_returns(start=start)
    world_pre = world_ret[world_ret.index <= pre_end]

    # EM: French EM total return
    em_ret = _get_french_em_returns(start=start)
    em_pre = em_ret[em_ret.index <= pre_end]

    # Pesos lineares: 90/10 → 88/12
    w_dm_start = REGIME7_CONFIG["benchmark_dm_weight_start"]
    w_em_start = REGIME7_CONFIG["benchmark_em_weight_start"]
    w_dm_end   = REGIME7_CONFIG["benchmark_dm_weight_end"]
    w_em_end   = REGIME7_CONFIG["benchmark_em_weight_end"]

    common_pre = world_pre.index.intersection(em_pre.index)
    n = len(common_pre)
    if n > 0:
        t = np.linspace(0, 1, n)
        w_dm = w_dm_start + (w_dm_end - w_dm_start) * t
        w_em = w_em_start + (w_em_end - w_em_start) * t
        synth = (world_pre.loc[common_pre].values * w_dm +
                 em_pre.loc[common_pre].values * w_em)
        synth_series = pd.Series(synth, index=common_pre, name="BENCH_R7")
    else:
        synth_series = pd.Series(dtype=float, name="BENCH_R7")

    # Splice: sintético + ACWI
    combined = pd.concat([synth_series, acwi_ret]).sort_index()
    combined = combined[~combined.index.duplicated(keep="last")]
    combined.name = "BENCH_R7"

    label = (
        f"Sintetico (MSCI World+French EM) {synth_series.index[0].strftime('%Y-%m')}→{synth_series.index[-1].strftime('%Y-%m')} "
        f"+ ACWI {acwi_ret.index[0].strftime('%Y-%m')}→{acwi_ret.index[-1].strftime('%Y-%m')}"
    )
    return combined, label


def _rebalance_portfolio(returns_dict: dict, pesos_alvo: dict,
                          freq: str = "A") -> pd.Series:
    """Backtest com rebalanceamento anual (dezembro) ou mensal.
    Entre rebalanceamentos: pesos flutuam com mercado (drift real).
    """
    # Alinhar todas as séries no índice comum
    df = pd.DataFrame(returns_dict)
    df = df.dropna()

    if df.empty or len(df) < 2:
        return pd.Series(dtype=float)

    # Normalizar pesos para ativos disponíveis
    ativos = [k for k in pesos_alvo if k in df.columns]
    soma = sum(pesos_alvo[k] for k in ativos)
    pesos_norm = {k: pesos_alvo[k] / soma for k in ativos}

    # Inicializar com pesos alvo
    weights = np.array([pesos_norm[a] for a in ativos])
    portfolio_returns = []

    for i, (date, row) in enumerate(df[ativos].iterrows()):
        ret_vec = row.values
        # Retorno do mês com pesos correntes
        port_ret = float(np.dot(weights, ret_vec))
        portfolio_returns.append((date, port_ret))

        # Atualizar pesos com drift
        weights = weights * (1 + ret_vec)
        total_w = weights.sum()
        if total_w > 0:
            weights = weights / total_w

        # Rebalancear?
        rebalance = False
        if freq == "A":
            # Rebalancear em dezembro ou no último mês disponível
            if date.month == 12 or i == len(df) - 1:
                rebalance = True
        elif freq == "ME":
            rebalance = True

        if rebalance:
            weights = np.array([pesos_norm[a] for a in ativos])

    idx, vals = zip(*portfolio_returns)
    return pd.Series(vals, index=pd.DatetimeIndex(idx), name="portfolio")


def _win_rate_rolling(r_target: pd.Series, r_bench: pd.Series,
                       window_meses: int) -> tuple[float, int]:
    """Win rate: % de janelas rolantes onde CAGR Target > CAGR benchmark."""
    wins = 0
    total = 0
    n = len(r_target)
    for i in range(n - window_meses + 1):
        t_slice = r_target.iloc[i:i + window_meses]
        b_slice = r_bench.iloc[i:i + window_meses]
        cagr_t = (1 + t_slice).prod() ** (12 / window_meses) - 1
        cagr_b = (1 + b_slice).prod() ** (12 / window_meses) - 1
        if cagr_t > cagr_b:
            wins += 1
        total += 1
    rate = (wins / total * 100) if total > 0 else float("nan")
    return rate, total


def _drawdown_recovery_analysis(r: pd.Series) -> dict:
    """Para cada drawdown: início, trough, recovery, meses de recuperação."""
    cum = (1 + r).cumprod()
    peak = cum.cummax()
    dd_series = (cum - peak) / peak

    events = []
    in_dd = False
    dd_start = None
    trough_date = None
    trough_val = 0.0

    for date, dd_val in dd_series.items():
        if not in_dd and dd_val < -0.001:
            in_dd = True
            dd_start = date
            trough_date = date
            trough_val = dd_val
        elif in_dd:
            if dd_val < trough_val:
                trough_date = date
                trough_val = dd_val
            if dd_val >= -0.001:
                # Recuperou
                recovery_months = len(dd_series.loc[dd_start:date])
                events.append({
                    "start": dd_start,
                    "trough": trough_date,
                    "trough_pct": trough_val * 100,
                    "recovery": date,
                    "recovery_months": recovery_months,
                })
                in_dd = False
                dd_start = None
                trough_date = None
                trough_val = 0.0

    # Drawdown em aberto no final
    if in_dd:
        events.append({
            "start": dd_start,
            "trough": trough_date,
            "trough_pct": trough_val * 100,
            "recovery": None,
            "recovery_months": None,
        })

    max_dd_pct = dd_series.min() * 100
    completed = [e for e in events if e["recovery_months"] is not None]
    max_rec = max((e["recovery_months"] for e in completed), default=0)
    p90_rec = (np.percentile([e["recovery_months"] for e in completed], 90)
               if completed else 0)

    return {
        "events": events,
        "max_drawdown_pct": max_dd_pct,
        "max_recovery_months": max_rec,
        "p90_recovery_months": p90_rec,
    }


def _factor_drought_analysis(r_target: pd.Series, r_bench: pd.Series,
                               window: int = 36) -> dict:
    """Períodos em que Target underperforma benchmark em janela rolling de `window` meses."""
    n = len(r_target)
    if n < window:
        return {"droughts": [], "max_drought_months": 0}

    # Calcular underperformance em janela rolling de `window` meses
    # Uma janela é "underperformance" se CAGR do Target < CAGR do benchmark
    underperf = []
    for i in range(n - window + 1):
        cagr_t = (1 + r_target.iloc[i:i + window]).prod() ** (12 / window) - 1
        cagr_b = (1 + r_bench.iloc[i:i + window]).prod() ** (12 / window) - 1
        underperf.append(cagr_t < cagr_b)

    # Identificar sequências contínuas de janelas com underperformance
    droughts = []
    current_drought = 0
    max_drought = 0
    drought_start = None

    for i, is_under in enumerate(underperf):
        if is_under:
            if current_drought == 0:
                drought_start = r_target.index[i]
            current_drought += 1
            if current_drought > max_drought:
                max_drought = current_drought
        else:
            if current_drought > 0:
                droughts.append({
                    "start": drought_start,
                    "end": r_target.index[i + window - 2],
                    "months": current_drought + window - 1,
                })
            current_drought = 0
            drought_start = None

    if current_drought > 0:
        droughts.append({
            "start": drought_start,
            "end": r_target.index[-1],
            "months": current_drought + window - 1,
            "open": True,
        })

    return {
        "droughts": droughts,
        "max_drought_months": max_drought + window - 1 if droughts else 0,
        "window_meses": window,
    }


def _cagr_por_periodo(r_target: pd.Series, r_bench: pd.Series) -> pd.DataFrame:
    """CAGR por período configurado em REGIME7_CONFIG['decadas']."""
    rows = []
    for dec in REGIME7_CONFIG["decadas"]:
        s = pd.Timestamp(dec["start"])
        e = pd.Timestamp(dec["end"]) if dec["end"] else r_target.index[-1]
        t_sl = r_target[(r_target.index >= s) & (r_target.index <= e)]
        b_sl = r_bench[(r_bench.index >= s) & (r_bench.index <= e)]
        if len(t_sl) < 6 or len(b_sl) < 6:
            continue
        n_anos_t = len(t_sl) / 12
        n_anos_b = len(b_sl) / 12
        cagr_t = (1 + t_sl).prod() ** (1 / n_anos_t) - 1 if n_anos_t > 0 else float("nan")
        cagr_b = (1 + b_sl).prod() ** (1 / n_anos_b) - 1 if n_anos_b > 0 else float("nan")
        rows.append({
            "Decada": dec["label"],
            "Target": cagr_t,
            "Benchmark": cagr_b,
            "Delta": cagr_t - cagr_b,
            "N_meses": len(t_sl),
        })
    return pd.DataFrame(rows)


def _factor_regression_r7(r_target: pd.Series, r_bench: pd.Series,
                            r7_start: str) -> dict:
    """Regressão fatorial FF5 em 3 sub-períodos + teste de Chow."""
    import statsmodels.api as sm
    import pandas_datareader.data as web

    proxy_end = pd.Timestamp(REGIME7_CONFIG["proxy_period_end"])
    etf_start = pd.Timestamp(REGIME7_CONFIG["etf_real_period_start"])

    # Baixar fatores FF5 Desenvolvidos
    try:
        ff5 = web.DataReader(
            REGIME7_CONFIG["french_datasets"]["us_5f"],
            "famafrench",
            start=r7_start,
        )[0]
        ff5 = ff5 / 100.0
        ff5.index = ff5.index.to_timestamp(how="end").normalize()
        factor_cols = [c for c in ["Mkt-RF", "SMB", "HML", "RMW", "CMA"] if c in ff5.columns]
    except Exception as e:
        return {"error": str(e)}

    def _run_regression(ret_series: pd.Series, label: str) -> dict:
        # Excess returns: ret - RF
        rf = ff5["RF"] if "RF" in ff5.columns else pd.Series(0.0, index=ff5.index)
        merged = pd.DataFrame({
            "ret": ret_series,
            "RF": rf,
        }).join(ff5[factor_cols], how="inner").dropna()

        if len(merged) < 24:
            return {"label": label, "n": len(merged), "error": "insuf. obs"}

        y = merged["ret"] - merged["RF"]
        X = sm.add_constant(merged[factor_cols])
        try:
            model = sm.OLS(y, X).fit(cov_type="HC1")
        except Exception as e:
            return {"label": label, "error": str(e)}

        result = {
            "label": label,
            "n": int(model.nobs),
            "alpha_ann_pct": model.params["const"] * 12 * 100,
            "alpha_t": model.tvalues["const"],
            "alpha_p": model.pvalues["const"],
            "r2": model.rsquared,
            "betas": {},
            "t_stats": {},
            "rss": float(model.ssr),
            "k": len(factor_cols) + 1,  # +1 for const
        }
        for f in factor_cols:
            result["betas"][f] = model.params[f]
            result["t_stats"][f] = model.tvalues[f]
        return result

    # Sub-período (a): proxy completo
    mask_a = r_target.index <= proxy_end
    res_a = _run_regression(r_target[mask_a], f"(a) Proxy {r_target.index[0].strftime('%Y-%m')}→{proxy_end.strftime('%Y-%m')}")

    # Sub-período (b): ETF real
    mask_b = r_target.index >= etf_start
    res_b = _run_regression(r_target[mask_b], f"(b) ETF real {etf_start.strftime('%Y-%m')}→{r_target.index[-1].strftime('%Y-%m')}")

    # (c): série completa
    res_c = _run_regression(r_target, f"(c) Completo {r_target.index[0].strftime('%Y-%m')}→{r_target.index[-1].strftime('%Y-%m')}")

    # Teste de Chow entre (a) e (b)
    chow = {}
    if ("rss" in res_a and "rss" in res_b and "rss" in res_c
            and "error" not in res_a and "error" not in res_b and "error" not in res_c):
        # Validar consistência de k antes de calcular F-stat
        if not (res_a["k"] == res_b["k"] == res_c["k"]):
            chow = {"error": f"k inconsistente entre sub-períodos: a={res_a['k']}, b={res_b['k']}, c={res_c['k']}"}
        else:
            rss_c = res_c["rss"]
            rss_a = res_a["rss"]
            rss_b = res_b["rss"]
            k = res_c["k"]
            n_a = res_a["n"]
            n_b = res_b["n"]
            denom_val = (rss_a + rss_b)
            dof_denom = n_a + n_b - 2 * k
            if denom_val > 0 and dof_denom > 0:
                F = ((rss_c - rss_a - rss_b) / k) / (denom_val / dof_denom)
                from scipy import stats as scipy_stats
                p_val = 1 - scipy_stats.f.cdf(F, k, dof_denom)
                chow = {
                    "F": F,
                    "p": p_val,
                    "conclusao": ("loadings estaveis" if p_val > 0.05
                                  else "quebra estrutural detectada"),
                }
            else:
                chow = {"error": "RSS invalido para Chow"}
    else:
        chow = {"error": "sub-periodos insuficientes para Chow"}

    return {
        "sub_a": res_a,
        "sub_b": res_b,
        "sub_c": res_c,
        "chow": chow,
        "factor_cols": factor_cols,
    }


def verify_regime7_data():
    """Verifica que todas as fontes do Regime 7 estão acessíveis."""
    import sys
    print("\n  Verificando fontes de dados Regime 7...")
    checks = {
        "MSCI World NR": REGIME7_CONFIG["proxies"]["SWRD"][0]["ticker"],
        "DFSVX (DFA US SC Value)": "DFSVX",
        "DISVX (DFA Intl SC Value)": "DISVX",
        "DFEMX (DFA EM Core)": "DFEMX",
        "ACWI (iShares MSCI ACWI)": "ACWI",
    }
    all_ok = True
    for name, ticker in checks.items():
        d = yf.download(ticker, start="2020-01-01", progress=False, auto_adjust=True)
        ok = len(d) > 100
        status = "OK" if ok else "ERRO"
        if not ok:
            all_ok = False
        print(f"    [{status}] {name} ({ticker}): {len(d)} dias")

    # French data
    import pandas_datareader.data as web
    for ds_name, ds_key in REGIME7_CONFIG["french_datasets"].items():
        try:
            web.DataReader(ds_key, "famafrench", start="2020-01-01")
            print(f"    [OK] French dataset: {ds_key}")
        except Exception as e:
            print(f"    [ERRO] French dataset: {ds_key} — {e}", file=sys.stderr)
            all_ok = False

    return all_ok


def run_regime7():
    """Executa backtest completo do Regime 7."""
    cfg = REGIME7_CONFIG
    start = cfg["start_full"]

    print("\n" + "=" * 68)
    print(f"  REGIME 7 — Série Longa 1989-2026 (proxies acadêmicos)")
    print("=" * 68)

    # ── Verificação de dados ──────────────────────────────────────────────────
    ok = verify_regime7_data()
    if not ok:
        print("\n  [AVISO] Algumas fontes nao acessiveis. Continuando com disponivel...")

    # ── Construir séries ──────────────────────────────────────────────────────
    print(f"\n  Construindo series (start={start})...")

    swrd_ret, swrd_label = _build_swrd_r7(start)
    avgs_ret, avgs_label, splice_log = _build_avgs_r7(start)
    avem_ret, avem_label = _build_avem_r7(start)
    bench_ret, bench_label = _build_benchmark_r7(start)

    # Pesos Target (lidos de config — não hardcoded aqui)
    pesos = EQUITY_WEIGHTS  # {"SWRD": 0.50, "AVGS": 0.30, "AVEM": 0.20}

    returns_dict = {
        "SWRD": swrd_ret,
        "AVGS": avgs_ret,
        "AVEM": avem_ret,
    }

    # Construir DataFrame alinhado
    df_all = pd.DataFrame({
        "SWRD": swrd_ret,
        "AVGS": avgs_ret,
        "AVEM": avem_ret,
        "BENCH": bench_ret,
    }).dropna()

    if df_all.empty or len(df_all) < 24:
        print("  [ERRO] Dados insuficientes para Regime 7.")
        return

    n_meses = len(df_all)
    data_ini = df_all.index[0].strftime("%Y-%m")
    data_fim = df_all.index[-1].strftime("%Y-%m")
    n_anos = n_meses / 12

    print(f"\n  FONTES E STITCHING:")
    print(f"    SWRD  : {swrd_label}")
    print(f"    AVGS  : {avgs_label}")
    print(f"    AVEM  : {avem_label}")
    print(f"    BENCH : {bench_label}")
    print(f"    Janela completa: {data_ini} → {data_fim} (N={n_meses} meses, {n_anos:.1f} anos)")

    # ── Backtest anual ────────────────────────────────────────────────────────
    r_target_anual = _rebalance_portfolio(
        {"SWRD": df_all["SWRD"], "AVGS": df_all["AVGS"], "AVEM": df_all["AVEM"]},
        pesos,
        freq="A",
    )
    r_bench_anual = df_all["BENCH"]
    r_bench_anual = r_bench_anual.loc[r_target_anual.index]

    # ── Backtest mensal (sensitivity) ────────────────────────────────────────
    r_target_mensal = _rebalance_portfolio(
        {"SWRD": df_all["SWRD"], "AVGS": df_all["AVGS"], "AVEM": df_all["AVEM"]},
        pesos,
        freq="ME",
    )

    # ── RF histórica variável ─────────────────────────────────────────────────
    rf_hist = _get_rf_historica(start=start)
    rf_aligned = rf_hist.reindex(r_target_anual.index).fillna(rf_hist.mean())

    # ── Métricas principais ───────────────────────────────────────────────────
    cagr_t = cagr(r_target_anual)
    cagr_b = cagr(r_bench_anual)

    # Sharpe com RF variável
    excess_t = r_target_anual - rf_aligned
    excess_b = r_bench_anual - rf_aligned
    sharpe_t = (excess_t.mean() / excess_t.std() * np.sqrt(12)) if excess_t.std() > 0 else float("nan")
    sharpe_b = (excess_b.mean() / excess_b.std() * np.sqrt(12)) if excess_b.std() > 0 else float("nan")

    # Sortino
    downside_t = excess_t[excess_t < 0]
    sortino_t = (excess_t.mean() / downside_t.std() * np.sqrt(12)) if len(downside_t) > 0 else float("nan")

    maxdd_t = max_drawdown(r_target_anual)
    maxdd_b = max_drawdown(r_bench_anual)

    # Delta CAGR anual vs mensal
    cagr_t_mensal = cagr(r_target_mensal)
    delta_cagr_rebbal = (cagr_t_mensal - cagr_t) * 100

    print(f"\n  RETORNOS (Rebalanceamento Anual):")
    print(f"    Target 50/30/20 CAGR:       {cagr_t:+.2%}/ano  |  Benchmark CAGR: {cagr_b:+.2%}/ano")
    print(f"    Alpha anualizado:            {(cagr_t - cagr_b)*100:+.2f}pp/ano")
    print(f"    Sharpe Target (rf variavel): {sharpe_t:.2f}     |  Sharpe Benchmark: {sharpe_b:.2f}")
    print(f"    Max Drawdown Target:         {maxdd_t:.1%}     |  Max DD Benchmark: {maxdd_b:.1%}")
    print(f"    Sortino Target:              {sortino_t:.2f}")
    print(f"\n    Sensitivity — Rebalanceamento Mensal:")
    print(f"    Delta CAGR (anual vs mensal): {delta_cagr_rebbal:+.2f}pp/ano")

    # ── Métricas avançadas ────────────────────────────────────────────────────
    print(f"\n  METRICAS AVANCADAS:")
    wr_dict = {}
    for w in REGIME7_CONFIG["win_rate_windows"]:
        wr_rate, n_janelas = _win_rate_rolling(r_target_anual, r_bench_anual, w)
        anos_w = w // 12
        wins = round(wr_rate / 100 * n_janelas) if n_janelas > 0 else 0
        wr_dict[w] = {"total": n_janelas, "wins": wins, "rate": wr_rate}
        if n_janelas > 0:
            print(f"    Win Rate {anos_w:2d} anos (rolling):   {wr_rate:.0f}% (N={n_janelas} janelas)")
        else:
            print(f"    Win Rate {anos_w:2d} anos (rolling):   N/A (historico insuficiente)")

    wr_120 = wr_dict.get(120, {"total": 0, "wins": 0, "rate": None})
    wr_240 = wr_dict.get(240, {"total": 0, "wins": 0, "rate": None})

    dd_analysis = _drawdown_recovery_analysis(r_target_anual)
    print(f"    Max Drawdown Recovery:        {dd_analysis['max_recovery_months']:.0f} meses (P90: {dd_analysis['p90_recovery_months']:.0f} meses)")

    drought = _factor_drought_analysis(r_target_anual, r_bench_anual,
                                        REGIME7_CONFIG["factor_drought_window"])
    print(f"    Factor Drought Maximo:        {drought['max_drought_months']} meses (underperformance continua vs benchmark)")

    # ── CAGR por período ──────────────────────────────────────────────────────
    df_decadas = _cagr_por_periodo(r_target_anual, r_bench_anual)
    cagr_df = df_decadas
    if not df_decadas.empty:
        print(f"\n  CAGR POR DECADA:")
        print(f"    {'Decada':<15}  {'Target':>8}  {'Benchmark':>10}  {'Delta':>7}  {'N meses':>7}")
        print(f"    {'─'*55}")
        for _, row in df_decadas.iterrows():
            print(f"    {row['Decada']:<15}  {row['Target']:>+8.1%}  {row['Benchmark']:>+10.1%}  {row['Delta']*100:>+6.1f}pp  {int(row['N_meses']):>7}")

    # ── Factor regression ─────────────────────────────────────────────────────
    print(f"\n  Rodando factor regression (FF5 sub-periodos + Chow)...")
    reg = _factor_regression_r7(r_target_anual, r_bench_anual, start)

    if "error" not in reg:
        for key, label in [("sub_c", "COMPLETO"), ("sub_a", "PROXY"), ("sub_b", "ETF REAL")]:
            res = reg.get(key, {})
            if "error" in res or not res:
                print(f"\n  FACTOR REGRESSION ({label}): {res.get('error', 'sem dados')}")
                continue
            print(f"\n  FACTOR REGRESSION ({res['label']}):")
            print(f"    Alpha:   {res['alpha_ann_pct']:.2f}%/ano (t={res['alpha_t']:.2f}, p={res['alpha_p']:.3f})")
            for f in reg["factor_cols"]:
                beta = res["betas"].get(f, float("nan"))
                t    = res["t_stats"].get(f, float("nan"))
                print(f"    {f:<8}: {beta:.3f} (t={t:.2f})")
            print(f"    R2:      {res['r2']:.3f}")
            print(f"    N:       {res['n']} meses")

        chow = reg.get("chow", {})
        print(f"\n  TESTE DE CHOW (proxy vs ETF real):")
        if "error" in chow:
            print(f"    {chow['error']}")
        else:
            print(f"    F-stat: {chow['F']:.2f}  p-value: {chow['p']:.3f}")
            print(f"    Conclusao: {chow['conclusao']}")
    else:
        print(f"\n  [AVISO] Factor regression indisponivel: {reg['error']}")

    # ── Notas metodológicas ───────────────────────────────────────────────────
    corr_em = REGIME7_CONFIG["french_em_corr_dfemx"]
    print(f"\n  NOTAS DE METODOLOGIA:")
    print(f"    - French EM proxy: correlacao {corr_em:.2f} vs DFEMX (1994-2026)")
    print(f"    - Benchmark pre-2008: sintetico (MSCI World + French EM), nao investivel")
    print(f"    - Rebalanceamento: anual (dezembro). Sensitivity mensal reportada acima.")
    print(f"    - RF: serie historica Ken French (variavel), nao taxa fixa")
    print(f"    - AVEM pre-1994: French EM (Tier C) — usar com cautela")
    print(f"    - Pesos Target: SWRD {pesos['SWRD']:.0%} / AVGS {pesos['AVGS']:.0%} / AVEM {pesos['AVEM']:.0%} (lidos de config.py)")

    print("\n" + "=" * 68 + "\n")

    # ── Retorno acumulado (base 100) ──────────────────────────────────────────
    cum_target = (1 + r_target_anual).cumprod()
    cum_bench  = (1 + r_bench_anual).cumprod()

    # ── Variáveis para regressão sub_c ────────────────────────────────────────
    _sub_c = reg.get("sub_c", {"error": True}) if "error" not in reg else {"error": True}
    _has_sub_c = "error" not in _sub_c

    import datetime as _dt
    return {
        "gerado_em": _dt.date.today().isoformat(),
        "periodo": {"start": str(r_target_anual.index[0].date()), "end": str(r_target_anual.index[-1].date())},
        "n_meses": len(r_target_anual),
        "metricas_globais": {
            "cagr_target_pct": round(cagr_t * 100, 2),
            "cagr_bench_pct": round(cagr_b * 100, 2),
            "alpha_pp": round((cagr_t - cagr_b) * 100, 2),
            "sharpe_target": round(float(sharpe_t), 3),
            "sharpe_bench": round(float(sharpe_b), 3),
            "sortino_target": round(float(sortino_t), 3),
            "max_dd_target_pct": round(float(maxdd_t) * 100, 2),
            "max_dd_bench_pct": round(float(maxdd_b) * 100, 2),
        },
        "win_rates": {
            "120m_janelas_total": wr_120["total"],
            "120m_target_wins": wr_120["wins"],
            "120m_pct": round(wr_120["rate"], 1) if wr_120["total"] > 0 else None,
            "240m_janelas_total": wr_240["total"],
            "240m_target_wins": wr_240["wins"],
            "240m_pct": round(wr_240["rate"], 1) if wr_240["total"] > 0 else None,
        },
        "factor_drought": {
            "max_meses": drought["max_drought_months"],
            "window_meses": drought.get("window_meses", 36),
            "nota": f"Pior período de underperformance acumulada em janela {drought.get('window_meses',36)}m vs benchmark"
        },
        "drawdown_recovery": {
            "max_meses": int(dd_analysis["max_recovery_months"]),
            "p90_meses": int(dd_analysis["p90_recovery_months"]),
            "nota": "Meses para recuperar pico após drawdown. Bond pool atual: 7 anos (84 meses)."
        },
        "cagr_por_decada": cagr_df.to_dict(orient="records") if not cagr_df.empty else [],
        "factor_regression": {
            "alpha_ann_pct": round(_sub_c["alpha_ann_pct"], 2) if _has_sub_c else None,
            "alpha_t": round(_sub_c["alpha_t"], 2) if _has_sub_c else None,
            "alpha_p": round(_sub_c["alpha_p"], 3) if _has_sub_c else None,
            "r2": round(_sub_c["r2"], 3) if _has_sub_c else None,
            "n_meses": _sub_c.get("n") if _has_sub_c else None,
            "betas": _sub_c.get("betas") if _has_sub_c else None,
            "chow": reg.get("chow"),
        },
        "cumulative_returns": {
            "dates": [str(d.date()) for d in cum_target.index],
            "target": [round(float(v), 4) for v in cum_target.values],
            "bench": [round(float(v), 4) for v in cum_bench.values],
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Backtest fatorial UCITS — Target vs Shadow A")
    parser.add_argument("--regime",  type=int, choices=[1, 2, 3, 4, 5, 6, 7], default=None,
                        help="Regime de dados (1=UCITS real, 4=max historico ETFs, 5=21 anos proxy, 6=19 anos proxy+IntlSC, 7=serie longa 1989-2026). Default: melhor disponivel.")
    parser.add_argument("--desde",   type=str, default=None,
                        help="Data início customizada YYYY-MM (sobrepõe --regime).")
    parser.add_argument("--json",    action="store_true",
                        help="Emitir JSON para dashboard (regime 4 + regime 6). Usado por generate_data.py.")
    args = parser.parse_args()

    # ── Regime 7 ──────────────────────────────────────────────────────────────
    if args.regime == 7:
        run_regime7()
        return

    # ── Modo JSON para pipeline do dashboard ──────────────────────────────────
    if args.json:
        import json as _json, sys as _sys
        print("  ▶ backtest regime 4 (2019+)...", file=_sys.stderr)
        bt4, _ = _run_regime_for_json(4)
        print("  ▶ backtest regime 6 (2004+)...", file=_sys.stderr)
        bt6, note6 = _run_regime_for_json(6)
        if note6:
            bt6["note"] = note6
        output = {"backtest": bt4, "backtestR5": bt6}
        print(_json.dumps(output))
        return

    # Selecionar regime
    if args.desde:
        # Encontrar regime compatível com a data solicitada
        inicio_req = pd.Timestamp(args.desde + "-01")
        regime_id = 1
        for rid in sorted(REGIMES.keys(), reverse=True):
            if pd.Timestamp(REGIMES[rid]["inicio"]) <= inicio_req:
                regime_id = rid
                break
        # Override início com o solicitado
        regime = dict(REGIMES[regime_id])
        regime["inicio"] = args.desde + "-01"
        regime["label"] = regime["label"] + f" [desde {args.desde}]"
    elif args.regime:
        regime_id = args.regime
        regime = REGIMES[regime_id]
    else:
        # Melhor regime com >= 12 meses de dados
        hoje = pd.Timestamp.today()
        regime_id = 1
        for rid in sorted(REGIMES.keys()):
            inicio = pd.Timestamp(REGIMES[rid]["inicio"])
            if (hoje - inicio).days >= 365:
                regime_id = rid
        regime = REGIMES[regime_id]

    print("\n" + "═"*60)
    print(f"  BACKTEST FATORIAL — {regime['label']}")
    print("═"*60)

    if regime["proxies"]:
        print(f"\n  ⚠️  PROXIES ATIVOS neste regime:")
        for p in regime["proxies"]:
            print(f"     {p}")
        print(f"  Resultados são INDICATIVOS — não refletem ETFs UCITS reais.")
    else:
        print(f"\n  ✅ Todos os ETFs são UCITS reais. Dados sem proxy.")

    # Coletar todos os tickers necessários
    tickers_target = list(regime["target"].keys())
    tickers_shadow = list(regime["shadow"].keys())
    todos = list(set(tickers_target + tickers_shadow))

    inicio = regime["inicio"]
    prices = baixar_dados(todos, inicio=inicio)

    if prices.empty or len(prices) < 3:
        print(f"\n❌ Dados insuficientes para {inicio}. Tente regime com mais histórico (--regime 3 ou --regime 4).")
        return

    # Calcular retornos
    r_target = calcular_retornos_mensais(prices, regime["target"])
    r_shadow = calcular_retornos_mensais(prices, regime["shadow"])

    # Alinhar series (mesmo índice)
    idx = r_target.dropna().index.intersection(r_shadow.dropna().index)
    if len(idx) < 3:
        print(f"❌ Dados em comum insuficientes ({len(idx)} meses). Período muito curto ou tickers sem dados.")
        return

    r_target = r_target.loc[idx]
    r_shadow = r_shadow.loc[idx]

    n_meses = len(idx)
    data_ini = idx[0].strftime("%b/%Y")
    data_fim = idx[-1].strftime("%b/%Y")
    print(f"\n  Período efetivo: {data_ini} → {data_fim}  ({n_meses} meses)")

    # Tabela anual
    tab = tabela_anual(r_target, r_shadow)
    imprimir_tabela_anual(tab, regime["label"])

    # Métricas sumário
    print(f"\n{'─'*58}")
    print(f"  MÉTRICAS SUMÁRIO")
    print(f"{'─'*58}")
    imprimir_metricas(r_target, r_shadow)

    # Crescimento acumulado (índice 100)
    cum_target = crescimento_acumulado(r_target)
    cum_shadow = crescimento_acumulado(r_shadow)
    print(f"\n  Crescimento acumulado (base 100):")
    print(f"    Target:   {cum_target.iloc[-1]:.1f}")
    print(f"    Shadow A: {cum_shadow.iloc[-1]:.1f}")
    print(f"    Delta:    {cum_target.iloc[-1] - cum_shadow.iloc[-1]:+.1f} pontos")

    # Alerta Advocate
    print(f"\n{'─'*58}")
    print(f"  DIAGNÓSTICO ADVOCATE")
    print(f"{'─'*58}")
    imprimir_alerta_advocate(tab)

    # Veredito final
    delta_total_pp = (cagr(r_target) - cagr(r_shadow)) * 100
    anos_positivos = (tab["Delta (pp)"] > 0).sum()
    anos_total = len(tab)
    print(f"\n  📊 Veredito: CAGR delta = {delta_total_pp:+.2f}pp | "
          f"Tilt ganhou em {anos_positivos}/{anos_total} anos")

    if regime["proxies"]:
        print(f"\n  ⚠️  Nota metodológica: {len(regime['proxies'])} proxy(ies) ativo(s).")
        print(f"     Conclusão definitiva requer esperar ETFs UCITS reais acumularem histórico.")
        print(f"     Regime 1 (UCITS puros) disponível a partir de Jun/2025 (12 meses de dados).")

    print("\n" + "═"*60 + "\n")


if __name__ == "__main__":
    main()
