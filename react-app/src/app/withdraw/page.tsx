'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { GuardrailsChart } from '@/components/charts/GuardrailsChart';
import { IncomeChart } from '@/components/charts/IncomeChart';
import { GuardrailsRetirada } from '@/components/dashboard/GuardrailsRetirada';
import { BondPoolReadiness } from '@/components/dashboard/BondPoolReadiness';
import { BondPoolRunwayChart } from '@/components/charts/BondPoolRunwayChart';

export default function WithdrawPage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando dados de retirada...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>Erro ao carregar dados de retirada:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">Dados carregados mas seção de retirada não disponível</div>;
  }

  const swrPercentisRaw = data.fire?.swr_percentis ?? data.swr_percentis ?? data.fire_swr_percentis;
  // Normalize field names: fire_swr_percentis uses swr_p10/p50/p90 + patrimonio_p10_2040 etc.
  const swrPercentis = swrPercentisRaw
    ? {
        p10: swrPercentisRaw.p10 ?? swrPercentisRaw.swr_p10,
        p50: swrPercentisRaw.p50 ?? swrPercentisRaw.swr_p50,
        p90: swrPercentisRaw.p90 ?? swrPercentisRaw.swr_p90,
        p10_patrimonio: swrPercentisRaw.p10_patrimonio ?? swrPercentisRaw.patrimonio_p10_2040,
        p50_patrimonio: swrPercentisRaw.p50_patrimonio ?? swrPercentisRaw.patrimonio_p50_2040,
        p90_patrimonio: swrPercentisRaw.p90_patrimonio ?? swrPercentisRaw.patrimonio_p90_2040,
      }
    : undefined;
  const bondPoolReadiness = data.fire?.bond_pool_readiness ?? data.bond_pool_readiness;
  const bondPoolRunway = data.bond_pool_runway ?? data.fire?.bond_pool_runway;
  const incomeTable = data.fire?.income_phases ?? data.income_phases;

  return (
    <div>
      {/* 1. Bond Pool Readiness — Proteção SoRR */}
      {bondPoolReadiness && (
        <section className="section" id="bondPoolSection">
          <h2>Bond Pool Readiness — Proteção SoRR</h2>
          <BondPoolReadiness data={bondPoolReadiness} />
          {bondPoolRunway && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
                Runway do Bond Pool pós-FIRE (sem DCA futuro adicional)
              </div>
              <BondPoolRunwayChart data={bondPoolRunway} />
            </div>
          )}
          <div className="src">
            Bond pool = ativos RF que provêm liquidez nos primeiros anos FIRE sem vender equity em drawdown. Meta: 7 anos de gastos.
          </div>
        </section>
      )}

      {/* 2. SWR no FIRE Day — Percentis P10 / P50 / P90 */}
      {swrPercentis && (
        <CollapsibleSection id="section-swr-percentiles" title="SWR no FIRE Day — Percentis P10 / P50 / P90" defaultOpen={true}>
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 12 }}>
              {/* P10 */}
              <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--red)' }}>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P10 — Pessimista</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--red)' }}>
                  {swrPercentis.p10 != null ? `${(swrPercentis.p10 * 100).toFixed(2)}%` : '—'}
                </div>
                {swrPercentis.p10_patrimonio != null && (
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 4 }}>
                    Pat: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(swrPercentis.p10_patrimonio)}
                  </div>
                )}
              </div>
              {/* P50 */}
              <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--yellow)' }}>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P50 — Mediano</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--yellow)' }}>
                  {swrPercentis.p50 != null ? `${(swrPercentis.p50 * 100).toFixed(2)}%` : '—'}
                </div>
                {swrPercentis.p50_patrimonio != null && (
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 4 }}>
                    Pat: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(swrPercentis.p50_patrimonio)}
                  </div>
                )}
              </div>
              {/* P90 */}
              <div style={{ background: 'var(--card2)', borderRadius: 8, padding: 14, borderLeft: '3px solid var(--green)' }}>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>P90 — Otimista</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--green)' }}>
                  {swrPercentis.p90 != null ? `${(swrPercentis.p90 * 100).toFixed(2)}%` : '—'}
                </div>
                {swrPercentis.p90_patrimonio != null && (
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 4 }}>
                    Pat: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(swrPercentis.p90_patrimonio)}
                  </div>
                )}
              </div>
            </div>
            <div className="src">
              P10 = cenário pessimista (menor patrimônio → SWR mais alta); P90 = cenário otimista (maior patrimônio → SWR baixa).
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 3. Guardrails de Retirada — FIRE Day (collapsible) */}
      {data.guardrails_retirada && (
        <CollapsibleSection id="section-guardrails-table" title="Guardrails de Retirada — FIRE Day" defaultOpen={true}>
          <div style={{ padding: '0 16px 16px' }}>
            <GuardrailsRetirada guardrails={data.guardrails_retirada} />
            <div style={{ marginTop: 10, fontSize: '.75rem', background: 'rgba(34,197,94,.07)', borderRadius: 6, padding: 8, borderLeft: '3px solid var(--green)' }}>
              <strong>Upside:</strong> se portfolio sobe 25%+ acima do pico real → aumentar retirada 10% permanente (teto R$350k)
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 4. Spending Guardrails — P(FIRE) × Custo de Vida (collapsible) */}
      <CollapsibleSection id="section-spending-guardrails" title="Spending Guardrails — P(FIRE) × Custo de Vida" defaultOpen={true}>
        <div style={{ padding: '0 16px 16px' }}>
          {/* P(FIRE) Status bar */}
          {(() => {
            const sg = data.spending_guardrails ?? (data as any).fire?.spending_guardrails;
            if (!sg) return null;
            const pfire = sg.pfire_atual ?? 0;
            const zona = sg.zona ?? 'verde';
            const zonaColor = zona === 'verde' ? 'var(--green)' : zona === 'amarelo' ? 'var(--yellow)' : 'var(--red)';
            const statusLabel = zona === 'verde' ? 'No caminho certo' : zona === 'amarelo' ? 'Atenção' : 'Zona de risco';
            return (
              <div style={{ marginBottom: 16, background: 'var(--card2)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '.72rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                    P(FIRE) Atual
                  </span>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: zonaColor }}>
                    {pfire.toFixed(1)}% — {statusLabel}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ position: 'relative', height: 10, background: 'rgba(148,163,184,.15)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 5, background: zonaColor, width: `${Math.min(100, pfire)}%`, transition: 'width .4s' }} />
                </div>
                {/* Threshold markers */}
                <div style={{ position: 'relative', height: 16, marginTop: 2 }}>
                  <div style={{ position: 'absolute', left: '70%', top: 0, fontSize: '.5rem', color: 'var(--red)', transform: 'translateX(-50%)' }}>70%↑</div>
                  <div style={{ position: 'absolute', left: '80%', top: 0, fontSize: '.5rem', color: 'var(--yellow)', transform: 'translateX(-50%)' }}>80%↑</div>
                  <div style={{ position: 'absolute', left: '95%', top: 0, fontSize: '.5rem', color: 'var(--green)', transform: 'translateX(-50%)' }}>95%</div>
                </div>
                {sg.nota && (
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: 4 }}>{sg.nota}</div>
                )}
              </div>
            );
          })()}
          <GuardrailsChart data={data} />
          <div className="src">
            Base: Monte Carlo 10k · Interpolação linear entre pontos simulados
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. Renda na Aposentadoria — Fases Temporais (collapsible) */}
      <CollapsibleSection id="section-income-phases" title="Renda na Aposentadoria — Fases Temporais" defaultOpen={true}>
        <div style={{ padding: '0 16px 16px' }}>
          {incomeTable && Array.isArray(incomeTable) ? (
            <div style={{ overflowX: 'auto', marginBottom: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Fase</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Idade</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Fonte de Renda</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Gasto ex-saúde</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Saúde</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeTable.map((row: { fase: string; idade: string; fonte: string; gasto_ex_saude: string; saude: string; obs: string }, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 500 }}>{row.fase}</td>
                      <td style={{ padding: '6px 8px' }}>{row.idade}</td>
                      <td style={{ padding: '6px 8px' }}>{row.fonte}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.gasto_ex_saude}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.saude}</td>
                      <td style={{ padding: '6px 8px', fontSize: '.72rem', color: 'var(--muted)' }}>{row.obs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <IncomeChart data={data} />
          )}
          <div className="src">
            Fases: Go-Go (50–65, alta mobilidade), Slow-Go (65–75, moderado), No-Go (75+, baixa mobilidade). Spending smile aplicado às projeções MC.
          </div>
        </div>
      </CollapsibleSection>

      {/* 6. Projeção de Renda — Ciclo de Vida */}
      <section className="section" id="incomeCycleSection">
        <h2>Projeção de Renda — Ciclo de Vida (2026–2077)</h2>
        <IncomeChart data={data} />
        <div className="src">
          Todos os valores em R$ reais (constante 2026) · Pré-FIRE: renda ativa R$45k/mês · Pós-FIRE: spending smile (Go-Go / Slow-Go / No-Go) · INSS R$18k/ano a partir dos 65.
        </div>
      </section>

      {/* 7. Spending — Essenciais vs Discricionários */}
      {(data.spending ?? data.fire?.spending ?? data.spending_breakdown) && (
        <section className="section" id="spendingBreakdownSection">
          <h2>Spending — Essenciais vs Discricionários <span style={{ fontSize: '.7rem', fontWeight: 400, color: 'var(--muted)' }}>(período ago/2026–mar/2026)</span></h2>
          {(() => {
            const spending = data.spending ?? data.fire?.spending ?? data.spending_breakdown ?? {};
            const essenciais = spending.essenciais_mes ?? spending.must_spend_mensal ?? spending.essenciais ?? 15074;
            const discric = spending.discric_mes ?? spending.like_spend_mensal ?? spending.discricionarios ?? 4284;
            const imprevistos = spending.imprevistos_mes ?? spending.imprevistos_mensal ?? spending.imprevistos ?? 363;
            const total = essenciais + discric + imprevistos;
            const rendaAnual = spending.renda_anual ?? 250000;
            const orcamentoAnual = spending.orcamento_anual ?? 13000;
            const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

            return (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', borderLeft: '3px solid var(--red)' }}>
                    <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Essenciais</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)' }}>{fmt(essenciais)}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '4px' }}>mês · {total > 0 ? Math.round(essenciais / total * 100) : 79}% do total</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '2px' }}>Valor principal: hipoteca (~R$1.317/mês e equity)</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', borderLeft: '3px solid var(--yellow)' }}>
                    <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Discricionários</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--yellow)' }}>{fmt(discric)}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '4px' }}>mês · {total > 0 ? Math.round(discric / total * 100) : 21}% do total</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '2px' }}>Discricionários contínuos</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '14px', borderLeft: '3px solid var(--muted)' }}>
                    <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Imprevistos</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{fmt(imprevistos)}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '4px' }}>mês · {total > 0 ? Math.round(imprevistos / total * 100) : 2}% do total</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '2px' }}>buffer pontual</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{fmt(total)}/mês</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Total financeiro</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{fmt(rendaAnual)}/ano</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Renda FII</div>
                  </div>
                  <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px', textAlign: 'center', borderLeft: '3px solid var(--green)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green)' }}>✓ {fmt(orcamentoAnual)}/ano</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Orçamento conservador</div>
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="src">
            Período: Ago/2026 a Mar/2026 (8 meses) · Ago/2026: cálculo via Notion/Financiera · Mar/2026 a Mar/2026 · Essenciais: linha principal de despesa (R$1.317/mês e equity e hipoteca)
          </div>
        </section>
      )}
    </div>
  );
}
