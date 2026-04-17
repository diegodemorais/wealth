/**
 * useWellnessScore — extracts the Financial Wellness Score calculation
 * previously inlined as an IIFE in page.tsx
 */
export function useWellnessScore(data: any, derived: any) {
  if (!data?.wellness_config?.metrics || !derived) {
    return null;
  }

  const wc = data.wellness_config;
  const pfireBaseVal: number = derived.pfireBase ?? 0; // 0-100
  const aporteMensalVal: number = data.premissas?.aporte_mensal ?? 0;
  const custoVidaBase: number = data.premissas?.custo_vida_base ?? 0;
  const custoMensal: number = custoVidaBase / 12;
  const savingsRate: number =
    aporteMensalVal > 0 ? (aporteMensalVal / (aporteMensalVal + custoMensal)) * 100 : 0;
  const maxDriftVal: number = data?.drift
    ? Math.max(
        0,
        ...Object.entries(data.drift as Record<string, any>)
          .filter(([k]) => k !== 'Custo')
          .map(([, d]) => Math.abs((d?.atual || 0) - (d?.alvo || 0)))
      )
    : 0;
  const ipcaGapPp: number | null = data.dca_status?.ipca_longo?.gap_alvo_pp ?? null;
  const dcaAtivo: boolean = data.dca_status?.ipca_longo?.ativo ?? false;
  const terAtual: number =
    data.drift?.['Custo']?.atual ??
    (data.wellness_config?.metrics?.find((m: any) => m.id === 'ter')?.current_ter ?? 0.247);
  const humanCapitalStatus: string =
    data.wellness_config?.metrics?.find((m: any) => m.id === 'human_capital')?.status ??
    'solteiro_sem_dependentes';

  // pfire pts
  const pfirePts: number = (() => {
    const thresholds = wc.metrics.find((m: any) => m.id === 'pfire')?.thresholds ?? [];
    for (const t of thresholds) {
      if (pfireBaseVal >= t.min) return t.pts;
    }
    return 0;
  })();

  // savings_rate pts
  const savingsRatePts: number = (() => {
    const thresholds = wc.metrics.find((m: any) => m.id === 'savings_rate')?.thresholds ?? [];
    for (const t of thresholds) {
      if (savingsRate >= t.min_pct) return t.pts;
    }
    return 0;
  })();

  // drift pts
  const driftPts: number = (() => {
    const thresholds = wc.metrics.find((m: any) => m.id === 'drift')?.thresholds ?? [];
    for (const t of thresholds) {
      if (maxDriftVal <= t.max_pp) return t.pts;
    }
    return 0;
  })();

  // ipca_gap pts
  const ipcaGapPts: number = (() => {
    if (ipcaGapPp == null) return 5;
    const thresholds = wc.metrics.find((m: any) => m.id === 'ipca_gap')?.thresholds ?? [];
    for (const t of thresholds) {
      if (ipcaGapPp <= t.max_pp) {
        return t.pts ?? (dcaAtivo ? (t.pts_if_dca ?? t.pts ?? 5) : (t.pts ?? 3));
      }
    }
    return dcaAtivo ? 5 : 3;
  })();

  // execution_fidelity — neutral 7pts if data insufficient
  const execPts = 7;

  // emergency_fund
  const emergencyPts: number = (() => {
    const reservaBrl = data.rf?.ipca2029?.valor ?? 0;
    const months = custoMensal > 0 ? reservaBrl / custoMensal : 0;
    const thresholds = wc.metrics.find((m: any) => m.id === 'emergency_fund')?.thresholds ?? [];
    for (const t of thresholds) {
      if (months >= t.min_months) return t.pts;
    }
    return 0;
  })();

  // ter pts
  const terPts: number = (() => {
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
  const humanPts: number = (() => {
    const thresholds = wc.metrics.find((m: any) => m.id === 'human_capital')?.thresholds ?? [];
    const match = thresholds.find((t: any) => t.status === humanCapitalStatus);
    return match ? match.pts : 5;
  })();

  // debt_ratio pts (D1 DEV-boldin-dashboard)
  const debtRatioPts: number = (() => {
    const passivos = data?.passivos;
    const patrimonioTotal = data?.premissas?.patrimonio_atual ?? 0;
    if (!passivos || patrimonioTotal <= 0) return 3; // neutral fallback
    const debtRatioPct = (passivos.total_brl / patrimonioTotal) * 100;
    const thresholds = wc.metrics.find((m: any) => m.id === 'debt_ratio')?.thresholds ?? [];
    for (const t of thresholds) {
      if (debtRatioPct <= t.max_pct) return t.pts;
    }
    return 0;
  })();

  // housing_ratio pts (D1 DEV-boldin-dashboard)
  const housingRatioPts: number = (() => {
    const passivos = data?.passivos;
    const patrimonioTotal = data?.premissas?.patrimonio_atual ?? 0;
    if (!passivos || patrimonioTotal <= 0) return 3; // neutral fallback
    const housingRatioPct = (passivos.hipoteca_brl / patrimonioTotal) * 100;
    const thresholds = wc.metrics.find((m: any) => m.id === 'housing_ratio')?.thresholds ?? [];
    for (const t of thresholds) {
      if (housingRatioPct <= t.max_pct) return t.pts;
    }
    return 0;
  })();

  const debtRatioPct = (() => {
    const passivos = data?.passivos;
    const patrimonioTotal = data?.premissas?.patrimonio_atual ?? 0;
    if (!passivos || patrimonioTotal <= 0) return null;
    return (passivos.total_brl / patrimonioTotal) * 100;
  })();

  const housingRatioPct = (() => {
    const passivos = data?.passivos;
    const patrimonioTotal = data?.premissas?.patrimonio_atual ?? 0;
    if (!passivos || patrimonioTotal <= 0) return null;
    return (passivos.hipoteca_brl / patrimonioTotal) * 100;
  })();

  const allMetrics = [
    {
      id: 'pfire',
      label: 'P(FIRE) base',
      pts: pfirePts,
      max: 35,
      detail: `${pfireBaseVal.toFixed(1)}%`,
      description: wc.metrics.find((m: any) => m.id === 'pfire')?.description ?? '',
    },
    {
      id: 'savings_rate',
      label: 'Savings rate',
      pts: savingsRatePts,
      max: 15,
      detail: `${savingsRate.toFixed(1)}%`,
      description: wc.metrics.find((m: any) => m.id === 'savings_rate')?.description ?? '',
    },
    {
      id: 'drift',
      label: 'Drift máximo',
      pts: driftPts,
      max: 15,
      detail: `${maxDriftVal.toFixed(1)}pp`,
      description: wc.metrics.find((m: any) => m.id === 'drift')?.description ?? '',
    },
    {
      id: 'ipca_gap',
      label: 'IPCA+ gap vs alvo',
      pts: ipcaGapPts,
      max: 10,
      detail: ipcaGapPp != null ? `${ipcaGapPp.toFixed(1)}pp` : 'n/d',
      description: wc.metrics.find((m: any) => m.id === 'ipca_gap')?.description ?? '',
    },
    {
      id: 'execution_fidelity',
      label: 'Exec. aportes',
      pts: execPts,
      max: 10,
      detail: 'dados insuf.',
      description: wc.metrics.find((m: any) => m.id === 'execution_fidelity')?.description ?? '',
    },
    {
      id: 'emergency_fund',
      label: 'Fundo emergência',
      pts: emergencyPts,
      max: 5,
      detail: `${(data.rf?.ipca2029?.valor ?? 0) > 0 ? ((data.rf.ipca2029.valor / custoMensal)).toFixed(1) : '?'}m`,
      description: wc.metrics.find((m: any) => m.id === 'emergency_fund')?.description ?? '',
    },
    {
      id: 'ter',
      label: 'TER vs VWRA',
      pts: terPts,
      max: 5,
      detail: (() => {
        const terCfg = wc.metrics.find((m: any) => m.id === 'ter');
        const delta = (terCfg?.current_ter ?? terAtual) - (terCfg?.benchmark_ter ?? 0.22);
        return `${delta >= 0 ? '+' : ''}${(delta * 100).toFixed(1)}bp`;
      })(),
      description: wc.metrics.find((m: any) => m.id === 'ter')?.description ?? '',
    },
    {
      id: 'human_capital',
      label: 'Capital humano',
      pts: humanPts,
      max: 5,
      detail: humanCapitalStatus.replace('_', ' '),
      description: wc.metrics.find((m: any) => m.id === 'human_capital')?.description ?? '',
    },
    {
      id: 'debt_ratio',
      label: 'Ratio dívida/pat.',
      pts: debtRatioPts,
      max: 5,
      detail: debtRatioPct != null ? `${debtRatioPct.toFixed(1)}%` : 'n/d',
      description: wc.metrics.find((m: any) => m.id === 'debt_ratio')?.description ?? '',
    },
    {
      id: 'housing_ratio',
      label: 'Hipoteca/Pat.',
      pts: housingRatioPts,
      max: 5,
      detail: housingRatioPct != null ? `${housingRatioPct.toFixed(1)}%` : 'n/d',
      description: wc.metrics.find((m: any) => m.id === 'housing_ratio')?.description ?? '',
    },
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
    debt_ratio: 'Amortizar passivos ou aumentar patrimônio financeiro',
    housing_ratio: 'Reduzir saldo devedor hipotecário ou crescer patrimônio',
  };

  const topAcoes = [...allMetrics]
    .filter(m => !m.isOk)
    .sort((a, b) => b.max - b.pts - (a.max - a.pts))
    .slice(0, 3);

  return {
    totalScore,
    allMetrics,
    badMetrics,
    goodMetrics,
    topAcoes,
    actionDescriptions,
    custoMensal,
    data,
  };
}
