# HD-007: Mapa Completo de Gatilhos da Carteira

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-007 |
| **Dono** | 00 Head |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | 06 Risco, 04 FIRE, 08 Macro, 10 Advocate, 07 Cambio, 05 Tax |
| **Dependencias** | HD-006 (premissas), FIRE-002 (cenarios de perda renda), FR-003 (Monte Carlo) |
| **Criado em** | 2026-03-22 |
| **Origem** | Diego apontou que os gatilhos atuais surgiram organicamente de issues individuais, sem um scan sistematico de todos os cenarios que deveriam acionar acao |

---

## Motivo / Gatilho

Hoje existem gatilhos espalhados por varios arquivos (carteira.md, memorias, issues), mas ninguem fez o exercicio de pensar: "quais sao TODOS os cenarios que deveriam acionar uma acao?" Podem existir gaps — riscos mapeados sem gatilho, ou gatilhos sem acao definida.

---

## Escopo

### 1. Inventario dos gatilhos existentes
- Coletar todos os gatilhos registrados em carteira.md, memorias, issues
- Classificar por dominio (alocacao, FIRE, macro, fiscal, behavioral, operacional)
- Verificar: cada gatilho tem condicao + acao + responsavel?

### 2. Scan de gaps
Para cada dominio, perguntar: "que evento deveria acionar uma acao e NAO tem gatilho?"
- **Macro**: Selic, IPCA, cambio, fiscal, divida/PIB, CDS
- **Alocacao**: desvio de target, gap JPGL, IPCA+ DCA
- **FIRE**: patrimonio off-track, perda de renda, mudanca de custo de vida, casamento
- **Risco**: drawdown, Renda+ tatico, HODL11, correlacao
- **Fiscal/Tax**: mudanca de IR, estate tax, IOF, wash sale
- **Cambio**: BRL/USD extremo, custo de hedge
- **Behavioral**: panico, herding, action bias
- **Operacional**: IBKR, B3, Okegen, custodia

### 3. Consolidar em tabela unica
Uma tabela master com:
| Dominio | Gatilho | Condicao | Acao | Responsavel | Frequencia de check |

### 4. Definir monitoramento
- Quais gatilhos o check-in semanal/mensal verifica?
- Quais sao event-driven (so quando acontece)?
- Quais sao automatizaveis vs manuais?

---

## Entregas
- Tabela master de gatilhos (completa, sem gaps)
- Mapa de monitoramento (quem checa o que, quando)
- Recomendacao: precisa de novos gatilhos? Algum existente deve ser removido?

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Pendente |
| **Estrategia** | Pendente |
| **Conhecimento** | Pendente |
| **Memoria** | Pendente |
