---
ID: DEV-metriccard-tooltip-api
Titulo: MetricCard — adicionar prop `title`/tooltip + popover primitive
Dono: Dev
Prioridade: 🟢 Baixa
Dependências: —
Origem: HD-dashboard-review-completa Fase 2 menores (deferred 2026-05-03 — requer mudança de API)
---

## Contexto

KPIs do hero NOW (e outros locais que usam `<MetricCard />`) não têm tooltip explicativo. Hoje o componente não suporta prop `title` nem popover.

Fluência sofre: leitor olha "P(FIRE) 78.8%" e não sabe se é base/fav/aspiracional, qual cenário, qual horizonte.

## Decisão (Diego, 2026-05-03)

Adicionar prop `title` (ou `tooltip`) + popover primitive em `<MetricCard />`. Aplicar em ≥6 KPIs do hero NOW + outros locais que se beneficiariam.

## Critérios de aceite

- [ ] `<MetricCard />` aceita prop `tooltip?: string | ReactNode`
- [ ] Popover primitive criado (ou Radix UI tooltip) com:
  - hover/focus trigger (acessível via teclado)
  - posicionamento auto (top/bottom)
  - mobile: tap para abrir/fechar
- [ ] ≥6 KPIs NOW hero recebem tooltip (P(FIRE), Patrimônio, DCA Status, Renda Esperada, etc)
- [ ] Privacy mode: tooltip não vaza R$/USD literais
- [ ] data-testid: `metric-card-tooltip` para regression
- [ ] Suite full verde

## Restrições

- Acessibilidade WCAG: focus visible, aria-describedby
- Performance: tooltip renderiza só on-demand (não no DOM antes de hover)
- Memória `feedback_privacy_transformar.md`: privacy mascara, não esconde

## Conclusão

> A preencher após implementação.
