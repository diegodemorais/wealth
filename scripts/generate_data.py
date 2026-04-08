#!/usr/bin/env python3
"""
generate_data.py — Agrega todos os dados da carteira em analysis/dashboard_data.json.

Uso:
    python3 scripts/generate_data.py [--skip-scripts] [--skip-prices]

Flags:
    --skip-scripts  Não roda fire_montecarlo/backtest/fx_utils (usa cache)
    --skip-prices   Não busca preços yfinance (usa dashboard_state.json)

Output:
    analysis/dashboard_data.json  (input para build_dashboard.py)

Pipeline:
    1. Lê config.py  (constantes canônicas)
    2. Lê dashboard_state.json  (posições, P(FIRE), RF — atualizado por outros scripts)
    3. Roda fire_montecarlo.py --anos 11 --tornado   → parseia P(FIRE) + tornado
    4. Roda backtest_portfolio.py                     → parseia séries
    5. Roda fx_utils.py                              → parseia attribution
    6. Lê historico_carteira.csv                     → timeline + bollinger
    7. Lê holdings.md                                → taxas RF
    8. Escreve analysis/dashboard_data.json
"""

import sys, json, subprocess, csv, math, argparse, re
from pathlib import Path
from datetime import date, datetime, timedelta

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from config import (
    PESOS_TARGET, BUCKET_MAP, EQUITY_WEIGHTS,
    PISO_TAXA_IPCA_LONGO, PISO_TAXA_RENDA_PLUS,
    PATRIMONIO_GATILHO, SWR_GATILHO, CUSTO_VIDA_BASE, APORTE_MENSAL,
    IDADE_ATUAL, IDADE_FIRE_ALVO, IDADE_FIRE_ASPIRACIONAL,
    EQUITY_PCT, IPCA_LONGO_PCT, IPCA_CURTO_PCT, CRIPTO_PCT, RENDA_PLUS_PCT,
    TICKERS_YF,
)

VENV_PY = str(Path.home() / "claude/finance-tools/.venv/bin/python3")
STATE_PATH = ROOT / "dados" / "dashboard_state.json"
CSV_PATH   = ROOT / "dados" / "historico_carteira.csv"
HOLDINGS_PATH = ROOT / "dados" / "holdings.md"
LOTES_PATH = ROOT / "analysis" / "backtest_output" / "ibkr_lotes.json"
OUT_PATH   = ROOT / "analysis" / "dashboard_data.json"

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
        m = re.search(r'[Rr]enda\+?\s*2065.*?(\d+[.,]\d+)\s*%', txt)
        if m:
            taxa_renda2065 = float(m.group(1).replace(',', '.'))
    except Exception as e:
        print(f"  ⚠️ holdings.md: {e}")
    return taxa_ipca2040, taxa_renda2065


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
        p.setdefault("saude_base", getattr(mod, "SAUDE_BASE", 18_000))
        return p, g, piso, smile
    except Exception as e:
        print(f"  ⚠️ fire_montecarlo import: {e}")
        # fallback: usar config.py
        return {
            "patrimonio_atual":    None,
            "aporte_mensal":       APORTE_MENSAL,
            "custo_vida_base":     CUSTO_VIDA_BASE,
            "idade_atual":         IDADE_ATUAL,
            "idade_fire_alvo":     IDADE_FIRE_ALVO,
            "idade_fire_aspiracional": IDADE_FIRE_ASPIRACIONAL,
            "patrimonio_gatilho":  PATRIMONIO_GATILHO,
            "swr_gatilho":         SWR_GATILHO,
            "retorno_equity_base": 0.0485,
            "volatilidade_equity": 0.168,
            "ipca_anual":          0.04,
            "inss_anual":          18_000,
            "inss_inicio_ano":     12,
        }, [], 180_000, {}


