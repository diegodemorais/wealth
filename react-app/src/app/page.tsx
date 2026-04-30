'use client';

import { useEffect, useMemo } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useUiStore } from '@/store/uiStore';
import { KpiHero } from '@/components/primitives/KpiHero';
import DecisaoDoMes from '@/components/dashboard/DecisaoDoMes';
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
import { BalancoHolistico } from '@/components/holistic/BalancoHolistico';
import { SectionDivider } from '@/components/primitives/SectionDivider';
import { Trophy, Target, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { EChart } from '@/components/primitives/EChart';
import { EC } from '@/utils/echarts-theme';

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

  // Pre-compute wellness score for collapsed header summary.
  // Must be before conditional returns (Rules of Hooks — useMemo must be unconditional).
  // Uses `data` and `derived` which are safe here (may be null; handled inside).
  const wellnessSummary = useMemo(() => {
    const wc = data?.wellness_config;
    if (!wc?.metrics) return null;
    const aporteMensalVal = data?.premissas?.aporte_mensal ?? 0;
    const custoMensal = (data?.premissas?.custo_vida_base ?? 0) / 12;
    const savingsRate = aporteMensalVal > 0 ? (aporteMensalVal / (aporteMensalVal + custoMensal)) * 100 : 0;
    const maxDriftVal = maxDriftPp(data?.drift as Record<string, any> ?? {}, ['Custo']);
    const ipcaGapPp = data?.dca_status?.ipca_longo?.gap_alvo_pp ?? null;
    const dcaAtivo = data?.dca_status?.ipca_longo?.ativo ?? false;
    const terCfg = wc.metrics.find((m: any) => m.id === 'ter');
    const terAtual = data?.drift?.['Custo']?.atual ?? (terCfg?.current_ter ?? 0.247);
    const humanStatus = wc.metrics.find((m: any) => m.id === 'human_capital')?.status ?? 'solteiro_sem_dependentes';
    const pfireBase = derived?.pfireBase ?? null;
    const pts = (id: string, val: number | null, thresholds: any[], key: string) =>
      (thresholds ?? []).find((t: any) => val != null && val >= (t[key] ?? -Infinity))?.pts ?? 0;
    const pfirePts = pts('pfire', pfireBase, wc.metrics.find((m: any) => m.id === 'pfire')?.thresholds ?? [], 'min');
    const srPts = pts('sr', savingsRate, wc.metrics.find((m: any) => m.id === 'savings_rate')?.thresholds ?? [], 'min_pct');
    const driftThresh = wc.metrics.find((m: any) => m.id === 'drift')?.thresholds ?? [];
    const driftPts = driftThresh.find((t: any) => maxDriftVal <= t.max_pp)?.pts ?? 0;
    const ipcaThresh = wc.metrics.find((m: any) => m.id === 'ipca_gap')?.thresholds ?? [];
    const ipcaPts = ipcaGapPp == null ? 5 : ipcaThresh.find((t: any) => ipcaGapPp <= t.max_pp)?.pts ?? (dcaAtivo ? 5 : 3);
    const reservaBrl = data?.rf?.ipca2029?.valor ?? 0;
    const months = custoMensal > 0 ? reservaBrl / custoMensal : 0;
    const emergThresh = wc.metrics.find((m: any) => m.id === 'emergency_fund')?.thresholds ?? [];
    const emergPts = emergThresh.find((t: any) => months >= t.min_months)?.pts ?? 0;
    const terDelta = (terCfg?.current_ter ?? terAtual) - (terCfg?.benchmark_ter ?? 0.22);
    const terThresh = terCfg?.thresholds ?? [];
    const terPts = terThresh.find((t: any) => terDelta <= t.max_delta_pp)?.pts ?? 0;
    const humanPts = (wc.metrics.find((m: any) => m.id === 'human_capital')?.thresholds ?? []).find((t: any) => t.status === humanStatus)?.pts ?? 5;
    const total = pfirePts + srPts + driftPts + ipcaPts + 7 + emergPts + terPts + humanPts;
    const maxScores = [35, 15, 15, 10, 10, 5, 5, 5];
    const allPts = [pfirePts, srPts, driftPts, ipcaPts, 7, emergPts, terPts, humanPts];
    const badCount = allPts.filter((p, i) => p / maxScores[i] < 0.85).length;
    return { total, badCount };
  }, [data, derived]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Aporte ETFs for DecisaoDoMes
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
        pctAlvo: dcaStatus.ipca2040?.alvo_pct ?? 12,
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
        pctAlvo: dcaStatus.ipca2050?.alvo_pct ?? 3,
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
      <SectionDivider label="Status" />
      {/* 1. HERO STRIP — Patrimônio Total | Anos até FIRE | Progresso FIRE */}
      <KpiHero
        networth={d.networth}
        networthUsd={d.networthUsd}
        fireProgress={d.firePercentage}
        yearsToFire={d.fireMonthsAway / 12}
        pfire={d.pfire}
        cambio={d.CAMBIO}
        fireDateFormatted={(d as any).fireDateFormatted}
      />

      {/* 2. KPI GRID: Indicadores Primários — P(Aspiracional), Drift Máx, Retorno Real, Aporte Mês */}
      <SectionLabel>Indicadores Primários</SectionLabel>
      <div data-testid="kpi-grid-primario" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        <MetricCard
          accent
          accentLeftBorder
          label="P(Cenário Aspiracional)"
          data-testid="pfire-aspiracional"
          value={d.pfireAspiracional != null ? `${d.pfireAspiracional.toFixed(1)}%` : '—'}
          sub={(() => {
            const fireSub = d.pfireAspirFav != null && d.pfireAspirStress != null
              ? `fav ${d.pfireAspirFav.toFixed(1)}% · stress ${d.pfireAspirStress.toFixed(1)}%`
              : 'cenário aspiracional (49a)';
            const pQualityAspiracionalRaw: number | null = (data as any)?.fire?.p_quality_aspiracional ?? null;
            const pQualityColor = pQualityAspiracionalRaw == null ? 'var(--muted)'
              : pQualityAspiracionalRaw >= 70 ? 'var(--green)'
              : pQualityAspiracionalRaw >= 50 ? 'var(--yellow)'
              : 'var(--red)';
            return (
              <>
                <span>{fireSub}</span>
                {pQualityAspiracionalRaw != null && (
                  <span style={{ display: 'block', marginTop: '3px', fontWeight: 600, color: pQualityColor }} data-testid="pquality-aspiracional">
                    P(qualidade) {privacyMode ? '••%' : `${pQualityAspiracionalRaw.toFixed(1)}%`}
                  </span>
                )}
              </>
            );
          })()}
        />
        <MetricCard
          accent
          accentLeftBorder
          label="Drift Máximo"
          data-testid="drift-maximo-kpi"
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
              value={twrReal != null ? (privacyMode ? '••%' : `${twrReal.toFixed(1)}%`) : '—'}
              accent={accent}
              delta={delta != null && !privacyMode ? {
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
          value={d.ultimoAporte ? fmtPrivacy(d.ultimoAporte, privacyMode) : '—'}
          sub={d.aporteMediaHistorica ? `${d.ultimoAporteData || 'último'} · média ${fmtPrivacy(d.aporteMediaHistorica, privacyMode)}/mês` : (d.ultimoAporteData || 'último aporte')}
        />
        {(d as any).taxaPoupanca != null && (
          <MetricCard
            data-testid="taxa-poupanca"
            label="Taxa de Poupança"
            value={privacyMode ? '••%' : `${(d as any).taxaPoupanca.toFixed(1)}%`}
            sub={`aporte / renda · meta FIRE ≥ 30%`}
          />
        )}
      </div>

      {/* ── CAMADA 2: Decisão do Mês ── */}
      <SectionDivider label="Decisão do Mês" />

      <DecisaoDoMes
        etfs={aporteEtfs}
        dcaItems={d.dcaItems}
        aporteMensal={d.aporteMensal}
        ultimoAporte={d.ultimoAporte}
        ultimoAporteData={d.ultimoAporteData}
        acumuladoMes={d.acumuladoMes}
        acumuladoAno={d.acumuladoAno}
        selic={(data as Record<string, any>)?.macro?.selic_meta ?? null}
        ipca12m={(data as Record<string, any>)?.macro?.ipca_12m ?? null}
        fedFunds={(data as Record<string, any>)?.macro?.fed_funds ?? null}
        cambio={d.CAMBIO}
        cambioMtdPct={data?.mercado?.cambio_mtd_pct ?? null}
        cdsBrazil5y={(data as Record<string, any>)?.macro?.cds_brazil_5y_bps ?? null}
        concentrationBrazil={d.concentrationBrazil ?? null}
        hodl11Brl={(data as Record<string, any>)?.hodl11?.valor ?? 0}
        cryptoLegadoBrl={(data as Record<string, any>)?.concentracao_brasil?.composicao?.crypto_legado_brl ?? 0}
        rfBrl={d.rfBrl ?? 0}
        exposicaoCambialPct={(data as Record<string, any>)?.macro?.exposicao_cambial_pct ?? 87.9}
      />

      {/* ── CAMADA 3: Evolução e Contexto ── */}
      <SectionDivider label="Evolução" />

      <div data-testid="fire-countdown">
        <TimeToFireProgressBar
          fireProgress={d.firePercentage}
          yearsToFire={d.fireMonthsAway / 12}
          patrimonioAtual={d.firePatrimonioAtual}
          patrimonioGatilho={d.firePatrimonioGatilho}
          swrFireDay={d.swrFireDay}
        />
      </div>

      {d && (
        <PFireMonteCarloTornado
          pfireBase={d.pfireBase}
          pfireFav={d.pfireFav}
          pfireStress={d.pfireStress}
          tornadoData={d.tornadoData}
          firePatrimonioAtual={d.firePatrimonioAtual}
          firePatrimonioGatilho={d.firePatrimonioGatilho}
          pQualityBase={(data as any)?.fire?.p_quality ?? null}
          pQualityFav={(data as any)?.fire?.p_quality_fav ?? null}
          pQualityStress={(data as any)?.fire?.p_quality_stress ?? null}
        />
      )}

      {/* 6c. Financial Wellness Score — full width [COLLAPSIBLE, CLOSED] */}
      {data?.wellness_config?.metrics && (
        <div data-testid="wellness-score">
        <CollapsibleSection
          id="section-wellness"
          title={secTitle('now', 'wellness', 'Financial Wellness Score (indicador secundário)')}
          defaultOpen={secOpen('now', 'wellness', false)}
          icon={<Trophy size={18} />}
          summary={wellnessSummary != null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', lineHeight: 1,
                color: wellnessSummary.total >= 80 ? 'var(--green)' : wellnessSummary.total >= 60 ? 'var(--yellow)' : 'var(--red)',
              }}>
                {wellnessSummary.total}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginRight: 4 }}>/100</span>
              {wellnessSummary.badCount > 0 && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600,
                  background: 'rgba(234,179,8,0.12)', color: 'var(--yellow)',
                  border: '1px solid rgba(234,179,8,0.25)', borderRadius: 4, padding: '1px 6px',
                }}>
                  {wellnessSummary.badCount} atenç{wellnessSummary.badCount === 1 ? 'ão' : 'ões'}
                </span>
              )}
            </div>
          ) : undefined}
        >
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
              { id: 'emergency_fund', label: 'Fundo emergência', pts: emergencyPts, max: 5, detail: `${(data.rf?.ipca2029?.valor ?? 0) > 0 ? (((data.rf?.ipca2029?.valor ?? 0) / custoMensal)).toFixed(1) : '?'}m`, description: wc.metrics.find((m: any) => m.id === 'emergency_fund')?.description ?? '' },
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
        </div>
      )}


      {/* Patrimônio Líquido de IR — collapsed */}
      <CollapsibleSection
        id="section-patrimonio-liquido-ir"
        title={secTitle('now', 'patrimonio-liquido-ir', 'Patrimônio Líquido de IR')}
        defaultOpen={secOpen('now', 'patrimonio-liquido-ir', false)}
        summary={(() => {
          const irDiferido = (data as any)?.tax?.ir_diferido_total_brl ?? 0;
          const patrimonioFin = (data as any)?.patrimonio_holistico?.financeiro_brl ?? (data as any)?.premissas?.patrimonio_atual ?? 0;
          if (!patrimonioFin) return undefined;
          const liquido = patrimonioFin - irDiferido;
          const pct = (irDiferido / patrimonioFin * 100).toFixed(1);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-xs)' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace', color: 'var(--text)' }}>
                {fmtPrivacy(liquido, privacyMode)}
              </span>
              <span style={{ color: 'var(--muted)' }}>líq.</span>
              <span style={{ color: 'var(--red)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4, padding: '1px 7px', fontWeight: 600 }}>
                IR {fmtPrivacy(irDiferido, privacyMode)} ({pct}%)
              </span>
            </div>
          );
        })()}
      >
        <div style={{ padding: '0 16px 16px' }}>
          <PatrimonioLiquidoIR
            irDiferido={(data as any)?.tax?.ir_diferido_total_brl ?? 0}
            patrimonioFinanceiro={(data as any)?.patrimonio_holistico?.financeiro_brl ?? (data as any)?.premissas?.patrimonio_atual ?? 0}
            pfireLiquidoPct={(data as any)?.fire_montecarlo_liquido?.pfire_liquido ?? null}
            pfireBrutoPct={(data as any)?.fire_montecarlo_liquido?.pfire_bruto ?? null}
          />
          <div className="src">
            IR diferido = imposto latente sobre ganho de capital não realizado (equity internacional).
          </div>
        </div>
      </CollapsibleSection>

      {/* Gap A: Balanço Holístico — Patrimônio Total (financeiro + ilíquido + INSS + cap humano) */}
      {(data as any)?.patrimonio_holistico && (
        <div data-testid="balanco-holistico">
        <CollapsibleSection
          id="section-balanco-holistico"
          title={secTitle('now', 'balanco-holistico', 'Balanço Holístico — Patrimônio Total')}
          defaultOpen={secOpen('now', 'balanco-holistico', false)}
          summary={(() => {
            const h = (data as any)?.patrimonio_holistico;
            if (!h?.total_brl) return undefined;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--text-xs)' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace', color: 'var(--green)' }}>
                  {fmtPrivacy(h.total_brl, privacyMode)}
                </span>
                <span style={{ color: 'var(--muted)' }}>total holístico</span>
              </div>
            );
          })()}
        >
          <BalancoHolistico data={data as any} showCapitalHumanoBadge />
        </CollapsibleSection>
        </div>
      )}

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
                ipcaTarget={(data as any)?.drift?.IPCA?.alvo ?? 15}
                ipcaCurrent={patrimonioAtual > 0 ? (((data as any)?.rf?.ipca2040?.valor ?? (data as any)?.rf?.ipca2040?.valor_brl ?? 0) + ((data as any)?.rf?.ipca2050?.valor ?? (data as any)?.rf?.ipca2050?.valor_brl ?? 0)) / patrimonioAtual * 100 : 0}
                hodl11Target={(data as any)?.drift?.HODL11?.alvo ?? 3}
                hodl11Current={patrimonioAtual > 0 ? (((data as any)?.hodl11?.valor ?? 0) + ((data as any)?.concentracao_brasil?.composicao?.crypto_legado_brl ?? 0)) / patrimonioAtual * 100 : 0}
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

      {/* ── R1: Risk Score Gauge ─────────────────────────────────────────────── */}
      <SectionDivider label="Perfil de Risco" />
      {(() => {
        const risk = (data as any)?.risk;
        const score: number | null = risk?.score ?? null;
        const label: string = risk?.label ?? '—';
        const gaugeColor = score == null ? EC.muted
          : score < 5 ? EC.green
          : score < 7.5 ? EC.warning
          : EC.red;
        const gaugeOption = {
          backgroundColor: 'transparent',
          series: [{
            type: 'gauge',
            min: 0,
            max: 10,
            splitNumber: 5,
            radius: '85%',
            axisLine: {
              lineStyle: {
                width: 14,
                color: [
                  [0.50, EC.green],
                  [0.75, EC.warning],
                  [1.00, EC.red],
                ],
              },
            },
            pointer: { itemStyle: { color: gaugeColor } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { color: EC.muted, fontSize: 10 },
            detail: {
              fontSize: 22,
              fontWeight: 800,
              color: gaugeColor,
              formatter: privacyMode ? () => '••' : (v: number) => v.toFixed(1),
            },
            title: {
              offsetCenter: [0, '65%'],
              fontSize: 11,
              color: EC.muted,
              formatter: label,
            },
            data: [{ value: score ?? 0, name: label }],
          }],
        };
        return (
          <div data-testid="risk-score-gauge" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 6 }}>
                Risk Score — Perfil de Risco
              </div>
              <EChart option={gaugeOption} style={{ height: 180 }} />
              {risk?.score_breakdown && !privacyMode && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  <span>Base equity: {risk.score_breakdown.base_equity?.toFixed(2)}</span>
                  <span>BTC addon: {risk.score_breakdown.addon_btc?.toFixed(2)}</span>
                  <span>Duration: {risk.score_breakdown.addon_duration?.toFixed(2)}</span>
                  <span>Diversif: {risk.score_breakdown.discount_diversificacao?.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* R2: Risk Semáforos */}
            <div data-testid="risk-semaforos" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
                Alertas de Risco
              </div>
              {(() => {
                const sem = risk?.semaforos ?? {};
                const cdsBps: number | null = (data as any)?.macro?.cds_brazil_5y_bps ?? null;
                // Gap B: CDS semáforo — verde<250bps, amarelo 250-400bps, vermelho>400bps
                const cdsStatus = cdsBps == null ? 'verde' : cdsBps >= 400 ? 'vermelho' : cdsBps >= 250 ? 'amarelo' : 'verde';
                const cdsDisplay = cdsBps != null ? `${cdsBps}bps` : '—';
                const icon = (status: string) => status === 'verde' ? '🟢' : status === 'amarelo' ? '🟡' : '🔴';
                const rows: Array<{ label: string; display: string; status: string; testid?: string }> = [
                  {
                    label: 'Drift Equity',
                    display: sem.equity_drift?.label ?? sem.equity_drift?.status ?? '—',
                    status: sem.equity_drift?.status ?? 'verde',
                  },
                  {
                    label: 'BTC%',
                    display: sem.btc_pct?.value != null ? `${(sem.btc_pct.value * 100).toFixed(1)}%` : '—',
                    status: sem.btc_pct?.status ?? 'verde',
                  },
                  {
                    label: 'Renda+ Taxa',
                    display: sem.renda_plus_taxa?.label ?? sem.renda_plus_taxa?.status ?? '—',
                    status: sem.renda_plus_taxa?.status ?? 'verde',
                  },
                  // Gap B: CDS Brasil 5Y
                  {
                    label: 'CDS Brasil 5Y',
                    display: cdsDisplay,
                    status: cdsStatus,
                    testid: 'cds-brasil-semaforo',
                  },
                ];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {rows.map(r => (
                      <div key={r.label} data-testid={r.testid} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>{icon(r.status)}</span>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', fontWeight: 600 }}>{r.label}</div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', fontWeight: 700 }}>{r.display}</div>
                        </div>
                      </div>
                    ))}
                    {risk?.vol_portfolio != null && (
                      <div style={{ marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        Vol portfolio: {privacyMode ? '••%' : `${(risk.vol_portfolio * 100).toFixed(1)}%`} · VaR 95%: {risk.var_95_pct != null ? (privacyMode ? '••%' : `${(risk.var_95_pct * 100).toFixed(1)}%`) : '—'}
                      </div>
                    )}
                    {/* CDS threshold note */}
                    <div style={{ marginTop: 4, fontSize: 10, color: 'var(--muted)' }}>
                      CDS: verde &lt;250bps · amarelo 250–400 · vermelho &gt;400 (revisar RF Brasil)
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })()}

      {/* Gap K: IPS Summary Card — 30-second rules */}
      {(() => {
        const prem = (data as any)?.premissas ?? {};
        const pisos = (data as any)?.pisos ?? {};
        const guardrails = (data as any)?.guardrails ?? [];
        const swr = prem.swr_gatilho ?? 0.03;
        const equityAlvo = ((data as any)?.pesosTarget?.SWRD ?? 0) + ((data as any)?.pesosTarget?.AVGS ?? 0) + ((data as any)?.pesosTarget?.AVEM ?? 0);
        const guardrailPiso = Array.isArray(guardrails) && guardrails.length > 0 ? guardrails[guardrails.length - 1] : null;
        const pisoGasto: number = (data as any)?.gasto_piso ?? guardrailPiso?.retirada ?? 180000;
        const cdsThresh = 400;
        const ipca_piso = pisos.pisoTaxaIpcaLongo ?? 6.0;
        const renda_gatilho = pisos.pisoTaxaRendaPlus ?? 6.5;
        const rules: Array<{ label: string; value: string }> = [
          { label: 'Equity alvo', value: `${(equityAlvo * 100).toFixed(0)}%` },
          { label: 'SWR', value: `${(swr * 100).toFixed(1)}%` },
          { label: 'IPCA+ piso DCA', value: `≥${ipca_piso.toFixed(1)}%` },
          { label: 'Renda+ gatilho', value: `≥${renda_gatilho.toFixed(1)}%` },
          { label: 'Guardrail piso (retirada)', value: fmtPrivacy(pisoGasto, privacyMode) + '/ano' },
          { label: 'CDS revisar RF Brasil', value: `>${cdsThresh}bps` },
          { label: 'Drift threshold', value: '±5pp por classe' },
        ];
        return (
          <div data-testid="ips-summary">
          <CollapsibleSection
            id="section-ips-summary"
            title={secTitle('now', 'ips-summary', 'IPS — 30-Second Rules')}
            defaultOpen={secOpen('now', 'ips-summary', false)}
          >
            <div style={{ padding: '0 16px 16px' }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {rules.map(r => (
                  <div key={r.label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
              <div className="src" style={{ marginTop: 8 }}>
                Read-only · Regras derivadas de data.json (swr_gatilho, pisos, pesosTarget, guardrails)
              </div>
            </div>
          </CollapsibleSection>
          </div>
        );
      })()}

    </div>
  );
}
