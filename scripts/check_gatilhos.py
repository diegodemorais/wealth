#!/usr/bin/env python3
"""
check_gatilhos.py — Verifica gatilhos da carteira contra data.json.

Fonte: agentes/contexto/gatilhos.md

Uso:
    python scripts/check_gatilhos.py           # todos os gatilhos
    python scripts/check_gatilhos.py --alarme  # só nível ALARME
    python scripts/check_gatilhos.py --json    # output JSON para integração

Saída:
    ✅ OK      — dentro dos limites
    ⚠️  ATENÇÃO — zona de alerta (verificar)
    🔴 ALARME  — threshold atingido, ação necessária
    ℹ️  MANUAL  — requer verificação externa (CDS, notícias)
"""

import json
import argparse
from pathlib import Path
from dataclasses import dataclass, field

ROOT = Path(__file__).parent.parent
DATA_PATH = ROOT / "react-app" / "public" / "data.json"

LEVEL_OK      = "OK"
LEVEL_WARN    = "ATENÇÃO"
LEVEL_ALARM   = "ALARME"
LEVEL_MANUAL  = "MANUAL"


@dataclass
class GatilhoResult:
    id: str
    dominio: str
    descricao: str
    level: str
    detalhe: str
    acao: str = ""
    freq: str = "mensal"