# ─── 2. P(FIRE) + TORNADO ────────────────────────────────────────────────────
def get_pfire_tornado():
    if args.skip_scripts:
        state = load_state()
        fire = state.get("fire", {})
        return (
            {"base": fire.get("pfire_base"), "fav": fire.get("pfire_fav"), "stress": fire.get("pfire_stress")},
            {"base": fire.get("pfire_base"), "fav": fire.get("pfire_fav"), "stress": fire.get("pfire_stress")},
            []
        )

    print("  ▶ fire_montecarlo.py --anos 11 --tornado ...")
    out, err = run([VENV_PY, "scripts/fire_montecarlo.py", "--anos", "11", "--tornado"], cwd=ROOT)
    if err:
        print(f"  ⚠️ stderr: {err[:200]}")

    # Parsear P(FIRE@50)
    pf50 = {"base": None, "fav": None, "stress": None}
    pf53 = {"base": None, "fav": None, "stress": None}
    for line in out.splitlines():
        # Cenário Base: P(FIRE@50) = 85.4%
        m = re.search(r'P\(FIRE@50\)[^=]*=\s*([\d.]+)%', line)
        if m:
            if "base" in line.lower() or pf50["base"] is None:
                pf50["base"] = float(m.group(1))
        m = re.search(r'P\(FIRE@53\)[^=]*=\s*([\d.]+)%', line)
        if m:
            if "base" in line.lower() or pf53["base"] is None:
                pf53["base"] = float(m.group(1))
        m = re.search(r'[Ff]avorável.*?P\(FIRE@50\)[^=]*=\s*([\d.]+)%', line)
        if m: pf50["fav"] = float(m.group(1))
        m = re.search(r'[Ss]tress.*?P\(FIRE@50\)[^=]*=\s*([\d.]+)%', line)
        if m: pf50["stress"] = float(m.group(1))

    # Tornado — parsear linhas com variavel e ±
    tornado = []
    in_tornado = False
    for line in out.splitlines():
        if "tornado" in line.lower() or "sensibilidade" in line.lower():
            in_tornado = True
        if in_tornado:
            # ex: "  Volatilidade equity   +10%: -4.1pp  -10%: +4.0pp"
            m = re.search(r'(.+?)\s+\+10%[:\s]+([-+]?\d+\.?\d*)pp\s+-10%[:\s]+([-+]?\d+\.?\d*)pp', line)
            if m:
                tornado.append({
                    "variavel": m.group(1).strip(),
                    "mais10": float(m.group(2)),
                    "menos10": float(m.group(3)),
                })

    # Fallback do state
    if pf50["base"] is None:
        state = load_state()
        fire = state.get("fire", {})
        pf50 = {"base": fire.get("pfire_base"), "fav": fire.get("pfire_fav"), "stress": fire.get("pfire_stress")}

    print(f"  → P(FIRE@50): {pf50} | tornado: {len(tornado)} variáveis")
    return pf50, pf53, tornado


# ─── 3. BACKTEST ──────────────────────────────────────────────────────────────
def get_backtest():
    if args.skip_scripts:
        # Tenta ler de arquivo JSON de cache
        cache = ROOT / "analysis" / "backtest_output" / "backtest_cache.json"
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
            cache = ROOT / "analysis" / "backtest_output" / "backtest_cache.json"
            cache.parent.mkdir(exist_ok=True)
            cache.write_text(json.dumps(data, indent=2))
            return data
    except Exception:
        pass

    # Fallback: parsear output texto
    print(f"  ⚠️ backtest JSON não disponível, usando output texto")
    return {}


# ─── 4. ATTRIBUTION ───────────────────────────────────────────────────────────
def get_attribution():
    if args.skip_scripts:
        return None

    print("  ▶ fx_utils.py ...")
    out, err = run([VENV_PY, "scripts/fx_utils.py"], cwd=ROOT)

    attr = {"aportes": None, "retornoUsd": None, "cambio": None, "crescReal": None}
    for line in out.splitlines():
        m = re.search(r'[Aa]portes?.*?R\$\s*([\d_,.]+)', line)
        if m: attr["aportes"] = float(m.group(1).replace('_','').replace(',','.'))
        m = re.search(r'[Rr]etorno\s+USD.*?R\$\s*([\d_,.]+)', line)
        if m: attr["retornoUsd"] = float(m.group(1).replace('_','').replace(',','.'))
        m = re.search(r'[Cc]âmbio.*?R\$\s*([\d_,.]+)', line)
        if m: attr["cambio"] = float(m.group(1).replace('_','').replace(',','.'))

    return attr


