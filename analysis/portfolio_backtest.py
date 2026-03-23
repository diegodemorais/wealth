"""
Backtest e Fronteira Eficiente — Carteira Diego Morais
======================================================
Período: dez/2019 a fev/2026 (75 meses)

PROXIES EQUITY (USD — bloco equity, fronteira eficiente):
  SWRD  → ACWI   (iShares MSCI ACWI — proxy MSCI World)
  AVGS  → AVUV + AVDV 60/40  (Avantis US SCV + Intl SCV)
  AVEM  → VWO    (Vanguard EM)
  JPGL  → JPGL.L (JPMorgan Multi-Factor UCITS, LSE)
  BTC   → BTC-USD (satélite 3%)

SHADOWS (BRL — perspectiva real de Diego):
  VWRA       → VT (Vanguard Total World, USD) convertido para BRL via USDBRL real
  IPCA+ MtM  → IB5M11.SA (ETF IMA-B5+, duration ~10-12 anos, dados reais ANBIMA/B3)
               [Diego tem TD2040/2050, duration ~14 anos — IB5M11 é o melhor proxy disponível]
  IPCA+ HTM  → BCB IPCA (série 433) + 3 cenários de spread real (5%, 6%, 7%)
               [representa o carrego puro, sem risco de duration]

CUSTOS ALL-IN APLICADOS:
  Equity (UCITS):
    - WHT dividendos: 0.22% aa (15% WHT sobre ~1.5% yield, peso US via UCITS Irlanda)
    - IOF entrada + saída: 1.1% + 1.1% = 2.2% (amortizado sobre o período)
    - FX spread Okegen entrada + saída: 0.25% + 0.25% = 0.5% (amortizado)
    - Total transação: 2.70% amortizado
    - IR: 15% sobre ganho nominal BRL (Lei 14.754, realização ao final)

  IPCA+ HTM (Tesouro Direto):
    - B3 custódia: 0.20% aa (amortizado mensalmente)
    - IR: 15% sobre ganho nominal BRL (>720 dias = alíquota 15%)
    - Sem MtM — carrego puro

  IPCA+ MtM (IB5M11 referência):
    - TER do ETF: já embutido no preço
    - IR: 15% sobre ganho nominal BRL (para comparação justa)
"""

import requests
import yfinance as yf
import pandas as pd
import numpy as np
import riskfolio as rp
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import warnings, os
warnings.filterwarnings('ignore')

OUT = os.path.join(os.path.dirname(__file__), 'backtest_output')
os.makedirs(OUT, exist_ok=True)

RF_USD_MONTHLY  = 0.004    # ~4.8% aa proxy USD risk-free
RF_BRL_MONTHLY  = 0.01     # ~12.7% aa proxy Selic média período (Sharpe BRL)
IR_RATE         = 0.15     # 15% IR sobre ganho nominal BRL (>720 dias)

# Custos equity UCITS (mensais / totais)
WHT_ANNUAL      = 0.0022   # 0.22% aa — WHT dividendos UCITS Irlanda
IOF_FX_TOTAL    = 0.0270   # 2.70% total (IOF 1.1% × 2 + Okegen 0.25% × 2)

# Custo IPCA+ Tesouro Direto
B3_CUSTODY_ANNUAL = 0.0020  # 0.20% aa — custódia B3

# Spreads IPCA+ HTM (cenários)
HTM_SPREADS = {'Conservador (5%)': 0.05, 'Médio (6%)': 0.06, 'Atual (7%)': 0.07}

# ─── 1. DADOS EQUITY (USD) ───────────────────────────────────────────────────

TICKERS = {
    'SWRD': 'ACWI',
    'ZPRV': 'AVUV',
    'ZPRX': 'AVDV',
    'AVEM': 'VWO',
    'JPGL': 'JPGL.L',
    'BTC':  'BTC-USD',
}

print("Baixando dados equity (USD)...")
raw_dl = yf.download(list(TICKERS.values()), start='2019-11-01', end='2026-03-01',
                     interval='1mo', auto_adjust=True, progress=False)['Close']
ticker_to_key = {v: k for k, v in TICKERS.items()}
raw_dl.columns = [ticker_to_key.get(c, c) for c in raw_dl.columns]
raw = raw_dl[list(TICKERS.keys())].dropna()
raw.index = pd.to_datetime(raw.index)
raw['AVGS'] = 0.60 * raw['ZPRV'] + 0.40 * raw['ZPRX']

