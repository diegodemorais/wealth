# DEV-semaforo-action-text — Ação Recomendada Explícita no Semáforo

## Metadados

| Campo | Valor |
|-------|-------|
| ID | DEV-semaforo-action-text |
| Dono | Dev |
| Status | 🔵 Doing |
| Prioridade | 🟡 Média |
| Criada | 2026-04-24 |
| Origem | DEV-ux-prototipo — único item com ROI positivo claro do protótipo |

## Por que esta Issue Existe

O `MacroUnificado` e o `RFStatusPanel` já mostram dados macro e status do semáforo (verde/amarelo/vermelho), mas **não derivam uma ação recomendada explícita**. O usuário precisa ler o dado e inferir o que fazer.

O protótipo do Claude Design mostrava cards com linha "→ ação recomendada" inline ao semáforo. A análise do time (4 perspectivas) e do UX/UI especialista convergiram: é o menor delta de implementação com maior ganho cognitivo do protótipo inteiro.

Dado que os dados já existem e a lógica de gatilho já está implementada, isso é **extensão de output**, não nova fonte de dados.

## Componentes Alvo

| Componente | Arquivo | Semáforo atual | Ação a adicionar |
|------------|---------|---------------|-----------------|
| `RFStatusPanel` | `src/components/dashboard/RFStatusPanel.tsx` | Status IPCA+ e Renda+ (taxa vs gatilho) | Linha "→ Comprar / Aguardar / DCA" |
| `MacroUnificado` | `src/components/dashboard/MacroUnificado.tsx` | Status macro (Selic, IPCA, CDS) | Linha "→ implicação para aporte atual" |

## Especificação

### Lógica de ação — RFStatusPanel

Usar os mesmos gatilhos já definidos em `carteira.md` e propagados via `config.py`:

```
IPCA+ 2040:
  taxa >= 6.0% → "→ Comprar (gatilho ativo)"
  taxa 5.5–5.9% → "→ Monitorar — próximo do gatilho"
  taxa < 5.5%  → "→ Aguardar"

Renda+ 2065:
  taxa >= 6.5% → "→ DCA ativo (gatilho ativo)"
  taxa 6.0–6.4% → "→ Monitorar"
  taxa < 6.0%  → "→ Aguardar"
```

### Lógica de ação — MacroUnificado

```
Selic > 14%:
  → "→ RF doméstica competitiva — manter peso equity"
Selic 11–14%:
  → "→ Neutro"
Selic < 11%:
  → "→ Favorecer equity"

CDS Brazil > 250bps:
  → "→ Risco soberano elevado — nenhuma ação (IPCA+ como hedge natural)"
```

### UI Pattern

Adicionar abaixo do status pill existente uma linha de texto curta, com cor do status:

```tsx
// Dentro do card de status, após o pill verde/amarelo/vermelho:
{acaoRecomendada && (
  <div className="text-xs font-mono mt-1" style={{ color: statusColor }}>
    {acaoRecomendada}
  </div>
)}
```

- Fonte: `font-mono`, `text-xs` (Tailwind)
- Cor: herda do status (verde/amarelo/vermelho via `var(--green)` etc)
- Prefixo fixo: `→ ` (seta + espaço)
- Sem tooltip, sem collapse — sempre visível

### Não fazer

- Não criar nova fonte de dados
- Não mudar a estrutura de dados em `dados/`
- Não adicionar lógica em Python — a derivação da ação é TypeScript puro baseado nos valores já carregados
- Não mudar o layout dos componentes — só adicionar a linha de texto

## Critério de Conclusão

- [ ] `RFStatusPanel` exibe "→ ação" baseado na taxa atual vs gatilho
- [ ] `MacroUnificado` exibe "→ implicação" baseado em Selic e CDS
- [ ] Privacy mode: texto de ação NÃO é mascarado (não é valor monetário)
- [ ] `npm run build` limpo
- [ ] Quant valida: lógica de gatilho bate com `carteira.md`

## Resultado

Implementado em 2026-04-24.

- `RFStatusPanel.tsx`: `getAcaoRecomendada()` adicionada; linha "→ ação" renderizada abaixo do gap em cada card, com cor do status (green/yellow/muted)
- `MacroUnificado.tsx`: `selicAcao` e `cdsAcao` derivadas; strip compacto renderizado abaixo da grade Taxas BR/EUA, antes de "Ativos de Referência"
- Privacy mode: texto de ação NÃO mascarado (não é valor monetário) ✓
- `npm run build` limpo ✓
