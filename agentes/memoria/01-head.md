# Memoria: Head de Investimentos

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03 | Carteira definitiva aprovada | Tabela simplificada por idade | Todos |
| 2026-03 | JPGL subiu de 15% para 20% | Maior gap, foco dos aportes | 02 Factor |
| 2026-03 | AVEM->JPGL adiado | EM a 40% desconto historico, timing ruim | 02 Factor, 08 Macro |
| 2026-03-22 | IPCA+ longo **15%**, piso **6.0%**, DCA ATIVO | Breakeven all-in ~5.5%. A 7.16%, IPCA+ vence equity por 150 bps. TD 2040 (80%) + TD 2050 (20%). Selic removido, substituido por IPCA+ curto 3% aos 50 | Factor, RF, FIRE, Advocate |
| 2026-03-22 | Renda+ 2065 teto ajustado de **3% para 5%** | Diego reverteu RF-003. Teto original de 5% restaurado. DCA reativado (3,2% atual, espaco ate 5%). Bloco de risco maximo possivel: 10% (Renda+ 5% + HODL11 5%) | Head |

---

## Gatilhos Ativos

| Gatilho | Condicao | Acao | Status |
|---------|----------|------|--------|
| IPCA+ longo | ~~Idade 48~~ **Antecipado** | Ate **15%** da carteira, TD 2040 (80%) + TD 2050 (20%). Piso operacional: IPCA+ >= **6,0%** (breakeven all-in ~5,5%). **DCA ATIVO** (taxa 7,16% > piso 6,0%). 5,0-6,0%: pausar DCA, aportes para JPGL. **Hold to maturity SEMPRE** — nao vender por MtM (exceto risco soberano extremo) | **Ativo** |
| IPCA+ curto | Perto dos 50 | 3% em TD curto ~2 anos (SoRR buffer). Substitui Selic do plano original | Aguardando |
| Renda+ 2065 compra | Taxa >= 6,5% | DCA ate 5% do patrimonio | **Ativo** |
| Renda+ 2065 venda | Taxa <= 6,0% | Vender posicao inteira (marcacao a mercado, +39,5% liq. esperado) | Monitorando mensalmente |
| HODL11 piso | Alocacao < 1,5% | Comprar ate 3% | Monitorando trimestralmente |
| HODL11 teto | Alocacao > 5% | Rebalancear para 3% | Monitorando trimestralmente |

---

## Regras de Coordenacao

### Tracking de execução pós-aprovação
Quando uma decisão com DCA ou execução em tranches é aprovada, o Head DEVE cobrar a primeira tranche na sessão seguinte. Decisão sem execução é só papel. (Aprendizado retro 2026-03-19)

### Criticas sobre Diego exigem evidencia quantitativa
Nenhum agente pode emitir critica sobre comportamento ou disciplina de Diego sem dados da planilha ou outra fonte verificavel. "Nao vi acontecer" ≠ "nao aconteceu". Sem dados = sem critica. Bookkeeper e a fonte de verdade. (Aprendizado 2026-03-20: 7 agentes criticaram "gap de execucao" sem consultar historico real. Track record: 73% dos meses com aporte, R$2,39M em 56 meses.)

### evolucao.md sincronizada com carteira.md
Sempre que carteira.md for atualizada, evolucao.md deve ser atualizada na mesma sessão. (Aprendizado retro 2026-03-19)

### Advocate obrigatorio em decisoes estruturais
O agente 10 Devil's Advocate deve ser acionado ANTES de confirmar qualquer decisao estrutural. Criterios:

1. **Mudanca de alocacao-alvo**: alteracao nos percentuais da tabela por idade
2. **Novo ativo ou remocao de ativo**: adicionar ou eliminar instrumento da carteira
3. **Mudanca de gatilho**: criacao, alteracao ou remocao de gatilho ativo
4. **Mudanca de estrategia de desacumulacao**: withdrawal rate, glidepath, guardrails, bond tent
5. **Mudanca de premissa de vida**: renda, custo de vida, estado civil, pais, horizonte temporal
6. **Decisao tributaria irreversivel**: venda com realizacao de lucro, reestruturacao societaria
7. **Mudanca de custodia ou plataforma**: migrar de broker, mudar jurisdicao de ETFs

NAO e estrutural: aporte regular, consulta informativa, monitoramento de gatilho, atualizacao de snapshot.

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | Definicao da carteira definitiva | Aprovada: SWRD 35%, AVGS 25%, AVEM 20%, JPGL 20% + Renda+ + HODL11 |
| 2026-03 | JPGL: subir de 15% para 20%? | Aprovado — maior gap, foco dos aportes |
| 2026-03 | AVEM->JPGL: migrar agora? | Adiado — EM a 40% desconto, timing ruim |
| 2026-03 | IPCA+ estrutural: quando? | Apenas aos 48, condicional a taxa >= 6,5% |
| 2026-03 | Guardrails de desacumulacao | Risk-based (Kitces & Fitzpatrick 2024), nao G-K |
| 2026-03 | Hedge de equity | Nao — custo proibitivo, BRL hedge natural |
| 2026-03-18 | Retro de fundacao | 6 aprendizados, issue HD-001 criada |
| 2026-03-22 | HD-006 decisao FINAL | IPCA+ longo 15%, piso 6.0%, DCA ativo. Breakeven all-in ~5.5%. Selic removido -> IPCA+ curto 3% aos 50. 5 regras anti-recorrencia |
