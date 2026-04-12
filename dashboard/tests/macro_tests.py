"""
Macro domain tests — macro-strip and exposicao-cambial blocks.

Blocks covered:
  macro-strip      — Selic / Fed Funds / Spread / plano_status semaforo
  exposicao-cambial — BRL/USD exposure gauge + concentracao brasil

GIVEN/WHEN/THEN/SEVERITY format.
Categories: DATA | RENDER | VALUE | PRIVACY | SPEC
Severities: CRITICAL | HIGH | MEDIUM
"""

from .base import registry, load_data, load_html, load_spec, get_nested, BUILD_PY

# ─────────────────────────────────────────────────────────────────────────────
# macro-strip — DATA
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="macro-strip",
    category="DATA",
    description="macro.selic_meta presente e eh float positivo",
    severity="CRITICAL",
)
def _():
    # GIVEN data.json carregado
    # WHEN acesso macro.selic_meta
    # THEN deve ser float > 0 (taxa nao pode ser nula ou zero)
    val = get_nested(load_data(), "macro.selic_meta")
    if val is None:
        return False, "macro.selic_meta ausente em data.json"
    if not isinstance(val, (int, float)):
        return False, f"macro.selic_meta nao e numerico: {val!r}"
    if val <= 0:
        return False, f"macro.selic_meta deve ser positivo, obtido {val}"
    return True, f"selic_meta={val}"


@registry.test(
    block_id="macro-strip",
    category="DATA",
    description="macro.fed_funds presente e eh float positivo",
    severity="CRITICAL",
)
def _():
    # GIVEN data.json carregado
    # WHEN acesso macro.fed_funds
    # THEN deve ser float >= 0 (Fed Funds pode ser zero em ZLB, nunca negativo nos EUA)
    val = get_nested(load_data(), "macro.fed_funds")
    if val is None:
        return False, "macro.fed_funds ausente em data.json"
    if not isinstance(val, (int, float)):
        return False, f"macro.fed_funds nao e numerico: {val!r}"
    if val < 0:
        return False, f"macro.fed_funds nao pode ser negativo: {val}"
    return True, f"fed_funds={val}"


@registry.test(
    block_id="macro-strip",
    category="DATA",
    description="macro.spread_selic_ff presente e eh float",
    severity="HIGH",
)
def _():
    # GIVEN data.json carregado
    # WHEN acesso macro.spread_selic_ff
    # THEN deve existir e ser numerico
    val = get_nested(load_data(), "macro.spread_selic_ff")
    if val is None:
        return False, "macro.spread_selic_ff ausente em data.json"
    if not isinstance(val, (int, float)):
        return False, f"macro.spread_selic_ff nao e numerico: {val!r}"
    return True, f"spread_selic_ff={val}"


@registry.test(
    block_id="macro-strip",
    category="DATA",
    description="macro.plano_status.status presente e eh string nao vazia",
    severity="HIGH",
)
def _():
    # GIVEN data.json carregado
    # WHEN acesso macro.plano_status.status
    # THEN deve ser string (ex: 'MONITORAR', 'OK', 'ALERTA')
    val = get_nested(load_data(), "macro.plano_status.status")
    if val is None:
        return False, "macro.plano_status.status ausente em data.json"
    if not isinstance(val, str) or not val.strip():
        return False, f"macro.plano_status.status deve ser string nao vazia: {val!r}"
    return True, f"plano_status.status={val!r}"


# ─────────────────────────────────────────────────────────────────────────────
# macro-strip — VALUE (sanity de dominio)
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="macro-strip",
    category="VALUE",
    description="selic_meta dentro do range plausivel [5, 20]",
    severity="CRITICAL",
)
def _():
    # GIVEN Selic meta historicamente entre 5% e 20% no Brasil moderno
    # WHEN leio o valor atual
    # THEN deve estar dentro do range [5, 20] — fora disso e dado corrompido ou erro de unidade
    val = get_nested(load_data(), "macro.selic_meta")
    if val is None:
        return False, "macro.selic_meta ausente"
    low, high = 5.0, 20.0
    if not (low <= val <= high):
        return False, f"selic_meta={val} fora do range plausivel [{low}, {high}]"
    return True, f"selic_meta={val} dentro de [{low}, {high}]"


