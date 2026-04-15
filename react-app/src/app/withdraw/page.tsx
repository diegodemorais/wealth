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

  const swrPercentis = data.fire?.swr_percentis ?? data.swr_percentis;
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
        <section className="section" id="swrPercentilesSection">
          <h2>SWR no FIRE Day — Percentis P10 / P50 / P90</h2>
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
        </section>
      )}

      {/* 3. Guardrails de Retirada — FIRE Day (collapsible) */}
      {data.guardrails_retirada && (
        <CollapsibleSection id="section-guardrails-table" title="Guardrails de Retirada — FIRE Day" defaultOpen={false}>
          <div style={{ padding: '0 16px 16px' }}>
            <GuardrailsRetirada guardrails={data.guardrails_retirada} />
            <div style={{ marginTop: 10, fontSize: '.75rem', background: 'rgba(34,197,94,.07)', borderRadius: 6, padding: 8, borderLeft: '3px solid var(--green)' }}>
              <strong>Upside:</strong> se portfolio sobe 25%+ acima do pico real → aumentar retirada 10% permanente (teto R$350k)
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 4. Spending Guardrails — P(FIRE) × Custo de Vida (collapsible) */}
      <CollapsibleSection id="section-spending-guardrails" title="Spending Guardrails — P(FIRE) × Custo de Vida" defaultOpen={false}>
        <div style={{ padding: '0 16px 16px' }}>
          <GuardrailsChart data={data} />
          <div className="src">
            Base: Monte Carlo 10k · Interpolação linear entre pontos simulados
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. Renda na Aposentadoria — Fases Temporais (collapsible) */}
      <CollapsibleSection id="section-income-phases" title="Renda na Aposentadoria — Fases Temporais" defaultOpen={false}>
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
    </div>
  );
}