EQUITY = ['SWRD', 'AVGS', 'AVEM', 'JPGL']
ALL    = EQUITY + ['BTC']
prices_eq  = raw[EQUITY].copy()
prices_all = raw[ALL].copy()
ret_eq_usd  = prices_eq.pct_change().dropna()
ret_all_usd = prices_all.pct_change().dropna()

print(f"Equity: {ret_eq_usd.index[0].date()} → {ret_eq_usd.index[-1].date()} ({len(ret_eq_usd)} meses)")

# ─── 2. DADOS SHADOW (BRL) ───────────────────────────────────────────────────

print("\nBaixando dados shadow...")

# USDBRL=X: quantos BRL por 1 USD (sobe = BRL deprecia)
usdbrl = yf.download('USDBRL=X', start='2019-11-01', end='2026-03-01',
                      interval='1mo', auto_adjust=True, progress=False)['Close'].squeeze()
usdbrl.index = pd.to_datetime(usdbrl.index).to_period('M').to_timestamp()
fx_chg = usdbrl.pct_change().dropna()  # positivo = BRL depreciou

# VWRA → VT (Vanguard Total World, USD)
vt = yf.download('VT', start='2019-11-01', end='2026-03-01',
                  interval='1mo', auto_adjust=True, progress=False)['Close'].squeeze()
vt.index = pd.to_datetime(vt.index).to_period('M').to_timestamp()
ret_vt_usd = vt.pct_change().dropna()

# IPCA+ MtM → IB5M11.SA (ETF IMA-B5+, duration ~10-12 anos, dados reais ANBIMA)
ib5m = yf.download('IB5M11.SA', start='2019-11-01', end='2026-03-01',
                    interval='1mo', auto_adjust=True, progress=False)['Close'].squeeze()
ib5m.index = pd.to_datetime(ib5m.index).to_period('M').to_timestamp()
ret_ib5m_brl = ib5m.pct_change().dropna()

print(f"  IB5M11.SA (IMA-B5+): {ret_ib5m_brl.index[0].date()} → {ret_ib5m_brl.index[-1].date()}")

# IPCA mensal → BCB série 433
def fetch_ipca():
    url = ("https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados"
           "?formato=json&dataInicial=01/11/2019&dataFinal=01/03/2026")
    try:
        r = requests.get(url, timeout=15)
        df = pd.DataFrame(r.json())
        df['data'] = pd.to_datetime(df['data'], format='%d/%m/%Y')
        df['valor'] = df['valor'].str.replace(',', '.').astype(float) / 100
        df = df.set_index('data').sort_index()
        df.index = df.index.to_period('M').to_timestamp()
        print(f"  BCB IPCA: {len(df)} meses ({df.index[0].date()} → {df.index[-1].date()})")
        return df['valor']
    except Exception as e:
        print(f"  BCB IPCA erro: {e} — fallback 0.41%/mês")
        return None

ipca_monthly = fetch_ipca()

# ─── 3. PERÍODO COMUM ────────────────────────────────────────────────────────

eq_idx = ret_eq_usd.copy()
eq_idx.index = eq_idx.index.to_period('M').to_timestamp()

common = (eq_idx.index
          .intersection(ret_vt_usd.index)
          .intersection(fx_chg.index)
          .intersection(ret_ib5m_brl.index))

if ipca_monthly is not None:
    common = common.intersection(ipca_monthly.index)

eq_c   = eq_idx.loc[common]
vt_c   = ret_vt_usd.reindex(common)
fx_c   = fx_chg.reindex(common)
ib5m_c = ret_ib5m_brl.reindex(common)
ipca_c = ipca_monthly.reindex(common) if ipca_monthly is not None else None

n_months = len(common)
print(f"\nPeríodo comum: {common[0].date()} → {common[-1].date()} ({n_months} meses)\n")

# ─── 4. FUNÇÕES DE CUSTO ─────────────────────────────────────────────────────

def to_brl(ret_usd, fx):
    """USD → BRL: (1+r_usd)(1+fx_change) - 1"""
    return (1 + ret_usd) * (1 + fx) - 1

def apply_ir(cum_return):
    """IR 15% sobre ganho nominal BRL total (aplicado ao final)."""
    gain = max(cum_return - 1, 0)  # só tributa se tiver ganho
    return cum_return - IR_RATE * gain

