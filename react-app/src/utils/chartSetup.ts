/**
 * Chart Setup Factory — Centraliza builders ECharts
 * Reduz duplicação em componentes chart (goal: <50 linhas cada)
 *
 * IMPORTANT: ECharts and Chart.js render on <canvas> and cannot resolve
 * CSS custom properties (var(--x)). Always use explicit hex/rgb colors here.
 *
 * MIGRATION: New code should import EC from '@/utils/echarts-theme' directly.
 * CHART_COLORS is kept as a legacy alias pointing to the same values.
 */

import { DashboardData } from '@/types/dashboard';
import { EC } from '@/utils/echarts-theme';
export { EC };

/** @deprecated Use EC from '@/utils/echarts-theme' instead */
export const CHART_COLORS = {
  accent:  EC.accent,
  green:   EC.green,
  red:     EC.red,
  orange:  EC.orange,
  yellow:  EC.yellow,
  purple:  EC.purple,
  cyan:    EC.cyan,
  pink:    EC.pink,
  muted:   EC.muted,
  border:  EC.border2,
  card:    EC.card,
  text:    EC.text,
} as const;

export interface ChartTheme {
  tooltip: {
    backgroundColor: string;
    borderColor: string;
    textStyle: { color: string };
  };
  textStyle: { color: string };
  colors?: string[];
}

export interface BaseChartOptions {
  data: DashboardData;
  privacyMode: boolean;
  theme: ChartTheme;
}

/**
 * Base option template com tema aplicado
 */
export function createBaseOption(theme: ChartTheme, privacyMode: boolean) {
  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
    },
    legend: {
      display: !privacyMode,
      textStyle: { color: theme.textStyle.color },
      top: 10,
    },
    grid: {
      left: 60,
      right: 20,
      top: 40,
      bottom: 40,
      containLabel: true,
    },
  };
}

/**
 * Attribution Chart (Donut) — decomposes portfolio wealth by source
 */
export function createAttributionChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;
  const ta = (options.data as any)?.timeline_attribution ?? {};

  const dates: string[] = ta.dates ?? [];
  const aportes: number[] = ta.aportes ?? [];
  const equityUsd: number[] = ta.equity_usd ?? [];
  const cambio: number[] = ta.cambio ?? [];
  const rf: number[] = ta.rf ?? [];

  const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const xData = dates.map((ym: string) => {
    const [y, m] = ym.split('-');
    return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
  });

  const fmtAxis = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1e6) return `R$${(v / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `R$${Math.round(v / 1e3)}k`;
    return `R$${v}`;
  };
  const fmtTip = (v: number) => {
    if (privacyMode) return '••••';
    const abs = Math.abs(v);
    const sign = v < 0 ? '−R$' : 'R$';
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${sign}${Math.round(abs / 1e3)}k`;
    return `${sign}${abs}`;
  };

  const interval = Math.max(1, Math.floor(dates.length / 8));

  const series = [
    { name: 'Aportes',     data: aportes,   color: CHART_COLORS.accent  },
    { name: 'Equity USD',  data: equityUsd, color: CHART_COLORS.green   },
    { name: 'Retorno RF Brasil', data: rf,    color: CHART_COLORS.yellow  },
    { name: 'Câmbio/FX',  data: cambio,    color: CHART_COLORS.red     },
  ];

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any[]) => {
        if (!Array.isArray(params)) return '';
        let r = `${params[0].axisValueLabel}<br/>`;
        params.forEach((p: any) => {
          r += `${p.marker} ${p.seriesName}: ${fmtTip(p.value ?? 0)}<br/>`;
        });
        return r;
      },
    },
    legend: {
      top: 0,
      textStyle: { color: theme.textStyle.color, fontSize: 11 },
      itemWidth: 12,
      itemHeight: 10,
    },
    grid: { left: 60, right: 16, top: 28, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xData,
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: {
        color: privacyMode ? 'transparent' : '#8b949e',
        fontSize: 10,
        interval,
      },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : '#8b949e',
        fontSize: 10,
        formatter: privacyMode ? () => '••••' : fmtAxis,
      },
      splitLine: { lineStyle: { color: '#21262d' } },
    },
    series: series.map(s => ({
      name: s.name,
      type: 'line' as const,
      stack: 'total',
      smooth: true,
      symbolSize: 0,
      lineStyle: { width: 0 },
      areaStyle: { color: s.color, opacity: 0.85 },
      itemStyle: { color: s.color },
      data: s.data,
    })),
  };
}

/**
 * Donut Chart (Pie with hole)
 */
export function createDonutChartOption(options: BaseChartOptions) {
  const { data, privacyMode, theme } = options;

  const posicoes = data.posicoes || {};
  const cambio = data.cambio || 1;

  let totalUsd = 0;
  const buckets: Record<string, number> = { SWRD: 0, AVGS: 0, AVEM: 0 };

  Object.values(posicoes).forEach((p: any) => {
    const val = (p.qty || 0) * (p.price || 0);
    totalUsd += val;
    if (p.bucket && buckets.hasOwnProperty(p.bucket)) {
      buckets[p.bucket] += val;
    }
  });

  const rfBrl = (data.rf?.ipca2029?.valor || 0) + (data.rf?.ipca2040?.valor || 0) +
                (data.rf?.ipca2050?.valor || 0) + (data.rf?.renda2065?.valor || 0);
  const hodlBrl = data.hodl11?.valor || 0;

  const equityBrl = totalUsd * cambio;
  const totalBrl = equityBrl + rfBrl + hodlBrl;

  const assetData = [
    { value: equityBrl, name: 'Equity', color: CHART_COLORS.accent },
    { value: rfBrl, name: 'Renda Fixa', color: CHART_COLORS.green },
    { value: hodlBrl, name: 'Bitcoin', color: CHART_COLORS.orange },
  ].filter((d) => d.value > 0);

  return {
    tooltip: {
      trigger: 'item' as const,
      formatter: (params: any) => {
        if (privacyMode) return '••••';
        const pct = ((params.value / totalBrl) * 100).toFixed(1);
        return `${params.name}<br/>R$ ${(params.value / 1e6).toFixed(1)}M (${pct}%)`;
      },
    },
    legend: {
      orient: 'vertical' as const,
      left: 'left',
      textStyle: { color: CHART_COLORS.muted },
    },
    series: [
      {
        name: 'Alocação por Classe',
        type: 'pie' as const,
        radius: ['30%', '70%'],
        center: ['50%', '50%'],
        data: assetData,
        itemStyle: { borderRadius: 6, borderColor: CHART_COLORS.card, borderWidth: 1 },
        label: {
          formatter: privacyMode ? () => '' : '{b}\n{d}%',
          color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        },
      },
    ],
  };
}