@registry.test(
    block_id="macro-strip",
    category="VALUE",
    description="fed_funds dentro do range plausivel [0, 15]",
    severity="CRITICAL",
)
def _():
    # GIVEN Fed Funds historicamente entre 0% e 15% no ciclo moderno
    # WHEN leio o valor atual
    # THEN deve estar dentro do range [0, 15]
    val = get_nested(load_data(), "macro.fed_funds")
    if val is None:
        return False, "macro.fed_funds ausente"
    low, high = 0.0, 15.0
    if not (low <= val <= high):
        return False, f"fed_funds={val} fora do range plausivel [{low}, {high}]"
    return True, f"fed_funds={val} dentro de [{low}, {high}]"


@registry.test(
    block_id="macro-strip",
    category="VALUE",
    description="spread_selic_ff aproximadamente igual a selic_meta - fed_funds",
    severity="HIGH",
)
def _():
    # GIVEN spread deve refletir a diferenca entre as duas taxas
    # WHEN comparo spread com (selic - fed_funds)
    # THEN diferenca absoluta deve ser < 0.5pp (tolerancia para arredondamento)
    data = load_data()
    selic = get_nested(data, "macro.selic_meta")
    ff = get_nested(data, "macro.fed_funds")
    spread = get_nested(data, "macro.spread_selic_ff")
    if any(v is None for v in [selic, ff, spread]):
        return False, f"Campos ausentes: selic={selic}, fed_funds={ff}, spread={spread}"
    expected = selic - ff
    delta = abs(spread - expected)
    tolerance = 0.5
    if delta > tolerance:
        return False, (
            f"spread={spread:.2f} diverge de selic({selic}) - ff({ff}) = {expected:.2f} "
            f"(delta={delta:.2f} > tolerancia={tolerance})"
        )
    return True, f"spread={spread:.2f} consistente com selic({selic}) - ff({ff}) = {expected:.2f}"


@registry.test(
    block_id="macro-strip",
    category="VALUE",
    description="plano_status.status eh um dos valores reconhecidos",
    severity="MEDIUM",
)
def _():
    # GIVEN status do plano tem estados validos conhecidos
    # WHEN leio o valor
    # THEN deve ser um dos estados esperados pelo dashboard
    val = get_nested(load_data(), "macro.plano_status.status")
    if val is None:
        return False, "macro.plano_status.status ausente"
    valid = {"OK", "MONITORAR", "ALERTA", "CRITICO"}
    if val not in valid:
        return False, f"status={val!r} nao reconhecido. Esperados: {sorted(valid)}"
    return True, f"status={val!r} valido"


# ─────────────────────────────────────────────────────────────────────────────
# macro-strip — RENDER
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="macro-strip",
    category="RENDER",
    description="HTML contem macroStrip e macroSection",
    severity="CRITICAL",
)
def _():
    # GIVEN index.html gerado pelo pipeline
    # WHEN busco por elementos do bloco macro
    # THEN id="macroStrip" e id="macroSection" devem estar presentes
    html = load_html()
    missing = [elem for elem in ['id="macroStrip"', 'id="macroSection"'] if elem not in html]
    if missing:
        return False, f"Elementos ausentes no HTML: {missing}"
    return True, "macroStrip e macroSection presentes no HTML"


@registry.test(
    block_id="macro-strip",
    category="RENDER",
    description="HTML contem classe macro-strip para layout CSS",
    severity="HIGH",
)
def _():
    # GIVEN dashboard usa class="macro-strip" para o grid de KPIs
    # WHEN busco a classe no HTML
    # THEN deve estar presente (indica que o template nao removeu o bloco)
    html = load_html()
    if 'class="macro-strip"' not in html:
        return False, 'class="macro-strip" ausente no HTML'
    return True, 'class="macro-strip" presente no HTML'


