#!/usr/bin/env python3
"""
Spending Analysis — Carteira Diego Morais
Processa CSV de gastos pessoais (formato All-Accounts export do Actual Budget)
e produz análise completa por mês, categoria e anomalias.

Uso (rotina mensal canônica):
    ~/claude/finance-tools/.venv/bin/python3 scripts/spending_analysis.py \\
        --csv analysis/raw/All-Accounts-{Mês}{Ano}.csv

Outras formas:
    spending_analysis.py                       — relatório no terminal (CSV mais recente)
    spending_analysis.py [csv]                 — relatório do CSV indicado
    spending_analysis.py --json-output         — só atualiza dados/spending_summary.json
    spending_analysis.py --rebuild             — força rebuild total (ignora versão)

Append-only contract (P1–P5 de scripts/CLAUDE.md):
    - METODOLOGIA_VERSION_SPENDING governa quando o JSON é regenerado do zero.
    - Meses fechados são preservados bit-for-bit no monthly_breakdown[].
    - Mês corrente recalcula a cada run (cartão pode cair atrasado).
    - Decisão Head: mês N considera-se "fechado" só a partir do dia 5 do mês N+1
      (margem para fatura cair). Antes disso, ainda é "corrente".
    - Agregados (must_spend_mensal, total_anual, etc.) são derivados — sempre
      recalculados sobre o monthly_breakdown final.
"""

from __future__ import annotations

import argparse
import csv
import glob
import json
import os
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path

_sys_path = Path(__file__).parent
if str(_sys_path) not in sys.path:
    sys.path.insert(0, str(_sys_path))
from config import (  # noqa: E402
    SPENDING_ANOMALY_THRESHOLD_BRL, DATE_FORMAT_YM, DATE_FORMAT_YMD, OPTIONAL_FLAG_MINIMUM_BRL,
    SPENDING_CATEGORY_ESSENTIALS, SPENDING_CATEGORY_OPTIONALS, SPENDING_CATEGORY_UNEXPECTED
)
from append_only import (  # noqa: E402
    is_period_closed,
    load_or_init,
    merge_append,
    write_with_meta,
)

# ─── Versionamento append-only ─────────────────────────────────────────────────
METODOLOGIA_VERSION_SPENDING = "spending-actual-v1"

# ─── Configuração de categorias ────────────────────────────────────────────────

# Essenciais: gastos de manutenção da vida (não opcionais)
ESSENTIALS = {
    'Taxes & Fees',
    'Mortgage Cost & Real Estate Fees',
    'Real Estate',          # amortização principal hipoteca + IPTU/cond
    'Housing & Utilities',  # luz, agua, telefone, condomínio, faxineira
    'Transportation',
    'Foods & Groceries',
    'Insurance',
}

# Opcionais: gastos de qualidade de vida (cortáveis)
OPTIONALS = {
    'Health & Self-care',
    'Dining Out',
    'Alcohol & Stuff',
    'Travel & Holidays',
    'Leisure & Subscriptions',
    'Technology', 'Techonolgy',  # typo histórico no CSV
    'Clothing & Footwear',
}

# Imprevistos / pontuais
UNEXPECTED = {'Gifts'}

# Excluir: investimentos, transferências internas, entradas
SKIP_CATEGORIES = {
    'In', 'Out', 'Interest', 'Work',
    'Short-term Goals', 'Long-term Goals',
}

# Payees que são transferências internas (double-count)
INTERNAL_PAYEES = [
    'diego de morais',
    'resgate rdb',
    'aplicação rdb',
    'aplic.invest',
    'apl.invest',
    'rent.inv',
]

# Threshold para anomalias em opcionais
ANOMALY_THRESHOLD = SPENDING_ANOMALY_THRESHOLD_BRL

# ─── Baseline de referência ────────────────────────────────────────────────────
BASELINE = {
    'source': 'HD-gastos-pessoais-2026 (2026-04-03)',
    'period': 'ago/2025–mar/2026 (8 meses)',
    'monthly_avg': 19421,
    'annual': 233053,
    'essentials_avg': 15074,
    'optionals_avg': 4037,
    'model_fire': 250000,
}


# ─── Helpers ───────────────────────────────────────────────────────────────────

