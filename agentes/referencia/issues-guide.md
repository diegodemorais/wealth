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
| Meta-estratégica (questiona premissa fundacional) | Advocate (lead), Zero-Base (16), agente de domínio, Quant |
| Stress-test (questiona claim dentro da estratégia) | Advocate, agente de domínio, Fact-Checker |
| Tática (DCA, timing, execução) | Agente de domínio, Quant |
| Cross-domain | Head coordena, múltiplos especialistas |
