# Guia de Issues

## IDs de Issues
Formato: `{SIGLA}-{slug-descritivo}` — sigla do agente responsavel principal + slug curto legível sem contexto.
HD (Head), FI (Factor), RF (Renda Fixa), FR (FIRE), TX (Tributacao), RK (Risco), FX (Cambio), MA (Macro), PT (Patrimonial), DA (Devil's Advocate), OP (Oportunidades), XX (Cross-domain)

Exemplos: `FR-spending-smile`, `RK-gold-hedge`, `MA-bond-correlation`
Regra: 1-3 palavras em kebab-case, sem número. O slug deve dizer o assunto sem precisar ler o título.

## Status de Issues
`Refinamento` -> `Backlog` -> `Doing` -> `Done`

## Fluxo Conversa -> Issue
```
Conversa -> Head identifica tema que merece profundidade
         -> Sugere Issue ao Diego (com ID, titulo, responsavel)
         -> Diego aprova -> Cria arquivo em agentes/issues/{ID}.md (usar _TEMPLATE.md)
         -> Atualiza board em agentes/issues/README.md
         -> Trabalha no Issue (pode ser agora ou depois)
         -> Conclusao -> Preenche Resultado -> Registra na memoria se relevante
         -> Move para Done no board
```

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
| Meta-estratégica (questiona premissa fundacional) | Advocate (lead), Rotina Zero-Base (prompt framing from scratch), Cético (17), agente de domínio, Quant, Fact-Checker |
| Stress-test (questiona claim dentro da estratégia) | Advocate, agente de domínio, Cético (17), Quant, Fact-Checker |
| Tática (DCA, timing, execução) | Agente de domínio, Quant |
| Cross-domain | Head coordena, múltiplos especialistas |

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
[ ] 7. Só então lançar TODOS em paralelo — nunca lançar 2 e esperar Diego cobrar o resto
```

**Nota Zero-Base**: não é um agente separado — é o prompt "framing from scratch" da seção "Validação Multi-Model" acima. Para meta-estratégicas, incluir esse ângulo no briefing do agente de domínio ou lançar como general-purpose com o prompt padrão.

Issues meta-estratégicas identificadas (consultar sempre): `HD-simplicity`, `HD-equity-weight`, `HD-brazil-concentration`

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
