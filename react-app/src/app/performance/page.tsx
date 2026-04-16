'use client';

import { useEffect, useState } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { TimelineChart } from '@/components/charts/TimelineChart';
import { AttributionChart } from '@/components/charts/AttributionChart';
import { DeltaBarChart } from '@/components/charts/DeltaBarChart';
import { RollingSharpChart } from '@/components/charts/RollingSharpChart';
import { InformationRatioChart } from '@/components/charts/InformationRatioChart';
import { PremisesTable } from '@/components/performance/PremisesTable';
import { MonthlyReturnsHeatmap } from '@/components/dashboard/MonthlyReturnsHeatmap';
import { Button } from '@/components/ui/button';

// Period buttons for timeline
const PERIODS = [
  { key: '6m', label: '6m' },
  { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1y' },
  { key: '3y', label: '3y' },
  { key: '5y', label: '5y' },
  { key: 'all', label: 'All' },
] as const;

type Period = (typeof PERIODS)[number]['key'];

export default function PerformancePage() {
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);
  const [timelinePeriod, setTimelinePeriod] = useState<Period>('all');

  useEffect(() => {
    loadDataOnce().catch(e => console.error('Failed to load data:', e));
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando dados de performance...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>Erro ao carregar performance:</strong> {dataError}
      </div>
    );
  }

  if (!data) {
    return <div className="warning-state">Dados carregados mas seção de performance não disponível</div>;
  }

  return (
    <div>
      {/* 1. Alpha Desde o Início vs SWRD — PRIMEIRA seção (sempre visível) */}
      <section className="section" id="alphaSwrdSection">
        <h2>Alpha Desde o Início vs SWRD (USD) — Performance Relativa</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'flex-start' }}>
          <div>
            <DeltaBarChart data={data} />
          </div>
          {/* Painel lateral direito com métricas IPCA+ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>
                IPCA+ Longo — Progressão vs Alvo 19%
              </div>
              <div style={{ fontSize: '.72rem', lineHeight: 1.6 }}>
                <div>Sep: −8.5pp · DCA ativo · taxa −7.07%</div>
              </div>
            </div>
            <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
                Alpha Líquido pós-haircut
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--muted)' }}>−0.16%/ano</div>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)' }}>McLean & Pontiff 2016 haircut 58%</div>
            </div>
            <div style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
              <div style={{ fontSize: '.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
                IPCA+ taxa vs piso
              </div>
              {data.rf?.ipca2040 && (
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green)' }}>
                    {data.rf.ipca2040.taxa?.toFixed(2)}% e {data.rf.ipca2040.piso_compra?.toFixed(1) ?? '6.0'}%
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                    Atual IPCA+: ativa · DCA ativo
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="src">McLean & Pontiff 2016: haircut 58%</div>
      </section>

      {/* 2. Premissas vs Realizado — 5 Anos (2021-2026) */}
      <section className="section" id="premissasVsRealizadoSection">
        <h2>Premissas vs Realizado — 5 Anos (2021-2026)</h2>
        <PremisesTable />
        <div className="src">
          Fonte: TWR reconstruído (IBKR+RF) · Retornos: pós-IPCA real BRL · Drawdown: histórico carteira · Dados auditados
        </div>
      </section>

      {/* 3. Retornos Mensais — Heatmap (collapsible, open by default) */}
      <CollapsibleSection id="section-heatmap" title="Retornos Mensais — Heatmap" defaultOpen={true}>
        <div style={{ padding: '0 16px 16px' }}>
          <MonthlyReturnsHeatmap data={data.monthly_returns} />
          <div className="src">
            Retornos mensais da carteira. Verde = positivo, vermelho = negativo. Acum. = retorno composto do ano.
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Patrimônio — Evolução Histórica (com period-btns) */}
      <section className="section" id="timelineSection">
        <h2>Patrimônio — Evolução Histórica</h2>
        <div className="period-btns" id="timelinePeriodBtns" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {PERIODS.map(p => (
            <Button
              key={p.key}
              variant={timelinePeriod === p.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimelinePeriod(p.key)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <TimelineChart data={data} />
        <div className="src">
          Aportes cumulativos + Rentabilidade equity USD + Câmbio e RF. Decomposição via TWR.
        </div>
      </section>

      {/* 5. Performance Attribution — Decomposição do Patrimônio */}
      <section className="section" id="attrSection">
        <h2>
          Performance Attribution — Decomposição do Patrimônio{' '}
          <span style={{ fontSize: '.7rem', fontWeight: 400, color: 'var(--muted)' }} id="attrPeriodo"></span>
        </h2>
        <AttributionChart data={data} />
        <div style={{ marginTop: 8, fontSize: '.75rem', background: 'var(--card2)', borderRadius: 6, padding: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }} id="attrAportes">—</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Aportes</div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--green)' }} id="attrRetorno">—</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>Retorno USD</div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--yellow)' }} id="attrCambio">—</div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)' }}>RF + Câmbio</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '.7rem', color: 'var(--muted)', marginTop: 8, padding: 6, background: 'rgba(255,255,255,.04)', borderRadius: 4 }}>
            CAGR inclui aportes mensais —{' '}
            <span title="CAGR inclui aportes mensais — não é retorno puro dos ETFs. Use TWR USD/BRL para avaliar performance real." style={{ cursor: 'help', color: 'var(--accent)' }}>ⓘ</span>
            {' '}não é retorno puro dos ETFs. Use TWR USD/BRL para avaliar performance real.
          </div>
        </div>
        <div className="src">
          Onde está o seu patrimônio hoje: aportes investidos + retorno em USD dos ETFs + RF doméstica e variação cambial. Use TWR para performance pura (sem efeito de aportes).
        </div>
      </section>

      {/* 6. Rolling Sharpe — 12m (collapsible) */}
      <CollapsibleSection id="section-rolling-sharpe" title="Rolling Sharpe — 12m (BRL vs CDI + USD vs T-Bill)" defaultOpen={false}>
        <div style={{ padding: '0 16px 16px' }}>
          <RollingSharpChart data={data} />
          <div className="src" style={{ lineHeight: 1.6 }}>
            <strong>Como ler:</strong> Sharpe mede retorno ajustado ao risco em janela de 12 meses.<br />
            <span style={{ color: 'rgba(34,197,94,.9)' }}>■</span> <strong>&gt;1</strong> = excelente{' '}
            <span style={{ color: 'rgba(234,179,8,.9)' }}>■</span> <strong>0–1</strong> = neutro{' '}
            <span style={{ color: 'rgba(239,68,68,.9)' }}>■</span> <strong>&lt;0</strong> = negativo (CDI venceu a carteira no período)
          </div>
        </div>
      </CollapsibleSection>

      {/* 7. Rolling 12m — AVGS vs SWRD (collapsible, open) */}
      <CollapsibleSection id="section-factor-rolling" title="Rolling 12m — AVGS vs SWRD (retorno relativo)" defaultOpen={true}>
        <div style={{ padding: '0 16px 16px' }}>
          {/* DeltaBarChart used as proxy — dedicated FactorRollingChart would be ideal */}
          <DeltaBarChart data={data} title="AVGS vs SWRD — Retorno Relativo (Rolling 12m)" />
          <div className="src">
            Linha vermelha = threshold −5pp (gatilho de revisão da tese fatorial). Janela: 12 meses.
          </div>
        </div>
      </CollapsibleSection>

      {/* 8. Fee Analysis — Custo de Complexidade (details/summary collapsible) */}
      <section className="section" id="feeAnalysisSection">
        <details>
          <summary style={{ cursor: 'pointer', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', padding: '4px 0', listStyle: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '.85em', color: 'var(--muted)' }}>▶</span>
            Fee Analysis — Custo de Complexidade (14 anos até FIRE)
          </summary>
          <div style={{ marginTop: 12 }}>
            <div style={{ overflowX: 'auto' }}>
              <table id="feeTable" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Portfolio</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>TER</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Custo 14a</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Alpha 14a</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>Net vs VWRA</th>
                  </tr>
                </thead>
                <tbody id="feeBody">
                  {data.fee_analysis?.portfolios?.map((row: { name: string; ter: number; custo_14a: string; alpha_14a: string; net_vs_vwra: string }, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '6px 8px' }}>{row.name}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.ter != null ? `${(row.ter * 100).toFixed(2)}%` : '—'}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.custo_14a ?? '—'}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.alpha_14a ?? '—'}</td>
                      <td style={{ textAlign: 'right', padding: '6px 8px' }}>{row.net_vs_vwra ?? '—'}</td>
                    </tr>
                  )) ?? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: 12, color: 'var(--muted)' }}>Sem dados de fee analysis</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="src">
              TER × patrimônio médio projetado × 14 anos · Alpha: +0.16%/ano (McLean &amp; Pontiff 58% haircut) · Net = Alpha − custo extra vs VWRA
            </div>
          </div>
        </details>
      </section>

      {/* 9. Information Ratio vs VWRA (collapsible) */}
      <CollapsibleSection id="section-ir" title="Information Ratio vs VWRA — Desde o Início + Rolling 36m" defaultOpen={false}>
        <div style={{ padding: '0 16px 16px' }}>
          <InformationRatioChart data={data} />
          <div className="src" style={{ lineHeight: 1.6 }}>
            <strong>Como ler:</strong> IR = Active Return / Tracking Error (janela 36m).<br />
            <span style={{ color: 'rgba(34,197,94,.9)' }}>■</span> <strong>&gt;0</strong> = supera VWRA{' '}
            <span style={{ color: 'rgba(239,68,68,.9)' }}>■</span> <strong>&lt;0</strong> = underperformance
          </div>
        </div>
      </CollapsibleSection>

      {/* 10. Factor Loadings — Regressão Fama-French SF + Momentum (collapsible) */}
      <CollapsibleSection id="section-factor-loadings" title="Factor Loadings — Regressão Fama-French SF + Momentum" defaultOpen={false}>
        <div style={{ padding: '0 16px 16px' }}>
          {/* Mostrar tabs de ETF */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {['AVDV', 'AVUV', 'DGS', 'EIMI', 'AVGS', 'SWRD', 'USCC'].map(etf => (
              <span key={etf} style={{
                background: 'var(--card2)',
                borderRadius: 'var(--radius-xs)',
                padding: '3px 8px',
                fontSize: '.65rem',
                fontWeight: 600,
                color: 'var(--accent)',
              }}>
                {etf}
              </span>
            ))}
          </div>
          {/* Legenda dos fatores */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)' }}>Fator</th>
                  {['AVDV', 'AVUV', 'DGS', 'EIMI', 'AVGS', 'SWRD', 'USCC'].map(etf => (
                    <th key={etf} style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--accent)' }}>{etf}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Mkt-RF', 'SMB', 'HML', 'RMW', 'CMA', 'Mom'].map(factor => (
                  <tr key={factor} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{factor}</td>
                    {['AVDV', 'AVUV', 'DGS', 'EIMI', 'AVGS', 'SWRD', 'USCC'].map(etf => {
                      const loading = data.factor_loadings?.[etf]?.[factor] ?? data.backtest?.factor_loadings?.[etf]?.[factor];
                      return (
                        <td key={etf} style={{
                          textAlign: 'right',
                          padding: '6px 8px',
                          color: loading != null ? (loading > 0.3 ? 'var(--green)' : loading < -0.1 ? 'var(--red)' : 'var(--text)') : 'var(--muted)',
                        }}>
                          {loading != null ? loading.toFixed(2) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="src">
            Regressão FF5+Mom · Barra sólida = significativa (90%+) · Barra espaçada = não significativa.<br />
            ⓘ P&lt;0.05: mesmos FF5 EM aplica mol solo ETF (formação para Elo e 4.5C globais)
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
