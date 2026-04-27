#!/usr/bin/env python3
"""
Spending Analysis — Carteira Diego Morais
Processa CSV de gastos pessoais (formato All-Accounts export)
e produz análise completa por mês, categoria e anomalias.

Uso:
    python3 scripts/spending_analysis.py [caminho_csv]
    python3 scripts/spending_analysis.py [caminho_csv] --json-output
    Se não informar o CSV, usa o mais recente em analysis/

Output:
    Sem flag: relatório formatado no terminal
    --json-output: salva dados/spending_summary.json (lido por build_dashboard.py)
"""

import csv
import sys
import os
import glob
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path as _Path

_sys_path = _Path(__file__).parent
if str(_sys_path) not in sys.path:
    sys.path.insert(0, str(_sys_path))
from config import SPENDING_ANOMALY_THRESHOLD_BRL

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
    """Encontra o CSV mais recente em analysis/."""
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pattern = os.path.join(root, 'analysis', '*.csv')
    files = [f for f in glob.glob(pattern) if 'ibkr' not in f.lower() and 'transactions' not in f.lower()]
    if not files:
        raise FileNotFoundError("Nenhum CSV de gastos encontrado em analysis/")
    return max(files, key=os.path.getmtime)


def categorize(cat):
    if cat in ESSENTIALS:
        return 'Essenciais'
    if cat in OPTIONALS:
        return 'Opcionais'
    if cat in UNEXPECTED:
        return 'Imprevistos'
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
                date = datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                continue
            transactions.append({
                'date': date,
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
        date   = t['date']
        payee  = t['payee']
        month  = date.strftime(DATE_FORMAT_YM)

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
        if group == 'Opcionais' and abs(amount) >= ANOMALY_THRESHOLD:
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
    print(f"  {'Mês':<10} {'Essenciais':>12} {'Opcionais':>12} {'Imprevistos':>13} {'TOTAL':>10}")
    print(f"  {'-'*10} {'-'*12} {'-'*12} {'-'*13} {'-'*10}")
    for m in months:
        g = mg[m]
        print(f"  {m:<10} {g['Essenciais']:>12,.0f} {g['Opcionais']:>12,.0f} {g['Imprevistos']:>13,.0f} {g['TOTAL']:>10,.0f}")

    # Médias
    avg_ess  = sum(mg[m]['Essenciais']  for m in months) / n
    avg_opt  = sum(mg[m]['Opcionais']   for m in months) / n
    avg_imp  = sum(mg[m]['Imprevistos'] for m in months) / n
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
        opt_m = abs(mg[m]['Opcionais'])
        if opt_m > opt_avg_val * 2.0 and opt_m > 3000:
            flags.append(f"🟡 {m}: Opcionais R${opt_m:,.0f} — acima de 2× a média")

    for f in flags:
        print(f"  {f}")

    print(f"\n  Próxima atualização de baseline: ao abrir issue HD-gastos-pessoais-* com novo período.")
    print()


# ─── JSON Output ───────────────────────────────────────────────────────────────

def export_json(data, csv_path, output_path=None):
    """Exporta resumo de spending para JSON (lido por build_dashboard.py)."""
    mg = data['monthly_by_group']
    months = sorted(mg.keys())
    n = len(months)

    if n == 0:
        print("Nenhum dado para exportar.")
        return

    avg_ess = sum(mg[m]['Essenciais']  for m in months) / n
    avg_opt = sum(mg[m]['Opcionais']   for m in months) / n
    avg_imp = sum(mg[m]['Imprevistos'] for m in months) / n
    avg_tot = sum(mg[m]['TOTAL']       for m in months) / n

    # Valores são negativos no CSV (saídas); armazenar como positivos
    # Breakdown mensal — últimos 12 meses ordenados cronologicamente
    recent_months = sorted(mg.keys())[-12:]
    monthly_breakdown = [
        {
            "mes": m,
            "essenciais": round(abs(mg[m].get('Essenciais', 0))),
            "opcionais":  round(abs(mg[m].get('Opcionais', 0))),
            "imprevistos": round(abs(mg[m].get('Imprevistos', 0))),
            "total":      round(abs(mg[m].get('TOTAL', 0))),
        }
        for m in recent_months
    ]

    summary = {
        "periodo": f"{months[0]} a {months[-1]}",
        "meses": n,
        "must_spend_mensal": round(abs(avg_ess)),
        "like_spend_mensal": round(abs(avg_opt)),
        "imprevistos_mensal": round(abs(avg_imp)),
        "total_mensal": round(abs(avg_tot)),
        "must_spend_anual": round(abs(avg_ess) * 12),
        "like_spend_anual": round(abs(avg_opt) * 12),
        "imprevistos_anual": round(abs(avg_imp) * 12),
        "total_anual": round(abs(avg_tot) * 12),
        "modelo_fire_anual": BASELINE['model_fire'],
        "monthly_breakdown": monthly_breakdown,
        "updated_at": datetime.now().strftime(DATE_FORMAT_YMD),
        "fonte": os.path.basename(csv_path),
    }

    if output_path is None:
        root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        output_path = os.path.join(root, 'dados', 'spending_summary.json')

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    print(f"✅ spending_summary.json salvo em: {output_path}")
    return summary


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    json_output = '--json-output' in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith('--')]

    if args:
        csv_path = args[0]
    else:
        csv_path = find_latest_csv()

    print(f"\nCarregando: {csv_path}")
    transactions = load_csv(csv_path)
    print(f"Transações lidas: {len(transactions)}")

    data = analyze(transactions)

    if json_output:
        export_json(data, csv_path)
    else:
        report(data, csv_path)


if __name__ == '__main__':
    main()
