#!/usr/bin/env python3
"""
checkin_mensal.py — M1 do checkin automático
Coleta preços, calcula Shadow A/B/C e Target, gera output para shadow-portfolio.md e scorecard.md

Uso:
    python3 checkin_mensal.py
    python3 checkin_mensal.py --pat-atual 3550000 --pat-anterior 3492284 --aportes 25000

Venv: ~/claude/finance-tools/.venv/bin/python3
"""

import argparse
import sys
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
import warnings
warnings.filterwarnings("ignore")

import yfinance as yf
import pandas as pd
from bcb import sgs


# ─── CONFIGURAÇÃO ─────────────────────────────────────────────────────────────

TICKERS = {
    "SWRD": "SWRD.L",
    "AVGS": "AVGS.L",
    "AVEM": "AVEM.L",
    "JPGL": "JPGL.L",
    "VWRA": "VWRA.L",
    "HODL11": "HODL11.SA",
    "BTC":    "BTC-USD",
    "USD_BRL": "USDBRL=X",   # ETFs UCITS na LSE são cotados em USD
}

# Pesos do portfolio TARGET (equity block)
PESOS_TARGET = {
    "SWRD":   0.2765,   # 27.65% do portfolio total
    "AVGS":   0.1975,
    "AVEM":   0.1580,
    "JPGL":   0.1580,
    "IPCA":   0.1500,   # calculado via BCB
    "HODL11": 0.0300,
    # Renda+ 2065: input manual (MtM requer Tesouro Direto)
}

# Pesos Shadow C
PESOS_SHADOW_C = {
    "VWRA":   0.79,
    "IPCA":   0.15,
    "BTC":    0.03,    # proxy BTC para HODL11
    "RENDA":  0.03,    # Renda+ 2065 MtM — input manual
}

# IPCA+ taxa bruta referência (atualizar se mudar)
IPCA_PLUS_TAXA_ANUAL = 0.0716
IPCA_PLUS_CUSTODIA = 0.0020

# ─── TRANSITÓRIOS (TLH MONITOR) ───────────────────────────────────────────────
# Ativos transitorios: nao comprar mais, diluir via aportes, vender na desacumulacao.
# TLH = Tax-Loss Harvesting: se entrar em prejuizo, vender para realizar perda fiscal
# (deduz de ganhos futuros) e recomprar exposicao via ETF UCITS alvo.
# Fonte precos medios: Interactive Brokers (input manual ou tlh_precos_medios.json)

TLH_TRANSITORIOS = {
    # US-listed (NYSE/NASDAQ) — estate tax risk adicional
    "AVUV":  {"nome": "Avantis US SC Value",          "ucits_substituto": "AVGS.L", "cotacao": "USD"},
    "AVDV":  {"nome": "Avantis Int'l SC Value",        "ucits_substituto": "AVGS.L", "cotacao": "USD"},
    "AVES":  {"nome": "Avantis EM Value",              "ucits_substituto": "AVEM.L", "cotacao": "USD"},
    "DGS":   {"nome": "WisdomTree EM SmallCap Div",    "ucits_substituto": "AVEM.L", "cotacao": "USD"},
    # UCITS LSE — sem estate tax, mas transitórios (migrar para alvo quando oportuno)
    "EIMI.L": {"nome": "iShares Core MSCI EM IMI",    "ucits_substituto": "AVEM.L", "cotacao": "USD"},
    "USSC.L": {"nome": "SPDR MSCI World SC",          "ucits_substituto": "AVGS.L", "cotacao": "GBp"},
    "IWVL.L": {"nome": "iShares MSCI Wld Value Fac",  "ucits_substituto": "JPGL.L", "cotacao": "GBp"},
}

TLH_GATILHO_PERDA = 0.05   # alertar se perda >= 5%
TLH_IR_ALIQUOTA   = 0.15   # IR sobre ganho de capital (Lei 14.754/2023)


# ─── FUNÇÕES DE DADOS ─────────────────────────────────────────────────────────

def get_periodo(referencia: date = None):
    """Retorna (inicio, fim) do mês anterior ao de referência."""
    if referencia is None:
        referencia = date.today()
    fim = date(referencia.year, referencia.month, 1) - timedelta(days=1)
    inicio = date(fim.year, fim.month, 1)
    return inicio, fim


