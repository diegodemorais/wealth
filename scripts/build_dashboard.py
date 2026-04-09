#!/usr/bin/env python3
"""
build_dashboard.py — Injeta dashboard/data.json no template e gera dashboard/index.html

Uso:
    python3 scripts/build_dashboard.py
    python3 scripts/build_dashboard.py --data dashboard/data.json
    python3 scripts/build_dashboard.py --template dashboard/template.html
    python3 scripts/build_dashboard.py --out dashboard/index.html
    python3 scripts/build_dashboard.py --major "Descrição do milestone"
"""

import argparse
import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).parent.parent
TEMPLATE          = ROOT / "dashboard" / "template.html"
DATA_FILE         = ROOT / "dashboard" / "data.json"
SCHEMA_FILE       = ROOT / "dashboard" / "data.schema.json"
OUTPUT            = ROOT / "dashboard" / "index.html"
VERSION_FILE      = ROOT / "dashboard" / "version.json"
SPENDING_SUMMARY  = ROOT / "dados" / "spending_summary.json"
LIFE_EVENTS_FILE  = ROOT / "dados" / "life_events.json"
PLACEHOLDER       = "__DATA_PLACEHOLDER__"


def _validate_data(data: dict) -> None:
    """Valida data.json contra data.schema.json.

    Usa jsonschema se disponível; caso contrário faz check manual dos campos
    obrigatórios de primeiro nível. Nunca bloqueia o build — apenas imprime
    warnings para não interromper o pipeline caso campos novos sejam adicionados
    antes do schema ser atualizado.
    """
    if not SCHEMA_FILE.exists():
        print(f"⚠️  Schema não encontrado em {SCHEMA_FILE} — validação ignorada")
        return

    schema = json.loads(SCHEMA_FILE.read_text(encoding="utf-8"))
    required_fields = schema.get("required", [])

    try:
        import jsonschema  # type: ignore
        errors = list(jsonschema.Draft7Validator(schema).iter_errors(data))
        if errors:
            print(f"⚠️  data.json tem {len(errors)} problema(s) de schema (build não bloqueado):")
            for err in errors[:10]:  # máx 10 erros para não poluir o log
                path = " → ".join(str(p) for p in err.absolute_path) or "(raiz)"
                print(f"   • [{path}] {err.message}")
            if len(errors) > 10:
                print(f"   … e mais {len(errors) - 10} erro(s) omitidos")
        else:
            print("✅ data.json validado contra data.schema.json — OK")
    except ImportError:
        # Fallback manual: verifica apenas campos obrigatórios de primeiro nível
        missing = [f for f in required_fields if f not in data]
        if missing:
            print(f"⚠️  data.json — campos obrigatórios ausentes: {missing}")
            print("   (instale jsonschema para validação completa: pip install jsonschema)")
        else:
            print(f"✅ data.json — {len(required_fields)} campos obrigatórios presentes "
                  f"(jsonschema não instalado — validação de tipos ignorada)")


