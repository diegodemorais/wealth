# RK-001: Stress Test Risco Soberano Brasil

## Metadados
| Campo | Valor |
|-------|-------|
| **Dono** | 06 Risco (lead), 10 Advocate, 04 FIRE |
| **Status** | Aberta |
| **Prioridade** | Alta |
| **Data** | 2026-03-20 |

## Contexto
Bloco Brasil na carteira representa ~13.1% (Renda+ 2065 3.2% + Reserva IPCA+ 2029 2.5% + IPCA+ 2040 existente 0.4% + IPCA+ 2040 estrutural futuro 7%).

IMPORTANTE: HODL11 NÃO é risco Brasil. É Bitcoin (ativo global) em wrapper B3. Risco operacional apenas.

Com IPCA+ estrutural, exposição soberana BR mais que dobrou. Nenhum stress test foi feito.

## Escopo
Modelar 3 cenários:
1. Crise fiscal BR (2015-2016 style): Selic sobe pra 14%+, taxa Renda+ vai a 9-10%, IPCA+ sobe junto
2. Risk-off global (2022 style): Fed aperta, BRL deprecia, curva longa abre
3. Worst case (ambos juntos): drawdown máximo do bloco Brasil

Para cada cenário calcular:
- Impacto em R$ e % no patrimônio total
- Correlação condicional entre os ativos do bloco
- Tempo estimado de recuperação

## Entregas
- Mapa de drawdown por ativo e total do bloco
- Validação do FIRE: patrimônio projetado aos 50 sobrevive ao cenário 3?
- Regra para withdrawal ops: nunca liquidar Renda+ e IPCA+ no mesmo trimestre
- Playbook para Diego executar as regras no drawdown

## Origem
Retro 2026-03-19, aprendizado #5 (revisado em debate 2026-03-20)
