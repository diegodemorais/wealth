# HD-holding-e-seguro: Holding Familiar e Seguro de Vida — Avaliação Patrimonial

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-holding-e-seguro |
| **Dono** | Head + Patrimonial |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Patrimonial, Tax, FIRE, Advocate |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-27 |
| **Origem** | Audit 7 agentes pós-HD-risco-portfolio — gaps não-dashboard: proteção patrimonial e sucessão |

---

## Motivo / Gatilho

Dois gaps identificados no audit de risco que não são de dashboard — são decisões patrimoniais estruturais:

1. **Patrimônio total R$7.66M > R$5M** = gatilho histórico para avaliação de holding familiar. Foi definido como trigger mas nunca executado.

2. **Seguro de vida**: com casamento iminente (Katia), filho potencial no futuro, e hipoteca de R$452k, Diego não tem cobertura de morte/invalidez documentada. Risco assimétrico relevante.

---

## Escopo

### S1: Holding Familiar — Avaliação

- [ ] Levantar benefícios esperados de holding familiar para a situação atual de Diego:
  - Proteção patrimonial (blindagem de PJs)
  - Otimização tributária (dividendos vs pro-labore)
  - Planejamento sucessório (antes do casamento)
  - Separação patrimônio pessoal vs empresarial

- [ ] Analisar custo de setup e manutenção (contador, abertura, IR holding)

- [ ] Calcular gatilho real: R$5M era estimativa — verificar se ainda faz sentido com:
  - Patrimônio atual: R$7.66M total (financeiro: R$3.47M)
  - Casamento iminente com Katia
  - 2 PJs ativas no Simples Nacional

- [ ] Decisão: abrir holding agora / quando / nunca? Com quais ativos dentro?

- [ ] Consulta com especialista: Patrimonial agent pode dar diretrizes, mas implementação real requer contador + advogado.

---

### S2: Seguro de Vida Temporário

- [ ] Mapear exposição atual sem seguro:
  - Hipoteca SAC: R$452k (2051) — quem paga se Diego morrer?
  - Katia: renda implícita R$131.8k/ano — model dependency?
  - Capital humano Diego: R$3.65M PV — risco de invalidez total

- [ ] Calcular cobertura mínima necessária:
  - Cenário base: quitar hipoteca + 5 anos de gastos para Katia = ~R$452k + ~R$1.25M = R$1.7M
  - Cenário com filho: adicionar 10 anos de gastos = R$2.5M+

- [ ] Avaliar tipos de seguro:
  - Vida temporária (term life): mais barato, prazo até FIRE
  - Vida inteira: mais caro, valor permanente — faz sentido?
  - Seguro de invalidez: separado, cobertura diferente

- [ ] Custo estimado: homem ~38 anos, não fumante, cobertura R$2M, prazo 15 anos = R$3-8k/ano (rough estimate)

- [ ] Decisão: contratar agora / quantia / tipo / prazo?

---

## Raciocínio

**Argumento central:** Ambos os itens são assimetrias protegidas — o custo de não ter (invalidez não segurada, patrimônio sem proteção jurídica) supera amplamente o custo de contratar. Com patrimônio de R$7.66M e casamento iminente, o timing é correto.

**Alternativas rejeitadas:**
- "Esperar FIRE para organizar" — risco de evento adverso no intervalo de 11 anos
- "Capital humano protege" — capital humano é justamente o que está em risco

**Incerteza reconhecida:**
- Holding pode não valer a pena em tributação se Diego permanece pessoa física — depende de volume de dividendos
- Seguro de vida: custo real depende de saúde atual, histórico familiar, fumante/não fumante

**Falsificação:**
- Holding: se custo anual > benefício tributário/protetivo esperado por 10+ anos, não abrir
- Seguro: se P(FIRE) sem seguro > 90% mesmo no pior cenário de invalidez parcial, o value é menor

---

## Análise

### Contexto Patrimonial

| Item | Valor | Risco sem holding |
|------|-------|-------------------|
| Financeiro IBKR/XP | R$3.47M | Penhorável em ação judicial contra PJ |
| Imóvel (equity) | R$298k | Bem de família parcialmente protegido |
| Terreno | R$150k | Penhorável |
| Capital humano | R$3.65M | Não tangível |
| INSS | R$283k | Impenhorável |

### Exposição sem Seguro de Vida

| Cenário | Impacto em Katia | P(FIRE family) |
|---------|------------------|----------------|
| Diego morre amanhã | Hipoteca R$452k + zero renda extra | ~0% nos primeiros anos |
| Diego inválido 50% | Renda cai R$X, gastos aumentam | Desconhecido (não modelado) |
| Diego inválido 100% | Zero renda, gastos médicos altos | MC sem dados |

---

## Conclusão

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

---

## Próximos Passos

- [ ] Patrimonial agent: análise completa holding familiar (prós/contras para situação específica de Diego)
- [ ] Tax agent: cálculo de benefício tributário esperado de holding em 5/10 anos
- [ ] FIRE agent: simular P(FIRE casal) com e sem seguro de vida nos cenários adversos
- [ ] Diego: confirmar interesse em avançar para consulta com especialista externo
