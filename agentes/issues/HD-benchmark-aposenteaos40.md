# HD-benchmark-aposenteaos40: Benchmark vs lab.aposenteaos40.org

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-benchmark-aposenteaos40 |
| **Dono** | Head |
| **Status** | Concluído |
| **Prioridade** | Média |
| **Criado em** | 2026-04-30 |
| **Origem** | Solicitação Diego — comparação com referência externa |
| **Concluído em** | 2026-04-30 |

---

## O que o site tem

O AA40 opera duas propriedades: o blog educacional (`aposenteaos40.org`) e o laboratório de ferramentas (`lab.aposenteaos40.org`). Juntos formam a referência FIRE mais consolidada do mercado brasileiro.

### lab.aposenteaos40.org — Ferramentas interativas

#### 1. Backtests (ferramenta principal)
- Comparação de até 3 carteiras simultaneamente com data-range livre
- Ativos: ações BR, FIIs, renda fixa (Tesouro Direto, Selic), Ibovespa, internacional
- Rebalanceamento configurável: mensal / trimestral / semestral / anual
- Templates pré-configurados: Conservadora, Moderada, Agressiva, Dividendos, FII + RF, Tesouro Direto, Ibovespa 100%, Internacional + BR
- Saídas:
  - Curva de crescimento patrimonial (escala normal e logarítmica)
  - Drawdown chart
  - Heatmap de retornos anuais
  - Tabela comparativa: TSR, Sharpe, volatilidade, max drawdown
  - Matriz de correlação entre ativos
  - Fronteira Eficiente visual integrada
- Para períodos < 10 anos: aplica Monte Carlo com 90% de confiança automaticamente
- Ranking público dos melhores backtests executados (leaderboard comunidade)

#### 2. brFIRESim — Simulador histórico de retirada
- Abordagem sequencial histórica (estilo cFIREsim/FIREsim americano) adaptada ao Brasil
- Simula todos os períodos históricos reais com retiradas inflação-ajustadas
- Taxa de sucesso calculada sobre ciclos históricos reais (não distribuições sintéticas)
- Foco em TSR (Taxa Segura de Retirada) — equivalente brasileiro ao 4% rule

#### 3. Monte Carlo
- Inputs: patrimônio inicial (R$), duração (anos), retirada mensal (R$), carteira (1-3)
- Volume: 5.000 ou 10.000 simulações (usuário escolhe velocidade vs precisão)
- Outputs:
  - Taxa de sucesso por carteira (comparativo)
  - Distribuição do patrimônio final (fan chart / distribuição de probabilidades)
  - Trajetórias individuais (envelope de caminhos possíveis)
  - Taxa de sucesso ao longo do tempo (temporal decay)
- Benchmark de aceitabilidade: > 90% taxa de sucesso
- Dados históricos como base (séries TSR históricas)

#### 4. Fronteira Eficiente
- Visualização integrada ao backtest
- Gerada a partir dos dados das 3 carteiras comparadas
- Identifica portfólios eficientes (máx retorno por unidade de risco)

#### 5. Coast FIRE Calculator
- Inputs: idade atual, idade de aposentadoria, patrimônio atual (R$), aporte mensal, gastos mensais na aposentadoria, taxa de crescimento (%), inflação (%), TSR (%)
- Outputs:
  - Coast FIRE Number: quanto acumular para parar de aportar
  - FIRE Number final: patrimônio alvo total
  - Anos até o Coast: tempo até atingir o marco
  - Idade do Coast: projeção etária
- Fórmula: `MC = (VM × 12 / TSR) / ((1 + TRL)^n)`
- Dados persistem em localStorage (privacidade local)

#### 6. PIP — Gerador de Política de Investimento Pessoal
- Gerador de documento IPS (Investment Policy Statement) personalizado
- Funcionalidade exata não acessível sem login, mas é o equivalente do IPS do Diego

#### 7. Meu IPCA — Inflação Pessoal
- Seleciona região metropolitana (dados IBGE regionalizados)
- Exibe os 9 grandes grupos do IPCA com pesos oficiais
- Usuário ajusta pesos conforme seu orçamento real
- Calcula inflação pessoal vs IPCA oficial
- Fator de ajuste matemático para normalizar pesos customizados = 100%
- Integração com fiBUDGET para rastreamento de gastos

### aposenteaos40.org — Educação e frameworks

#### Frameworks educacionais
- **TSR (Taxa Segura de Retirada)**: metodologia própria brasileira baseada em dados reais do período Real (1995-2018), 24 anos de dados, SAFEMAX calculada
  - TSR projetada ~9.3% (Selic) vs 5.3% (poupança) vs 4% (EUA)
  - Metodologia: exclusivamente renda fixa para conservadorismo (excluiu Ibovespa por série curta)
