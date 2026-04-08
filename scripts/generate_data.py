#!/usr/bin/env python3
"""
generate_data.py — Agrega todos os dados da carteira em dashboard/data.json.

Uso:
    python3 scripts/generate_data.py [--skip-scripts] [--skip-prices]

Flags:
    --skip-scripts  Não roda fire_montecarlo/backtest/fx_utils (usa cache)
    --skip-prices   Não busca preços yfinance (usa dashboard_state.json)

Output:
    dashboard/data.json  (input para build_dashboard.py)

Pipeline:
    1. Lê config.py  (constantes canônicas)
    2. Lê dashboard_state.json  (posições, P(FIRE), RF — atualizado por outros scripts)
    3. Roda fire_montecarlo.py --anos 11 --tornado   → parseia P(FIRE) + tornado
    4. Roda backtest_portfolio.py                     → parseia séries
    5. Roda fx_utils.py                              → parseia attribution
    6. Lê historico_carteira.csv                     → timeline + bollinger
    7. Lê holdings.md                                → taxas RF
    8. Escreve dashboard/data.json
"""

import sys, json, subprocess, csv, math, argparse, re
from pathlib import Path
from datetime import date, datetime, timedelta

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from config import (
    PESOS_TARGET, BUCKET_MAP, EQUITY_WEIGHTS,
    PISO_TAXA_IPCA_LONGO, PISO_TAXA_RENDA_PLUS,
    PATRIMONIO_GATILHO, SWR_GATILHO, CUSTO_VIDA_BASE, APORTE_MENSAL, RENDA_ESTIMADA,
    IDADE_ATUAL, IDADE_FIRE_ALVO, IDADE_FIRE_ASPIRACIONAL,
    EQUITY_PCT, IPCA_LONGO_PCT, IPCA_CURTO_PCT, CRIPTO_PCT, RENDA_PLUS_PCT,
    TICKERS_YF, GLIDE_PATH,
)