def net_cagr(cum_value, n):
    """CAGR a partir de valor cumulativo final."""
    return cum_value ** (12 / n) - 1

# Equity all-in costs (mensais)
WHT_MONTHLY      = WHT_ANNUAL / 12          # 0.018%/mês
IOF_FX_MONTHLY   = IOF_FX_TOTAL / n_months  # 0.036%/mês (amortizado)
B3_MONTHLY       = B3_CUSTODY_ANNUAL / 12   # 0.017%/mês

def equity_net_monthly(ret_brl):
    """Aplica WHT + IOF/FX drag mensal (IR separado no final)."""
    return ret_brl - WHT_MONTHLY - IOF_FX_MONTHLY

def ipca_htm_monthly(spread_annual):
    """
    IPCA+ HTM: carrego puro sem risco de duration.
    Retorno BRL = (1+IPCA_mensal)(1+spread_mensal) - 1 - custo_custodia_mensal
    """
    if ipca_c is None:
        return None
    spread_monthly = (1 + spread_annual) ** (1/12) - 1
    r = (1 + ipca_c) * (1 + spread_monthly) - 1
    return r - B3_MONTHLY

# ─── 5. PORTFÓLIOS ───────────────────────────────────────────────────────────

_atual_raw = {'SWRD': 36.8, 'AVGS': 27.9, 'AVEM': 24.2, 'JPGL': 0.3}
W_ATUAL = pd.Series(_atual_raw) / sum(_atual_raw.values())
_tgt_raw  = {'SWRD': 35.0, 'AVGS': 25.0, 'AVEM': 20.0, 'JPGL': 20.0}
W_TARGET = pd.Series(_tgt_raw) / sum(_tgt_raw.values())

# USD (bruto)
r_atual_usd  = eq_c[EQUITY].dot(W_ATUAL)
r_target_usd = eq_c[EQUITY].dot(W_TARGET)

# BRL bruto
r_atual_brl_gross  = to_brl(r_atual_usd,  fx_c)
r_target_brl_gross = to_brl(r_target_usd, fx_c)
r_vt_brl_gross     = to_brl(vt_c,         fx_c)

# BRL líquido (drag mensal — IR aplicado separadamente)
r_atual_brl_net  = equity_net_monthly(r_atual_brl_gross)
r_target_brl_net = equity_net_monthly(r_target_brl_gross)
r_vt_brl_net     = equity_net_monthly(r_vt_brl_gross)

# IPCA+ MtM (IB5M11): sem drag adicional (TER no preço), só IR no final
r_ib5m_net = ib5m_c  # IR aplicado no final via apply_ir

# IPCA+ HTM cenários
htm_returns = {}
for label, spread in HTM_SPREADS.items():
    r = ipca_htm_monthly(spread)
    if r is not None:
        htm_returns[label] = r

# ─── 6. MÉTRICAS ─────────────────────────────────────────────────────────────

def calc_metrics(r, label, rf=RF_USD_MONTHLY):
    r = r.dropna()
    if len(r) < 3:
        return {'Label': label, **{k: 'n/a' for k in
                ['CAGR','Vol (aa)','Sharpe','Sortino','Max DD','Ulcer','Martin']}}
    ann = 12
    mu    = r.mean() * ann
    sigma = r.std() * np.sqrt(ann)
    sharpe = (r.mean() - rf) / r.std() * np.sqrt(ann) if r.std() > 0 else np.nan
    neg = r[r < rf] - rf
    ds = np.sqrt((neg**2).mean()) * np.sqrt(ann) if len(neg) > 0 else np.nan
    sortino_val = (r.mean() - rf) * ann / ds if (ds is not np.nan and ds > 0) else np.nan
    cum = (1 + r).cumprod()
    dd  = (cum - cum.cummax()) / cum.cummax()
    mdd = dd.min()
    calmar = mu / abs(mdd) if mdd != 0 else np.nan
    ulcer  = np.sqrt((dd**2).mean()) * 100
    martin = (r.mean() - rf) * ann / (ulcer / 100) if ulcer > 0 else np.nan
    cvar5  = r[r <= r.quantile(0.05)].mean()
    return {
        'Label':     label,
        'CAGR':      f"{mu:.1%}",
        'Vol (aa)':  f"{sigma:.1%}",
        'Sharpe':    f"{sharpe:.2f}" if sharpe is not np.nan else 'n/a',
        'Sortino':   f"{sortino_val:.2f}" if sortino_val is not np.nan else 'n/a',
        'Max DD':    f"{mdd:.1%}",
        'Calmar':    f"{calmar:.2f}" if calmar is not np.nan else 'n/a',
        'Ulcer':     f"{ulcer:.1f}",
        'Martin':    f"{martin:.2f}" if martin is not np.nan else 'n/a',
        'CVaR 95%':  f"{cvar5:.2%}",
    }