def _compute_income_projection(data: dict) -> dict:
    """Computa projeção de renda de 2026 a 2077 (age 90).

    Fontes:
    - premissas.renda_estimada: R$45k/mês (config.py RENDA_ESTIMADA — mensal)
    - premissas.aporte_mensal: R$25k/mês
    - premissas.custo_vida_base: R$250k/ano
    - premissas.ipca_anual: 4% a.a.
    - premissas.inss_anual: R$18k/ano
    - premissas.inss_inicio_ano: 12 anos pós-FIRE (age 65 = ano 2052)
    - premissas.idade_fire_alvo: 53, idade_fire_aspiracional: 50, idade_atual: 39
    - life_events.json: casamento R$100k em 2027
    """
    premissas = data.get("premissas", {})
    ano_atual = premissas.get("ano_atual", 2026)
    idade_atual = premissas.get("idade_atual", 39)
    idade_fire_alvo = premissas.get("idade_fire_alvo", 53)
    idade_fire_aspir = premissas.get("idade_fire_aspiracional", 50)
    custo_vida_base = premissas.get("custo_vida_base", 250000)
    ipca = premissas.get("ipca_anual", 0.04)
    inss_anual = premissas.get("inss_anual", 18000)
    inss_inicio_ano = premissas.get("inss_inicio_ano", 12)  # 12 anos pós-FIRE = age 65
    # RENDA_ESTIMADA em config.py é mensal (R$45k/mês)
    renda_estimada_mensal = premissas.get("renda_estimada", 45000)
    renda_ativa_anual = renda_estimada_mensal * 12  # R$540k/ano

    ano_fire_base = ano_atual + (idade_fire_alvo - idade_atual)   # 2040
    ano_fire_aspir = ano_atual + (idade_fire_aspir - idade_atual)  # 2037
    longevidade_age = 90
    ano_fim = ano_atual + (longevidade_age - idade_atual)          # 2077
    age_inss = 65
    ano_inss = ano_atual + (age_inss - idade_atual)                # 2052
    # Fim hipoteca: fev/2051 (age 64)
    ano_hipoteca_fim = ano_atual + (64 - idade_atual)              # 2051

    anos = list(range(ano_atual, ano_fim + 1))
    renda_ativa = []
    saque_portfolio = []
    inss_vals = []
    despesas = []

    for ano in anos:
        t = ano - ano_atual  # anos desde hoje
        desp = custo_vida_base * ((1 + ipca) ** t)

        if ano < ano_fire_base:
            # Pré-FIRE: renda ativa, sem saque
            ra = renda_ativa_anual
            inss_v = 0.0
            saque = 0.0
        else:
            # Pós-FIRE: sem renda ativa, saque cobre gap
            ra = 0.0
            t_inss = ano - ano_inss
            if ano >= ano_inss:
                inss_v = inss_anual * ((1 + ipca) ** t_inss)
            else:
                inss_v = 0.0
            saque = max(0.0, desp - inss_v)

        renda_ativa.append(round(ra))
        saque_portfolio.append(round(saque))
        inss_vals.append(round(inss_v))
        despesas.append(round(desp))

    # Life events: ler de dados/life_events.json
    life_events = []
    if LIFE_EVENTS_FILE.exists():
        raw_events = json.loads(LIFE_EVENTS_FILE.read_text(encoding="utf-8"))
        for ev in raw_events:
            life_events.append({
                "ano": ev["ano"],
                "label": ev["label"],
                "valor": ev["valor_brl"],
            })

    milestones = [
        {"ano": ano_fire_base,  "label": f"FIRE Base ({idade_fire_alvo})"},
        {"ano": ano_fire_aspir, "label": f"FIRE Aspiracional ({idade_fire_aspir})"},
        {"ano": ano_inss,       "label": f"INSS ({age_inss})"},
        {"ano": ano_hipoteca_fim, "label": f"Fim Hipoteca (64)"},
    ]

    return {
        "anos": anos,
        "renda_ativa": renda_ativa,
        "saque_portfolio": saque_portfolio,
        "inss": inss_vals,
        "despesas": despesas,
        "life_events": life_events,
        "milestones": milestones,
    }


def _compute_spending_guardrails(data: dict) -> dict:
    """Calcula guardrails de spending via interpolação/extrapolação linear dos cenários MC.

    Pontos conhecidos (de spendingSensibilidade):
    - R$250k → P=90.4%
    - R$270k → P=85.0%
    - R$300k → P=82.1%

    Pontos estimados por interpolação/extrapolação linear:
    - Upper guardrail (P≈95%): extrapolar acima de 90.4% para menor spending
    - Safe target (P≈80%): interpolar entre R$270k (85%) e R$300k (82.1%)
    - Lower guardrail (P≈70%): extrapolar abaixo de 82.1% para maior spending
    """
    spending_sens = data.get("spendingSensibilidade", [])
    if len(spending_sens) < 2:
        return {
            "spending_atual": 250000,
            "pfire_atual": 90.4,
            "zona": "verde",
            "upper_guardrail_spending": None,
            "upper_guardrail_pfire": 95.0,
            "safe_target_spending": None,
            "safe_target_pfire": 80.0,
            "lower_guardrail_spending": None,
            "lower_guardrail_pfire": 70.0,
            "nota": "Dados insuficientes para interpolação",
        }

    # Extrair pontos (spending, pfire) dos cenários
    pts = [(s["custo"], s["base"]) for s in spending_sens if "custo" in s and "base" in s]
    pts.sort(key=lambda x: x[0])  # ordenar por spending crescente

    spending_atual = data.get("spending", {}).get("base", 250000)
    # Encontrar pfire_atual no ponto mais próximo do spending_atual
    pfire_atual = next((p for s, p in pts if s == spending_atual), pts[0][1])

    def interp(x1, y1, x2, y2, y_target):
        """Interpola/extrapola x dado y_target numa reta (x1,y1)-(x2,y2)."""
        if y1 == y2:
            return x1
        return x1 + (y_target - y1) / (y2 - y1) * (x2 - x1)

    # Usar os 2 primeiros pontos para extrapolar upper/lower
    s0, p0 = pts[0]  # menor spending, maior P(FIRE)
    s1, p1 = pts[1]
    s2, p2 = pts[-1]  # maior spending, menor P(FIRE)

    # Upper guardrail (P=95%): extrapolar para baixo spending usando s0,p0 e s1,p1
    upper_spending = interp(s0, p0, s1, p1, 95.0)
    upper_spending = max(100000, round(upper_spending / 1000) * 1000)

    # Safe target (P=80%): interpolar entre pontos disponíveis
    safe_spending = interp(s1, p1, s2, p2, 80.0)
    safe_spending = max(s0, round(safe_spending / 1000) * 1000)

    # Lower guardrail (P=70%): extrapolar usando os 2 últimos pontos
    lower_spending = interp(s1, p1, s2, p2, 70.0)
    lower_spending = max(s0, round(lower_spending / 1000) * 1000)

    # Zona atual
    if pfire_atual >= 85:
        zona = "verde"
    elif pfire_atual >= 70:
        zona = "amarelo"
    else:
        zona = "vermelho"

    return {
        "spending_atual": spending_atual,
        "pfire_atual": pfire_atual,
        "zona": zona,
        "upper_guardrail_spending": upper_spending,
        "upper_guardrail_pfire": 95.0,
        "safe_target_spending": safe_spending,
        "safe_target_pfire": 80.0,
        "lower_guardrail_spending": lower_spending,
        "lower_guardrail_pfire": 70.0,
        "nota": "Upper/lower estimados por interpolação/extrapolação linear dos cenários MC",
    }


