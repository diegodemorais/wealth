"""
Fama-French Global 5-Factor + Momentum regression for JPGL.L, AVGS.L, SWRD.L
Downloads ETF prices via yfinance and FF factors from Ken French's data library.

Uso:
    python3 factor_regression.py                  # regressão estática (janela completa)
    python3 factor_regression.py --rolling         # rolling 24m + alertas de drift
    python3 factor_regression.py --rolling-only    # só rolling, pula estática
"""

import argparse
import io
import zipfile
import urllib.request
import warnings
import numpy as np
import pandas as pd
import yfinance as yf
import statsmodels.api as sm

warnings.filterwarnings("ignore")

parser = argparse.ArgumentParser(description="Factor regression para ETFs da carteira")
parser.add_argument("--rolling",      action="store_true", help="Adiciona análise de rolling loadings (24m, passo trimestral)")
parser.add_argument("--rolling-only", action="store_true", help="Só rolling, pula regressão estática")
args = parser.parse_args()

# ── 1. Download Fama-French Developed 5 Factors ──────────────────────────────

def download_ff_factors(url, skip_footer=0):
    """Download and parse a Fama-French CSV zip file."""
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    resp = urllib.request.urlopen(req, timeout=30)
    z = zipfile.ZipFile(io.BytesIO(resp.read()))
    csv_name = [n for n in z.namelist() if n.endswith(".CSV") or n.endswith(".csv")][0]
    raw = z.read(csv_name).decode("utf-8")

    # Find the monthly data section (first block of numbers)
    lines = raw.split("\n")
    data_lines = []
    started = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if started:
                break  # End of first data block
            continue
        # Check if line starts with a 6-digit date (YYYYMM)
        parts = stripped.split(",")
        if parts[0].strip().isdigit() and len(parts[0].strip()) == 6:
            started = True
            data_lines.append(stripped)
        elif started:
            break

    header_line = None
    for line in lines:
        stripped = line.strip()
        if "Mkt-RF" in stripped or "Mkt_RF" in stripped or "MKT" in stripped:
            header_line = stripped
            break

    if header_line is None:
        # Fallback: use generic headers
        n_cols = len(data_lines[0].split(",")) - 1
        if n_cols == 6:
            cols = ["Mkt-RF", "SMB", "HML", "RMW", "CMA", "RF"]
        elif n_cols == 4:
            cols = ["Mkt-RF", "SMB", "HML", "RF"]
        elif n_cols == 2:
            cols = ["WML", "RF"]
        else:
            cols = [f"F{i}" for i in range(n_cols)]
    else:
        cols = [c.strip() for c in header_line.split(",")[1:]]

    df = pd.DataFrame(
        [line.split(",") for line in data_lines],
        columns=["Date"] + cols
    )
    df["Date"] = pd.to_datetime(df["Date"].str.strip(), format="%Y%m")
    for c in cols:
        df[c] = pd.to_numeric(df[c].str.strip(), errors="coerce")

    # FF data is in percent, convert to decimal
    for c in cols:
        df[c] = df[c] / 100.0

    df = df.set_index("Date")
    return df


print("Downloading Fama-French Developed 5 Factors...")
ff5_url = "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_5_Factors_CSV.zip"
ff5 = download_ff_factors(ff5_url)
print(f"  FF5 range: {ff5.index.min().strftime('%Y-%m')} to {ff5.index.max().strftime('%Y-%m')}, cols: {list(ff5.columns)}")

print("Downloading Fama-French Developed Momentum Factor...")
mom_url = "https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/ftp/Developed_Mom_Factor_CSV.zip"
mom = download_ff_factors(mom_url)
# Rename momentum column
if "WML" in mom.columns:
    mom = mom.rename(columns={"WML": "MOM"})
elif len(mom.columns) >= 1 and mom.columns[0] != "MOM":
    mom = mom.rename(columns={mom.columns[0]: "MOM"})
print(f"  MOM range: {mom.index.min().strftime('%Y-%m')} to {mom.index.max().strftime('%Y-%m')}, cols: {list(mom.columns)}")

# Merge factors
factors = ff5.join(mom[["MOM"]], how="inner")
print(f"  Merged factors: {factors.index.min().strftime('%Y-%m')} to {factors.index.max().strftime('%Y-%m')}")
print(f"  Columns: {list(factors.columns)}")
print()

# ── 2. Download ETF Prices ───────────────────────────────────────────────────