/**
 * Timeline Chart (Line with area fill)
 */
export function createTimelineChartOption(options: BaseChartOptions) {
  const { data, privacyMode, theme } = options;

  const timeline = data.timeline || { values: [], labels: [] };
  const values = timeline.values || [];
  const labels = timeline.labels || [];

  if (values.length === 0) {
    return { title: { text: 'No projection data available' } };
  }

  const dates = labels.map((ym: string) => ym.replace('-', '/'));
  const baseValue = values[values.length - 1] || 0;
  const years = 10;

  const baselineProj = Array.from({ length: years * 12 }, (_, i) => {
    const monthsOut = i + 1;
    return baseValue * Math.pow(1 + 0.03 / 12, monthsOut);
  });

  const optimisticProj = Array.from({ length: years * 12 }, (_, i) => {
    const monthsOut = i + 1;
    return baseValue * Math.pow(1 + 0.05 / 12, monthsOut);
  });

  const pessimisticProj = Array.from({ length: years * 12 }, (_, i) => {
    const monthsOut = i + 1;
    return baseValue * Math.pow(1 + 0.00 / 12, monthsOut);
  });

  const forecastDates = Array.from({ length: years * 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i + 1);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  return {
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let html = `<div style="padding: 8px;">`;
        params.forEach((p: any) => {
          const value = privacyMode ? '••••' : `<strong>R$ ${(p.value / 1e6).toFixed(1)}M</strong>`;
          html += `<div>${p.seriesName}: ${value}</div>`;
        });
        html += `</div>`;
        return html;
      },
    },
    legend: {
      data: ['Histórico', 'Pessimista (0%)', 'Base (3% a.a.)', 'Otimista (5% a.a.)'],
      textStyle: { color: CHART_COLORS.muted },
    },
    grid: { left: 60, right: 40, top: 40, bottom: 40 },
    xAxis: {
      type: 'category' as const,
      data: [...dates.slice(-24), ...forecastDates.slice(0, 48)],
      axisLabel: { interval: 12, formatter: (v: string) => v },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { formatter: (v: number) => `R$ ${(v / 1e6).toFixed(0)}M` },
    },
    series: [
      {
        name: 'Histórico',
        type: 'line' as const,
        data: [...values.slice(-24), ...baselineProj.slice(0, 48)],
        itemStyle: { color: CHART_COLORS.orange },
        lineStyle: { width: 2.5 },
        smooth: true,
      },
      {
        name: 'Pessimista (0%)',
        type: 'line' as const,
        data: Array(dates.slice(-24).length).fill(null).concat(pessimisticProj.slice(0, 48)),
        itemStyle: { color: CHART_COLORS.red },
        lineStyle: { width: 1.5, type: 'dashed' as const },
        smooth: true,
      },
      {
        name: 'Base (3% a.a.)',
        type: 'line' as const,
        data: Array(dates.slice(-24).length).fill(null).concat(baselineProj.slice(0, 48)),
        itemStyle: { color: CHART_COLORS.green },
        lineStyle: { width: 1.5, type: 'dashed' as const },
        smooth: true,
      },
      {
        name: 'Otimista (5% a.a.)',
        type: 'line' as const,
        data: Array(dates.slice(-24).length).fill(null).concat(optimisticProj.slice(0, 48)),
        itemStyle: { color: CHART_COLORS.accent },
        lineStyle: { width: 1.5, type: 'dashed' as const },
        smooth: true,
      },
    ],
  };
}

/**
 * Stacked Area Chart
 */