def get_preco_mensal(ticker: str, inicio: date, fim: date) -> tuple[float, float]:
    """Retorna (preço_início_mês, preço_fim_mês) para um ticker."""
    # Pega janela com folga para capturar primeiro e último dia útil
    start = inicio - timedelta(days=5)
    end = fim + timedelta(days=5)
    data = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)["Close"]
    if data.empty:
        raise ValueError(f"Sem dados para {ticker} no período {inicio}–{fim}")
    data = data.dropna()
    preco_ini = float(data[data.index <= pd.Timestamp(inicio + timedelta(days=4))].iloc[-1])
    preco_fim = float(data[data.index <= pd.Timestamp(fim + timedelta(days=4))].iloc[-1])
    return preco_ini, preco_fim


def get_ipca_mensal(inicio: date, fim: date) -> float:
    """Retorna IPCA do mês (decimal). Ex: 0.0141 para 1.41%"""
    try:
        series = sgs.get({"IPCA": 433}, start=str(inicio - relativedelta(months=2)), end=str(fim + relativedelta(months=1)))
        # IPCA é publicado com defasagem; pegar o valor mais recente disponível
        ipca = series["IPCA"].dropna()
        if ipca.empty:
            print("⚠️  IPCA não disponível via BCB. Usando estimativa 0.40%/mês.")
            return 0.0040
        return float(ipca.iloc[-1]) / 100
    except Exception as e:
        print(f"⚠️  Erro ao buscar IPCA: {e}. Usando estimativa 0.40%/mês.")
        return 0.0040


def get_selic_mensal(inicio: date, fim: date) -> float:
    """Retorna SELIC acumulada no mês (decimal)."""
    try:
        series = sgs.get({"SELIC": 11}, start=str(inicio), end=str(fim))
        selic_diaria = series["SELIC"].dropna() / 100
        selic_mensal = (1 + selic_diaria).prod() - 1
        return float(selic_mensal)
    except Exception as e:
        print(f"⚠️  Erro ao buscar SELIC: {e}.")
        return None


# ─── CÁLCULOS ─────────────────────────────────────────────────────────────────

def retorno_etf_brl(ticker: str, inicio: date, fim: date, usd_brl_ini: float, usd_brl_fim: float) -> float:
    """Retorno de ETF cotado em USD (LSE) convertido para BRL."""
    p_ini, p_fim = get_preco_mensal(ticker, inicio, fim)
    retorno_usd = p_fim / p_ini - 1
    # ETFs em USD → BRL: multiplicar pelo retorno do câmbio USD/BRL
    retorno_cambio = usd_brl_fim / usd_brl_ini - 1
    retorno_brl = (1 + retorno_usd) * (1 + retorno_cambio) - 1
    return retorno_brl


def retorno_shadow_a(inicio: date, fim: date, usd_brl_ini: float, usd_brl_fim: float) -> float:
    """Shadow A: 100% VWRA em BRL."""
    return retorno_etf_brl("VWRA.L", inicio, fim, usd_brl_ini, usd_brl_fim)


def retorno_shadow_b(ipca_mensal: float) -> float:
    """Shadow B: 100% IPCA+ 2040 HTM carry."""
    taxa_real_mensal = (1 + IPCA_PLUS_TAXA_ANUAL - IPCA_PLUS_CUSTODIA) ** (1/12) - 1
    return (1 + ipca_mensal) * (1 + taxa_real_mensal) - 1


def retorno_target(inicio: date, fim: date, usd_brl_ini: float, usd_brl_fim: float, ipca_mensal: float) -> float:
    """Target: pesos alvo dos 4 ETFs + IPCA+ + HODL11."""
    r = {}
    r["SWRD"]   = retorno_etf_brl("SWRD.L", inicio, fim, usd_brl_ini, usd_brl_fim)
    r["AVGS"]   = retorno_etf_brl("AVGS.L", inicio, fim, usd_brl_ini, usd_brl_fim)
    r["AVEM"]   = retorno_etf_brl("AVEM.L", inicio, fim, usd_brl_ini, usd_brl_fim)
    r["JPGL"]   = retorno_etf_brl("JPGL.L", inicio, fim, usd_brl_ini, usd_brl_fim)
    r["IPCA"]   = retorno_shadow_b(ipca_mensal)
    hodl_ini, hodl_fim = get_preco_mensal("HODL11.SA", inicio, fim)
    r["HODL11"] = hodl_fim / hodl_ini - 1

    retorno = sum(PESOS_TARGET[k] * r[k] for k in r)
    return retorno, r


