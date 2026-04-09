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


def _spending_smile_real(ano_pos_fire: int, saude_base: float = 18_000,
                         saude_inflator: float = 0.027,
                         saude_decay: float = 0.50) -> float:
    """Gasto total (lifestyle + saúde) em R$ reais (base 2026) via spending smile.

    Replica a lógica de fire_montecarlo.py gasto_spending_smile() para o dashboard.
    """
    SMILE = {
        "go_go":   {"gasto": 242_000, "inicio": 0,  "fim": 15},
        "slow_go": {"gasto": 200_000, "inicio": 15, "fim": 30},
        "no_go":   {"gasto": 187_000, "inicio": 30, "fim": 99},
    }
    # ANS faixa etária multiplier (age = 53 + ano_pos_fire)
    def _ans(a_pos):
        idade = 53 + a_pos
        if idade >= 64: return 6.0 / 3.0
        if idade >= 59: return 5.0 / 3.0
        if idade >= 54: return 4.0 / 3.0
        return 1.0

    gasto_base = SMILE["no_go"]["gasto"]
    for cfg in SMILE.values():
        if cfg["inicio"] <= ano_pos_fire < cfg["fim"]:
            gasto_base = cfg["gasto"]
            break

    saude = saude_base * (1 + saude_inflator) ** ano_pos_fire * _ans(ano_pos_fire)
    if ano_pos_fire >= SMILE["no_go"]["inicio"]:
        saude *= saude_decay

    return gasto_base + saude