export function createStackedAreaChartOption(options: BaseChartOptions) {
  const { data, privacyMode, theme } = options;

  // Use real timeline_attribution data from data.json
  const ta = (data as any)?.timeline_attribution ?? {};
  const rawDates: string[] = ta.dates ?? [];
  const equityUsd: number[] = ta.equity_usd ?? [];
  const rfBrl: number[] = ta.rf ?? [];
  const cambioArr: number[] = ta.cambio ?? [];
  const cambioVal = (data as any)?.cambio ?? 5.0;

  const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

  if (rawDates.length === 0) {
    // No data fallback — single month placeholder
    const months = 1;
    const xAxisData = ['—'];
    return {
      title: { text: 'Sem dados históricos', textStyle: { color: '#94a3b8', fontSize: 12 } },
    };
  }

  const xAxisData = rawDates.map((ym: string) => {
    const [y, m] = ym.split('-');
    return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
  });

  // Convert equity USD → BRL using per-month cambio or fallback
  const equityBrlData = equityUsd.map((v, i) => v * (cambioArr[i] ?? cambioVal));
  const rfBrlData = rfBrl;

  return {
    color: [CHART_COLORS.accent, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.pink],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        if (privacyMode) return '••••';
        let result = params[0].axisValueLabel + '<br/>';
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: R$ ${p.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}<br/>`;
        });
        return result;
      },
    },
    legend: {
      display: !privacyMode,
      textStyle: { color: theme.textStyle.color },
      top: 10,
    },
    grid: {
      left: 60,
      right: 20,
      top: 40,
      bottom: 40,
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: (value: number) => `R$ ${(value / 1e6).toFixed(1)}M`,
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: [
      {
        name: 'Equity (BRL)',
        type: 'line' as const,
        data: equityBrlData,
        smooth: true,
        areaStyle: { opacity: 0.25 },
        lineStyle: { width: 2 },
        symbolSize: 0,
        itemStyle: { color: CHART_COLORS.accent },
      },
      {
        name: 'Renda Fixa (BRL)',
        type: 'line' as const,
        data: rfBrlData,
        smooth: true,
        areaStyle: { opacity: 0.25 },
        lineStyle: { width: 2 },
        symbolSize: 0,
        itemStyle: { color: CHART_COLORS.green },
      },
    ],
  };
}

/**
 * Backtest Chart (Dual Line — Portfolio vs Benchmark)
 */
export function createBacktestChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;

  // Use real backtest data from data.json
  const backtest = (options.data as any)?.backtest ?? {};
  const dates: string[]  = backtest.dates    ?? [];
  const target: number[] = backtest.target   ?? [];
  const bench:  number[] = backtest.shadowA  ?? [];

  const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const xAxisData: string[] = dates.length > 0
    ? dates.map((ym: string) => {
        const [y, m] = ym.split('-');
        return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
      })
    : Array.from({ length: 84 }, (_, i) => `M${i + 1}`);

  const portfolioData: number[] = target.length > 0
    ? target
    : Array.from({ length: 84 }, (_, i) => 100 * Math.pow(1.0088, i));
  const benchmarkData: number[] = bench.length > 0
    ? bench
    : Array.from({ length: 84 }, (_, i) => 100 * Math.pow(1.0075, i));

  return {
    color: [CHART_COLORS.green, CHART_COLORS.muted],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let result = `${params[0].axisValueLabel}<br/>`;
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
        });
        return result;
      },
    },
    legend: {
      display: !privacyMode,
      textStyle: { color: theme.textStyle.color },
      top: 10,
    },
    grid: { left: 60, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12, interval: 11 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12 },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: [
      {
        name: 'Portfolio',
        type: 'line' as const,
        data: portfolioData,
        smooth: true,
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
      {
        name: 'Benchmark',
        type: 'line' as const,
        data: benchmarkData,
        smooth: true,
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
    ],
  };
}

/**
 * Income Chart (Horizontal Bar)
 */
export function createIncomeChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;

  // Use real spending breakdown data from data.json
  const sb = (options.data as any)?.spending_breakdown ?? {};
  const premissas = (options.data as any)?.premissas ?? {};

  // Income sources: renda ativa (capital humano) + RF coupons + SWR portfolio
  const rendaMensal: number = premissas.renda_mensal_liquida ?? premissas.renda_estimada ?? 45000;
  const rendaAnual = rendaMensal * 12;
  const mustSpend: number = (sb.must_spend_anual ?? sb.must_spend_mensal != null ? (sb.must_spend_mensal ?? 0) * 12 : null) ?? 0;
  const likeSpend: number = (sb.like_spend_anual ?? sb.like_spend_mensal != null ? (sb.like_spend_mensal ?? 0) * 12 : null) ?? 0;
  const inssAnual: number = premissas.inss_anual ?? 21996;

  // Show income breakdown: renda ativa + INSS
  const categories = ['Renda Ativa (CLT)', 'INSS (futuro)', 'Gastos Essenciais', 'Gastos Discricionários'];
  const amountsData = [rendaAnual, inssAnual, mustSpend, likeSpend];
  const colors = [CHART_COLORS.accent, CHART_COLORS.purple, CHART_COLORS.green, CHART_COLORS.orange];

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const p = params[0];
        return `${p.name}<br/>${p.marker} R$ ${p.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
      },
      axisPointer: { type: 'shadow' as const },
    },
    legend: { display: !privacyMode, textStyle: { color: theme.textStyle.color }, top: 10 },
    grid: { left: 120, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: (value: number) => `R$ ${(value / 1e3).toFixed(0)}K`,
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    yAxis: {
      type: 'category' as const,
      data: categories,
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12 },
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
    },
    series: [
      {
        name: 'Annual Income',
        type: 'bar' as const,
        data: amountsData.map((value, idx) => ({ value, itemStyle: { color: colors[idx] } })),
        itemStyle: { borderRadius: [0, 4, 4, 0] },
      },
    ],
  };
}

/**
 * Glide Path Chart (Area by Age)
 */
export function createGlidePathChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;

  // Use real glide path data from data.json
  const glide = (options.data as any)?.glide ?? {};
  const premissas = (options.data as any)?.premissas ?? {};
  const idadeAtual: number = premissas.idade_atual ?? 39;

  const glideIdades: number[] = glide.idades ?? [];
  const glideEquity: number[] = glide.equity ?? [];
  const glideIpcaLongo: number[] = glide.ipca_longo ?? [];
  const glideIpcaCurto: number[] = glide.ipca_curto ?? [];
  const glideHodl: number[] = glide.hodl11 ?? [];
  const glideRenda: number[] = glide.renda_plus ?? [];

  let ages: number[];
  let seriesData: { name: string; color: string; data: number[] }[];

  const interpolate = (arr: number[], age: number) => {
    if (glideIdades.length === 0) return 0;
    for (let i = 0; i < glideIdades.length - 1; i++) {
      if (age >= glideIdades[i] && age <= glideIdades[i + 1]) {
        const t = (age - glideIdades[i]) / (glideIdades[i + 1] - glideIdades[i]);
        return arr[i] + t * (arr[i + 1] - arr[i]);
      }
    }
    return arr[arr.length - 1] ?? 0;
  };

  if (glideIdades.length > 0) {
    const minAge = glideIdades[0];
    const maxAge = glideIdades[glideIdades.length - 1];
    ages = Array.from({ length: maxAge - minAge + 1 }, (_, i) => minAge + i);

    seriesData = [
      { name: 'Equity Total',    color: CHART_COLORS.accent,  data: ages.map(a => interpolate(glideEquity, a)) },
      { name: 'IPCA+ Longo',     color: CHART_COLORS.green,   data: ages.map(a => interpolate(glideIpcaLongo, a)) },
      { name: 'IPCA+ Curto',     color: CHART_COLORS.orange,  data: ages.map(a => interpolate(glideIpcaCurto, a)) },
      { name: 'Crypto (HODL11)', color: CHART_COLORS.yellow,  data: ages.map(a => interpolate(glideHodl, a)) },
      { name: 'Renda+ 2065',     color: CHART_COLORS.purple,  data: ages.map(a => interpolate(glideRenda, a)) },
    ];
  } else {
    // Fallback: 2 series
    const retirementAge: number = premissas.idade_cenario_base ?? 53;
    ages = Array.from({ length: Math.max(1, 90 - idadeAtual + 1) }, (_, i) => idadeAtual + i);
    const equity = ages.map(() => 79);
    const rf = ages.map(() => 21);
    seriesData = [
      { name: 'Equity Total', color: CHART_COLORS.accent, data: equity },
      { name: 'Renda Fixa',   color: CHART_COLORS.green,  data: rf },
    ];
  }

  return {
    color: seriesData.map(s => s.color),
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let result = `Idade ${params[0].axisValueLabel}<br/>`;
        params.forEach((p: any) => {
          if (p.value != null) result += `${p.marker} ${p.seriesName}: ${Number(p.value).toFixed(1)}%<br/>`;
        });
        return result;
      },
    },
    legend: { textStyle: { color: theme.textStyle.color }, top: 10 },
    grid: { left: 50, right: 20, top: 45, bottom: 30, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: ages.map(a => a.toString()),
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 11, interval: 4 },
    },
    yAxis: {
      type: 'value' as const,
      min: 0,
      max: 100,
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, formatter: '{value}%', fontSize: 11 },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: seriesData.map(s => ({
      name: s.name,
      type: 'line' as const,
      stack: 'total',
      smooth: true,
      data: s.data,
      areaStyle: { color: s.color, opacity: 0.75 },
      lineStyle: { width: 0.5, color: s.color },
      itemStyle: { color: s.color },
      symbolSize: 0,
    })),
  };
}

