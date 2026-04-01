# Literature Review — Revisão Semestral de Evidências

Você é o Head conduzindo a revisão semestral de evidências acadêmicas. Executar em junho e dezembro de cada ano.

## Objetivo

Verificar se os papers citados nos perfis de agentes ainda representam o estado da arte. Evidências envelhecem. McLean & Pontiff 2016 identificaram que premiums decaem pós-publicação — o mesmo vale para qualquer paper citado como base de decisão.

---

## Passo 1: Mapear Papers Citados

Ler os perfis dos agentes que fazem referências acadêmicas como base de decisão:

- `agentes/perfis/01-cio.md`
- `agentes/perfis/02-factor.md`
- `agentes/perfis/03-fixed-income.md`
- `agentes/perfis/04-fire.md`
- `agentes/perfis/10-advocate.md`
- `agentes/perfis/14-quant.md`
- `agentes/perfis/15-fact-checker.md`

Para cada paper citado, extrair: autor, ano, conclusão usada, qual decisão da carteira suporta.

---

## Passo 2: Classificar por Criticidade

| Criticidade | Critério | Ação |
|-------------|----------|------|
| **Alta** | Paper sustenta premissa que afeta alocação ≥10% | Buscar atualizações obrigatório |
| **Média** | Paper sustenta regra operacional ou checklist | Buscar atualizações se >5 anos |
| **Baixa** | Paper contextual, não sustenta decisão direta | Revisão opcional |

Papers Alta criticidade: Cederburg et al. (2023), McLean & Pontiff (2016), Fama & French, Kitces/Pfau (SWR).

---

## Passo 3: Buscar Atualizações

Para cada paper de criticidade Alta (e Média se >5 anos), usar WebSearch para verificar:

1. **O paper foi replicado ou refutado?** Buscar: `"[título do paper]" replication site:ssrn.com OR site:nber.org`
2. **Há meta-análise mais recente?** Buscar: `[tema do paper] meta-analysis 2023 OR 2024 OR 2025`
3. **Os dados foram atualizados?** Ex: DMS Yearbook é anual — sempre usar edição mais recente.
4. **O contexto mudou?** (ex: haircut de factor premiums pós-crowding)

---

## Passo 4: Relatório

```
## Literature Review — {mês/ano}

### Papers Revisados
| Paper | Ano | Decisão Suportada | Status | Atualização |
|-------|-----|------------------|--------|-------------|
| Cederburg et al. | 2023 | 100% equity | Válido | Sem refutação relevante |
| McLean & Pontiff | 2016 | Haircut 58% | Válido | ... |
| ... | | | | |

### Premissas que Precisam de Atualização
| Premissa atual | Evidência nova | Impacto |
|---------------|----------------|---------|
| ... | ... | ... |

### Recomendações
1. [ação específica se encontrou evidência que muda premissa]
2. [flag se encontrou paper que contradiz decisão ativa]

### Próxima Revisão
{mês/ano + 6 meses}
```

---

## Passo 5: Registrar

- Se evidência nova muda premissa ativa: criar Issue com tipo Stress-test
- Se paper foi refutado mas ainda está nos perfis: atualizar o perfil relevante
- Atualizar `agentes/referencia/revisoes-periodicas.md` com data da revisão
- Commitar alterações

---

## Regras

- Não buscar atualizações de papers de baixa criticidade (custo > benefício)
- Uma literatura review não muda decisões — cria Issues para debater as mudanças
- Se nenhum paper foi atualizado: registrar que a revisão aconteceu e as evidências se mantêm. Isso também é dado útil.
- Prioridade: papers que sustentam premissas com > R$500k de capital alocado