def retorno_shadow_c(inicio: date, fim: date, usd_brl_ini: float, usd_brl_fim: float,
                     ipca_mensal: float, btc_brl_ini: float, btc_brl_fim: float,
                     renda_plus_retorno: float = None) -> float:
    """Shadow C: 79% VWRA + 15% IPCA+ + 3% BTC + 3% Renda+ MtM."""
    r_vwra = retorno_etf_brl("VWRA.L", inicio, fim, usd_brl_ini, usd_brl_fim)
    r_ipca = retorno_shadow_b(ipca_mensal)
    r_btc  = btc_brl_fim / btc_brl_ini - 1

    if renda_plus_retorno is None:
        print("⚠️  Renda+ MtM não informado. Shadow C calculado sem o bloco de 3%.")
        r_renda = r_ipca  # fallback conservador
    else:
        r_renda = renda_plus_retorno

    retorno = (0.79 * r_vwra + 0.15 * r_ipca + 0.03 * r_btc + 0.03 * r_renda)
    return retorno


def metodo_dietz(pat_ini: float, pat_fim: float, aportes: float) -> float:
    """Retorno pelo Método Dietz (aportes assumidos no meio do período)."""
    return (pat_fim - pat_ini - aportes) / (pat_ini + 0.5 * aportes)


def patrimonio_shadow(pat_anterior: float, retorno: float, aportes: float) -> float:
    """Patrimônio do shadow no fim do período."""
    return pat_anterior * (1 + retorno) + aportes


# ─── TLH MONITOR ─────────────────────────────────────────────────────────────

def get_precos_atuais_transitorios() -> dict:
    """Busca preço atual de cada transitório via yfinance."""
    precos = {}
    for ticker in TLH_TRANSITORIOS:
        try:
            data = yf.download(ticker, period="5d", auto_adjust=True, progress=False)
            if not data.empty:
                close = data["Close"] if not isinstance(data.columns, pd.MultiIndex) else data["Close"].squeeze()
                preco = float(close.dropna().iloc[-1])
                # GBp → USD (LSE em pence)
                if TLH_TRANSITORIOS[ticker]["cotacao"] == "GBp":
                    preco = preco / 100  # pence → libras
                precos[ticker] = preco
        except Exception as e:
            print(f"  ⚠️  {ticker}: {e}")
    return precos


