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
  const rawDates: string[]              = ft.dates          ?? [];
  const rawRealizadoBrl: (number|null)[] = ft.realizado_brl ?? [];
  const rawTrilhaBrl: (number|null)[]   = ft.trilha_brl    ?? [];
  const rawP10Brl: (number|null)[]      = ft.trilha_p10_brl ?? [];
  const rawP90Brl: (number|null)[]      = ft.trilha_p90_brl ?? [];
  const nHistorico: number              = ft.n_historico     ?? 0;
  const fireDate: string                = ft.meta_fire_date  ?? '2040-01';
  const fireYear: number                = parseInt(fireDate.split('-')[0], 10);

  // --- Downsample pre-FIRE monthly data to annual (January only + last available month per year) ---
  // This ensures proportional x-axis space for pre-FIRE (~19 pts) vs post-FIRE (~36 pts)
  const annualIndices: number[] = [];
  let lastYear = '';
  for (let i = 0; i < rawDates.length; i++) {
    const d = rawDates[i];
    const [yr, mo] = d.split('-');
    // Always include first and last points of the series
    if (i === 0 || i === rawDates.length - 1) {
      annualIndices.push(i);
      lastYear = yr;
      continue;
    }
    // Include January of each year (annual snapshot)
    if (mo === '01' && yr !== lastYear) {
      annualIndices.push(i);
      lastYear = yr;
    }
  }
  // Deduplicate (first/last might coincide with a January)
  const uniqueIndices = [...new Set(annualIndices)].sort((a, b) => a - b);

  const dates        = uniqueIndices.map(i => rawDates[i]);
  const realizadoBrl = uniqueIndices.map(i => rawRealizadoBrl[i] ?? null);
  const trilhaBrl    = uniqueIndices.map(i => rawTrilhaBrl[i] ?? null);
  const p10Brl       = uniqueIndices.map(i => rawP10Brl[i] ?? null);
  const p90Brl       = uniqueIndices.map(i => rawP90Brl[i] ?? null);
  // nHistorico for annual: count how many downsampled points are historical
  const nHistAnnual  = uniqueIndices.filter(i => i < nHistorico).length;

  // --- Post-FIRE extension with withdrawal model (spending smile) ---
  const postFireYears = 37;  // Age 53 to 90
  const p10End = rawP10Brl.at(-1) ?? 0;
  const p50End = (rawTrilhaBrl[rawDates.length - 1] ?? 0) as number;
  const p90End = rawP90Brl.at(-1) ?? 0;

  // Spending smile: Read from data, fallback to conservative defaults
  const smileData = (data as any)?.spendingSmile ?? {
    go_go: { gasto: 242_000 },
    slow_go: { gasto: 200_000 },
    no_go: { gasto: 187_000 },
  };

  // Healthcare costs: VCMH grows 5.0%/year real, ANS age-bracket multipliers (FR-healthcare-recalibracao 2026-04-23)
  const saudeBase = (data as any)?.saude_base ?? 24_000;
  const SAUDE_INFLATOR = 0.050;
  const SAUDE_DECAY_THRESHOLD = 30;
  const SAUDE_DECAY = 0.50;

  const ansMultiplier = (yearPostFire: number): number => {
    const currentAge = 53 + yearPostFire;
    if (currentAge < 54) return 3.0;
    if (currentAge < 60) return 3.0 + (currentAge - 54) * (0.5 / 6);
    return 4.0;
  };

  const getSpendingByYear = (yearPostFire: number): number => {
    let gastoBase = smileData.no_go?.gasto ?? 187_000;
    if (yearPostFire < 15) gastoBase = smileData.go_go?.gasto ?? 242_000;
    else if (yearPostFire < 30) gastoBase = smileData.slow_go?.gasto ?? 200_000;

    let saudeVcmh = saudeBase * Math.pow(1 + SAUDE_INFLATOR, yearPostFire);
    let saude = saudeVcmh * ansMultiplier(yearPostFire);
    if (yearPostFire >= SAUDE_DECAY_THRESHOLD) saude *= SAUDE_DECAY;

    return gastoBase + saude;
  };

  // Calculate post-FIRE trajectories with withdrawal (real returns, real spending)
  const calculatePostFireTrajectory = (startValue: number, returnRate: number): number[] => {
    const trajectory = [startValue];
    let value = startValue;
    for (let i = 1; i < postFireYears; i++) {
      const spending = getSpendingByYear(i);
      value = value * (1 + returnRate) - spending;
      trajectory.push(Math.max(value, 0));
    }
    return trajectory;
  };

  // Post-FIRE trajectories: slice off index 0 (duplicate of last pre-FIRE value)
  const postFireYearsLabel = postFireYears - 1;  // 36 years of post-FIRE data
  const postFireDates = Array.from({ length: postFireYearsLabel }, (_, i) => `${fireYear + 1 + i}`);
  // Post-FIRE return rates: blended portfolio (glide path ~50% equity + 40% bonds + 10% crypto)
  // Not pure equity — using realistic blended returns post-retirement
  const p10PostFull = calculatePostFireTrajectory(p10End as number, 0.025);  // P10: 2.5% real (stress blended)
  const p50PostFull = calculatePostFireTrajectory(p50End, 0.035);            // P50: 3.5% real (blended base)
  const p90PostFull = calculatePostFireTrajectory(p90End as number, 0.045);  // P90: 4.5% real (blended favorable)

  const p10Post = p10PostFull.slice(1);
  const p50Post = p50PostFull.slice(1);
  const p90Post = p90PostFull.slice(1);

  // --- Assemble final arrays: annual pre-FIRE + annual post-FIRE ---
  const p10Aligned: (number|null)[]    = [...p10Brl, ...p10Post];
  const p90Aligned: (number|null)[]    = [...p90Brl, ...p90Post];
  const p50Full: (number|null)[]       = [...trilhaBrl, ...p50Post];
  const realizadoFull: (number|null)[] = [...realizadoBrl, ...Array(postFireYearsLabel).fill(null)];

  const allDates = [...dates, ...postFireDates];

  // X-axis labels: show year labels at strategic intervals
  const xAxisLabels = allDates.map(d => {
    if (d.length === 4) {
      // Post-FIRE annual dates: show every 5 years
      const yr = parseInt(d, 10);
      return yr % 5 === 0 ? d : '';
    }
    const [yr, mo] = d.split('-');
    const year = parseInt(yr, 10);
    // Pre-FIRE: show January of years divisible by 3, or fire year
    if (mo === '01') {
      return year % 3 === 0 || year === fireYear ? yr : '';
    }
    // First point (e.g., 2021-04) — show the year
    if (d === dates[0]) return yr;
    return '';
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
        interval: 0,  // Show ALL labels — most are '' so only our chosen years render
        hideOverlap: true,  // Let ECharts hide if they still overlap after interval:0
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