/**
 * Sankey Chart — Fluxo de Caixa Anual (Estimado)
 * Nós: Renda → Investimentos + Gastos → sub-categorias de gastos
 * Dados: spending_summary + premissas.aporte_mensal
 */
export function createSankeyChartOption(options: BaseChartOptions) {
  const { data, privacyMode, theme } = options;

  // Spending data from spending_breakdown (public data.json field name)
  const ss = (data as any)?.spending_breakdown ?? (data as any)?.spending_summary ?? {};
  const gastoEssencial = ss.must_spend_anual ?? 180887;
  const gastoDisc = ss.like_spend_anual ?? 51403;
  const gastoImprevistos = ss.imprevistos_anual ?? 4357;
  const gastoTotal = gastoEssencial + gastoDisc + gastoImprevistos;

  // Income: renda_mensal_liquida × 12 (from premissas) as gross income estimate
  const rendaMensal = (data as any)?.premissas?.renda_mensal_liquida ?? (data as any)?.premissas?.renda_estimada ?? 45000;
  const aporteMensal = (data as any)?.premissas?.aporte_mensal ?? 25000;
  const investimentos = aporteMensal * 12;
  const rendaAnual = rendaMensal * 12;
  // Use rendaAnual as total income; investimentos is the saving portion
  // The remaining goes to gastos (which include essenciais + disc + imprevistos + impostos + fees)
  const renda = Math.max(rendaAnual, gastoTotal + investimentos);

  // From gastos total, decompose into subcategories
  // Impostos estimados dentro do custo de vida (já capturado em must_spend via Taxes & Fees da análise)
  const impostos = Math.round(gastoTotal * 0.1); // ~10% impostos
  const taxasFees = Math.round(gastoTotal * 0.02); // ~2% taxas
  const gastoEssencialNet = Math.max(0, gastoEssencial - impostos - taxasFees);
  const dependentes = 0; // sem dependentes atualmente

  const fmtK = (v: number) => {
    if (privacyMode) return '••••';
    return `R$ ${(v / 1000).toFixed(0)}k`;
  };

  return {
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/><strong>${fmtK(params.data.value)}/ano</strong>`;
        }
        return `<strong>${params.name}</strong>`;
      },
    },
    series: [
      {
        type: 'sankey' as const,
        layout: 'none' as const,
        orient: 'horizontal' as const,
        emphasis: { focus: 'adjacency' as const },
        nodeWidth: 20,
        nodePadding: 24,
        label: {
          color: CHART_COLORS.text,
          fontSize: 12,
        },
        edgeLabel: {
          show: !privacyMode,
          fontSize: 10,
          color: CHART_COLORS.muted,
          formatter: (params: any) => fmtK(params.data.value),
        },
        lineStyle: {
          color: 'gradient' as const,
          opacity: 0.4,
          curveness: 0.5,
        },
        data: [
          { name: 'Renda',         itemStyle: { color: CHART_COLORS.cyan } },
          { name: 'Investimentos', itemStyle: { color: CHART_COLORS.green } },
          { name: 'Gastos',        itemStyle: { color: CHART_COLORS.orange } },
          { name: 'Essenciais',    itemStyle: { color: CHART_COLORS.accent } },
          { name: 'Discricionários', itemStyle: { color: CHART_COLORS.purple } },
          { name: 'Impostos',      itemStyle: { color: CHART_COLORS.red } },
          { name: 'Taxas & Fees',  itemStyle: { color: CHART_COLORS.pink } },
          ...(dependentes > 0 ? [{ name: 'Dependentes', itemStyle: { color: CHART_COLORS.yellow } }] : []),
        ],
        links: [
          { source: 'Renda', target: 'Investimentos', value: investimentos },
          { source: 'Renda', target: 'Gastos', value: gastoTotal },
          { source: 'Gastos', target: 'Essenciais', value: gastoEssencialNet },
          { source: 'Gastos', target: 'Discricionários', value: gastoDisc },
          { source: 'Gastos', target: 'Impostos', value: impostos },
          { source: 'Gastos', target: 'Taxas & Fees', value: taxasFees },
          ...(dependentes > 0 ? [{ source: 'Gastos', target: 'Dependentes', value: dependentes }] : []),
        ],
      },
    ],
  };
}

/**
 * Net Worth Projection Chart (Percentile Lines)
 */
export function createNetWorthProjectionChartOption(options: BaseChartOptions) {
  const { data, privacyMode, theme } = options;

  const ft = (data as any)?.fire_trilha ?? {};

  // --- Raw monthly data from fire_trilha ---
  const dates: string[]           = ft.dates          ?? [];
  const realizadoBrl: (number|null)[] = ft.realizado_brl ?? [];
  const trilhaBrl: (number|null)[] = ft.trilha_brl    ?? [];
  const p10Brl: number[]          = ft.trilha_p10_brl ?? [];
  const p90Brl: number[]          = ft.trilha_p90_brl ?? [];
  const nHistorico: number        = ft.n_historico     ?? 0;
  const fireDate: string          = ft.meta_fire_date  ?? '2040-01';
  const fireYear: number          = parseInt(fireDate.split('-')[0], 10);

  // --- Post-FIRE extension with withdrawal model (spending smile) ---
  const postFireYears = 37;  // Age 53 to 90
  const p10End = p10Brl.at(-1) ?? 0;
  const p50End = (trilhaBrl[dates.length - 1] ?? 0) as number;
  const p90End = p90Brl.at(-1) ?? 0;

  // Spending smile: Read from data, fallback to conservative defaults
  // Source: data.spendingSmile from Python data generation (config.py)
  const smileData = (data as any)?.spendingSmile ?? {
    go_go: { gasto: 242_000 },
    slow_go: { gasto: 200_000 },
    no_go: { gasto: 187_000 },
  };

  const getSpendingByYear = (yearPostFire: number): number => {
    if (yearPostFire < 15) return smileData.go_go?.gasto ?? 242_000;      // Go-Go
    if (yearPostFire < 30) return smileData.slow_go?.gasto ?? 200_000;    // Slow-Go
    return smileData.no_go?.gasto ?? 187_000;                             // No-Go
  };

  // Calculate post-FIRE trajectories with withdrawal
  // Formula: value_next = value_current * (1 + real_return) - spending_real
  // Return rate is REAL (4.85%), spending is in R$ reais (constant 2026) — no additional inflation adjustment needed
  const calculatePostFireTrajectory = (startValue: number, returnRate: number): number[] => {
    const trajectory = [startValue];
    let value = startValue;
    for (let i = 1; i < postFireYears; i++) {
      const spending = getSpendingByYear(i);
      // Apply real return, then withdraw. Both values are in real terms (constant 2026 R$)
      value = value * (1 + returnRate) - spending;
      trajectory.push(Math.max(value, 0));  // Floor at zero (portfolio depletion)
    }
    return trajectory;
  };

  const postFireDates = Array.from({ length: postFireYears }, (_, i) => `${fireYear + i + 1}`);
  const p10Post = calculatePostFireTrajectory(p10End as number, 0.03);   // P10: 3% real return
  const p50Post = calculatePostFireTrajectory(p50End, 0.0485);           // P50: 4.85% real return
  const p90Post = calculatePostFireTrajectory(p90End as number, 0.06);   // P90: 6% real return

  // --- Align MC bands: p10Brl/p90Brl already have leading nulls for historical portion ---
  // Do NOT prepend additional nulls — they are already aligned with dates[].
  const p10Aligned: (number|null)[] = [...p10Brl, ...p10Post];
  const p90Aligned: (number|null)[] = [...p90Brl, ...p90Post];
  const p50Full: (number|null)[] = [...trilhaBrl, ...p50Post];
  const realizadoFull: (number|null)[] = [...realizadoBrl, ...Array(postFireYears).fill(null)];

  // --- X-axis: monthly dates + post-FIRE years; show label every 2-3 years for legibility ---
  const allDates = [...dates, ...postFireDates];
  const xAxisLabels = allDates.map(d => {
    if (d.length === 4) {
      // Post-FIRE annual — show every 2 years starting from fireYear (correct offset)
      const yr = parseInt(d, 10);
      const stepSinceFireYear = (yr - fireYear) % 2;
      return stepSinceFireYear === 0 && yr >= fireYear ? d : '';
    }
    const [yr, mo] = d.split('-');
    // Monthly — show only January of years divisible by 3 (pre-FIRE)
    return mo === '01' && parseInt(yr, 10) % 3 === 0 ? yr : '';
  });

  // Mark FIRE date index for vertical line
  const fireDateIndex = dates.indexOf(fireDate);

  return {
    color: [CHART_COLORS.red, CHART_COLORS.green, CHART_COLORS.accent],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        const label = allDates[params[0]?.dataIndex] ?? params[0]?.axisValueLabel ?? '';
        let result = `<b>${label}</b><br/>`;
        params.forEach((p: any) => {
          if (p.value == null || p.seriesName?.startsWith('_')) return;
          const val = privacyMode ? '••••' : `R$ ${(p.value / 1e6).toFixed(2)}M`;
          result += `${p.marker} ${p.seriesName}: ${val}<br/>`;
        });
        return result;
      },
    },
    legend: {
      show: !privacyMode,
      textStyle: { color: theme.textStyle.color },
      top: 10,
      data: ['Realizado', 'P50 (Mediana)', 'P10 (Pessimista)', 'P90 (Otimista)'],
    },
    grid: { left: 60, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xAxisLabels,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        fontSize: 11,
        hideOverlap: true,
        showMinLabel: true,
        showMaxLabel: true,
      },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: (value: number) => `R$ ${(value / 1e6).toFixed(1)}M`,
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    ...(fireDateIndex >= 0 ? {
      markLine: undefined,
    } : {}),
    series: [
      // ── Transparent baseline for P10/P90 band (stacked) ──
      {
        name: '_band_base',
        type: 'line' as const,
        data: p10Aligned,
        smooth: true,
        stack: 'mc_band',
        lineStyle: { width: 0 },
        symbolSize: 0,
        areaStyle: { color: 'transparent', opacity: 0 },
        tooltip: { show: false },
        legendHoverLink: false,
        silent: true,
      },
      // ── Band fill: height = P90 - P10 ──
      {
        name: '_band_fill',
        type: 'line' as const,
        data: p90Aligned.map((v, i) =>
          v != null && p10Aligned[i] != null ? v - (p10Aligned[i] as number) : null
        ),
        smooth: true,
        stack: 'mc_band',
        lineStyle: { width: 0 },
        symbolSize: 0,
        areaStyle: { color: CHART_COLORS.green, opacity: 0.1 },
        tooltip: { show: false },
        legendHoverLink: false,
        silent: true,
      },
      // ── Realizado (historical) ──
      {
        name: 'Realizado',
        type: 'line' as const,
        data: realizadoFull,
        smooth: false,
        lineStyle: { width: 2.5, color: CHART_COLORS.muted },
        itemStyle: { color: CHART_COLORS.muted },
        symbolSize: 0,
        connectNulls: false,
        ...(fireDateIndex >= 0 ? {
          markLine: {
            symbol: 'none',
            lineStyle: { color: CHART_COLORS.accent, type: 'dashed', width: 1.5, opacity: 0.7 },
            data: [{ xAxis: fireDateIndex, name: 'FIRE Date' }],
            label: { show: true, position: 'insideEndTop', formatter: 'FIRE', color: CHART_COLORS.accent, fontSize: 11 },
          },
        } : {}),
      },
      // ── P10 (pessimista) — future only ──
      {
        name: 'P10 (Pessimista)',
        type: 'line' as const,
        data: p10Aligned,
        smooth: true,
        lineStyle: { width: 1.5, color: CHART_COLORS.red, type: 'dashed' as const },
        itemStyle: { color: CHART_COLORS.red },
        symbolSize: 0,
        connectNulls: false,
      },
      // ── P50 (mediana) — full range ──
      {
        name: 'P50 (Mediana)',
        type: 'line' as const,
        data: p50Full,
        smooth: true,
        lineStyle: { width: 2.5, color: CHART_COLORS.green },
        itemStyle: { color: CHART_COLORS.green },
        symbolSize: 0,
      },
      // ── P90 (otimista) — future only ──
      {
        name: 'P90 (Otimista)',
        type: 'line' as const,
        data: p90Aligned,
        smooth: true,
        lineStyle: { width: 1.5, color: CHART_COLORS.accent, type: 'dashed' as const },
        itemStyle: { color: CHART_COLORS.accent },
        symbolSize: 0,
        connectNulls: false,
      },
    ],
  };
}

/**
 * Delta Bar Chart (Monthly deltas with +/- coloring)
 * chartType 'alpha'          → monthly alpha from backtest.target vs backtest.shadowA
 * chartType 'factor-rolling' → factor_rolling.avgs_vs_swrd_12m
 */
export function createDeltaBarChartOption(options: BaseChartOptions & { chartType?: 'alpha' | 'factor-rolling' }) {
  const { privacyMode, theme } = options;

  const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];

  let xAxisData: string[];
  let deltaData: number[];

  if (options.chartType === 'factor-rolling') {
    // AVGS vs SWRD rolling 12m from factor_rolling
    const fr = (options.data as any)?.factor_rolling ?? {};
    const frDates: string[]  = fr.dates  ?? [];
    const frVals:  number[]  = fr.avgs_vs_swrd_12m ?? [];
    if (frDates.length > 0) {
      xAxisData = frDates.map((ym: string) => {
        const [y, m] = ym.split('-');
        return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
      });
      deltaData = frVals;
    } else {
      xAxisData = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
      deltaData = Array(12).fill(0);
    }
  } else {
    // Period-based alpha: cumulative Target return minus VWRA for YTD, 1y, 3y, 5y, ITD
    const backtest = (options.data as any)?.backtest ?? {};
    const btDates: string[]  = backtest.dates  ?? [];
    const btTarget: number[] = backtest.target ?? [];
    const btShadow: number[] = backtest.shadowA ?? [];

    if (btDates.length > 1 && btTarget.length > 1 && btShadow.length > 1) {
      const lastDate = btDates[btDates.length - 1];
      const [lastY, lastM] = lastDate.split('-').map(Number);
      // Order: historical → recent (Desde Início left, YTD right = most actionable)
      const periodStarts: Array<{ label: string; startYm: string }> = [
        { label: 'Desde Início', startYm: btDates[0] },
        { label: '5a',  startYm: `${lastY - 5}-${String(lastM).padStart(2, '0')}` },
        { label: '3a',  startYm: `${lastY - 3}-${String(lastM).padStart(2, '0')}` },
        { label: '1a',  startYm: `${lastY - 1}-${String(lastM).padStart(2, '0')}` },
        { label: 'YTD', startYm: `${lastY}-01` },
      ];
      const periodAlpha: Array<{ label: string; alpha: number }> = [];
      for (const { label, startYm } of periodStarts) {
        const idx = btDates.findIndex(d => d >= startYm);
        if (idx < 0 || idx >= btDates.length - 1) continue;
        const tRet = (btTarget[btDates.length - 1] / btTarget[idx] - 1) * 100;
        const sRet = (btShadow[btDates.length - 1] / btShadow[idx] - 1) * 100;
        periodAlpha.push({ label, alpha: parseFloat((tRet - sRet).toFixed(1)) });
      }
      xAxisData = periodAlpha.map(p => p.label);
      deltaData = periodAlpha.map(p => p.alpha);
    } else {
      xAxisData = ['Desde Início', '5a', '3a', '1a', 'YTD'];
      deltaData = Array(5).fill(0);
    }
  }

  // Recency gradient: historical = muted, recent = vivid
  // Opacities left→right: 0.35, 0.5, 0.65, 0.85, 1.0
  const opacities = [0.35, 0.5, 0.65, 0.85, 1.0];
  const n = deltaData.length;
  const colors = deltaData.map((v, i) => {
    const opacity = opacities[Math.max(0, opacities.length - n + i)] ?? 1.0;
    if (v >= 0) {
      // Green gradient: rgb(62, 211, 129)
      return `rgba(62, 211, 129, ${opacity})`;
    } else {
      // Red gradient: rgb(239, 68, 68)
      return `rgba(239, 68, 68, ${opacity})`;
    }
  });

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const p = params[0];
        const sign = p.value >= 0 ? '+' : '';
        return `<strong>${p.name}</strong><br/>Alpha: <strong>${sign}${p.value.toFixed(2)}pp</strong> vs VWRA`;
      },
      axisPointer: { type: 'shadow' as const },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 30, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisTick: { show: false },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 11 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, formatter: '{value}pp', fontSize: 11 },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: [
      {
        type: 'bar' as const,
        data: deltaData.map((value, idx) => ({ value, itemStyle: { color: colors[idx] } })),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: 'top' as const,
          formatter: (p: any) => privacyMode ? '•' : `${p.value >= 0 ? '+' : ''}${p.value.toFixed(1)}pp`,
          color: CHART_COLORS.muted,
          fontSize: 10,
        },
        barMaxWidth: 60,
      },
    ],
  };
}

/**
 * Drawdown Time-Series (vertical red bars pointing down)
 */
export function createDrawdownHistChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;

  const dh = (options.data as any)?.drawdown_history ?? {};
  const dates: string[] = dh.dates ?? [];
  const drawdownPct: number[] = dh.drawdown_pct ?? [];

  const minVal = drawdownPct.length > 0 ? Math.min(...drawdownPct) : -15;
  const yMin = Math.floor(minVal / 2) * 2 - 2; // round down to nearest 2%, add 2% margin

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const p = params[0];
        return `${p.name}<br/>${p.value.toFixed(2)}%`;
      },
      axisPointer: { type: 'shadow' as const },
    },
    grid: { left: 60, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        fontSize: 11,
        interval: 0,
        // Mostrar apenas o ano, somente em janeiro de cada ano
        formatter: (val: string) => {
          const [, mo] = val.split('-');
          return mo === '01' ? val.slice(0, 4) : '';
        },
      },
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      min: yMin,
      max: 2,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: (v: number) => `${v}%`,
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
      axisLine: { show: false },
    },
    series: [
      {
        type: 'line' as const,
        data: drawdownPct,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#f85149', width: 1.5 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(248,81,73,0.4)' }, { offset: 1, color: 'rgba(248,81,73,0.02)' }] } },
      },
    ],
  };
}

/**
 * Simple Line Chart (single/dual series)
 * Used by: TimelineChart, InformationRatioChart, RollingSharpChart, ShadowChart
 */
export function createSimpleLineChartOption(options: {
  data: DashboardData;
  privacyMode: boolean;
  theme: ChartTheme;
  xAxisData: string[];
  seriesData: Array<{ name: string; data: number[]; color?: string; areaStyle?: boolean; dashed?: boolean }>;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (params: any) => string;
}) {
  const { privacyMode, theme, xAxisData, seriesData, yAxisFormatter, tooltipFormatter } = options;

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: tooltipFormatter || ((params: any) => {
        if (!Array.isArray(params)) return '';
        let result = params[0].axisValueLabel + '<br/>';
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
        });
        return result;
      }),
    },
    legend: { display: !privacyMode, textStyle: { color: theme.textStyle.color }, top: 10 },
    grid: { left: 60, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: yAxisFormatter || ((v: number) => v.toFixed(2)),
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: seriesData.map(s => ({
      name: s.name,
      type: 'line' as const,
      data: s.data,
      smooth: true,
      areaStyle: s.areaStyle ? { opacity: 0.2 } : undefined,
      lineStyle: { width: 2, type: s.dashed ? 'dashed' as const : 'solid' as const, color: s.color },
      symbolSize: 0,
    })),
  };
}

/**
 * Bounded Line Chart (upper/target/lower bounds)
 * Used by: GuardrailsChart, IncomeProjectionChart, TrackingFireChart
 */
export function createBoundedLineChartOption(options: {
  data: DashboardData;
  privacyMode: boolean;
  theme: ChartTheme;
  xAxisData: string[];
  upperData: number[];
  targetData: number[];
  lowerData: number[];
  upperLabel: string;
  targetLabel: string;
  lowerLabel: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (params: any) => string;
}) {
  const {
    privacyMode, theme, xAxisData, upperData, targetData, lowerData,
    upperLabel, targetLabel, lowerLabel, yAxisFormatter, tooltipFormatter
  } = options;

  return {
    color: [CHART_COLORS.green, CHART_COLORS.accent, CHART_COLORS.red],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: tooltipFormatter || ((params: any) => {
        if (!Array.isArray(params)) return '';
        let result = params[0].axisValueLabel + '<br/>';
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(0)}<br/>`;
        });
        return result;
      }),
    },
    legend: { display: !privacyMode, textStyle: { color: theme.textStyle.color }, top: 10 },
    grid: { left: 60, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12, interval: 4 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: yAxisFormatter || ((v: number) => `${v.toFixed(0)}`),
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: [
      {
        name: upperLabel,
        type: 'line' as const,
        data: upperData,
        smooth: true,
        lineStyle: { width: 2, type: 'dashed' as const },
        symbolSize: 0,
      },
      {
        name: targetLabel,
        type: 'line' as const,
        data: targetData,
        smooth: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 3 },
        symbolSize: 0,
      },
      {
        name: lowerLabel,
        type: 'line' as const,
        data: lowerData,
        smooth: true,
        lineStyle: { width: 2, type: 'dashed' as const },
        symbolSize: 0,
      },
    ],
  };
}