def check_all(data: dict) -> list[GatilhoResult]:
    results = []

    # ── Gatilhos verificáveis via data.json ─────────────────────────────────

    # IPCA+ Longo — DCA por bandas
    ipca = (data.get("dca_status") or {}).get("ipca_longo") or \
           (data.get("dca_status") or {}).get("ipca2040") or {}
    taxa_ipca = ipca.get("taxa_atual") or ipca.get("taxa")
    alvo_ipca_pct = (data.get("concentracao_brasil") or {}).get("composicao", {})  # fallback
    ipca_peso_pct = None
    for pos in (data.get("posicoes") or []):
        if "2040" in str(pos.get("ticker", "")):
            ipca_peso_pct = pos.get("peso_pct")
            break

    if taxa_ipca is not None:
        if taxa_ipca >= 6.0:
            level = LEVEL_OK
            detalhe = f"Taxa atual {taxa_ipca:.2f}% ≥ 6.0% — DCA ATIVO"
            acao = "Continuar DCA: 80% TD 2040 + 20% TD 2050"
        elif taxa_ipca >= 5.0:
            level = LEVEL_WARN
            detalhe = f"Taxa atual {taxa_ipca:.2f}% — zona 5–6% (DCA pausado)"
            acao = "Pausar DCA, redirecionar para JPGL. Monitorar se cai <5% por 3 meses"
        else:
            level = LEVEL_ALARM
            detalhe = f"Taxa atual {taxa_ipca:.2f}% < 5.0% — revisar premissas"
            acao = "Issue formal antes de qualquer ação"
    else:
        level = LEVEL_MANUAL
        detalhe = "taxa_ipca2040 não encontrada em data.json"
        acao = "Rodar pipeline para atualizar"

    results.append(GatilhoResult(
        id="ipca-dca", dominio="IPCA+ Longo", freq="mensal",
        descricao="DCA por bandas de taxa",
        level=level, detalhe=detalhe, acao=acao,
    ))

    # Renda+ 2065 — regime
    renda = (data.get("dca_status") or {}).get("renda_plus") or {}
    taxa_renda = renda.get("taxa_atual") or renda.get("taxa")
    gap_renda = renda.get("gap_pp")

    if taxa_renda is not None:
        if taxa_renda >= 6.5:
            level = LEVEL_OK
            detalhe = f"Taxa {taxa_renda:.2f}% ≥ 6.5% — comprar se posição <5%"
            acao = "Verificar % Renda+ no portfolio. Se <5%: comprar"
        elif taxa_renda >= 6.0:
            level = LEVEL_OK
            detalhe = f"Taxa {taxa_renda:.2f}% — zona 6.0–6.5%: hold"
            acao = "Manter posição, sem ação"
        else:
            level = LEVEL_WARN
            detalhe = f"Taxa {taxa_renda:.2f}% < 6.0% — verificar holding ≥720 dias"
            acao = "Se holding ≥720 dias: vender tudo. Se <720 dias: aguardar"
    else:
        level = LEVEL_MANUAL
        detalhe = "taxa_renda2065 não encontrada"
        acao = "Verificar manualmente no Tesouro Direto"

    results.append(GatilhoResult(
        id="renda-plus", dominio="Renda+ 2065", freq="mensal",
        descricao="Regime de compra/venda Renda+ 2065",
        level=level, detalhe=detalhe, acao=acao,
    ))

    # HODL11 — banda cripto
    hodl_valor = (data.get("hodl11") or {}).get("valor", 0)
    patrimonio = (data.get("premissas") or {}).get("patrimonio_atual", 0)
    if patrimonio > 0 and hodl_valor is not None:
        hodl_pct = hodl_valor / patrimonio * 100
        if hodl_pct < 1.5:
            level = LEVEL_ALARM
            detalhe = f"HODL11 {hodl_pct:.1f}% < 1.5% — abaixo do mínimo"
            acao = "Comprar HODL11 até 3% do patrimônio"
        elif hodl_pct > 5.0:
            level = LEVEL_ALARM
            detalhe = f"HODL11 {hodl_pct:.1f}% > 5.0% — acima do máximo"
            acao = "Rebalancear HODL11 de volta para 3%"
        elif hodl_pct < 2.0 or hodl_pct > 4.5:
            level = LEVEL_WARN
            detalhe = f"HODL11 {hodl_pct:.1f}% — zona de atenção (alvo 3%)"
            acao = "Monitorar — próximo das bandas"
        else:
            level = LEVEL_OK
            detalhe = f"HODL11 {hodl_pct:.1f}% — dentro da banda 1.5–5%"
            acao = ""
    else:
        level = LEVEL_MANUAL
        detalhe = "Patrimônio ou HODL11 valor não disponível"
        acao = "Rodar pipeline"

    results.append(GatilhoResult(
        id="hodl11-banda", dominio="HODL11", freq="trimestral",
        descricao="Banda cripto 1.5–5% do patrimônio",
        level=level, detalhe=detalhe, acao=acao,
    ))

    # Drift máximo ETFs
    drift = data.get("drift") or {}
    max_drift_pp = 0.0
    max_drift_ticker = ""
    for ticker, d in drift.items():
        if isinstance(d, dict) and "desvio" in d:
            dev = abs(d.get("desvio") or 0)
            if dev > max_drift_pp:
                max_drift_pp = dev
                max_drift_ticker = ticker

    if max_drift_ticker:
        if max_drift_pp >= 5.0:
            level = LEVEL_ALARM
            detalhe = f"{max_drift_ticker} drift {max_drift_pp:.1f}pp — rebalancear urgente"
            acao = "Próximo aporte 100% no ativo com maior desvio negativo"
        elif max_drift_pp >= 3.0:
            level = LEVEL_WARN
            detalhe = f"{max_drift_ticker} drift {max_drift_pp:.1f}pp — zona de atenção"
            acao = "Direcionar próximo aporte para corrigir drift"
        else:
            level = LEVEL_OK
            detalhe = f"Drift máximo {max_drift_pp:.1f}pp ({max_drift_ticker}) — dentro do tolerado"
            acao = ""
    else:
        level = LEVEL_MANUAL
        detalhe = "Dados de drift não disponíveis"
        acao = "Rodar pipeline"

    results.append(GatilhoResult(
        id="drift-etf", dominio="Equity / Drift", freq="mensal",
        descricao="Drift máximo de ETFs vs IPS",
        level=level, detalhe=detalhe, acao=acao,
    ))

    # Custo de vida vs limite FIRE
    custo_vida = (data.get("premissas") or {}).get("custo_vida_base", 0)
    if custo_vida:
        if custo_vida > 287_000:
            level = LEVEL_ALARM
            detalhe = f"Custo de vida R${custo_vida:,.0f} > R$287k — recalcular SWR e FIRE date"
            acao = "Recalcular patrimônio-alvo e P(FIRE)"
        elif custo_vida > 270_000:
            level = LEVEL_WARN
            detalhe = f"Custo de vida R${custo_vida:,.0f} — próximo do limite (R$287k)"
            acao = "Monitorar evolução dos gastos reais"
        else:
            level = LEVEL_OK
            detalhe = f"Custo de vida R${custo_vida:,.0f} — dentro do FIRE baseline R$250k"
            acao = ""
    else:
        level = LEVEL_MANUAL
        detalhe = "custo_vida_base não encontrado"
        acao = "Verificar premissas"

    results.append(GatilhoResult(
        id="custo-vida", dominio="FIRE", freq="anual",
        descricao="Custo de vida vs limite R$287k",
        level=level, detalhe=detalhe, acao=acao,
    ))

    # Patrimônio vs trajetória FIRE
    pat_atual = (data.get("premissas") or {}).get("patrimonio_atual", 0)
    pat_gatilho = (data.get("premissas") or {}).get("patrimonio_gatilho", 0)
    if pat_atual and pat_gatilho:
        ratio = pat_atual / pat_gatilho
        if ratio >= 1.0:
            level = LEVEL_OK
            detalhe = f"Patrimônio R${pat_atual/1e6:.2f}M ≥ gatilho R${pat_gatilho/1e6:.2f}M ({ratio:.0%})"
            acao = "FIRE atingível — iniciar processo de transição"
        elif ratio >= 0.85:
            level = LEVEL_OK
            detalhe = f"Patrimônio R${pat_atual/1e6:.2f}M = {ratio:.0%} do gatilho R${pat_gatilho/1e6:.2f}M"
            acao = ""
        else:
            level = LEVEL_WARN
            detalhe = f"Patrimônio R${pat_atual/1e6:.2f}M = {ratio:.0%} do gatilho — monitorar trajetória"
            acao = "Verificar projeção anual vs trajetória esperada"
    else:
        level = LEVEL_MANUAL
        detalhe = "patrimonio_atual ou patrimonio_gatilho não encontrado"
        acao = "Atualizar premissas"

    results.append(GatilhoResult(
        id="patrimonio-trajetoria", dominio="FIRE", freq="mensal",
        descricao="Patrimônio atual vs gatilho FIRE",
        level=level, detalhe=detalhe, acao=acao,
    ))

    # ── Gatilhos que requerem verificação externa ────────────────────────────

    results.append(GatilhoResult(
        id="cds-brasil", dominio="Soberano", freq="mensal",
        descricao="CDS Brasil 5y (alarme >800bps, alerta >500bps)",
        level=LEVEL_MANUAL,
        detalhe="Sem API gratuita. Verificar: worldgovernmentbonds.com ou Trading Economics",
        acao="WebSearch: 'Brazil CDS 5 year'. Alarme >800bps, Alerta >500bps",
    ))

    results.append(GatilhoResult(
        id="avgs-aum", dominio="Equity / AVGS", freq="trimestral",
        descricao="AUM AVGS UCITS (parar aportes <$150M, alerta <$300M)",
        level=LEVEL_MANUAL,
        detalhe="Verificar via etf.com ou Avantis UCITS fact sheet",
        acao="WebSearch: 'AVGS UCITS AUM'. Parar aportes se <$150M",
    ))

    results.append(GatilhoResult(
        id="avgs-underperformance", dominio="Equity / AVGS", freq="trimestral",
        descricao="AVGS underperforma SWRD ≥5pp em 12 meses rolling",
        level=LEVEL_MANUAL,
        detalhe=f"factor_signal.excess_since_launch_pp = {(data.get('factor_signal') or {}).get('excess_since_launch_pp', 'N/A')}pp",
        acao="Se excess_ytd < -5pp: Issue com Factor + Advocate",
    ))

    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Verifica gatilhos da carteira")
    parser.add_argument("--alarme", action="store_true", help="Mostrar só nível ALARME")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()

    if not DATA_PATH.exists():
        print(f"❌ data.json não encontrado: {DATA_PATH}")
        return

    data = json.loads(DATA_PATH.read_text())
    results = check_all(data)

    if args.alarme:
        results = [r for r in results if r.level in (LEVEL_ALARM, LEVEL_WARN)]

    if args.json:
        print(json.dumps([vars(r) for r in results], ensure_ascii=False, indent=2))
        return

    generated = data.get("_generated", "?")
    print(f"\n🔎 Gatilhos — {len(results)} verificados | dados: {generated}\n")

    icons = {LEVEL_OK: "✅", LEVEL_WARN: "⚠️ ", LEVEL_ALARM: "🔴", LEVEL_MANUAL: "ℹ️ "}
    for r in results:
        icon = icons[r.level]
        print(f"{icon} [{r.dominio}] {r.descricao}")
        print(f"   {r.detalhe}")
        if r.acao:
            print(f"   → {r.acao}")
        print()

    alarms = sum(1 for r in results if r.level == LEVEL_ALARM)
    warns  = sum(1 for r in results if r.level == LEVEL_WARN)
    manual = sum(1 for r in results if r.level == LEVEL_MANUAL)
    ok     = sum(1 for r in results if r.level == LEVEL_OK)
    print(f"Resumo: {ok} OK · {warns} atenção · {alarms} alarme · {manual} manual")


if __name__ == "__main__":
    main()