def _compute_earliest_fire(data: dict) -> dict:
    """Determina o FIRE date mais cedo possível com P(FIRE) >= 85%.

    Lógica: se pfire50_base >= 85%, usar FIRE@50 como earliest.
    Senão: usar FIRE@53 como earliest.
    Dados disponíveis: pfire50.base e pfire53.base.
    """
    pfire50 = data.get("pfire50", {})
    pfire53 = data.get("pfire53", {})
    premissas = data.get("premissas", {})
    ano_atual = premissas.get("ano_atual", 2026)
    idade_atual = premissas.get("idade_atual", 39)
    idade_fire_aspir = premissas.get("idade_fire_aspiracional", 50)
    idade_fire_alvo = premissas.get("idade_fire_alvo", 53)

    THRESHOLD = 85.0
    p50 = pfire50.get("base", 0)
    p53 = pfire53.get("base", 0)

    if p50 >= THRESHOLD:
        idade = idade_fire_aspir
        pfire = p50
        status = "aspiracional"
    elif p53 >= THRESHOLD:
        idade = idade_fire_alvo
        pfire = p53
        status = "base"
    else:
        # Nenhum cenário atinge threshold — usar alvo mesmo assim
        idade = idade_fire_alvo
        pfire = p53
        status = "abaixo_threshold"

    ano = ano_atual + (idade - idade_atual)
    return {
        "ano": ano,
        "idade": idade,
        "pfire": pfire,
        "status": status,
    }