etfs = {"JPGL.L": "JPM Global Equity Multi-Factor",
        "AVGS.L": "Avantis Global Small Cap Value",
        "SWRD.L": "iShares MSCI World (Market Cap)"}

start_date = "2019-07-01"
end_date = "2026-03-31"

print("Downloading ETF prices...")
prices = {}
for ticker, name in etfs.items():
    try:
        data = yf.download(ticker, start=start_date, end=end_date, auto_adjust=True, progress=False)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        prices[ticker] = data["Close"]
        print(f"  {ticker}: {len(data)} days, {data.index[0].strftime('%Y-%m-%d')} to {data.index[-1].strftime('%Y-%m-%d')}")
    except Exception as e:
        print(f"  ERROR downloading {ticker}: {e}")

# ── 3. Calculate Monthly Returns ─────────────────────────────────────────────

print("\nCalculating monthly returns...")
monthly_returns = {}
for ticker, price_series in prices.items():
    # Resample to month-end, take last price
    monthly = price_series.resample("ME").last()
    ret = monthly.pct_change().dropna()
    # Align index to first of month for FF matching
    ret.index = ret.index.to_period("M").to_timestamp()
    monthly_returns[ticker] = ret
    print(f"  {ticker}: {len(ret)} monthly returns")

returns_df = pd.DataFrame(monthly_returns)

# ── 4. Merge with Factors ────────────────────────────────────────────────────

# Align dates
merged = returns_df.join(factors, how="inner")
print(f"\nMerged dataset: {len(merged)} months ({merged.index.min().strftime('%Y-%m')} to {merged.index.max().strftime('%Y-%m')})")

# Calculate excess returns
for ticker in etfs:
    if ticker in merged.columns:
        merged[f"{ticker}_excess"] = merged[ticker] - merged["RF"]

# ── 5. Run Regressions ──────────────────────────────────────────────────────

if args.rolling_only:
    print("(--rolling-only: pulando regressão estática)\n")

factor_cols = ["Mkt-RF", "SMB", "HML", "RMW", "CMA", "MOM"]
# Check which factor cols actually exist
available_factors = [f for f in factor_cols if f in merged.columns]
print(f"Available factors: {available_factors}")
print()

results = {}
for ticker, name in etfs.items():
    if args.rolling_only:
        break
    excess_col = f"{ticker}_excess"
    if excess_col not in merged.columns:
        print(f"Skipping {ticker} — no data")
        continue

    y = merged[excess_col].dropna()
    X = merged.loc[y.index, available_factors].dropna()
    y = y.loc[X.index]

    X_const = sm.add_constant(X)
    model = sm.OLS(y, X_const).fit(cov_type="HC1")  # Heteroskedasticity-robust
    results[ticker] = model

    print(f"{'='*70}")
    print(f" {ticker} — {name}")
    print(f"{'='*70}")
    print(f" N = {model.nobs:.0f} months | R² = {model.rsquared:.4f} | Adj R² = {model.rsquared_adj:.4f}")
    print(f" Alpha (monthly) = {model.params['const']:.5f} | Alpha (annualized) = {model.params['const']*12:.4f} ({model.params['const']*12*100:.2f}%)")
    print(f" Alpha t-stat = {model.tvalues['const']:.3f} | p-value = {model.pvalues['const']:.4f}")
    print()
    print(f" {'Factor':<10} {'Beta':>8} {'t-stat':>8} {'p-value':>8} {'Sig':>5}")
    print(f" {'-'*42}")
    for f in available_factors:
        beta = model.params[f]
        tstat = model.tvalues[f]
        pval = model.pvalues[f]
        sig = "***" if pval < 0.01 else "**" if pval < 0.05 else "*" if pval < 0.10 else ""
        print(f" {f:<10} {beta:>8.4f} {tstat:>8.3f} {pval:>8.4f} {sig:>5}")
    print()

# ── 6. Side-by-Side Comparison ───────────────────────────────────────────────