# ─── 5. TIMELINE + BOLLINGER (do CSV) ────────────────────────────────────────
def get_timeline_bollinger():
    labels, values = [], []
    try:
        with open(CSV_PATH) as f:
            reader = csv.DictReader(f)
            for row in reader:
                date_col = [k for k in row if 'data' in k.lower() or 'date' in k.lower()]
                val_col  = [k for k in row if 'patrimônio' in k.lower() or 'total' in k.lower() or 'patrimonio' in k.lower() or 'valor' in k.lower()]
                if not date_col or not val_col:
                    # tentar primeiras 2 colunas
                    keys = list(row.keys())
                    if len(keys) >= 2:
                        date_col = [keys[0]]
                        val_col  = [keys[1]]
                d = row[date_col[0]].strip()
                v_str = row[val_col[0]].replace(',', '.').replace(' ', '').strip()
                try:
                    v = float(v_str)
                    # Normalizar data para YYYY-MM
                    if len(d) == 10 and d[4] == '-':
                        lbl = d[:7]  # YYYY-MM
                    elif '/' in d:
                        parts = d.split('/')
                        lbl = f"{parts[2]}-{parts[1].zfill(2)}"
                    else:
                        lbl = d[:7]
                    labels.append(lbl)
                    values.append(v)
                except ValueError:
                    continue
    except Exception as e:
        print(f"  ⚠️ CSV: {e}")
        return {"labels": [], "values": []}, {"dates": [], "values": []}

    # Bollinger: retornos mensais entre pares consecutivos ≤35 dias
    boll_dates, boll_vals = [], []
    for i in range(1, len(labels)):
        try:
            d1 = datetime.strptime(labels[i-1] + "-01", "%Y-%m-%d")
            d2 = datetime.strptime(labels[i]   + "-01", "%Y-%m-%d")
            gap_days = (d2 - d1).days
            if gap_days <= 35 and values[i-1] > 0:
                ret = (values[i] / values[i-1] - 1) * 100
                boll_dates.append(labels[i])
                boll_vals.append(round(ret, 4))
        except Exception:
            continue

    return (
        {"labels": labels, "values": values},
        {"dates": boll_dates, "values": boll_vals}
    )


# ─── 6. POSIÇÕES + PREÇOS ────────────────────────────────────────────────────
def get_posicoes_precos(state):
    posicoes = state.get("posicoes", {})
    cambio   = state.get("patrimonio", {}).get("cambio", 5.10)

    if not args.skip_prices:
        print("  ▶ yfinance preços ...")
        try:
            import yfinance as yf
            tickers_yf = {tk: yf_sym for tk, yf_sym in TICKERS_YF.items() if tk in posicoes or tk in ("USD_BRL", "HODL11")}
            syms = list(set(tickers_yf.values()))
            data = yf.download(syms, period="2d", progress=False, auto_adjust=True)
            prices = {}
            if hasattr(data, 'columns') and 'Close' in data:
                close = data['Close']
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

    # Garantir bucket e status em cada posição
    for tk, pos in posicoes.items():
        if "bucket" not in pos:
            pos["bucket"] = BUCKET_MAP.get(tk, tk)
        if "status" not in pos:
            pos["status"] = "alvo" if tk in ("SWRD", "AVGS", "AVEM", "AVUV_UCITS") else "transitório"

    return posicoes, cambio


# ─── 7. RF (holdings.md + state) ─────────────────────────────────────────────
def get_rf(state):
    rf = state.get("rf", {})
    taxa_ipca, taxa_renda = read_holdings_taxas()
    if taxa_ipca and "ipca2040" in rf:
        rf["ipca2040"]["taxa"] = taxa_ipca
    if taxa_renda and "renda2065" in rf:
        rf["renda2065"]["taxa"] = taxa_renda
    return rf


# ─── 8. DRIFT ─────────────────────────────────────────────────────────────────
def compute_drift(posicoes, rf, hodl11_brl, cambio):
    # Total
    eq_usd = sum(p["qty"] * p.get("price", p.get("avg_cost", 0)) for p in posicoes.values())
    rf_brl = sum(v.get("valor", 0) for k, v in rf.items() if k != "hodl11")
    total  = eq_usd * cambio + rf_brl + hodl11_brl

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

    ipca_brl = rf.get("ipca2029", {}).get("valor", 0) + rf.get("ipca2040", {}).get("valor", 0)
    drift["IPCA"]   = {"atual": round(ipca_brl / total * 100, 1) if total else 0, "alvo": round(IPCA_LONGO_PCT * 100, 1)}
    drift["HODL11"] = {"atual": round(hodl11_brl / total * 100, 1) if total else 0, "alvo": round(CRIPTO_PCT * 100, 1)}

    return drift, round(total)


# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    print("📊 generate_data.py — iniciando")

    state = load_state()

    # Premissas do fire_montecarlo.py
    print("  ▶ lendo premissas ...")
    premissas_raw, guardrails_raw, gasto_piso, spending_smile = get_premissas()

    # P(FIRE) + Tornado
    pfire50, pfire53, tornado = get_pfire_tornado()

    # Backtest
    backtest_data = get_backtest()

    # Attribution
    attr = get_attribution()

    # Timeline + Bollinger
    print("  ▶ lendo CSV ...")
    timeline, bollinger = get_timeline_bollinger()

    # Posições + preços
    print("  ▶ posições ...")
    posicoes, cambio = get_posicoes_precos(state)

    # RF
    rf = get_rf(state)
    hodl11 = rf.pop("hodl11", {})
    hodl11_brl = hodl11.get("valor", 0)

    # Drift
    drift, total_brl = compute_drift(posicoes, rf, hodl11_brl, cambio)

    # Premissas — garantir patrimônio atual
    premissas = {
        "patrimonio_atual":       total_brl,
        "patrimonio_gatilho":     premissas_raw.get("patrimonio_gatilho", PATRIMONIO_GATILHO),
        "aporte_mensal":          premissas_raw.get("aporte_mensal", APORTE_MENSAL),
        "custo_vida_base":        premissas_raw.get("custo_vida_base", CUSTO_VIDA_BASE),
        "idade_atual":            premissas_raw.get("idade_atual", IDADE_ATUAL),
        "idade_fire_alvo":        premissas_raw.get("idade_fire_alvo", IDADE_FIRE_ALVO),
        "idade_fire_aspiracional":premissas_raw.get("idade_fire_aspiracional", IDADE_FIRE_ASPIRACIONAL),
        "retorno_equity_base":    premissas_raw.get("retorno_equity_base", 0.0485),
        "volatilidade_equity":    premissas_raw.get("volatilidade_equity", 0.168),
        "swr_gatilho":            premissas_raw.get("swr_gatilho", SWR_GATILHO),
        "inss_anual":             premissas_raw.get("inss_anual", 18_000),
        "inss_inicio_ano":        premissas_raw.get("inss_inicio_ano", 12),
        "ipca_anual":             premissas_raw.get("ipca_anual", 0.04),
        "renda_estimada":         45_000,  # para savings rate
    }

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

    # Spending sensibilidade (do state)
    spending_sens = state.get("spending", {}).get("scenarios", [])

    # Pisos cascade
    pisos = {
        "pisoTaxaIpcaLongo": PISO_TAXA_IPCA_LONGO,
        "pisoTaxaRendaPlus": PISO_TAXA_RENDA_PLUS,
    }

    # Pesos alvo
    pesos_target = {k: round(v, 4) for k, v in PESOS_TARGET.items()}

    # Glide path — lido de config + carteira.md (valores fixos atuais)
    glide = {
        "idades":     [39, 40, 50, 60, 70],
        "equity":     [79, 79, 79, 94, 94],
        "ipca_longo": [15, 15, 15,  0,  0],
        "ipca_curto": [ 0,  0,  3,  3,  3],
        "hodl11":     [ 3,  3,  3,  3,  3],
        "renda_plus": [ 3,  3,  0,  0,  0],
    }

    # TLH — transitórios com preços atuais
    tlh = []
    for tk, p in posicoes.items():
        if p.get("status") == "transitório":
            tlh.append({
                "ticker": tk,
                "qty":    p["qty"],
                "pm":     p.get("avg_cost", p.get("pm", 0)),
                "price":  p.get("price", 0),
                "ucits":  f"{p['bucket']}.L",
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

    # Shadows
    shadows = state.get("shadows", {})

    # P(FIRE@53) fallback
    if pfire53.get("base") is None:
        s = state.get("fire", {})
        pfire53 = {"base": s.get("pfire_base"), "fav": s.get("pfire_fav"), "stress": s.get("pfire_stress")}

    # ─── Construir objeto DATA completo ──────────────────────────────────────
    data = {
        "_generated": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "_generated_brt": (datetime.utcnow() + timedelta(hours=-3)).strftime("%Y-%m-%dT%H:%M:%S") + "-03:00",
        "date":       str(date.today()),
        "cambio":     cambio,

        "posicoes":   posicoes,
        "pesosTarget": pesos_target,
        "pisos":      pisos,

        "pfire50":    pfire50,
        "pfire53":    pfire53,
        "premissas":  premissas,
        "guardrails": guardrails,
        "gasto_piso": gasto_piso,
        "spendingSmile": spending,
        "spendingSensibilidade": spending_sens,
        "saude_base": premissas_raw.get("saude_base", 18_000),
        "tornado":    tornado,

        "timeline":   timeline,
        "bollinger":  bollinger,

        "backtest":   backtest,
        "backtestR5": backtest_r5,

        "rf":         rf,
        "hodl11":     {"qty": hodl11.get("qty", 0), "preco": hodl11.get("preco", 0), "valor": hodl11_brl},

        "glide":      glide,
        "drift":      drift,
        "tlh":        tlh,
        "attribution":attr,
        "shadows":    shadows,
    }

    OUT_PATH.parent.mkdir(exist_ok=True)
    OUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"\n✅ {OUT_PATH.relative_to(ROOT)}")
    print(f"   Patrimônio: R${total_brl/1e6:.2f}M | Câmbio: {cambio:.4f}")
    print(f"   P(FIRE@50): {pfire50.get('base')}% | Tornado: {len(tornado)} variáveis")
    print(f"   Timeline: {len(timeline['labels'])} pontos | Bollinger: {len(bollinger['dates'])} meses")


if __name__ == "__main__":
    main()
