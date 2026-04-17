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
import type { EChartsOption } from 'echarts-for-react';

interface SurplusGapChartProps {
  data: any;
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

export function SurplusGapChart({ data }: SurplusGapChartProps) {
  const privacyMode = useUiStore(s => s.privacyMode);

  const { years, surplusP10, surplusP50, surplusP90 } = useMemo(() => {
    const trilha = data?.fire_trilha;
    const premissas = data?.premissas ?? {};
    const custo_vida_base: number = premissas.custo_vida_base ?? 250_000;
    const swr_rate: number = premissas.swr_gatilho ?? 0.03;
    const inss_anual: number = premissas.inss_anual ?? 18_000;
    const inss_inicio_ano: number = premissas.inss_inicio_ano ?? 2052; // idade 65 ≈ 2026+26
    const inss_katia_anual: number = premissas.inss_katia_anual ?? 0;
    // INSS Katia starts at ~age 60 for Katia (estimate: 2049)
    const inss_katia_inicio = 2049;
    const tem_conjuge: boolean = premissas.tem_conjuge ?? false;

    const years = buildYears(2026, 2080);

    const p10Map = trilha ? collapseToYearMap(trilha.dates ?? [], trilha.trilha_p10_brl ?? []) : new Map<number, number>();
    const p50Map = trilha ? collapseToYearMap(trilha.dates ?? [], trilha.trilha_brl ?? []) : new Map<number, number>();
    const p90Map = trilha ? collapseToYearMap(trilha.dates ?? [], trilha.trilha_p90_brl ?? []) : new Map<number, number>();

    // Get last known value for extrapolation after trilha ends
    const lastYear = trilha?.dates?.length ? parseInt(trilha.dates[trilha.dates.length - 1].slice(0, 4), 10) : 2040;
    const lastP10 = p10Map.get(lastYear) ?? 0;
    const lastP50 = p50Map.get(lastYear) ?? 0;
    const lastP90 = p90Map.get(lastYear) ?? 0;

    // Extrapolate beyond trilha with SWR drawdown model
    const RETORNO_REAL = 0.0485; // from premissas

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

    const fireYear = 2039; // approximate
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
  }, [data]);

  const fmtK = (v: number) => {
    if (privacyMode) return '••••';
    const sign = v >= 0 ? '+' : '';
    return `${sign}R$${(v / 1000).toFixed(0)}k`;
  };

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const yr = params[0]?.name ?? '';
        if (privacyMode) return `${yr}: ••••`;
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
    legend: { data: ['P90 (favorável)', 'P50 (base)', 'P10 (stress)'], bottom: 0, textStyle: { color: 'var(--text)' } },
    grid: { left: 60, right: 20, top: 20, bottom: 50 },
    xAxis: {
      type: 'category',
      data: years.map(String),
      axisLabel: { color: 'var(--muted)', interval: 9 },
      axisLine: { lineStyle: { color: 'var(--border)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: 'var(--muted)',
        formatter: (v: number) => privacyMode ? '••' : `${v >= 0 ? '+' : ''}R$${(v / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: 'var(--border)', type: 'dashed' } },
    },
    markLine: {
      data: [{ yAxis: 0, lineStyle: { color: 'var(--muted)', type: 'solid', width: 1 } }],
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
          itemStyle: { color: v >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.9)' },
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
