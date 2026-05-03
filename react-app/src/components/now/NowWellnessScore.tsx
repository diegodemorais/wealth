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
import { tierByMin, tierByMax, promoteTier, type WellnessStatus } from '@/utils/wellnessTier';
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
    // Boldin-style 3 tiers (G/Y/R) + arredondamento. Sem interpolação.
    // Cf. wellnessTier.ts e wellness_config.json v3.0.
    const pfireCfg = wc.metrics.find((m: any) => m.id === 'pfire');
    const pfireR = tierByMin(pfireBase, pfireCfg?.thresholds ?? [], 'min', pfireCfg?.decimals ?? 1);
    const srCfg = wc.metrics.find((m: any) => m.id === 'savings_rate');
    const srR = tierByMin(savingsRate, srCfg?.thresholds ?? [], 'min_pct', srCfg?.decimals ?? 1);
    const driftCfg = wc.metrics.find((m: any) => m.id === 'drift');
    const driftR = tierByMax(maxDriftVal, driftCfg?.thresholds ?? [], 'max_pp', driftCfg?.decimals ?? 1);
    const ipcaCfg = wc.metrics.find((m: any) => m.id === 'ipca_gap');
    const ipcaRaw = ipcaGapPp == null
      ? { status: 'yellow' as WellnessStatus, pts: ipcaCfg?.thresholds?.find((t: any) => t.status === 'yellow')?.pts ?? 6 }
      : tierByMax(ipcaGapPp, ipcaCfg?.thresholds ?? [], 'max_pp', ipcaCfg?.decimals ?? 1);
    const ipcaR = promoteTier(ipcaRaw, ipcaCfg?.thresholds ?? [], dcaAtivo && ipcaCfg?.dca_promotes_tier === true);
    const reservaBrl = data?.rf?.ipca2029?.valor ?? 0;
    const months = custoMensal > 0 ? reservaBrl / custoMensal : 0;
    const emergCfg = wc.metrics.find((m: any) => m.id === 'emergency_fund');
    const emergR = tierByMin(months, emergCfg?.thresholds ?? [], 'min_months', emergCfg?.decimals ?? 1);
    const terDelta = (terCfg?.current_ter ?? terAtual) - (terCfg?.benchmark_ter ?? 0.22);
    const terR = tierByMax(terDelta, terCfg?.thresholds ?? [], 'max_delta_pp', terCfg?.decimals ?? 2);
    const humanPts = (wc.metrics.find((m: any) => m.id === 'human_capital')?.thresholds ?? []).find((t: any) => t.status === humanStatus)?.pts ?? 5;
    const execNeutral = wc.metrics.find((m: any) => m.id === 'execution_fidelity')?.neutral_pts_when_insufficient ?? 6;
    const total = pfireR.pts + srR.pts + driftR.pts + ipcaR.pts + execNeutral + emergR.pts + terR.pts + humanPts;
    const statuses = [pfireR.status, srR.status, driftR.status, ipcaR.status, emergR.status, terR.status];
    const badCount = statuses.filter((s) => s !== 'green').length;
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

  // Boldin-style 3 tiers (G/Y/R) + arredondamento — sem interpolação.
  // Cf. wellnessTier.ts e wellness_config.json v3.0.
  const pfireCfg = wc.metrics.find((m: any) => m.id === 'pfire');
  const pfireR = tierByMin(pfireBaseVal, pfireCfg?.thresholds ?? [], 'min', pfireCfg?.decimals ?? 1);
  const srCfg = wc.metrics.find((m: any) => m.id === 'savings_rate');
  const srR = tierByMin(savingsRate, srCfg?.thresholds ?? [], 'min_pct', srCfg?.decimals ?? 1);
  const driftCfg = wc.metrics.find((m: any) => m.id === 'drift');
  const driftR = tierByMax(maxDriftVal, driftCfg?.thresholds ?? [], 'max_pp', driftCfg?.decimals ?? 1);
  const ipcaCfg = wc.metrics.find((m: any) => m.id === 'ipca_gap');
  const ipcaRaw: { status: WellnessStatus; pts: number } = ipcaGapPp == null
    ? { status: 'yellow', pts: ipcaCfg?.thresholds?.find((t: any) => t.status === 'yellow')?.pts ?? 6 }
    : tierByMax(ipcaGapPp, ipcaCfg?.thresholds ?? [], 'max_pp', ipcaCfg?.decimals ?? 1);
  const ipcaR = promoteTier(ipcaRaw, ipcaCfg?.thresholds ?? [], dcaAtivo && ipcaCfg?.dca_promotes_tier === true);
  const execCfg = wc.metrics.find((m: any) => m.id === 'execution_fidelity');
  const execPts = execCfg?.neutral_pts_when_insufficient ?? 6;
  const execStatus: WellnessStatus = 'yellow'; // sem dados suficientes
  const reservaBrl = data.rf?.ipca2029?.valor ?? 0;
  const months = custoMensal > 0 ? reservaBrl / custoMensal : 0;
  const emergCfg = wc.metrics.find((m: any) => m.id === 'emergency_fund');
  const emergR = tierByMin(months, emergCfg?.thresholds ?? [], 'min_months', emergCfg?.decimals ?? 1);
  const terCfg = wc.metrics.find((m: any) => m.id === 'ter');
  const terDelta = (terCfg?.current_ter ?? terAtual) - (terCfg?.benchmark_ter ?? 0.22);
  const terR = tierByMax(terDelta, terCfg?.thresholds ?? [], 'max_delta_pp', terCfg?.decimals ?? 2);

  const humanThresh = wc.metrics.find((m: any) => m.id === 'human_capital')?.thresholds ?? [];
  const humanMatch = humanThresh.find((t: any) => t.status === humanCapitalStatus);
  const humanPts = humanMatch?.pts ?? 5;
  const humanStatus: WellnessStatus = humanMatch?.tier ?? 'green';

  const allMetrics = [
    { id: 'pfire', label: 'P(FIRE) base', pts: pfireR.pts, max: 35, status: pfireR.status, detail: `${pfireBaseVal.toFixed(1)}%`, description: pfireCfg?.description ?? '' },
    { id: 'savings_rate', label: 'Savings rate', pts: srR.pts, max: 15, status: srR.status, detail: `${savingsRate.toFixed(1)}%`, description: srCfg?.description ?? '' },
    { id: 'drift', label: 'Drift máximo', pts: driftR.pts, max: 15, status: driftR.status, detail: `${maxDriftVal.toFixed(1)}pp`, description: driftCfg?.description ?? '' },
    { id: 'ipca_gap', label: 'IPCA+ gap vs alvo', pts: ipcaR.pts, max: 10, status: ipcaR.status, detail: ipcaGapPp != null ? `${ipcaGapPp.toFixed(1)}pp${dcaAtivo ? ' (DCA ativo)' : ''}` : 'n/d', description: ipcaCfg?.description ?? '' },
    { id: 'execution_fidelity', label: 'Exec. aportes', pts: execPts, max: 10, status: execStatus, detail: 'dados insuf.', description: execCfg?.description ?? '' },
    { id: 'emergency_fund', label: 'Fundo emergência', pts: emergR.pts, max: 5, status: emergR.status, detail: `${reservaBrl > 0 ? (reservaBrl / custoMensal).toFixed(1) : '?'}m`, description: emergCfg?.description ?? '' },
    { id: 'ter', label: 'TER vs VWRA', pts: terR.pts, max: 5, status: terR.status, detail: `${terDelta >= 0 ? '+' : ''}${(terDelta * 100).toFixed(1)}bp`, description: terCfg?.description ?? '' },
    { id: 'human_capital', label: 'Capital humano', pts: humanPts, max: 5, status: humanStatus, detail: humanCapitalStatus.replaceAll('_', ' '), description: wc.metrics.find((m: any) => m.id === 'human_capital')?.description ?? '' },
  ].map(m => ({ ...m, isOk: m.status === 'green' }));

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

  const renderBar = (pts: number, max: number, status: WellnessStatus) => {
    const bg = status === 'green' ? 'var(--green)' : status === 'yellow' ? 'var(--yellow)' : 'var(--red)';
    return (
      <div className="flex-1 bg-slate-700/40 rounded-sm h-1.5 relative overflow-hidden min-w-16">
        <div className="h-full rounded-sm" style={{ width: `${(pts / max) * 100}%`, background: bg }} />
      </div>
    );
  };

  const renderMetricRow = (m: typeof allMetrics[0]) => (
    <div key={m.id} className="flex items-center gap-2 mb-1.5">
      <div className="text-xs w-4 flex-shrink-0">{m.status === 'green' ? <CheckCircle size={14} className="text-green" /> : <AlertCircle size={14} className={m.status === 'yellow' ? 'text-yellow' : 'text-red'} />}</div>
      <div className="text-xs text-muted w-36 flex-shrink-0 truncate">{m.label}</div>
      {renderBar(m.pts, m.max, m.status)}
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
