# Guia de Issues

## IDs de Issues
Formato: `{SIGLA}-{slug-descritivo}` — sigla do agente responsavel principal + slug curto legível sem contexto.
HD (Head), FI (Factor), RF (Renda Fixa), FR (FIRE), TX (Tributacao), RK (Risco/Tactical), FX (Cambio), MA (Macro), PT (Patrimonial), DA (Devil's Advocate), OV (Outside View), OPS (Ops), XX (Cross-domain)

Exemplos: `FR-spending-smile`, `RK-gold-hedge`, `MA-bond-correlation`
Regra: 1-3 palavras em kebab-case, sem número. O slug deve dizer o assunto sem precisar ler o título.

## Status de Issues
`Refinamento` -> `Backlog` -> `Doing` -> `Done`

## Fluxo Conversa -> Issue
```
Conversa -> Agente (ou Head) identifica tema que merece profundidade
         -> Precisa de co-sponsor: ao menos 1 agente com peso ≥ 1x concorda que é issue
           (evita issues por impulso ou de baixo impacto)
         -> Head sugere ao Diego (com ID, titulo, responsavel, co-sponsor)
         -> Diego aprova -> Cria arquivo em agentes/issues/{ID}.md (usar _TEMPLATE.md)
         -> Atualiza board em agentes/issues/README.md
         -> Trabalha no Issue (pode ser agora ou depois)
         -> Conclusao -> Veredicto Ponderado (ver template) -> Preenche Resultado
         -> Registra na memoria se relevante -> Move para Done no board
```

**Regra de co-sponsor:** Se o agente proponente é o especialista do domínio (peso 3x), o co-sponsor pode ser qualquer agente com peso ≥ 1x. Se o proponente é generalista, co-sponsor deve ter peso ≥ 2x no tema. Issues sem co-sponsor ficam em Refinamento até conseguirem um.

---

## Regras Anti-Echo-Chamber (obrigatórias desde 2026-03-24)

### 1. Teste de irrefalsificabilidade
Toda issue deve responder antes de concluir:
> "Qual evidência específica, coletável nos próximos 12 meses, nos faria mudar ≥20% da alocação?"

Se a resposta for vaga ou impossível de coletar, a issue não pode concluir com "manter" — precisa ser re-enquadrada. Estratégias irrefalsificáveis não são evidence-based.

### 2. Burden of proof invertido para issues meta-estratégicas
Issues que questionam a estratégia raiz (equity %, factor tilt, VWRA vs complexidade) seguem a regra:
- **Complexidade deve se justificar**, não a simplificação
- O Advocate defende a alternativa simples como tese positiva completa, não como stress-test
- A carteira atual precisa provar que é melhor, não o contrário

Issues meta-estratégicas identificadas: `HD-simplicity`, `HD-equity-weight`, `HD-brazil-concentration` e quaisquer futuras que questionem premissas fundacionais.

### 3. Framing "from scratch" semestral
Na retro de junho e dezembro, pergunta obrigatória:
> "Se você tivesse R$3.5M hoje sem posição nenhuma, o que compraria?"

Resposta: acionar Zero-Base (agente 16) com o perfil mínimo do investidor — sem contexto da carteira atual.

### 4. Auditoria trimestral de outputs
A cada trimestre, verificar: qual % das issues concluiu com mudança de alocação?
- Se <20%: investigar se é (a) estratégia sólida ou (b) processo enviesado
- Registrar o número no scorecard

---

## Validação Multi-Model

Para issues meta-estratégicas ou quando todos os agentes convergirem para "manter", executar validação com outro LLM.

### Prompt padrão — GPT-4/Gemini/Grok
```
Você é um consultor financeiro independente. Avalie este problema de portfolio sem conhecer a estratégia atual do investidor.

PERFIL DO INVESTIDOR:
- Brasileiro, 39 anos, solteiro, sem filhos
- Patrimônio líquido: R$3.5M (excluindo imóvel)
- Renda mensal: ~R$25k (PJ, variável)
- Meta: renda passiva de R$250k/ano em termos reais a partir dos 50 anos
- Horizonte: 11 anos
- Restrições: ETFs UCITS obrigatório (estate tax americano), 15% flat de IR sobre ganhos internacionais, spread cambial ~1.35%, sem FIIs/fundos ativos/alavancagem
- Acesso: Interactive Brokers (LSE, UCITS), Tesouro Direto
- Contexto: IPCA+ 2040 pagando ~7.16% bruto ao ano. MSCI World UCITS disponível.

PERGUNTA: Se este investidor viesse a você hoje sem nenhuma posição, qual alocação você recomendaria e por quê? Qual seria a alocação entre equity global, renda fixa brasileira (IPCA+), e outros ativos? Justifique cada componente.
```

### Quando usar
- Antes de concluir qualquer issue das 3 meta-estratégicas
- Quando o time interno convergir unanimemente para "manter" em decisão com impacto > 15% da carteira
- Na pergunta semestral "from scratch"

### Como registrar
No arquivo da issue, seção "Validação Multi-Model":
```
| Modelo | Recomendação Principal | Diverge do time? | Ponto mais relevante |
|--------|----------------------|------------------|---------------------|
| GPT-4  | ...                  | Sim/Não          | ...                 |
| Gemini | ...                  | Sim/Não          | ...                 |
```

---

## Composição do time por tipo de issue

| Tipo de issue | Agentes obrigatórios |
|---------------|---------------------|
| Meta-estratégica (questiona premissa fundacional) | Advocate (lead), **Zero-Based (16, peso 2x)**, **Outside View (18, peso 2x)**, agente de domínio, Quant, Fact-Checker |
| Stress-test (questiona claim dentro da estratégia) | Advocate, agente de domínio, Quant, Fact-Checker |
| Alocação (>5% portfolio) | **Outside View obrigatório**, Advocate, agente de domínio, Quant |
| Tática (DCA, timing, execução) | Agente de domínio, Quant, **Ops (compliance)** |
| Cross-domain (3+ agentes) | Head + **CIO auto-acionado**, múltiplos especialistas |

---

## Regra de Proveniência de Dados (Data Provenance)

> Originada de HD-swrd-114-cotas (2026-04-08): holdings.md foi populado com SWRD 5,405.56 errado porque o dado veio de contexto/estado intermediário, não da fonte primária.

**Regra**: Qualquer escrita em `dados/holdings.md`, `dados/dashboard_state.json` ou qualquer arquivo em `dados/` DEVE ter a fonte verificada diretamente antes de escrever.

| Dado | Fonte primária obrigatória | Como verificar |
|------|---------------------------|----------------|
| Quantidades de ETFs (IBKR) | Carteira Viva (Google Sheets, aba Utils) via `gws sheets read` OU `ibkr_analysis.py` | Comparar qtde por qtde antes de escrever |
| Posições Tesouro Direto | Tesouro Direto / extrato corretora | Confirmar com Diego se não há extrato recente |
| Preços / valores USD | yfinance via script (`generate_data.py`) | Nunca hardcodar preço — usar pipeline |
| Câmbio de referência | PTAX BCB via `fx_utils.py` | Nunca usar número de cabeça |

**Proibido**: populado a partir de contexto da conversa, memória de sessão, ou arquivo intermediário sem rastrear até a fonte primária.

**Se a fonte primária não estiver acessível** (ex: fora de sessão com gws): documentar explicitamente no arquivo o que está desatualizado e por quê, e não escrever o valor antigo como se fosse atual.

---

## Checklist Obrigatório — Antes de Lançar Qualquer Agente

> **REGRA**: Antes de lançar o primeiro agente em qualquer issue, o Head DEVE executar este checklist. Sem exceção.

```
[ ] 1. Classificar o tipo de issue: Meta-estratégica / Stress-test / Tática / Cross-domain
[ ] 2. Abrir a tabela acima e listar os agentes obrigatórios para esse tipo
[ ] 3. Verificar os Participantes no cabeçalho do arquivo da issue — add quem estiver faltando
[ ] 4. Confirmar: Quant está no plano? (todo veredicto numérico passa por ele)
[ ] 5. Confirmar: Fact-Checker está no plano? (toda issue com paper como justificativa)
[ ] 6. Confirmar: Cético está no plano? (toda meta-estratégica ou debate de premissa)
[ ] 7. Issue pode resultar em mudança ≥5% de alocação? → Pre-mortem obrigatório antes do veredicto (ver abaixo)
[ ] 8. Só então lançar TODOS em paralelo — nunca lançar 2 e esperar Diego cobrar o resto
```

---

## Pre-mortem Obrigatório — Issues com Mudança ≥5% de Alocação

> Toda issue que pode resultar em mudança de alocação ≥5% do portfolio DEVE incluir um pre-mortem antes do veredicto final. Não é formalidade — é o filtro que captura o risco que ninguém está vendo.

### Quando aplicar
- Issue pode resultar em: compra/venda/realocação que altere ≥5% do portfolio total
- Exemplos: "aumentar IPCA+ de 15% para 25%", "vender SWRD para rebalancear", "entrada em novo ativo"
- Não aplicar: consultas informativas, monitoramento de gatilho, ajustes <5%

### Formato (2 perguntas, respostas específicas)

**Pre-mortem** (Klein 1998): *"É 2037 e o FIRE falhou especificamente por causa desta decisão. O que aconteceu?"*
- Exigir cenário específico com causa e efeito. "Mercado caiu" não é resposta válida.
- Mínimo 2 cenários de falha distintos.

**Pre-parade**: *"É 2037 e esta foi a melhor decisão da carteira. O que aconteceu?"*
- Verificar se o argumento só funciona no cenário otimista.

### Quem executa
- Advocate escreve o pre-mortem
- Quant valida os números dos cenários
- Registrar no arquivo da issue, seção "Pre-mortem", antes do veredicto

---

## "Too Hard" Pile (D3 — Berkshire)

Issue debatida **3+ vezes** sem resolução (sem convergência, sem dado novo, sem progresso):
→ Tagged "too-hard" e movida para Deprecated com justificativa.
→ Revisitar **apenas** quando dado novo e substancial surgir.
→ Não é fracasso — é reconhecimento de que a incerteza é irredutível com informação disponível.

---

## Minority Report (D6 — CERN)

Quando um agente dissente e perde a votação ponderada:
1. Registrar o dissent na seção "Conclusão" da issue com argumento completo
2. Registrar **trigger de re-abertura**: "Se [condição X] ocorrer em [prazo], re-abrir automaticamente"
3. **Ops monitora** as condições de re-abertura mensalmente
4. Se a condição materializar, issue re-abre como nova issue com referência ao dissent original

Dissidentes devem ter voz futura — não apenas nota de rodapé.

---

## Issue Aging — Gate de 60 Dias

Issues com 60+ dias no Backlog sem atualização de status são consideradas "aging". Na próxima retro completa, o Head apresenta a lista de aging issues ao Diego para decisão explícita:

- **Avançar**: mover para Doing com prazo definido
- **Arquivar**: mover para Deprecated com justificativa
- **Manter**: confirmar que ainda é relevante e documentar por quê

Sem decisão explícita, a issue não pode permanecer em Backlog indefinidamente. "Ainda relevante mas sem prioridade" é uma decisão válida — mas precisa ser dita.

**Agente 16 Zero-Based**: agente formal com perfil próprio (`agentes/perfis/16-zerobased.md`). Peso **2x** em issues de alocação. Recebe APENAS o perfil do investidor — sem carteira atual, sem histórico de posições. Obrigatório em todas as meta-estratégicas e issues com ativo ≥5% do portfolio. Propósito: impedir que restrição operacional (custo de IR, falta de veículo) seja confundida com validação estratégica. Ver perfil para detalhes de isolamento e formato de output.

Issues meta-estratégicas identificadas (consultar sempre): `HD-simplicity`, `HD-equity-weight`, `HD-brazil-concentration`

**Agente 18 Outside View**: agente formal com perfil próprio (`agentes/perfis/18-outside-view.md`). Peso **2x** em issues de alocação e FIRE. Traz base rates e reference class forecasting (Kahneman). Obrigatório em todas as decisões >5% do portfolio. Propósito: contrapeso à narrativa interna — "o que aconteceu com investidores similares?"

**Agente 19 Ops**: agente formal com perfil próprio (`agentes/perfis/19-ops.md`). Peso **1x** (operacional). Cobra execução de decisões aprovadas, monitora drift, alerta prazos. Obrigatório no check-in mensal.

---

## Protocolos de Diversidade Intelectual (aprovados 2026-04-07)

### Preregistration
Antes de análise, cada agente declara prior numérico em 1 linha. Registrado em memória. Na retro, comparar previsão vs realidade. Cria accountability.

### ACH — Analysis of Competing Hypotheses (decisões estruturais)
Para decisões >5% do portfolio: montar **matriz de evidências** — hipóteses como colunas, evidências como linhas. Focar em **descartar** hipóteses mal-suportadas, não em votar na favorita.

### Steelman (Advocate obrigatório)
Antes de atacar, Advocate constrói o **melhor caso** da posição oposta. Elimina espantalhos.

### Inversion (Advocate em issues Alta)
"Como destruir este plano?" Listar caminhos de destruição → verificar proteção.

### Decision Journal (Bookkeeper)
Registrar reasoning pré-outcome de cada decisão. Retro semestral avalia processo, não resultado.

### Shell Scenarios (retro semestral)
2 eixos de incerteza → 4 cenários. Cada agente otimiza para UM cenário. Head sintetiza.

### Temporal Diversity (check-in anual)
Diego-25/50/65 avaliam a carteira. Head aplica como exercício de perspectiva.

---

## Checklist de Contexto Completo — Análise de Alocação

> Erros recorrentes identificados em HD-equity-weight (2026-03-25). Todo debate de alocação deve verificar:

```
[ ] 1. BALANÇO PATRIMONIAL TOTAL: incluir renda, imóvel, INSS, gastos — não só o portfolio
        → Diego: renda PJ + imóvel + INSS + gastos = quase 100% Brasil. Equity UCITS = única saída soberana.
[ ] 2. RESTRIÇÃO DE MIGRAÇÃO: pode rebalancear por venda? Se não, qual é a alavanca real?
        → Diego: todos ETFs no lucro. Única alavanca = direcionamento de aportes.
[ ] 3. LITERATURA BALANCEADA: apresentar tanto pro quanto contra, não só o lado que desafia
        → Erro: Cético listou só contra-equity. Time ignorou Cederburg, Siegel, DMS pro-equity.
[ ] 4. TEMPORALIDADE DE OPORTUNIDADES: janela de taxa é permanente ou temporária?
        → IPCA+ 7.16% = janela excepcional. 15% alvo dimensionado para a janela, não indefinidamente.
[ ] 5. CRITÉRIO CORRETO: otimizar para P(meta), não para retorno esperado máximo
        → São funções diferentes. Delta de P(FIRE) entre alocações foi ~2pp com guardrails.
```