def net_metrics(r_monthly, label, rf=RF_BRL_MONTHLY):
    """Métricas + CAGR líquido após IR (aplicado ao valor cumulativo final)."""
    r = r_monthly.dropna()
    m = calc_metrics(r, label, rf=rf)
    # CAGR líquido pós-IR
    cum_val  = (1 + r).cumprod().iloc[-1]
    cum_net  = apply_ir(cum_val)
    cagr_net = net_cagr(cum_net, len(r))
    m['CAGR líq IR'] = f"{cagr_net:.1%}"
    m['Ganho bruto'] = f"{cum_val - 1:.1%}"
    m['Ganho líq IR'] = f"{cum_net - 1:.1%}"
    return m

# ─── 7. TABELA INDIVIDUAL USD ─────────────────────────────────────────────────

rows_ind = []
for a in EQUITY + ['BTC']:
    rows_ind.append(calc_metrics(eq_c[a] if a in eq_c else
                                 ret_all_usd[a].reindex(common).dropna(), a))
rows_ind += [calc_metrics(r_atual_usd,  'Atual (eq, USD)'),
             calc_metrics(r_target_usd, 'Target (eq, USD)'),
             calc_metrics(vt_c,         'VWRA (VT, USD)')]
df_ind = pd.DataFrame(rows_ind).set_index('Label')

print("=" * 80)
print("MÉTRICAS INDIVIDUAIS — USD  (bloco equity, sem custos)")
print("=" * 80)
print(df_ind[['CAGR','Vol (aa)','Sharpe','Sortino','Max DD','Ulcer','Martin']].to_string())

# ─── 8. FRONTEIRA EFICIENTE (USD) ────────────────────────────────────────────

port = rp.Portfolio(returns=eq_c[EQUITY])
port.assets_stats(method_mu='hist', method_cov='ledoit')

OPT_MODES = [
    ('Max Sharpe',        'MV',   'Sharpe'),
    ('Min Volatilidade',  'MV',   'MinRisk'),
    ('Max Sortino',       'FLPM', 'Sharpe'),
    ('Min CVaR',          'CVaR', 'MinRisk'),
    ('Max CDaR-Sharpe',   'CDaR', 'Sharpe'),
    ('Min Ulcer (UCI)',   'UCI',  'MinRisk'),
    ('Max Martin (UCI)',  'UCI',  'Sharpe'),
    ('Equal Risk (ERC)',  'MV',   'ERC'),
]
opt_results, opt_weights = [], {}

print("\n" + "=" * 80)
print("PORTFÓLIOS OTIMIZADOS — Fronteira Eficiente (bloco equity, USD, sem custos)")
print("=" * 80)

for label, rm, obj in OPT_MODES:
    try:
        w = (port.rp_optimization(model='Classic', rm=rm, rf=RF_USD_MONTHLY, b=None, hist=True)
             if obj == 'ERC' else
             port.optimization(model='Classic', rm=rm, obj=obj, rf=RF_USD_MONTHLY, l=0, hist=True))
        if w is None:
            print(f"  {label}: sem solução"); continue
        ws = w['weights']
        r_opt = eq_c[EQUITY].dot(ws)
        m = calc_metrics(r_opt, label)
        m['Pesos'] = ' | '.join(f"{a}:{ws[a]:.0%}" for a in EQUITY)
        opt_results.append(m); opt_weights[label] = ws
        print(f"\n{label}  [{m['Pesos']}]")
        for k in ['CAGR','Vol (aa)','Sharpe','Max DD','Ulcer','Martin']:
            print(f"  {k}: {m[k]}")
    except Exception as e:
        print(f"  {label}: erro — {e}")

# ─── 9. COMPARATIVO USD ──────────────────────────────────────────────────────

