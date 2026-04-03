# FI-avgs-premium-reconciliacao: AVGS premium — reconciliar 110bps vs 46bps pós-haircut

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-avgs-premium-reconciliacao |
| **Dono** | Factor |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Factor (lead), Quant, FIRE |
| **Co-sponsor** | Quant |
| **Dependencias** | — |
| **Criado em** | 2026-04-03 |
| **Origem** | Escalação — L-21 (retro 2026-04-01-completa): carry-over 2+ retros sem execução |
| **Concluido em** | — |

---

## Motivo / Gatilho

Inconsistência detectada em retro 2026-04-01:
- **carteira.md** usa AVGS 5.5% BRL base vs SWRD 4.2% = spread de 130bps
- **Premissas aprovadas** (FI-premissas-retorno, 2026-04-01): AVGS 5.0% USD = spread de ~130bps brutos sobre SWRD 3.7%
- **feedback_haircut_fatorial.md** registra: haircut 58% (McLean & Pontiff 2016) → premium líquido ~46-54bps
- **scorecard.md** registra: "alpha líquido ~0.16%/ano"

Qual número está alimentando os cálculos de P(FIRE)? Os retornos em carteira.md (5.5%) incorporam o haircut ou não?

---

## Descrição

O conflito é:
- Se carteira.md usa 5.5% bruto sem haircut → P(FIRE) está otimista
- Se os 5.0% USD já incorporam o haircut → os dois números são consistentes (5.0 USD + 0.5% depreciação BRL = 5.5% BRL, e o "alpha líquido de 0.16%" é o delta vs SWRD após haircut)
- Verificar qual interpretação os scripts MC usam

---

## Escopo

- [ ] Quant: auditar fire_montecarlo.py — qual retorno está sendo usado para AVGS? 5.0% ou 5.5%?
- [ ] Factor: reconciliar: os 5.0% USD da FI-premissas-retorno já aplicam o haircut 58% ou são brutos?
- [ ] Quant: calcular P(FIRE) com ambos os cenários (5.0% vs 5.5% AVGS BRL base)
- [ ] Factor: propor versão canônica única (um número, uma fonte, uma interpretação)
- [ ] Head: atualizar carteira.md e scorecard.md com versão reconciliada

---

## Raciocínio

**Argumento central:** Dois documentos com números diferentes alimentando o mesmo modelo = risco silencioso. O impacto pode ser pequeno (talvez ~1-2pp em P(FIRE)) mas a falta de clareza corrói a confiança nos números.

**Falsificação:** Se Quant confirmar que o delta é < 0.5pp em P(FIRE), issue pode ser encerrada como "inconsistência cosmética, impacto negligenciável".