- **Coast FIRE**: explicação completa com fórmula, exemplo prático (40 anos, meta 50, R$10k/mês → R$2.43M vs R$3.43M FIRE tradicional), dimensão psicológica
- **Termômetro FIRE**: calculadora de projeção com 4 categorias de FIRE:
  - FIRE Blindado (Fat): 400x despesas mensais
  - FIRE Tradicional: 300x (= 4% SWR)
  - FIRE Flexível: 200x
  - FIRE Corda Bamba: 150x
- **Três Pilares do FIRE**: framework conceitual estruturante
- **PIP / PIR**: Política de Investimento Pessoal (template de IPS para pessoa física)

#### Dados e pesquisa
- **Anuário FIRE**: survey anual da comunidade FIRE brasileira (dados demográficos, patrimônio, progresso, gastos)
- **Shiller PE Ibovespa**: acompanhamento do P/L ajustado ciclicamente do Ibovespa
- **FIRESFERA**: diretório de blogs FIRE brasileiros

#### Ferramentas adicionais (site principal)
- **fiBUDGET**: orçamento gratuito integrado ao ecossistema
- **FIRE-DASH**: dashboard de acompanhamento de progresso (requer login/conta)
- **Acompanhe seu Patrimônio**: tracker de evolução patrimonial

---

## Comparação com nosso dashboard

### Já temos (equivalente ou superior)

| Feature deles | Nossa implementação | Vantagem nossa |
|---------------|--------------------|-|
| Monte Carlo taxa de sucesso | P(FIRE) com 10k trajetórias, P(quality), intervalos de modelo (72-92%) | Mais sofisticado: P(quality) separado, regime switching avaliado, bond pool isolation, spending smile, health cost model calibrado |
| Trajetórias MC (fan chart) | PFireMonteCarloTornado + trajectories chart | Comparável |
| Backtest equity curve histórica | Aba Backtest com equity curve + shadow portfolios | Comparável, mais focado na carteira real |
| Taxa de sucesso ao longo do tempo | FireScenariosTable com cenários base/favorável/stress | Comparável |
| Cenários de estresse | Stagflação, hiperinflação, décadas perdidas no MC | Mais completo (stagflation 17.1%, hyperinflation, lost decade) |
| Withdrawal / SWR | Aba Withdraw: SWR dinâmico, guardrails, bond ladder, VPW | Muito mais completo: guardrails com elasticidade, saúde inelástica separada, bond pool, categorias de gasto |
| Drift / rebalanceamento | RebalancingStatus, drift chart por ativo | Completo com trigger automático |
| Alocação / Fronteira Eficiente | Portfolio: factor tracking, risk contribution, efficient frontier | Comparável + factor attribution |
| IPS / Política de Investimento | IPS summary card na aba NOW | Temos, menos interativo |
| Performance attribution | TWR, CAGR real/nominal, alpha vs VWRA | Superior: rolling metrics, factor regression |
| FIRE Number progress bar | FIRE Number com progress bar (HD-dashboard-gaps-tier1) | Implementado |
| Matriz de cenários FIRE | FireMatrix (aba FIRE) | Temos |
| Human capital | Human capital score (wellness) + aba FIRE eventos de vida | Temos |

### Temos parcialmente / podemos melhorar

| Feature deles | Nosso gap específico |
|---------------|---------------------|
| Backtest multi-carteira (até 3) | Nosso backtest é fixo na carteira real + shadow portfolios. Não temos entrada livre de ativos arbitrários |
| Heatmap de retornos anuais | Temos retornos anuais em tabela (Performance), mas não em formato heatmap visual |
| Matriz de correlação interativa | Temos correlation_stress nos dados, mas sem visualização de matriz completa por ativo |
| Comparativo de portfolios lado a lado | Temos shadow portfolios, mas comparação não é interativa com ativos livres |
| Monte Carlo: escolha de volume (5k/10k) | Nosso MC roda 10k fixo. Não expõe parâmetro ao usuário |
| Termômetro FIRE com 4 bandas | Temos P(FIRE) e P(quality) mas sem classificação Fat/Tradicional/Flexível/Corda Bamba |
| brFIRESim (ciclos históricos reais) | Nosso backtest usa dados reais mas foca em performance, não em ciclos de retirada histórica |

### Não temos — oportunidades

