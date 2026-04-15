/**
 * Chart Setup Factory — Centraliza builders ECharts
 * Reduz duplicação em componentes chart (goal: <50 linhas cada)
 */

import { DashboardData } from '@/types/dashboard';

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

  const categories = ['Equity Selection', 'Allocation', 'Market Return', 'Currency', 'Costs'];
  const attributionData = [2.5, 1.2, 4.8, -0.3, -0.6];
  const colors = attributionData.map(v => v >= 0 ? '#10b981' : '#ef4444');

  return {
    ...createBaseOption(theme, privacyMode),
    xAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : '#9ca3af',
        formatter: '{value}%',
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: '#2d3748' } },
    },
    yAxis: {
      type: 'category' as const,
      data: categories,
      axisLabel: {
        color: privacyMode ? 'transparent' : '#9ca3af',
        fontSize: 12,
      },
      axisLine: { lineStyle: { color: '#374151' } },
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
    { value: equityBrl, name: 'Equity', color: '#3b82f6' },
    { value: rfBrl, name: 'Renda Fixa', color: '#10b981' },
    { value: hodlBrl, name: 'Bitcoin', color: '#f59e0b' },
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
      textStyle: { color: '#d1d5db' },
    },
    series: [
      {
        name: 'Alocação por Classe',
        type: 'pie' as const,
        radius: ['30%', '70%'],
        center: ['50%', '50%'],
        data: assetData,
        itemStyle: { borderRadius: 6, borderColor: '#1f2937', borderWidth: 1 },
        label: {
          formatter: privacyMode ? () => '' : '{b}\n{d}%',
          color: privacyMode ? 'transparent' : '#d1d5db',
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
      textStyle: { color: '#d1d5db' },
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
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 2.5 },
        smooth: true,
      },
      {
        name: 'Pessimista (0%)',
        type: 'line' as const,
        data: Array(dates.slice(-24).length).fill(null).concat(pessimisticProj.slice(0, 48)),
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 1.5, type: 'dashed' as const },
        smooth: true,
      },
      {
        name: 'Base (3% a.a.)',
        type: 'line' as const,
        data: Array(dates.slice(-24).length).fill(null).concat(baselineProj.slice(0, 48)),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 1.5, type: 'dashed' as const },
        smooth: true,
      },
      {
        name: 'Otimista (5% a.a.)',
        type: 'line' as const,
        data: Array(dates.slice(-24).length).fill(null).concat(optimisticProj.slice(0, 48)),
        itemStyle: { color: '#3b82f6' },
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
  const { privacyMode, theme } = options;

  const months = 24;
  const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
  const swrdData = Array.from({ length: months }, (_, i) => 1200000 + i * 5000);
  const avgsData = Array.from({ length: months }, (_, i) => 600000 + i * 2500);
  const ipcaData = Array.from({ length: months }, (_, i) => 450000 + i * 3000);
  const cryptoData = Array.from({ length: months }, (_, i) => 120000 + i * 500);

  return {
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
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
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: {
        color: privacyMode ? 'transparent' : '#9ca3af',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : '#9ca3af',
        formatter: (value: number) => `R$ ${(value / 1e6).toFixed(1)}M`,
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: '#2d3748' } },
    },
    series: [
      {
        name: 'SWRD',
        type: 'line' as const,
        data: swrdData,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
      {
        name: 'AVGS',
        type: 'line' as const,
        data: avgsData,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
      {
        name: 'IPCA+',
        type: 'line' as const,
        data: ipcaData,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
      {
        name: 'Crypto',
        type: 'line' as const,
        data: cryptoData,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.2 },
        lineStyle: { width: 2 },
        symbolSize: 0,
      },
    ],
  };
}

/**
 * Backtest Chart (Dual Line — Portfolio vs Benchmark)
 */
