# FR-guardrails-categoria-elasticidade: Separar Saúde de Lifestyle nos Guardrails MC

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-guardrails-categoria-elasticidade |
| **Dono** | FIRE |
| **Status** | Concluída |
| **Prioridade** | Média |
| **Participantes** | FIRE, Quant, Fact-Checker, Dev |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-28 |
| **Origem** | Bloqueio do Gap T (HD-dashboard-gaps-tier3) — P(FIRE Quality) incomputável sem essa separação |
| **Concluido em** | 2026-04-28 |

---

## Motivo / Gatilho

Gap T (P(FIRE Quality)) foi fechado sem implementação porque o modelo de guardrails corta saúde e lifestyle proporcionalmente no mesmo valor (`gasto_bruto`). Para calcular a qualidade da aposentadoria — "com que frequência o lifestyle fica acima do piso?" — é necessário isolar o gasto lifestyle do gasto saúde.

Sem essa separação, a extração `gasto_lifestyle = gasto_bruto × lifestyle_ratio` produz P(quality) = 29.5%, implausível vs. literatura (esperado 75–85% para SWR 2.4%). Isso indicou que o modelo está errado, não o número.

---

## Descricao

O modelo MC atual trata `gasto_bruto` como um único bloco e aplica guardrails proporcionalmente sobre ele. Na vida real, saúde é inelástica (não cortável) e lifestyle é elástica (cortável em adversidade). O modelo precisa:

1. Separar o gasto em duas categorias: `gasto_saude` e `gasto_lifestyle`
2. Guardrails cortam apenas `gasto_lifestyle`, nunca `gasto_saude`
3. Com essa separação, P(FIRE Quality) = P(gasto_lifestyle ≥ piso_lifestyle em ≥ X% do tempo)

---

## Escopo

- [x] Mapear como `gasto_bruto` é construído em `fire_montecarlo.py` (spending smile + saúde + guardrails)
- [x] Definir split `gasto_saude` / `gasto_lifestyle` por fase (go-go, slow-go, no-go)
- [x] Modificar guardrails: cut proporcional só sobre `gasto_lifestyle`; `gasto_saude` protegido
- [x] Adicionar output `gasto_lifestyle_trajetoria` no resultado MC por trajetória
- [x] Calcular P(quality) = P(gasto_lifestyle_anual ≥ piso_lifestyle em ≥ 90% dos anos)
- [x] Validar com Quant + Fact-Checker: P(quality|surviving)=81.4% (sem benchmark acadêmico validado)
- [x] Implementar widget Gap T em Assumptions tab

---

## Raciocinio

**Argumento central:** Saúde não é cortável em stress financeiro — é uma necessidade inelástica. Misturar com lifestyle no mesmo bloco de corte distorce completamente a métrica de qualidade de vida na aposentadoria.

**Alternativas rejeitadas:**
- P(gasto_bruto ≥ R$220k): métrica sem benchmark na literatura, arbitrária, e confusa vs. headline P(FIRE)
- Manter modelo atual: produz P(quality) = 29.5% que é demonstravelmente errado

**Incerteza reconhecida:** O split saúde/lifestyle por fase (go-go vs. slow-go vs. no-go) pode ser difícil de parametrizar — saúde sobe no no-go justamente quando lifestyle cai.

**Falsificação:** Se após a separação P(quality) ainda ficar < 50%, o problema é estrutural na SWR, não no modelo de guardrails.

---

## Analise

**Iterações de piso lifestyle:**
- Tentativa 1 (piso fixo R$200k): P(quality)=0% — no_go=R$187k < piso em todos os anos → descartado
- Tentativa 2 (fração 0.90): P(quality)=51.7% — muito restritivo, falha em banda 1+ (dd>15%)
- Tentativa 3 (fração 0.80): P(quality)=64.3% — falha apenas em banda 3 (dd>35%, go_go→R$180k)

**Quant audit:**
- Banda 3 aplica floor absoluto `GASTO_PISO=R$180k`, não corte percentual; effective cut=25.6%
- `guardrails_piso_pct=0.28` é parâmetro legado inconsistente com lógica atual
- P(quality|surviving) = 64.3%/79.0% = 81.4% — decomposição validada

**Fact-Checker:**
- Inelasticidade de saúde: CONFIRMADA (Morningstar, Kitces, Blanchett)
- Benchmark "75–85% para SWR 2.4%": REFUTADO — sem fonte acadêmica publicada
- Kitces moderno separa discricionário de essencial: PARCIAL confirmado

**Descoberta colateral — P(FIRE) 86.4% → 79.0% (-7.4pp):**
- Correto: modelo antigo comprimia saúde dentro do corte de guardrails (incluída no R$180k floor)
- Novo modelo: total mínimo = R$180k lifestyle + saúde (R$24k–R$197k por fase)
- Número mais honesto, aprovado por Diego em 2026-04-28

---

## Conclusao

Separação saúde/lifestyle implementada com sucesso. O modelo MC agora trata saúde como gasto inelástico (sempre pago, fora dos guardrails) e lifestyle como gasto elástico (sujeito a cortes em stress). A mudança corrigiu um bug estrutural que subestimava o custo real em cenários adversos.

A queda de P(FIRE) de 86.4% → 79.0% é consequência direta e correta da correção: o modelo antigo "economizava" comprimindo saúde junto com lifestyle sob o floor de R$180k, o que é economicamente impossível.

P(quality) = 64.3% (N=10k) / 81.4% (condicional) com piso dinâmico 80% do target da fase. Gap T widget implementado em Assumptions tab.

---

## Resultado

- `fire_montecarlo.py`: `gasto_spending_smile_split()` retorna `(gasto_lifestyle, gasto_saude)` — guardrails só recebem lifestyle
- `config.py`: `GASTO_PISO=R$180k`, `PISO_LIFESTYLE_FRACTION=0.80`, `SAUDE_BASE=R$24k`
- `generate_data.py`: `p_quality` extraído do state + assertion de schema (323/323 spec fields OK)
- `assumptions/page.tsx`: card Gap T com P(quality), P(quality|surviving), piso por fase, nota metodológica
- P(FIRE) atualizado: 79.0% (base). Aprovado por Diego 2026-04-28.
- Build limpo. 563 testes passando. Deploy feito.

---

## Proximos Passos

— (issue encerrada)
