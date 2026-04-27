'use client';

/**
 * SurplusGapChart — F2 DEV-boldin-dashboard
 *
 * Exibe superávit/déficit anual por percentil (P10/P50/P90) de 2026 a 2080.
 * Calculado inteiramente no frontend a partir de data.json:
 *   surplus_pX_t = (patrimonio_pX_t × SWR) + renda_passiva_t − spending_t
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useUiStore } from '@/store/uiStore';
import { useConfig } from '@/hooks/useConfig';
import type { EChartsOption } from 'echarts-for-react';
import { fmtPrivacy } from '@/utils/privacyTransform';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

interface SurplusGapChartProps {
  data: any;
  premissasOverride?: {
    custo_vida_base?: number;
    tem_conjuge?: boolean;
    inss_katia_anual?: number;
  };
}

function buildYears(start: number, end: number) {
  const years = [];
  for (let y = start; y <= end; y++) years.push(y);
  return years;
}

/** Mapeia dates ["2026-04", ...] → ano → último valor desse ano */
function collapseToYearMap(dates: string[], values: number[]): Map<number, number> {
  const m = new Map<number, number>();
  for (let i = 0; i < dates.length; i++) {
    const yr = parseInt(dates[i].slice(0, 4), 10);
    m.set(yr, values[i]); // último valor do ano prevalece
  }
  return m;
}

/** Spending smile fator por ano (anos após FIRE = 53 + 2026 = 2039) */
function spendingSmile(year: number, fireYear: number): number {
  const age = 39 + (year - 2026);
  if (age < 65) return 1.0;   // Go-Go (pré-65)
  if (age < 75) return 0.90;  // Slow-Go
  return 0.80;                 // No-Go (75+, SAUDE_DECAY 0.5 → spending cai)
}