@registry.test(
    block_id="macro-strip",
    category="RENDER",
    description="HTML contem macroStatusBadge para semaforo do plano",
    severity="MEDIUM",
)
def _():
    # GIVEN macroStatusBadge renderiza o status do plano (OK/MONITORAR/ALERTA)
    # WHEN busco o elemento no HTML
    # THEN deve estar presente
    html = load_html()
    if 'id="macroStatusBadge"' not in html:
        return False, 'id="macroStatusBadge" ausente no HTML'
    return True, 'id="macroStatusBadge" presente no HTML'


# ─────────────────────────────────────────────────────────────────────────────
# macro-strip — SPEC
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="macro-strip",
    category="SPEC",
    description="spec.json define macro-strip com data_fields corretos",
    severity="MEDIUM",
)
def _():
    # GIVEN spec.json e a fonte de verdade do contrato de dados
    # WHEN busco o bloco macro-strip
    # THEN data_fields deve incluir os 4 campos esperados
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "macro-strip" not in blocks:
        return False, "bloco macro-strip ausente em spec.json"
    expected = {
        "macro.selic_meta",
        "macro.fed_funds",
        "macro.spread_selic_ff",
        "macro.plano_status.status",
    }
    actual = set(blocks["macro-strip"].get("data_fields", []))
    missing = expected - actual
    if missing:
        return False, f"data_fields faltando em macro-strip: {sorted(missing)}"
    return True, f"macro-strip data_fields completos: {sorted(actual)}"


# ─────────────────────────────────────────────────────────────────────────────
# exposicao-cambial — DATA
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="exposicao-cambial",
    category="DATA",
    description="macro.exposicao_cambial_pct presente e eh float",
    severity="CRITICAL",
)
def _():
    # GIVEN exposicao cambial e o principal indicador do bloco
    # WHEN acesso o campo
    # THEN deve ser numerico (percentual do portfolio em USD/FX)
    val = get_nested(load_data(), "macro.exposicao_cambial_pct")
    if val is None:
        return False, "macro.exposicao_cambial_pct ausente em data.json"
    if not isinstance(val, (int, float)):
        return False, f"macro.exposicao_cambial_pct nao e numerico: {val!r}"
    return True, f"exposicao_cambial_pct={val}"


@registry.test(
    block_id="exposicao-cambial",
    category="DATA",
    description="concentracao_brasil.brasil_pct presente e eh float",
    severity="CRITICAL",
)
def _():
    # GIVEN brasil_pct complementa exposicao_cambial_pct
    # WHEN acesso o campo
    # THEN deve ser numerico
    val = get_nested(load_data(), "concentracao_brasil.brasil_pct")
    if val is None:
        return False, "concentracao_brasil.brasil_pct ausente em data.json"
    if not isinstance(val, (int, float)):
        return False, f"concentracao_brasil.brasil_pct nao e numerico: {val!r}"
    return True, f"brasil_pct={val}"


@registry.test(
    block_id="exposicao-cambial",
    category="DATA",
    description="concentracao_brasil.total_portfolio_brl presente e positivo",
    severity="HIGH",
)
def _():
    # GIVEN total_portfolio_brl e usado para gauge de valor absoluto
    # WHEN acesso o campo
    # THEN deve ser positivo (portfolio nao pode ter valor zero ou negativo)
    val = get_nested(load_data(), "concentracao_brasil.total_portfolio_brl")
    if val is None:
        return False, "concentracao_brasil.total_portfolio_brl ausente em data.json"
    if not isinstance(val, (int, float)):
        return False, f"total_portfolio_brl nao e numerico: {val!r}"
    if val <= 0:
        return False, f"total_portfolio_brl deve ser positivo: {val}"
    return True, f"total_portfolio_brl={val:,.0f}"


@registry.test(
    block_id="exposicao-cambial",
    category="DATA",
    description="cambio (BRL/USD) presente em data.json — top-level ou macro.cambio",
    severity="CRITICAL",
)
def _():
    # GIVEN cambio e usado para conversoes e display no bloco
    # WHEN busco nos dois locais onde pode estar
    # THEN pelo menos um deve estar presente e ser numerico positivo
    data = load_data()
    val = data.get("cambio") or get_nested(data, "macro.cambio")
    if val is None:
        return False, "cambio ausente — nem em top-level nem em macro.cambio"
    if not isinstance(val, (int, float)):
        return False, f"cambio nao e numerico: {val!r}"
    if val <= 0:
        return False, f"cambio deve ser positivo: {val}"
    return True, f"cambio={val}"


