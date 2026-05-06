# PT-planejamento-patrimonial: Execução do planejamento patrimonial pré-casamento

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | PT-planejamento-patrimonial |
| **Dono** | Patrimonial |
| **Status** | Discovery |
| **Prioridade** | 🟢 Baixa |
| **Participantes** | Head (lead), Patrimonial, Tax |
| **Co-sponsor** | Tax |
| **Dependencias** | PT-multimodel-holding (Done) |
| **Criado em** | 2026-04-06 |
| **Origem** | PT-multimodel-holding — síntese de 4 modelos externos (Bloco A + Bloco B). Absorveu HD-holding-e-seguro (2026-05-05) |
| **Concluido em** | — |

---

## Contexto

Issue de execução derivada da validação multi-modelo PT-multimodel-holding. Consolida todos os gaps e ações identificadas em Bloco A (regime de bens, holding, estrutura mínima) e Bloco B (seguro de vida, estate tax, continuidade das PJs).

Patrimônio: ~R$7.86M total (R$3.5M financeiro IBKR, 2 PJs Simples Nacional, imóvel equity ~R$450k, terreno R$150k).

---

## Achados da Validação Externa (PT-multimodel-holding)

### Regime de Bens

- **Consenso 2/3 modelos**: Separação Total de Bens + Pacto Antenupcial
- Risco principal da Comunhão Parcial: valorização das quotas das PJs durante o casamento pode ser contestada em divórcio — mesmo com bens pré-existentes
- **Gap específico**: aportes de R$25k/mês pós-casamento em ETFs geram ambiguidade em regime de comunhão parcial (frutos civis). Separação total elimina completamente.

### Holding Familiar

- **Consenso 2/3 modelos**: patrimônio R$7-8M já justifica. Threshold: R$5-10M com empresas + imóveis
- Benefícios: sucessão simplificada, ITCMD otimizado (doação em vida com usufruto), proteção patrimonial formal
- Custos subestimados: R$30-50k/ano manutenção contábil + risco de desconsideração se houver confusão patrimonial
- **Conclusão**: não urgente pré-casamento. Pode ser estruturada 6-12 meses após.

### Seguro de Vida

- **Consenso 4/4 modelos**: Urgente
- Tipo: Term life (temporário)
- Range defensável: **R$4-6M** (Patrimonial: piso = VP aportes até FIRE ~R$2.5-3M; teto = custo vida cônjuge a 4% SWR = ~R$6.75M)
- **Gap crítico negligenciado por maioria**: cobertura de **invalidez/doença grave (D&O)** — R$1-2M separado do term life. Custo baixo aos 39 anos.
- Gap adicional: rider de ajuste inflacionário (IPCA) no term life

### US Estate Tax

- **Consenso 3/4 modelos**: ZERO exposição para ETFs domiciliados na Irlanda (SWRD, AVGS, AVEM) via IBKR
- IBKR como custodiante não cria "US situs" — o que determina é o domicílio do ativo
- Ação de compliance: confirmar domicílio nos prospectos (já são UCITS irlandeses — formalizar documentação)

### Continuidade das PJs

- **Consenso 4/4 modelos**: Urgente
- Sem plano → empresas bloqueadas 6-12 meses durante inventário
- Risco real Simples Nacional: bloqueio operacional → inadimplência fiscal → exclusão indireta do regime
- Risco adicional: herdeiro menor de idade como cotista cria complexidade jurídica
- Responsabilidade tributária solidária dos herdeiros (CTN Art. 131) — passivo fiscal oculto da PJ vem junto

### Gap não coberto pelos modelos externos (Patrimonial)

- **ITCMD sobre ETFs IBKR em inventário**: sobre R$3.5M, pode ser R$140-280k (SP: 4% hoje, PL tramitando podendo ir a 8% progressivo). Doação em vida com reserva de usufruto pode reduzir — mas requer planejamento com 2-3 anos de antecedência.

---

## Ações por Prioridade

| Ação | Urgência | Custo est. | Prazo |
|------|----------|------------|-------|
| **Pacto Antenupcial** (separação total de bens) | Crítica — antes do casamento | R$2-5k | Imediato |
| **Testamento Público** com cláusula de administrador interino das PJs | Crítica | R$2-5k | 30 dias |
| **Term life R$4-6M + seguro D&O R$1-2M** | Alta | R$3-8k/ano | 60 dias — ver TX-seguro-vida |
| **Atualizar contrato social** das 2 PJs: administrador provisório + cláusulas de sucessão + direito de preferência | Alta | R$1-3k | 60 dias |
| **Holding familiar** (planejamento + constituição) | Importante, não urgente | R$8-15k constituição | 6-12 meses pós-casamento |
| **Planejamento ITCMD ETFs IBKR** (doação em vida com usufruto) | Moderada — janela mínima 2-3 anos | Honorário jurídico | 12-24 meses |
| **Confirmar domicílio ETFs** nos prospectos IBKR | Baixa — compliance | Nenhum | Próxima revisão anual |

---

## Relação com TX-seguro-vida

A ação de seguro de vida (term life + D&O) se sobrepõe com TX-seguro-vida (Backlog, Alta). As duas podem ser executadas em conjunto. TX-seguro-vida trata da contratação; esta issue trata do dimensionamento correto (R$4-6M + D&O R$1-2M) validado por 4 modelos externos.

---

## Escopo

- [ ] Contratar advogado especializado em planejamento patrimonial
- [ ] Pacto Antenupcial — Separação Total de Bens
- [ ] Testamento Público com administrador interino das PJs
- [ ] Revisar/atualizar contrato social das 2 PJs (cláusulas de sucessão)
- [ ] Contratar term life R$4-6M + D&O R$1-2M (executar junto com TX-seguro-vida)
- [ ] Iniciar planejamento holding familiar (pós-casamento)
- [ ] Planejamento ITCMD para ETFs IBKR (horizonte 12-24 meses)

---

## Raciocínio

**Argumento central:** O casamento cria dois riscos simultâneos — (1) regime de bens inadequado expõe o patrimônio pré-existente e aportes futuros a disputas; (2) ausência de testamento/plano de continuidade das PJs pode bloquear empresas e patrimônio por 6-12 meses em caso de morte. Ambos têm solução simples e barata (R$2-5k cada) que devem ser implementadas antes do casamento.

**Critério de encerramento:** Pacto Antenupcial e Testamento assinados. Contratos sociais das PJs atualizados. TX-seguro-vida em execução.
