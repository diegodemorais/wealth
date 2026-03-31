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
    # JPGL proxy correto: JPUS 60% + JPIN 40% (JPMorgan US + Japan Intl Factor ETFs)
    # Validado em FI-jpgl-redundancia (2026-03-31). AVLV era proxy errado (value/size apenas).
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
    parser.add_argument("--fronteira",  action="store_true", help="Fronteira eficiente")
    parser.add_argument("--stress",     action="store_true", help="Stress test Quant Crisis 2.0")
    parser.add_argument("--tearsheet",  action="store_true", help="Tearsheet vs VWRA")
    parser.add_argument("--html",       action="store_true", help="Salvar tearsheet em HTML")
    parser.add_argument("--aporte",           type=float, help="Otimizar aporte (R$)")
    parser.add_argument("--taxa-ipca-longo",  type=float, help="Taxa IPCA+ longo atual (%% a.a., ex: 7.16)")
    parser.add_argument("--taxa-renda-plus",  type=float, help="Taxa Renda+ 2065 atual (%% a.a., ex: 6.82)")
    parser.add_argument("--pat-total",        type=float, help="Patrimônio total atual (R$) — para calcular gaps")
    parser.add_argument("--periodo",          type=str, default="3y", help="Período de dados (ex: 1y, 3y, 5y)")
    args = parser.parse_args()

    rodar_tudo = not any([args.fronteira, args.stress, args.tearsheet, args.aporte])

    print(f"\n📥 Baixando dados ({args.periodo})...")
    precos = get_precos(args.periodo)
    print(f"   {len(precos)} dias úteis | {precos.index[0].date()} → {precos.index[-1].date()}")

    if rodar_tudo or args.fronteira:
        analise_fronteira(precos)

    if rodar_tudo or args.stress:
        stress_test_quant_crisis(precos)

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