# ─────────────────────────────────────────────────────────────────────────────
# exposicao-cambial — VALUE (sanity de dominio)
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="exposicao_cambial_pct dentro do range [0, 100]",
    severity="CRITICAL",
)
def _():
    # GIVEN percentual deve estar entre 0% e 100%
    # WHEN leio o valor
    # THEN range invalido indica erro de calculo ou unidade errada
    val = get_nested(load_data(), "macro.exposicao_cambial_pct")
    if val is None:
        return False, "macro.exposicao_cambial_pct ausente"
    if not (0.0 <= val <= 100.0):
        return False, f"exposicao_cambial_pct={val} fora de [0, 100]"
    return True, f"exposicao_cambial_pct={val:.1f}% dentro de [0, 100]"


@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="brasil_pct dentro do range [0, 100]",
    severity="HIGH",
)
def _():
    # GIVEN brasil_pct e um percentual
    # WHEN leio o valor
    # THEN deve estar entre 0 e 100
    val = get_nested(load_data(), "concentracao_brasil.brasil_pct")
    if val is None:
        return False, "concentracao_brasil.brasil_pct ausente"
    if not (0.0 <= val <= 100.0):
        return False, f"brasil_pct={val} fora de [0, 100]"
    return True, f"brasil_pct={val:.1f}% dentro de [0, 100]"


@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="brasil_pct + exposicao_cambial_pct soma aproximadamente 100",
    severity="HIGH",
)
def _():
    # GIVEN exposicao_cambial_pct representa o que NAO esta em BRL
    # WHEN somo brasil_pct + exposicao_cambial_pct
    # THEN deve ser ~100 (tolerancia 2pp para arredondamentos e classes intermediarias)
    data = load_data()
    br = get_nested(data, "concentracao_brasil.brasil_pct")
    fx = get_nested(data, "macro.exposicao_cambial_pct")
    if br is None or fx is None:
        return False, f"Campos ausentes: brasil_pct={br}, exposicao_cambial_pct={fx}"
    total = br + fx
    tolerance = 2.0
    if abs(total - 100.0) > tolerance:
        return False, (
            f"brasil_pct({br}) + exposicao_cambial_pct({fx}) = {total:.1f} "
            f"(esperado ~100, delta={abs(total-100):.1f} > {tolerance})"
        )
    return True, f"brasil_pct({br:.1f}) + exposicao_cambial({fx:.1f}) = {total:.1f} ~ 100"


@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="cambio BRL/USD dentro do range plausivel [3, 15]",
    severity="CRITICAL",
)
def _():
    # GIVEN BRL/USD historicamente entre 3 e 15 no periodo moderno
    # WHEN leio o valor
    # THEN fora desse range indica erro de unidade (ex: cotacao em centavos) ou dado obsoleto
    data = load_data()
    val = data.get("cambio") or get_nested(data, "macro.cambio")
    if val is None:
        return False, "cambio ausente"
    low, high = 3.0, 15.0
    if not (low <= val <= high):
        return False, f"cambio={val} fora do range plausivel [{low}, {high}] BRL/USD"
    return True, f"cambio={val:.4f} dentro de [{low}, {high}]"


