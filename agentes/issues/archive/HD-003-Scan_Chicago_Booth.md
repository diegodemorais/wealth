# HD-003: Scan Material Chicago Booth

## Status: Done
## Data: 2026-03-20
## Responsaveis: 01 Head (lead), todos os agentes

## Contexto
Diego fez um curso de investimentos na Chicago Booth (Portfolio Management: Investment Strategies for Executives, June 9-13, 2025) que confirmou e expandiu seus conhecimentos. Escanear todo o material para:
1. Registrar os conteudos, temas e referencias academicas
2. Identificar o que pode virar aprendizado ou input para a estrategia
3. Levantar lista de assuntos candidatos a issues

## Origem
Solicitacao de Diego em 2026-03-20

## Escopo
- Navegar recursivamente TODAS as subpastas do material Chicago Booth
- Para cada arquivo legivel: registrar nome, tipo, resumo, temas, referencias
- Compilar resultado em `agentes/contexto/chicago_booth_scan.md`
- Levantar lista de assuntos candidatos a issues

## Analise

### Materiais Processados
- 28 arquivos .txt lidos na integra
- 2 professores: Pietro Veronesi (Days 1-3 AM) e Ralph S.J. Koijen (Days 3 PM - 5)
- 7 lecture note sets, 3 HBS case studies, 4 exercises, 1 work session report
- 2 capitulos de textbook (Bodie, Kane, Marcus) estavam vazios (copyright protection)

### Estrutura do Curso
5 dias cobrindo: portfolio theory, CAPM, factor models (FF 3/5-factor, Carhart), bond valuation & duration, asset management industry trends, ETFs & smart beta, market frictions & arbitrage, cross-asset strategies, AI/ML in asset management.

### Output
Scan completo registrado em `agentes/contexto/chicago_booth_scan.md` com 7 secoes:
1. Programa do curso (professores, dias, sessoes)
2. Indice de materiais (28 arquivos com tipo e resumo)
3. Temas cobertos (14 temas organizados por area)
4. Referencias academicas completas (60+ papers com autor/ano/tema)
5. Frameworks e modelos (18 frameworks: MVO, CAPM, FF, Treynor-Black, etc.)
6. Insights para a carteira de Diego (10 confirmacoes, 10 expansoes, 4 contradicoes)
7. Lista de 8 assuntos candidatos a issues

## Conclusao

O curso valida amplamente a estrategia de Diego: diversificacao global via ETFs de baixo custo, factor tilts com base em evidencia, rebalanceamento via aportes, e disciplina comportamental. Os principais pontos de atencao sao: (1) duration risk de Renda+ 2065 em regime inflacionario, (2) value premium compression, (3) factor crowding crescente, (4) oportunidades de tax-loss harvesting, e (5) regime de correlacao stock-bond no Brasil.

## Resultado

- Arquivo criado: `agentes/contexto/chicago_booth_scan.md` (scan completo com ~600 linhas)
- 8 issues candidatos levantados: FI-004 (JPGL factors), RF-003 (Renda+ duration), TX-001 (TLH), XX-002 (stock-bond correlation BR), FI-005 (factor crowding), FI-006 (intangibles & value), HD-004 (behavioral checklist), HD-005 (carry framework)
- 60+ referencias academicas catalogadas
- 18 frameworks/modelos registrados
