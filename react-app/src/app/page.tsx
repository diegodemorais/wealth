'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { KpiHero } from '@/components/primitives/KpiHero';
import AporteDecisionPanel from '@/components/dashboard/AporteDecisionPanel';
import FireProgressWellness from '@/components/dashboard/FireProgressWellness';
import AporteDoMes from '@/components/dashboard/AporteDoMes';
import PFireMonteCarloTornado from '@/components/dashboard/PFireMonteCarloTornado';
import { TimeToFireProgressBar } from '@/components/dashboard/TimeToFireProgressBar';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { SectionLabel } from '@/components/primitives/SectionLabel';
import { pageStateElement } from '@/components/primitives/PageStateGuard';
import { MetricCard } from '@/components/primitives/MetricCard';
import { KpiCard } from '@/components/primitives/KpiCard';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { maxDriftPp } from '@/utils/drift';
import PatrimonioLiquidoIR from '@/components/dashboard/PatrimonioLiquidoIR';
import RebalancingStatus from '@/components/dashboard/RebalancingStatus';
import MacroUnificado from '@/components/dashboard/MacroUnificado';
import RFStatusPanel from '@/components/dashboard/RFStatusPanel';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import { Trophy, Target, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';

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
    errorPrefix: 'Erro ao carregar dashboard:',
    warningText: 'Dados carregados mas valores derivados não computados',
  });
  if (stateEl) return stateEl;
  // pageStateElement guarantees derived is non-null past this point
  const d = derived!;

  // Aporte ETFs for AporteDecisionPanel
  // retornos_por_etf schema: { SWRD: { retorno_usd_real: 0.037, fonte: '...' }, ... } (decimal, não %)
  const retornos = (data as any)?.premissas?.retornos_por_etf ?? {};
  const erPct = (ticker: string, fallback: number): number => {
    const raw = retornos[ticker]?.retorno_usd_real;
    return typeof raw === 'number' ? raw * 100 : fallback;
  };
  const aporteEtfs = [
    { ticker: 'SWRD', atual: (data?.drift as any)?.SWRD?.atual ?? 0, alvo: (data?.drift as any)?.SWRD?.alvo ?? 39.5, expectedReturn: erPct('SWRD', 3.7) },
    { ticker: 'AVGS', atual: (data?.drift as any)?.AVGS?.atual ?? 0, alvo: (data?.drift as any)?.AVGS?.alvo ?? 23.7, expectedReturn: erPct('AVGS', 5.0) },
    { ticker: 'AVEM', atual: (data?.drift as any)?.AVEM?.atual ?? 0, alvo: (data?.drift as any)?.AVEM?.alvo ?? 15.8, expectedReturn: erPct('AVEM', 5.0) },
  ];

  // Current year — from premissas to avoid hardcoding (used by child components via ano_atual)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const anoAtual = (data as any)?.premissas?.ano_atual ?? new Date().getFullYear();

  // Compute max drift
  const maxDrift = maxDriftPp(data?.drift as Record<string, any> ?? {});

  // Get IPCA and Renda+ semaforo taxa from rf
  const ipcaTaxa = data?.rf?.ipca2040?.taxa ?? null;
  const rendaTaxa = data?.rf?.renda2065?.taxa ?? null;

  // Build RF Status rows (consolidated from IpcaTaxaProgress + DCA Status)
  const rfRows = (() => {
    const rf = (data as any)?.rf ?? {};
    const dcaStatus = (data as any)?.dca_status ?? {};
    const patAtual = (data as any)?.premissas?.patrimonio_atual ?? d.networth ?? 0;
    const pct = (v: number) => patAtual > 0 ? (v / patAtual) * 100 : 0;
    const ipca2040V = rf.ipca2040?.valor ?? rf.ipca2040?.valor_brl ?? 0;
    const ipca2050V = rf.ipca2050?.valor ?? rf.ipca2050?.valor_brl ?? 0;
    const renda2065V = rf.renda2065?.valor ?? rf.renda2065?.valor_brl ?? 0;
    return [
      {
        id: 'ipca2040',
        label: 'IPCA+ 2040',
        taxaAtual: rf.ipca2040?.taxa,
        piso: dcaStatus.ipca_longo?.piso,
        gap: dcaStatus.ipca_longo?.gap_alvo_pp,
        pctAtual: pct(ipca2040V),
        pctAlvo: 8,
        valor: ipca2040V,
        dcaAtivo: dcaStatus.ipca_longo?.ativo ?? dcaStatus.ipca2040?.ativo,
      },
      {
        id: 'ipca2050',
        label: 'IPCA+ 2050',
        taxaAtual: rf.ipca2050?.taxa,
        piso: dcaStatus.ipca2050?.piso,
        gap: dcaStatus.ipca2050?.gap_alvo_pp,
        pctAtual: pct(ipca2050V),
        pctAlvo: 7,
        valor: ipca2050V,
        dcaAtivo: dcaStatus.ipca2050?.ativo,
      },
      {
        id: 'renda2065',
        label: 'Renda+ 2065',
        taxaAtual: rf.renda2065?.distancia_gatilho?.taxa_atual ?? rf.renda2065?.taxa,
        piso: rf.renda2065?.distancia_gatilho?.piso_venda,
        gap: rf.renda2065?.distancia_gatilho?.gap_pp,
        pctAtual: pct(renda2065V),
        pctAlvo: 0,
        valor: renda2065V,
        dcaAtivo: dcaStatus.renda_plus?.ativo,
      },
    ];
  })();

  return (
    <div>
      <SectionDivider label="Indicadores" />
      {/* 1. HERO STRIP — Patrimônio Total | Anos até FIRE | Progresso FIRE */}
      <KpiHero
        networth={d.networth}
        networthUsd={d.networthUsd}
        fireProgress={d.firePercentage}
        yearsToFire={d.fireMonthsAway / 12}
        pfire={d.pfire}
        cambio={d.CAMBIO}
      />

      {/* 2. KPI GRID: Indicadores Primários — P(Aspiracional), Drift Máx, Retorno Real, Aporte Mês */}
      <SectionLabel>Indicadores Primários</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <MetricCard
          accent
          accentLeftBorder
          label="P(Cenário Aspiracional)"
          value={d.pfireAspiracional != null ? `${d.pfireAspiracional.toFixed(1)}%` : '—'}
          sub={
            d.pfireAspirFav != null && d.pfireAspirStress != null
              ? `fav ${d.pfireAspirFav.toFixed(1)}% · stress ${d.pfireAspirStress.toFixed(1)}%`
              : 'cenário aspiracional (49a)'
          }
        />
        <MetricCard
          accent
          accentLeftBorder
          label="Drift Máximo"
          value={`${maxDrift.toFixed(2)}pp`}
          valueColor="text-text"
          sub="vs alvo IPS"
        />
        {/* TWR CAGR Real BRL — igual ao card do /performance: chip de delta + progress + sub com metodologia */}
        {(() => {
          const twrReal: number | null = (data as any)?.retornos_mensais?.twr_real_brl_pct ?? null;
          const premissa: number = (data as any)?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;
          const periodoAnos: number | null = (data as any)?.retornos_mensais?.periodo_anos ?? null;
          const accent = twrReal == null ? 'var(--muted)'
            : twrReal >= 4.5 ? 'var(--green)'
            : twrReal >= 3 ? 'var(--yellow)'
            : 'var(--red)';
          const delta = twrReal != null ? twrReal - premissa : null;
          return (
            <KpiCard
              label="Retorno Real (CAGR)"
              value={twrReal != null ? `${twrReal.toFixed(1)}%` : '—'}
              accent={accent}
              delta={delta != null ? {
                text: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}pp vs ${premissa.toFixed(1)}%`,
                positive: delta >= 0,
              } : undefined}
              progress={twrReal != null ? twrReal / (premissa * 1.5) : undefined}
              sub={`TWR · desde abr/2021${periodoAnos != null ? ` · ${periodoAnos.toFixed(1)} anos` : ''}`}
            />
          );
        })()}
        <MetricCard
          label="Aporte do Mês"
          value={d.aporteMensal ? fmtPrivacy(d.aporteMensal, privacyMode) : '—'}
          sub="meta mensal"
        />
      </div>

      {/* ── GROUP 1: Ação Imediata ── */}
      <SectionDivider label="Ação Imediata" />
      <MacroUnificado
        selic={(data as any)?.macro?.selic_meta ?? null}
        ipca12m={(data as any)?.macro?.ipca_12m ?? null}
        fedFunds={(data as any)?.macro?.fed_funds ?? null}
        cambio={d.CAMBIO}
        cambioMtdPct={data?.mercado?.cambio_mtd_pct ?? null}
        ipcaTaxa={ipcaTaxa}
        ipcaDescricao={data?.rf?.ipca2040?.descricao}
        rendaTaxa={rendaTaxa}
        rendaDescricao={data?.rf?.renda2065?.descricao}
        concentrationBrazil={d.concentrationBrazil ?? null}
        hodl11Brl={(data as any)?.hodl11?.valor ?? 0}
        rfBrl={d.rfBrl ?? 0}
        exposicaoCambialPct={(data as any)?.macro?.exposicao_cambial_pct ?? 87.9}
        patrimonioAtual={(data as any)?.premissas?.patrimonio_atual ?? d.networth}
        equityPctUsd={((data as any)?.macro?.exposicao_cambial_pct ?? 87.9) / 100}
        cdsBrazil5y={(data as any)?.macro?.cds_brazil_5y_bps ?? null}
      />

      {/* 4. SEÇÃO: Time to FIRE */}
      <TimeToFireProgressBar
        fireProgress={d.firePercentage}
        yearsToFire={d.fireMonthsAway / 12}
        patrimonioAtual={d.firePatrimonioAtual}
        patrimonioGatilho={d.firePatrimonioGatilho}
      />

      {/* 5. SEÇÃO: Próximo Aporte — Equity & Gatilhos RF */}
      {d && Array.isArray(d.dcaItems) && d.dcaItems.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <AporteDecisionPanel
            etfs={aporteEtfs}
            dcaItems={d.dcaItems}
          />
        </div>
      )}

      {/* 6. PFireMonteCarloTornado — reordenado para ANTES de FireProgressWellness */}
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

      {/* 6b. GRID 2-COL: Progresso FIRE + Aporte do Mês */}
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

      {/* ── GROUP 2: Monitoramento ── */}
      <SectionDivider label="Monitoramento" />

      {/* 6c. Financial Wellness Score — full width [COLLAPSIBLE, CLOSED] */}
      {data?.wellness_config?.metrics && (
        <CollapsibleSection id="section-wellness" title={secTitle('now', 'wellness', 'Financial Wellness Score (indicador secundário)')} defaultOpen={secOpen('now', 'wellness', false)} icon={<Trophy size={18} />}>
          {(() => {
            const wc = data.wellness_config;
            const pfireBaseVal = d.pfireBase;
            const aporteMensalVal = data.premissas?.aporte_mensal ?? 0;
            const custoVidaBase = data.premissas?.custo_vida_base ?? 0;
            const custoMensal = custoVidaBase / 12;
            const savingsRate = aporteMensalVal > 0 ? (aporteMensalVal / (aporteMensalVal + custoMensal)) * 100 : 0;
            const maxDriftVal = maxDriftPp(data?.drift as Record<string, any> ?? {}, ['Custo']);
            const ipcaGapPp = data.dca_status?.ipca_longo?.gap_alvo_pp ?? null;
            const dcaAtivo = data.dca_status?.ipca_longo?.ativo ?? false;
            const terAtual = data.drift?.['Custo']?.atual ?? (data.wellness_config?.metrics?.find((m: any) => m.id === 'ter')?.current_ter ?? 0.247);
            const humanCapitalStatus = data.wellness_config?.metrics?.find((m: any) => m.id === 'human_capital')?.status ?? 'solteiro_sem_dependentes';

            const pfirePts = (() => {
              const thresholds = wc.metrics.find((m: any) => m.id === 'pfire')?.thresholds ?? [];
              for (const t of thresholds) {
                if (pfireBaseVal >= t.min) return t.pts;
              }
              return 0;
            })();

            const savingsRatePts = (() => {
              const thresholds = wc.metrics.find((m: any) => m.id === 'savings_rate')?.thresholds ?? [];
              for (const t of thresholds) {
                if (savingsRate >= t.min_pct) return t.pts;
              }
              return 0;
            })();

            const driftPts = (() => {
              const thresholds = wc.metrics.find((m: any) => m.id === 'drift')?.thresholds ?? [];
              for (const t of thresholds) {
                if (maxDriftVal <= t.max_pp) return t.pts;
              }
              return 0;
            })();

            const ipcaGapPts = (() => {
              if (ipcaGapPp == null) return 5;
              const thresholds = wc.metrics.find((m: any) => m.id === 'ipca_gap')?.thresholds ?? [];
              for (const t of thresholds) {
                if (ipcaGapPp <= t.max_pp) {
                  return t.pts ?? (dcaAtivo ? (t.pts_if_dca ?? t.pts ?? 5) : (t.pts ?? 3));
                }
              }
              return dcaAtivo ? 5 : 3;
            })();

            const execPts = 7;

            const emergencyPts = (() => {
              const reservaBrl = data.rf?.ipca2029?.valor ?? 0;
              const months = custoMensal > 0 ? reservaBrl / custoMensal : 0;
              const thresholds = wc.metrics.find((m: any) => m.id === 'emergency_fund')?.thresholds ?? [];
              for (const t of thresholds) {
                if (months >= t.min_months) return t.pts;
              }
              return 0;
            })();

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
                <div className="text-xs w-4 flex-shrink-0">{m.isOk ? <CheckCircle size={14} className="text-green" /> : <AlertCircle size={14} className="text-yellow" />}</div>
                <div className="text-xs text-muted w-36 flex-shrink-0 truncate">{m.label}</div>
                {renderBar(m.pts, m.max)}
                <div className="text-xs text-muted w-14 flex-shrink-0 text-right">{m.detail}</div>
                <div className="text-xs text-muted w-10 flex-shrink-0 text-right">{m.pts}/{m.max}</div>
              </div>
            );

            return (
              <div className="px-4 pb-4">
                <div className="flex gap-5 items-start">
                  <div className="min-w-28 text-center flex-shrink-0">
                    <div className="text-xs uppercase font-semibold text-muted mb-1.5 tracking-widest">Score</div>
                    <div className="text-5xl font-black text-green leading-none">{totalScore}</div>
                    <div className="text-xs text-muted mt-1">/100 · Progressivo</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {badMetrics.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--yellow)' }}><AlertTriangle size={13} className="inline mr-1" /> OPORTUNIDADE DE MELHORIA</div>
                        {badMetrics.map(renderMetricRow)}
                      </div>
                    )}
                    {goodMetrics.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-green mb-1.5"><CheckCircle size={13} className="inline mr-1" /> SEM AÇÃO NECESSÁRIA</div>
                        {goodMetrics.map(renderMetricRow)}
                      </div>
                    )}
                  </div>
                </div>

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

      {/* RF STATUS PANEL — merge de IpcaTaxaProgress + DCA Status + DCAStatusGrid */}
      <CollapsibleSection
        id="section-rf-status"
        title={secTitle('now', 'rf-status', 'RF Status — IPCA+ & Renda+ por Instrumento')}
        defaultOpen={secOpen('now', 'rf-status', false)}
        icon={<Target size={18} />}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <RFStatusPanel rows={rfRows} />
        </div>
      </CollapsibleSection>

      {/* Patrimônio Líquido de IR — collapsed */}
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

      {/* Rebalancing Status — collapsed */}
      <CollapsibleSection id="section-rebalancing-status" title={secTitle('now', 'rebalancing-status', 'Rebalancing Status — Drift por Classe')} defaultOpen={secOpen('now', 'rebalancing-status', false)}>
        <div style={{ padding: '0 16px 16px' }}>
          {(() => {
            const posicoes = (data as any)?.posicoes ?? {};
            const patrimonioAtual = (data as any)?.premissas?.patrimonio_atual ?? d.networth ?? 1;
            const pesosTarget = (data as any)?.pesosTarget ?? {};
            const cambio = d.CAMBIO ?? 5.15;
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

    </div>
  );
}