print("\n" + "=" * 80)
print("COMPARATIVO — USD (equity + VWRA, sem custos)")
print("=" * 80)
rows_usd = [calc_metrics(r_atual_usd,  'Atual'),
            calc_metrics(r_target_usd, 'Target')]
for m in opt_results:
    rows_usd.append({k: v for k, v in m.items() if k != 'Pesos'})
rows_usd.append(calc_metrics(vt_c, 'VWRA (VT)'))
df_usd = pd.DataFrame(rows_usd).set_index('Label')
cols_usd = ['CAGR','Vol (aa)','Sharpe','Sortino','Max DD','Calmar','Ulcer','Martin']
print(df_usd[cols_usd].to_string())

# ─── 10. PESOS ───────────────────────────────────────────────────────────────

print("\n" + "=" * 80)
print("PESOS — PORTFÓLIOS EQUITY")
print("=" * 80)
rows_w = [{'Portfolio': 'Atual',  **{a: f"{W_ATUAL[a]:.1%}"  for a in EQUITY}},
          {'Portfolio': 'Target', **{a: f"{W_TARGET[a]:.1%}" for a in EQUITY}}]
for lbl, ws in opt_weights.items():
    rows_w.append({'Portfolio': lbl, **{a: f"{ws[a]:.1%}" for a in EQUITY}})
df_w = pd.DataFrame(rows_w).set_index('Portfolio')
print(df_w.to_string())

# ─── 11. COMPARATIVO BRL + ALL-IN COSTS ──────────────────────────────────────

print("\n" + "=" * 80)
print("COMPARATIVO ALL-IN — BRL (custos reais aplicados)")
print(f"Custos equity: WHT {WHT_ANNUAL:.2%}/aa + IOF+FX {IOF_FX_TOTAL:.2%} amortizado + IR {IR_RATE:.0%}")
print(f"Custos IPCA+ TD: B3 custódia {B3_CUSTODY_ANNUAL:.2%}/aa + IR {IR_RATE:.0%}")
print("=" * 80)

shadow_rows = []
for r, lbl in [
    (r_atual_brl_net,  'Atual (eq, BRL, all-in)'),
    (r_target_brl_net, 'Target (eq, BRL, all-in)'),
    (r_vt_brl_net,     'VWRA/VT (BRL, all-in)'),
]:
    shadow_rows.append(net_metrics(r, lbl))

# IPCA+ MtM — IB5M11 (TER no preço, só IR no final)
shadow_rows.append(net_metrics(r_ib5m_net, 'IPCA+ MtM IB5M11 (IMA-B5+)'))

# IPCA+ HTM cenários
for lbl, r in htm_returns.items():
    shadow_rows.append(net_metrics(r, f'IPCA+ HTM {lbl}'))

df_shadow = pd.DataFrame(shadow_rows).set_index('Label')
cols_sh = ['CAGR','Vol (aa)','Sharpe','Max DD','Ulcer','Martin','CAGR líq IR','Ganho bruto','Ganho líq IR']
print(df_shadow[cols_sh].to_string())

print(f"""
Notas custos all-in:
  Equity:
    CAGR (col) = retorno bruto BRL (antes IR). CAGR líq IR = após 15% sobre ganho nominal.
    Drag mensal: WHT {WHT_MONTHLY:.4%}/mês + IOF+FX {IOF_FX_MONTHLY:.4%}/mês (amortizado).
    IR aplicado: 15% × (valor_final_líq_drag - 1), pagos na realização.

  IPCA+ MtM (IB5M11):
    TER já embutido no preço do ETF. IR 15% sobre ganho nominal BRL ao final.
    Duration IB5M11 ≈ 10-12 anos. Diego tem ~14 anos (TD2040/2050).
    Retorno MtM — inclui duration risk (perda de preço quando yield sobe).
    No período 2020-2023 yields subiram ~3.5% → 6.5%, causando perda de preço significativa.

  IPCA+ HTM cenários:
    Carrego puro: (1+IPCA_mensal)(1+spread_mensal)-1 - custódia B3 {B3_MONTHLY:.4%}/mês.
    Sem duration risk — representa o retorno de quem segura até o vencimento.
    Spread 5% = conservador (yield médio 2020-2022).
    Spread 6% = aprovado HD-006 como retorno realista.
    Spread 7% = yield atual (dez/2024-fev/2026, o que Diego está comprando hoje).
    IR 15% sobre ganho nominal BRL (IPCA acumulado + spread acumulado).
""")