def _compute_net_worth_projection(data: dict) -> dict:
    """Projeção simplificada do portfólio financeiro: P10/P50/P90 de 2026 a 2077.

    Usa endpoints do MC para âncoras, interpolação exponencial entre eles,
    e loop iterativo em termos REAIS pós-FIRE (elimina bug r-real × desp-nominal).

    Premissas pós-FIRE:
    - spending_real = R$250k constante em termos reais (não inflacionar)
    - inss_real = R$18k constante em termos reais a partir de age 65
    - P10/P50/P90: mesma taxa real 4.85% (Opção A Quant 2026-04-08 — dispersão via endpoints MC)

    Componentes de imóvel, INSS e capital humano: TODO (dados não aprovados).
    """
    premissas = data.get("premissas", {})
    pat_atual = premissas.get("patrimonio_atual", 3472335)
    custo_vida = premissas.get("custo_vida_base", 250000)
    inss_anual = premissas.get("inss_anual", 18000)
    ano_atual = premissas.get("ano_atual", 2026)
    idade_atual = premissas.get("idade_atual", 39)
    idade_fire = premissas.get("idade_fire_alvo", 53)

    # Retornos reais por percentil (pós-FIRE)
    # r_p50: lido de premissas (fonte: dashboard_state.json / fire_montecarlo.py)
    r_p50 = premissas.get("retorno_equity_base", 0.0485)
    # Opção A (Quant 2026-04-08): usar mesma taxa para P10/P50/P90.
    # Dispersão representada pelos patrimônios iniciais MC (endpoints reais).
    # vol * 0.5 produzia r_p90=13.25% real → absurdo (R$1.4B).
    r_p10 = r_p50
    r_p90 = r_p50

    ano_fire = ano_atual + (idade_fire - idade_atual)
    anos_longevidade = 90
    ano_fim = ano_atual + (anos_longevidade - idade_atual)
    ano_inss_global = ano_atual + (65 - idade_atual)  # age 65

    # Tentar carregar endpoints MC de dashboard_state.json
    dashboard_state_path = ROOT / "dados" / "dashboard_state.json"
    fire_state = {}
    if dashboard_state_path.exists():
        try:
            ds = json.loads(dashboard_state_path.read_text(encoding="utf-8"))
            fire_state = ds.get("fire", {})
        except Exception:
            pass

    pat_p50_fire = fire_state.get("pat_mediano_fire", None)
    pat_p10_fire = fire_state.get("pat_p10_fire", None)
    pat_p90_fire = fire_state.get("pat_p90_fire", None)

    anos_ate_fire = ano_fire - ano_atual

    def _sim_portfolio(pat_base: float, r_real: float, anos_sim: int) -> list:
        """Simula portfólio pós-FIRE em termos reais. Retorna lista de valores por ano.

        spending e INSS são constantes em termos reais (R$ 2026).
        """
        vals = [pat_base]
        for i in range(1, anos_sim + 1):
            ano_corrente = ano_fire + i
            inss = inss_anual if ano_corrente >= ano_inss_global else 0.0
            saque = max(0.0, custo_vida - inss)
            novo = vals[-1] * (1 + r_real) - saque
            vals.append(max(0.0, novo))
        return vals[1:]  # sem o ponto inicial (já incluído antes)

    # Pré-computar séries pós-FIRE para cada percentil
    if pat_p50_fire is not None:
        base_p50 = pat_p50_fire
        base_p10 = pat_p10_fire or base_p50 * 0.59
        base_p90 = pat_p90_fire or base_p50 * 1.64
    else:
        base_p50 = pat_atual
        base_p10 = pat_atual * 0.85
        base_p90 = pat_atual * 1.20

    anos_pos_fire = ano_fim - ano_fire
    serie_p50 = _sim_portfolio(base_p50, r_p50, anos_pos_fire)
    serie_p10 = _sim_portfolio(base_p10, r_p10, anos_pos_fire)
    serie_p90 = _sim_portfolio(base_p90, r_p90, anos_pos_fire)

    anos = list(range(ano_atual, ano_fim + 1))
    p10_vals = []
    p50_vals = []
    p90_vals = []

    for ano in anos:
        t = ano - ano_atual

        if t <= anos_ate_fire and pat_p50_fire is not None:
            # Fase de acumulação: interpolação exponencial de pat_atual até endpoints MC
            frac = t / anos_ate_fire if anos_ate_fire > 0 else 1.0
            p50 = pat_atual * ((pat_p50_fire / pat_atual) ** frac)
            if pat_p10_fire:
                p10 = pat_atual * ((pat_p10_fire / pat_atual) ** frac)
            else:
                p10 = p50 * (1 - 0.15 * (frac ** 0.5))
            if pat_p90_fire:
                p90 = pat_atual * ((pat_p90_fire / pat_atual) ** frac)
            else:
                p90 = p50 * (1 + 0.20 * (frac ** 0.5))
        elif t <= anos_ate_fire:
            # Sem dados MC: fase de acumulação com crescimento exponencial simples
            p50 = base_p50
            p10 = base_p10
            p90 = base_p90
        else:
            # Pós-FIRE: loop iterativo em termos reais (sem bug r-real × desp-nominal)
            idx = t - anos_ate_fire - 1  # índice na série pós-FIRE (0-based)
            p50 = serie_p50[idx]
            p10 = serie_p10[idx]
            p90 = serie_p90[idx]

        p10_vals.append(round(max(0, p10)))
        p50_vals.append(round(max(0, p50)))
        p90_vals.append(round(max(0, p90)))

    return {
        "anos": anos,
        "p10": p10_vals,
        "p50": p50_vals,
        "p90": p90_vals,
        "ano_fire": ano_fire,
        "nota_unidades": "Projeção pós-FIRE em R$ reais (constante 2026). Spending R$250k/ano real; INSS R$18k/ano real a partir de age 65.",
        "nota_imovel": "// TODO: apreciação imobiliária — taxa não definida nas premissas",
        "nota_inss": "// TODO: PV do INSS futuro — taxa de desconto não aprovada",
        "nota_cap_humano": "// TODO: capital humano — sem projeção aprovada",
    }