if not args.rolling_only and results:
    print(f"\n{'='*70}")
    print(f" SIDE-BY-SIDE COMPARISON")
    print(f"{'='*70}")
    print()

    header = f"{'Metric':<25}"
    for ticker in etfs:
        if ticker in results:
            header += f" {ticker:>12}"
    print(header)
    print("-" * (25 + 13 * len(results)))

    row = f"{'Alpha (ann. %)' :<25}"
    for ticker in etfs:
        if ticker in results:
            val = results[ticker].params['const'] * 12 * 100
            row += f" {val:>11.2f}%"
    print(row)

    row = f"{'Alpha t-stat' :<25}"
    for ticker in etfs:
        if ticker in results:
            val = results[ticker].tvalues['const']
            row += f" {val:>12.3f}"
    print(row)

    row = f"{'R²' :<25}"
    for ticker in etfs:
        if ticker in results:
            val = results[ticker].rsquared
            row += f" {val:>12.4f}"
    print(row)

    for f in available_factors:
        row = f"{f + ' beta':<25}"
        for ticker in etfs:
            if ticker in results:
                val = results[ticker].params[f]
                pval = results[ticker].pvalues[f]
                sig = "***" if pval < 0.01 else "**" if pval < 0.05 else "*" if pval < 0.10 else ""
                row += f" {val:>8.4f}{sig:>4}"
            else:
                row += f" {'N/A':>12}"
        print(row)

    print()
    print("Factor t-statistics:")
    for f in available_factors:
        row = f"  {f + ' t-stat':<23}"
        for ticker in etfs:
            if ticker in results:
                val = results[ticker].tvalues[f]
                row += f" {val:>12.3f}"
        print(row)

    print()
    row = f"{'N months' :<25}"
    for ticker in etfs:
        if ticker in results:
            val = results[ticker].nobs
            row += f" {val:>12.0f}"
    print(row)

    print(f"\n{'='*70}")
    print(" Notes:")
    print(" - Factors: Fama-French Developed Markets 5 Factors + Momentum")
    print(" - ETF returns in native currency (GBP-denominated LSE listings)")
    print(" - Robust standard errors (HC1)")
    print(f" - Sample: {merged.index.min().strftime('%Y-%m')} to {merged.index.max().strftime('%Y-%m')}")
    print(f"{'='*70}")


# ── 7. Rolling Factor Loadings ────────────────────────────────────────────────

