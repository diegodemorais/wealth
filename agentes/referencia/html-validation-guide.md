# HTML Validation Guide — Prevenir Div Bugs Recorrentes

## Problema: Divs Fechando Prematuramente

**Histórico:** A estrutura HTML do dashboard fechava divs antes da hora, causando:
- Falta de constraint de width em sections
- Layout quebrado em certos viewports
- Dificuldade de debugar porque o erro não era óbvio

**Exemplos de erros que causam isso:**
```html
<!-- ❌ ERRADO: Footnotes fora do section -->
<div class="section">
  <div class="collapse-body">
    <p>Conteúdo</p>
  </div><!-- /collapse-body -->
</div>
<!-- Footnotes aqui causam 3 divs de fecharem prematuramente -->
<span>Legenda do gráfico</span>
</div>
</div>
</div>

<!-- ✅ CORRETO: Footnotes dentro do section -->
<div class="section">
  <div class="collapse-body">
    <p>Conteúdo</p>
    <div style="margin-top:10px">
      <span>Legenda do gráfico</span>
    </div>
  </div><!-- /collapse-body -->
</div>
```

---

## Solução: Três Camadas de Validação

### 1. Validação Automática (build)

Roda **automaticamente** após `python3 scripts/build_dashboard.py`:

```bash
✅ Dashboard gerado: dashboard/index.html
   Versão: v2.76 | Data/hora: 2026-04-13T19:20:37-03:00
   Tamanho: 546,032 chars (14,862 linhas)
✅ Estrutura HTML validada  ← Nova linha!
```

**Se falhar:**
```bash
❌ VALIDAÇÃO HTML FALHOU — Build bloqueado:
   ❌ Divs desbalanceados: 500 opens vs 501 closes (diferença: -1)
   ❌ Balance fica negativo em linha 1045 (container abre em linha 310)
```

### 2. Teste Isolado (debug)

Se você precisa debugar a estrutura sem fazer build completo:

```bash
python3 scripts/validate_html_structure.py
```

Output:
```
✅ Estrutura HTML validada com sucesso
   • Divs balanceados
   • Container abre e fecha 1x cada
   • Nenhum div fecha antes do container
```

### 3. Validação Manual (para evitar o erro)

**Regra de ouro:** Tudo que você adiciona **DEVE estar dentro do `<div class="container">`**.

```html
<!-- ✅ Correto -->
<div class="container">
  <!-- Seu conteúdo aqui -->
  <div class="section">
    ...
  </div>
</div><!-- /container -->
<!-- Nada aqui! -->

<!-- ❌ Errado -->
<div class="container">
  <!-- Seu conteúdo -->
</div>
<!-- ❌ Isso fecha divs prematuramente -->
<div class="footnote">Legenda</div>
</div>
</div>
```

---

## Checklist: Antes de Fazer Commit

- [ ] Rodei `python3 scripts/build_dashboard.py`
- [ ] Output mostra ✅ **Estrutura HTML validada**
- [ ] Nenhum closing div está **depois** do `</div><!-- /container -->`
- [ ] Se adicionei novo conteúdo, coloquei **dentro** de uma `.section` ou `.collapse-body`

---

## Estrutura de Divs do Dashboard

```
<div class="container">           ← LINHA 310
  <div class="header">
    ...
  </div>

  <div class="tab-nav">
    ...
  </div>

  <!-- SEÇÕES (cada uma é um bloco independente) -->
  <div class="section" data-in-tab="hoje">
    ...
  </div>

  <div class="section" data-in-tab="carteira">
    ...
  </div>

  <footer>
    ...
  </footer>
</div><!-- /container -->    ← LINHA 1366 (esperado)

<!-- ❌ NADA AQUI! -->
<script>                       ← INÍCIO DO SCRIPT
```

**Regra:** O `</div><!-- /container -->` **DEVE** estar na **última seção de conteúdo HTML**, antes do `<script>`.

---

## Como Debugar se Falhar

Se a validação falhar, use este script para encontrar o problema:

```python
python3 << 'EOF'
with open('dashboard/template.html') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines, 1):
    opens = line.count('<div')
    closes = line.count('</div>')
    balance += opens - closes
    
    # Mostra onde o balance fica negativo (problema!)
    if balance < 0:
        print(f"❌ Linha {i}: {line.strip()[:80]}")
        print(f"   Balance: {balance}")
        if i > 1350:  # Perto do final
            break
EOF
```

---

## Histórico de Ocorrências

| Versão | Data | Problema | Causa |
|--------|------|----------|-------|
| v2.75  | 2026-04-13 | Divs fechando em linha 1049 | Footnotes da Drawdown fora do section |
| v2.58  | — | HTML closing comments desbalanceados | Collapse-body aninhado incorretamente |
| v2.55  | — | Brasil pct soma bug + divs | Múltiplas seções mal fechadas |

---

## TL;DR

✅ **Build automático agora valida estrutura**
✅ **Validação bloqueia se houver erro**
✅ **Teste isolado disponível: `python3 scripts/validate_html_structure.py`**

**Nunca mais feche divs fora do container!**