# ─── 12. TABELA RESUMO EXECUTIVO ──────────────────────────────────────────────

print("=" * 80)
print("RESUMO EXECUTIVO — CAGR BRUTO vs LÍQUIDO BRL (período completo)")
print("=" * 80)

def summary_row(r_monthly, label, rf=RF_BRL_MONTHLY):
    r = r_monthly.dropna()
    cagr_gross = r.mean() * 12
    sigma = r.std() * 12**0.5
    cum = (1 + r).cumprod().iloc[-1]
    cum_net = apply_ir(cum)
    cagr_net_v = net_cagr(cum_net, len(r))
    mdd = ((1 + r).cumprod() / (1 + r).cumprod().cummax() - 1).min()
    return {
        'Portfólio': label,
        'CAGR bruto': f"{cagr_gross:.1%}",
        'CAGR líq IR': f"{cagr_net_v:.1%}",
        'Vol': f"{sigma:.1%}",
        'Max DD': f"{mdd:.1%}",
        'Ganho total líq': f"{cum_net - 1:.1%}",
    }

resumo = []
for r, lbl in [
    (r_target_brl_net,  'Target (BRL)'),
    (r_vt_brl_net,      'VWRA/VT (BRL)'),
    (r_ib5m_net,        'IPCA+ MtM IB5M11'),
]:
    resumo.append(summary_row(r, lbl))
for lbl, r in htm_returns.items():
    resumo.append(summary_row(r, f'IPCA+ HTM {lbl}'))
df_resumo = pd.DataFrame(resumo).set_index('Portfólio')
print(df_resumo.to_string())

# ─── 13. PLOTS ───────────────────────────────────────────────────────────────

# Plot 1: USD equity — retorno acumulado
fig, ax = plt.subplots(figsize=(14, 7))
(1 + r_atual_usd).cumprod().plot(ax=ax, label='Atual (USD)', color='orange', lw=2.5)
(1 + r_target_usd).cumprod().plot(ax=ax, label='Target (USD)', color='royalblue', lw=2.5)
(1 + vt_c).cumprod().plot(ax=ax, label='VWRA/VT (USD)', color='green', lw=2, ls='-.')
clrs = plt.cm.tab10(np.linspace(0, 1, len(opt_weights)))
for (lbl, ws), c in zip(opt_weights.items(), clrs):
    (1 + eq_c[EQUITY].dot(ws)).cumprod().plot(ax=ax, label=lbl, ls='--', lw=1.1, color=c, alpha=0.7)
ax.set_title("Retorno Acumulado — Bloco Equity USD (bruto)", fontsize=13)
ax.set_ylabel("Valor (base=1.0)")
ax.legend(loc='upper left', fontsize=8, ncol=2); ax.grid(alpha=0.3)
plt.tight_layout(); fig.savefig(os.path.join(OUT, 'cumulative_returns.png'), dpi=150); plt.close()

# Plot 2: Scatter risco/retorno USD
fig, ax = plt.subplots(figsize=(11, 7))
for lbl, ws in opt_weights.items():
    r_o = eq_c[EQUITY].dot(ws)
    ax.scatter(r_o.std()*12**.5*100, r_o.mean()*12*100, s=80, color='gray', zorder=4)
    ax.annotate(lbl, (r_o.std()*12**.5*100, r_o.mean()*12*100),
                textcoords="offset points", xytext=(5,3), fontsize=7)
for rs, lbl, cor, mkr in [
    (r_atual_usd, 'Atual', 'orange', '*'),
    (r_target_usd, 'Target', 'royalblue', 'D'),
    (vt_c, 'VWRA', 'green', 's'),
]:
    v = rs.std()*12**.5*100; rr = rs.mean()*12*100
    ax.scatter(v, rr, s=200, marker=mkr, color=cor, zorder=6, label=lbl)
    ax.annotate(lbl, (v, rr), textcoords="offset points", xytext=(6,4), fontsize=9)
try:
    wf = port.efficient_frontier(model='Classic', rm='MV', points=50,
                                  rf=RF_USD_MONTHLY, hist=True)
    if wf is not None:
        fv = [eq_c[EQUITY].dot(wf[c]).std()*12**.5*100 for c in wf.columns]
        fr = [eq_c[EQUITY].dot(wf[c]).mean()*12*100 for c in wf.columns]
        ax.plot(fv, fr, 'k--', lw=1, alpha=0.4, label='Fronteira MV')
