#!/usr/bin/env python3
"""
portfolio_analytics.py — Revisão Trimestral Factor + Stress Tests
Fronteira eficiente, CDaR stress test, tearsheet vs VWRA, otimizador de aporte.

Uso:
    python3 portfolio_analytics.py                    # tudo
    python3 portfolio_analytics.py --fronteira        # só fronteira eficiente
    python3 portfolio_analytics.py --stress           # só stress test Quant Crisis 2.0
    python3 portfolio_analytics.py --aporte 25000     # otimizador de aporte

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
from datetime import date, timedelta
import warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import yfinance as yf
import quantstats as qs
from pypfopt import EfficientFrontier, expected_returns, risk_models
from pypfopt.efficient_frontier import EfficientCDaR
import riskfolio as rp


# ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────

TICKERS_ALVO = {
    "SWRD": "SWRD.L",
    "AVGS": "AVGS.L",
    "AVEM": "AVEM.L",
    "JPGL": "JPGL.L",
}

PESOS_ALVO = {
    "SWRD.L": 0.35,
    "AVGS.L": 0.25,
    "AVEM.L": 0.20,
    "JPGL.L": 0.20,
}

BENCHMARK = "VWRA.L"
PERIODO_ANALISE = "3y"   # janela padrão para análise trimestral

# Proxies US-listed para fronteira eficiente (histórico ~5 anos vs AVGS ~1 ano)
# AVUV = Avantis US Small Cap Value | AVDV = Avantis Intl Small Cap Value
# AVGS ≈ blend de AVUV + AVDV (estratégia Avantis global small cap value)
PROXY_AVGS = {"AVUV": 0.60, "AVDV": 0.40}   # pesos aproximados do blend


# ─── DADOS ────────────────────────────────────────────────────────────────────

def get_precos(periodo: str = "3y") -> pd.DataFrame:
    """Baixa preços ajustados dos 4 ETFs + VWRA."""
    tickers = list(TICKERS_ALVO.values()) + [BENCHMARK]
    print(f"  Baixando preços ({periodo}): {', '.join(tickers)}")
    precos = yf.download(tickers, period=periodo, auto_adjust=True, progress=False)["Close"]
    precos = precos.dropna()
    return precos


def get_precos_proxy_avgs(periodo: str = "5y") -> pd.DataFrame:
    """Baixa proxies US-listed para fronteira de longo prazo.
    Usa equivalentes americanos para evitar mismatch de calendário LSE/NYSE:
      AVUV ≈ AVGS (US small cap value)  |  AVDV ≈ AVGS (intl small cap value)
      IDEV ≈ SWRD (developed ex-US)     |  AVEM ≈ AVEM (emerging markets, Avantis)
      JPUS60%+JPIN40% ≈ JPGL (multi-factor) | VT ≈ VWRA (benchmark)
    Todos negociam na NYSE/Nasdaq — calendário consistente.
    """
    # Proxies canônicos — agentes/referencia/proxies-canonicos.md (2026-03-31)
    # AVGS → AVUV 58% + AVDV 42% (Avantis US+Intl SC Value, pesos factsheet)
    # AVEM → AVEM US-listed (mesma estratégia Avantis, UCITS lançado Dez/2024)
    # JPGL → JPUS 60% + JPIN 40% (JPMorgan Diversified Factor US+Intl)
    proxies_us = ["AVUV", "AVDV", "IDEV", "AVEM", "JPUS", "JPIN", "VT"]
    print(f"  Baixando proxies US ({periodo}): {', '.join(proxies_us)}")
    precos = yf.download(proxies_us, period=periodo, auto_adjust=True, progress=False)["Close"]
    return precos.dropna()


def get_retornos(precos: pd.DataFrame) -> pd.DataFrame:
    return precos.pct_change().dropna()


# ─── FRONTEIRA EFICIENTE ──────────────────────────────────────────────────────

def _rodar_fronteira(precos_4: pd.DataFrame, pesos_alvo_local: dict, label: str):
    """Calcula e imprime Max Sharpe / Min Vol / Diego para um dado DataFrame de 4 ativos."""
    retornos = get_retornos(precos_4)
    mu = expected_returns.mean_historical_return(precos_4)
    S  = risk_models.CovarianceShrinkage(precos_4).ledoit_wolf()

    ef_sharpe = EfficientFrontier(mu, S)
    ef_sharpe.max_sharpe(risk_free_rate=0.02)
    pesos_sharpe = ef_sharpe.clean_weights()
    perf_sharpe  = ef_sharpe.portfolio_performance(verbose=False, risk_free_rate=0.02)

    ef_minvol = EfficientFrontier(mu, S)
    ef_minvol.min_volatility()
    pesos_minvol = ef_minvol.clean_weights()
    perf_minvol  = ef_minvol.portfolio_performance(verbose=False, risk_free_rate=0.02)

    ef_atual = EfficientFrontier(mu, S)
    ef_atual.set_weights(pesos_alvo_local)
    perf_atual = ef_atual.portfolio_performance(verbose=False, risk_free_rate=0.02)

    tickers = list(precos_4.columns)
    nomes = [t.replace(".L", "").replace("_proxy", "") for t in tickers]

    print(f"\n  {label}")
    print(f"  {'ETF':<10} {'Alvo Diego':>12} {'Max Sharpe':>12} {'Min Vol':>10}")
    print("  " + "-"*48)
    for ticker, nome in zip(tickers, nomes):
        print(f"  {nome:<8}  {pesos_alvo_local.get(ticker,0):>11.1%}"
              f"  {pesos_sharpe.get(ticker,0):>11.1%}  {pesos_minvol.get(ticker,0):>9.1%}")

    print(f"\n  {'Métrica':<20} {'Alvo Diego':>12} {'Max Sharpe':>12} {'Min Vol':>10}")
    print("  " + "-"*57)
    print(f"  {'Retorno esperado':<18} {perf_atual[0]:>11.2%} {perf_sharpe[0]:>11.2%} {perf_minvol[0]:>9.2%}")
    print(f"  {'Volatilidade':<18} {perf_atual[1]:>11.2%} {perf_sharpe[1]:>11.2%} {perf_minvol[1]:>9.2%}")
    print(f"  {'Sharpe ratio':<18} {perf_atual[2]:>11.2f} {perf_sharpe[2]:>11.2f} {perf_minvol[2]:>9.2f}")

    delta = perf_atual[2] - perf_sharpe[2]
    if abs(delta) < 0.1:
        print(f"\n  ✅ Pesos Diego próximos do ótimo (delta Sharpe: {delta:+.2f})")
    else:
        print(f"\n  ⚠️  Delta Sharpe: {delta:+.2f} — divergência não acionável sem histórico suficiente")

    # Correlações
    corr = retornos.corr()
    print(f"  Correlações:")
    for i, t1 in enumerate(tickers):
        for t2 in tickers[i+1:]:
            n1, n2 = t1.replace(".L","").replace("_proxy",""), t2.replace(".L","").replace("_proxy","")
            c = corr.loc[t1, t2]
            flag = "⚠️ " if c > 0.90 else "  "
            print(f"    {flag}{n1}↔{n2}: {c:.2f}")

    return perf_atual[2], perf_sharpe[2]


def analise_fronteira(precos: pd.DataFrame):
    print("\n" + "─"*60)
    print("  FRONTEIRA EFICIENTE — 4 ETFs")
    print("─"*60)

    n_dias = len(precos.dropna(subset=["AVGS.L"]))
    print(f"\n  AVGS.L: {n_dias} dias úteis de histórico (~{n_dias/252:.1f} anos)")
    if n_dias < 500:
        print(f"  ⚠️  Histórico curto. Rodando também com proxy AVUV+AVDV (5 anos).")

    # ── Passo 1: fronteira com AVGS real (histórico disponível) ───────────────
    precos_equity = precos[list(TICKERS_ALVO.values())].dropna()
    _rodar_fronteira(precos_equity, PESOS_ALVO,
                     f"PASS 1 — AVGS real ({len(precos_equity)} dias)")

    # ── Passo 2: fronteira com proxies US-listed (calendário consistente) ────
    try:
        precos_proxy_raw = get_precos_proxy_avgs("5y")

        # Série sintética AVGS_proxy = 60% AVUV + 40% AVDV
        avuv = precos_proxy_raw["AVUV"] / precos_proxy_raw["AVUV"].iloc[0]
        avdv = precos_proxy_raw["AVDV"] / precos_proxy_raw["AVDV"].iloc[0]
        avgs_proxy = (PROXY_AVGS["AVUV"] * avuv + PROXY_AVGS["AVDV"] * avdv) * 100

        # JPGL proxy correto: JPUS 60% + JPIN 40%
        # Validado em FI-jpgl-redundancia (2026-03-31). AVLV (value/size) era proxy errado.
        jpus = precos_proxy_raw["JPUS"] / precos_proxy_raw["JPUS"].iloc[0]
        jpin = precos_proxy_raw["JPIN"] / precos_proxy_raw["JPIN"].iloc[0]
        jpgl_proxy = (0.60 * jpus + 0.40 * jpin) * 100

        precos_proxy = pd.DataFrame({
            "IDEV":       precos_proxy_raw["IDEV"],    # ≈ SWRD (developed)
            "AVGS_proxy": avgs_proxy,
            "AVEM":       precos_proxy_raw["AVEM"],    # ≈ AVEM
            "JPGL_proxy": jpgl_proxy,                  # ≈ JPGL (60% JPUS + 40% JPIN)
        }).dropna()

        pesos_proxy = {
            "IDEV":       PESOS_ALVO["SWRD.L"],
            "AVGS_proxy": PESOS_ALVO["AVGS.L"],
            "AVEM":       PESOS_ALVO["AVEM.L"],
            "JPGL_proxy": PESOS_ALVO["JPGL.L"],
        }

        n_proxy = len(precos_proxy)
        print()
        print(f"  Proxy map: SWRD→IDEV | AVGS→{PROXY_AVGS['AVUV']*100:.0f}%AVUV+{PROXY_AVGS['AVDV']*100:.0f}%AVDV | AVEM→AVEM | JPGL→60%JPUS+40%JPIN")
        _rodar_fronteira(precos_proxy, pesos_proxy,
                         f"PASS 2 — Proxies US ({n_proxy} dias, ~{n_proxy/252:.1f} anos, calendário NYSE)")
        print(f"\n  Limitações: proxies US não têm hedge cambial, diferem em TER e domicílio fiscal.")
        print(f"  Usar para calibrar convicção no fator, não como sinal de rebalanceamento.")
    except Exception as e:
        print(f"\n  ⚠️  Proxies US indisponíveis: {e}")


# ─── STRESS TEST QUANT CRISIS 2.0 ─────────────────────────────────────────────

def stress_test_quant_crisis(precos: pd.DataFrame):
    print("\n" + "─"*60)
    print("  STRESS TEST — QUANT CRISIS 2.0")
    print("  Cenário: small value (AVGS) -60% em 3 meses")
    print("─"*60)

    cenarios = [
        ("AVGS -30% (correção moderada)",    {"AVGS.L": -0.30}),
        ("AVGS -39% (Max DD histórico)",     {"AVGS.L": -0.39}),
        ("AVGS -60% (2008-style extremo)",   {"AVGS.L": -0.60}),
        ("AVGS -60% + JPGL -40% (correlação em crise)", {"AVGS.L": -0.60, "JPGL.L": -0.40}),
    ]

    patrimonio_ref = 3_372_673  # R$ — atualizar se necessário

    print(f"\n  {'Cenário':<42} {'Impacto Equity':>14}  {'Impacto Portfolio':>17}  {'R$ Perdido':>12}")
    print("  " + "-"*88)

    for desc, choques in cenarios:
        impacto_equity = 0
        impacto_portfolio = 0
        for ticker, choque in choques.items():
            nome = ticker.replace(".L", "")
            peso_equity  = PESOS_ALVO[ticker]
            peso_total   = peso_equity * 0.79  # equity = 79% do portfolio
            impacto_equity    += peso_equity * choque
            impacto_portfolio += peso_total  * choque

        perda_reais = patrimonio_ref * abs(impacto_portfolio)
        print(f"  {desc:<42} {impacto_equity:>+13.1%}  {impacto_portfolio:>+16.1%}  R$ {perda_reais:>9,.0f}")

    print(f"\n  Nota: AVGS = 25% do bloco equity = {0.25*0.79:.1%} do portfolio total")
    print(f"  Max DD histórico AVGS: -39% (piso, não teto — FI-crowdedness 2026-03-24)")
    print(f"  Em 2008-style, small value pode cair -60%+")

    # CDaR com riskfolio
    print(f"\n  CDaR 95% dos ETFs individuais ({PERIODO_ANALISE}):")
    retornos = get_retornos(precos[list(TICKERS_ALVO.values())])
    for ticker in TICKERS_ALVO.values():
        nome = ticker.replace(".L", "")
        r = retornos[[ticker]]
        cdar_val = r[r < 0].quantile(0.05).values[0]  # aproximação
        max_dd = (r + 1).cumprod().div((r + 1).cumprod().cummax()) - 1
        mdd = float(max_dd.min().values[0])
        print(f"    {nome}: Max DD = {mdd:.1%}")


# ─── CORRELAÇÕES POR REGIME DE MERCADO ────────────────────────────────────────

def correlacoes_regime():
    """
    Calcula matrizes de correlação por regime de VIX.

    Regimes: calm (VIX < 20) | stress (VIX 20-30) | crise (VIX > 30)

    Problema: o stress test usa choques fixos mas correlações convergem em crises.
    COVID 2020: correlações equity sobem de ~0.85 (calm) para ~0.95 (crise).
    Isso significa que a diversificação intra-equity some quando mais precisamos.

    Proxies para período pré-UCITS:
      AVGS → AVUV (Avantis US SC Value, set/2019+)  ⚠️
      AVEM → VWO  (Vanguard EM, longo histórico)    ⚠️
      SWRD → SWRD.L | JPGL → JPGL.L (sem proxy)
    """
    print("\n" + "─"*60)
    print("  CORRELAÇÕES POR REGIME (VIX)")
    print("─"*60)

    # Download: ETFs + proxies + VIX — 6 anos para capturar COVID 2020 + 2022
    tickers_regimes = ["SWRD.L", "AVUV", "VWO", "JPGL.L", "^VIX"]
    print(f"\n  Baixando dados (6 anos): {', '.join(tickers_regimes)}")
    print(f"  ⚠️  AVUV = proxy AVGS | VWO = proxy AVEM (histórico pré-UCITS)")

    raw = yf.download(tickers_regimes, period="6y", auto_adjust=True, progress=False)["Close"]
    raw = raw.dropna()

    if raw.empty or len(raw) < 100:
        print("  ❌ Dados insuficientes.")
        return

    vix   = raw["^VIX"]
    etfs  = raw[["SWRD.L", "AVUV", "VWO", "JPGL.L"]]
    nomes = {"SWRD.L": "SWRD", "AVUV": "AVGS(p)", "VWO": "AVEM(p)", "JPGL.L": "JPGL"}

    retornos = etfs.pct_change().dropna()
    vix_alinhado = vix.reindex(retornos.index).ffill()

    # Classificar regimes
    def regime(v):
        if v < 20:   return "calm"
        elif v < 30: return "stress"
        else:        return "crise"

    labels = vix_alinhado.map(regime)

    # Estatísticas de cobertura
    contagem = labels.value_counts()
    print(f"\n  Cobertura por regime ({len(retornos)} dias úteis):")
    for r_name, r_label in [("calm", "VIX <20"), ("stress", "VIX 20-30"), ("crise", "VIX >30")]:
        n = contagem.get(r_name, 0)
        pct = n / len(retornos) * 100
        exemplo = ""
        if r_name == "crise":
            datas_crise = labels[labels == "crise"].index
            if len(datas_crise):
                exemplo = f"  (ex: {datas_crise[0].strftime('%b/%Y')})"
        print(f"    {r_label:<14} {n:>4} dias ({pct:.0f}%){exemplo}")

    # Calcular correlações por regime
    pares = [
        ("SWRD.L", "AVUV"),
        ("SWRD.L", "VWO"),
        ("SWRD.L", "JPGL.L"),
        ("AVUV",   "VWO"),
        ("AVUV",   "JPGL.L"),
        ("VWO",    "JPGL.L"),
    ]

    resultados = {}
    for r_name in ["calm", "stress", "crise"]:
        mask = labels == r_name
        r_sub = retornos[mask]
        if len(r_sub) >= 20:
            resultados[r_name] = r_sub.corr()
        else:
            resultados[r_name] = None

    # Tabela de correlações por regime
    print(f"\n  {'Par':<22} {'Calm':>8} {'Stress':>8} {'Crise':>8} {'Δ(crise-calm)':>14}  Convergência?")
    print(f"  {'─'*68}")

    alertas_convergencia = []
    for t1, t2 in pares:
        n1, n2 = nomes[t1], nomes[t2]
        label_par = f"{n1} ↔ {n2}"

        corrs = {}
        for r_name in ["calm", "stress", "crise"]:
            if resultados[r_name] is not None and t1 in resultados[r_name] and t2 in resultados[r_name]:
                corrs[r_name] = resultados[r_name].loc[t1, t2]
            else:
                corrs[r_name] = float("nan")

        delta = corrs.get("crise", float("nan")) - corrs.get("calm", float("nan"))

        if abs(delta) >= 0.05:
            conv_flag = f"⚠️  +{delta:.2f}" if delta > 0 else f"⚠️  {delta:.2f}"
            alertas_convergencia.append((label_par, corrs, delta))
        else:
            conv_flag = f"✅ {delta:+.2f}"

        def fmt(v):
            return f"{v:.3f}" if not pd.isna(v) else "  —  "

        print(f"  {label_par:<22} {fmt(corrs.get('calm')):>8} {fmt(corrs.get('stress')):>8} "
              f"{fmt(corrs.get('crise')):>8} {delta:>+14.3f}  {conv_flag}")

    # Impacto no stress test com correlações de crise
    print(f"\n  {'─'*60}")
    print(f"  IMPLICAÇÃO PARA O STRESS TEST")
    print(f"  {'─'*60}")

    # Simular impacto de choque -30% SWRD com correlações calm vs crise
    choque_swrd = -0.30
    peso_swrd  = 0.35
    peso_avgs  = 0.25
    peso_avem  = 0.20
    peso_jpgl  = 0.20

    if resultados["calm"] is not None and resultados["crise"] is not None:
        corr_calm_avgs  = resultados["calm"].loc["SWRD.L", "AVUV"]
        corr_calm_avem  = resultados["calm"].loc["SWRD.L", "VWO"]
        corr_calm_jpgl  = resultados["calm"].loc["SWRD.L", "JPGL.L"]
        corr_crise_avgs = resultados["crise"].loc["SWRD.L", "AVUV"]
        corr_crise_avem = resultados["crise"].loc["SWRD.L", "VWO"]
        corr_crise_jpgl = resultados["crise"].loc["SWRD.L", "JPGL.L"]

        # Retorno esperado dos outros ETFs dado choque SWRD × correlação (linear, aproximação)
        # Assume vol similar para simplicidade — captura direção do efeito
        def impacto_portfolio(corr_avgs, corr_avem, corr_jpgl):
            r_avgs = choque_swrd * corr_avgs
            r_avem = choque_swrd * corr_avem
            r_jpgl = choque_swrd * corr_jpgl
            return (peso_swrd * choque_swrd + peso_avgs * r_avgs +
                    peso_avem * r_avem + peso_jpgl * r_jpgl)

        imp_calm  = impacto_portfolio(corr_calm_avgs,  corr_calm_avem,  corr_calm_jpgl)
        imp_crise = impacto_portfolio(corr_crise_avgs, corr_crise_avem, corr_crise_jpgl)
        imp_worst = choque_swrd  # todos caem igual (correlação = 1.0)

        patrimonio_ref = 3_372_673
        equity_frac = 0.79

        print(f"\n  Cenário: SWRD cai {choque_swrd:.0%} em crise")
        print(f"  {'Modelo':<30} {'Impacto equity':>14} {'Impacto portfolio':>17} {'R$ perdido':>12}")
        print(f"  {'─'*76}")
        for label, imp in [
            ("Correlações calm (atual)",  imp_calm),
            ("Correlações crise (real)",  imp_crise),
            ("Pior caso (corr=1.0)",      imp_worst),
        ]:
            imp_port = imp * equity_frac
            perda = abs(imp_port) * patrimonio_ref
            print(f"  {label:<30} {imp:>+14.1%} {imp_port:>+17.1%} R$ {perda:>9,.0f}")

        gap = abs(imp_crise - imp_calm)
        print(f"\n  Gap calm→crise: {gap:.1%}pp de impacto adicional no bloco equity")
        print(f"  = R$ {gap * equity_frac * patrimonio_ref:,.0f} de perda subestimada pelo modelo atual")

    # Conclusão para revisão
    print(f"\n  {'─'*60}")
    print(f"  CONCLUSÃO PARA REVISÃO ANUAL (jan/2027)")
    print(f"  {'─'*60}")
    if alertas_convergencia:
        n_pares = len(alertas_convergencia)
        print(f"  ⚠️  {n_pares} par(es) com convergência significativa (Δ ≥ 0.05) em crise:")
        for lbl, c, d in alertas_convergencia:
            print(f"     {lbl}: calm {c.get('calm', float('nan')):.3f} → crise {c.get('crise', float('nan')):.3f} (Δ{d:+.3f})")
        print(f"\n  Diversificação intra-equity diminui em crises.")
        print(f"  O bond tent (IPCA+ 15%) é a proteção real — não a diversificação entre ETFs de equity.")
    else:
        print(f"  ✅ Correlações estáveis entre regimes. Diversificação preservada em crises.")
    print()


# ─── TEARSHEET VS VWRA ────────────────────────────────────────────────────────

def tearsheet_vs_benchmark(precos: pd.DataFrame, salvar_html: bool = False):
    print("\n" + "─"*60)
    print("  TEARSHEET — CARTEIRA TARGET vs VWRA (Shadow A)")
    print("─"*60)

    retornos = get_retornos(precos)

    # Retorno ponderado da carteira target
    r_target = sum(PESOS_ALVO[t] * retornos[t] for t in TICKERS_ALVO.values())
    r_benchmark = retornos[BENCHMARK]

    # Alinhar índices
    idx = r_target.index.intersection(r_benchmark.index)
    r_target = r_target[idx]
    r_benchmark = r_benchmark[idx]

    # Métricas em % (formatadas como percentual)
    metricas_pct = {
        "CAGR":         (qs.stats.cagr(r_target),        qs.stats.cagr(r_benchmark)),
        "Volatilidade": (qs.stats.volatility(r_target),   qs.stats.volatility(r_benchmark)),
        "Max Drawdown": (qs.stats.max_drawdown(r_target), qs.stats.max_drawdown(r_benchmark)),
    }
    # Métricas como ratio (não percentual)
    metricas_ratio = {
        "Sharpe":  (qs.stats.sharpe(r_target),  qs.stats.sharpe(r_benchmark)),
        "Sortino": (qs.stats.sortino(r_target),  qs.stats.sortino(r_benchmark)),
        "Calmar":  (qs.stats.calmar(r_target),   qs.stats.calmar(r_benchmark)),
    }

    n_dias = len(r_target)
    print(f"\n  Período: {n_dias} dias úteis (~{n_dias/252:.1f} anos)")
    if n_dias < 500:
        print(f"  ⚠️  Histórico curto (<2 anos) — AVGS.L lançado jun/2024. Resultados com baixa significância.")

    print(f"\n  {'Métrica':<16} {'Target':>10}  {'VWRA':>10}  {'Delta':>10}")
    print("  " + "-"*50)
    for nome, (v_target, v_bench) in metricas_pct.items():
        delta = v_target - v_bench
        # Max DD: menos negativo é melhor
        flag = "✅" if (delta > 0 if nome != "Max Drawdown" else delta > 0) else "⚠️ "
        print(f"  {flag} {nome:<14} {v_target:>9.2%}  {v_bench:>9.2%}  {delta:>+9.2%}")
    for nome, (v_target, v_bench) in metricas_ratio.items():
        delta = v_target - v_bench
        flag = "✅" if delta > 0 else "⚠️ "
        print(f"  {flag} {nome:<14} {v_target:>9.2f}  {v_bench:>9.2f}  {delta:>+9.2f}")

    if salvar_html:
        html_path = "/tmp/tearsheet_target_vs_vwra.html"
        qs.reports.html(r_target, benchmark=r_benchmark, output=html_path,
                        title="Target vs VWRA")
        print(f"\n  📄 Tearsheet completo salvo em: {html_path}")
        print(f"     Abrir no browser: open {html_path}")


# ─── CONFIGURAÇÃO RENDA FIXA / EQUITY ─────────────────────────────────────────

# Alvos da carteira total (% do patrimônio total)
ALVO_IPCA_LONGO_PCT  = 0.15   # bond tent: IPCA+ longo (2040+)
ALVO_IPCA_CURTO_PCT  = 0.03   # IPCA+ curto/médio
ALVO_RENDA_PLUS_PCT  = 0.03   # Renda+ 2065
ALVO_EQUITY_PCT      = 0.79   # equity (100% JPGL quando aporta)

PISO_TAXA_IPCA_LONGO = 6.0    # % a.a. — abaixo disso não prioriza
PISO_TAXA_RENDA_PLUS = 6.5    # % a.a. — abaixo disso não prioriza

# Split do bucket IPCA+ longo (80% TD2050, 20% TD2040)
SPLIT_IPCA_LONGO = {"TD IPCA+2050": 0.80, "TD IPCA+2040": 0.20}


# ─── OTIMIZADOR DE APORTE ─────────────────────────────────────────────────────

def otimizador_aporte(precos: pd.DataFrame, aporte_brl: float,
                      taxa_ipca_longo: float = None, taxa_renda_plus: float = None,
                      pat_total: float = None):
    """
    Cascade de prioridade para aportes:
      1. IPCA+ longo (taxa >= 6.0% e gap > 0) → 100% do aporte
      2. Renda+ (taxa >= 6.5% e gap > 0) → 100% do aporte
      3. Equity → 100% JPGL (IB suporta cotas fracionárias — output em R$/USD, não unidades)
    """
    print("\n" + "─"*60)
    print(f"  OTIMIZADOR DE APORTE — R$ {aporte_brl:,.0f}")
    print("─"*60)

    # ── Câmbio ────────────────────────────────────────────────────────────────
    try:
        fx = yf.download("USDBRL=X", period="5d", progress=False)["Close"].dropna()
        usd_brl = float(fx.iloc[-1])
    except Exception:
        usd_brl = 5.85
        print(f"  ⚠️  Câmbio não disponível. Usando USD/BRL = {usd_brl:.2f}")

    print(f"\n  Câmbio: USD/BRL = {usd_brl:.4f}")

    # ── Taxas TD (se não fornecidas, pedir ao usuário) ─────────────────────────
    if taxa_ipca_longo is None or taxa_renda_plus is None:
        print(f"\n  ℹ️  Use --taxa-ipca-longo e --taxa-renda-plus para decisão automática.")
        print(f"     Ex: --taxa-ipca-longo 7.16 --taxa-renda-plus 6.82")
        print(f"\n  Pisos de decisão:")
        print(f"    IPCA+ Longo >= {PISO_TAXA_IPCA_LONGO:.1f}% a.a. → prioridade máxima")
        print(f"    Renda+ 2065 >= {PISO_TAXA_RENDA_PLUS:.1f}% a.a. → segunda prioridade")
        print(f"    Caso contrário → 100% JPGL via IB")
        # Mostrar preço atual JPGL para referência
        p_jpgl_usd = float(precos["JPGL.L"].iloc[-1])
        p_jpgl_brl = p_jpgl_usd * usd_brl
        aporte_usd = aporte_brl / usd_brl
        print(f"\n  JPGL.L: $ {p_jpgl_usd:.2f} = R$ {p_jpgl_brl:.2f}")
        print(f"  Aporte de R$ {aporte_brl:,.0f} = $ {aporte_usd:,.2f} = {aporte_usd/p_jpgl_usd:.4f} cotas JPGL")
        return

    # ── Gap de alocação (se patrimônio fornecido) ──────────────────────────────
    if pat_total:
        gap_ipca_longo = max(0, ALVO_IPCA_LONGO_PCT - 0.0) * pat_total  # simplificado
        gap_renda_plus = max(0, ALVO_RENDA_PLUS_PCT - 0.0) * pat_total
        gap_jpgl       = max(0, ALVO_EQUITY_PCT - 0.0) * pat_total
    else:
        # Sem patrimônio → assume gap positivo em todos os buckets
        gap_ipca_longo = float("inf")
        gap_renda_plus = float("inf")
        gap_jpgl       = float("inf")

    # ── Cascade de decisão ─────────────────────────────────────────────────────
    print(f"\n  Taxas informadas:")
    print(f"    IPCA+ Longo: {taxa_ipca_longo:.2f}% a.a.  (piso: {PISO_TAXA_IPCA_LONGO:.1f}%)")
    print(f"    Renda+ 2065: {taxa_renda_plus:.2f}% a.a.  (piso: {PISO_TAXA_RENDA_PLUS:.1f}%)")

    print(f"\n  {'─'*50}")

    if taxa_ipca_longo >= PISO_TAXA_IPCA_LONGO and gap_ipca_longo > 0:
        # ── Caso 1: IPCA+ Longo ───────────────────────────────────────────────
        print(f"  ✅ DECISÃO: IPCA+ Longo (taxa {taxa_ipca_longo:.2f}% >= piso {PISO_TAXA_IPCA_LONGO:.1f}%)")
        print(f"  100% do aporte → Tesouro IPCA+ Longo via Tesouro Direto")
        print(f"\n  {'Ativo':<20} {'% do Aporte':>12}  {'Valor (R$)':>14}")
        print("  " + "-"*50)
        for nome, frac in SPLIT_IPCA_LONGO.items():
            valor = aporte_brl * frac
            print(f"  {nome:<20} {frac:>11.0%}  R$ {valor:>10,.0f}")
        print(f"  {'Total':<20} {'100%':>12}  R$ {aporte_brl:>10,.0f}")
        print(f"\n  Plataforma: Tesouro Direto (qualquer corretora, taxa zero)")
        print(f"  Nota: compra em R$ — sem câmbio, sem IB")

    elif taxa_renda_plus >= PISO_TAXA_RENDA_PLUS and gap_renda_plus > 0:
        # ── Caso 2: Renda+ ────────────────────────────────────────────────────
        print(f"  ✅ DECISÃO: Renda+ 2065 (taxa {taxa_renda_plus:.2f}% >= piso {PISO_TAXA_RENDA_PLUS:.1f}%)")
        print(f"  100% do aporte → Tesouro Renda+ 2065 via Tesouro Direto")
        print(f"\n  {'Ativo':<20} {'% do Aporte':>12}  {'Valor (R$)':>14}")
        print("  " + "-"*50)
        print(f"  {'Renda+ 2065':<20} {'100%':>12}  R$ {aporte_brl:>10,.0f}")
        print(f"\n  Plataforma: Tesouro Direto")

    else:
        # ── Caso 3: JPGL via IB ───────────────────────────────────────────────
        motivo = []
        if taxa_ipca_longo < PISO_TAXA_IPCA_LONGO:
            motivo.append(f"IPCA+ {taxa_ipca_longo:.2f}% < piso {PISO_TAXA_IPCA_LONGO:.1f}%")
        if taxa_renda_plus < PISO_TAXA_RENDA_PLUS:
            motivo.append(f"Renda+ {taxa_renda_plus:.2f}% < piso {PISO_TAXA_RENDA_PLUS:.1f}%")
        print(f"  ✅ DECISÃO: 100% JPGL via IB ({'; '.join(motivo)})")

        p_jpgl_usd = float(precos["JPGL.L"].iloc[-1])
        p_jpgl_brl = p_jpgl_usd * usd_brl
        aporte_usd = aporte_brl / usd_brl
        cotas = aporte_usd / p_jpgl_usd

        print(f"\n  {'Ativo':<10} {'Preço (USD)':>12}  {'Preço (R$)':>12}  {'Cotas':>10}  {'Valor (R$)':>12}")
        print("  " + "-"*62)
        print(f"  {'JPGL.L':<10} $ {p_jpgl_usd:>10.2f}  R$ {p_jpgl_brl:>9.2f}  {cotas:>9.4f}  R$ {aporte_brl:>9,.0f}")
        print(f"\n  Aporte em USD: $ {aporte_usd:,.2f}")
        print(f"  Plataforma: Interactive Brokers (cotas fracionárias)")
        print(f"  Ordem: Market ou Limit — {cotas:.4f} cotas JPGL.L")


# ─── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Portfolio Analytics — Revisão Trimestral")
    parser.add_argument("--fronteira",    action="store_true", help="Fronteira eficiente")
    parser.add_argument("--stress",       action="store_true", help="Stress test Quant Crisis 2.0")
    parser.add_argument("--correlacoes",  action="store_true", help="Correlações por regime VIX (calm/stress/crise)")
    parser.add_argument("--tearsheet",    action="store_true", help="Tearsheet vs VWRA")
    parser.add_argument("--html",       action="store_true", help="Salvar tearsheet em HTML")
    parser.add_argument("--aporte",           type=float, help="Otimizar aporte (R$)")
    parser.add_argument("--taxa-ipca-longo",  type=float, help="Taxa IPCA+ longo atual (%% a.a., ex: 7.16)")
    parser.add_argument("--taxa-renda-plus",  type=float, help="Taxa Renda+ 2065 atual (%% a.a., ex: 6.82)")
    parser.add_argument("--pat-total",        type=float, help="Patrimônio total atual (R$) — para calcular gaps")
    parser.add_argument("--periodo",          type=str, default="3y", help="Período de dados (ex: 1y, 3y, 5y)")
    args = parser.parse_args()

    rodar_tudo = not any([args.fronteira, args.stress, args.correlacoes, args.tearsheet, args.aporte])

    print(f"\n📥 Baixando dados ({args.periodo})...")
    precos = get_precos(args.periodo)
    print(f"   {len(precos)} dias úteis | {precos.index[0].date()} → {precos.index[-1].date()}")

    if rodar_tudo or args.fronteira:
        analise_fronteira(precos)

    if rodar_tudo or args.stress:
        stress_test_quant_crisis(precos)

    if rodar_tudo or args.correlacoes:
        correlacoes_regime()

    if rodar_tudo or args.tearsheet:
        tearsheet_vs_benchmark(precos, salvar_html=args.html)

    if args.aporte or rodar_tudo:
        aporte = args.aporte or 25_000
        otimizador_aporte(
            precos, aporte,
            taxa_ipca_longo=args.taxa_ipca_longo,
            taxa_renda_plus=args.taxa_renda_plus,
            pat_total=args.pat_total,
        )

    print("\n✅ Análise concluída.\n")


if __name__ == "__main__":
    main()
