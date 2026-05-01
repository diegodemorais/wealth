# FR-cmd-fire-status: Command /fire-status

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-cmd-fire-status |
| **Dono** | FIRE |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | FIRE (lead), Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Gap identificado no mapeamento de commands |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Para saber o P(FIRE) atual, Diego precisa rodar `python3 scripts/fire_montecarlo.py` no terminal — que leva ~30s e requer flags. Não existe command que resuma o status FIRE em linguagem natural: "quanto falta, qual o P(FIRE) atual, estou no track?". O check-in mensal faz isso, mas entre check-ins não tem forma rápida.

---

## Descricao

Criar `/fire-status` que:
- Roda MC rápido (2k sims, cenário base) com premissas atuais
- Mostra: P(FIRE) aos 50 e 53, patrimônio mediano projetado, SWR implícita
- Compara com último check-in: melhorou ou piorou?
- Mostra distância ao gatilho formal (R$13.4M + SWR ≤ 2.4%)
- Responde em linguagem natural: "Estás a X anos e Y aportes do FIRE"

---

## Escopo

- [ ] Criar `.claude/commands/fire-status.md`
- [ ] Rodar MC via Bash dentro do command
- [ ] Formato de output: resumo executivo + tabela compacta
- [ ] Comparação com último resultado registrado

---

## Raciocínio

**Argumento central:** P(FIRE) é a métrica norte da carteira. Deveria ser acessível em 1 command, não em terminal + flags + interpretação.

**Prioridade Média:** Usado mensalmente ou ad hoc. O check-in mensal já cobre — este command é conveniência, não necessidade crítica.

---

## Conclusao

Command `.claude/commands/fire-status.md` criado. Roda MC em paralelo (3k sims × FIRE 53 e FIRE 50 simultâneos), lê último resultado de memória como fallback, exibe P(FIRE) por cenário, distância ao gatilho R$13.4M e delta vs último check-in.
