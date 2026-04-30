'use client';

/**
 * ContributionReturnsCrossover — Histórico + projeção de rentabilidade vs aportes
 *
 * Extracted from fire/page.tsx (ARCH P2: sub-component extraction).
 * Shows annual returns vs annual contributions with crossover annotation.
 * Toggle nominal/real removido: com aportes fixos nominais, deflacionar pelos dois
 * lados não altera o crossover — a leitura é matematicamente idêntica.
 */

import { useMemo } from 'react';
import { EC, EC_AXIS_LABEL, EC_AXIS_LINE, EC_SPLIT_LINE, EC_TOOLTIP } from '@/utils/echarts-theme';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { EChart } from '@/components/primitives/EChart';
import { fmtPrivacy } from '@/utils/privacyTransform';

interface CrossoverTooltipParam {
  axisValue?: string;
  value?: number | null;
  seriesName?: string;
  marker?: string;
}
interface CrossoverDataPoint {
  ano: number;
  aporte_brl: number;
  ganho_mercado_brl: number;
  ganho_real_brl?: number;
  aporte_real_brl?: number;
  patrimonio_inicio_brl?: number;
  tipo: 'historico' | 'estimado' | 'projecao';
  parcial?: boolean;
  // Capital inicial (2021 XP, 2022 FIIs) — distingue de DCA recorrente
  capital_inicial_brl?: number;
  aporte_dca_brl?: number;
  nota?: string;
  meses_realizados?: number;
}

interface ContributionReturnsCrossoverData {
  historico: CrossoverDataPoint[];
  projecao: {
    base: CrossoverDataPoint[];
    fav: CrossoverDataPoint[];
    stress: CrossoverDataPoint[];
  };
  taxa_nominal_base: number;
  taxa_nominal_fav: number;
  taxa_nominal_stress: number;
  aporte_anual: number;
  ipca_projecao: number;
  crossover_historico_nominal_ano: number | null;
  crossover_projecao_nominal_ano: number | null;
  crossover_projecao_real_ano: number | null;
}