except: pass
ax.set_xlabel("Vol (%)"); ax.set_ylabel("CAGR (%)")
ax.set_title("Risco vs Retorno — Equity USD", fontsize=13)
ax.legend(fontsize=8); ax.grid(alpha=0.3)
plt.tight_layout(); fig.savefig(os.path.join(OUT, 'risk_return.png'), dpi=150); plt.close()

# Plot 3: BRL all-in — comparativo completo
colors_sh = {'Target (BRL)': 'royalblue', 'VWRA/VT (BRL)': 'green',
             'IPCA+ MtM IB5M11': 'red', 'IPCA+ HTM Conservador (5%)': 'plum',
             'IPCA+ HTM Médio (6%)': 'purple', 'IPCA+ HTM Atual (7%)': 'darkviolet'}
fig, ax = plt.subplots(figsize=(14, 7))

for r, lbl in [
    (r_target_brl_net,  'Target (BRL)'),
    (r_vt_brl_net,      'VWRA/VT (BRL)'),
    (r_ib5m_net,        'IPCA+ MtM IB5M11'),
]:
    cum = (1 + r.dropna()).cumprod()
    cum_net_line = cum / cum.iloc[0] * apply_ir(cum.iloc[-1]) / cum.iloc[-1]
    cum.plot(ax=ax, label=lbl + ' (bruto)', color=colors_sh.get(lbl,'gray'), lw=2,
             ls='--' if 'IPCA' in lbl else '-')
    ax.axhline(y=apply_ir(cum.iloc[-1]), color=colors_sh.get(lbl,'gray'),
               ls=':', lw=0.8, alpha=0.5)

for lbl, r in htm_returns.items():
    full_lbl = f'IPCA+ HTM {lbl}'
    cum = (1 + r.dropna()).cumprod()
    cum.plot(ax=ax, label=full_lbl, color=colors_sh.get(full_lbl,'purple'),
             lw=1.5, ls=':')

ax.set_title("Retorno Acumulado BRL — Equity vs IPCA+ (bruto; pontilhado = nível líq IR)", fontsize=12)
ax.set_ylabel("Valor (base=1.0, BRL)")
ax.legend(fontsize=8, ncol=2); ax.grid(alpha=0.3)
plt.tight_layout(); fig.savefig(os.path.join(OUT, 'shadows_brl.png'), dpi=150); plt.close()

# Plot 4: Drawdowns BRL (equity + IPCA+)
series_dd = [
    (r_target_brl_net, 'Target (BRL)', 'royalblue'),
    (r_vt_brl_net,     'VWRA (BRL)',   'green'),
    (r_ib5m_net,       'IPCA+ MtM IB5M11', 'red'),
]
for lbl, r in list(htm_returns.items())[:1]:  # só o spread médio
    series_dd.append((r, f'IPCA+ HTM {lbl}', 'purple'))

fig, axes = plt.subplots(len(series_dd), 1, figsize=(13, 3*len(series_dd)), sharex=True)
for ax_i, (r, lbl, cor) in zip(axes, series_dd):
    cum = (1 + r.dropna()).cumprod()
    dd = (cum - cum.cummax()) / cum.cummax() * 100
    dd.plot(ax=ax_i, color=cor, lw=1.5, label=lbl)
    ax_i.fill_between(dd.index, dd, 0, alpha=0.3, color=cor)
    ax_i.set_ylabel("DD %"); ax_i.legend(loc='lower right', fontsize=8)
    ax_i.axhline(0, color='black', lw=0.5); ax_i.grid(alpha=0.3)
axes[0].set_title("Drawdowns BRL — Equity vs IPCA+ MtM vs HTM", fontsize=12)
plt.tight_layout(); fig.savefig(os.path.join(OUT, 'drawdowns_brl.png'), dpi=150); plt.close()

print(f"\nGráficos salvos em: {OUT}/")
print("  cumulative_returns.png — equity USD bruto")
print("  risk_return.png        — scatter USD")
print("  shadows_brl.png        — BRL all-in: equity vs IPCA+ MtM vs HTM")
print("  drawdowns_brl.png      — drawdowns BRL")
print("\nConcluído.")
