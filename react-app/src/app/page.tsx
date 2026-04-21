'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { KpiHero } from '@/components/primitives/KpiHero';
import AporteDecisionPanel from '@/components/dashboard/AporteDecisionPanel';
import CarryDifferential from '@/components/dashboard/CarryDifferential';
import FireProgressWellness from '@/components/dashboard/FireProgressWellness';
import AporteDoMes from '@/components/dashboard/AporteDoMes';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import CashFlowSankey from '@/components/dashboard/CashFlowSankey';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { SectionLabel } from '@/components/primitives/SectionLabel';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { MetricCard } from '@/components/primitives/MetricCard';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { maxDriftPp } from '@/utils/drift';
import PatrimonioLiquidoIR from '@/components/dashboard/PatrimonioLiquidoIR';
import IpcaTaxaProgress from '@/components/dashboard/IpcaTaxaProgress';
import RebalancingStatus from '@/components/dashboard/RebalancingStatus';
import { DCAStatusGrid } from '@/components/dashboard/DCAStatusGrid';
import { SemaforoTriggers } from '@/components/dashboard/SemaforoTriggers';
import SemaforoGatilhos from '@/components/dashboard/SemaforoGatilhos';

export default function HomePage() {
  // Portfolio dashboard - main entry point
  const loadDataOnce = useDashboardStore(s => s.loadDataOnce);
  const data = useDashboardStore(s => s.data);
  const derived = useDashboardStore(s => s.derived);
  const isLoading = useDashboardStore(s => s.isLoadingData);
  const dataError = useDashboardStore(s => s.dataLoadError);
  const { privacyMode } = useUiStore();

  useEffect(() => {
    loadDataOnce().catch(e => {
      console.error('NOW page: Failed to load data:', e);
    });
  }, [loadDataOnce]);

  const stateEl = pageStateElement({
    isLoading,
    dataError,
    data: derived,
    loadingText: 'Carregando dados...',
    errorPrefix: '❌ Erro ao carregar dashboard:',
    warningText: 'Dados carregados mas valores derivados não computados',
  });
  if (stateEl) return stateEl;
  // pageStateElement guarantees derived is non-null past this point
  const d = derived!;

  // Current year — from premissas to avoid hardcoding
  const anoAtual = (data as any)?.premissas?.ano_atual ?? new Date().getFullYear();

  // Aporte ETFs for AporteDecisionPanel
  const retornos = (data as any)?.premissas?.retornos_por_etf ?? {};
  const aporteEtfs = [
    { ticker: 'SWRD', atual: (data?.drift as any)?.SWRD?.atual ?? 0, alvo: (data?.drift as any)?.SWRD?.alvo ?? 39.5, expectedReturn: retornos.SWRD ?? 3.7 },
    { ticker: 'AVGS', atual: (data?.drift as any)?.AVGS?.atual ?? 0, alvo: (data?.drift as any)?.AVGS?.alvo ?? 23.7, expectedReturn: retornos.AVGS ?? 5.0 },
    { ticker: 'AVEM', atual: (data?.drift as any)?.AVEM?.atual ?? 0, alvo: (data?.drift as any)?.AVEM?.alvo ?? 15.8, expectedReturn: retornos.AVEM ?? 5.0 },
  ];

  // Carry Differential data
  const carryData = {
    selic: (data as any)?.macro?.selic_meta ?? 14.75,
    fedFunds: (data as any)?.macro?.fed_funds ?? 3.64,
    cambio: (data as any)?.mercado?.cambio_brl_usd ?? (data as any)?.patrimonio?.cambio ?? null,
  };

  // Compute max drift
  const maxDrift = maxDriftPp(data?.drift as Record<string, any> ?? {});

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
        networth={d.networth}
        networthUsd={d.networthUsd}
        fireProgress={d.firePercentage}
        yearsToFire={d.fireMonthsAway / 12}
        pfire={d.pfire}
        cambio={d.CAMBIO}
      />

      {/* 2. KPI GRID: Indicadores Primários — P(Aspiracional), Drift Máx, Aporte Mês */}
      <SectionLabel>Indicadores Primários</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3.5">
        {/* P(Cenário Aspiracional) */}
        <MetricCard
          accent
          label="P(Cenário Aspiracional)"
          value={d.pfireAspiracional != null ? `${d.pfireAspiracional.toFixed(1)}%` : '—'}
          sub={
            d.pfireAspirFav != null && d.pfireAspirStress != null
              ? `fav ${d.pfireAspirFav.toFixed(1)}% · stress ${d.pfireAspirStress.toFixed(1)}%`
              : 'cenário aspiracional (49a)'
          }
        />
        {/* Drift Máximo */}
        <MetricCard
          accent
          label="Drift Máximo"
          value={`${maxDrift.toFixed(2)}pp`}
          valueColor="text-text"
          sub="vs alvo IPS"
        />
        {/* Aporte do Mês */}
        <MetricCard
          label="Aporte do Mês"
          value={d.aporteMensal ? (privacyMode ? '••••' : `R$${Math.round(d.aporteMensal / 1000)}k`) : '—'}
          sub="meta mensal"
        />
      </div>

      {/* 3. KPI GRID: Contexto de Mercado — Dólar, Bitcoin, IPCA+ 2040, Renda+ 2065 */}
      <SectionLabel>Contexto de Mercado</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5 opacity-85">
        {/* Dólar */}
        <MetricCard
          size="sm"
          label="Dólar"
          value={d.CAMBIO ? `R$ ${d.CAMBIO.toFixed(2)}` : '—'}
          sub={
            data?.mercado?.cambio_mtd_pct != null
              ? `${data.mercado.cambio_mtd_pct > 0 ? '+' : ''}${data.mercado.cambio_mtd_pct.toFixed(1)}% MtD · PTAX BCB`
              : 'BRL/USD · PTAX BCB'
          }
        />
        {/* Bitcoin */}
        <MetricCard
          size="sm"
          label="Bitcoin"
          value={
            data?.mercado?.btc_usd
              ? `$${Number(data.mercado.btc_usd).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              : '—'
          }
          sub={
            data?.mercado?.btc_mtd_pct != null
              ? `${data.mercado.btc_mtd_pct > 0 ? '+' : ''}${data.mercado.btc_mtd_pct.toFixed(1)}% MtD`
              : 'BTC/USD'
          }
        />
        {/* IPCA+ 2040 */}
        <MetricCard
          size="sm"
          label={
            <>
              IPCA+ 2040 — Taxa
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getIpcaSemaforoColor(ipcaTaxa) }}
              />
            </>
          }
          value={ipcaTaxa ? `${ipcaTaxa.toFixed(2)}%` : '—'}
          sub={data?.rf?.ipca2040?.descricao || 'Tesouro IPCA+ 2040'}
        />
        {/* Renda+ 2065 */}
        <MetricCard
          size="sm"
          label={
            <>
              Renda+ 2065 — Taxa
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getRendaSemaforoColor(rendaTaxa) }}
              />
            </>
          }
          value={rendaTaxa ? `${rendaTaxa.toFixed(2)}%` : '—'}
          sub={data?.rf?.renda2065?.descricao || 'Tesouro Renda+ 2065'}
        />
      </div>

      {/* 3b. SEÇÃO: Carry Differential — colapsada */}
      <CollapsibleSection id="section-carry-differential" title="Carry Differential — Selic vs Fed Funds" defaultOpen={secOpen('now', 'carry-differential', false)} icon="💱">
        <div style={{ padding: '0 16px 16px' }}>
          <CarryDifferential {...carryData} />
        </div>
      </CollapsibleSection>

      {/* 4. SEÇÃO: Time to FIRE — Big number + Progresso */}
      <TimeToFireProgressBar
        fireProgress={d.firePercentage}
        yearsToFire={d.fireMonthsAway / 12}
        patrimonioAtual={d.firePatrimonioAtual}
        patrimonioGatilho={d.firePatrimonioGatilho}
      />

      {/* 4a. Family Scenarios row abaixo do Time to FIRE */}
      {data?.fire_matrix?.by_profile && Array.isArray(data.fire_matrix.by_profile) && (
        <div className="grid grid-cols-3 gap-2 mb-3.5">
          {data.fire_matrix.by_profile.map((profile: any, i: number) => {
            // Use profile.label from JSON if available, else fall back to hardcoded
            const fallbackLabels = ['Solteiro', 'Casado', 'C+Filho'];
            const displayLabel = profile.label ?? fallbackLabels[i] ?? `Perfil ${i + 1}`;
            // Show the base scenario (53) probability, fall back to fire_age_50
            const pfireBase53 = profile.p_fire_53 ?? null;
            const pfireBase50 = profile.p_fire_50 ?? null;
            const pfire = pfireBase53 ?? pfireBase50;
            const fireYear = profile.fire_age_53 ?? profile.fire_age_50 ?? '2040';
            const fireAge = profile.profile === 'atual' ? 53 : 53;
            return (
              <div key={i} className="bg-slate-700/30 border-t-2 border-accent/40 rounded p-2.5 text-center">
                <div className="text-xs uppercase font-semibold text-muted mb-1 tracking-widest">
                  {displayLabel}
                </div>
                <div className="text-sm font-bold text-accent">FIRE {fireAge}</div>
                <div className="text-sm font-bold text-green mt-0.5">
                  P = {pfire != null ? `${pfire.toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs text-muted mt-1">{fireYear}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. SEÇÃO: Próximo Aporte — Equity & Gatilhos RF */}
      {d && Array.isArray(d.dcaItems) && d.dcaItems.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <AporteDecisionPanel
            etfs={aporteEtfs}
            dcaItems={d.dcaItems}
          />
        </div>
      )}

      {/* 5b. Semáforo de Gatilhos — collapsed por default, mostra proxAcao por ativo */}
      {d && Array.isArray(d.dcaItems) && d.dcaItems.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <SemaforoGatilhos items={d.dcaItems} />
        </div>
      )}

      {/* 6. GRID 2-COL: Progresso FIRE + Aporte do Mês */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <FireProgressWellness
          firePercentage={d.firePercentage}
          firePatrimonioAtual={d.firePatrimonioAtual}
          firePatrimonioGatilho={d.firePatrimonioGatilho}
          swrFireDay={d.swrFireDay}
          wellnessScore={d.wellnessScore * 100}
          wellnessLabel={d.wellnessLabel}
          wellnessMetrics={d.wellnessMetrics}
        />
        {d && (
          <AporteDoMes
            aporteMensal={d.aporteMensal}
            ultimoAporte={d.ultimoAporte}
            ultimoAporteData={d.ultimoAporteData}
            acumuladoMes={d.acumuladoMes}
            acumuladoAno={d.acumuladoAno}
          />
        )}
      </div>

      {/* 6a. Financial Wellness Score — full width [COLLAPSIBLE, OPEN] */}
      {data?.wellness_config?.metrics && (
        <CollapsibleSection id="section-wellness" title="Financial Wellness Score (indicador secundário)" defaultOpen={secOpen('now', 'wellness')} icon="🏆">
          {(() => {
            // Compute each metric's points using wellness_config thresholds
            const wc = data.wellness_config;
            const pfireBaseVal = d.pfireBase; // 0-100
            const aporteMensalVal = data.premissas?.aporte_mensal ?? 0;
            const custoVidaBase = data.premissas?.custo_vida_base ?? 0;
            const custoMensal = custoVidaBase / 12;
            const savingsRate = aporteMensalVal > 0 ? (aporteMensalVal / (aporteMensalVal + custoMensal)) * 100 : 0;
            const maxDriftVal = maxDriftPp(data?.drift as Record<string, any> ?? {}, ['Custo']);
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
      {d && (
        <PFireMonteCarloTornado
          pfireBase={d.pfireBase}
          pfireFav={d.pfireFav}
          pfireStress={d.pfireStress}
          tornadoData={d.tornadoData}
          firePatrimonioAtual={d.firePatrimonioAtual}
          firePatrimonioGatilho={d.firePatrimonioGatilho}
        />
      )}

      {/* 8. SEÇÃO: Contexto Macro [COLLAPSIBLE, OPEN] */}
      <CollapsibleSection id="section-macro" title="Contexto Macro" defaultOpen={secOpen('now', 'macro')} icon="📊">
        <div className="px-4 pb-4">
          {/* Macro strip */}
          <div className="mb-3.5">
            <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">
              Indicadores Macro
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.selic_meta != null ? `${(data.macro.selic_meta as number).toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Selic</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.ipca_12m != null ? `${(data.macro.ipca_12m as number).toFixed(1)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">IPCA 12M</div>
              </div>
              <div className="bg-slate-700/40 rounded p-2.5 text-center">
                <div className="text-lg font-bold text-text">{data?.macro?.fed_funds != null ? `${(data.macro.fed_funds as number).toFixed(2)}%` : '—'}</div>
                <div className="text-xs text-muted mt-1">Fed Funds</div>
              </div>
            </div>
          </div>

          {/* Exposição Brasil */}
          <div className="mb-3.5">
            <div className="text-xs uppercase font-semibold text-muted mb-2 tracking-widest">
              Exposição Brasil
            </div>
            <div className="bg-slate-700/40 rounded p-3">
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-muted">Total Brasil</div>
                  <div className="text-lg font-bold text-green mt-0.5">
                    {d.concentrationBrazil != null ? `${(d.concentrationBrazil * 100).toFixed(1)}%` : '—'}
                  </div>
                </div>
                <div className="text-sm text-muted text-right">
                  <div>HODL11: {privacyMode ? '••••' : `R$${((data?.hodl11?.valor ?? 0) / 1000).toFixed(0)}k`}</div>
                  <div>RF Total: {privacyMode ? '••••' : `R$${((d.rfBrl ?? 0) / 1000).toFixed(0)}k`}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 mb-0">
            Fonte: BCB / FRED · Premissa de depreciação BRL usada em projeções FIRE
          </div>
        </div>
      </CollapsibleSection>

      {/* 8b. SEÇÃO: DCA Status [COLLAPSIBLE, OPEN] */}
      {data?.dca_status && (
        <CollapsibleSection id="section-dca-status" title="DCA Status" defaultOpen={secOpen('now', 'dca-status')} icon="🎯">
          <div className="px-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* IPCA+ 2040 */}
              {data.dca_status.ipca_longo && (
                <div className="bg-slate-700/40 rounded p-2.5 border-l-3 border-accent/40">
                  <div className="text-xs text-muted mb-1">IPCA+ 2040</div>
                  <div className="text-sm font-bold mb-0.5">Taxa: {data.dca_status.ipca_longo.taxa_atual?.toFixed(2)}%</div>
                  <div className="text-xs text-muted">
                    Piso: {data.dca_status.ipca_longo.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca_longo.gap_alvo_pp?.toFixed(1)}pp
                  </div>
                  <div className="text-xs text-muted">
                    {privacyMode ? '••••' : `Posição: R$${((data.rf?.ipca2040?.valor ?? 0) / 1000).toFixed(0)}k`} ({data.dca_status.ipca_longo.pct_carteira_atual?.toFixed(1)}%)
                  </div>
                </div>
              )}
              {/* IPCA+ 2050 */}
              {data.dca_status.ipca2050 && (
                <div className="bg-slate-700/40 rounded p-2.5 border-l-3 border-accent/40">
                  <div className="text-xs text-muted mb-1">IPCA+ 2050</div>
                  <div className="text-sm font-bold mb-0.5">Taxa: {data.dca_status.ipca2050.taxa_atual?.toFixed(2)}%</div>
                  <div className="text-xs text-muted">
                    Piso: {data.dca_status.ipca2050.piso?.toFixed(1)}% | Gap: {data.dca_status.ipca2050.gap_alvo_pp?.toFixed(1)}pp
                  </div>
                  <div className="text-xs text-muted">
                    {privacyMode ? '••••' : `Posição: R$${((data.rf?.ipca2050?.valor ?? 0) / 1000).toFixed(0)}k`} ({data.dca_status.ipca2050.pct_carteira_atual?.toFixed(1)}%)
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
                    {privacyMode ? '••••' : `Posição: R$${((data.rf?.renda2065?.valor ?? 0) / 1000).toFixed(0)}k`}
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-3">
              Fonte: Nubank · IBKR · DCA automático por gap vs alvo de alocação
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 9. SEÇÃO: Sankey — Fluxo de Caixa [COLLAPSIBLE, OPEN] */}
      {d && (
        <CollapsibleSection id="section-sankey" title="Sankey — Fluxo de Caixa Anual (estimado)" defaultOpen={secOpen('now', 'sankey')} icon="💸">
          <div style={{ padding: '0 16px 16px' }}>
            <CashFlowSankey />
          </div>
        </CollapsibleSection>
      )}

      {/* 10. Patrimônio Líquido de IR — collapsed */}
      <CollapsibleSection id="section-patrimonio-liquido-ir" title={secTitle('now', 'patrimonio-liquido-ir', 'Patrimônio Líquido de IR')} defaultOpen={secOpen('now', 'patrimonio-liquido-ir', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          <PatrimonioLiquidoIR
            irDiferido={(data as any)?.tax?.ir_diferido_total_brl ?? 0}
            patrimonioFinanceiro={(data as any)?.patrimonio_holistico?.financeiro_brl ?? (data as any)?.premissas?.patrimonio_atual ?? 0}
          />
          <div className="src">
            IR diferido = imposto latente sobre ganho de capital não realizado (equity internacional).
          </div>
        </div>
      </CollapsibleSection>

      {/* 11. IPCA Taxa Progress — collapsed */}
      <CollapsibleSection id="section-ipca-progress" title={secTitle('now', 'ipca-progress', 'IPCA+ Taxa — Progresso de Alocação RF')} defaultOpen={secOpen('now', 'ipca-progress', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const rf = (data as any)?.rf ?? {};
            const patrimonioAtual = (data as any)?.premissas?.patrimonio_atual ?? d.networth ?? 0;
            return (
              <IpcaTaxaProgress
                taxaAtual={rf.ipca2040?.taxa ?? 0}
                ipca2040Valor={rf.ipca2040?.valor ?? rf.ipca2040?.valor_brl ?? 0}
                ipca2040AlvoPercent={8}
                ipca2040AtualPercent={patrimonioAtual > 0 ? ((rf.ipca2040?.valor ?? rf.ipca2040?.valor_brl ?? 0) / patrimonioAtual) * 100 : 0}
                ipca2050Valor={rf.ipca2050?.valor ?? rf.ipca2050?.valor_brl ?? 0}
                ipca2050AlvoPercent={7}
                ipca2050AtualPercent={patrimonioAtual > 0 ? ((rf.ipca2050?.valor ?? rf.ipca2050?.valor_brl ?? 0) / patrimonioAtual) * 100 : 0}
                ipcaTotalBrl={(rf.ipca2040?.valor ?? rf.ipca2040?.valor_brl ?? 0) + (rf.ipca2050?.valor ?? rf.ipca2050?.valor_brl ?? 0)}
                totalPortfolio={patrimonioAtual}
              />
            );
          })()}
          <div className="src">
            Progresso de alocação em NTN-Bs (IPCA+). Meta: 15% do portfólio em bond pool.
          </div>
        </div>
      </CollapsibleSection>

      {/* 12. Rebalancing Status — collapsed */}
      <CollapsibleSection id="section-rebalancing-status" title={secTitle('now', 'rebalancing-status', 'Rebalancing Status — Drift por Classe')} defaultOpen={secOpen('now', 'rebalancing-status', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const posicoes = (data as any)?.posicoes ?? {};
            const patrimonioAtual = (data as any)?.premissas?.patrimonio_atual ?? d.networth ?? 1;
            const pesosTarget = (data as any)?.pesosTarget ?? {};
            const cambio = d.CAMBIO ?? 5.15;
            // Aggregate all tickers within a bucket (transitórios incluídos)
            const bucketPct = (bucketName: string) => {
              const total = Object.values(posicoes as Record<string, any>)
                .filter((pos: any) => pos?.bucket === bucketName && pos?.qty && pos?.price)
                .reduce((sum: number, pos: any) => sum + pos.qty * pos.price * cambio, 0);
              return patrimonioAtual > 0 ? (total / patrimonioAtual) * 100 : 0;
            };
            return (
              <RebalancingStatus
                swrdTarget={(pesosTarget.SWRD ?? 0.50) * 100}
                swrdCurrent={bucketPct('SWRD')}
                avgsTarget={(pesosTarget.AVGS ?? 0.30) * 100}
                avgsCurrent={bucketPct('AVGS')}
                avemTarget={(pesosTarget.AVEM ?? 0.20) * 100}
                avemCurrent={bucketPct('AVEM')}
                ipcaTarget={15}
                ipcaCurrent={patrimonioAtual > 0 ? (((data as any)?.rf?.ipca2040?.valor ?? (data as any)?.rf?.ipca2040?.valor_brl ?? 0) + ((data as any)?.rf?.ipca2050?.valor ?? (data as any)?.rf?.ipca2050?.valor_brl ?? 0)) / patrimonioAtual * 100 : 0}
                hodl11Target={3}
                hodl11Current={patrimonioAtual > 0 ? ((data as any)?.hodl11?.valor ?? 0) / patrimonioAtual * 100 : 0}
                lastRebalanceDate={(data as any)?.premissas?.ultima_revisao}
                driftThresholdPp={5}
              />
            );
          })()}
          <div className="src">
            Drift vs target por classe de ativo. Threshold: ±5pp.
          </div>
        </div>
      </CollapsibleSection>

      {/* 13. DCA Status Grid — collapsed */}
      {d.dcaItems?.length > 0 && (
        <CollapsibleSection id="section-dca-grid" title={secTitle('now', 'dca-grid', 'DCA Status Grid — Renda Fixa & Crypto')} defaultOpen={secOpen('now', 'dca-grid', false)}>
          <div style={{ padding: '0 16px 16px' }}>
            <DCAStatusGrid items={d.dcaItems} />
            <div className="src">
              Status de DCA por instrumento. Verde = comprar, amarelo = aguardar, vermelho = não comprar.
            </div>
          </div>
        </CollapsibleSection>
      )}

    </div>
  );
}
