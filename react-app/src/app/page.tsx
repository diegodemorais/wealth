'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { KpiHero } from '@/components/primitives/KpiHero';
import SemaforoGatilhos from '@/components/dashboard/SemaforoGatilhos';
import FireProgressWellness from '@/components/dashboard/FireProgressWellness';
import AporteDoMes from '@/components/dashboard/AporteDoMes';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { useWellnessScore } from '@/hooks/useWellnessScore';

export default function HomePage() {
  // Portfolio dashboard - main entry point
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  // Wellness score — hook must be called unconditionally at top level
  const wellnessScore = useWellnessScore(data, derived);

  useEffect(() => {
    loadDataOnce().catch(e => {
      console.error('NOW page: Failed to load data:', e);
    });
  }, [loadDataOnce]);

  if (isLoading || (!data && !dataError)) {
    return <div className="loading-state">⏳ Carregando dados...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Erro ao carregar dashboard:</strong> {dataError}
      </div>
    );
  }

  if (!data || !derived) {
    return <div className="loading-state">⏳ Carregando...</div>;
  }

  // Get IPCA and Renda+ semaforo status from derived
  const ipcaTaxa = data?.rf?.ipca2040?.taxa;
  const rendaTaxa = data?.rf?.renda2065?.taxa;

  // Determine semaforo colors based on taxa levels
  const getIpcaSemaforoColor = (taxa: number | undefined) => {
    if (!taxa) return 'var(--muted)';
    if (taxa >= 7.5) return 'var(--green)';
    if (taxa >= 6.5) return 'var(--yellow)';
    return 'var(--red)';
  };

  const getRendaSemaforoColor = (taxa: number | undefined) => {
    if (!taxa) return 'var(--muted)';
    if (taxa >= 7.5) return 'var(--green)';
    if (taxa >= 6.5) return 'var(--yellow)';
    return 'var(--red)';
  };

  return (
    <div>
      {/* 1. HERO STRIP — Patrimônio Total | Anos até FIRE | Progresso FIRE */}
      <KpiHero
        networth={derived.networth}
        networthUsd={derived.networthUsd}
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
        pfire={derived.pfire}
        cambio={derived.CAMBIO}
        fireYearBase={(data as any)?.fire_matrix?.by_profile?.[0]?.fire_age_53 ? parseInt((data as any).fire_matrix.by_profile[0].fire_age_53) : undefined}
        fireAgeBase={(data as any)?.premissas?.idade_cenario_base}
        fireYearAspir={(data as any)?.earliest_fire?.ano}
        fireAgeAspir={(data as any)?.earliest_fire?.idade}
        firePatrimonioGatilho={derived.firePatrimonioGatilho}
      />

      {/* 3. KPI GRID: Contexto de Mercado — Dólar, Bitcoin, IPCA+ 2040, Renda+ 2065 */}
      <div className="kpi-label mb-1.5" style={{ textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Contexto de Mercado</div>
      <div className="rf-grid mb-3.5" style={{ opacity: 0.85 }}>
        {/* Dólar */}
        <div className="kpi text-center">
          <div className="kpi-label">Dólar</div>
          <div className="kpi-value" style={{ fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>{derived.CAMBIO ? `R$ ${derived.CAMBIO.toFixed(2)}` : '—'}</div>
          <div className="kpi-sub">
            {data?.mercado?.cambio_mtd_pct != null
              ? `${data.mercado.cambio_mtd_pct > 0 ? '+' : ''}${data.mercado.cambio_mtd_pct.toFixed(1)}% MtD · PTAX BCB`
              : 'BRL/USD · PTAX BCB'}
          </div>
        </div>
        {/* Bitcoin */}
        <div className="kpi text-center">
          <div className="kpi-label">Bitcoin</div>
          <div className="kpi-value" style={{ fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>
            {data?.mercado?.btc_usd
              ? `$${Number(data.mercado.btc_usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              : '—'}
          </div>
          <div className="kpi-sub">
            {data?.mercado?.btc_mtd_pct != null
              ? `${data.mercado.btc_mtd_pct > 0 ? '+' : ''}${data.mercado.btc_mtd_pct.toFixed(1)}% MtD`
              : 'BTC/USD'}
          </div>
        </div>
        {/* IPCA+ 2040 */}
        <div className="kpi text-center">
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            IPCA+ 2040 — Taxa
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: getIpcaSemaforoColor(ipcaTaxa),
              }}
            />
          </div>
          <div className="kpi-value" style={{ fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>{ipcaTaxa ? `${ipcaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="kpi-sub">
            {data?.rf?.ipca2040?.descricao || 'Tesouro IPCA+ 2040'}
          </div>
        </div>
        {/* Renda+ 2065 */}
        <div className="kpi text-center">
          <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            Renda+ 2065 — Taxa
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: getRendaSemaforoColor(rendaTaxa),
              }}
            />
          </div>
          <div className="kpi-value" style={{ fontSize: '1.1rem', fontVariantNumeric: 'tabular-nums' }}>{rendaTaxa ? `${rendaTaxa.toFixed(2)}%` : '—'}</div>
          <div className="kpi-sub">
            {data?.rf?.renda2065?.descricao || 'Tesouro Renda+ 2065'}
          </div>
        </div>
      </div>

      {/* 4. SEÇÃO: Time to FIRE — Big number + Progresso */}
      <TimeToFireProgressBar
        fireProgress={derived.firePercentage}
        yearsToFire={derived.fireMonthsAway / 12}
        patrimonioAtual={derived.firePatrimonioAtual}
        patrimonioGatilho={derived.firePatrimonioGatilho}
      />

      {/* 4a. Family Scenarios row abaixo do Time to FIRE */}
      {data?.fire_matrix?.by_profile && Array.isArray(data.fire_matrix.by_profile) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
          {data.fire_matrix.by_profile.map((profile: any, i: number) => {
            const fallbackLabels = ['Solteiro', 'Casado', 'C+Filho'];
            const displayLabel = profile.label ?? fallbackLabels[i] ?? `Perfil ${i + 1}`;
            const pfireBase53 = profile.p_fire_53 ?? null;
            const pfireBase50 = profile.p_fire_50 ?? null;
            const pfire = pfireBase53 ?? pfireBase50;
            const fireYear = profile.fire_age_53 ?? profile.fire_age_50 ?? '2040';
            const fireAge = 53;
            const patMediano = profile.pat_mediano_53 ?? profile.pat_mediano_50 ?? null;
            const gastoAnual = profile.gasto_anual ?? null;
            const fmtM = (v: number) => v >= 1_000_000 ? `R$${(v/1_000_000).toFixed(1)}M` : `R$${Math.round(v/1000)}k`;
            return (
              <div key={i} style={{ background: 'var(--card2)', borderRadius: 'var(--radius-md)', padding: '10px', textAlign: 'center', borderTop: '2px solid rgba(88,166,255,0.3)' }}>
                <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>
                  {displayLabel}
                </div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--accent)' }}>FIRE {fireAge}</div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--green)', marginTop: '2px' }}>
                  P = {pfire != null ? `${pfire.toFixed(1)}%` : '—'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>{fireYear}</div>
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--muted)' }}>Patrimônio</span>
                    <span style={{ fontWeight: 600 }}>{patMediano != null ? fmtM(patMediano) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--muted)' }}>Custo/ano</span>
                    <span style={{ fontWeight: 600 }}>{gastoAnual != null ? fmtM(gastoAnual) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--muted)' }}>SWR</span>
                    <span style={{ fontWeight: 600 }}>
                      {gastoAnual != null && patMediano != null && patMediano > 0
                        ? `${((gastoAnual / patMediano) * 100).toFixed(2)}%`
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. SEÇÃO: Semáforos de Gatilhos [COLLAPSIBLE, CRITICAL] */}
      {derived && Array.isArray(derived.dcaItems) && derived.dcaItems.length > 0 && (
        <SemaforoGatilhos items={derived.dcaItems} />
      )}

      {/* 6. GRID 2-COL: Progresso FIRE + Aporte do Mês */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FireProgressWellness
          firePercentage={derived.firePercentage}
          firePatrimonioAtual={derived.firePatrimonioAtual}
          firePatrimonioGatilho={derived.firePatrimonioGatilho}
          swrFireDay={derived.swrFireDay}
          wellnessScore={derived.wellnessScore * 100}
          wellnessLabel={derived.wellnessLabel}
          wellnessMetrics={derived.wellnessMetrics}
        />
        {derived && (
          <AporteDoMes
            aporteMensal={derived.aporteMensal}
            ultimoAporte={derived.ultimoAporte}
            ultimoAporteData={derived.ultimoAporteData}
            acumuladoMes={derived.acumuladoMes}
            acumuladoAno={derived.acumuladoAno}
          />
        )}
      </div>

      {/* 6a. Financial Wellness Score — full width [COLLAPSIBLE, OPEN] */}
      {wellnessScore && (
        <CollapsibleSection id="section-wellness" title="Financial Wellness Score (indicador secundário)" defaultOpen={true} icon="🏆">
          {(() => {
            const { totalScore, allMetrics, badMetrics, goodMetrics, topAcoes, actionDescriptions } = wellnessScore;

            const renderBar = (pts: number, max: number) => {
              const ratio = pts / max;
              const bg = ratio >= 0.85 ? 'var(--green)' : ratio >= 0.5 ? 'var(--yellow)' : 'var(--red)';
              return (
                <div className="flex-1 bg-card2/40 rounded-sm h-1.5 relative overflow-hidden min-w-16">
                  <div className="h-full rounded-sm" style={{ width: `${(pts / max) * 100}%`, background: bg }} />
                </div>
              );
            };

            const renderMetricRow = (m: typeof allMetrics[0]) => (
              <div key={m.id} className="flex items-center gap-2 mb-1.5">
                <div className="text-xs w-4 flex-shrink-0">{m.isOk ? '✅' : '⚠️'}</div>
                <div className="text-xs text-muted w-36 flex-shrink-0 truncate">{m.label}</div>
                {renderBar(m.pts, m.max)}
                <div className="text-xs text-muted w-14 flex-shrink-0 text-right">{m.detail}</div>
                <div className="text-xs text-muted w-10 flex-shrink-0 text-right">{m.pts}/{m.max}</div>
              </div>
            );

            return (
              <div className="px-4 pb-4">
                <div className="flex gap-5 items-start">
                  {/* Score grande */}
                  <div className="min-w-28 text-center flex-shrink-0">
                    <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">Score</div>
                    <div className="text-5xl font-black text-green leading-none">{totalScore}</div>
                    <div className="text-xs text-muted mt-1">/100 · Progressivo</div>
                  </div>
                  {/* Métricas divididas em duas categorias */}
                  <div className="flex-1 min-w-0">
                    {badMetrics.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--yellow)' }}>⚠ OPORTUNIDADE DE MELHORIA</div>
                        {badMetrics.map(renderMetricRow)}
                      </div>
                    )}
                    {goodMetrics.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-green mb-1.5">✓ SEM AÇÃO NECESSÁRIA</div>
                        {goodMetrics.map(renderMetricRow)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Ações */}
                {topAcoes.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">Top Ações para Subir o Score</div>
                    <div className="flex flex-col gap-2">
                      {topAcoes.map((m, i) => {
                        const gap = m.max - m.pts;
                        return (
                          <div key={m.id} className="bg-card2/20 rounded px-3 py-2">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-muted">{i + 1}.</span>
                              <span className="text-xs font-semibold text-text">{m.label}</span>
                              <span className="text-xs" style={{ color: 'var(--accent)' }}>(+{gap}pts potencial)</span>
                            </div>
                            <div className="text-xs text-muted mt-0.5">{actionDescriptions[m.id] ?? m.description.slice(0, 80)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </CollapsibleSection>
      )}

      {/* 7. SEÇÃO: P(FIRE) — Monte Carlo + Tornado */}
      {derived && (
        <PFireMonteCarloTornado
          pfireBase={derived.pfireBase}
          pfireFav={derived.pfireFav}
          pfireStress={derived.pfireStress}
          tornadoData={derived.tornadoData}
          firePatrimonioAtual={derived.firePatrimonioAtual}
          firePatrimonioGatilho={derived.firePatrimonioGatilho}
        />
      )}

      {/* 8. SEÇÃO: Contexto Macro & DCA Status [COLLAPSIBLE, OPEN] */}
      <CollapsibleSection id="section-macro" title="Contexto Macro & DCA Status" defaultOpen={true} icon="📊">
        <div className="px-4 pb-4">
          {/* 8a. Exposição Brasil — Tabela detalhada */}
          <div className="mb-3.5">
            <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">
              Exposição Brasil
            </div>
            <div className="bg-card2/40 rounded p-3 mb-2">
              <div className="flex justify-between mb-2">
                <div>
                  <div className="text-xs text-muted">Total Brasil</div>
                  <div className="text-lg font-bold text-green mt-0.5">
                    {derived.concentrationBrazil != null ? `${(derived.concentrationBrazil * 100).toFixed(1)}%` : '—'}
                  </div>
                </div>
                <div className="text-sm text-muted text-right">
                  <div>HODL11: R${((data?.hodl11?.valor_brl ?? 0) / 1000).toFixed(0)}k</div>
                  <div>RF Total: R${((derived.rfBrl ?? 0) / 1000).toFixed(0)}k</div>
                </div>
              </div>
            </div>
          </div>

          {/* 8b. DCA Status — loop via unified derived.dcaItems (RF only; crypto excluded) */}
          {derived && derived.dcaItems.filter(i => i.categoria !== 'crypto').length > 0 && (
            <div className="mb-3.5">
              <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">
                DCA Status
              </div>
              <div className="grid grid-cols-3 gap-2">
                {derived.dcaItems
                  .filter(i => i.categoria !== 'crypto')
                  .map(item => {
                    const ref = item.pisoVenda ?? item.pisoCompra;
                    const gap = item.gapPiso;
                    const borderColor =
                      item.id === 'ipca2040' ? 'rgba(6,182,212,0.4)' :
                      item.id === 'ipca2050' ? 'rgba(139,92,246,0.4)' :
                      'rgba(245,158,11,0.4)';
                    return (
                      <div key={item.id} className="bg-card2/40 rounded p-2.5" style={{ borderLeft: `3px solid ${borderColor}` }}>
                        <div className="text-xs text-muted mb-1">{item.nome}</div>
                        {item.taxa != null && (
                          <div className="text-sm font-bold mb-0.5">Taxa: {item.taxa.toFixed(2)}%</div>
                        )}
                        <div className="text-xs text-muted">
                          {ref != null && `Piso: ${ref.toFixed(1)}%`}
                          {gap != null && ` | Gap: ${gap >= 0 ? '+' : ''}${gap.toFixed(2)}pp`}
                        </div>
                        <div className="text-xs text-muted">
                          Posição: R${(item.posicaoBrl / 1000).toFixed(0)}k
                          {item.pctCarteira != null && ` (${item.pctCarteira.toFixed(1)}%)`}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Macro strip — Selic, Fed, Spread, Exposição cambial only (USD/BRL e BTC estão em Contexto de Mercado acima) */}
          <div className="mb-3.5">
            <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">
              Indicadores Macro
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card2/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.selic_meta != null ? `${(data.macro.selic_meta as number).toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Selic Meta</div>
              </div>
              <div className="bg-card2/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.fed_funds != null ? `${(data.macro.fed_funds as number).toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Fed Funds</div>
              </div>
              <div className="bg-card2/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.spread_selic_ff != null ? `${(data.macro.spread_selic_ff as number).toFixed(2)}pp` : '—'}</div>
                <div className="text-xs text-muted mt-1">Spread Selic-FF</div>
              </div>
              <div className="bg-card2/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.exposicao_cambial_pct != null ? `${(data.macro.exposicao_cambial_pct as number).toFixed(1)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Exp. Cambial</div>
              </div>
            </div>
            {data?._generated_brt && (
              <div className="text-xs text-muted mt-1.5">
                Atualizado: {data._generated_brt as string}
              </div>
            )}
          </div>

          <div className="text-xs text-muted mb-0">
            Fonte: BCB / FRED · Nubank · IBKR · Premissa de depreciação BRL usada em projeções FIRE
          </div>
        </div>
      </CollapsibleSection>

      {/* 9. SEÇÃO: Sankey — Fluxo de Caixa [COLLAPSIBLE, OPEN] */}
      <CollapsibleSection id="section-sankey" title="Sankey — Fluxo de Caixa Anual (estimado)" defaultOpen={true} icon="💸">
        <div style={{ padding: '0 16px 16px' }}>
          <CashFlowSankey />
        </div>
      </CollapsibleSection>
    </div>
  );
}