def _compute_stress_test(data: dict) -> dict:
    """Stress test: bear market -40% no patrimônio atual.

    Abordagem híbrida:
    - pat_pos_shock: calculado deterministicamente (patrimônio × 0.60)
    - pfire_pos_shock_base: lido de dashboard_state.json se pré-calculado offline
      via `fire_montecarlo.py --patrimonio <valor>`. Null se não disponível.
    - Dashboard exibe botão/indicador diferente se null.
    """
    premissas = data.get("premissas", {})
    pat_atual = premissas.get("patrimonio_atual", 3472335)
    shock_pct = 40
    pat_pos_shock = round(pat_atual * (1 - shock_pct / 100))

    # Tentar ler cenários pré-calculados de dashboard_state.json
    pfire_pos_shock = None
    pfire_pos_shock_fav = None
    pfire_pos_shock_stress = None
    pat_pos_shock_stored = None
    calc_date = None
    descricao_shock = None
    dashboard_state_path = ROOT / "dados" / "dashboard_state.json"
    if dashboard_state_path.exists():
        try:
            ds = json.loads(dashboard_state_path.read_text(encoding="utf-8"))
            st = ds.get("stress_test", {})
            pfire_pos_shock = st.get("pfire_pos_shock_base", None)
            pfire_pos_shock_fav = st.get("pfire_pos_shock_fav", None)
            pfire_pos_shock_stress = st.get("pfire_pos_shock_stress", None)
            pat_pos_shock_stored = st.get("pat_pos_shock", None)
            calc_date = st.get("calc_date", None)
            descricao_shock = st.get("descricao_shock", None)
        except Exception:
            pass

    # Usar pat_pos_shock do estado se disponível (mais preciso), senão calcular
    if pat_pos_shock_stored:
        pat_pos_shock = pat_pos_shock_stored

    return {
        "shock_pct": shock_pct,
        "pat_pos_shock": pat_pos_shock,
        "pfire_pos_shock_base": pfire_pos_shock,
        "pfire_pos_shock_fav": pfire_pos_shock_fav,
        "pfire_pos_shock_stress": pfire_pos_shock_stress,
        "calc_date": calc_date,
        "descricao_shock": descricao_shock,
        "nota": (
            descricao_shock or (
                f"Bear market -{shock_pct}%: patrimônio × {1-shock_pct/100:.2f} = R${pat_pos_shock:,.0f}. "
                "Para calcular P(FIRE) pós-shock: rodar "
                f"`fire_montecarlo.py --patrimonio {pat_pos_shock}` "
                "e salvar em dashboard_state.json stress_test.pfire_pos_shock_base."
            )
        ),
    }


