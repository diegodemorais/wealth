#!/usr/bin/env python3
"""
Fetch snapshot da Carteira Viva (Google Sheets) e registrar como fonte da verdade.

A aba "Historico" é uma série temporal com 3 data points por execução:
  - Row 0 : Inception (01/03/2021) — âncora permanente
  - Row 1 : Último sync manual (ex: 15/12/2025)
  - Row 15: Snapshot ao vivo (data de hoje)

Comportamento INCREMENTAL:
  - Só adiciona datas novas. Não reconstrói entradas antigas.
  - Cada run captura a data atual e verifica se as âncoras já existem.
  - historico_sheets.json acumula snapshots ao longo do tempo.

Cross-check: compara com dados/historico_carteira.csv (pipeline reconstruct_history.py)

Executar: ~/claude/finance-tools/.venv/bin/python3 scripts/fetch_historico_sheets.py
"""

import csv
import json
import re
import sys
import urllib.request
from datetime import datetime, date
from pathlib import Path
from io import StringIO

# ─── Paths ──────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent.parent
SNAPSHOTS_JSON = ROOT / "dados" / "historico_sheets.json"
PIPELINE_CSV   = ROOT / "dados" / "historico_carteira.csv"

# ─── Google Sheets config ────────────────────────────────────────────────────
SHEET_ID  = "1LmxgmvIoGut6Bfzj7ibhXtFuR1H7cIPcJOkVmiTuzZs"
TAB_NAME  = "Historico"   # accent-free name works; "Histórico" returns 400
GVZ_URL   = (
    f"https://docs.google.com/spreadsheets/d/{SHEET_ID}"
    f"/gviz/tq?tqx=out:csv&sheet={TAB_NAME}"
)
# Daily historical tab (gid=459933219): col[0]=date, col[8]=COE BRL, col[12]=loan BRL
GVZ_URL_DAILY = (
    f"https://docs.google.com/spreadsheets/d/{SHEET_ID}"
    "/gviz/tq?tqx=out:csv&sheet=Hist%C3%B3rico"
)


# ─── Helpers ─────────────────────────────────────────────────────────────────
def _clean(s: str) -> str:
    """Strip whitespace and BOM."""
    return s.strip().strip("\ufeff")