| Feature | Descrição | Valor para Diego |
|---------|-----------|-----------------|
| **brFIRESim** — simulador de ciclos históricos de retirada | Roda cada janela histórica real como cenário de aposentadoria. Complementar ao MC (distribucional) — mostra quais períodos históricos específicos teriam falhado | Alto — validação do P(FIRE) via método independente |
| **Meu IPCA** — inflação pessoal | Calcula inflação real de Diego ponderando seus gastos vs IPCA oficial. Crítico para calibrar SWR real (se Diego gasta mais em saúde/educação, sua inflação diverge do IPCA) | Alto — impacto direto nas premissas FIRE |
| **FIRE Thermometer com 4 bandas** | Fat FIRE (400x) / Tradicional (300x) / Flexível (200x) / Corda Bamba (150x) como framework visual de progresso | Médio — boa comunicação do "onde estou no espectro" |
| **Coast FIRE Calculator** | Calculadora do ponto em que Diego pode parar aportes e ainda atingir FIRE. Responde: "quando posso relaxar os aportes?" | Médio — complementa o Simulators (ReverseFire) que temos |
| **Shiller PE Ibovespa** | P/L ajustado do Ibovespa para decisões táticas de valuation (mesmo que Diego não invista em ações BR, é dado macro contextual) | Baixo para Diego (sem exposição BR equity) |
| **Anuário FIRE** / dados de comunidade | Benchmarking vs outros participantes FIRE BR — taxa de poupança, idade, patrimônio | Baixo — mais informativo que acionável |
| **Heatmap anual de retornos** | Visualização tipo calendário com retornos anuais coloridos por magnitude | Médio — adiciona camada visual útil na aba Performance |
| **Backtest livre de ativos** | Testar hipóteses com ativos arbitrários (ex: "e se tivesse 100% SWRD?") sem alterar carteira real | Médio — hoje limitado a shadow portfolios fixos |
| **Matriz de correlação visual** | Grid de correlações entre todos os ativos da carteira | Baixo — já temos nos dados, falta o widget |

---

## Recomendações

### Top 5 ideias concretas para melhorar nosso dashboard

**1. Meu IPCA pessoal — inflação individualizada (Alta prioridade)**
Implementar cálculo de inflação pessoal de Diego baseado nos pesos reais de seus gastos (já temos spending_analysis.py com categorias). A divergência entre inflação de Diego e IPCA oficial afeta diretamente a calibração do SWR e do deflator real. Feature: widget na aba FIRE ou Assumptions mostrando "sua inflação real vs IPCA" com breakdown por categoria. Dados: spending_analysis.py + IPCA por grupos via BCB.

**2. brFIRESim — validação via ciclos históricos (Alta prioridade)**
Nosso P(FIRE) é 100% Monte Carlo distributivo. Adicionar simulação de ciclos históricos reais (retornos anuais de IPCA+ e equity de cada ano desde 1995) como check independente. Responde: "Nos 24 cenários históricos possíveis, quantos teriam falhado?". Isso eleva a credibilidade do modelo e expõe sequence of returns concretos (ex: "cenário 2002 + 2008 consecutivos").

**3. FIRE Thermometer com bandas Fat/Tradicional/Flexível/Corda Bamba (Média prioridade)**
Adicionar ao KpiHero ou aba FIRE um widget visual mostrando onde Diego está no espectro (atual: ~Xm R$ / meta: R$Y → banda Z). As 4 bandas (400x/300x/200x/150x de despesas mensais) dão contexto qualitativo ao número. Implementação simples — os dados já existem.

**4. Heatmap anual de retornos na aba Performance (Média prioridade)**
Transformar a tabela de retornos anuais da aba Performance em heatmap visual (ECharts heatmap). Verde escuro = anos de alta, vermelho = baixa. Leitura imediata de padrões sazonais e sequence of returns. Muito mais impactante visualmente que a tabela atual.

**5. Coast FIRE — quando Diego pode parar de aportar (Média prioridade)**
Calculadora dedicada: dado o patrimônio atual e as premissas de retorno real, em que data Diego pode reduzir/zerar aportes e ainda atingir R$10M+ FIRE? Complementa o ReverseFire que já temos. Dados: já disponíveis. Implementação: novo card no Simulators ou FIRE tab. Fórmula simples: `CoastNumber = FIRE_Number / (1 + r)^n`.

---

## Metodologia do benchmark

- Site investigado: `https://lab.aposenteaos40.org/` (6 ferramentas) e `https://aposenteaos40.org/` (educação + frameworks)
- Páginas acessadas: `/` (backtest principal), `/montecarlo`, `/coastfire`, `/meu_ipca.php`, `/brfiresim`, `/pip`, e páginas do blog principal
- Data de acesso: 2026-04-30
- Limitações: ferramentas que requerem login (FIRE-DASH, fiBUDGET completo) e PIP generator não foram totalmente inspecionadas. brFIRESim carrega em iframe — interface exata não capturada.