def _compute_income_projection(data: dict) -> dict:
    """Computa projeção de renda de 2026 a 2077 (age 90).

    VALORES EM R$ REAIS (base 2026) — sem inflação nominal.
    Pós-FIRE usa spending smile (go-go/slow-go/no-go + saúde VCMH).

    Fontes:
    - premissas.renda_estimada: R$45k/mês (config.py RENDA_ESTIMADA — mensal)
    - premissas.custo_vida_base: R$250k/ano (pré-FIRE)
    - premissas.inss_anual: R$18k/ano (real constante)
    - premissas.inss_inicio_ano: 12 anos pós-FIRE (age 65 = ano 2052)
    - Spending smile: go-go R$242k / slow-go R$200k / no-go R$187k + saúde
    - life_events.json: casamento R$100k em 2027
    """
    premissas = data.get("premissas", {})
    ano_atual = premissas.get("ano_atual", 2026)
    idade_atual = premissas.get("idade_atual", 39)
    idade_fire_alvo = premissas.get("idade_fire_alvo", 53)
    idade_fire_aspir = premissas.get("idade_fire_aspiracional", 50)
    custo_vida_base = premissas.get("custo_vida_base", 250000)
    inss_anual = premissas.get("inss_anual", 18000)
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
        if ano < ano_fire_base:
            # Pré-FIRE: renda ativa, custo de vida constante em reais
            ra = renda_ativa_anual
            desp = custo_vida_base
            inss_v = 0.0
            saque = 0.0
        else:
            # Pós-FIRE: spending smile (lifestyle + saúde) em reais
            ra = 0.0
            ano_pos_fire = ano - ano_fire_base
            desp = _spending_smile_real(ano_pos_fire)
            if ano >= ano_inss:
                inss_v = inss_anual  # real constante
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

    VALORES EM R$ REAIS (base 2026) — retorno real, spending smile, sem inflação.
    Usa endpoints do MC para âncoras, interpolação exponencial entre eles,
    e retorno real 4.85% pós-FIRE com saque via spending smile.

    Componentes de imóvel, INSS e capital humano: TODO (dados não aprovados).
    """
    premissas = data.get("premissas", {})
    pat_atual = premissas.get("patrimonio_atual", 3472335)
    r = premissas.get("retorno_equity_base", 0.0485)
    ano_atual = premissas.get("ano_atual", 2026)
    idade_atual = premissas.get("idade_atual", 39)
    idade_fire = premissas.get("idade_fire_alvo", 53)
    inss_anual = premissas.get("inss_anual", 18000)

    ano_fire = ano_atual + (idade_fire - idade_atual)
    age_inss = 65
    ano_inss = ano_atual + (age_inss - idade_atual)
    anos_longevidade = 90
    ano_fim = ano_atual + (anos_longevidade - idade_atual)

    # Endpoints MC do dashboard_state.json
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

    anos = list(range(ano_atual, ano_fim + 1))
    p10_vals = []
    p50_vals = []
    p90_vals = []
    anos_ate_fire = ano_fire - ano_atual

    for ano in anos:
        t = ano - ano_atual

        if t <= anos_ate_fire and pat_p50_fire is not None:
            # Interpolação exponencial de pat_atual até endpoints MC no FIRE
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
        else:
            # Pós-FIRE: retorno real + saque via spending smile (R$ reais)
            if pat_p50_fire is not None:
                base_p50 = pat_p50_fire
                base_p10 = pat_p10_fire or base_p50 * 0.59
                base_p90 = pat_p90_fire or base_p50 * 1.64
            else:
                base_p50 = pat_atual
                base_p10 = pat_atual * 0.85
                base_p90 = pat_atual * 1.20

            t_pos_fire = t - anos_ate_fire
            # Spending smile em R$ reais (lifestyle + saúde escalando)
            desp_smile = _spending_smile_real(t_pos_fire)
            # INSS abate do saque (real constante)
            inss_v = inss_anual if ano >= ano_inss else 0.0
            saque_real = max(0.0, desp_smile - inss_v)
            # Saque acumulado (cada ano retira do portfólio)
            # Modelo simplificado: crescimento composto - soma de saques descontados
            p50 = base_p50 * ((1 + r) ** t_pos_fire)
            p10 = base_p10 * ((1 + r * 0.6) ** t_pos_fire)
            p90 = base_p90 * ((1 + r * 1.3) ** t_pos_fire)
            # Descontar saques acumulados (FV dos saques anuais)
            for yr in range(t_pos_fire):
                yr_desp = _spending_smile_real(yr)
                yr_inss = inss_anual if (ano_fire + yr) >= ano_inss else 0.0
                yr_saque = max(0.0, yr_desp - yr_inss)
                yrs_growth = t_pos_fire - yr
                p50 -= yr_saque * ((1 + r) ** yrs_growth)
                p10 -= yr_saque * ((1 + r * 0.6) ** yrs_growth)
                p90 -= yr_saque * ((1 + r * 1.3) ** yrs_growth)

        p10_vals.append(round(max(0, p10)))
        p50_vals.append(round(max(0, p50)))
        p90_vals.append(round(max(0, p90)))

    return {
        "anos": anos,
        "p10": p10_vals,
        "p50": p50_vals,
        "p90": p90_vals,
        "ano_fire": ano_fire,
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
    """Gera dados para o Sankey Cash Flow (F8).

    Fontes:
    - Renda total: renda_estimada × 12
    - Spending por categoria: de spending_summary.json se disponível
    - Aportes: aporte_mensal × 12

    Nota: soma pode não fechar — exibir como está sem ajuste.
    """
    premissas = data.get("premissas", {})
    renda_anual = premissas.get("renda_estimada", 45000) * 12   # 540k
    aporte_anual = premissas.get("aporte_mensal", 25000) * 12   # 300k

    spending_summary = {}
    if SPENDING_SUMMARY.exists():
        try:
            spending_summary = json.loads(SPENDING_SUMMARY.read_text(encoding="utf-8"))
        except Exception:
            pass

    must_anual = spending_summary.get("must_spend_anual", 180888)
    like_anual = spending_summary.get("like_spend_anual", 51408)

    # Impostos: categoria 'Taxes & Fees' está embutida no must_spend.
    # Não há separação automática disponível no spending_summary.json.
    # Valor derivado de spending_analysis.py rodado em 2026-04-08 (categoria Taxes & Fees).
    # TODO: adicionar campo taxes_anual ao spending_summary.json quando spending_analysis.py
    #       for atualizado para exportar breakdown por categoria.
    impostos_anual = spending_summary.get("taxes_anual", None)  # None se não disponível
    if impostos_anual is None:
        # Fallback: usar proporção histórica conhecida de spending_analysis (Taxes & Fees)
        # Valor auditado: R$4.189/mês média ago/2025-mar/2026 × 12 = R$50.268/ano
        # Marcar como estimado no Sankey
        impostos_anual = 50268
        impostos_estimado = True
    else:
        impostos_estimado = False
    must_sem_impostos = max(0, must_anual - impostos_anual)

    return {
        "renda_total": renda_anual,
        "impostos": impostos_anual,
        "impostos_estimado": impostos_estimado,
        "must_spend": must_sem_impostos,
        "like_spend": like_anual,
        "investimentos": aporte_anual,
        "nota": (
            "Soma pode não fechar (renda estimada vs. gastos reais). "
            f"Renda: R${renda_anual:,.0f} | Must: R${must_sem_impostos:,.0f} | "
            f"Like: R${like_anual:,.0f} | Impostos: R${impostos_anual:,.0f} | "
            f"Investimentos: R${aporte_anual:,.0f}"
        ),
        "nota_impostos": (
            "Impostos = categoria 'Taxes & Fees' de spending_analysis "
            "(aprox R$4.189/mês × 12 = R$50.268/ano, período ago/2025-mar/2026)"
            + (" — ESTIMADO" if impostos_estimado else "")
        ),
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
                    "pat_mediano": None,  # TODO: rodar MC com FIRE@50
                    "pat_p10": None,
                    "pat_p90": None,
                },
                "nota_fire50_pat": "Patrimônio mediano FIRE@50 não disponível — requer MC com idade_fire=50",
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
