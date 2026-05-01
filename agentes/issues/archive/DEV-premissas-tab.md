# DEV-premissas-tab: Aba Premissas — Transparência do Plano FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-premissas-tab |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | 🟢 Baixa |
| **Participantes** | Head, Bookkeeper, Quant, QA |
| **Co-sponsor** | FIRE (7 premissas críticas identificadas; aba resolve auditabilidade do P(FIRE)) |
| **Dependencias** | — |
| **Criado em** | 2026-04-21 |
| **Origem** | Conversa |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego usa o dashboard para mostrar o plano a terceiros (Katia, contador). Quem vê o dashboard vê P(FIRE) = 91% sem saber o que alimenta esse número. Uma aba de premissas fecha essa lacuna e serve como "sanity check" estruturado — se um número diverge do esperado, a primeira pergunta é "a premissa mudou?".

---

## Descrição

Nova aba read-only `/premissas` que expõe as premissas base do plano FIRE em dois blocos:

**Bloco A — Premissas Pessoais**: spending target, patrimônio atual, aporte mensal, FIRE date, estado civil, patrimônio gatilho, renda estimada, INSS.

**Bloco B — Premissas do Modelo**: retorno real esperado, volatilidade, SWR, IPCA assumido, horizonte de vida, taxa IPCA+ longa, dados macro (Selic, câmbio).

Dados vêm de `data.json` via `useDashboardStore` — sem manutenção manual, sem risco de staleness. O campo `premissas` já existe em `data.json` com 22 campos. Apenas 2 campos precisam ser adicionados ao pipeline.

---

## Escopo

- [ ] Adicionar `horizonte_vida` ao pipeline `generate_data.py` (já em `carteira_params.json` como `horizonte_vida: 90`)
- [ ] Adicionar `taxa_ipca_plus_longa` ao pipeline (snapshot Tesouro Direto, já captado por `generate_data.py`)
- [ ] Criar `/app/premissas/page.tsx` (read-only, 2 blocos, segue padrão das outras páginas)
- [ ] Registrar aba em `dashboard.config.ts` (TABS + SECTIONS)
- [ ] Atualizar `Header.tsx` com label `PREMISSAS` e href `/premissas`
- [ ] Implementar privacy mode: valores monetários mascaram com `PrivacyMask`
- [ ] Adicionar `data-generated` timestamp visível ("Dados de: YYYY-MM-DD HH:mm BRT")
- [ ] Testes: ~55 casos em 8 arquivos (ver Plano de Testes abaixo)
- [ ] Build + push pós-implementação

---

## Raciocínio

**Alternativas rejeitadas:**
- *Rodapé persistente*: Advocate propôs linha de rodapé com premissas resumidas. Rejeitada: comprime demais informação densa, não permite auditoria real de terceiros.
- *Modal "Sobre o Plano"*: Advocate propôs modal acionado por botão. Possível alternativa, mas aba é mais acessível e integra naturalmente no padrão de navegação existente.

**Argumento central:**
Dados já existem em `data.json.premissas` (22 campos). Custo de implementação é trivial (1-2h). O risco de staleness — principal objeção do Advocate — é inexistente porque os dados vêm do pipeline, não de manutenção manual.

**Incerteza reconhecida:**
- `patrimonio_atual` em `data.json` = R$3.638.511 vs `carteira.md` = R$3.372.673 (delta 7,9%). Quant identificou divergência — resolver antes do deploy desta aba para não expor número inconsistente.
- `renda_mensal_liquida` tem naming ambíguo (valor idêntico a `renda_estimada`). Verificar semântica antes de exibir.

**Falsificação:**
Se Diego ou um terceiro reportar que a aba exibe premissas desatualizadas após um ciclo de atualização normal do pipeline, re-avaliar arquitetura.

---

## Análise

### Dados disponíveis (Bookkeeper)

| Campo JSON | Label PT | Valor Atual | Bloco | Status |
|-----------|----------|-------------|-------|--------|
| `patrimonio_atual` | Patrimônio Atual | R$ 3.638.511 | A | ✅ em `premissas` |
| `aporte_mensal` | Aporte Mensal | R$ 25.000/mês | A | ✅ em `premissas` |
| `custo_vida_base` | Spending Target | R$ 250.000/ano | A | ✅ em `premissas` |
| `patrimonio_gatilho` | Patrimônio Gatilho (3% SWR) | R$ 8.333.333 | A | ✅ em `premissas` |
| `idade_atual` | Idade Atual | 39 anos | A | ✅ em `premissas` |
| `idade_cenario_base` | FIRE Date (Base) | 2040 / 53 anos | A | ✅ em `premissas` |
| `idade_cenario_aspiracional` | FIRE Date (Aspiracional) | 2035 / 49 anos | A | ✅ em `premissas` |
| `tem_conjuge` / `nome_conjuge` | Estado Civil | Solteiro | A | ✅ em `premissas` |
| `renda_estimada` | Renda Mensal | R$ 45.000/mês | A | ✅ em `premissas` |
| `inss_anual` | INSS Diego | R$ 18.000/ano | A | ✅ em `premissas` |
| `inss_katia_anual` | INSS Katia | R$ 93.600/ano | A | ✅ em `premissas` |
| `pgbl_katia_saldo_fire` | PGBL Katia (FIRE Day) | R$ 490.000 | A | ✅ em `premissas` |
| `retorno_equity_base` | Retorno Real Esperado | 4,85%/ano | B | ✅ em `premissas` |
| `volatilidade_equity` | Volatilidade | 16,8%/ano | B | ✅ em `premissas` |
| `swr_gatilho` | Safe Withdrawal Rate | 3,0% | B | ✅ em `premissas` |
| `ipca_anual` | IPCA Assumido | 4,0%/ano | B | ✅ em `premissas` |
| `horizonte_vida` | Horizonte de Vida | 90 anos | B | 🔴 Adicionar ao pipeline |
| `taxa_ipca_plus_longa` | Taxa IPCA+ Longa | ~7,21% | B | 🔴 Adicionar ao pipeline |
| `macro.selic_meta` | Selic Meta | 14,75% | B | ✅ em `macro` |
| `macro.ipca_12m` | IPCA 12m (Realizado) | 4,14% | B | ✅ em `macro` |
| `macro.cambio` | Câmbio BRL/USD | — | B | ✅ em `macro` |