VENV_PY = str(Path.home() / "claude/finance-tools/.venv/bin/python3")
STATE_PATH = ROOT / "dados" / "dashboard_state.json"
CSV_PATH   = ROOT / "dados" / "historico_carteira.csv"
HOLDINGS_PATH = ROOT / "dados" / "holdings.md"
LOTES_PATH   = ROOT / "dados" / "ibkr" / "lotes.json"
APORTES_PATH    = ROOT / "dados" / "ibkr" / "aportes.json"
WELLNESS_CONFIG = ROOT / "agentes" / "referencia" / "wellness_config.json"
OUT_PATH        = ROOT / "dashboard" / "data.json"

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
            {"base": fire.get("pfire50_base", fire.get("pfire_base")),
             "fav":  fire.get("pfire50_fav",  fire.get("pfire_fav")),
             "stress": fire.get("pfire50_stress", fire.get("pfire_stress"))},
            {"base": fire.get("pfire53_base", fire.get("pfire_base")),
             "fav":  fire.get("pfire53_fav",  fire.get("pfire_fav")),
             "stress": fire.get("pfire53_stress", fire.get("pfire_stress"))},
            []
        )

    # Rodar @50 (--anos 11) com tornado
    print("  ▶ fire_montecarlo.py --anos 11 --tornado ...")
    out50, err50 = run([VENV_PY, "scripts/fire_montecarlo.py", "--anos", "11", "--tornado"], cwd=ROOT)
    if err50:
        print(f"  ⚠️ stderr @50: {err50[:200]}")

    # Rodar @53 (default, sem --anos)
    print("  ▶ fire_montecarlo.py (FIRE@53 default) ...")
    out53, err53 = run([VENV_PY, "scripts/fire_montecarlo.py"], cwd=ROOT)

    def parse_pfire(out, idade):
        """Parseia P(FIRE@{idade}) do output do fire_montecarlo."""
        pf = {"base": None, "fav": None, "stress": None}
        tag = f"P(FIRE@{idade})"
        for line in out.splitlines():
            m = re.search(rf'{re.escape(tag)}[^=]*=\s*([\d.]+)%', line)
            if m:
                l = line.lower()
                if "favoráv" in l or "fav" in l:
                    pf["fav"] = float(m.group(1))
                elif "stress" in l:
                    pf["stress"] = float(m.group(1))
                else:
                    if pf["base"] is None:
                        pf["base"] = float(m.group(1))
        return pf

    def parse_pfire_generic(out):
        """Parseia P(FIRE) genérico (sem @idade) — cenários base/fav/stress."""
        pf = {"base": None, "fav": None, "stress": None}
        for line in out.splitlines():
            m = re.search(r'P\(FIRE\)[^=]*=\s*([\d.]+)%', line)
            if m:
                l = line.lower()
                if "favoráv" in l or "fav" in l:
                    pf["fav"] = float(m.group(1))
                elif "stress" in l:
                    pf["stress"] = float(m.group(1))
                elif pf["base"] is None:
                    pf["base"] = float(m.group(1))
        return pf

    pf50 = parse_pfire(out50, 50)
    if pf50["base"] is None:
        pf50 = parse_pfire_generic(out50)

    pf53 = parse_pfire(out53, 53)
    if pf53["base"] is None:
        pf53 = parse_pfire_generic(out53)

    # Tornado — parsear do output @50
    tornado = []
    in_tornado = False
    for line in out50.splitlines():
        if "tornado" in line.lower() or "sensibilidade" in line.lower():
            in_tornado = True
        if in_tornado:
            m = re.search(r'(.+?)\s+\+10%[:\s]+([-+]?\d+\.?\d*)pp\s+-10%[:\s]+([-+]?\d+\.?\d*)pp', line)
            if m:
                tornado.append({
                    "variavel": m.group(1).strip(),
                    "mais10": float(m.group(2)),
                    "menos10": float(m.group(3)),
                })

    # Fallback do state
    s = load_state().get("fire", {})
    if pf50["base"] is None:
        pf50 = {"base": s.get("pfire50_base", s.get("pfire_base")),
                "fav":  s.get("pfire50_fav",  s.get("pfire_fav")),
                "stress": s.get("pfire50_stress", s.get("pfire_stress"))}
    if pf53["base"] is None:
        pf53 = {"base": s.get("pfire53_base"),
                "fav":  s.get("pfire53_fav"),
                "stress": s.get("pfire53_stress")}

    print(f"  → P(FIRE@50): {pf50} | P(FIRE@53): {pf53} | tornado: {len(tornado)} variáveis")
    return pf50, pf53, tornado


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
    rf_raw = state.get("rf", {})
    taxa_ipca, taxa_renda = read_holdings_taxas()

    # Normaliza schema: state usa "valor_brl", template espera "valor"
    rf = {}
    notas_map = {
        "ipca2029":  "Reserva · Nubank · migrar 2029",
        "ipca2040":  "DCA ativo · XP · HTM SEMPRE",
        "renda2065": "Tático · Nubank · Vender ≤6.0%",
    }
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
            "notas": raw.get("notas", notas_map.get(key, "")),
        }

    # Atualizar taxas do holdings.md (mais atualizado que o state)
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
    hodl11_raw = rf.pop("hodl11", {})
    # state usa "preco_brl" / "valor_brl"; normalizar para "preco" / "valor"
    hodl11_brl = hodl11_raw.get("valor", hodl11_raw.get("valor_brl", 0))
    hodl11 = {
        "qty":   hodl11_raw.get("qty", 0),
        "preco": hodl11_raw.get("preco", hodl11_raw.get("preco_brl", 0)),
        "valor": hodl11_brl,
    }

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
        "renda_estimada":         RENDA_ESTIMADA,
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

    # Spending sensibilidade — state usa {label, pfire}; template espera {label, custo, base, fav, stress}
    # Se fav/stress ausentes no state, inferir via delta do pfire53 base→fav/stress
    _sens_raw = state.get("spending", {}).get("scenarios", [])
    spending_sens = []
    _custo_map = {"R$250k": 250_000, "R$270k": 270_000, "R$300k": 300_000,
                  "Solteiro/FIRE Day": 250_000, "Pós-casamento": 270_000, "Casamento+filho": 300_000}
    _pf53_base   = pfire53.get("base")
    _pf53_fav    = pfire53.get("fav")
    _pf53_stress = pfire53.get("stress")
    _delta_fav    = (_pf53_fav   - _pf53_base) if (_pf53_fav    is not None and _pf53_base is not None) else None
    _delta_stress = (_pf53_stress - _pf53_base) if (_pf53_stress is not None and _pf53_base is not None) else None
    for s in _sens_raw:
        label = s.get("label", "")
        custo = s.get("custo", _custo_map.get(label, 0))
        base  = s.get("pfire", s.get("base"))
        fav    = s.get("fav")
        stress = s.get("stress")
        if fav is None and base is not None and _delta_fav is not None:
            fav = round(min(99.9, max(0, base + _delta_fav)), 1)
        if stress is None and base is not None and _delta_stress is not None:
            stress = round(min(99.9, max(0, base + _delta_stress)), 1)
        spending_sens.append({
            "label": label, "custo": custo,
            "base": base, "fav": fav, "stress": stress,
        })

    # Pisos cascade
    pisos = {
        "pisoTaxaIpcaLongo": PISO_TAXA_IPCA_LONGO,
        "pisoTaxaRendaPlus": PISO_TAXA_RENDA_PLUS,
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

    # Shadows
    shadows = state.get("shadows", {})

    # P(FIRE@53): ler chave específica pfire53_* (salva quando fire_montecarlo roda sem --anos)
    if pfire53.get("base") is None:
        s = state.get("fire", {})
        if s.get("pfire53_base") is not None:
            pfire53 = {"base": s["pfire53_base"], "fav": s.get("pfire53_fav"), "stress": s.get("pfire53_stress")}
        else:
            # Fallback: usar pfire_base genérico (pode ser qualquer rodada)
            pfire53 = {"base": s.get("pfire_base"), "fav": s.get("pfire_fav"), "stress": s.get("pfire_stress")}

    # ─── Mini-log: últimas operações IBKR ────────────────────────────────────
    def _build_minilog():
        """Retorna as 5 últimas operações: compras de lotes + depósitos."""
        entries = []
        if APORTES_PATH.exists():
            ap = json.loads(APORTES_PATH.read_text())
            for dep in ap.get("depositos", [])[:5]:
                entries.append({"data": dep["data"], "tipo": "Depósito IBKR",
                                 "ativo": "USD", "valor": f"${dep['usd']:,.0f}"})
        if LOTES_PATH.exists():
            lotes_raw = json.loads(LOTES_PATH.read_text())
            compras = []
            for ticker, info in lotes_raw.items():
                for lot in info.get("lotes", []):
                    if lot.get("qty", 0) >= 1:
                        compras.append({"data": lot["data"], "tipo": "Compra",
                                        "ativo": ticker, "valor": f"{lot['qty']:.0f} × ${lot['custo_por_share']:.2f}"})
            compras.sort(key=lambda x: x["data"], reverse=True)
            entries += compras[:5]
        entries.sort(key=lambda x: x["data"], reverse=True)
        return entries[:5]

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
        "hodl11":     hodl11,

        "glide":      glide,
        "drift":      drift,
        "tlh":        tlh,
        "attribution":attr,
        "shadows":    shadows,
        "minilog":    _build_minilog(),
        "wellness_config": json.loads(WELLNESS_CONFIG.read_text(encoding="utf-8")) if WELLNESS_CONFIG.exists() else {},
        "eventos_vida": [
            {"evento": "Casamento", "data_est": "~2026-2027", "impacto": "+R$20-50k/ano custo de vida",
             "status": "planejado", "acoes": ["Seguro de vida (gap crítico)", "Testamento", "Estrutura patrimonial"]},
            {"evento": "Filho", "data_est": "~2028", "impacto": "+R$30-50k/ano (escola, saúde, cuidado)",
             "status": "planejado", "acoes": ["P(FIRE) cai ~4pp (R$300k/ano)", "Recalibrar FIRE date", "VGBL/PGBL para filho"]},
        ],
    }

    OUT_PATH.parent.mkdir(exist_ok=True)
    OUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"\n✅ {OUT_PATH.relative_to(ROOT)}")
    print(f"   Patrimônio: R${total_brl/1e6:.2f}M | Câmbio: {cambio:.4f}")
    print(f"   P(FIRE@50): {pfire50.get('base')}% | Tornado: {len(tornado)} variáveis")
    print(f"   Timeline: {len(timeline['labels'])} pontos | Bollinger: {len(bollinger['dates'])} meses")


if __name__ == "__main__":
    main()