if args.rolling or args.rolling_only:

    WINDOW = 24    # meses
    STEP   = 3     # passo trimestral

    # Gatilhos de alerta (FI-rolling-loadings)
    ALERTS = {
        "JPGL.L": {
            "Market": {"threshold": 0.70, "direction": "above",
                       "label": "⚠️  JPGL Market beta > 0.70 — low-vol overlay se perdendo"},
        },
        "AVGS.L": {
            "SMB":    {"threshold": 0.35, "direction": "below",
                       "label": "⚠️  AVGS SMB < 0.35 — small-cap tilt se diluindo"},
        },
    }

    ROLLING_TICKERS = ["JPGL.L", "AVGS.L"]

    print(f"\n{'='*70}")
    print(f" ROLLING FACTOR LOADINGS — janela {WINDOW}m, passo {STEP}m (trimestral)")
    print(f" Gatilhos: JPGL Market>0.70 | AVGS SMB<0.35 | loading muda sinal")
    print(f"{'='*70}")

    rolling_data = {}

    for ticker in ROLLING_TICKERS:
        excess_col = f"{ticker}_excess"
        if excess_col not in merged.columns:
            print(f"  {ticker}: sem dados, pulando.")
            continue

        windows = []
        idx = list(merged.index)
        n = len(idx)

        i = WINDOW - 1
        while i < n:
            window_df = merged.iloc[i - WINDOW + 1 : i + 1]
            y = window_df[excess_col].dropna()
            X = window_df.loc[y.index, available_factors].dropna()
            y = y.loc[X.index]
            if len(y) < 18:
                i += STEP
                continue
            X_const = sm.add_constant(X)
            model = sm.OLS(y, X_const).fit()
            row_data = {
                "end":    idx[i],
                "n":      int(model.nobs),
                "alpha":  model.params["const"] * 12 * 100,
                "Market": model.params.get("Mkt-RF", np.nan),
                "SMB":    model.params.get("SMB",   np.nan),
                "HML":    model.params.get("HML",   np.nan),
                "RMW":    model.params.get("RMW",   np.nan),
                "MOM":    model.params.get("MOM",   np.nan),
            }
            windows.append(row_data)
            i += STEP

        if not windows:
            print(f"  {ticker}: janelas insuficientes.")
            continue

        df_roll = pd.DataFrame(windows).set_index("end")
        rolling_data[ticker] = df_roll

        print(f"\n── {ticker} — últimas 8 janelas (trimestral) ──────────────────")
        print(f"  {'Data':<10}  {'Market':>7}  {'SMB':>7}  {'HML':>7}  {'RMW':>7}  {'MOM':>7}  {'Alpha%':>7}  N")
        print(f"  {'-'*72}")
        display_rows = df_roll.tail(8)
        for date, r in display_rows.iterrows():
            print(f"  {date.strftime('%Y-%m'):<10}  {r['Market']:>7.3f}  {r['SMB']:>7.3f}  "
                  f"{r['HML']:>7.3f}  {r['RMW']:>7.3f}  {r['MOM']:>7.3f}  "
                  f"{r['alpha']:>6.1f}%  {r['n']}")

    # ── Verificação de alertas ─────────────────────────────────────────────────

    print(f"\n{'='*70}")
    print(f" ALERTAS DE DRIFT (2 trimestres consecutivos)")
    print(f"{'='*70}")

    alerts_found = []

    for ticker, df_roll in rolling_data.items():
        # 1. Gatilhos de threshold por fator
        if ticker in ALERTS:
            for factor, cfg in ALERTS[ticker].items():
                if factor not in df_roll.columns:
                    continue
                series = df_roll[factor].dropna()
                if len(series) < 2:
                    continue
                thresh = cfg["threshold"]
                direction = cfg["direction"]
                if direction == "above":
                    breaches = series > thresh
                else:
                    breaches = series < thresh
                # 2 consecutivos
                consec = breaches & breaches.shift(1).fillna(False)
                if consec.any():
                    last_breach = consec[consec].index[-1]
                    val = series.loc[last_breach]
                    alerts_found.append(f"  🔴 {cfg['label']}")
                    alerts_found.append(f"     Último breach: {last_breach.strftime('%Y-%m')}  valor={val:.3f}")
                elif breaches.iloc[-1]:
                    val = series.iloc[-1]
                    alerts_found.append(f"  🟡 {cfg['label'].replace('⚠️  ', '')} — 1 trimestre (monitorar)")
                    alerts_found.append(f"     Último valor: {series.index[-1].strftime('%Y-%m')}  valor={val:.3f}")

        # 2. Mudança de sinal em qualquer fator (2 trimestres)
        for factor in ["Market", "SMB", "HML", "RMW", "MOM"]:
            if factor not in df_roll.columns:
                continue
            series = df_roll[factor].dropna()
            if len(series) < 2:
                continue
            signs = np.sign(series)
            sign_change = signs != signs.shift(1)
            consec_change = sign_change & sign_change.shift(1).fillna(False)
            if consec_change.any():
                last = consec_change[consec_change].index[-1]
                val_now = series.loc[last]
                val_prev = series.iloc[list(series.index).index(last) - 1]
                alerts_found.append(
                    f"  🟡 {ticker} {factor} mudou sinal por 2 trimestres "
                    f"({val_prev:+.3f} → {val_now:+.3f}, até {last.strftime('%Y-%m')})"
                )

    if alerts_found:
        for line in alerts_found:
            print(line)
    else:
        print("  ✅ Nenhum alerta ativo — loadings estáveis.")

    # ── Resumo de tendência ────────────────────────────────────────────────────

    print(f"\n{'='*70}")
    print(f" TENDÊNCIA — primeiro vs último trimestre disponível")
    print(f"{'='*70}")
    for ticker, df_roll in rolling_data.items():
        if len(df_roll) < 2:
            continue
        first = df_roll.iloc[0]
        last  = df_roll.iloc[-1]
        print(f"\n  {ticker}  ({df_roll.index[0].strftime('%Y-%m')} → {df_roll.index[-1].strftime('%Y-%m')})")
        print(f"  {'Fator':<8}  {'Primeiro':>9}  {'Último':>9}  {'Delta':>9}  Tendência")
        print(f"  {'-'*52}")
        for factor in ["Market", "SMB", "HML", "RMW", "MOM"]:
            if factor not in df_roll.columns:
                continue
            v_first = first[factor]
            v_last  = last[factor]
            delta   = v_last - v_first
            trend   = "↑" if delta > 0.05 else ("↓" if delta < -0.05 else "→")
            print(f"  {factor:<8}  {v_first:>9.3f}  {v_last:>9.3f}  {delta:>+9.3f}  {trend}")

    print(f"\n  Janela: {WINDOW} meses | Passo: {STEP} meses | "
          f"Sample: {merged.index.min().strftime('%Y-%m')} → {merged.index.max().strftime('%Y-%m')}")
    print(f"{'='*70}")