export function ContributionReturnsCrossover({
  data: crc,
  privacyMode,
}: {
  data: ContributionReturnsCrossoverData;
  privacyMode: boolean;
}) {
  const { pv, pvLabel } = useEChartsPrivacy();

  // Merge historical (incl. 'estimado') + base projection into unified series
  const allYears = useMemo(() => {
    const hist = crc.historico ?? [];
    const proj = crc.projecao?.base ?? [];
    // Pipeline já exclui ANO_ATUAL da projeção (começa ANO_ATUAL+1)
    const histYears = new Set(hist.map(h => h.ano));
    const projFiltered = proj.filter(p => !histYears.has(p.ano));
    return [...hist, ...projFiltered];
  }, [crc]);

  const favProj = useMemo(() => {
    const fav = crc.projecao?.fav ?? [];
    const histYears = new Set((crc.historico ?? []).map(h => h.ano));
    return fav.filter(p => !histYears.has(p.ano));
  }, [crc]);

  const stressProj = useMemo(() => {
    const stress = crc.projecao?.stress ?? [];
    const histYears = new Set((crc.historico ?? []).map(h => h.ano));
    return stress.filter(p => !histYears.has(p.ano));
  }, [crc]);

  // "2026†" para estimado (dagger), string pura para outros
  const labels = allYears.map(d => d.tipo === 'estimado' ? `${d.ano}†` : String(d.ano));
  const isHist = allYears.map(d => d.tipo === 'historico');
  const isParcial = allYears.map(d => d.tipo === 'estimado');
  // Anos com capital inicial não-DCA (2021 XP, 2022 FIIs)
  const hasCapitalInicial = allYears.map(d => (d.capital_inicial_brl ?? 0) > 0);

  // ── Chart 1: Valor Absoluto (R$) ─────────────────────────────────────────
  const aportesSeries = allYears.map(d => d.aporte_brl);
  const ganhosSeries = allYears.map(d => d.ganho_mercado_brl);
  const favSeries = allYears.map((d) => {
    if (d.tipo === 'historico') return null;
    const fp = favProj.find(p => p.ano === d.ano);
    return fp ? fp.ganho_mercado_brl : null;
  });
  const stressSeries = allYears.map((d) => {
    if (d.tipo === 'historico') return null;
    const sp = stressProj.find(p => p.ano === d.ano);
    return sp ? sp.ganho_mercado_brl : null;
  });

  // Crossover annotation year (nominal only — toggle removido)
  const crossYear = crc.crossover_historico_nominal_ano ?? crc.crossover_projecao_nominal_ano;

  const optionAbsoluto = useMemo(() => {
    const crossIdx = crossYear != null ? labels.indexOf(String(crossYear)) : -1;
    return {
      animation: false,
      // Fix 1: legenda explícita — ECharts não deriva legenda automaticamente quando há series silent/unnamed
      legend: {
        data: ['Rentabilidade Anual', 'Aportes Anuais'],
        bottom: 4,
        right: 16,
        textStyle: { color: EC.muted, fontSize: 11 },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 52 },
      tooltip: {
        trigger: 'axis' as const,
        ...EC_TOOLTIP,
        formatter: (params: CrossoverTooltipParam[]) => {
          const year = params[0]?.axisValue ?? '';
          const yearNum = parseInt(year);
          const pt = allYears.find(d => d.ano === yearNum);
          const lines = params
            .filter(p => p.value != null && p.seriesName !== 'Banda (fav-stress)')
            .map(p => {
              const v = typeof p.value === 'number' ? pvLabel(p.value) : '—';
              return `<div>${p.marker}${p.seriesName}: <b>${v}</b></div>`;
            })
            .join('');
          let extraNote = '';
          if (pt?.tipo === 'estimado') {
            extraNote = `<div style="color:${EC.yellow};margin-top:4px;font-size:11px">&#9888; ${pt.nota ?? 'Estimado'}</div>`;
          } else if (pt?.capital_inicial_brl) {
            const cap = pt.capital_inicial_brl.toLocaleString('pt-BR');
            const dca = (pt.aporte_dca_brl ?? 0).toLocaleString('pt-BR');
            extraNote = `<div style="color:${EC.muted};margin-top:4px;font-size:11px">Capital inicial: R$${cap} | DCA: R$${dca}</div>`;
          }
          return `<div style="font-size:12px"><b>${year}</b><br/>${lines}${extraNote}</div>`;
        },
      },
      xAxis: {
        type: 'category' as const,
        data: labels,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: { ...EC_AXIS_LABEL, fontSize: 11 },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        splitLine: EC_SPLIT_LINE,
        axisLabel: {
          ...EC_AXIS_LABEL,
          formatter: (v: number) => pvLabel(v),
        },
      },
      series: [
        // Banda fav-stress (área sombreada) — apenas projeção
        {
          name: 'Banda (fav-stress)',
          type: 'line' as const,
          data: favSeries.map((v, i) => v != null && stressSeries[i] != null ? pv(v) : null),
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0.15, color: EC.accent },
          stack: 'banda_upper',
          symbol: 'none',
          showSymbol: false,
          silent: true,
          // Excluir da legenda — é shape auxiliar
          legendHoverLink: false,
        },
        {
          name: 'Banda (fav-stress)',
          type: 'line' as const,
          data: stressSeries.map(v => v != null ? pv(v) : null),
          lineStyle: { opacity: 0 },
          areaStyle: { opacity: 0, color: 'transparent' },
          stack: 'banda_upper',
          symbol: 'none',
          showSymbol: false,
          silent: true,
          legendHoverLink: false,
        },
        // Aportes Anuais — estimado com opacidade 80%, capital inicial com diamante amarelo
        {
          name: 'Aportes Anuais',
          type: 'line' as const,
          data: aportesSeries.map((v, i) => ({
            value: pv(v),
            symbol: hasCapitalInicial[i] ? 'diamond' : undefined,
            symbolSize: hasCapitalInicial[i] ? 10 : undefined,
            itemStyle: isParcial[i]
              ? { color: EC.muted, opacity: 0.6 }
              : hasCapitalInicial[i]
                ? { color: EC.yellow, opacity: 0.9 }
                : { color: EC.muted },
          })),
          lineStyle: { color: EC.muted, width: 2 },
          itemStyle: { color: EC.muted },
          symbol: 'circle',
          symbolSize: 5,
          smooth: false,
        },
        // Rentabilidade Anual — estimado com opacidade 80%
        {
          name: 'Rentabilidade Anual',
          type: 'line' as const,
          data: ganhosSeries.map((v, i) => ({
            value: pv(v),
            itemStyle: isParcial[i] ? { color: EC.accent, opacity: 0.6 } : { color: EC.accent },
          })),
          lineStyle: { color: EC.accent, width: 2.5 },
          itemStyle: { color: EC.accent },
          symbol: 'circle',
          symbolSize: 5,
          smooth: false,
          markLine: crossIdx >= 0 ? {
            silent: true,
            data: [{ xAxis: crossIdx }],
            label: { show: true, formatter: `Crossover ${crossYear}`, position: 'insideEndTop', fontSize: 11, color: EC.yellow },
            lineStyle: { type: 'dashed' as const, color: EC.yellow, width: 1.5 },
          } : undefined,
        },
      ],
    };
  }, [allYears, aportesSeries, ganhosSeries, favSeries, stressSeries, crossYear, labels, isParcial, isHist, hasCapitalInicial, pv, pvLabel]);

  const fmtAnno = (v: number | null) => v != null ? String(v) : '—';

  return (
    <div style={{ padding: '0 16px 16px' }} data-testid="contribuicao-retorno-crossover">
      {/* Header info strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ marginBottom: 12 }}>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Cross. Histórico</div>
          <div style={{ fontWeight: 700, color: EC.accent, fontSize: '1.1rem' }} data-testid="crossover-historico-ano">
            {fmtAnno(crc.crossover_historico_nominal_ano)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>primeiro ganho &gt; aporte</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Cross. Projetado Nominal</div>
          <div style={{ fontWeight: 700, color: EC.accent, fontSize: '1.1rem' }} data-testid="crossover-projecao-nominal-ano">
            {fmtAnno(crc.crossover_projecao_nominal_ano)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{(crc.taxa_nominal_base * 100).toFixed(0)}% nominal cenário base</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Cross. Projetado Real</div>
          <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: '1.1rem' }} data-testid="crossover-projecao-real-ano">
            {fmtAnno(crc.crossover_projecao_real_ano)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>deflacionado IPCA {(crc.ipca_projecao * 100).toFixed(0)}%</div>
        </div>
        <div style={{ background: 'var(--card2)', borderRadius: 8, padding: '8px 12px' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 2 }}>Aporte Anual</div>
          <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1.1rem' }}>
            {fmtPrivacy(crc.aporte_anual, privacyMode)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>nominal fixo na projeção</div>
        </div>
      </div>

      <EChart option={optionAbsoluto} style={{ height: 320 }} />

      {/* Notes */}
      <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        Linha sólida = histórico real. Linha tracejada = projeção. Banda = cenários {(crc.taxa_nominal_stress * 100).toFixed(0)}%–{(crc.taxa_nominal_fav * 100).toFixed(0)}% nominal.
        Diamante amarelo = aporte inclui capital inicial não-DCA (2021: conversão XP R$252k; 2022: FIIs Jan R$72k).
        † 2026 = Jan–Abr realizado + Mai–Dez estimado @ R$25.000/mês e 9% nominal.
      </div>
    </div>
  );
}
