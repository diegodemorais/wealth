"""
Fama-French Global 5-Factor + Momentum regression for JPGL.L, AVGS.L, SWRD.L
Downloads ETF prices via yfinance and FF factors from Ken French's data library.
"""

import io
import zipfile
import urllib.request
import warnings
import numpy as np
import pandas as pd
import yfinance as yf
import statsmodels.api as sm

warnings.filterwarnings("ignore")

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

factor_cols = ["Mkt-RF", "SMB", "HML", "RMW", "CMA", "MOM"]
# Check which factor cols actually exist
available_factors = [f for f in factor_cols if f in merged.columns]
print(f"Available factors: {available_factors}")
print()

results = {}
for ticker, name in etfs.items():
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

print(f"\n{'='*70}")
print(f" SIDE-BY-SIDE COMPARISON")
print(f"{'='*70}")
print()

# Header
header = f"{'Metric':<25}"
for ticker in etfs:
    if ticker in results:
        header += f" {ticker:>12}"
print(header)
print("-" * (25 + 13 * len(results)))

# Alpha annualized
row = f"{'Alpha (ann. %)' :<25}"
for ticker in etfs:
    if ticker in results:
        val = results[ticker].params['const'] * 12 * 100
        row += f" {val:>11.2f}%"
print(row)

# Alpha t-stat
row = f"{'Alpha t-stat' :<25}"
for ticker in etfs:
    if ticker in results:
        val = results[ticker].tvalues['const']
        row += f" {val:>12.3f}"
print(row)

# R²
row = f"{'R²' :<25}"
for ticker in etfs:
    if ticker in results:
        val = results[ticker].rsquared
        row += f" {val:>12.4f}"
print(row)

# Factor betas
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

# Factor t-stats
print()
print("Factor t-statistics:")
for f in available_factors:
    row = f"  {f + ' t-stat':<23}"
    for ticker in etfs:
        if ticker in results:
            val = results[ticker].tvalues[f]
            row += f" {val:>12.3f}"
    print(row)

# N observations
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