/**
 * Tornado Chart (Horizontal stacked bar for sensitivity analysis)
 */
export function createTornadoChartOption(options: {
  data: DashboardData;
  privacyMode: boolean;
  theme: ChartTheme;
  categories: string[];
  downside: number[];
  upside: number[];
  downsideLabel?: string;
  upsideLabel?: string;
}) {
  const { privacyMode, theme, categories, downside, upside, downsideLabel = 'Pessimistic', upsideLabel = 'Optimistic' } = options;

  return {
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let html = `<div style="padding: 8px;">`;
        params.forEach((p: any) => {
          const val = Math.abs(p.value);
          html += `<div>${p.seriesName}: <strong>${val.toFixed(1)}%</strong></div>`;
        });
        html += `</div>`;
        return html;
      },
    },
    legend: {
      data: [downsideLabel, upsideLabel],
      textStyle: { color: CHART_COLORS.muted },
    },
    grid: { left: 120, right: 60, top: 40, bottom: 40 },
    xAxis: {
      type: 'value' as const,
      axisLabel: { formatter: (v: number) => `${v}%` },
    },
    yAxis: {
      type: 'category' as const,
      data: categories,
    },
    series: [
      {
        name: downsideLabel,
        type: 'bar' as const,
        stack: 'total',
        data: downside,
        itemStyle: { color: CHART_COLORS.red, opacity: 0.8 },
      },
      {
        name: upsideLabel,
        type: 'bar' as const,
        stack: 'total',
        data: upside,
        itemStyle: { color: CHART_COLORS.green, opacity: 0.8 },
      },
    ],
  };
}

