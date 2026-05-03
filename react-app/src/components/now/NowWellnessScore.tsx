'use client';

/**
 * NowWellnessScore — extraído de page.tsx em DEV-now-refactor.
 * Engloba:
 *   - useMemo wellnessSummary (header summary do collapsible)
 *   - CollapsibleSection com score detalhado (8 métricas + bars + top ações)
 *
 * Encapsula o `useMemo` no topo (Rules of Hooks).
 */
import { useMemo } from 'react';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { secOpen, secTitle } from '@/config/dashboard.config';
import { maxDriftPp } from '@/utils/drift';
import { Trophy, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface NowWellnessScoreProps {
  data: any;
  derived: any;
}

export function NowWellnessScore({ data, derived }: NowWellnessScoreProps) {
  // Pre-compute wellness summary for collapsed header (Rules of Hooks: top-level).
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

  if (!data?.wellness_config?.metrics) return null;

  return (
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
        <WellnessDetail data={data} derived={derived} />
      </CollapsibleSection>
    </div>
  );
}

function WellnessDetail({ data, derived }: { data: any; derived: any }) {
  const wc = data.wellness_config;
  const pfireBaseVal = derived.pfireBase;
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
    { id: 'human_capital', label: 'Capital humano', pts: humanPts, max: 5, detail: humanCapitalStatus.replaceAll('_', ' '), description: wc.metrics.find((m: any) => m.id === 'human_capital')?.description ?? '' },
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
      <div className="text-xs text-muted w-28 flex-shrink-0 text-right">{m.detail}</div>
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
}