def verificar_tlh(precos_medios: dict, usd_brl: float) -> list:
    """
    Compara preços atuais vs preços médios de compra.
    precos_medios: dict {ticker: preco_medio_usd}
    Retorna lista de alertas.
    """
    precos_atuais = get_precos_atuais_transitorios()
    alertas = []
    linhas = []

    for ticker, config in TLH_TRANSITORIOS.items():
        preco_atual = precos_atuais.get(ticker)
        preco_medio = precos_medios.get(ticker)

        if preco_atual is None:
            linhas.append((ticker, config["nome"], "—", "—", "—", "⚪ sem dados"))
            continue

        if preco_medio is None:
            linhas.append((ticker, config["nome"], f"${preco_atual:.2f}", "não informado", "—", "⬜ sem custo médio"))
            continue

        pnl_pct = preco_atual / preco_medio - 1
        pnl_usd = preco_atual - preco_medio  # por cota

        if pnl_pct <= -TLH_GATILHO_PERDA:
            status = f"🔴 TLH! {pnl_pct:+.1%}"
            alertas.append({
                "ticker": ticker,
                "substituto": config["ucits_substituto"],
                "pnl_pct": pnl_pct,
                "preco_atual": preco_atual,
                "preco_medio": preco_medio,
            })
        elif pnl_pct < 0:
            status = f"🟡 perda {pnl_pct:+.1%} (abaixo do gatilho 5%)"
        elif pnl_pct < 0.10:
            status = f"✅ lucro {pnl_pct:+.1%}"
        else:
            status = f"✅ lucro {pnl_pct:+.1%} — isenção apenas na desacumulação"

        linhas.append((ticker, config["nome"], f"${preco_atual:.2f}", f"${preco_medio:.2f}", f"{pnl_pct:+.1%}", status))

    # Imprimir tabela
    print(f"\n💸 TLH MONITOR — Transitórios")
    print(f"  {'Ticker':<8} {'Nome':<30} {'Atual':>8} {'Médio':>8} {'P&L':>7}  Status")
    print(f"  {'─'*72}")
    for linha in linhas:
        print(f"  {linha[0]:<8} {linha[1]:<30} {linha[2]:>8} {linha[3]:>8} {linha[4]:>7}  {linha[5]}")

    # Alertas detalhados
    if alertas:
        print(f"\n  🔴 OPORTUNIDADES TLH ATIVAS:")
        for a in alertas:
            print(f"\n    {a['ticker']} → {a['substituto']}")
            print(f"    Perda: {a['pnl_pct']:+.1%}  |  Atual: ${a['preco_atual']:.2f}  |  Médio: ${a['preco_medio']:.2f}")
            print(f"    Ação: vender {a['ticker']}, comprar {a['substituto']} (mantém exposição fatorial)")
            if a['ticker'] in ("AVUV", "AVDV", "AVES", "DGS"):
                print(f"    Duplo benefício: realiza perda fiscal + migra US-listed → UCITS (reduz estate tax)")
    else:
        print(f"\n  ✅ Nenhuma oportunidade TLH ativa (todos acima de -{TLH_GATILHO_PERDA:.0%})")

    return alertas


# ─── VERIFICAÇÃO DE GATILHOS ──────────────────────────────────────────────────

def verificar_gatilhos(hodl11_pct: float, pat_atual: float):
    """Verifica gatilhos ativos com base na alocação atual."""
    alertas = []

    if hodl11_pct < 0.015:
        alertas.append(f"🔴 HODL11 em {hodl11_pct:.1%} < piso 1.5% — COMPRAR até 3%")
    elif hodl11_pct > 0.05:
        alertas.append(f"🔴 HODL11 em {hodl11_pct:.1%} > teto 5% — REBALANCEAR para 3%")
    else:
        alertas.append(f"✅ HODL11 em {hodl11_pct:.1%} — dentro da faixa [1.5%, 5%]")

    return alertas


# ─── OUTPUT ───────────────────────────────────────────────────────────────────