/**
 * Dual-Line Comparison Chart (portfolio vs benchmark)
 * Used by: BacktestR7Chart, ShadowChart
 */
export function createDualLineChartOption(options: {
  data: DashboardData;
  privacyMode: boolean;
  theme: ChartTheme;
  xAxisData: string[];
  series1Data: number[];
  series1Name: string;
  series2Data: number[];
  series2Name: string;
  series1Color?: string;
  series2Color?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (params: any) => string;
  dashed?: boolean;
}) {
  const {
    privacyMode, theme, xAxisData, series1Data, series1Name, series2Data, series2Name,
    series1Color = '#3b82f6', series2Color = '#f59e0b', yAxisFormatter, tooltipFormatter, dashed = false
  } = options;

  return {
    color: [series1Color, series2Color],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: tooltipFormatter || ((params: any) => {
        if (!Array.isArray(params)) return '';
        let result = params[0].axisValueLabel + '<br/>';
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)}<br/>`;
        });
        return result;
      }),
    },
    legend: { display: !privacyMode, textStyle: { color: theme.textStyle.color }, top: 10 },
    grid: { left: 60, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: yAxisFormatter || ((v: number) => v.toFixed(2)),
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.border } },
    },
    series: [
      {
        name: series1Name,
        type: 'line' as const,
        data: series1Data,
        smooth: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
      {
        name: series2Name,
        type: 'line' as const,
        data: series2Data,
        smooth: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2, type: dashed ? 'dashed' as const : 'solid' as const },
        symbolSize: 0,
      },
    ],
  };
}

/**
 * Bond Pool Runway (Probabilistic format: P10/P50/P90)
 */
export function createBondPoolProbabilisticOption(options: {
  theme: ChartTheme;
  privacyMode: boolean;
  dates: string[];
  p10: number[];
  p50: number[];
  p90: number[];
}) {
  const { theme, privacyMode, dates, p10, p50, p90 } = options;

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        let html = `<div style="padding:4px 8px;"><strong>${params[0].axisValue}</strong>`;
        params.forEach((p: any) => {
          if (p.value != null && !p.seriesName.startsWith('_')) {
            html += `<div>${p.seriesName}: <strong>${p.value.toFixed(1)} anos</strong></div>`;
          }
        });
        html += '</div>';
        return html;
      },
    },
    legend: { data: ['P90 (otimista)', 'P50 (mediana)', 'P10 (pessimista)'], textStyle: { color: CHART_COLORS.muted }, bottom: 0 },
    grid: { left: 50, right: 20, top: 40, bottom: 50 },
    xAxis: { type: 'category' as const, data: dates, axisLabel: { color: CHART_COLORS.muted } },
    yAxis: {
      type: 'value' as const,
      name: 'Anos restantes',
      nameTextStyle: { color: CHART_COLORS.muted },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, formatter: (v: number) => `${v.toFixed(0)}` },
      splitLine: { lineStyle: { color: CHART_COLORS.border, width: 0.5 } },
    },
    series: [
      { name: 'P90 (otimista)', type: 'line' as const, data: p90, lineStyle: { width: 1.5, type: 'dashed' as const, color: CHART_COLORS.green }, itemStyle: { color: CHART_COLORS.green }, areaStyle: { color: 'rgba(34,197,94,0.08)' }, symbol: 'none', smooth: true },
      { name: 'P50 (mediana)', type: 'line' as const, data: p50, lineStyle: { width: 2.5, color: CHART_COLORS.orange }, itemStyle: { color: CHART_COLORS.orange }, symbol: 'none', smooth: true },
      { name: 'P10 (pessimista)', type: 'line' as const, data: p10, lineStyle: { width: 1.5, type: 'dashed' as const, color: CHART_COLORS.red }, itemStyle: { color: CHART_COLORS.red }, symbol: 'none', smooth: true },
    ],
  };
}

/**
 * Bond Pool Runway (Deterministic format: pool buildup + post-FIRE coverage)
 */
export function createBondPoolDeterministicOption(options: {
  theme: ChartTheme;
  privacyMode: boolean;
  years: number[];
  poolTotal: number[];
  pool2040: number[];
  pool2050: number[];
  alvo: number;
}) {
  const { theme, privacyMode, years, poolTotal, pool2040, pool2050, alvo } = options;

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        let html = `<div style="padding:4px 8px;"><strong>${params[0].axisValue}</strong>`;
        params.forEach((p: any) => {
          if (p.value != null && !p.seriesName.startsWith('_')) {
            const val = p.value as number;
            const formatted = privacyMode ? '••••' : `R$ ${(val / 1000).toFixed(0)}k`;
            html += `<div style="display:flex;align-items:center;gap:4px;">`;
            html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color}"></span>`;
            html += `${p.seriesName}: <strong>${formatted}</strong></div>`;
          }
        });
        html += '</div>';
        return html;
      },
    },
    legend: { data: ['Pool Total', 'IPCA+ 2040', 'IPCA+ 2050', 'Meta 2040'], textStyle: { color: CHART_COLORS.muted }, bottom: 0 },
    grid: { left: 70, right: 20, top: 40, bottom: 50 },
    xAxis: { type: 'category' as const, data: years.map(String), axisLabel: { color: CHART_COLORS.muted } },
    yAxis: {
      type: 'value' as const,
      name: 'R$ (BRL)',
      nameTextStyle: { color: CHART_COLORS.muted },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, formatter: (v: number) => `${(v / 1000).toFixed(0)}k` },
      splitLine: { lineStyle: { color: CHART_COLORS.border, width: 0.5 } },
    },
    series: [
      { name: 'IPCA+ 2050', type: 'bar' as const, stack: 'pool', data: pool2050, itemStyle: { color: CHART_COLORS.purple, borderRadius: [0, 0, 0, 0] }, emphasis: { focus: 'series' } },
      { name: 'IPCA+ 2040', type: 'bar' as const, stack: 'pool', data: pool2040, itemStyle: { color: CHART_COLORS.accent, borderRadius: [4, 4, 0, 0] }, emphasis: { focus: 'series' } },
      { name: 'Pool Total', type: 'line' as const, data: poolTotal, lineStyle: { width: 2.5, color: CHART_COLORS.orange }, itemStyle: { color: CHART_COLORS.orange }, symbol: 'circle', symbolSize: 6, smooth: true, z: 10 },
      { name: 'Meta 2040', type: 'line' as const, data: years.map(() => alvo), lineStyle: { width: 1.5, type: 'dashed' as const, color: CHART_COLORS.red }, itemStyle: { color: CHART_COLORS.red }, symbol: 'none' },
    ],
  };
}
