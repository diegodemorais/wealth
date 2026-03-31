#!/usr/bin/env python3
"""
backtest_fatorial.py — Backtesting histórico do tilt fatorial UCITS
Pergunta central: o factor tilt dos ETFs UCITS reais gerou alpha histórico?

Compara:
  - Target   : 35% SWRD + 25% AVGS + 20% AVEM + 20% JPGL (rebalanceado mensalmente)
  - Shadow A  : 100% VWRA (market cap puro)

Períodos de dados (descrescente por qualidade):
  Regime 1 — UCITS reais (Jun/2024+)  : todos os 4 ETFs alvo disponíveis
  Regime 2 — 1 proxy (Set/2022+)      : AVGS substituído por proxy small value
  Regime 3 — 2 proxies (Nov/2019+)    : AVEM + AVGS com proxies
  Regime 4 — máx histórico (Jul/2019+): adiciona proxy VWRA pre-lançamento

Proxies usados (flag explícito no output):
  AVGS  → AVUV  (Avantis US SC Value, US-listed, lançado Set/2019) ⚠️
  AVEM  → EIMI.L (iShares Core MSCI EM IMI UCITS ETF, desde 2011)  ⚠️
  VWRA  → SWRD.L (antes de Jul/2019)                                ⚠️

Uso:
    python3 backtest_fatorial.py                    # regime melhor disponível
    python3 backtest_fatorial.py --regime 1         # só UCITS reais
    python3 backtest_fatorial.py --regime 3         # desde Nov/2019
    python3 backtest_fatorial.py --regime 4         # máximo histórico
    python3 backtest_fatorial.py --desde 2021-01    # período customizado

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import warnings
warnings.filterwarnings("ignore")

from datetime import datetime
import yfinance as yf
import pandas as pd
import numpy as np


# ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────

PESOS_TARGET = {
    "SWRD.L": 0.35,
    "AVGS.L": 0.25,
    "AVEM.L": 0.20,
    "JPGL.L": 0.20,
}

# Datas de lançamento (UCITS reais — primeira data com dados confiáveis)
LAUNCH = {
    "SWRD.L": "2011-09-01",
    "VWRA.L": "2019-07-01",
    "JPGL.L": "2019-11-01",
    "AVEM.L": "2022-09-01",
    "AVGS.L": "2024-06-01",
}

# Regimes: data início, tickers usados e flags de proxy
REGIMES = {
    1: {
        "inicio": "2024-06-01",
        "label":  "Regime 1 — ETFs UCITS reais (Jun/2024+)",
        "target": {"SWRD.L": 0.35, "AVGS.L": 0.25, "AVEM.L": 0.20, "JPGL.L": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": [],
    },
    2: {
        "inicio": "2022-09-01",
        "label":  "Regime 2 — 1 proxy AVGS→AVUV (Set/2022+)",
        "target": {"SWRD.L": 0.35, "AVUV": 0.25, "AVEM.L": 0.20, "JPGL.L": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": ["AVUV ⚠️ proxy de AVGS (US-listed, lançado Set/2019)"],
    },
    3: {
        "inicio": "2019-11-01",
        "label":  "Regime 3 — 2 proxies AVGS+AVEM (Nov/2019+)",
        "target": {"SWRD.L": 0.35, "AVUV": 0.25, "EIMI.L": 0.20, "JPGL.L": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": [
            "AVUV  ⚠️ proxy de AVGS (US-listed, lançado Set/2019)",
            "EIMI.L ⚠️ proxy de AVEM (iShares MSCI EM IMI UCITS, desde 2011)",
        ],
    },
    4: {
        "inicio": "2019-07-01",
        "label":  "Regime 4 — máximo histórico (Jul/2019+)",
        "target": {"SWRD.L": 0.35, "AVUV": 0.25, "EIMI.L": 0.20, "JPGL.L": 0.20},
        "shadow": {"VWRA.L": 1.00},
        "proxies": [
            "AVUV  ⚠️ proxy de AVGS (US-listed, lançado Set/2019; dados incompletos Jul-Set/2019)",
            "EIMI.L ⚠️ proxy de AVEM",
            "JPGL.L ⚠️ dados parciais até Nov/2019",
        ],
    },
}


# ─── DADOS ───────────────────────────────────────────────────────────────────

def baixar_dados(tickers: list, inicio: str, fim: str = None) -> pd.DataFrame:
    """Baixa preços de fechamento mensais (USD) para lista de tickers."""
    if fim is None:
        fim = datetime.today().strftime("%Y-%m-%d")

    print(f"  Baixando preços ({inicio} → {fim})...")
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

def main():
    parser = argparse.ArgumentParser(description="Backtest fatorial UCITS — Target vs Shadow A")
    parser.add_argument("--regime",  type=int, choices=[1, 2, 3, 4], default=None,
                        help="Regime de dados (1=UCITS real, 4=máx histórico). Default: melhor disponível.")
    parser.add_argument("--desde",   type=str, default=None,
                        help="Data início customizada YYYY-MM (sobrepõe --regime).")
    args = parser.parse_args()

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