def formatar_output(periodo_label: str, pat_atual: float, pat_anterior: float,
                    aportes: float, retorno_atual: float,
                    shadow_a: dict, shadow_b: dict, shadow_c: dict, target: dict,
                    ipca_mensal: float, selic_mensal: float, alertas: list,
                    detalhes_etfs: dict):

    delta_a = retorno_atual - shadow_a["retorno"]
    delta_b = retorno_atual - shadow_b["retorno"]
    delta_c = retorno_atual - shadow_c["retorno"] if shadow_c["retorno"] is not None else None

    print("\n" + "═"*60)
    print(f"  CHECKIN MENSAL — {periodo_label}")
    print("═"*60)

    print(f"\n📊 MACRO")
    print(f"  IPCA mensal:     {ipca_mensal:.2%}")
    if selic_mensal:
        print(f"  SELIC mensal:    {selic_mensal:.2%}  (~{((1+selic_mensal)**12-1):.1%} a.a.)")

    print(f"\n💼 CARTEIRA ATUAL")
    print(f"  Patrimônio:      R$ {pat_atual:,.0f}")
    print(f"  Retorno (Dietz): {retorno_atual:.2%}")

    print(f"\n📈 RETORNOS ETFs (BRL)")
    for etf, r in detalhes_etfs.items():
        print(f"  {etf:8s}  {r:+.2%}")

    print(f"\n🪞 SHADOW PORTFOLIOS")
    print(f"  {'Portfolio':<12} {'Retorno':>8}  {'Pat. Fim (R$)':>14}  {'Delta vs Atual':>14}")
    print(f"  {'-'*54}")
    print(f"  {'Atual':<12} {retorno_atual:>+8.2%}  {pat_atual:>14,.0f}")
    print(f"  {'Target':<12} {target['retorno']:>+8.2%}  {target['pat']:>14,.0f}  {retorno_atual - target['retorno']:>+13.2%}pp")
    print(f"  {'Shadow A':<12} {shadow_a['retorno']:>+8.2%}  {shadow_a['pat']:>14,.0f}  {delta_a:>+13.2%}pp")
    print(f"  {'Shadow B':<12} {shadow_b['retorno']:>+8.2%}  {shadow_b['pat']:>14,.0f}  {delta_b:>+13.2%}pp")
    if delta_c is not None:
        print(f"  {'Shadow C':<12} {shadow_c['retorno']:>+8.2%}  {shadow_c['pat']:>14,.0f}  {delta_c:>+13.2%}pp")

    print(f"\n⚡ GATILHOS")
    for alerta in alertas:
        print(f"  {alerta}")

    print(f"\n📋 MARKDOWN PARA shadow-portfolio.md")
    delta_c_str = f"{delta_c:+.2%}pp" if delta_c is not None else "—"
    print(f"| {periodo_label} | **{retorno_atual:+.2%}** | {target['retorno']:+.2%} | {shadow_a['retorno']:+.2%} | {shadow_b['retorno']:+.2%} | {shadow_c['retorno']:+.2%} | **{delta_a:+.2%}pp** | **{delta_b:+.2%}pp** | {delta_c_str} |")

    print(f"\n📋 MARKDOWN PARA patrimônio acumulado")
    print(f"| {periodo_label} | R$ {pat_atual:,.0f} | R$ {target['pat']:,.0f} | R$ {shadow_a['pat']:,.0f} | R$ {shadow_b['pat']:,.0f} | R$ {shadow_c['pat']:,.0f} | ... |")

    print("\n" + "═"*60 + "\n")