def _compute_wellness_extras(data: dict) -> dict:
    """Calcula 3 métricas extras para o Financial Wellness Scorecard.

    1. cash_flow_12m: RENDA_ESTIMADA × 12 - CUSTO_VIDA_BASE
    2. fire_anos_restantes: anos até FIRE@50
    3. hipoteca_pct_spending: hipoteca mensal / total_spending_mensal
    """
    premissas = data.get("premissas", {})
    renda_mensal = premissas.get("renda_estimada", 45000)
    custo_vida = premissas.get("custo_vida_base", 250000)
    ano_atual = premissas.get("ano_atual", 2026)
    idade_atual = premissas.get("idade_atual", 39)
    idade_fire_aspir = premissas.get("idade_fire_aspiracional", 50)
    idade_fire_alvo = premissas.get("idade_fire_alvo", 53)

    # 1. Cash flow 12 meses
    cash_flow_12m = (renda_mensal * 12) - custo_vida
    if cash_flow_12m > 0:
        cf_status = "green"
    elif cash_flow_12m > -50000:
        cf_status = "yellow"
    else:
        cf_status = "red"

    # 2. Anos até FIRE@50 aspiracional
    anos_fire_aspir = (ano_atual + (idade_fire_aspir - idade_atual)) - ano_atual
    if anos_fire_aspir <= 11:
        fire_aspir_status = "green"
    elif anos_fire_aspir <= 14:
        fire_aspir_status = "yellow"
    else:
        fire_aspir_status = "red"

    # 3. Hipoteca como % da RENDA (metodologia Boldin: mortgage/income ratio)
    # Fonte hipoteca_sac.json: valor_total_parcela_atual = R$4.134,08/mês
    hipoteca_sac_path = ROOT / "dados" / "hipoteca_sac.json"
    hipoteca_mensal = 4134.08  # fallback — valor de hipoteca_sac.json estado_atual
    if hipoteca_sac_path.exists():
        try:
            hs = json.loads(hipoteca_sac_path.read_text(encoding="utf-8"))
            hipoteca_mensal = hs.get("estado_atual", {}).get("valor_total_parcela_atual", 4134.08)
        except Exception:
            pass

    # Denominador: renda mensal (metodologia Boldin — mortgage vs. income)
    hipoteca_pct_renda = (hipoteca_mensal / renda_mensal * 100) if renda_mensal > 0 else 0
    # Threshold Boldin: verde <30%, amarelo 30-40%, vermelho >40%
    if hipoteca_pct_renda < 30:
        hipoteca_status = "green"
    elif hipoteca_pct_renda < 40:
        hipoteca_status = "yellow"
    else:
        hipoteca_status = "red"

    return {
        "cash_flow_12m": {
            "value": cash_flow_12m,
            "status": cf_status,
            "label": "Cash Flow 12m",
        },
        "fire_anos_restantes": {
            "value": anos_fire_aspir,
            "status": fire_aspir_status,
            "label": f"Anos até FIRE@{idade_fire_aspir}",
        },
        "hipoteca_pct_renda": {
            "value": round(hipoteca_pct_renda, 1),
            "status": hipoteca_status,
            "label": "Hipoteca % Renda",
            "hipoteca_mensal": round(hipoteca_mensal, 2),
            "renda_mensal": renda_mensal,
            "metodologia": "Boldin: mortgage / income",
        },
    }


def _compute_sankey_data(data: dict) -> dict:
    """Gera dados para o Sankey Cash Flow (F8) — estrutura 2 níveis.

    Nível 1: Renda → Investimentos (residual) + Gastos
    Nível 2: Gastos → Impostos + Hipoteca + Must Spend + Like to Spend + Imprevistos

    Fontes:
    - Renda total: renda_estimada × 12
    - Spending por categoria: de spending_summary.json
    - Hipoteca (despesa real): dados/hipoteca_sac.json → total_despesa_real_mensal × 12
    - Investimentos = residual (Renda - Gastos totais)
    """
    premissas = data.get("premissas", {})
    renda_anual = premissas.get("renda_estimada", 45000) * 12   # 540k

    spending_summary = {}
    if SPENDING_SUMMARY.exists():
        try:
            spending_summary = json.loads(SPENDING_SUMMARY.read_text(encoding="utf-8"))
        except Exception:
            pass

    must_anual       = spending_summary.get("must_spend_anual", 180888)
    like_anual       = spending_summary.get("like_spend_anual", 51408)
    imprevistos_anual = spending_summary.get("imprevistos_anual", 4357)

    # Impostos: categoria 'Taxes & Fees' embutida no must_spend.
    # Valor auditado: R$4.189/mês média ago/2025-mar/2026 × 12 = R$50.268/ano
    impostos_anual = spending_summary.get("taxes_anual", None)
    if impostos_anual is None:
        impostos_anual = 50268
        impostos_estimado = True
    else:
        impostos_estimado = False

    # Hipoteca despesa real: juros + seguros (sem principal = investimento equity imóvel)
    hipoteca_despesa_anual = 0.0
    hipoteca_file = ROOT / "dados" / "hipoteca_sac.json"
    if hipoteca_file.exists():
        try:
            hipoteca_data = json.loads(hipoteca_file.read_text(encoding="utf-8"))
            total_despesa_real_mensal = (
                hipoteca_data.get("classificacao_financeira", {})
                .get("total_despesa_real_mensal", 0)
            )
            hipoteca_despesa_anual = total_despesa_real_mensal * 12
        except Exception:
            hipoteca_despesa_anual = 31404  # fallback: 2616.95 × 12

    # Must Spend outros = must_anual - impostos - hipoteca (ambos já incluídos no must_spend)
    must_outros = max(0, must_anual - impostos_anual - hipoteca_despesa_anual)

    # Gastos totais (must já inclui impostos e hipoteca)
    gastos_totais = must_anual + like_anual + imprevistos_anual

    # Investimentos = residual
    investimentos = max(0, renda_anual - gastos_totais)

    savings_rate = investimentos / renda_anual * 100 if renda_anual > 0 else 0

    return {
        "renda_total": renda_anual,
        "gastos_totais": gastos_totais,
        "investimentos": investimentos,
        "impostos": impostos_anual,
        "impostos_estimado": impostos_estimado,
        "hipoteca": hipoteca_despesa_anual,
        "must_outros": must_outros,
        "like_spend": like_anual,
        "imprevistos": imprevistos_anual,
        "nota": (
            f"Savings rate: {savings_rate:.0f}% | "
            f"Renda: R${renda_anual:,.0f} | "
            f"Gastos: R${gastos_totais:,.0f} | "
            f"Investimentos: R${investimentos:,.0f}"
        ),
        "nota_impostos": (
            "Impostos = categoria 'Taxes & Fees' do spending_analysis "
            "(estimado R$50.3k/ano)" if impostos_estimado else ""
        ),
        "nota_hipoteca": "Hipoteca: juros + seguros (sem principal). Principal = investimento (equity imóvel).",
    }


