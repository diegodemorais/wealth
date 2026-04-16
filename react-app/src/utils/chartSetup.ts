/**
 * Chart Setup Factory — Centraliza builders ECharts
 * Reduz duplicação em componentes chart (goal: <50 linhas cada)
 *
 * IMPORTANT: ECharts and Chart.js render on <canvas> and cannot resolve
 * CSS custom properties (var(--x)). Always use explicit hex/rgb colors here.
 */

import { DashboardData } from '@/types/dashboard';

/** Resolved color palette — matches globals.css :root definitions */
export const CHART_COLORS = {
  accent:  '#3b82f6', // hsl(217 91% 60%)
  green:   '#22c55e', // hsl(142 71% 45%)
  red:     '#ef4444', // hsl(0 84% 60%)
  orange:  '#f97316', // hsl(25 95% 53%)
  yellow:  '#eab308', // hsl(45 93% 47%)
  purple:  '#a855f7', // hsl(271 91% 65%)
  cyan:    '#06b6d4', // hsl(189 94% 43%)
  pink:    '#ec4899', // hsl(330 80% 60%)
  muted:   '#94a3b8', // hsl(215 20% 65%)
  border:  '#374151', // hsl(215 19% 35%) approx
  card:    '#1e2a3b', // hsl(217 33% 17%) approx
  text:    '#f1f5f9', // hsl(210 40% 96%)
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
 * Attribution Chart (Horizontal Bar)
 */
export function createAttributionChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;

  // Use real attribution data from data.json
  const breakdown = ((options.data as any)?.attribution?.breakdown_chart ?? []) as Array<{label: string, value_pct: number}>;
  let categories: string[];
  let attributionData: number[];

  if (breakdown.length > 0) {
    categories = breakdown.map(d => d.label);
    attributionData = breakdown.map(d => d.value_pct);
  } else {
    // Build from real attribution fields (absolute BRL values)
    const attr = (options.data as any)?.attribution ?? {};
    const crescReal = attr.crescReal ?? 0;
    if (crescReal > 0) {
      const aportes = attr.aportes ?? 0;
      const retornoUsd = attr.retornoUsd ?? 0;
      const cambio = attr.cambio ?? 0;
      const fx = attr.fx ?? 0;
      const rf = attr.rf ?? 0;
      const total = Math.abs(aportes) + Math.abs(retornoUsd) + Math.abs(cambio) + Math.abs(rf) + Math.abs(fx);
      const pct = (v: number) => total > 0 ? parseFloat((v / total * 100).toFixed(1)) : 0;
      categories = ['Aportes', 'Retorno Equity (USD)', 'Câmbio BRL/USD', 'Renda Fixa', 'FX (custo)'];
      attributionData = [pct(aportes), pct(retornoUsd), pct(cambio), pct(rf), pct(fx)];
    } else {
      categories = ['Aportes', 'Retorno Equity', 'Câmbio', 'Renda Fixa', 'FX'];
      attributionData = [0, 0, 0, 0, 0];
    }
  }
  const colors = attributionData.map(v => v >= 0 ? CHART_COLORS.green : CHART_COLORS.red);

  return {
    ...createBaseOption(theme, privacyMode),
    xAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        formatter: '{value}%',
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.border } },
    },
    yAxis: {
      type: 'category' as const,
      data: categories,
      axisLabel: {
        color: privacyMode ? 'transparent' : CHART_COLORS.muted,
        fontSize: 12,
      },
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
    },
    series: [
      {
        name: 'Attribution (%)',
        type: 'bar' as const,
        data: attributionData.map((value, idx) => ({
          value,
          itemStyle: { color: colors[idx] },
        })),
        itemStyle: { borderRadius: [0, 4, 4, 0] },
      },
    ],
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
  let equityAlloc: number[];
  let fixedIncomeAlloc: number[];

  if (glideIdades.length > 0) {
    // Interpolate between defined waypoints
    const minAge = glideIdades[0];
    const maxAge = glideIdades[glideIdades.length - 1];
    ages = Array.from({ length: maxAge - minAge + 1 }, (_, i) => minAge + i);

    const interpolate = (arr: number[], age: number) => {
      for (let i = 0; i < glideIdades.length - 1; i++) {
        if (age >= glideIdades[i] && age <= glideIdades[i + 1]) {
          const t = (age - glideIdades[i]) / (glideIdades[i + 1] - glideIdades[i]);
          return arr[i] + t * (arr[i + 1] - arr[i]);
        }
      }
      return arr[arr.length - 1];
    };

    equityAlloc = ages.map(a => interpolate(glideEquity, a));
    const ipca = ages.map(a => interpolate(glideIpcaLongo, a) + interpolate(glideIpcaCurto, a));
    const hodl = ages.map(a => interpolate(glideHodl, a));
    const renda = ages.map(a => interpolate(glideRenda, a));
    fixedIncomeAlloc = ages.map((_, i) => ipca[i] + hodl[i] + renda[i]);
  } else {
    // Fallback: use premissas
    const retirementAge: number = premissas.idade_cenario_base ?? 53;
    ages = Array.from({ length: Math.max(1, 90 - idadeAtual + 1) }, (_, i) => idadeAtual + i);
    equityAlloc = ages.map(age => {
      if (age >= retirementAge) return 79; // stay invested post-FIRE
      return 79; // pre-FIRE high equity
    });
    fixedIncomeAlloc = equityAlloc.map(eq => 100 - eq);
  }

  return {
    color: [CHART_COLORS.accent, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.yellow],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let result = `Idade ${params[0].axisValueLabel}<br/>`;
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: ${p.value.toFixed(1)}%<br/>`;
        });
        return result;
      },
    },
    legend: { display: !privacyMode, textStyle: { color: theme.textStyle.color }, top: 10 },
    grid: { left: 60, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: ages.map(a => a.toString()),
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12, interval: 4 },
    },
    yAxis: {
      type: 'value' as const,
      min: 0,
      max: 100,
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, formatter: '{value}%', fontSize: 12 },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: [
      {
        name: 'Equity %',
        type: 'line' as const,
        data: equityAlloc,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { width: 3 },
        symbolSize: 4,
      },
      {
        name: 'Renda Fixa %',
        type: 'line' as const,
        data: fixedIncomeAlloc,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2 },
        symbolSize: 4,
      },
    ],
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
        nodePadding: 12,
        label: {
          color: CHART_COLORS.text,
          fontSize: 12,
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

  // Use real Monte Carlo data from fire_swr_percentis
  const fsp = (data as any)?.fire_swr_percentis ?? {};
  const ft = (data as any)?.fire_trilha ?? {};
  const currentNetworth = ft.realizado_brl?.[ft.realizado_brl.length - 1] ?? 3500000;
  const p10Target = fsp.patrimonio_p10_2040 ?? (currentNetworth * Math.pow(1.05, 14));
  const p50Target = fsp.patrimonio_p50_2040 ?? (currentNetworth * Math.pow(1.07, 14));
  const p90Target = fsp.patrimonio_p90_2040 ?? (currentNetworth * Math.pow(1.09, 14));
  const fireDate = ft.meta_fire_date ?? '2040-01';
  const fireYear = parseInt(fireDate.split('-')[0], 10);
  const currentYear = new Date().getFullYear();
  const yearsToFire = Math.max(1, fireYear - currentYear);
  const yearsPost = 30 - yearsToFire;
  const years = 30;

  // Build interpolated paths: exponential from today to MC targets
  const xAxisData = Array.from({ length: years }, (_, i) => {
    return `${currentYear + i + 1}`;
  });

  const buildPath = (target: number, ratePost: number) =>
    Array.from({ length: years }, (_, i) => {
      const yr = i + 1;
      if (yr <= yearsToFire) {
        // Interpolate exponentially to target
        const t = yr / yearsToFire;
        return currentNetworth * Math.pow(target / currentNetworth, t);
      } else {
        // Post-FIRE: grow at specified real rate from FIRE target
        return target * Math.pow(1 + ratePost, yr - yearsToFire);
      }
    });

  const p10Data = buildPath(p10Target, 0.03);
  const p50Data = buildPath(p50Target, 0.045);
  const p90Data = buildPath(p90Target, 0.06);

  return {
    color: [CHART_COLORS.red, CHART_COLORS.green, CHART_COLORS.accent],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let result = `${params[0].axisValueLabel}<br/>`;
        params.forEach((p: any) => {
          result += `${p.marker} ${p.seriesName}: R$ ${(p.value / 1e6).toFixed(1)}M<br/>`;
        });
        return result;
      },
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
        formatter: (value: number) => `R$ ${(value / 1e6).toFixed(1)}M`,
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: [
      {
        name: 'P10 (Pessimistic)',
        type: 'line' as const,
        data: p10Data,
        smooth: true,
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
      {
        name: 'P50 (Median)',
        type: 'line' as const,
        data: p50Data,
        smooth: true,
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
      {
        name: 'P90 (Optimistic)',
        type: 'line' as const,
        data: p90Data,
        smooth: true,
        lineStyle: { width: 2 },
        symbolSize: 0,
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
    // Monthly alpha from backtest: target return - shadowA return
    const backtest = (options.data as any)?.backtest ?? {};
    const btDates: string[]  = backtest.dates  ?? [];
    const btTarget: number[] = backtest.target ?? [];
    const btShadow: number[] = backtest.shadowA ?? [];

    if (btDates.length > 1 && btTarget.length > 1 && btShadow.length > 1) {
      xAxisData = btDates.slice(1).map((ym: string) => {
        const [y, m] = ym.split('-');
        return MONTHS_PT[parseInt(m, 10) - 1] + '/' + y.slice(2);
      });
      deltaData = btDates.slice(1).map((_: string, i: number) => {
        const tRet = btTarget[i + 1] / btTarget[i] - 1;
        const sRet = btShadow[i + 1] / btShadow[i] - 1;
        return parseFloat(((tRet - sRet) * 100).toFixed(2));
      });
    } else {
      xAxisData = Array.from({ length: 12 }, (_, i) => `M${i + 1}`);
      deltaData = Array(12).fill(0);
    }
  }

  const colors = deltaData.map(v => v >= 0 ? CHART_COLORS.green : CHART_COLORS.red);

  return {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const p = params[0];
        return `${p.name}<br/>${p.marker} Delta: ${p.value.toFixed(2)}%`;
      },
      axisPointer: { type: 'shadow' as const },
    },
    legend: { display: !privacyMode, textStyle: { color: theme.textStyle.color }, top: 10 },
    grid: { left: 50, right: 20, top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: xAxisData,
      axisLine: { lineStyle: { color: CHART_COLORS.border } },
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, fontSize: 12 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: privacyMode ? 'transparent' : CHART_COLORS.muted, formatter: '{value}%', fontSize: 12 },
      splitLine: { lineStyle: { color: CHART_COLORS.card } },
    },
    series: [
      {
        type: 'bar' as const,
        data: deltaData.map((value, idx) => ({ value, itemStyle: { color: colors[idx] } })),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
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
        interval: Math.floor(dates.length / 8),
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
        type: 'bar' as const,
        data: drawdownPct,
        itemStyle: { color: '#f85149' },
        barMaxWidth: 12,
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
