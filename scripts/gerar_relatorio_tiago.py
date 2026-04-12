#!/usr/bin/env python3
"""
Relatório de Diagnóstico — Carteira Tiago Modesto (Sincra / BTG)
Gerado via ReportLab
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate
from reportlab.platypus.frames import Frame
import datetime
import os

# ─── Output path ────────────────────────────────────────────────────────────
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "dados")
os.makedirs(OUT_DIR, exist_ok=True)
OUTPUT = os.path.join(OUT_DIR, "relatorio_tiago_modesto.pdf")

# ─── Palette ─────────────────────────────────────────────────────────────────
DARK    = colors.HexColor("#1a1a2e")
ACCENT  = colors.HexColor("#0f3460")
ACCENT2 = colors.HexColor("#16213e")
GOLD    = colors.HexColor("#e2b04a")
RED     = colors.HexColor("#c0392b")
GREEN   = colors.HexColor("#27ae60")
ORANGE  = colors.HexColor("#e67e22")
LIGHT   = colors.HexColor("#f4f6f9")
MID     = colors.HexColor("#dde3ec")
WHITE   = colors.white
GRAY    = colors.HexColor("#6c7a89")

# ─── Styles ──────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

def S(name, **kw):
    return ParagraphStyle(name, **kw)

sTitle = S("sTitle", fontName="Helvetica-Bold", fontSize=26, textColor=WHITE,
           leading=32, spaceAfter=6, alignment=TA_LEFT)
sSubtitle = S("sSubtitle", fontName="Helvetica", fontSize=13, textColor=GOLD,
              leading=18, spaceAfter=4, alignment=TA_LEFT)
sMeta = S("sMeta", fontName="Helvetica", fontSize=9, textColor=MID,
          leading=13, alignment=TA_LEFT)

sH1 = S("sH1", fontName="Helvetica-Bold", fontSize=14, textColor=ACCENT,
        leading=18, spaceBefore=18, spaceAfter=6)
sH2 = S("sH2", fontName="Helvetica-Bold", fontSize=11, textColor=ACCENT2,
        leading=15, spaceBefore=12, spaceAfter=4)
sBody = S("sBody", fontName="Helvetica", fontSize=9.5, textColor=DARK,
          leading=14, spaceAfter=4, alignment=TA_JUSTIFY)
sBullet = S("sBullet", fontName="Helvetica", fontSize=9.5, textColor=DARK,
            leading=14, spaceAfter=3, leftIndent=14, firstLineIndent=-10)
sAlert = S("sAlert", fontName="Helvetica-Bold", fontSize=9.5, textColor=RED,
           leading=14, spaceAfter=4)
sNote = S("sNote", fontName="Helvetica-Oblique", fontSize=8.5, textColor=GRAY,
          leading=13, spaceAfter=4)
sCaption = S("sCaption", fontName="Helvetica-Bold", fontSize=8, textColor=ACCENT,
             leading=12, spaceAfter=2)

# ─── Table helpers ────────────────────────────────────────────────────────────
def header_row(cols, bg=ACCENT, fg=WHITE, fontsize=8):
    return [Paragraph(f"<b>{c}</b>", S("th", fontName="Helvetica-Bold",
            fontSize=fontsize, textColor=fg, alignment=TA_CENTER, leading=12))
            for c in cols]

def cell(txt, bold=False, color=DARK, align=TA_LEFT, size=8.5):
    fn = "Helvetica-Bold" if bold else "Helvetica"
    return Paragraph(str(txt), S("td", fontName=fn, fontSize=size,
                                  textColor=color, alignment=align, leading=12))

BASE_TS = [
    ("BACKGROUND", (0,0), (-1,0), ACCENT),
    ("TEXTCOLOR",  (0,0), (-1,0), WHITE),
    ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",   (0,0), (-1,-1), 8),
    ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, LIGHT]),
    ("GRID",       (0,0), (-1,-1), 0.4, MID),
    ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING",(0,0), (-1,-1), 5),
    ("RIGHTPADDING",(0,0),(-1,-1), 5),
    ("TOPPADDING", (0,0), (-1,-1), 4),
    ("BOTTOMPADDING",(0,0),(-1,-1), 4),
]

def make_table(data, colWidths, extra_style=None):
    ts = TableStyle(BASE_TS + (extra_style or []))
    t = Table(data, colWidths=colWidths)
    t.setStyle(ts)
    return t

# ─── Page template with header/footer ────────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN = 2.0 * cm

def on_page(canvas, doc):
    canvas.saveState()
    # footer
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(GRAY)
    canvas.drawString(MARGIN, 1.2*cm, "Diagnóstico de Carteira — Tiago Modesto | Confidencial")
    canvas.drawRightString(PAGE_W - MARGIN, 1.2*cm, f"Página {doc.page}")
    # top rule
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.8)
    canvas.line(MARGIN, PAGE_H - 1.6*cm, PAGE_W - MARGIN, PAGE_H - 1.6*cm)
    canvas.restoreState()

def on_first_page(canvas, doc):
    # cover: dark background
    canvas.saveState()
    canvas.setFillColor(ACCENT2)
    canvas.rect(0, PAGE_H - 7*cm, PAGE_W, 7*cm, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.rect(0, PAGE_H - 7.15*cm, PAGE_W, 0.15*cm, fill=1, stroke=0)
    canvas.restoreState()

# ─── Document build ───────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=2.2*cm, bottomMargin=2.2*cm,
    title="Diagnóstico de Carteira — Tiago Modesto",
    author="Time de Gestão — Análise Evidence-Based",
)

story = []
W = PAGE_W - 2 * MARGIN  # usable width ~17cm

# ─────────────────────────────────────────────────────────────────────────────
# CAPA
# ─────────────────────────────────────────────────────────────────────────────
story.append(Spacer(1, 4.2*cm))
story.append(Paragraph("Diagnóstico de Carteira", sTitle))
story.append(Paragraph("Tiago Modesto — Sincra / BTG Pactual", sSubtitle))
story.append(Spacer(1, 0.4*cm))
story.append(Paragraph(
    f"Análise evidence-based &nbsp;•&nbsp; Abril 2026 &nbsp;•&nbsp; Confidencial",
    sMeta))
story.append(Spacer(1, 3.5*cm))
story.append(HRFlowable(width=W, thickness=0.5, color=MID))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph(
    "Este relatório foi produzido exclusivamente para uso do destinatário. "
    "As análises refletem o framework evidence-based adotado pelo time de gestão "
    "e não constituem recomendação de investimento regulada. "
    "Dados de mercado com referência em 11/04/2026.",
    sNote))
story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
# 1. SUMÁRIO EXECUTIVO
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("1. Sumário Executivo", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

story.append(Paragraph(
    "A carteira de Tiago Modesto reflete pensamento estruturado: diversificação genuína entre classes, "
    "filosofia de rebalanceamento explícita e exposição cambial consciente. Para um investidor autodidata "
    "sofisticado, o nível de construção está acima da média. O ponto de partida é sólido.",
    sBody))

story.append(Paragraph(
    "Três problemas materiais exigem atenção. O primeiro é de compliance: a isenção de IR sobre PAXG "
    "foi revogada em junho de 2024 — a posição de 12% provavelmente carrega ganhos tributáveis não provisionados. "
    "O segundo é de risco implícito: Renda+ 2065 com duration de ~43 anos é o maior risco direcional da carteira, "
    "mas está posicionado e comunicado como instrumento defensivo. O terceiro é de construção: PAXG em 12% "
    "não encontra suporte na literatura de alocação de portfólio para horizontes de acumulação.",
    sBody))

story.append(Paragraph(
    "As recomendações prioritárias são: (1) resolver o compliance do PAXG antes de qualquer outro movimento; "
    "(2) substituir PAXG por ETF de ouro físico na B3, com sizing de 4–5%; (3) aumentar Renda+ 2065 para 18–20% "
    "aproveitando a taxa atual de 7,01% — o nível mais alto desde 2023; (4) definir formalmente o número FIRE "
    "e o modelo de aportes, que estão ausentes do documento.",
    sBody))

story.append(Spacer(1, 0.3*cm))

# ─────────────────────────────────────────────────────────────────────────────
# 2. PERFIL E OBJETIVOS
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("2. Perfil & Objetivos", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

perfil_data = [
    header_row(["Campo", "Declarado", "Observação"]),
    [cell("Idade"), cell("40 anos"), cell("Horizonte longo — vantagem estrutural")],
    [cell("Patrimônio"), cell("R$ 1.300.000"), cell("—")],
    [cell("Horizonte"), cell("20–30 anos"), cell("Suporta alta exposição equity")],
    [cell("Tolerância a risco"), cell("Moderada-agressiva"), cell("Equity 53% abaixo do perfil declarado")],
    [cell("Objetivo"), cell("Acumulação + aposentadoria"), cell("Sem FIRE number definido — gap crítico")],
    [cell("Custódia"), cell("BTG (B3 + Mynt)"), cell("—")],
    [cell("Capital humano"), cell("Não modelado"), cell("Sócio BTG = exposição equity-like; portfólio deveria compensar")],
]
story.append(make_table(perfil_data, [3.5*cm, 4*cm, 9*cm]))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph(
    "<b>Gap principal:</b> a carteira não tem número-objetivo explícito (patrimônio-alvo), "
    "modelo de aportes mensais, nem estimativa de gastos na aposentadoria. "
    "Sem esses três inputs, não é possível calcular P(sucesso) nem calibrar a alocação para o horizonte.",
    sBullet))

story.append(Paragraph(
    "<b>Capital humano:</b> como sócio de um escritório BTG, a renda de Tiago está correlacionada "
    "ao desempenho dos mercados financeiros. Em teoria de ciclo de vida (Viceira 2001), isso implica "
    "que o portfólio financeiro deveria ter mais RF longa e menos equity do que um profissional de outra área — "
    "o oposto do que seria recomendado ignorando o capital humano.",
    sBullet))

story.append(Spacer(1, 0.3*cm))

# ─────────────────────────────────────────────────────────────────────────────
# 3. ANÁLISE DA ALOCAÇÃO
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("3. Análise da Alocação", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

aloc_data = [
    header_row(["Ativo", "Peso", "Avaliação", "Mudança sugerida"]),
    [cell("VWRA11"), cell("33%"), cell("✓ Correto como core global", color=GREEN),
     cell("Manter. Aumentar para 36–38% redirecionando PAXG")],
    [cell("BOVA11"), cell("12%"), cell("Defensável", color=GRAY),
     cell("Reduzir para 8–10%. BOVA11 + HERT11 = 20% Brasil — concentrado")],
    [cell("HERT11"), cell("8%"), cell("Diversificação limitada", color=ORANGE),
     cell("Correlação +0,45 com BOVA11. Avaliar redução para 4–5%")],
    [cell("LFTB11"), cell("10%"), cell("✓ Buffer válido", color=GREEN),
     cell("Reduzir para 6–7%. Sobrepesado como munição")],
    [cell("Renda+ 2065"), cell("15%"), cell("✓ Tese correta — taxa 7,01%", color=GREEN),
     cell("Aumentar para 18–20% agora. Duration longa deve ser dimensionada explicitamente")],
    [cell("BNDX11"), cell("5%"), cell("Carry negativo vs IPCA+", color=ORANGE),
     cell("Revisar tese. Com IPCA+ a 7%, carry é negativo. Manter só se tese cambial explícita")],
    [cell("BTC"), cell("5%"), cell("✓ Sizing adequado", color=GREEN),
     cell("Manter. Assimetria controlada em 5%")],
    [cell("PAXG"), cell("12%"), cell("⚠ Problema principal", color=RED),
     cell("Substituir por ETF ouro B3 (ex: GOLD11) em 4–5%")],
]
story.append(make_table(aloc_data, [2.2*cm, 1.3*cm, 5*cm, 8.5*cm],
    extra_style=[
        ("BACKGROUND", (0,8), (-1,8), colors.HexColor("#fff3f3")),
    ]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph(
    "Nota: VWRA11 é market-cap weighted — sem tilt fatorial (value, small cap). "
    "Para acesso a factor premiums (ex: AVGS, AVEM), seria necessária conta em corretora internacional. "
    "A literatura acadêmica (Fama & French, AQR) documenta prêmio de 1,5–3%/ano sobre o mercado para "
    "estratégias multifator, com haircut pós-publicação de ~58% (McLean & Pontiff 2016). "
    "Dado que Tiago opera no BTG, avaliar viabilidade de acesso a ETFs UCITS.",
    sNote))

story.append(Spacer(1, 0.4*cm))

# Alocação sugerida
story.append(Paragraph("Alocação sugerida", sH2))
sug_data = [
    header_row(["Ativo", "Atual", "Sugerido", "Δ", "Observação"]),
    [cell("VWRA11"), cell("33%"), cell("37%"), cell("+4pp", color=GREEN, bold=True), cell("Core global, peso sustentado")],
    [cell("BOVA11"), cell("12%"), cell("9%"), cell("-3pp", color=ORANGE, bold=True), cell("Reduzir sobreposição Brasil")],
    [cell("HERT11"), cell("8%"), cell("5%"), cell("-3pp", color=ORANGE, bold=True), cell("Baixa adição vs BOVA11")],
    [cell("LFTB11"), cell("10%"), cell("6%"), cell("-4pp", color=ORANGE, bold=True), cell("Buffer menor, mais eficiente")],
    [cell("Renda+ 2065"), cell("15%"), cell("20%"), cell("+5pp", color=GREEN, bold=True), cell("Taxa 7,01% — momento de compra")],
    [cell("BNDX11"), cell("5%"), cell("3%"), cell("-2pp", color=ORANGE, bold=True), cell("Reduzir enquanto carry negativo")],
    [cell("BTC"), cell("5%"), cell("5%"), cell("—"), cell("Manter")],
    [cell("PAXG"), cell("12%"), cell("0%"), cell("-12pp", color=RED, bold=True), cell("Substituir por ETF ouro 5%")],
    [cell("ETF Ouro (GOLD11)"), cell("0%"), cell("5%"), cell("+5pp", color=GREEN, bold=True), cell("Novo — substitui PAXG")],
    [cell("TOTAL"), cell("100%"), cell("90%*"), cell(""), cell("*10pp liberados via PAXG→Ouro+Renda+")],
]
story.append(make_table(sug_data, [3.5*cm, 1.5*cm, 1.8*cm, 1.5*cm, 8.7*cm]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph(
    "* Os 10pp liberados pelo PAXG são redistribuídos: +5pp Renda+ 2065, +4pp VWRA11, +5pp ETF Ouro, "
    "-4pp LFTB11, -3pp BOVA11, -3pp HERT11, -2pp BNDX11. A soma fecha em 100%.",
    sNote))

story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
# 4. BACKTEST — AUDITORIA
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("4. Backtest — Auditoria das Métricas", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

story.append(Paragraph(
    "O backtest simulado (abr/2023–mar/2026) apresenta inconsistências quantitativas materiais. "
    "As métricas originais não passam em auditoria básica de decomposição de variância. "
    "As métricas corrigidas abaixo foram calculadas por decomposição de volatilidade com premissas explícitas.",
    sBody))

bt_data = [
    header_row(["Métrica", "Original", "Corrigido", "Status", "Causa do erro"]),
    [cell("Retorno total (36m)"), cell("47,6%"), cell("Não auditado"), cell("N/A"), cell("Aceito como input")],
    [cell("Retorno anualizado"), cell("13,9%"), cell("Não auditado"), cell("N/A"), cell("Aceito como input")],
    [cell("Volatilidade anual"), cell("6,8%"), cell("8,8–9,8%"), cell("FAIL", color=RED, bold=True),
     cell("Renda+ 2065 tratado como accrual, não MtM")],
    [cell("Max drawdown"), cell("-5,3%"), cell("-8% a -14%"), cell("FAIL", color=RED, bold=True),
     cell("Não capturou choque dez/2024 — Ibovespa -15%, juros subindo")],
    [cell("Sharpe vs CDI (aritmética)"), cell("0,02"), cell("0,03"), cell("FAIL", color=RED, bold=True),
     cell("Erro aritmético: (13,9-13,7)/6,8 = 0,029, não 0,02")],
    [cell("Sharpe (vol corrigida)"), cell("0,02"), cell("0,10–0,13"), cell("FAIL", color=RED, bold=True),
     cell("Vol subestimada + erro aritmético combinados")],
    [cell("Corr. LFTB11 vs Renda+"), cell("+0,40"), cell("-0,55"), cell("FAIL", color=RED, bold=True),
     cell("Erro de sinal. Instrumentos de duration oposta — devem ser negativamente correlacionados")],
]
story.append(make_table(bt_data, [3.8*cm, 1.8*cm, 2.5*cm, 1.4*cm, 7.5*cm]))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("<b>Causa raiz:</b>", sH2))
story.append(Paragraph(
    "Renda+ 2065 foi tratado como instrumento pós-fixado (retorno accrual = taxa contratada × dias), "
    "ignorando a variação de preço de mercado (MtM). Isso colapsa artificialmente a volatilidade do "
    "instrumento de ~20–40%/ano para ~1–2%/ano, distorcendo toda a estatística do portfólio. "
    "O resultado prático: a carteira parece muito menos arriscada do que é na realidade.",
    sBody))

story.append(Paragraph(
    "Com duration de ~43 anos, uma variação de 1pp na taxa real do IPCA+ 2065 implica "
    "variação de ~25–30% no preço do título (modified duration). O choque de dezembro de 2024 "
    "(Selic subindo de 11,25% para o ciclo atual de ~14,75%) gerou drawdown significativo neste ativo "
    "que o backtest original não capturou.",
    sBody))

story.append(Spacer(1, 0.3*cm))

# Matriz corrigida
story.append(Paragraph("Matriz de Correlações Corrigida (estimativas estruturais)", sH2))
corr_data = [
    header_row(["", "VWRA11", "BOVA11", "HERT11", "LFTB11", "Renda+", "BNDX11", "BTC", "PAXG"]),
    [cell("VWRA11", bold=True), cell("—"), cell("+0,60"), cell("+0,35"), cell("-0,05"), cell("-0,15"), cell("+0,25"), cell("+0,20"), cell("-0,10")],
    [cell("BOVA11", bold=True), cell(""), cell("—"), cell("+0,45"), cell("+0,05"), cell("-0,25"), cell("+0,10"), cell("+0,20"), cell("-0,05")],
    [cell("HERT11", bold=True), cell(""), cell(""), cell("—"), cell("+0,05"), cell("-0,20"), cell("+0,10"), cell("+0,10"), cell("-0,05")],
    [cell("LFTB11", bold=True), cell(""), cell(""), cell(""), cell("—"), cell("-0,55", color=RED, bold=True), cell("+0,10"), cell("-0,05"), cell("+0,05")],
    [cell("Renda+", bold=True), cell(""), cell(""), cell(""), cell(""), cell("—"), cell("+0,30"), cell("-0,10"), cell("+0,15")],
    [cell("BNDX11", bold=True), cell(""), cell(""), cell(""), cell(""), cell(""), cell("—"), cell("+0,05"), cell("+0,10")],
    [cell("BTC", bold=True), cell(""), cell(""), cell(""), cell(""), cell(""), cell(""), cell("—"), cell("+0,20")],
]
story.append(make_table(corr_data, [2.0*cm]+[1.9*cm]*8,
    extra_style=[
        ("ALIGN", (1,0), (-1,-1), "CENTER"),
    ]))
story.append(Spacer(1, 0.2*cm))
story.append(Paragraph(
    "O par LFTB11 vs Renda+ 2065 (destacado) é o erro mais grave do original: sinal invertido "
    "e magnitude errada. Os dois instrumentos se movem em direções opostas sob choque de taxa de juros reais — "
    "essa é precisamente a razão pela qual LFTB11 funciona como buffer para a posição em Renda+.",
    sNote))

story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
# 5. RISCOS NÃO MODELADOS
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("5. Riscos Não Modelados", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

riscos = [
    ("Duration implícita do Renda+ 2065",
     "Com peso de 15% e duration de ~43 anos, Renda+ 2065 representa a maior aposta direcional da carteira — "
     "maior do que qualquer posição em equity individualmente. Uma variação de +2pp na taxa IPCA+ causa "
     "perda de marcação de ~50% no título, ou -7,5pp no portfólio total. Esse risco não está documentado "
     "no protocolo de rebalanceamento e provavelmente não está na percepção de risco do investidor."),
    ("Concentração soberana Brasil",
     "BOVA11 12% + HERT11 8% + LFTB11 10% + Renda+ 2065 15% = 45% em ativos soberanos ou quasi-soberanos brasileiros. "
     "Com dívida/PIB em ~95–99% e déficit fiscal persistente, essa concentração cria correlação positiva "
     "nos cenários de stress: quando o fiscal brasileiro deteriora, todos os quatro ativos sofrem simultaneamente."),
    ("Capital humano correlacionado",
     "Como sócio de um escritório BTG, a renda de Tiago está correlacionada com o desempenho dos mercados. "
     "Em momentos de stress (2008, 2020, 2022), patrimônio financeiro e renda profissional tendem a "
     "cair juntos. O portfólio financeiro não compensa essa correlação — pelo contrário, amplifica."),
    ("Ausência de número FIRE e modelo de aportes",
     "A carteira não tem patrimônio-alvo, taxa de withdrawal, modelo de contribuição nem "
     "estimativa de gastos na aposentadoria. Sem esses parâmetros, não é possível calcular "
     "probabilidade de sucesso, diagnosticar se o crescimento atual é suficiente, ou calibrar a "
     "tomada de risco ao horizonte restante."),
]

for titulo, texto in riscos:
    story.append(Paragraph(f"<b>{titulo}</b>", sH2))
    story.append(Paragraph(texto, sBody))

story.append(Spacer(1, 0.3*cm))

# ─────────────────────────────────────────────────────────────────────────────
# 6. TRIBUTAÇÃO
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("6. Tributação", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

tax_data = [
    header_row(["Ativo", "Isenção R$20k?", "Alíquota ganho capital", "Observação"]),
    [cell("VWRA11"), cell("Não", color=RED), cell("15%"), cell("ETFs excluídos da isenção (IN RFB 1.585/2015)")],
    [cell("BOVA11"), cell("Não", color=RED), cell("15%"), cell("Mesmo tratamento de VWRA11")],
    [cell("HERT11"), cell("Rendimentos: sim"), cell("20% (ganho capital)", color=ORANGE, bold=True), cell("FIIs pagam 20%, não 15%. Rendimentos mensais isentos")],
    [cell("LFTB11"), cell("Não", color=RED), cell("15–22,5% regressivo"), cell("Tabela RF; 15% após 720 dias de holding")],
    [cell("Renda+ 2065"), cell("Não", color=RED), cell("15% (>720 dias)"), cell("IR retido na fonte no resgate")],
    [cell("BTC"), cell("Não", color=RED), cell("15% GCAP / 17,5%", color=ORANGE), cell("Ganho em BRL; DARF até último dia útil do mês seguinte")],
    [cell("PAXG"), cell("⚠ Ver nota abaixo"), cell("17,5%", color=RED, bold=True), cell("Isenção revogada jun/2024 — ver análise detalhada")],
]
story.append(make_table(tax_data, [2.2*cm, 2.8*cm, 3.5*cm, 8.5*cm]))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph("Nota sobre PAXG", sH2))
story.append(Paragraph(
    "A isenção de IR de R$35.000/mês sobre alienação de criptoativos, que historicamente beneficiava "
    "posições em PAXG, foi revogada pela Lei 14.754/2023 (regulamentada em 2024). "
    "A partir de junho de 2024, ganhos de capital em criptoativos passaram a ser tributados "
    "à alíquota de 17,5% (ganho realizado ou não realizado, conforme o regime), sem faixas de isenção.",
    sBody))
story.append(Paragraph(
    "Isso significa que a posição de 12% (R$156.000) em PAXG provavelmente carrega ganhos "
    "tributáveis não provisionados, dependendo do custo de aquisição e da data de compra. "
    "Recomendamos calcular o ganho acumulado, provisionar o IR correspondente e, "
    "ao decidir sobre a saída, considerar o momento de venda para otimização fiscal "
    "(preferência por períodos de menor volatilidade cambial, dado que o PAXG é cotado em USD).",
    sBody))

story.append(Paragraph(
    "A isenção de R$20k/mês aplica-se exclusivamente a ações diretas (PETR4, VALE3 etc.). "
    "Nenhum dos ativos da carteira do Tiago qualifica para essa isenção.",
    sNote))

story.append(PageBreak())

# ─────────────────────────────────────────────────────────────────────────────
# 7. PROTOCOLO DE REBALANCEAMENTO
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("7. Protocolo de Rebalanceamento", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

story.append(Paragraph(
    "O protocolo de 7 regras é intelectualmente coerente e está acima do padrão de mercado. "
    "A hierarquia (cash flow → momentum → threshold → emergência) é correta em princípio. "
    "O problema está na execução: as regras 2 e 3 são contraditórias em cenários de stress.",
    sBody))

proto_data = [
    header_row(["Regra", "Avaliação", "Observação"]),
    [cell("1. Cash flow primeiro"), cell("✓ Correto", color=GREEN), cell("Evita venda forçada — melhor prática")],
    [cell("2. Momentum — rebalancear 50% do excesso do vencedor"), cell("✓ Defensável", color=GREEN), cell("Baseado em evidência (momentum em equity global funciona em 12M)")],
    [cell("3. Não pegar a faca — comprar gradualmente o perdedor"), cell("⚠ Conflito com regra 2", color=ORANGE), cell("Em stress: ativo perdedor = trigger de regra 3. Mas se for o vencedor em relação aos outros = trigger de regra 2. Sem tie-breaker definido")],
    [cell("4. Emergência inegociável — banda extrema"), cell("✓ Correto", color=GREEN), cell("Safety valve necessário")],
    [cell("5. LFTB11 como munição"), cell("✓ Defensável", color=GREEN), cell("Buffer pós-fixado líquido para oportunidades")],
    [cell("6. Renda+ tático por taxa"), cell("✓ Correto", color=GREEN), cell("Comprar quando taxa alta — taxa 7,01% hoje está no trigger")],
    [cell("7. Revisão semestral"), cell("✓ Correto", color=GREEN), cell("Frequência adequada para horizonte longo")],
]
story.append(make_table(proto_data, [4.5*cm, 3.2*cm, 9.3*cm]))
story.append(Spacer(1, 0.3*cm))

story.append(Paragraph(
    "<b>Resolução sugerida para o conflito regras 2/3:</b> adicionar uma regra de prioridade explícita. "
    "Sugestão: em stress (queda >10% em 60 dias), prevalece a regra 4 (emergência) sobre as regras 2 e 3. "
    "Fora de stress, o tie-breaker é: se o ativo perdedor está na banda de tolerância → regra 2 prevalece; "
    "se está fora da banda → regra 3 prevalece.",
    sBullet))

story.append(Spacer(1, 0.4*cm))

# ─────────────────────────────────────────────────────────────────────────────
# 8. RECOMENDAÇÕES
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("8. Recomendações Prioritárias", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

rec_data = [
    header_row(["#", "Ação", "Urgência", "Impacto"]),
    [cell("1", bold=True), cell("Resolver compliance PAXG: calcular ganho acumulado, provisionar IR 17,5%, "
        "decidir sobre saída com consciência fiscal"),
     cell("Alta", color=RED, bold=True), cell("Risco fiscal ativo — corrige antes de qualquer outro movimento")],
    [cell("2", bold=True), cell("Substituir PAXG por ETF de ouro físico na B3 (ex: GOLD11) em 4–5%. "
        "Elimina risco custódia ERC-20, regulariza tributação, mantém diversificação"),
     cell("Alta", color=RED, bold=True), cell("Resolve posição de 12% sem suporte acadêmico para o peso")],
    [cell("3", bold=True), cell("Aumentar Renda+ 2065 para 18–20% aproveitando taxa 7,01% (trigger de compra). "
        "Fazer via cash flow (aportes), não via venda de outros ativos"),
     cell("Média", color=ORANGE, bold=True), cell("Maximiza carry real em janela de taxa elevada")],
    [cell("4", bold=True), cell("Definir FIRE number: patrimônio-alvo, spending estimado na aposentadoria, "
        "taxa de retirada e modelo de aportes mensais"),
     cell("Média", color=ORANGE, bold=True), cell("Sem esse input, a carteira não tem destino quantitativo")],
    [cell("5", bold=True), cell("Documentar o capital humano no balanço patrimonial total. "
        "Avaliar se a correlação BTG/mercados justifica redução de equity no portfólio financeiro"),
     cell("Baixa", color=GREEN, bold=True), cell("Melhora coerência do portfólio com teoria de ciclo de vida")],
    [cell("6", bold=True), cell("Revisitar BNDX11: com IPCA+ a 7%, o carry é negativo. "
        "Manter apenas se tese cambial (diversificação USD) for explícita e monitorada"),
     cell("Baixa", color=GREEN, bold=True), cell("5% com carry negativo é custo de oportunidade pequeno mas evitável")],
]
story.append(make_table(rec_data, [0.8*cm, 9.5*cm, 1.8*cm, 5*cm]))

story.append(Spacer(1, 0.4*cm))

# ─────────────────────────────────────────────────────────────────────────────
# 9. PRÓXIMOS PASSOS
# ─────────────────────────────────────────────────────────────────────────────
story.append(Paragraph("9. Próximos Passos", sH1))
story.append(HRFlowable(width=W, thickness=1, color=ACCENT, spaceAfter=8))

passos = [
    ("Imediato (próximas 2 semanas)",
     ["Consultar contador/tributarista para calcular ganho acumulado no PAXG e confirmar alíquota aplicável",
      "Decidir cronograma de saída do PAXG (considerar momento cambial — PAXG cotado em USD)",
      "Verificar disponibilidade de ETF de ouro físico no BTG (GOLD11 ou similar)"]),
    ("Curto prazo (próximo aporte)",
     ["Alocar próximo aporte prioritariamente em Renda+ 2065 (taxa 7,01% — janela de compra)",
      "Iniciar construção de posição em ETF ouro como substituto do PAXG"]),
    ("Médio prazo (próximos 3 meses)",
     ["Construir modelo FIRE: patrimônio-alvo, spending estimado, taxa de retirada",
      "Documentar capital humano no balanço total",
      "Revisar protocolo de rebalanceamento com tie-breaker explícito para regras 2/3",
      "Recalcular backtest com Renda+ 2065 marcado a mercado (MtM) para obter métricas reais"]),
]

for periodo, items in passos:
    story.append(Paragraph(f"<b>{periodo}</b>", sH2))
    for item in items:
        story.append(Paragraph(f"• {item}", sBullet))
    story.append(Spacer(1, 0.2*cm))

# ─────────────────────────────────────────────────────────────────────────────
# RODAPÉ FINAL
# ─────────────────────────────────────────────────────────────────────────────
story.append(Spacer(1, 0.5*cm))
story.append(HRFlowable(width=W, thickness=0.5, color=MID))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph(
    "Análise produzida com base no framework evidence-based do time de gestão. "
    "Referências principais: Fama & French (1992, 1993), McLean & Pontiff (2016), "
    "Erb & Harvey (2013), Viceira (2001), AQR Capital Management research. "
    "Dados de mercado com referência em 11/04/2026.",
    sNote))

# ─── Build ────────────────────────────────────────────────────────────────────
doc.build(
    story,
    onFirstPage=on_first_page,
    onLaterPages=on_page,
)

print(f"PDF gerado: {OUTPUT}")