### Validação Quant

| Campo | data.json | Fonte primária | Status |
|-------|-----------|----------------|--------|
| `patrimonio_atual` | R$ 3.638.511 | R$ 3.372.673 (carteira.md 2026-04-01) | ⚠️ **Divergência — investigar antes do deploy** |
| `aporte_mensal` | 25.000 | 25.000 | ✅ |
| `custo_vida_base` | 250.000 | 250.000 | ✅ |
| `retorno_equity_base` | 0,0485 | 0,0485 | ✅ |
| `swr_gatilho` | 0,03 | 0,030 | ✅ |
| `ipca_anual` | 0,04 | 0,04 | ✅ |
| `idade_cenario_base` | 53 | 53 | ✅ |
| `patrimonio_gatilho` | 8.333.333 | R$250k/0,03 = R$8.333.333 | ✅ |
| `inss_katia_anual` | 93.600 | R$7.800×12 = R$93.600 | ✅ |
| `renda_mensal_liquida` | 45.000 | Mesmo valor que `renda_estimada` — naming ambíguo | ⚠️ Revisar semântica |

### Plano de Testes (QA — ~55 casos em 8 arquivos)

#### 1. `schema-validation.test.ts` — bloco `PREMISSAS tab fields`
- [ ] `data.premissas` existe e é objeto não-null
- [ ] Todos os 17 campos obrigatórios presentes e com tipo correto
- [ ] `patrimonio_gatilho ≈ custo_vida_base / swr_gatilho` (margem ±30%)
- [ ] `idade_cenario_aspiracional <= idade_cenario_base`
- [ ] `inss_inicio_ano >= idade_atual`
- [ ] Se `tem_conjuge === true`, campos de cônjuge presentes e válidos
- [ ] Sanity checks: `swr_gatilho` entre 0,01 e 0,10; `retorno_equity_base` entre -0,20 e 0,30

#### 2. `data-key-mapping.test.ts` — keys canônicas
- [ ] Sem acesso a `premissas.retorno_base`, `premissas.swr`, `premissas.meta_patrimonio` (keys erradas)
- [ ] `premissas/page.tsx` usa `useDashboardStore` (não fetch direto)
- [ ] `premissas/page.tsx` usa `withBasePath` para qualquer fetch
- [ ] Sem literais hardcoded para valores financeiros na página

#### 3. `style-validation.test.ts`
- [ ] `Header.tsx` contém `PREMISSAS` (uppercase, sem emoji)
- [ ] href aponta para `/premissas`
- [ ] Nenhum grid `repeat(N≥4)` inline na página
- [ ] Usa `grid-cols-2 sm:grid-cols-N` (mobile safety)

#### 4. `no-hardcoded.test.ts`
- [ ] `premissas/page.tsx` importa `privacyMode` ou `PrivacyMask`
- [ ] Privacy mode implementado com `••••` real, não só import

#### 5. `component-render.test.tsx` — describe `PremissasPage`
- [ ] Render sem crash com dados reais
- [ ] Render sem crash com `premissas: null`, `premissas: {}`, campos individuais null
- [ ] Nenhum `<input>`, `<select>`, `<textarea>` na página (read-only)
- [ ] `swr_gatilho: 0` não causa divisão por zero
- [ ] `ultimo_aporte_data: "invalid-date"` exibe fallback `—`

#### 6. `routing.test.ts`
- [ ] `react-app/src/app/premissas/page.tsx` existe
- [ ] Adicionada ao array `pageFiles` de verificação

#### 7. `e2e/navigation.spec.ts`
- [ ] Link `/premissas` visível no header
- [ ] Navegação sem 404, sem console errors
- [ ] Conteúdo carrega sem timeout
- [ ] Retorno a outra aba funciona (regressão)

#### 8. `e2e/privacy-and-design.spec.ts`
- [ ] Valores monetários mascaram após privacy toggle
- [ ] Idades/taxas continuam visíveis em privacy mode
- [ ] Toggle duplo restaura valores
- [ ] Sem overflow em 375×667, 768×1024, 1920×1080

---

## Conclusão

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

| Tipo | Detalhe |
|------|---------|
| **Alocação** | — |
| **Estratégia** | — |
| **Conhecimento** | — |
| **Memória** | — |

---

## Próximos Passos

- [ ] Resolver divergência `patrimonio_atual` (Bookkeeper verificar snapshot atual via planilha)
- [ ] Verificar semântica `renda_mensal_liquida` vs `renda_estimada`
- [ ] Dev implementar (após issue acima resolvida)