def _parse_brl(s: str) -> float | None:
    """'R$ 3.252.156' or '3.726.294 ' → float. Returns None if not parseable."""
    s = _clean(s)
    s = re.sub(r"[R$\s]", "", s)          # remove R$
    s = s.replace(".", "").replace(",", ".").replace(" ", "")  # 1.234,56 → 1234.56
    if not s or s in ("#N/A", "#DIV/0!", "#REF!"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _parse_usd(s: str) -> float | None:
    """'$647.156,51' → float."""
    s = _clean(s).lstrip("$").replace(".", "").replace(",", ".")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        return None


def _parse_pct(s: str) -> float | None:
    """'40,83%' → 0.4083. '-1,67%' → -0.0167."""
    s = _clean(s).replace("%", "").replace(",", ".")
    if not s:
        return None
    try:
        return float(s) / 100
    except ValueError:
        return None


def _parse_date_ddmmyy(s: str) -> str | None:
    """'24/04/26' → '2026-04-24'."""
    s = _clean(s)
    for fmt in ("%d/%m/%y", "%d/%m/%Y"):
        try:
            d = datetime.strptime(s, fmt)
            return d.strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


def _parse_date_ddmmyyyy(s: str) -> str | None:
    """'01/03/2021' → '2021-03-01'."""
    return _parse_date_ddmmyy(s)


# ─── Fetch CSV ───────────────────────────────────────────────────────────────
def fetch_csv(url: str) -> list[list[str]]:
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
    except Exception as e:
        print(f"[ERRO] Fetch falhou: {e}", file=sys.stderr)
        sys.exit(1)

    reader = csv.reader(StringIO(raw))
    return [row for row in reader]


# ─── Parse COE from daily tab ────────────────────────────────────────────────
def parse_coe_from_daily_rows(rows: list[list[str]]) -> dict[str, dict]:
    """
    Parse COE XP e empréstimo XP do tab Histórico (diário, 1700+ linhas).

    Estrutura (col base-0):
      col[0]  = data dd/mm/yy (daily row)
      col[8]  = COE asset BRL (ex: "R$ 172.869,10")
      col[12] = empréstimo XP BRL (ex: "-R$ 108.788,48", negativo = liability)

    Retorna {YYYY-MM: {coe_brl, emprestimo_brl, net_brl}}.
    Primeiro row de cada mês = mais recente = proxy end-of-month.
    """
    coe_by_month: dict[str, dict] = {}

    for row in rows:
        if not row or len(row) < 13:
            continue
        c = [_clean(x) for x in row]
        # Daily rows: col[0] = date, col[1] is empty or non-date
        if not c[0] or c[0] in ("TRUE", "FALSE"):
            continue
        d = _parse_date_ddmmyy(c[0])
        if not d:
            continue

        month = d[:7]  # YYYY-MM
        if month in coe_by_month:
            continue  # first occurrence = most recent = end-of-month proxy

        coe_val  = _parse_brl(c[8])  if len(c) > 8  else None
        loan_val = _parse_brl(c[12]) if len(c) > 12 else None

        if coe_val or loan_val:
            coe_by_month[month] = {
                "coe_brl":        coe_val  or 0.0,
                "emprestimo_brl": loan_val or 0.0,
                "net_brl":        (coe_val or 0.0) + (loan_val or 0.0),
            }

    return coe_by_month


# ─── Parse ───────────────────────────────────────────────────────────────────
def _make_snap(data: str, fonte_detalhe: str = "live") -> dict:
    return {
        "fetched_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "fonte": f"sheets/{TAB_NAME}/{fonte_detalhe}",
        "sheet_id": SHEET_ID,
        "data_snapshot": data,
        "patrimonio_brl": None,
        "ibkr_usd": None,
        "ibkr_brl": None,
        "rf_brl": None,
        "reserva_brl": None,
        "rf_extra_brl": None,
        "ptax": None,
        "etfs": [],
    }


def parse_all_snapshots(rows: list[list[str]]) -> list[dict]:
    """
    Extrai TODAS as datas temporais da aba Historico (sem acento, 68 linhas).

    Estrutura conhecida (col índices base-0):
      Row 0 : Inception  — col[3]=data, col[5]=ptax, col[8]=patrimônio_incepção
      Row 1 : Sync ref   — col[3]=data, col[8]=ibkr_brl_sync, col[11]=patrimônio_sync
      Row 15: Hoje (live)— col[1]=data_ddmmyy, col[2]=total_brl, col[4]=rf_brl,
                           col[6]=reserva_brl, col[7]=equity_brl, col[8]=ibkr_usd
      ETF rows: col[0] in (TRUE/FALSE), col[1]=ticker, ...

    Retorna lista de snapshots (1 por data única detectada).
    COE data vem da aba Histórico (com acento) via parse_coe_from_daily_rows().
    """
    snapshots: dict[str, dict] = {}  # data → snap
    etfs: list[dict] = []
    ptax_override: float | None = None

    for i, row in enumerate(rows):
        if not row:
            continue
        c = [_clean(x) for x in row]
        while len(c) < 26:
            c.append("")

        # ── Row 0: inception anchor
        if i == 0:
            d = _parse_date_ddmmyyyy(c[3])
            if d:
                s = _make_snap(d, "inception")
                s["ptax"] = _parse_brl(c[5])
                s["patrimonio_brl"] = _parse_brl(c[8])
                # col[11] is current patrimônio (formula reference), skip
                snapshots[d] = s
            continue

        # ── Row 1: last sync anchor
        if i == 1:
            d = _parse_date_ddmmyyyy(c[3])
            if d:
                s = _make_snap(d, "sync")
                s["ibkr_brl"] = _parse_brl(c[8])
                s["patrimonio_brl"] = _parse_brl(c[11])
                snapshots[d] = s
            continue

        # ── Live row: col[1] = "DD/MM/YY" date, col[2] = numeric total > 1M
        if c[1] and _parse_date_ddmmyy(c[1]):
            total = _parse_brl(c[2])
            if total and total > 500_000:
                d = _parse_date_ddmmyy(c[1])
                if d:
                    s = _make_snap(d, "live")
                    s["patrimonio_brl"] = total
                    s["rf_brl"]         = _parse_brl(c[4])
                    s["reserva_brl"]    = _parse_brl(c[6])
                    s["ibkr_brl"]       = _parse_brl(c[7])
                    s["ibkr_usd"]       = _parse_usd(c[8])
                    s["rf_extra_brl"]   = _parse_brl(c[9])
                    if s["ibkr_brl"] and s["ibkr_usd"] and s["ibkr_usd"] > 0:
                        s["ptax"] = round(s["ibkr_brl"] / s["ibkr_usd"], 4)
                    snapshots[d] = s
            continue

        # ── PTAX explicit: "Cambio: R$ X,XX"
        if c[12] == "Cambio:" and c[13]:
            v = _parse_brl(c[13])
            if v and 3 < v < 15:
                ptax_override = v
            continue

        # ── ETF rows: col[0] = "TRUE" or "FALSE"
        if c[0] in ("TRUE", "FALSE") and c[1]:
            etf = {
                "ticker":         c[1],
                "ativo":          c[0] == "TRUE",
                "gain_inception": _parse_pct(c[2]),
                "weight_ibkr":    _parse_pct(c[3]),
                "mtd":            _parse_pct(c[4]),
                "ytd":            _parse_pct(c[5]),
                "target_ibkr":    _parse_pct(c[6]),
                "target_total":   _parse_pct(c[7]),
                "weight_total":   _parse_pct(c[8]),
                "gap_pp":         None,
            }
            raw_gap = _parse_pct(c[9])
            if raw_gap is not None:
                etf["gap_pp"] = round(raw_gap * 100, 4)  # %-decimal → pp
            etfs.append(etf)

    # Attach ETFs and PTAX override to the "live" snapshot (most recent date)
    live_snaps = [s for s in snapshots.values() if "live" in s["fonte"]]
    if live_snaps:
        live = live_snaps[-1]
        live["etfs"] = etfs
        if ptax_override and not live.get("ptax"):
            live["ptax"] = ptax_override

    # Sort by date (newest first — mesma ordem que a aba: mais recente no topo)
    return sorted(snapshots.values(), key=lambda s: s["data_snapshot"], reverse=True)


# ─── Persist ─────────────────────────────────────────────────────────────────
def load_existing() -> dict:
    if SNAPSHOTS_JSON.exists():
        with open(SNAPSHOTS_JSON) as f:
            store = json.load(f)
        # Migrate: ensure coe_by_month key exists (added in refactor to consolidate fetches)
        if "coe_by_month" not in store:
            store["coe_by_month"] = {}
        return store
    return {
        "_meta": {
            "descricao": "Snapshots periódicos da Carteira Viva (Google Sheets). "
                         "Cada entrada representa uma leitura da aba Historico. "
                         "Fonte primária para cross-check vs dados/historico_carteira.csv (pipeline).",
            "colunas_chave": {
                "patrimonio_brl": "Total portfolio em BRL (Sheets live)",
                "ibkr_usd": "IBKR equity em USD",
                "ibkr_brl": "IBKR equity em BRL",
                "rf_brl": "Renda Fixa total em BRL (IPCA+)",
                "reserva_brl": "Reserva de Emergência em BRL",
                "ptax": "PTAX BRL/USD calculada implicitamente",
                "etfs": "Lista de ETFs com pesos atuais e metas",
                "coe_brl": "COE XP asset value em BRL (snapshot ao vivo, da daily row mais recente)",
                "emprestimo_xp_brl": "Empréstimo XP liability em BRL (negativo, snapshot ao vivo)",
                "coe_by_month": "COE XP net position por mês {YYYY-MM: {coe_brl, emprestimo_brl, net_brl}}",
            },
        },
        "coe_by_month": {},
        "snapshots": [],
    }


def upsert_snapshots(store: dict, snaps: list[dict]) -> tuple[int, int]:
    """
    Insere ou atualiza snapshots. Retorna (n_novos, n_atualizados).
    Só sobrescreve se a data já existe E a fonte for igual (não sobrepõe
    dados históricos curados com dados de fetch automático de outra fonte).
    """
    by_date = {s["data_snapshot"]: i for i, s in enumerate(store["snapshots"])}
    n_new, n_upd = 0, 0

    for snap in snaps:
        date_key = snap.get("data_snapshot")
        if not date_key:
            continue
        if date_key in by_date:
            # Atualiza: mantém dados mais ricos (ex: etfs só vem no "live")
            existing = store["snapshots"][by_date[date_key]]
            # Merge: campos do snap novo que são não-nulos sobrescrevem
            for k, v in snap.items():
                if v is not None and v != [] and v != {}:
                    existing[k] = v
            n_upd += 1
        else:
            store["snapshots"].append(snap)
            n_new += 1

    # Manter ordenado: mais recente primeiro (mesma ordem da aba)
    store["snapshots"].sort(key=lambda s: s.get("data_snapshot", ""), reverse=True)
    return n_new, n_upd


def upsert_coe_by_month(store: dict, coe_by_month: dict[str, dict]) -> tuple[int, int]:
    """
    Insere ou substitui entradas em store['coe_by_month'].
    Sempre sobrescreve: valores MtM do Sheets — fetch mais recente é mais correto.
    Retorna (n_novos, n_atualizados).
    """
    existing = store.setdefault("coe_by_month", {})
    n_new, n_upd = 0, 0
    for month, entry in coe_by_month.items():
        if month in existing:
            n_upd += 1
        else:
            n_new += 1
        existing[month] = entry
    return n_new, n_upd


def save(store: dict):
    SNAPSHOTS_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(SNAPSHOTS_JSON, "w") as f:
        json.dump(store, f, ensure_ascii=False, indent=2)


# ─── Cross-check vs pipeline ─────────────────────────────────────────────────
def crosscheck(snap: dict):
    """Compara snapshot Sheets vs último entry do historico_carteira.csv (pipeline)."""
    if not PIPELINE_CSV.exists():
        print("  [INFO] dados/historico_carteira.csv não encontrado — cross-check pulado.")
        return

    with open(PIPELINE_CSV) as f:
        rows = list(csv.DictReader(f))

    if not rows:
        return

    last = rows[-1]  # mais recente
    pipeline_date = last.get("data", "N/A")
    pipeline_total = float(last.get("patrimonio_brl", 0))
    pipeline_ibkr_usd = float(last.get("equity_usd", 0))
    pipeline_ibkr_brl = float(last.get("equity_brl", 0))

    sheets_total = snap.get("patrimonio_brl") or 0
    sheets_ibkr_usd = snap.get("ibkr_usd") or 0

    delta_total = sheets_total - pipeline_total
    delta_pct   = delta_total / pipeline_total * 100 if pipeline_total else 0

    print(f"\n{'─'*55}")
    print("CROSS-CHECK: Sheets vs Pipeline (historico_carteira.csv)")
    print(f"{'─'*55}")
    print(f"  Sheets snapshot : {snap.get('data_snapshot', 'N/A')}")
    print(f"  Pipeline última : {pipeline_date}")
    print()
    print(f"  {'Métrica':<22} {'Sheets':>14}  {'Pipeline':>14}  {'Delta':>10}")
    print(f"  {'─'*22}  {'─'*14}  {'─'*14}  {'─'*10}")

    def row(label, sv, pv):
        if sv is None or pv is None:
            return f"  {label:<22}  {'N/A':>14}  {pv:>14,.0f}" if pv else f"  {label:<22}  N/A"
        d = sv - pv
        pct = d / pv * 100 if pv else 0
        flag = "  ✓" if abs(pct) < 2 else ("  ⚠" if abs(pct) < 10 else "  ✗")
        return f"  {label:<22}  {sv:>14,.0f}  {pv:>14,.0f}  {d:>+10,.0f}{flag} ({pct:+.1f}%)"

    print(row("Patrimônio total BRL", sheets_total, pipeline_total))
    print(row("IBKR Equity USD", sheets_ibkr_usd, pipeline_ibkr_usd))
    print(row("IBKR Equity BRL", snap.get("ibkr_brl"), pipeline_ibkr_brl))
    print()
    print("  Legenda: ✓ <2%  ⚠ 2-10%  ✗ >10%")
    print(f"{'─'*55}\n")

    # Cross-check com referência "ultimo_sync" (15/12/2025)
    sync_ref = snap.get("refs", {}).get("ultimo_sync")
    if sync_ref:
        sync_date = sync_ref.get("data")
        sync_patrimonio = sync_ref.get("patrimonio_brl")
        # Procurar no pipeline pela data mais próxima
        pipeline_dec25 = next(
            (r for r in reversed(rows) if r.get("data", "").startswith("2025-12")), None
        )
        if pipeline_dec25 and sync_patrimonio:
            p_val = float(pipeline_dec25.get("patrimonio_brl", 0))
            delta = sync_patrimonio - p_val
            pct   = delta / p_val * 100 if p_val else 0
            flag  = "✓" if abs(pct) < 2 else ("⚠" if abs(pct) < 10 else "✗")
            print(f"  Ref histórica {sync_date}:")
            print(f"    Sheets R${sync_patrimonio:,.0f} vs Pipeline R${p_val:,.0f}  →  {flag} {pct:+.1f}%")
            print()


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    today = date.today().isoformat()
    print(f"fetch_historico_sheets.py — {today}")
    print(f"Fetching {TAB_NAME} tab...")

    rows = fetch_csv(GVZ_URL)
    print(f"  {len(rows)} linhas recebidas.")

    snaps = parse_all_snapshots(rows)
    print(f"  {len(snaps)} data point(s) detectados:")
    for s in snaps:
        print(f"    {s['data_snapshot']}  ({s['fonte'].split('/')[-1]})  "
              f"R${s['patrimonio_brl']:,.0f}" if s['patrimonio_brl'] else
              f"    {s['data_snapshot']}  ({s['fonte'].split('/')[-1]})  N/A")

    # Fetch daily historical tab (Histórico com acento) for COE/loan data
    print(f"\nFetching Histórico (diário) tab para COE/empréstimo XP...")
    daily_rows = fetch_csv(GVZ_URL_DAILY)
    print(f"  {len(daily_rows)} linhas recebidas.")
    coe_by_month = parse_coe_from_daily_rows(daily_rows)
    print(f"  {len(coe_by_month)} meses com posição COE/empréstimo detectados.")

    # Snapshot live (hoje) para cross-check e display detalhado
    live = next((s for s in snaps if "live" in s["fonte"]), snaps[0] if snaps else None)

    # Enrich live snapshot with COE/loan from most recent coe_by_month entry
    if live and coe_by_month:
        latest_month = max(coe_by_month.keys())
        latest_entry = coe_by_month[latest_month]
        live["coe_brl"]           = latest_entry["coe_brl"]
        live["emprestimo_xp_brl"] = latest_entry["emprestimo_brl"]

    if live:
        print(f"\nSnapshot ao vivo ({live['data_snapshot']}):")
        print(f"  patrimônio BRL : R${live['patrimonio_brl']:,.0f}" if live['patrimonio_brl'] else "  patrimônio BRL : N/A")
        print(f"  IBKR USD       : ${live['ibkr_usd']:,.2f}" if live['ibkr_usd'] else "  IBKR USD       : N/A")
        print(f"  IBKR BRL       : R${live['ibkr_brl']:,.0f}" if live['ibkr_brl'] else "  IBKR BRL       : N/A")
        print(f"  RF BRL         : R${live['rf_brl']:,.0f}" if live['rf_brl'] else "  RF BRL         : N/A")
        print(f"  Reserva BRL    : R${live['reserva_brl']:,.0f}" if live['reserva_brl'] else "  Reserva BRL    : N/A")
        print(f"  PTAX           : {live['ptax']:.4f}" if live['ptax'] else "  PTAX           : N/A")
        print(f"  COE BRL        : R${live['coe_brl']:,.0f}" if live.get('coe_brl') else "  COE BRL        : N/A")
        print(f"  Empr. XP BRL   : R${live['emprestimo_xp_brl']:,.0f}" if live.get('emprestimo_xp_brl') else "  Empr. XP BRL   : N/A")

        etfs_ativos = [e for e in live.get("etfs", []) if e["ativo"]]
        if etfs_ativos:
            print(f"  ETFs ativos    : {len(etfs_ativos)}")
            for e in etfs_ativos:
                wt  = f"{e['weight_total']*100:.1f}%" if e['weight_total'] is not None else "N/A"
                tgt = f"{e['target_total']*100:.1f}%" if e['target_total'] is not None else "N/A"
                gap = f"{e['gap_pp']:+.2f}pp" if e['gap_pp'] is not None else ""
                print(f"    {e['ticker']:<16} atual={wt}  meta={tgt}  gap={gap}")

    if coe_by_month:
        print(f"\nCOE XP por mês ({len(coe_by_month)} meses):")
        for month in sorted(coe_by_month.keys(), reverse=True)[:3]:
            e = coe_by_month[month]
            print(f"    {month}  COE=R${e['coe_brl']:,.0f}  Empr=R${e['emprestimo_brl']:,.0f}  Net=R${e['net_brl']:,.0f}")

    # Persist — incremental
    store = load_existing()
    n_new, n_upd = upsert_snapshots(store, snaps)
    n_coe_new, n_coe_upd = upsert_coe_by_month(store, coe_by_month)
    save(store)
    total = len(store["snapshots"])
    total_coe = len(store.get("coe_by_month", {}))
    print(f"\n  dados/historico_sheets.json: +{n_new} novo(s), {n_upd} atualizado(s) → {total} snapshots")
    print(f"  coe_by_month: +{n_coe_new} novo(s), {n_coe_upd} atualizado(s) → {total_coe} meses")

    # Cross-check com pipeline
    if live:
        crosscheck(live)

    print(f"Done. Arquivo: {SNAPSHOTS_JSON.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