# ─── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Checkin Mensal — Shadow Portfolio Tracker")
    parser.add_argument("--pat-atual",      type=float, help="Patrimônio atual (fim do mês)")
    parser.add_argument("--pat-anterior",   type=float, default=3492284, help="Patrimônio anterior (fim do mês anterior)")
    parser.add_argument("--aportes",        type=float, default=25000, help="Aportes do mês (default: R$25.000)")
    parser.add_argument("--renda-plus-ret", type=float, default=None, help="Retorno MtM do Renda+ 2065 no mês (decimal, ex: -0.02)")
    parser.add_argument("--hodl11-pct",     type=float, default=None, help="% atual do HODL11 na carteira (decimal, ex: 0.031)")
    parser.add_argument("--mes",            type=str,   default=None, help="Mês de referência YYYY-MM (default: mês anterior)")
    parser.add_argument("--tlh",            action="store_true",       help="Rodar TLH monitor dos transitórios")
    parser.add_argument("--tlh-config",     type=str,   default=None,
                        help="JSON com preços médios {ticker: preco_usd}. Ex: '{\"AVUV\": 85.50, \"AVDV\": 72.30}'")
    args = parser.parse_args()

    # Período
    if args.mes:
        ano, mes = map(int, args.mes.split("-"))
        ref = date(ano, mes, 28)
    else:
        ref = date.today()
    inicio, fim = get_periodo(ref)
    periodo_label = fim.strftime("%b/%Y")
    print(f"\n🔄 Coletando dados para {periodo_label} ({inicio} → {fim})...")

    # Patrimônio atual (input interativo se não fornecido)
    pat_atual = args.pat_atual
    if pat_atual is None:
        try:
            pat_atual = float(input("  Patrimônio atual (R$): ").replace(",", "").replace(".", ""))
        except (ValueError, EOFError):
            print("❌ Patrimônio atual obrigatório.")
            sys.exit(1)

    pat_anterior = args.pat_anterior
    aportes = args.aportes

    # Câmbio USD/BRL (ETFs UCITS na LSE são cotados em USD)
    print("  Buscando câmbio USD/BRL...")
    usd_brl_ini, usd_brl_fim = get_preco_mensal("USDBRL=X", inicio, fim)

    # BTC/USD → BRL
    print("  Buscando BTC/USD...")
    btc_usd_ini, btc_usd_fim = get_preco_mensal("BTC-USD", inicio, fim)
    btc_brl_ini = btc_usd_ini * usd_brl_ini
    btc_brl_fim = btc_usd_fim * usd_brl_fim

    # IPCA e SELIC
    print("  Buscando IPCA e SELIC (BCB)...")
    ipca = get_ipca_mensal(inicio, fim)
    selic = get_selic_mensal(inicio, fim)

    # Retornos ETFs individuais
    print("  Buscando preços dos ETFs...")
    detalhes_etfs = {}
    for nome, ticker in [("SWRD.L", "SWRD.L"), ("AVGS.L", "AVGS.L"),
                          ("AVEM.L", "AVEM.L"), ("JPGL.L", "JPGL.L"), ("VWRA.L", "VWRA.L")]:
        try:
            r = retorno_etf_brl(ticker, inicio, fim, usd_brl_ini, usd_brl_fim)
            detalhes_etfs[nome] = r
        except Exception as e:
            print(f"  ⚠️  {ticker}: {e}")
            detalhes_etfs[nome] = None

    # Retorno HODL11
    try:
        h_ini, h_fim = get_preco_mensal("HODL11.SA", inicio, fim)
        detalhes_etfs["HODL11.SA"] = h_fim / h_ini - 1
    except Exception as e:
        print(f"  ⚠️  HODL11.SA: {e}")
        detalhes_etfs["HODL11.SA"] = None

    # Calcular retornos
    r_atual = metodo_dietz(pat_anterior, pat_atual, aportes)

    r_shadow_a = retorno_shadow_a(inicio, fim, usd_brl_ini, usd_brl_fim)
    r_shadow_b = retorno_shadow_b(ipca)
    r_target, _ = retorno_target(inicio, fim, usd_brl_ini, usd_brl_fim, ipca)
    r_shadow_c = retorno_shadow_c(inicio, fim, usd_brl_ini, usd_brl_fim, ipca,
                                   btc_brl_ini, btc_brl_fim, args.renda_plus_ret)

    # Patrimônios dos shadows
    pat_shadow_a = patrimonio_shadow(pat_anterior, r_shadow_a, aportes)
    pat_shadow_b = patrimonio_shadow(pat_anterior, r_shadow_b, aportes)
    pat_shadow_c = patrimonio_shadow(pat_anterior, r_shadow_c, aportes)
    pat_target   = patrimonio_shadow(pat_anterior, r_target, aportes)

    # Gatilhos
    hodl11_pct = args.hodl11_pct
    if hodl11_pct is None and detalhes_etfs.get("HODL11.SA") is not None:
        hodl11_valor_aprox = pat_atual * 0.031  # estimativa; idealmente vem do Bookkeeper
        hodl11_pct = hodl11_valor_aprox / pat_atual
    alertas = verificar_gatilhos(hodl11_pct or 0.031, pat_atual)

    # TLH Monitor (opcional)
    if args.tlh:
        precos_medios = {}
        if args.tlh_config:
            import json
            try:
                precos_medios = json.loads(args.tlh_config)
            except json.JSONDecodeError:
                print("⚠️  --tlh-config inválido. Esperado JSON: '{\"AVUV\": 85.50, ...}'")
        verificar_tlh(precos_medios, usd_brl_fim)

    # Output
    formatar_output(
        periodo_label, pat_atual, pat_anterior, aportes, r_atual,
        {"retorno": r_shadow_a, "pat": pat_shadow_a},
        {"retorno": r_shadow_b, "pat": pat_shadow_b},
        {"retorno": r_shadow_c, "pat": pat_shadow_c},
        {"retorno": r_target,   "pat": pat_target},
        ipca, selic, alertas,
        {k: v for k, v in detalhes_etfs.items() if v is not None}
    )


if __name__ == "__main__":
    main()