def bump_version(major_label: str | None = None) -> dict:
    """Lê version.json, incrementa minor (ou major se --major), salva e retorna."""
    if VERSION_FILE.exists():
        v = json.loads(VERSION_FILE.read_text())
    else:
        v = {"major": 1, "minor": 0, "label": "", "date": "", "history": []}

    if major_label:
        # Major bump — requer confirmação prévia do Diego
        v["major"] += 1
        v["minor"] = 0
        v["label"] = major_label
    else:
        v["minor"] += 1

    from datetime import date
    v["date"] = str(date.today())

    version_str = f"{v['major']}.{v['minor']}"
    entry = {"version": version_str, "date": v["date"], "label": v.get("label", "")}
    v.setdefault("history", []).append(entry)

    VERSION_FILE.write_text(json.dumps(v, indent=2, ensure_ascii=False))
    return v


def build(data_path: Path, template_path: Path, out_path: Path,
          major_label: str | None = None) -> None:
    # 1. Ler dados
    if not data_path.exists():
        print(f"❌ Arquivo de dados não encontrado: {data_path}", file=sys.stderr)
        print("   Execute primeiro: python3 scripts/generate_data.py", file=sys.stderr)
        sys.exit(1)

    with open(data_path) as f:
        data = json.load(f)

    # 1b. Enriquecer data com campos calculados (F1–F11)
    # Cada função lê de suas fontes primárias; nunca inventa dados.

    # F3: Earliest FIRE Date
    data["earliest_fire"] = _compute_earliest_fire(data)

    # F2: Spending Guardrails
    data["spending_guardrails"] = _compute_spending_guardrails(data)

    # F10: Wellness extras (3 métricas adicionais)
    data["wellness_extras"] = _compute_wellness_extras(data)

    # F4: Scenario Comparison — dados já em data["pfire50"]/["pfire53"]
    # Adicionar pat_mediano para F4 vindo de dashboard_state.json
    _ds_path = ROOT / "dados" / "dashboard_state.json"
    if _ds_path.exists():
        try:
            _ds = json.loads(_ds_path.read_text(encoding="utf-8"))
            _fire_state = _ds.get("fire", {})

            # Garantir que pfire50/pfire53 existem em data (fallback de dashboard_state.json)
            # generate_data.py já popula esses campos, mas se data.json vier de outra fonte
            # ou se os campos estiverem ausentes, ler das chaves planas do state.
            if not data.get("pfire50") or data["pfire50"].get("base") is None:
                fire_st = _fire_state
                data["pfire50"] = {
                    "base":   fire_st.get("pfire50_base", None),
                    "fav":    fire_st.get("pfire50_fav", None),
                    "stress": fire_st.get("pfire50_stress", None),
                }
            if not data.get("pfire53") or data["pfire53"].get("base") is None:
                fire_st = _fire_state
                data["pfire53"] = {
                    "base":   fire_st.get("pfire53_base", fire_st.get("pfire_base", None)),
                    "fav":    fire_st.get("pfire53_fav",  fire_st.get("pfire_fav", None)),
                    "stress": fire_st.get("pfire53_stress", fire_st.get("pfire_stress", None)),
                }
            data["scenario_comparison"] = {
                "fire53": {
                    "base": data["pfire53"]["base"],
                    "fav":  data["pfire53"]["fav"],
                    "stress": data["pfire53"]["stress"],
                    "pat_mediano": _fire_state.get("pat_mediano_fire", None),
                    "pat_p10": _fire_state.get("pat_p10_fire", None),
                    "pat_p90": _fire_state.get("pat_p90_fire", None),
                },
                "fire50": {
                    "base": data["pfire50"]["base"],
                    "fav":  data["pfire50"]["fav"],
                    "stress": data["pfire50"]["stress"],
                    "pat_mediano": _fire_state.get("pat_mediano_fire50", None),
                    "pat_p10": _fire_state.get("pat_p10_fire50", None),
                    "pat_p90": _fire_state.get("pat_p90_fire50", None),
                },
                "nota_fire50_pat": None,
            }
        except Exception as e:
            print(f"⚠️  scenario_comparison: erro ao ler dashboard_state.json — {e}")
            data["scenario_comparison"] = None

    # F6: Life Events
    if LIFE_EVENTS_FILE.exists():
        try:
            data["life_events_planejados"] = json.loads(
                LIFE_EVENTS_FILE.read_text(encoding="utf-8")
            )
        except Exception as e:
            print(f"⚠️  life_events: erro ao ler — {e}")
            data["life_events_planejados"] = []
    else:
        data["life_events_planejados"] = []

    # F5: Must/Like to Spend — de spending_summary.json
    if SPENDING_SUMMARY.exists():
        try:
            data["spending_breakdown"] = json.loads(
                SPENDING_SUMMARY.read_text(encoding="utf-8")
            )
        except Exception as e:
            print(f"⚠️  spending_breakdown: erro ao ler spending_summary.json — {e}")
            data["spending_breakdown"] = None
    else:
        print("⚠️  spending_summary.json não encontrado — F5 desabilitado. "
              "Rodar: python3 scripts/spending_analysis.py <csv> --json-output")
        data["spending_breakdown"] = None

    # F1: Lifetime Income Projection
    data["income_projection"] = _compute_income_projection(data)

    # F7: Net Worth Projection P10/P50/P90
    data["net_worth_projection"] = _compute_net_worth_projection(data)

    # F11: Stress Test
    data["stress_test"] = _compute_stress_test(data)

    # F8: Sankey Cash Flow
    data["sankey_data"] = _compute_sankey_data(data)

    # 1c. Validar schema
    _validate_data(data)

    # 2. Ler template
    if not template_path.exists():
        print(f"❌ Template não encontrado: {template_path}", file=sys.stderr)
        sys.exit(1)

    template = template_path.read_text(encoding="utf-8")

    if PLACEHOLDER not in template:
        print(f"❌ Placeholder '{PLACEHOLDER}' não encontrado no template", file=sys.stderr)
        sys.exit(1)

    # 3. Versão (auto-incrementa minor)
    ver = bump_version(major_label)
    version_str = f"{ver['major']}.{ver['minor']}"

    # 4. Gerar timestamp BRT (UTC-3)
    brt = timezone(timedelta(hours=-3))
    now_brt = datetime.now(brt)
    generated_at = now_brt.strftime("%Y-%m-%dT%H:%M:%S-03:00")

    # 5. Montar bloco JavaScript DATA
    data["version"] = version_str
    data_js = _build_data_js(data, generated_at, version_str)

    # 6. Substituir placeholder
    html = template.replace(PLACEHOLDER, data_js, 1)

    # 7. Escrever output
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html, encoding="utf-8")
    print(f"✅ Dashboard gerado: {out_path}")
    print(f"   Versão: v{version_str} | Data/hora: {generated_at}")
    print(f"   Tamanho: {len(html):,} chars ({len(html.splitlines()):,} linhas)")


def _build_data_js(data: dict, generated_at: str, version: str) -> str:
    """Converte dashboard/data.json para o bloco JS const DATA = {...}"""
    data_json = json.dumps(data, ensure_ascii=False, indent=2)
    lines = [
        f"const GENERATED_AT = new Date('{generated_at}'); // BRT (UTC-3)",
        f"const VERSION = '{version}';",
        "",
        f"const DATA = {data_json};",
    ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Build dashboard/index.html from template + data")
    parser.add_argument("--data",     type=Path, default=DATA_FILE)
    parser.add_argument("--template", type=Path, default=TEMPLATE)
    parser.add_argument("--out",      type=Path, default=OUTPUT)
    parser.add_argument("--major",    type=str,  default=None,
                        help="Bump major version com esta descrição de milestone")
    args = parser.parse_args()

    build(args.data, args.template, args.out, args.major)


if __name__ == "__main__":
    main()