export function SurplusGapChart({ data, premissasOverride }: SurplusGapChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);
  const { config } = useConfig();

  const { years, surplusP10, surplusP50, surplusP90 } = useMemo(() => {
    const trilha = data?.fire_trilha;
    const premissas = data?.premissas ?? {};
    const custo_vida_base: number = premissasOverride?.custo_vida_base ?? premissas.custo_vida_base ?? 250_000;
    const swr_rate: number = premissas.swr_gatilho ?? 0.03;
    const inss_anual: number = premissas.inss_anual ?? 18_000;
    // inss_inicio_ano pode ser anos-pós-FIRE (ex: 12) ou ano calendário (ex: 2052).
    // Se < 100 → relativo: converter para ano calendário (fireYear + offset).
    const fireYear = 2039; // aproximado: Diego FIRE aos 53 ≈ 2039
    const inssInicioRaw: number = premissas.inss_inicio_ano ?? 12;
    const inss_inicio_ano: number = inssInicioRaw < 100 ? fireYear + inssInicioRaw : inssInicioRaw;
    const inss_katia_anual: number = premissasOverride?.inss_katia_anual ?? premissas.inss_katia_anual ?? 0;
    // INSS Katia starts at ~age 60 for Katia (estimate: 2049)
    const inss_katia_inicio = 2049;
    const tem_conjuge: boolean = premissasOverride?.tem_conjuge ?? premissas.tem_conjuge ?? false;

    const years = buildYears(2026, 2080);

    // ── DOWNSAMPLING: 226 monthly → ~20 annual pre-FIRE ──
    // Ensures proportional representation of post-FIRE period
    const downsampledDates: string[] = [];
    const downsampledP10: number[] = [];
    const downsampledP50: number[] = [];
    const downsampledP90: number[] = [];

    let currentYear: string | null = null;
    const rawDates = trilha?.dates ?? [];
    const rawP10 = trilha?.trilha_p10_brl ?? [];
    const rawP50 = trilha?.trilha_brl ?? [];
    const rawP90 = trilha?.trilha_p90_brl ?? [];

    for (let i = 0; i < rawDates.length; i++) {
      const year = rawDates[i].slice(0, 4);
      if (year !== currentYear) {
        downsampledDates.push(rawDates[i]);
        downsampledP10.push(rawP10[i]);
        downsampledP50.push(rawP50[i]);
        downsampledP90.push(rawP90[i]);
        currentYear = year;
      }
    }

    const p10Map = downsampledDates.length > 0 ? collapseToYearMap(downsampledDates, downsampledP10) : new Map<number, number>();
    const p50Map = downsampledDates.length > 0 ? collapseToYearMap(downsampledDates, downsampledP50) : new Map<number, number>();
    const p90Map = downsampledDates.length > 0 ? collapseToYearMap(downsampledDates, downsampledP90) : new Map<number, number>();

    // Get last known value for extrapolation after trilha ends
    const lastYear = downsampledDates.length ? parseInt(downsampledDates[downsampledDates.length - 1].slice(0, 4), 10) : 2040;
    const lastP10 = p10Map.get(lastYear) ?? 0;
    const lastP50 = p50Map.get(lastYear) ?? 0;
    const lastP90 = p90Map.get(lastYear) ?? 0;

    // Extrapolate beyond trilha with SWR drawdown model (blended post-FIRE returns)
    const RETORNO_REAL: number = config.ui?.surplusGap?.retornoReal ?? 0.035;  // Blended portfolio: 2.5-4.5% (post-FIRE glide path, not pure equity)

    function getPatrimonio(map: Map<number, number>, last: number, year: number): number {
      if (map.has(year)) return map.get(year)!;
      // Extrapolate: last value × (1 + retorno - swr)^(year - lastYear)
      const deltaYr = year - lastYear;
      const growth = Math.pow(1 + RETORNO_REAL - swr_rate, deltaYr);
      return Math.max(0, last * growth);
    }

    const surplusP10: number[] = [];
    const surplusP50: number[] = [];
    const surplusP90: number[] = [];

    for (const yr of years) {
      const spending = custo_vida_base * spendingSmile(yr, fireYear);
      const inss = yr >= inss_inicio_ano ? inss_anual : 0;
      const inssKatia = (tem_conjuge && yr >= inss_katia_inicio) ? inss_katia_anual : 0;
      const rendaPassiva = inss + inssKatia;

      const patP10 = getPatrimonio(p10Map, lastP10, yr);
      const patP50 = getPatrimonio(p50Map, lastP50, yr);
      const patP90 = getPatrimonio(p90Map, lastP90, yr);

      surplusP10.push(Math.round(patP10 * swr_rate + rendaPassiva - spending));
      surplusP50.push(Math.round(patP50 * swr_rate + rendaPassiva - spending));
      surplusP90.push(Math.round(patP90 * swr_rate + rendaPassiva - spending));
    }

    return { years, surplusP10, surplusP50, surplusP90 };
  }, [data, premissasOverride]);

  const fmtK = (v: number) => {
    const sign = v >= 0 ? '+' : '';
    return `${sign}${fmtPrivacy(Math.abs(v), privacyMode)}`;
  };

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const yr = params[0]?.name ?? '';
        // fmtK already handles privacy transform
        return [
          `<b>Ano ${yr}</b>`,
          ...params.map((p: any) => {
            const v: number = p.value;
            const color = v >= 0 ? '#22c55e' : '#ef4444';
            return `<span style="color:${color}">${p.seriesName}: ${fmtK(v)}</span>`;
          }),
        ].join('<br/>');
      },
    },
    legend: {
      data: [
        { name: 'P90 (favorável)', itemStyle: { color: '#22c55e' } },
        { name: 'P50 (base)',      itemStyle: { color: '#eab308' } },
        { name: 'P10 (stress)',    itemStyle: { color: '#fb923c' } },
      ],
      bottom: 0,
      textStyle: { color: '#94a3b8' },
    },
    grid: { left: 60, right: 20, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      data: years.map(String),
      axisLabel: { color: '#94a3b8', interval: 9 },
      axisLine: { lineStyle: { color: '#334155' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#94a3b8',
        formatter: (v: number) => `${v >= 0 ? '+' : ''}${fmtPrivacy(Math.abs(v), privacyMode)}`,
      },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
    },
    markLine: {
      data: [{ yAxis: 0, lineStyle: { color: '#475569', type: 'solid', width: 1 } }],
    },
    series: [
      {
        name: 'P90 (favorável)',
        type: 'bar',
        data: surplusP90.map(v => ({
          value: v,
          itemStyle: { color: v >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.4)' },
        })),
        barMaxWidth: 8,
      },
      {
        name: 'P50 (base)',
        type: 'bar',
        data: surplusP50.map(v => ({
          value: v,
          itemStyle: { color: v >= 0 ? 'rgba(34,197,94,0.45)' : 'rgba(239,68,68,0.7)' },
        })),
        barMaxWidth: 8,
      },
      {
        name: 'P10 (stress)',
        type: 'bar',
        data: surplusP10.map(v => ({
          value: v,
          itemStyle: { color: v >= 0 ? 'rgba(251,146,60,0.75)' : 'rgba(239,68,68,0.9)' },
        })),
        barMaxWidth: 8,
      },
    ],
  };

  return (
    <div>
      <EChart option={option} style={{ height: 280 }} />
      <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: 4 }}>
        Superávit = (Patrimônio × SWR) + INSS − Gasto anual (spending smile Go-Go/Slow-Go/No-Go).
        P10/P50/P90 = fan chart Monte Carlo. Extrapolação pós-2040 via modelo de depleção (r real = 4,85%).
        Valores em R$ nominais 2026.
      </p>
    </div>
  );
}