export function createBacktestChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;

  const months = 84;
  const xAxisData = Array.from({ length: months }, (_, i) => `M${i + 1}`);
  const portfolioData = Array.from({ length: months }, (_, i) => 100 * Math.pow(1.0088, i));
  const benchmarkData = Array.from({ length: months }, (_, i) => 100 * Math.pow(1.0075, i));

  return {
    color: ['#10b981', '#9ca3af'],
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
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: privacyMode ? 'transparent' : '#9ca3af', fontSize: 12, interval: 11 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: privacyMode ? 'transparent' : '#9ca3af', fontSize: 12 },
      splitLine: { lineStyle: { color: '#2d3748' } },
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

  const categories = ['Salary', 'Dividends', 'Bond Coupons', 'Rental', 'Other'];
  const amountsData = [120000, 35000, 18000, 24000, 3000];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

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
        color: privacyMode ? 'transparent' : '#9ca3af',
        formatter: (value: number) => `R$ ${(value / 1e3).toFixed(0)}K`,
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: '#2d3748' } },
    },
    yAxis: {
      type: 'category' as const,
      data: categories,
      axisLabel: { color: privacyMode ? 'transparent' : '#9ca3af', fontSize: 12 },
      axisLine: { lineStyle: { color: '#374151' } },
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

  const ages = Array.from({ length: 46 }, (_, i) => 35 + i);
  const retirementAge = 50;

  const equityAlloc = ages.map(age => {
    if (age >= retirementAge) return 30;
    const yearsToRetire = retirementAge - age;
    return Math.max(30, 100 - yearsToRetire * 1.5);
  });

  const fixedIncomeAlloc = equityAlloc.map(eq => 100 - eq);

  return {
    color: ['#3b82f6', '#f59e0b'],
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: theme.tooltip.backgroundColor,
      borderColor: theme.tooltip.borderColor,
      textStyle: theme.tooltip.textStyle,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        let result = `Age ${params[0].axisValueLabel}<br/>`;
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
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: privacyMode ? 'transparent' : '#9ca3af', fontSize: 12, interval: 4 },
    },
    yAxis: {
      type: 'value' as const,
      min: 0,
      max: 100,
      axisLabel: { color: privacyMode ? 'transparent' : '#9ca3af', formatter: '{value}%', fontSize: 12 },
      splitLine: { lineStyle: { color: '#2d3748' } },
    },
    series: [
      {
        name: 'Target Equity %',
        type: 'line' as const,
        data: equityAlloc,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { width: 3 },
        symbolSize: 0,
      },
      {
        name: 'Fixed Income %',
        type: 'line' as const,
        data: fixedIncomeAlloc,
        smooth: true,
        fill: true,
        areaStyle: { opacity: 0.3 },
        lineStyle: { width: 3 },
        symbolSize: 0,
      },
    ],
  };
}

/**
 * Sankey Chart (Capital Flow)
 */
export function createSankeyChartOption(options: BaseChartOptions) {
  const { data } = options;

  const timeline_attr = data.timeline_attribution || {};
  const initialCapital = timeline_attr.patrimonio_inicial || 3000000;
  const contributions = timeline_attr.aportes || 0;
  const equityGains = timeline_attr.retorno_equity_usd || 0;
  const fxGains = timeline_attr.retorno_cambio || 0;
  const rfGains = timeline_attr.retorno_rf || 0;

  return {
    title: { text: 'Patrimônio: Origem dos Ganhos (60 meses)', left: 'center' },
    tooltip: {
      formatter: (params: any) => {
        if (params.componentSubType === 'sankey') {
          return `${params.source} → ${params.target}: <strong>R$ ${(params.value / 1e6).toFixed(1)}M</strong>`;
        }
        return '';
      },
    },
    series: [
      {
        type: 'sankey' as const,
        data: [
          { name: 'Capital Inicial', itemStyle: { color: '#3b82f6' } },
          { name: 'Aportes', itemStyle: { color: '#06b6d4' } },
          { name: 'Ganho Equity USD', itemStyle: { color: '#10b981' } },
          { name: 'Ganho FX', itemStyle: { color: '#f59e0b' } },
          { name: 'Ganho RF', itemStyle: { color: '#8b5cf6' } },
          { name: 'Capital Final', itemStyle: { color: '#ec4899' } },
        ],
        links: [
          { source: 0, target: 5, value: initialCapital },
          { source: 1, target: 5, value: contributions },
          { source: 2, target: 5, value: equityGains },
          { source: 3, target: 5, value: fxGains },
          { source: 4, target: 5, value: rfGains },
        ],
        emphasis: { focus: 'adjacency' as const },
        levels: [
          { depth: 0, itemStyle: { color: '#3b82f6' } },
          { depth: 1, itemStyle: { color: '#ec4899' } },
        ],
        nodeWidth: 20,
        nodePadding: 120,
      },
    ],
    grid: { left: 0, right: 0, top: 60, bottom: 0 },
  };
}

/**
 * Net Worth Projection Chart (Percentile Lines)
 */
export function createNetWorthProjectionChartOption(options: BaseChartOptions) {
  const { privacyMode, theme } = options;

  const years = 30;
  const xAxisData = Array.from({ length: years }, (_, i) => `Y${i + 1}`);
  const p10Data = Array.from({ length: years }, (_, i) => 1250000 * Math.pow(1.05, i) + 60000 * i);
  const p50Data = Array.from({ length: years }, (_, i) => 1250000 * Math.pow(1.07, i) + 60000 * i);
  const p90Data = Array.from({ length: years }, (_, i) => 1250000 * Math.pow(1.09, i) + 60000 * i);

  return {
    color: ['#ef4444', '#10b981', '#3b82f6'],
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
      axisLine: { lineStyle: { color: '#374151' } },
      axisLabel: { color: privacyMode ? 'transparent' : '#9ca3af', fontSize: 12 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: {
        color: privacyMode ? 'transparent' : '#9ca3af',
        formatter: (value: number) => `R$ ${(value / 1e6).toFixed(1)}M`,
        fontSize: 12,
      },
      splitLine: { lineStyle: { color: '#2d3748' } },
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