def find_latest_csv():
    """Encontra o CSV All-Accounts mais recente (analysis/ ou analysis/raw/).

    Filtra arquivos IBKR e demais transactions internos.
    """
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    patterns = [
        os.path.join(root, 'analysis', '*.csv'),
        os.path.join(root, 'analysis', 'raw', '*.csv'),
    ]
    files = []
    for pat in patterns:
        files.extend(
            f for f in glob.glob(pat)
            if 'ibkr' not in f.lower() and 'transactions' not in f.lower()
        )
    if not files:
        raise FileNotFoundError("Nenhum CSV de gastos encontrado em analysis/ ou analysis/raw/")
    return max(files, key=os.path.getmtime)


def categorize(cat):
    if cat in ESSENTIALS:
        return SPENDING_CATEGORY_ESSENTIALS
    if cat in OPTIONALS:
        return SPENDING_CATEGORY_OPTIONALS
    if cat in UNEXPECTED:
        return SPENDING_CATEGORY_UNEXPECTED
    return None  # skip


def is_internal(payee):
    p = payee.lower()
    return any(s in p for s in INTERNAL_PAYEES)


def load_csv(path):
    transactions = []
    with open(path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat = row.get('Category', '').strip()
            amount_str = row.get('Amount', '0').strip()
            if not amount_str:
                continue
            amount = float(amount_str)
            date_str = row.get('Date', '').strip()
            try:
                d = datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                continue
            transactions.append({
                'date': d,
                'payee': row.get('Payee', '').strip(),
                'notes': row.get('Notes', '').strip(),
                'cat': cat,
                'amount': amount,
                'account': row.get('Account', '').strip(),
            })
    return transactions


def analyze(transactions):
    monthly_by_group  = defaultdict(lambda: defaultdict(float))
    monthly_by_cat    = defaultdict(lambda: defaultdict(float))
    payee_totals      = defaultdict(float)
    anomalies         = []
    skipped_invest    = defaultdict(float)   # Short-term/Long-term Goals
    mortgage_detail   = []

    for t in transactions:
        cat    = t['cat']
        amount = t['amount']
        d      = t['date']
        payee  = t['payee']
        month  = d.strftime(DATE_FORMAT_YM)

        # Investimentos: registrar separado
        if cat in SKIP_CATEGORIES:
            if cat in ('Short-term Goals', 'Long-term Goals') and amount < 0:
                skipped_invest[month] += amount
            continue

        # Só saídas
        if amount >= 0:
            continue

        # Transferências internas: pular
        if is_internal(payee):
            continue

        group = categorize(cat)
        if group is None:
            continue

        monthly_by_group[month][group]  += amount
        monthly_by_group[month]['TOTAL'] += amount
        monthly_by_cat[month][cat]       += amount
        payee_totals[payee]              += amount

        # Anomalias: opcionais > threshold
        if group == SPENDING_CATEGORY_OPTIONALS and abs(amount) >= ANOMALY_THRESHOLD:
            anomalies.append(t)

        # Hipoteca completa
        if cat in ('Mortgage Cost & Real Estate Fees', 'Real Estate'):
            if 'prest fin' in payee.lower() or 'andrey' in payee.lower():
                mortgage_detail.append(t)

    return {
        'monthly_by_group': monthly_by_group,
        'monthly_by_cat':   monthly_by_cat,
        'payee_totals':     payee_totals,
        'anomalies':        anomalies,
        'skipped_invest':   skipped_invest,
        'mortgage_detail':  mortgage_detail,
    }


def fmt(v):
    """Formata valor como R$X.XXX"""
    return f"R${v:>10,.0f}"


def print_section(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


# ─── Report ────────────────────────────────────────────────────────────────────

def report(data, csv_path):
    mg   = data['monthly_by_group']
    mc   = data['monthly_by_cat']
    pt   = data['payee_totals']
    anom = data['anomalies']
    inv  = data['skipped_invest']
    mort = data['mortgage_detail']

    months = sorted(mg.keys())
    n      = len(months)

    if n == 0:
        print("Nenhum dado de gasto encontrado.")
        return

    # ── Header ──
    print(f"\n{'#'*70}")
    print(f"  SPENDING ANALYSIS — {os.path.basename(csv_path)}")
    print(f"  Período: {months[0]} a {months[-1]}  ({n} meses)")
    print(f"  Baseline anterior: {BASELINE['period']} — R${BASELINE['monthly_avg']:,}/mês")
    print(f"{'#'*70}")

    # ── Totais mensais ──
    print_section("TOTAIS MENSAIS")
    print(f"  {'Mês':<10} {SPENDING_CATEGORY_ESSENTIALS:>12} {SPENDING_CATEGORY_OPTIONALS:>12} {SPENDING_CATEGORY_UNEXPECTED:>13} {'TOTAL':>10}")
    print(f"  {'-'*10} {'-'*12} {'-'*12} {'-'*13} {'-'*10}")
    for m in months:
        g = mg[m]
        print(f"  {m:<10} {g[SPENDING_CATEGORY_ESSENTIALS]:>12,.0f} {g[SPENDING_CATEGORY_OPTIONALS]:>12,.0f} {g[SPENDING_CATEGORY_UNEXPECTED]:>13,.0f} {g['TOTAL']:>10,.0f}")

    # Médias
    avg_ess  = sum(mg[m][SPENDING_CATEGORY_ESSENTIALS]  for m in months) / n
    avg_opt  = sum(mg[m][SPENDING_CATEGORY_OPTIONALS]   for m in months) / n
    avg_imp  = sum(mg[m][SPENDING_CATEGORY_UNEXPECTED] for m in months) / n
    avg_tot  = sum(mg[m]['TOTAL']       for m in months) / n
    ann_tot  = avg_tot * 12

    print(f"\n  {'MÉDIA':<10} {avg_ess:>12,.0f} {avg_opt:>12,.0f} {avg_imp:>13,.0f} {avg_tot:>10,.0f}")
    print(f"\n  Anualizado: R${ann_tot:,.0f}/ano")
    print(f"  Modelo FIRE: R${BASELINE['model_fire']:,}/ano")
    print(f"  Buffer: R${BASELINE['model_fire'] + ann_tot:,.0f}/ano")

    # Comparação com baseline
    if BASELINE['monthly_avg']:
        delta = avg_tot - (-BASELINE['monthly_avg'])
        sign  = '▲' if delta > 0 else '▼'
        print(f"  vs baseline anterior: {sign} R${abs(delta):,.0f}/mês ({abs(delta/(-BASELINE['monthly_avg'])*100):.1f}%)")

    # ── Breakdown por categoria ──
    print_section("BREAKDOWN POR CATEGORIA (período completo)")
    cat_totals = defaultdict(float)
    for m in months:
        for cat, val in mc[m].items():
            cat_totals[cat] += val
    for cat, total in sorted(cat_totals.items(), key=lambda x: x[1]):
        avg = total / n
        group = categorize(cat) or '?'
        print(f"  [{group[:3]}] {cat:<35} total {fmt(total)}  média {fmt(avg)}/mês")

    # ── Hipoteca completa ──
    print_section("HIPOTECA — cash out total (principal + juros)")
    mort_by_month = defaultdict(float)
    for t in mort:
        mort_by_month[t['date'].strftime(DATE_FORMAT_YM)] += t['amount']
    for m in sorted(mort_by_month):
        print(f"  {m}  R${mort_by_month[m]:>10,.2f}")
    if mort_by_month:
        mort_avg = sum(mort_by_month.values()) / len(mort_by_month)
        print(f"  Média: R${mort_avg:,.0f}/mês  →  termina fev/2051 (age 64)")

    # ── Anomalias ──
    print_section(f"ANOMALIAS — opcionais > R${ANOMALY_THRESHOLD:.0f}")
    if anom:
        for t in sorted(anom, key=lambda x: x['amount']):
            print(f"  {t['date'].strftime(DATE_FORMAT_YMD)}  {t['payee'][:45]:<45}  [{t['cat']:<20}]  R${t['amount']:>9,.0f}")
    else:
        print("  Nenhuma anomalia identificada.")

    # ── Top payees ──
    print_section("TOP 15 PAYEES (gastos reais, excl. investimentos)")
    top = sorted(pt.items(), key=lambda x: x[1])[:15]
    for payee, total in top:
        print(f"  {payee[:50]:<50}  {fmt(total)}")

    # ── Investimentos detectados ──
    if inv:
        print_section("APORTES DETECTADOS NO PERÍODO (excluídos da análise)")
        for m in sorted(inv):
            print(f"  {m}  R${inv[m]:>10,.0f}")
        print(f"  Total: R${sum(inv.values()):,.0f}")

    # ── Flags ──
    print_section("FLAGS AUTOMÁTICOS")

    flags = []
    if avg_tot < -(BASELINE['model_fire'] / 12):
        flags.append(f"🔴 Gasto médio acima do modelo FIRE (R${avg_tot*12*-1:,.0f}/ano > R${BASELINE['model_fire']:,})")
    elif abs(avg_tot) > BASELINE['monthly_avg'] * 1.10:
        flags.append(f"🟡 Gasto médio 10%+ acima do baseline anterior (R${avg_tot*12*-1:,.0f}/ano vs R${BASELINE['annual']:,})")
    else:
        flags.append(f"🟢 Gasto dentro do range histórico (R${avg_tot*12*-1:,.0f}/ano vs baseline R${BASELINE['annual']:,})")

    # Checar meses com optionals > 2x média
    opt_avg_val = abs(avg_opt)
    for m in months:
        opt_m = abs(mg[m][SPENDING_CATEGORY_OPTIONALS])
        if opt_m > opt_avg_val * 2.0 and opt_m > OPTIONAL_FLAG_MINIMUM_BRL:
            flags.append(f"🟡 {m}: {SPENDING_CATEGORY_OPTIONALS} R${opt_m:,.0f} — acima de 2× a média")

    for f in flags:
        print(f"  {f}")

    print(f"\n  Próxima atualização de baseline: ao abrir issue HD-gastos-pessoais-* com novo período.")
    print()


# ─── Mês corrente vs fechado ───────────────────────────────────────────────────

def _spending_effective_today(today: date | None = None) -> date:
    """Retorna 'today' deslocado 4 dias para trás.

    Decisão Head: mês N só conta como FECHADO a partir do dia 5 do mês N+1
    (margem para fatura do cartão cair). Subtraindo 4 dias antes de chamar
    `is_period_closed`, conseguimos esse efeito reusando o helper canônico:

        today_real = 2026-05-01 → effective = 2026-04-27 → abr/2026 ainda corrente
        today_real = 2026-05-05 → effective = 2026-05-01 → abr/2026 fechado
    """
    today = today or date.today()
    return today - timedelta(days=4)


def _is_spending_month_closed(period: str, today: date | None = None) -> bool:
    return is_period_closed(period, today=_spending_effective_today(today))


# ─── Build de monthly_breakdown a partir do dict 'analyze' ─────────────────────

def _monthly_breakdown_from_analyze(mg: dict) -> list[dict]:
    """Converte o dict monthly_by_group → list[dict] no formato canônico do JSON.

    Valores são positivos (saídas no CSV vêm negativas).
    """
    rows: list[dict] = []
    for m in sorted(mg.keys()):
        rows.append({
            "mes": m,
            "essenciais":  round(abs(mg[m].get(SPENDING_CATEGORY_ESSENTIALS,  0))),
            "opcionais":   round(abs(mg[m].get(SPENDING_CATEGORY_OPTIONALS,   0))),
            "imprevistos": round(abs(mg[m].get(SPENDING_CATEGORY_UNEXPECTED, 0))),
            "total":       round(abs(mg[m].get('TOTAL', 0))),
        })
    return rows


def _aggregates_from_breakdown(breakdown: list[dict]) -> dict:
    """Calcula agregados (médias mensais e anuais) sobre o monthly_breakdown final.

    Agregados são SEMPRE derivados do breakdown — nunca persistidos como
    dados de período.
    """
    n = len(breakdown)
    if n == 0:
        return {
            "must_spend_mensal": 0, "like_spend_mensal": 0,
            "imprevistos_mensal": 0, "total_mensal": 0,
            "must_spend_anual": 0, "like_spend_anual": 0,
            "imprevistos_anual": 0, "total_anual": 0,
        }
    avg_ess = sum(r["essenciais"]  for r in breakdown) / n
    avg_opt = sum(r["opcionais"]   for r in breakdown) / n
    avg_imp = sum(r["imprevistos"] for r in breakdown) / n
    avg_tot = sum(r["total"]       for r in breakdown) / n
    return {
        "must_spend_mensal":  round(avg_ess),
        "like_spend_mensal":  round(avg_opt),
        "imprevistos_mensal": round(avg_imp),
        "total_mensal":       round(avg_tot),
        "must_spend_anual":   round(avg_ess * 12),
        "like_spend_anual":   round(avg_opt * 12),
        "imprevistos_anual":  round(avg_imp * 12),
        "total_anual":        round(avg_tot * 12),
    }


# ─── JSON Output (append-only) ─────────────────────────────────────────────────

def export_json(
    data: dict,
    csv_path: str,
    output_path: str | os.PathLike | None = None,
    *,
    rebuild: bool = False,
    today: date | None = None,
) -> dict | None:
    """Exporta resumo de spending para JSON em modo append-only.

    - Lê JSON existente. Se versão bate e --rebuild=False: faz merge_append
      preservando meses fechados imutáveis e atualizando só o mês corrente +
      meses novos.
    - Se versão difere ou --rebuild=True: regenera do zero.
    - Agregados (médias) são sempre recomputados sobre o breakdown final.
    """
    mg = data['monthly_by_group']
    if not mg:
        print("Nenhum dado para exportar.")
        return None

    if output_path is None:
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(root, 'dados', 'spending_summary.json')
    out_path = Path(output_path)

    # ── Append-only: decide rebuild vs merge ──
    existing, needs_rebuild = load_or_init(
        out_path, METODOLOGIA_VERSION_SPENDING, rebuild_flag=rebuild,
    )

    new_breakdown = _monthly_breakdown_from_analyze(mg)

    if needs_rebuild:
        rebuild_reason = (
            "cli-flag" if rebuild
            else "missing-or-version-mismatch"
        )
        merged_breakdown = new_breakdown
        divergences: list[str] = []
    else:
        rebuild_reason = None
        existing_breakdown = existing.get("monthly_breakdown", [])
        # Diagnóstico: detectar divergências em meses fechados (mantemos o antigo)
        existing_by_mes = {r["mes"]: r for r in existing_breakdown}
        divergences = []
        for r in new_breakdown:
            m = r["mes"]
            if m in existing_by_mes and _is_spending_month_closed(m, today=today):
                old = existing_by_mes[m]
                for k in ("essenciais", "opcionais", "imprevistos", "total"):
                    if old.get(k) != r.get(k):
                        divergences.append(
                            f"{m}/{k}: {old.get(k)!r} → {r.get(k)!r} (mantido antigo)"
                        )
                        break
        # Merge: períodos fechados (segundo regra spending) ficam imutáveis;
        # mês corrente + meses novos absorvem novos dados.
        merged_breakdown = merge_append(
            existing_breakdown, new_breakdown,
            key="mes", today=_spending_effective_today(today),
        )

    if divergences:
        print(f"   ⚠ {len(divergences)} divergência(s) em meses fechados (mantidas as antigas):")
        for d in divergences[:5]:
            print(f"     - {d}")
        if len(divergences) > 5:
            print(f"     ... +{len(divergences) - 5} mais")

    # ── Agregados: sempre recomputados sobre o breakdown final ──
    aggregates = _aggregates_from_breakdown(merged_breakdown)

    months_sorted = [r["mes"] for r in merged_breakdown]
    n = len(months_sorted)
    last_period = months_sorted[-1] if months_sorted else ""

    summary = {
        "periodo": f"{months_sorted[0]} a {months_sorted[-1]}" if months_sorted else "",
        "meses": n,
        **aggregates,
        "modelo_fire_anual": BASELINE['model_fire'],
        "monthly_breakdown": merged_breakdown,
        "updated_at": datetime.now().strftime(DATE_FORMAT_YMD),
        "fonte": os.path.basename(csv_path),
    }

    write_with_meta(
        out_path, summary,
        version=METODOLOGIA_VERSION_SPENDING,
        last_period=last_period,
        rebuild_reason=rebuild_reason,
    )
    mode = "rebuild" if needs_rebuild else "append-merge"
    print(f"✅ spending_summary.json salvo em: {out_path} ({mode}, {n} meses)")
    return summary


# ─── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("csv_pos", nargs="?", help="Caminho do CSV (positional, opcional)")
    parser.add_argument("--csv", help="Caminho do CSV (kwarg, override do positional)")
    parser.add_argument("--json-output", action="store_true",
                        help="Atualiza dados/spending_summary.json (modo append-only)")
    parser.add_argument("--rebuild", action="store_true",
                        help="Força rebuild bit-for-bit do spending_summary.json")
    args = parser.parse_args()

    csv_path = args.csv or args.csv_pos
    if not csv_path:
        csv_path = find_latest_csv()

    print(f"\nCarregando: {csv_path}")
    transactions = load_csv(csv_path)
    print(f"Transações lidas: {len(transactions)}")

    data = analyze(transactions)

    # Modo de operação:
    #   - --json-output: só escreve JSON
    #   - --rebuild (sem --json-output): também grava JSON (rebuild implica escrita)
    #   - default: relatório no terminal
    if args.json_output or args.rebuild:
        export_json(data, csv_path, rebuild=args.rebuild)
    else:
        report(data, csv_path)


if __name__ == '__main__':
    main()
