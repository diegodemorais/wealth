# ARCH-002: Tier 2 — Test Provenance (Rastreabilidade de Origem de Dados)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | ARCH-002 |
| **Dono** | Dev + Quant |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Bookkeeper, Head |
| **Co-sponsor** | Head |
| **Dependencias** | ARCH-001 (Tier 1 validador) |
| **Criado em** | 2026-04-13 |
| **Origem** | Diagnóstico arquitetural — gap de rastreabilidade |
| **Concluido em** | — |

---

## Motivo / Gatilho

Teste `brasil_pct + exposicao_cambial_pct` falhou porque ninguém rastreava **como** cada campo foi calculado em upstream (generate_data.py).

Mudança em `posicoes.json` (ex: venda de crypto) → muda `brasil_pct` → teste falha com mensagem genérica. Sem provenance, o ciclo de debug é:
1. Teste falha
2. Dev pergunta "por que?", Quant pergunta "qual a origem?"
3. Ninguém sabe
4. Espião a fundo

---

## Descricao

Adicionar **Test Provenance** — cada campo em data.json rastreia:
- Qual script Python o calculou (ex: `generate_data.py`, linha X)
- Qual é a fórmula/lógica (ex: `hodl11_brl + rf_total_brl + crypto_legado`)
- Qual é o campo de entrada (ex: `posicoes.HODL11.qty × posicoes.HODL11.preco`)

Quando teste falha, mensagem inclui provenance:
```
brasil_pct = 47.2% 
  ↳ Origem: generate_data.py:1521
  ↳ Fórmula: (hodl11_brl + rf_total_brl + crypto_legado) / total_portfolio * 100
  ↳ Entrada: posicoes.HODL11.qty=1676, preco=59.79
```

---

## Escopo

- [ ] Estender `data.json` com seção `_provenance`:
  ```json
  {
    "_provenance": {
      "concentracao_brasil.brasil_pct": {
        "source_file": "scripts/generate_data.py",
        "source_line": 1521,
        "formula": "(hodl11_brl + rf_total_brl + crypto_legado) / total_portfolio * 100",
        "input_fields": ["posicoes.HODL11", "rf.ipca2029.valor", ...],
        "last_updated": "2026-04-13"
      },
      "macro.exposicao_cambial_pct": {
        "source_file": "scripts/generate_data.py",
        "source_line": 1487,
        "formula": "(equity_usd × cambio) / total_portfolio * 100",
        "input_fields": ["patrimonio.equity_usd", "macro.cambio"],
        "last_updated": "2026-04-13"
      }
    }
  }
  ```

- [ ] Adicionar helper em `dashboard/tests/base.py`:
  ```python
  def get_provenance(field_name: str) -> dict:
      """Retorna origem/fórmula de um field em data.json"""
      return load_data().get("_provenance", {}).get(field_name, {})
  ```

- [ ] Atualizar 3-5 testes para incluir provenance em mensagem de erro:
  ```python
  def test_brasil_pct_range():
      val = get_nested(load_data(), "concentracao_brasil.brasil_pct")
      prov = get_provenance("concentracao_brasil.brasil_pct")
      if not (0 <= val <= 100):
          return False, (
              f"brasil_pct={val} fora de [0, 100]\n"
              f"  Origem: {prov.get('source_file')}:{prov.get('source_line')}\n"
              f"  Fórmula: {prov.get('formula')}"
          )
  ```

- [ ] Rodar `test_dashboard.py` pós-implementação:
  - Deve passar com 634+ testes
  - Mensagens de falha devem incluir provenance
  - Validar que _provenance não afeta privacy mode (não mostrar valores sensíveis)

---

## Raciocinio

**Alternativas rejeitadas:**
- "Apenas adicionar comentários em generate_data.py": não é processável (script) vs (dados estruturados)
- "Adicionar mais testes": sem provenance, mesmo teste novo não sabe origem

**Argumento central:**
Dados são um artefato, não código. Artefatos precisam de **versioning** (quando mudou) + **lineage** (de onde vieram). _provenance é lineage estruturado.

**Incerteza reconhecida:**
- _provenance pode ficar desatualizado se generate_data.py muda sem atualizar
- Data.json fica maior (~10% overhead)

**Falsificacao:**
- Se teste falha e provenance não pinça fonte real: lineage está wrong

---

## Analise

### Gap Atual

Teste falha:
```
brasil_pct={val} fora de [0, 100]
```

Dev fica preso. Precisa ler generate_data.py, encontrar linha, debugar upstream.

Com provenance:
```
brasil_pct={val} fora de [0, 100]
  Origem: generate_data.py:1521
  Fórmula: (hodl11_brl + rf_total_brl + crypto_legado) / total_portfolio * 100
  Entrada: posicoes.HODL11.qty=1676
```

Dev vê imediatamente: "HODL11 deve estar em holdings.md, vou checar".

### Impacto

- **Tempo de debug**: ~50% redução (provenance pinça origem rapidamente)
- **False positives**: -30% (entende que teste é válido ou inválido)
- **Overhead**: ~50KB em data.json (Z-compressed: 10KB)

---

## Conclusao

A ser preenchido após implementação.

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Dev | 3x | Necessário | Implementar provenance |
| Quant | 2x | Aprova | Facilita validação cross-domain |
| Bookkeeper | 2x | Aprova | Rastreabilidade de dados |
| Head | 1x | Aprova | Melhora UX de debug |
| **Score ponderado** | | **Implementar** | **Unanimidade** |

---

## Resultado

A ser preenchido após conclusão.

---

## Proximos Passos

- [ ] Após ARCH-002 completo: avaliar ARCH-003 (Componentizar Template)