@registry.test(
    block_id="exposicao-cambial",
    category="VALUE",
    description="total_portfolio_brl coerente com brasil_pct (cross-check absoluto vs pct)",
    severity="MEDIUM",
)
def _():
    # GIVEN total_brasil_brl / total_portfolio_brl deve igualar brasil_pct / 100
    # WHEN calculo a razao e comparo
    # THEN diferenca > 1pp indica inconsistencia entre campos
    data = load_data()
    cb = data.get("concentracao_brasil", {})
    total_br = cb.get("total_brasil_brl")
    total_port = cb.get("total_portfolio_brl")
    brasil_pct = cb.get("brasil_pct")
    if any(v is None for v in [total_br, total_port, brasil_pct]):
        return False, (
            f"Campos ausentes: total_brasil={total_br}, "
            f"total_portfolio={total_port}, brasil_pct={brasil_pct}"
        )
    if total_port == 0:
        return False, "total_portfolio_brl e zero — divisao por zero"
    computed_pct = (total_br / total_port) * 100
    delta = abs(computed_pct - brasil_pct)
    tolerance = 1.0
    if delta > tolerance:
        return False, (
            f"brasil_pct={brasil_pct} mas total_brasil/total_portfolio*100 = {computed_pct:.1f} "
            f"(delta={delta:.1f}pp > {tolerance}pp)"
        )
    return True, (
        f"brasil_pct={brasil_pct:.1f}% coerente com "
        f"R${total_br:,.0f} / R${total_port:,.0f} = {computed_pct:.1f}%"
    )


# ─────────────────────────────────────────────────────────────────────────────
# exposicao-cambial — RENDER
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="exposicao-cambial",
    category="RENDER",
    description="HTML contem brasilConcentracao para o gauge de exposicao",
    severity="CRITICAL",
)
def _():
    # GIVEN brasilConcentracao e o elemento DOM que renderiza o bloco
    # WHEN busco no HTML gerado
    # THEN deve estar presente para que buildBrasilConcentracao() funcione
    html = load_html()
    if 'id="brasilConcentracao"' not in html:
        return False, 'id="brasilConcentracao" ausente no HTML — bloco nao renderizara'
    return True, 'id="brasilConcentracao" presente no HTML'


@registry.test(
    block_id="exposicao-cambial",
    category="RENDER",
    description="HTML contem referencia a BRL/USD no display de cambio",
    severity="HIGH",
)
def _():
    # GIVEN cambio BRL/USD deve aparecer no HTML como label ou texto
    # WHEN busco a string no HTML
    # THEN deve estar presente (indica que o KPI de cambio foi gerado)
    html = load_html()
    if "BRL/USD" not in html:
        return False, "BRL/USD ausente no HTML — display de cambio pode estar quebrado"
    return True, "BRL/USD presente no HTML"


@registry.test(
    block_id="exposicao-cambial",
    category="RENDER",
    description="HTML contem buildBrasilConcentracao para inicializacao do bloco",
    severity="MEDIUM",
)
def _():
    # GIVEN buildBrasilConcentracao() e a funcao JS que popula o gauge
    # WHEN busco a chamada no HTML
    # THEN deve estar presente (indica que o builder foi incluido no pipeline)
    html = load_html()
    if "buildBrasilConcentracao" not in html:
        return False, "buildBrasilConcentracao ausente no HTML — bloco nao sera inicializado"
    return True, "buildBrasilConcentracao presente no HTML"


# ─────────────────────────────────────────────────────────────────────────────
# exposicao-cambial — SPEC
# ─────────────────────────────────────────────────────────────────────────────

@registry.test(
    block_id="exposicao-cambial",
    category="SPEC",
    description="spec.json define exposicao-cambial com data_fields corretos",
    severity="MEDIUM",
)
def _():
    # GIVEN spec.json e a fonte de verdade do contrato de dados
    # WHEN busco o bloco exposicao-cambial
    # THEN data_fields deve incluir os 4 campos esperados
    spec = load_spec()
    blocks = {b["id"]: b for b in spec.get("blocks", [])}
    if "exposicao-cambial" not in blocks:
        return False, "bloco exposicao-cambial ausente em spec.json"
    expected = {
        "macro.exposicao_cambial_pct",
        "concentracao_brasil.brasil_pct",
        "concentracao_brasil.total_portfolio_brl",
        "cambio",
    }
    actual = set(blocks["exposicao-cambial"].get("data_fields", []))
    missing = expected - actual
    if missing:
        return False, f"data_fields faltando em exposicao-cambial: {sorted(missing)}"
    return True, f"exposicao-cambial data_fields completos: {sorted(actual)}"
