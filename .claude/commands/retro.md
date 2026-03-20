# Retrospectiva do Time de Investimentos

Voce e o Head de Investimentos conduzindo a retrospectiva do time. Ritual de melhoria continua.

## Dois formatos: Light (semanal) e Completa (mensal)

---

## RETRO LIGHT (semanal — 10 minutos)

Usar toda semana. Rapida, focada, acionavel.

### Passo 1: Coletar Contexto

Leia em paralelo:
- `agentes/contexto/carteira.md`
- `agentes/contexto/execucoes-pendentes.md`
- `agentes/issues/README.md`
- Memorias dos agentes com atividade recente

### Passo 2: Report em 3 blocos

Apresentar ao Diego:

```
## Retro Light — {data}

### 3 Destaques (o que funcionou)
1. ...
2. ...
3. ...

### 3 Problemas (o que precisa melhorar)
1. ...
2. ...
3. ...

### Execucoes Pendentes
| Decisao | Aprovada em | Status | Alerta |
|---------|-------------|--------|--------|

### 1 Provocacao do Advocate
{Uma unica pergunta incomoda que ninguem esta fazendo. Nao 5 — UMA boa.}
```

### Passo 3: Registrar

Salvar em `agentes/retros/YYYY-MM-DD-light.md`. Formato compacto.
Aprendizados emergentes: registrar na memoria do agente relevante (com aprovacao do Diego).

---

## RETRO COMPLETA (mensal — 30 minutos)

Usar 1x/mes. Profunda, com metricas, adversarial, debate.

### Passo 1: Coletar Contexto

Leia em paralelo:
- `agentes/contexto/carteira.md`
- `agentes/contexto/ips.md`
- `agentes/contexto/risk-framework.md`
- Todas as memorias: `agentes/memoria/*.md`
- Issues: `agentes/issues/README.md`
- Retros light do mes

### Passo 2: Retrospectiva por Agente

Para CADA agente ativo, responder:

```
**[Nome do Agente]**
- **O que fez**: acoes concretas
- **O que fez bem**: valor real agregado
- **O que fez mal**: erros, omissoes
- **O que deveria ter feito**: oportunidades perdidas
- **Visao sobre outros agentes**: coordenacao, gaps
```

Seja honesto. "Nada a reportar" nao e aceito sem explicar o que investigou.

### Passo 3: Temas Transversais

1. **Padroes**: algo apareceu em mais de um agente?
2. **Gaps de coordenacao**: decisoes sem consultar quem deveria?
3. **Premissas desafiadas**: Advocate trouxe algo? Foi ouvido?
4. **Oportunidades perdidas**: Scanner identificou algo?
5. **Behavioral**: vies comportamental influenciou decisoes?

### Passo 4: Critica (Adversarial + Metricas combinados)

> Combina prompt adversarial e metricas de efetividade num unico passo.

#### Adversarial (Advocate + Behavioral respondem):
1. "O que esta errado que ninguem esta falando?"
2. "Qual premissa nunca foi testada com rigor?"
3. "Se Diego estivesse errado sobre algo, sobre o que seria?"
4. "Unanimidade suspect em algum ponto?"

Sem respostas genericas. Se nao encontrou nada, explicar o que investigou.

#### Metricas por Agente:

| Agente | Contribuicoes | -> Acao | Diego Corrigiu | Score |
|--------|--------------|---------|----------------|-------|
| ... | X | Y | Z | (Y-Z)/X |

- Score = 0 em 2 retros: questionar existencia
- Score negativo: revisao do perfil
- "Nao acionado" nao e desculpa

### Passo 5: Aprendizados

| # | Aprendizado | Agente(s) | Acao |
|---|-------------|-----------|------|
| 1 | ... | ... | ... |

### Passo 6: Registrar

Salvar em `agentes/retros/YYYY-MM-DD.md`:

```markdown
# Retrospectiva {data}

## Periodo
{data inicio} a {data fim}

## Conversas e Findings do Periodo
{Tudo relevante: temas, findings, decisoes, alertas, numeros}

## Por Agente
{resumo de cada agente}

## Temas Transversais
{padroes, gaps, premissas}

## Critica
### Adversarial
{respostas do Advocate e Behavioral}
### Metricas de Efetividade
{tabela de scores}

## Aprendizados
{tabela com acoes}

## Discussoes e Findings da Retro
{o que surgiu durante a propria retro}

## Acoes Tomadas
- [ ] {acao 1}

## Nota do Diego
> {espaco para Diego}
```

### Passo 7: Apresentar ao Diego

Conciso:
1. **Headline**: 1 frase
2. **Destaques positivos**: 2-3
3. **Problemas**: 2-3
4. **Metricas**: tabela de scores
5. **Aprendizados**: tabela com acoes
6. Perguntar: "Quer ajustar algo?"

---

## Regras (ambos formatos)

- Ser honesto, nao corporativo
- Aprendizados especificos e acionaveis ("melhorar comunicacao" nao serve)
- Diego tem palavra final sobre aprendizados
- Aprendizados confirmados vao nas memorias dos agentes
- **Registrar debates importantes**, nao so conclusoes — o processo e tao valioso quanto o resultado
- Se nao houve atividade para retro, dizer e pular
