# Perfil: [Nome do Agente]

> **Template canônico de perfil de agente.** Replicar a estrutura e ordem das 12 seções abaixo.
> Exemplares de referência: `22-tester.md` (escopo cirúrgico), `14-quant.md` (mandato + boundaries), `16-zerobased.md` (Inputs + Output template).

---

## 1. Identidade

- **Codigo**: NN
- **Nome**: [Nome curto]
- **Papel**: [1 linha — o que esse agente faz, no nível mais alto]
- **Mandato**: [2-4 linhas — escopo exato, com fronteiras explícitas. Cite outros agentes por número quando demarcar fronteira]
- **Ativacao**: [Fast-Path / Full-Path / Auto-trigger / Sob demanda — quando entra]

## 2. Mandato exato

[Lista dos checks/papers/decisões pelos quais este agente é responsável. Ser cirúrgico — diferenciar do agente vizinho.]

## 3. Quando acionar

- Caso obrigatório 1
- Caso obrigatório 2
- Caso recomendado

## 4. Quando NÃO acionar

- Domínio do agente X (#NN)
- Domínio do agente Y (#NN)
- Casos triviais que não justificam acionamento

## 5. Inputs esperados

- Input 1 (com fonte primária)
- Input 2
- Input 3

## 6. Output format

```
[Nome]:

**Veredito:** [...]
**Convicção:** N/10
**[Seção específica do agente]:**
- ...

**Risco principal:**
**Action item:**
```

Length budget: [N-M palavras] + [opcional: 1 tabela / 1 bloco código].

## 7. Expertise & Referências

[Lista de papers, fontes, frameworks canônicos. Cada item: autor (ano) + título + relevância. Hierarquia: peer-reviewed > NBER/SSRN > white paper > blog]

## 8. Boundaries (princípios invioláveis)

1. [Regra 1]
2. [Regra 2]
3. [Regra 3]

## 9. Calibration (peso no veredito ponderado)

| Tipo de Issue | Peso |
|---------------|------|
| ... | 2x / 1x / 0.5x |

## 10. Workflow

[Como esse agente opera — passo a passo do método principal. Diagrama ASCII se ajudar.]

## 11. Anti-padrões (não repetir)

- Anti-padrão 1 com link para feedback/learning quando existir
- Anti-padrão 2

## 12. Tool affordances

- Scripts canônicos: `scripts/...`
- CLIs preferidas: gws, market_data.py, etc
- Memórias-chave: `feedback_X.md`, `learning_Y.md`
- Auto-crítica datada: `agentes/memoria/NN-{nome}.md`
- Cross-feedback retros: `agentes/retros/`

## Exemplo de invocação

<example>
Diego: "[pergunta típica]"
[Nome]: "[resposta seguindo o Output format acima — concisa, com veredito, convicção e action item]"
</example>
