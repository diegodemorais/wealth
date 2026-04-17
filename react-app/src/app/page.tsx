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

export default function HomePage() {
  // Portfolio dashboard - main entry point
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);

  useEffect(() => {
    loadDataOnce().catch(e => {
      console.error('NOW page: Failed to load data:', e);
    });
  }, [loadDataOnce]);

  if (isLoading) {
    return <div className="loading-state">⏳ Carregando dados...</div>;
  }

  if (dataError) {
    return (
      <div className="error-state">
        <strong>❌ Erro ao carregar dashboard:</strong> {dataError}
      </div>
    );
  }

  if (!derived) {
    return <div className="warning-state">⚠️ Dados carregados mas valores derivados não computados</div>;
  }

  // Compute max drift
  const maxDrift = data?.drift
    ? Math.max(0, ...Object.values(data.drift as Record<string, any>).map(d => Math.abs((d?.atual || 0) - (d?.alvo || 0))))
    : 0;

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
          <div className="kpi-value" style={{ fontSize: '1.1rem' }}>{derived.CAMBIO ? `R$ ${derived.CAMBIO.toFixed(2)}` : '—'}</div>
          <div className="kpi-sub">
            {data?.mercado?.cambio_mtd_pct != null
              ? `${data.mercado.cambio_mtd_pct > 0 ? '+' : ''}${data.mercado.cambio_mtd_pct.toFixed(1)}% MtD · PTAX BCB`
              : 'BRL/USD · PTAX BCB'}
          </div>
        </div>
        {/* Bitcoin */}
        <div className="kpi text-center">
          <div className="kpi-label">Bitcoin</div>
          <div className="kpi-value" style={{ fontSize: '1.1rem' }}>
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
          <div className="kpi-value" style={{ fontSize: '1.1rem' }}>{ipcaTaxa ? `${ipcaTaxa.toFixed(2)}%` : '—'}</div>
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
          <div className="kpi-value" style={{ fontSize: '1.1rem' }}>{rendaTaxa ? `${rendaTaxa.toFixed(2)}%` : '—'}</div>
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
                <div style={{ fontSize: '.6rem', textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--muted)', marginBottom: '4px', fontWeight: 600 }}>
                  {displayLabel}
                </div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--accent)' }}>FIRE {fireAge}</div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--green)', marginTop: '2px' }}>
                  P = {pfire != null ? `${pfire.toFixed(1)}%` : '—'}
                </div>
                <div style={{ fontSize: '.6rem', color: 'var(--muted)', marginTop: '4px' }}>{fireYear}</div>
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Patrimônio</span>
                    <span style={{ fontWeight: 600 }}>{patMediano != null ? fmtM(patMediano) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Custo/ano</span>
                    <span style={{ fontWeight: 600 }}>{gastoAnual != null ? fmtM(gastoAnual) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem' }}>
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
      {derived && Array.isArray(derived.gatilhos) && derived.gatilhos.length > 0 && (
        <SemaforoGatilhos
          gatilhos={derived.gatilhos}
          resumo={derived.resumoGatilhos}
          statusIpca={derived.statusIpca}
        />
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
      {data?.wellness_config?.metrics && (
        <CollapsibleSection id="section-wellness" title="Financial Wellness Score (indicador secundário)" defaultOpen={true} icon="🏆">
          {(() => {
            // Compute each metric's points using wellness_config thresholds
            const wc = data.wellness_config;
            const pfireBaseVal = derived.pfireBase; // 0-100
            const aporteMensalVal = data.premissas?.aporte_mensal ?? 0;
            const custoVidaBase = data.premissas?.custo_vida_base ?? 0;
            const custoMensal = custoVidaBase / 12;
            const savingsRate = aporteMensalVal > 0 ? (aporteMensalVal / (aporteMensalVal + custoMensal)) * 100 : 0;
            const maxDriftVal = data?.drift
              ? Math.max(0, ...Object.entries(data.drift as Record<string, any>)
                  .filter(([k]) => k !== 'Custo')
                  .map(([, d]) => Math.abs((d?.atual || 0) - (d?.alvo || 0))))
              : 0;
            const ipcaGapPp = data.dca_status?.ipca_longo?.gap_alvo_pp ?? null;
            const dcaAtivo = data.dca_status?.ipca_longo?.ativo ?? false;
            const terAtual = data.drift?.['Custo']?.atual ?? (data.wellness_config?.metrics?.find((m: any) => m.id === 'ter')?.current_ter ?? 0.247);
            const humanCapitalStatus = data.wellness_config?.metrics?.find((m: any) => m.id === 'human_capital')?.status ?? 'solteiro_sem_dependentes';

            // Compute pfire pts
            const pfirePts = (() => {
              const thresholds = wc.metrics.find((m: any) => m.id === 'pfire')?.thresholds ?? [];
              for (const t of thresholds) {
                if (pfireBaseVal >= t.min) return t.pts;
              }
              return 0;
            })();

            // Compute savings_rate pts
            const savingsRatePts = (() => {
              const thresholds = wc.metrics.find((m: any) => m.id === 'savings_rate')?.thresholds ?? [];
              for (const t of thresholds) {
                if (savingsRate >= t.min_pct) return t.pts;
              }
              return 0;
            })();

            // Compute drift pts
            const driftPts = (() => {
              const thresholds = wc.metrics.find((m: any) => m.id === 'drift')?.thresholds ?? [];
              for (const t of thresholds) {
                if (maxDriftVal <= t.max_pp) return t.pts;
              }
              return 0;
            })();

            // Compute ipca_gap pts
            const ipcaGapPts = (() => {
              if (ipcaGapPp == null) return 5; // neutral fallback
              const thresholds = wc.metrics.find((m: any) => m.id === 'ipca_gap')?.thresholds ?? [];
              for (const t of thresholds) {
                if (ipcaGapPp <= t.max_pp) {
                  return t.pts ?? (dcaAtivo ? (t.pts_if_dca ?? t.pts ?? 5) : (t.pts ?? 3));
                }
              }
              return dcaAtivo ? 5 : 3;
            })();

            // execution_fidelity — use 7pts (neutral) if data insufficient
            const execPts = 7;

            // emergency_fund — IPCA+ 2029 as liquid reserve
            const emergencyPts = (() => {
              const reservaBrl = data.rf?.ipca2029?.valor ?? 0;
              const months = custoMensal > 0 ? reservaBrl / custoMensal : 0;
              const thresholds = wc.metrics.find((m: any) => m.id === 'emergency_fund')?.thresholds ?? [];
              for (const t of thresholds) {
                if (months >= t.min_months) return t.pts;
              }
              return 0;
            })();

            // ter pts — compare current_ter to benchmark_ter
            const terPts = (() => {
              const terCfg = wc.metrics.find((m: any) => m.id === 'ter');
              const benchmarkTer = terCfg?.benchmark_ter ?? 0.22;
              const currentTer = terCfg?.current_ter ?? terAtual;
              const delta = currentTer - benchmarkTer;
              const thresholds = terCfg?.thresholds ?? [];
              for (const t of thresholds) {
                if (delta <= t.max_delta_pp) return t.pts;
              }
              return 0;
            })();

            // human_capital pts
            const humanPts = (() => {
              const thresholds = wc.metrics.find((m: any) => m.id === 'human_capital')?.thresholds ?? [];
              const match = thresholds.find((t: any) => t.status === humanCapitalStatus);
              return match ? match.pts : 5;
            })();

            const allMetrics = [
              { id: 'pfire', label: 'P(FIRE) base', pts: pfirePts, max: 35, detail: `${pfireBaseVal.toFixed(1)}%`, description: wc.metrics.find((m: any) => m.id === 'pfire')?.description ?? '' },
              { id: 'savings_rate', label: 'Savings rate', pts: savingsRatePts, max: 15, detail: `${savingsRate.toFixed(1)}%`, description: wc.metrics.find((m: any) => m.id === 'savings_rate')?.description ?? '' },
              { id: 'drift', label: 'Drift máximo', pts: driftPts, max: 15, detail: `${maxDriftVal.toFixed(1)}pp`, description: wc.metrics.find((m: any) => m.id === 'drift')?.description ?? '' },
              { id: 'ipca_gap', label: 'IPCA+ gap vs alvo', pts: ipcaGapPts, max: 10, detail: ipcaGapPp != null ? `${ipcaGapPp.toFixed(1)}pp` : 'n/d', description: wc.metrics.find((m: any) => m.id === 'ipca_gap')?.description ?? '' },
              { id: 'execution_fidelity', label: 'Exec. aportes', pts: execPts, max: 10, detail: 'dados insuf.', description: wc.metrics.find((m: any) => m.id === 'execution_fidelity')?.description ?? '' },
              { id: 'emergency_fund', label: 'Fundo emergência', pts: emergencyPts, max: 5, detail: `${(data.rf?.ipca2029?.valor ?? 0) > 0 ? ((data.rf.ipca2029.valor / custoMensal)).toFixed(1) : '?'}m`, description: wc.metrics.find((m: any) => m.id === 'emergency_fund')?.description ?? '' },
              { id: 'ter', label: 'TER vs VWRA', pts: terPts, max: 5, detail: (() => { const terCfg = wc.metrics.find((m: any) => m.id === 'ter'); const delta = (terCfg?.current_ter ?? terAtual) - (terCfg?.benchmark_ter ?? 0.22); return `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}bp`; })(), description: wc.metrics.find((m: any) => m.id === 'ter')?.description ?? '' },
              { id: 'human_capital', label: 'Capital humano', pts: humanPts, max: 5, detail: humanCapitalStatus.replace('_', ' '), description: wc.metrics.find((m: any) => m.id === 'human_capital')?.description ?? '' },
            ].map(m => ({ ...m, isOk: m.pts / m.max >= 0.85 }));

            const totalScore = allMetrics.reduce((sum, m) => sum + m.pts, 0);
            const badMetrics = allMetrics.filter(m => !m.isOk);
            const goodMetrics = allMetrics.filter(m => m.isOk);

            const actionDescriptions: Record<string, string> = {
              pfire: 'Aumentar aporte mensal ou aguardar crescimento patrimonial',
              drift: 'Rebalancear bucket mais distante do alvo no próximo aporte',
              ipca_gap: 'Continuar DCA em IPCA+ até atingir alvo de alocação',
              savings_rate: 'Aumentar aporte ou reduzir custo de vida',
              execution_fidelity: 'Manter consistência nos aportes mensais',
              emergency_fund: 'Aumentar reserva líquida para 6+ meses de custo de vida',
              ter: 'Migrar gradualmente para ETFs de menor custo',
              human_capital: 'Contratar seguro de vida ao casar ou ter dependentes',
            };

            const topAcoes = [...allMetrics]
              .filter(m => !m.isOk)
              .sort((a, b) => (b.max - b.pts) - (a.max - a.pts))
              .slice(0, 3);

            const renderBar = (pts: number, max: number) => {
              const ratio = pts / max;
              const bg = ratio >= 0.85 ? 'var(--green)' : ratio >= 0.5 ? 'var(--yellow)' : 'var(--red)';
              return (
                <div className="flex-1 bg-slate-700/40 rounded-sm h-1.5 relative overflow-hidden min-w-16">
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
                          <div key={m.id} className="bg-slate-700/20 rounded px-3 py-2">
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
            <div className="bg-slate-700/40 rounded p-3 mb-2">
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

          {/* 8b. DCA Status — 3 cards separados */}
          {data?.dca_status && (
            <div className="mb-3.5">
              <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">
                DCA Status
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* IPCA+ 2040 */}
                {data.dca_status.ipca_longo && (
                  <div className="bg-slate-700/40 rounded p-2.5 border-l-3 border-accent/40">
                    <div className="text-xs text-muted mb-1">IPCA+ 2040</div>
                    <div className="text-sm font-bold mb-0.5">Taxa: {data.dca_status.ipca_longo.taxa_atual?.toFixed(2)}%</div>
                    <div className="text-xs text-muted">
                      Piso: {data.dca_status.ipca_longo.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca_longo.gap_alvo_pp?.toFixed(1)}pp
                    </div>
                    <div className="text-xs text-muted">
                      Posição: R${((data.rf?.ipca2040?.valor ?? 0) / 1000).toFixed(0)}k ({data.dca_status.ipca_longo.pct_carteira_atual?.toFixed(1)}%)
                    </div>
                  </div>
                )}
                {/* IPCA+ 2060 (2050) */}
                {data.dca_status.ipca_medio && (
                  <div className="bg-slate-700/40 rounded p-2.5 border-l-3 border-accent/40">
                    <div className="text-xs text-muted mb-1">IPCA+ 2050</div>
                    <div className="text-sm font-bold mb-0.5">Taxa: {data.dca_status.ipca_medio.taxa_atual?.toFixed(2)}%</div>
                    <div className="text-xs text-muted">
                      Piso: {data.dca_status.ipca_medio.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca_medio.gap_alvo_pp?.toFixed(1)}pp
                    </div>
                    <div className="text-xs text-muted">
                      Posição: R${((data.rf?.ipca2050?.valor ?? 0) / 1000).toFixed(0)}k ({data.dca_status.ipca_medio.pct_carteira_atual?.toFixed(1)}%)
                    </div>
                  </div>
                )}
                {/* Renda+ 2065 */}
                {data.rf?.renda2065?.distancia_gatilho && (
                  <div className="bg-slate-700/40 rounded p-2.5 border-l-3 border-accent/40">
                    <div className="text-xs text-muted mb-1">Renda+ 2065</div>
                    <div className="text-sm font-bold mb-0.5">Taxa: {data.rf.renda2065.distancia_gatilho.taxa_atual?.toFixed(2)}%</div>
                    <div className="text-xs text-muted">
                      Piso venda: {data.rf.renda2065.distancia_gatilho.piso_venda?.toFixed(1)}% | Gap: {data.rf.renda2065.distancia_gatilho.gap_pp?.toFixed(2)}pp
                    </div>
                    <div className="text-xs text-muted">
                      Posição: R${((data.rf?.renda2065?.valor ?? 0) / 1000).toFixed(0)}k
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Macro strip */}
          <div className="mb-3.5">
            <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">
              Indicadores Macro
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.selic_meta != null ? `${(data.macro.selic_meta as number).toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Selic Meta</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.fed_funds != null ? `${(data.macro.fed_funds as number).toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Fed Funds</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.cambio != null ? `R$ ${(data.macro.cambio as number).toFixed(2)}` : (derived.CAMBIO ? `R$ ${derived.CAMBIO.toFixed(2)}` : '—')}</div>
                <div className="text-xs text-muted mt-1">USD/BRL</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.spread_selic_ff != null ? `${(data.macro.spread_selic_ff as number).toFixed(2)}pp` : '—'}</div>
                <div className="text-xs text-muted mt-1">Spread Selic-FF</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.exposicao_cambial_pct != null ? `${(data.macro.exposicao_cambial_pct as number).toFixed(1)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Exp. Cambial</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.bitcoin_usd != null ? `$ ${Math.round(data.macro.bitcoin_usd as number).toLocaleString('en')}` : '—'}</div>
                <div className="text-xs text-muted mt-1">BTC/USD</div>
              </div>
            </div>
            {data?._generated_brt && (
              <div className="text-xs text-slate-500 mt-1.5">
                Atualizado: {data._generated_brt as string}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 mb-0">
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
